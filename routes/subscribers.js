const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// POST /api/subscribe - Subscribe to newsletter
router.post('/subscribe', async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ success: false, error: 'Email is required' });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, error: 'Invalid email format' });
    }
    
    try {
        const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];
        
        const query = `
            INSERT INTO subscribers (email, ip_address, user_agent, status)
            VALUES ($1, $2, $3, 'active')
            ON CONFLICT (email) 
            DO UPDATE SET status = 'active', updated_at = CURRENT_TIMESTAMP
            RETURNING email, subscribed_at
        `;
        
        const result = await pool.query(query, [email.toLowerCase(), ipAddress, userAgent]);
        
        res.json({
            success: true,
            message: 'Successfully subscribed to our newsletter!',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Subscribe error:', error);
        res.status(500).json({ success: false, error: 'Database error. Please try again.' });
    }
});

// GET /api/subscribers - Get all subscribers (Admin only - add auth in production)
router.get('/subscribers', async (req, res) => {
    try {
        const query = `SELECT id, email, subscribed_at, status FROM subscribers ORDER BY subscribed_at DESC`;
        const result = await pool.query(query);
        
        res.json({
            success: true,
            count: result.rows.length,
            subscribers: result.rows
        });
    } catch (error) {
        console.error('Get subscribers error:', error);
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

module.exports = router;