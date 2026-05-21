ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS booking_type VARCHAR(50) DEFAULT 'package';

UPDATE bookings
SET booking_type = 'package'
WHERE booking_type IS NULL;
