const pool = require('../config/database');
const destinations = require('./destinations');
const packages = require('./packages');

const initializeDatabase = async () => {
    try {
        // Create users table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                reset_token TEXT,
                reset_token_expires TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        `);
        
        console.log('✅ Users table initialized');

        // Create subscribers table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS subscribers (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                ip_address INET,
                user_agent TEXT,
                status VARCHAR(50) DEFAULT 'active',
                subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
        `);
        
        console.log('✅ Subscribers table initialized');

        // Create destinations table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS destinations (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                region VARCHAR(100),
                image VARCHAR(255),
                data JSONB
            );
        `);
        
        console.log('✅ Destinations table initialized');

        // Create packages table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS packages (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                image VARCHAR(255)
            );
        `);
        
        console.log('✅ Packages table initialized');

        // Create bookings table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS bookings (
                id SERIAL PRIMARY KEY,
                booking_reference VARCHAR(100) UNIQUE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(50) DEFAULT 'pending',
                search_params JSONB,
                selected_hotel JSONB,
                selected_activities JSONB,
                total_price DECIMAL(10,2),
                customer_info JSONB
            );
            
            CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(booking_reference);
        `);
        
        console.log('✅ Bookings table initialized');

        // Insert destinations data
        for (const [key, dest] of Object.entries(destinations)) {
            await pool.query(`
                INSERT INTO destinations (id, name, description, region, image, data)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (id) DO NOTHING
            `, [dest.id, dest.name, dest.description, dest.region, dest.image, JSON.stringify(dest)]);
        }
        
        console.log('✅ Destinations data inserted');

        // Insert packages data
        for (const pkg of packages) {
            await pool.query(`
                INSERT INTO packages (id, title, image)
                VALUES ($1, $2, $3)
                ON CONFLICT (id) DO NOTHING
            `, [pkg.id, pkg.title, pkg.image]);
        }
        
        console.log('✅ Packages data inserted');

        console.log('🎉 Database initialization completed successfully!');
    } catch (error) {
        console.error('❌ Database initialization error:', error.message);
        throw error;
    }
};

module.exports = initializeDatabase;
