-- Add role column to users table if it doesn't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

-- Set default role for existing users
UPDATE users SET role = 'user' WHERE role IS NULL;
