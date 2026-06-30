CREATE INDEX IF NOT EXISTS idx_bookings_type_created
ON bookings (booking_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bookings_email
ON bookings (LOWER(customer_info->>'email'));

CREATE INDEX IF NOT EXISTS idx_bookings_status
ON bookings (status);

CREATE INDEX IF NOT EXISTS idx_packages_visibility_order
ON packages (visibility, display_order);

CREATE INDEX IF NOT EXISTS idx_destinations_visibility_order
ON destinations (visibility, display_order);

CREATE INDEX IF NOT EXISTS idx_hotels_visibility_order
ON hotels (visibility, display_order);

CREATE INDEX IF NOT EXISTS idx_messages_email_created
ON messages (LOWER(email), created_at DESC);