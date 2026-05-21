const pool = require("../config/database");
const destinations = {};
const packages = [];

const initializeDatabase = async () => {
  try {
    /* USERS */
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
        token_hash TEXT,
        token_expires TIMESTAMP WITH TIME ZONE,
        reset_token TEXT,
        reset_token_expires TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

    /* DESTINATIONS */
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

    /* PACKAGES */
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

    /* HOTELS */
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hotels (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        city VARCHAR(100),
        meal VARCHAR(100),
        image TEXT,
        gallery JSONB DEFAULT '[]'::jsonb,
        description TEXT,
        group_title VARCHAR(255),
        group_subtitle TEXT,
        periods JSONB DEFAULT '[]'::jsonb,
        display_order INTEGER DEFAULT 0,
        single_room DECIMAL(10,2),
        double_room DECIMAL(10,2),
        price DECIMAL(10,2),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* BOOKINGS */
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        booking_reference VARCHAR(100) UNIQUE,
        booking_type VARCHAR(50) DEFAULT 'package',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'Pending',
        search_params JSONB,
        selected_hotel JSONB,
        selected_activities JSONB,
        total_price DECIMAL(10,2),
        customer_info JSONB
      );
    `);

    /* HOTEL BOOKINGS */
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hotel_bookings (
        id SERIAL PRIMARY KEY,
        hotel JSONB,
        customer_info JSONB,
        total_price DECIMAL(10,2),
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* MESSAGES */
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150),
        email VARCHAR(255),
        phone VARCHAR(50),
        sender VARCHAR(20) DEFAULT 'client',
        is_read BOOLEAN DEFAULT false,
        message TEXT NOT NULL,
        reply TEXT DEFAULT '',
        replied_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* PAYMENTS */
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

    /* SUBSCRIBERS */
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subscribers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* SETTINGS */
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) UNIQUE NOT NULL,
        value JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* ALTER TABLES */
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'Egypt';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS token_hash TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS token_expires TIMESTAMP WITH TIME ZONE;

      ALTER TABLE packages ADD COLUMN IF NOT EXISTS programme TEXT;
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS price VARCHAR(100);
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS pdf_status VARCHAR(50) DEFAULT 'Missing';
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS visibility VARCHAR(50) DEFAULT 'Private';

      ALTER TABLE hotels ADD COLUMN IF NOT EXISTS meal VARCHAR(100);
      ALTER TABLE hotels ADD COLUMN IF NOT EXISTS image TEXT;
      ALTER TABLE hotels ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE hotels ADD COLUMN IF NOT EXISTS description TEXT;
      ALTER TABLE hotels ADD COLUMN IF NOT EXISTS group_title VARCHAR(255);
      ALTER TABLE hotels ADD COLUMN IF NOT EXISTS group_subtitle TEXT;
      ALTER TABLE hotels ADD COLUMN IF NOT EXISTS periods JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE hotels ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
      ALTER TABLE hotels ADD COLUMN IF NOT EXISTS single_room DECIMAL(10,2);
      ALTER TABLE hotels ADD COLUMN IF NOT EXISTS double_room DECIMAL(10,2);
      ALTER TABLE hotels ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);

      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_type VARCHAR(50) DEFAULT 'package';

      ALTER TABLE messages ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
      ALTER TABLE messages ADD COLUMN IF NOT EXISTS sender VARCHAR(20) DEFAULT 'client';
      ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
      ALTER TABLE messages ADD COLUMN IF NOT EXISTS reply TEXT DEFAULT '';
      ALTER TABLE messages ADD COLUMN IF NOT EXISTS replied_at TIMESTAMP WITH TIME ZONE;
    `);

    /* INSERT DESTINATIONS */
    for (const dest of Object.values(destinations)) {
      await pool.query(
        `
        INSERT INTO destinations
        (id, name, description, region, image, data)
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

    /* INSERT PACKAGES */
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
    console.error(
      "❌ Database initialization error:",
      error.message
    );

    throw error;
  }
};

module.exports = initializeDatabase;
