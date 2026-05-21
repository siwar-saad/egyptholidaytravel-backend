ALTER TABLE packages ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE packages ADD COLUMN IF NOT EXISTS backend_name VARCHAR(255);
ALTER TABLE packages ADD COLUMN IF NOT EXISTS route VARCHAR(255);
ALTER TABLE packages ADD COLUMN IF NOT EXISTS duration VARCHAR(100);
ALTER TABLE packages ADD COLUMN IF NOT EXISTS transfer TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS transfer_reduction TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS start_price VARCHAR(100);
ALTER TABLE packages ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]'::jsonb;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS itinerary JSONB DEFAULT '[]'::jsonb;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

UPDATE packages
SET name = COALESCE(name, title),
    backend_name = COALESCE(backend_name, title),
    start_price = COALESCE(start_price, price)
WHERE name IS NULL
   OR backend_name IS NULL
   OR start_price IS NULL;
