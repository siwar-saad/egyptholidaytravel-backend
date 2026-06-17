ALTER TABLE packages ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT '';
ALTER TABLE packages ADD COLUMN IF NOT EXISTS destination VARCHAR(255) DEFAULT '';
ALTER TABLE packages ADD COLUMN IF NOT EXISTS region VARCHAR(100) DEFAULT '';
ALTER TABLE packages ADD COLUMN IF NOT EXISTS force_category VARCHAR(100) DEFAULT '';
ALTER TABLE packages ADD COLUMN IF NOT EXISTS included JSONB DEFAULT '[]'::jsonb;

INSERT INTO packages
(
  title,
  name,
  backend_name,
  route,
  duration,
  transfer,
  transfer_reduction,
  start_price,
  programme,
  price,
  country,
  destination,
  region,
  force_category,
  visibility,
  image,
  options,
  itinerary,
  included,
  display_order
)
SELECT
  'Turkey Package: 5 Nights / 6 Days Sharm + Cairo',
  'Turkey Package: 5 Nights / 6 Days Sharm + Cairo',
  '5 GECE 6 GÜN SHARM + KAHİRE TURU - 4 GECE SHARM + 1 GECE KAHİRE',
  'Turkey (SAW) → Sharm El Sheikh → Cairo',
  '5 Nights / 6 Days',
  'Flight + Airport Transfers + Bus to Cairo',
  'Flight: 11:00 SAW → SSH Air Cairo with 20 KG baggage. Return flight will be confirmed.',
  'From 799 USD',
  'Extra Tours: ATV Safari + Bedouin Night (25$) | Ras Mohammed Boat Trip + Diving (40$) | Water Sports Package (70$) | Dahab Tour (25$) | Nile Dinner Cruise (25$)',
  'From 799 USD',
  'Turkey',
  'Sharm El Sheikh + Cairo',
  'others',
  'others',
  'Published',
  '/images/packages/turkey-package-1.webp',
  '[{"title":"Hotel Options / Price Per Person","rows":[{"city":"Sharm + Cairo","nights":"4 + 1","hotel":"Park Regency Resort 5* + Hilton Cairo 5*","meal":"AI + BB","sgl":"+220 USD","dbl":"949 USD","tpl":"949 USD"},{"city":"Sharm + Cairo","nights":"4 + 1","hotel":"Marriott Renaissance Golden 5* + Hilton Cairo 5*","meal":"AI + BB","sgl":"+200 USD","dbl":"929 USD","tpl":"929 USD"},{"city":"Sharm + Cairo","nights":"4 + 1","hotel":"Safir Waterfalls Resort 5* + Hilton Cairo 5*","meal":"AI + BB","sgl":"+150 USD","dbl":"869 USD","tpl":"869 USD"},{"city":"Sharm + Cairo","nights":"4 + 1","hotel":"Safir Waterfalls Resort 5* + Amarante Pyramids 5*","meal":"AI + BB","sgl":"+140 USD","dbl":"829 USD","tpl":"829 USD"},{"city":"Sharm + Cairo","nights":"4 + 1","hotel":"Queen Sharm Resort 4* + Flamenco Cairo Hotel 4*","meal":"AI + BB","sgl":"+130 USD","dbl":"799 USD","tpl":"799 USD"}]}]'::jsonb,
  '[{"day":"Day 1","title":"Arrival to Sharm El Sheikh","details":["Meeting at Istanbul Sabiha Gökçen Airport and flight to Sharm El Sheikh.","Airport welcome, hotel transfer and check-in.","Included city tour: Old Market, El Sahaba Mosque and Farsha Cafe."]},{"day":"Day 2","title":"Free Day in Sharm","details":["Breakfast and free time to enjoy the beach, pool and all-inclusive hotel services.","Optional activities: ATV Safari, Bedouin Night, Ras Mohammed boat trip, diving, water sports or Dahab tour."]},{"day":"Day 3","title":"Relaxation in Sharm","details":["Free day by the Red Sea with hotel activities and optional tours.","Evening visit can be arranged to Naama Bay or Soho Square."]},{"day":"Day 4","title":"Sharm Free Time / Bus to Cairo","details":["Free day at the hotel.","Late-night departure to Cairo by bus at 00:15."]},{"day":"Day 5","title":"Cairo Tour","details":["Arrival to Cairo in the morning.","Included tour: Giza Pyramids, Great Sphinx and Grand Egyptian Museum.","Hotel transfer and optional Nile dinner cruise in the evening."]},{"day":"Day 6","title":"Departure","details":["Breakfast and check-out.","Transfer to the airport for the Istanbul flight."]}]'::jsonb,
  '["Flight tickets and airport taxes","4 nights all-inclusive accommodation in Sharm, 1 night bed & breakfast accommodation in Cairo","Airport / hotel / airport transfers","Panoramic city tours","Turkish assistance service","Pyramids tour and Grand Egyptian Museum"]'::jsonb,
  1000
