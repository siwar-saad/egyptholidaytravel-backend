const pool = require("../config/database");
const destinations = require("./destinations");
const packages = require("./packages");

const initializeDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        phone VARCHAR(50),
        city VARCHAR(100),
        country VARCHAR(100) DEFAULT 'Egypt',
        avatar TEXT,
        role VARCHAR(20) DEFAULT 'user',
        reset_token TEXT,
        reset_token_expires TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

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

    await pool.query(`
      CREATE TABLE IF NOT EXISTS packages (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        programme TEXT,
        price VARCHAR(100),
        pdf_status VARCHAR(50) DEFAULT 'Missing',
        visibility VARCHAR(50) DEFAULT 'Private',
        image TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        booking_reference VARCHAR(100) UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'Pending',
        search_params JSONB,
        selected_hotel JSONB,
        selected_activities JSONB,
        total_price DECIMAL(10,2),
        customer_info JSONB
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150),
        email VARCHAR(255),
        message TEXT NOT NULL,
        reply TEXT DEFAULT '',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        invoice VARCHAR(255),
        client VARCHAR(255),
        amount VARCHAR(100),
        status VARCHAR(50) DEFAULT 'Not Paid',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'Egypt';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

      ALTER TABLE packages ADD COLUMN IF NOT EXISTS programme TEXT;
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS price VARCHAR(100);
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS pdf_status VARCHAR(50) DEFAULT 'Missing';
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS visibility VARCHAR(50) DEFAULT 'Private';
    `);

    for (const dest of Object.values(destinations)) {
      await pool.query(
        `
        INSERT INTO destinations (id, name, description, region, image, data)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO NOTHING
        `,
        [
          dest.id,
          dest.name,
          dest.description,
          dest.region,
          dest.image,
          JSON.stringify(dest),
        ]
      );
    }

    for (const pkg of packages) {
      await pool.query(
        `
        INSERT INTO packages (title, image)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
        `,
        [pkg.title, pkg.image]
      );
    }

    console.log("✅ Database initialized successfully");
  } catch (error) {
    console.error("❌ Database initialization error:", error.message);
    throw error;
  }
};

module.exports = initializeDatabase;