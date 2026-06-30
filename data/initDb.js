const pool = require("../config/database");
const destinations = {};
const packages = [];

const initializeDatabase = async () => {
  try {
    /* ================= USERS ================= */
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        phone VARCHAR(50),
        city VARCHAR(100),
        country VARCHAR(100) DEFAULT '',
        avatar TEXT,
        role VARCHAR(20) DEFAULT 'user',
        admin_type VARCHAR(30),
        permissions JSONB DEFAULT '[]'::jsonb,
        email_verified BOOLEAN DEFAULT true,
        email_verification_code TEXT,
        email_verification_expires TIMESTAMP WITH TIME ZONE,
        token_hash TEXT,
        token_expires TIMESTAMP WITH TIME ZONE,
        reset_token TEXT,
        reset_token_expires TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

    /* ================= DESTINATIONS ================= */
    await pool.query(`
      CREATE TABLE IF NOT EXISTS destinations (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        title VARCHAR(255),
        description TEXT,
        region VARCHAR(100),
        country VARCHAR(100) DEFAULT 'Egypt',
        badge VARCHAR(255) DEFAULT 'Destination Program',
        duration VARCHAR(100) DEFAULT '',
        location VARCHAR(255) DEFAULT '',
        image VARCHAR(255),
        images JSONB DEFAULT '[]'::jsonb,
        highlights JSONB DEFAULT '[]'::jsonb,
        included JSONB DEFAULT '[]'::jsonb,
        days JSONB DEFAULT '[]'::jsonb,
        visibility VARCHAR(50) DEFAULT 'Published',
        display_order INTEGER DEFAULT 0,
        data JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* ================= PACKAGES ================= */
    await pool.query(`
      CREATE TABLE IF NOT EXISTS packages (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        backend_name VARCHAR(255),
        route VARCHAR(255),
        duration VARCHAR(100),
        transfer TEXT,
        transfer_reduction TEXT,
        start_price VARCHAR(100),
        programme TEXT,
        price VARCHAR(100),
        pdf_status VARCHAR(50) DEFAULT 'Missing',
        visibility VARCHAR(50) DEFAULT 'Private',
        image TEXT,
        options JSONB DEFAULT '[]'::jsonb,
        itinerary JSONB DEFAULT '[]'::jsonb,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* ================= HOTELS ================= */
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

    /* ================= BOOKINGS ================= */
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

    /* ================= MESSAGES ================= */
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

    /* ================= PAYMENTS ================= */
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

    /* ================= SUBSCRIBERS ================= */
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subscribers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* ================= REVIEWS ================= */
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
        text TEXT NOT NULL,
        country VARCHAR(100) DEFAULT '',
        country_code VARCHAR(2) DEFAULT '',
        verified BOOLEAN DEFAULT false,
        status VARCHAR(20) DEFAULT 'private',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* ================= SETTINGS ================= */
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) UNIQUE NOT NULL,
        value JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* ================= ALTER TABLES ================= */
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT '';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_type VARCHAR(30);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT true;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_code TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_expires TIMESTAMP WITH TIME ZONE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS token_hash TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS token_expires TIMESTAMP WITH TIME ZONE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP WITH TIME ZONE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

      UPDATE users
      SET email_verified = true
      WHERE email_verified = false
      AND email_verification_code IS NULL;

      ALTER TABLE destinations ADD COLUMN IF NOT EXISTS title VARCHAR(255);
      ALTER TABLE destinations ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'Egypt';
      ALTER TABLE destinations ADD COLUMN IF NOT EXISTS badge VARCHAR(255) DEFAULT 'Destination Program';
      ALTER TABLE destinations ADD COLUMN IF NOT EXISTS duration VARCHAR(100) DEFAULT '';
      ALTER TABLE destinations ADD COLUMN IF NOT EXISTS location VARCHAR(255) DEFAULT '';
      ALTER TABLE destinations ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE destinations ADD COLUMN IF NOT EXISTS highlights JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE destinations ADD COLUMN IF NOT EXISTS included JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE destinations ADD COLUMN IF NOT EXISTS days JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE destinations ADD COLUMN IF NOT EXISTS visibility VARCHAR(50) DEFAULT 'Published';
      ALTER TABLE destinations ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
      ALTER TABLE destinations ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE destinations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

      UPDATE destinations
      SET
        title = COALESCE(NULLIF(title, ''), NULLIF(name, ''), 'Destination'),
        country = COALESCE(NULLIF(country, ''), data->>'country', data->>'stamp', 'Egypt'),
        badge = COALESCE(NULLIF(badge, ''), data->>'badge', data->>'tag', 'Destination Program'),
        duration = COALESCE(NULLIF(duration, ''), data->>'duration', ''),
        location = COALESCE(NULLIF(location, ''), data->>'location', ''),
        images = CASE
          WHEN jsonb_array_length(COALESCE(images, '[]'::jsonb)) > 0 THEN images
          WHEN COALESCE(image, '') <> '' THEN jsonb_build_array(image)
          ELSE '[]'::jsonb
        END,
        highlights = COALESCE(highlights, '[]'::jsonb),
        included = COALESCE(included, '[]'::jsonb),
        days = COALESCE(days, '[]'::jsonb),
        visibility = COALESCE(NULLIF(visibility, ''), 'Published'),
        display_order = COALESCE(display_order, 0),
        data = COALESCE(data, '{}'::jsonb),
        created_at = COALESCE(created_at, CURRENT_TIMESTAMP),
        updated_at = COALESCE(updated_at, CURRENT_TIMESTAMP);

      ALTER TABLE packages ADD COLUMN IF NOT EXISTS title VARCHAR(255);
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS programme TEXT;
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS name VARCHAR(255);
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS backend_name VARCHAR(255);
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS route VARCHAR(255);
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS duration VARCHAR(100);
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS transfer TEXT;
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS transfer_reduction TEXT;
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS start_price VARCHAR(100);
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS price VARCHAR(100);
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT '';
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS destination VARCHAR(255) DEFAULT '';
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS region VARCHAR(100) DEFAULT '';
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS force_category VARCHAR(100) DEFAULT '';
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS hide_price BOOLEAN DEFAULT false;
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS card_title VARCHAR(255) DEFAULT '';
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS card_subtitle VARCHAR(255) DEFAULT '';
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS badge_text VARCHAR(255) DEFAULT '';
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS hotel_name VARCHAR(255) DEFAULT '';
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS hotel_meal VARCHAR(255) DEFAULT '';
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS hotel_nights VARCHAR(100) DEFAULT '';
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS sgl_price VARCHAR(100) DEFAULT '';
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS dbl_price VARCHAR(100) DEFAULT '';
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS tpl_price VARCHAR(100) DEFAULT '';
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS package_group_id VARCHAR(255) DEFAULT '';
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS package_group_title VARCHAR(255) DEFAULT '';
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS package_group_subtitle VARCHAR(255) DEFAULT '';
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS package_group_short_title VARCHAR(255) DEFAULT '';
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS pdf_status VARCHAR(50) DEFAULT 'Missing';
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS visibility VARCHAR(50) DEFAULT 'Private';
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS itinerary JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS included JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS excluded JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS flight_details JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

      ALTER TABLE packages ALTER COLUMN start_price TYPE VARCHAR(100) USING start_price::text;
      ALTER TABLE packages ALTER COLUMN price TYPE VARCHAR(100) USING price::text;
      ALTER TABLE packages ALTER COLUMN transfer_reduction TYPE VARCHAR(255) USING transfer_reduction::text;

      UPDATE packages
      SET
        title = COALESCE(NULLIF(title, ''), NULLIF(name, ''), 'Package'),
        name = COALESCE(NULLIF(name, ''), NULLIF(title, ''), 'Package'),
        backend_name = COALESCE(NULLIF(backend_name, ''), NULLIF(title, ''), NULLIF(name, ''), 'Package'),
        visibility = COALESCE(NULLIF(visibility, ''), 'Private'),
        options = COALESCE(options, '[]'::jsonb),
        itinerary = COALESCE(itinerary, '[]'::jsonb),
        included = COALESCE(included, '[]'::jsonb),
        display_order = COALESCE(display_order, 0),
        created_at = COALESCE(created_at, CURRENT_TIMESTAMP);

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
      ALTER TABLE hotels ADD COLUMN IF NOT EXISTS visibility VARCHAR(50) DEFAULT 'Published';
      ALTER TABLE hotels ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

      UPDATE hotels
      SET
        visibility = COALESCE(NULLIF(visibility, ''), 'Published'),
        gallery = COALESCE(gallery, '[]'::jsonb),
        periods = COALESCE(periods, '[]'::jsonb),
        display_order = COALESCE(display_order, 0),
        created_at = COALESCE(created_at, CURRENT_TIMESTAMP);

      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_type VARCHAR(50) DEFAULT 'package';

      ALTER TABLE messages ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
      ALTER TABLE messages ADD COLUMN IF NOT EXISTS sender VARCHAR(20) DEFAULT 'client';
      ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
      ALTER TABLE messages ADD COLUMN IF NOT EXISTS reply TEXT DEFAULT '';
      ALTER TABLE messages ADD COLUMN IF NOT EXISTS replied_at TIMESTAMP WITH TIME ZONE;

      ALTER TABLE reviews ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT '';
      ALTER TABLE reviews ADD COLUMN IF NOT EXISTS country_code VARCHAR(2) DEFAULT '';
      ALTER TABLE reviews ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;
      ALTER TABLE reviews ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'private';
    `);

    /* ================= INSERT DEFAULT REVIEWS ================= */
    await pool.query(`
      INSERT INTO reviews
        (name, rating, text, country, country_code, verified, status)
      SELECT seed.name, seed.rating, seed.text, seed.country,
             seed.country_code, true, 'public'
      FROM (
        VALUES
          ('Sarah M.', 5, 'Everything was perfectly organized. The team made our trip easy, safe, and full of beautiful moments. Highly recommended!', 'Tunisia', 'tn'),
          ('Emre Y.', 5, 'Great experience! The communication was clear, and every destination was exactly as described. Excellent service.', 'Turkey', 'tr'),
          ('Laura P.', 5, 'I discovered Egypt in a completely new way. The planning, timing, and professionalism were outstanding.', 'Morocco', 'ma')
      ) AS seed(name, rating, text, country, country_code)
      WHERE NOT EXISTS (
        SELECT 1
        FROM reviews existing
        WHERE LOWER(existing.name) = LOWER(seed.name)
          AND existing.text = seed.text
      );
    `);
    /* ================= INSERT DESTINATIONS ================= */
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

    /* ================= INSERT PACKAGES ================= */
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

    console.log("\u2705 Database initialized successfully");
  } catch (error) {
    console.error(
      "âŒ Database initialization error:",
      error.message
    );

    throw error;
  }
};

module.exports = initializeDatabase;




