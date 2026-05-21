ALTER TABLE messages
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT true;

UPDATE messages
SET is_read = true
WHERE is_read IS NULL OR is_read = false;