WHERE NOT EXISTS (
  SELECT 1
  FROM packages
  WHERE backend_name = '5 GECE 6 GÜN SHARM + KAHİRE TURU - 4 GECE SHARM + 1 GECE KAHİRE'
);

INSERT INTO packages
(
  title,
  name,
  backend_name,
  route,
  duration,
  transfer,
  transfer_reduction,
  start_price,
  programme,
  price,
  country,
  destination,
  region,
  force_category,
  visibility,
  image,
  options,
  itinerary,
  included,
  display_order
)
SELECT
  'Turkey Package: 7 Nights / 8 Days Sharm + Cairo',
  'Turkey Package: 7 Nights / 8 Days Sharm + Cairo',
  '7 GECE 8 GÜN SHARM + KAHİRE TURU - 6 GECE SHARM + 1 GECE KAHİRE',
  'Turkey (SAW) → Sharm El Sheikh → Cairo',
  '7 Nights / 8 Days',
  'Flight + Airport Transfers + Bus to Cairo',
  'Flight: 11:00 SAW → SSH Air Cairo / Return 08:00 Cairo → SAW Air Cairo with 30 KG + 8 KG baggage.',
  'From 899 USD',
  'Extra Tours: ATV Safari + Bedouin Night (25$) | Ras Mohammed Boat Trip + Diving (40$) | Water Sports Package (70$) | Dahab Tour (25$) | Nile Dinner Cruise (25$)',
  'From 899 USD',
  'Turkey',
  'Sharm El Sheikh + Cairo',
  'others',
  'others',
  'Published',
  '/images/packages/turkey-package-2.webp',
  '[{"title":"Hotel Options / Price Per Person","rows":[{"city":"Sharm + Cairo","nights":"6 + 1","hotel":"Park Regency Resort 5* + Hilton Cairo 5*","meal":"AI + BB","sgl":"+300 USD","dbl":"1049 USD","tpl":"1049 USD"},{"city":"Sharm + Cairo","nights":"6 + 1","hotel":"Marriott Renaissance Golden 5* + Hilton Cairo 5*","meal":"AI + BB","sgl":"+250 USD","dbl":"1029 USD","tpl":"1029 USD"},{"city":"Sharm + Cairo","nights":"6 + 1","hotel":"Safir Waterfalls Resort 5* + Hilton Cairo 5*","meal":"AI + BB","sgl":"+250 USD","dbl":"969 USD","tpl":"969 USD"},{"city":"Sharm + Cairo","nights":"6 + 1","hotel":"Safir Waterfalls Resort 5* + Amarante Pyramids 5*","meal":"AI + BB","sgl":"+200 USD","dbl":"929 USD","tpl":"929 USD"},{"city":"Sharm + Cairo","nights":"6 + 1","hotel":"Queen Sharm Resort 4* + Flamenco Cairo Hotel 4*","meal":"AI + BB","sgl":"+180 USD","dbl":"899 USD","tpl":"899 USD"}]}]'::jsonb,
  '[{"day":"Day 1","title":"Arrival to Sharm El Sheikh","details":["Meeting at Istanbul Sabiha Gökçen Airport and flight to Sharm El Sheikh.","Airport welcome, hotel transfer, check-in and Sharm city tour.","Visits include Old Market, El Sahaba Mosque and Farsha Cafe."]},{"day":"Day 2","title":"Free Day in Sharm","details":["Breakfast and free time at the hotel beach, pool and all-inclusive services.","Optional tours can be arranged during the day."]},{"day":"Day 3","title":"Sharm Activities","details":["Free time to enjoy the Red Sea atmosphere.","Optional ATV Safari, Bedouin Night, Ras Mohammed, diving, water sports or Dahab tour."]},{"day":"Day 4","title":"Sharm Leisure","details":["Relaxing day at the resort.","Optional evening visit to Naama Bay or Soho Square."]},{"day":"Day 5","title":"Sharm Free Day","details":["Enjoy the beach, hotel facilities and optional tours.","Overnight at the Sharm hotel."]},{"day":"Day 6","title":"Night Transfer to Cairo","details":["Free day at the hotel.","Late-night departure to Cairo by bus at 00:15."]},{"day":"Day 7","title":"Cairo Tour","details":["Morning arrival to Cairo.","Included visit: Giza Pyramids, Great Sphinx and Grand Egyptian Museum.","Optional Nile dinner cruise in the evening."]},{"day":"Day 8","title":"Departure","details":["Breakfast and check-out.","Airport transfer and flight back to Istanbul."]}]'::jsonb,
  '["Flight tickets and airport taxes","6 nights all-inclusive accommodation in Sharm, 1 night bed & breakfast accommodation in Cairo","Airport / hotel / airport transfers","Panoramic city tours","Turkish assistance service","Pyramids tour and Grand Egyptian Museum"]'::jsonb,
  1001
