ALTER TABLE messages
ADD COLUMN IF NOT EXISTS sender VARCHAR(20) DEFAULT 'client';

UPDATE messages
SET sender = 'client'
WHERE sender IS NULL;
