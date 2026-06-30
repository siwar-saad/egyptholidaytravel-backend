BEGIN;

UPDATE bookings AS booking
SET booking_type = 'destination',
    booking_reference = CASE
      WHEN booking_reference LIKE 'PKG-%'
        THEN 'DST-' || SUBSTRING(booking_reference FROM 5)
      ELSE booking_reference
    END,
    customer_info = COALESCE(customer_info, '{}'::jsonb) ||
      jsonb_build_object('reservationKind', 'destination')
WHERE booking_type = 'package'
  AND COALESCE(customer_info->>'createdBy', '') = 'admin'
  AND COALESCE(total_price, 0) = 0
  AND EXISTS (
    SELECT 1
    FROM destinations
    WHERE LOWER(COALESCE(destinations.title, destinations.name)) =
          LOWER(booking.search_params->>'name')
      AND COALESCE(destinations.duration, '') =
          COALESCE(booking.search_params->>'duration', '')
  );

COMMIT;