WHERE NOT EXISTS (
  SELECT 1
  FROM packages
  WHERE backend_name = '7 GECE 8 GÜN SHARM + KAHİRE TURU - 6 GECE SHARM + 1 GECE KAHİRE'
);

INSERT INTO packages
(
  title,
  name,
  backend_name,
  route,
  duration,
  transfer,
  transfer_reduction,
  start_price,
  programme,
  price,
  country,
  destination,
  region,
  force_category,
  visibility,
  image,
  options,
  itinerary,
  included,
  display_order
)
SELECT
  'Turkey Package: 7 Nights / 8 Days Sharm + Cairo Deluxe',
  'Turkey Package: 7 Nights / 8 Days Sharm + Cairo Deluxe',
  '7 GECE 8 GÜN SHARM + KAHİRE TURU - 5 GECE SHARM + 2 GECE KAHİRE',
  'Turkey (SAW) → Sharm El Sheikh → Cairo',
  '7 Nights / 8 Days',
  'Flight + Airport Transfers + Cairo Stay',
  'Flight: 11:00 SAW → SSH Air Cairo / Return 08:00 Cairo → SAW Air Cairo with 30 KG + 8 KG baggage.',
  'From 899 USD',
  'Extra Tours: ATV Safari + Bedouin Night (25$) | Ras Mohammed Boat Trip + Diving (40$) | Water Sports Package (70$) | Dahab Tour (25$) | Nile Dinner Cruise (25$)',
  'From 899 USD',
  'Turkey',
  'Sharm El Sheikh + Cairo',
  'others',
  'others',
  'Published',
  '/images/packages/turkey-package-3.webp',
  '[{"title":"Hotel Options / Price Per Person","rows":[{"city":"Sharm + Cairo","nights":"5 + 2","hotel":"Park Regency Resort 5* + Hilton Cairo 5*","meal":"AI + BB","sgl":"+300 USD","dbl":"1049 USD","tpl":"1049 USD"},{"city":"Sharm + Cairo","nights":"5 + 2","hotel":"Marriott Renaissance Golden 5* + Hilton Cairo 5*","meal":"AI + BB","sgl":"+250 USD","dbl":"1029 USD","tpl":"1029 USD"},{"city":"Sharm + Cairo","nights":"5 + 2","hotel":"Safir Waterfalls Resort 5* + Hilton Cairo 5*","meal":"AI + BB","sgl":"+250 USD","dbl":"969 USD","tpl":"969 USD"},{"city":"Sharm + Cairo","nights":"5 + 2","hotel":"Safir Waterfalls Resort 5* + Amarante Pyramids 5*","meal":"AI + BB","sgl":"+200 USD","dbl":"929 USD","tpl":"929 USD"},{"city":"Sharm + Cairo","nights":"5 + 2","hotel":"Queen Sharm Resort 4* + Flamenco Cairo Hotel 4*","meal":"AI + BB","sgl":"+180 USD","dbl":"899 USD","tpl":"899 USD"}]}]'::jsonb,
  '[{"day":"Day 1","title":"Arrival to Sharm El Sheikh","details":["Meeting at Istanbul Sabiha Gökçen Airport and flight to Sharm El Sheikh.","Airport welcome, hotel transfer and check-in.","Included Sharm city tour: Old Market, El Sahaba Mosque and Farsha Cafe."]},{"day":"Day 2","title":"Free Day in Sharm","details":["Breakfast and free time at the beach, pool and all-inclusive hotel services.","Optional tours available during the day."]},{"day":"Day 3","title":"Sharm Optional Tours","details":["Enjoy the Red Sea and hotel activities.","Optional ATV Safari, Bedouin Night, Ras Mohammed, diving, water sports or Dahab tour."]},{"day":"Day 4","title":"Sharm Leisure","details":["Free day at the resort.","Optional evening visit to Naama Bay or Soho Square."]},{"day":"Day 5","title":"Last Day in Sharm","details":["Free time to enjoy the resort facilities.","Overnight at the Sharm hotel."]},{"day":"Day 6","title":"Transfer to Cairo","details":["Morning departure to Cairo.","Hotel transfer and check-in.","Included Old Cairo and El Hussein area visit."]},{"day":"Day 7","title":"Pyramids and Museum","details":["Included tour: Pyramids, Sphinx and Egyptian Museum.","Overnight at the Cairo hotel."]},{"day":"Day 8","title":"Departure","details":["Breakfast and check-out.","Transfer to the airport and return flight to Istanbul."]}]'::jsonb,
  '["Flight tickets and airport taxes","5 nights all-inclusive accommodation in Sharm, 2 nights bed & breakfast accommodation in Cairo","Airport / hotel / airport transfers","Panoramic city tours","Turkish assistance service","Pyramids tour and Egyptian Museum"]'::jsonb,
  1002
WHERE NOT EXISTS (
  SELECT 1
  FROM packages
  WHERE backend_name = '7 GECE 8 GÜN SHARM + KAHİRE TURU - 5 GECE SHARM + 2 GECE KAHİRE'
);

