BEGIN;

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

DELETE FROM destinations;

WITH programs (
  id, title, description, region, badge, duration, location, image, route, display_order
) AS (
  VALUES
    ('exclusive-cairo', 'Exclusive Travel Offer — Cairo',
     'Exclusive Cairo travel offer with hotel accommodation, private airport transfers, sightseeing tours, and day by day program.',
     'Cairo', 'File 01', '04 Nights / 05 Days', 'Cairo, Egypt',
     '/images/destinations/exclusive-cairo.webp', 'Cairo', 1),
    ('cairo-hurghada-5', 'Cairo – Hurghada',
     'Package with Cairo stay, Hurghada resort stay, meal plan details, and round-trip bus transfer.',
     'Red Sea', 'File 02', '5 Nights', 'Cairo & Hurghada, Egypt',
     '/images/destinations/cairo-hurghada-5.png', 'Cairo – Hurghada', 2),
    ('cairo-hurghada-6', 'Cairo – Hurghada',
     'Package with Cairo accommodation, Hurghada accommodation, meal plan details, and round-trip bus transfer.',
     'Red Sea', 'File 03', '6 Nights', 'Cairo & Hurghada, Egypt',
     '/images/destinations/cairo-hurghada-6.png', 'Cairo – Hurghada', 3),
    ('cairo-alexandria-6', 'Cairo – Alexandria',
     'Package with Cairo stay, Alexandria stay, hotel options, breakfast meal plan, and round-trip bus transfer.',
     'North Coast', 'File 04', '6 Nights', 'Cairo & Alexandria, Egypt',
     '/images/destinations/cairo-alexandria-6.png', 'Cairo – Alexandria', 4),
    ('cairo-luxor-6', 'Cairo – Luxor',
     'Package with Cairo stay, Luxor stay, hotel options, breakfast meal plan, and sleeping cabin train transfer.',
     'Upper Egypt', 'File 05', '6 Nights', 'Cairo & Luxor, Egypt',
     '/images/destinations/cairo-luxor-6.png', 'Cairo – Luxor', 5)
)
INSERT INTO destinations (
  id, name, title, description, region, country, badge, duration, location,
  image, images, highlights, included, days, visibility, display_order, data
)
SELECT
  id, title, title, description, region, 'Egypt', badge, duration, location,
  image, jsonb_build_array(image), '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  'Published', display_order,
  jsonb_build_object(
    'id', id, 'tag', badge, 'stamp', 'Egypt', 'route', route,
    'short', description, 'image', image,
    'images', jsonb_build_array(image), 'isPublished', true
  )
FROM programs;

COMMIT;
