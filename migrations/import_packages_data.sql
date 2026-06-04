DELETE FROM packages
WHERE backend_name IN (
  '( Cairo - Hurghada ) 5 Nights',
  '( Cairo - Hurghada ) 6 Nights',
  '( Cairo - Alexandria ) 6 Nights',
  '( Cairo - Luxor ) 6 Nights',
  'Cairo & Sharm El Sheikh Program',
  'Cairo & North Coast Package - 6 Nights / 7 Days',
  'Cairo & Ain El Sokhna Package - 6 Nights / 7 Days',
  'Hilton Zamalek - 5 Nights / 6 Days',
  'Hilton Ramsis - 3 Nights / 4 Days',
  'Hilton Ramsis - 5 Nights / 6 Days',
  '( Cairo – Hurghada ) 5 Nights',
  '( Cairo – Hurghada ) 6 Nights',
  '( Cairo – Alexandria ) 6 Nights',
  '( Cairo – Luxor ) 6 Nights',
  'Cairo & Sharm El Sheikh Program (Frontend)',
  'Cairo & North Coast Package – 6 Nights / 7 Days',
  'Cairo & Ain El Sokhna Package – 6 Nights / 7 Days'
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
  visibility,
  image,
  options,
  itinerary,
  display_order
)
VALUES
(
  '( Cairo - Hurghada ) 5 Nights',
  '( Cairo - Hurghada ) 5 Nights',
  '( Cairo - Hurghada ) 5 Nights',
  'Cairo - Hurghada',
  '5 Nights',
  'Round-trip transfer by Bus from Cairo to Hurghada',
  '',
  'From 345$',
  '',
  'Published',
  '/images/packages/cairo-hurghada1.png',
  '[
    {
      "title": "Option 01",
      "rows": [
        {"city":"Cairo","nights":"2 Nights","hotel":"Hilton Cairo Grand Nile","meal":"Breakfast","sgl":"710$","dbl":"400$","tpl":"345$"},
        {"city":"Hurghada","nights":"3 Nights","hotel":"Albatros Aqua Blu Hurghada","meal":"All Inclusive","sgl":"","dbl":"","tpl":""}
      ]
    },
    {
      "title": "Option 02",
      "rows": [
        {"city":"Cairo","nights":"2 Nights","hotel":"Ramses Hilton","meal":"Breakfast","sgl":"790$","dbl":"465$","tpl":"430$"},
        {"city":"Hurghada","nights":"3 Nights","hotel":"Cleopatra Luxury Makadi Bay","meal":"All Inclusive","sgl":"","dbl":"","tpl":""}
      ]
    }
  ]'::jsonb,
  '[]'::jsonb,
  1
),
(
  '( Cairo - Hurghada ) 6 Nights',
  '( Cairo - Hurghada ) 6 Nights',
  '( Cairo - Hurghada ) 6 Nights',
  'Cairo - Hurghada',
  '6 Nights',
  'Round-trip transfer by Bus from Cairo to Hurghada',
  '',
  'From 415$',
  '',
  'Published',
  '/images/packages/cairo-hurghada2.png',
  '[
    {
      "title": "Option 01",
      "rows": [
        {"city":"Cairo","nights":"2 Nights","hotel":"Hilton Cairo Grand Nile","meal":"Breakfast","sgl":"845$","dbl":"475$","tpl":"415$"},
        {"city":"Hurghada","nights":"4 Nights","hotel":"Albatros Aqua Blu Hurghada","meal":"All Inclusive","sgl":"","dbl":"","tpl":""}
      ]
    },
    {
      "title": "Option 02",
      "rows": [
        {"city":"Cairo","nights":"2 Nights","hotel":"Ramses Hilton","meal":"Breakfast","sgl":"930$","dbl":"555$","tpl":"515$"},
        {"city":"Hurghada","nights":"4 Nights","hotel":"Cleopatra Luxury Makadi Bay","meal":"All Inclusive","sgl":"","dbl":"","tpl":""}
      ]
    }
  ]'::jsonb,
  '[]'::jsonb,
  2
),
(
  '( Cairo - Alexandria ) 6 Nights',
  '( Cairo - Alexandria ) 6 Nights',
  '( Cairo - Alexandria ) 6 Nights',
  'Cairo - Alexandria',
  '6 Nights',
  'Round-trip transfer by Bus from Cairo to Alexandria',
  '',
  'From 445$',
  '',
  'Published',
  '/images/packages/cairo-alexandria1.png',
  '[
    {
      "title": "Option 01",
      "rows": [
        {"city":"Cairo","nights":"4 Nights","hotel":"Hilton Cairo Grand Nile","meal":"Breakfast","sgl":"980$","dbl":"545$","tpl":"445$"},
        {"city":"Alexandria","nights":"2 Nights","hotel":"Rixos Montaza Alexandria","meal":"Breakfast","sgl":"","dbl":"","tpl":""}
      ]
    },
    {
      "title": "Option 02",
      "rows": [
        {"city":"Cairo","nights":"4 Nights","hotel":"Ramses Hilton","meal":"Breakfast","sgl":"1060$","dbl":"575$","tpl":"460$"},
        {"city":"Alexandria","nights":"2 Nights","hotel":"SUNRISE Alex Avenue Resort (Select)","meal":"Breakfast","sgl":"","dbl":"","tpl":""}
      ]
    }
  ]'::jsonb,
  '[]'::jsonb,
  3
),
(
  '( Cairo - Luxor ) 6 Nights',
  '( Cairo - Luxor ) 6 Nights',
  '( Cairo - Luxor ) 6 Nights',
  'Cairo - Luxor',
  '6 Nights',
  'Round-trip transfer by Sleeping Cabin Train from Cairo to Luxor',
  'Transfer Reduction: 320$ per person',
  'From 620$ / 535 EUR',
  '',
  'Published',
  '/images/packages/cairo-luxor2.png',
  '[
    {
      "title": "Option 01",
      "rows": [
        {"city":"Cairo","nights":"3 Nights","hotel":"Hilton Cairo Grand Nile","meal":"Breakfast","sgl":"995$","dbl":"690$","tpl":"620$"},
        {"city":"Luxor","nights":"3 Nights","hotel":"Steigenberger Nile Palace Hotel Luxor","meal":"Breakfast","sgl":"","dbl":"","tpl":""}
      ]
    },
    {
      "title": "Option 02",
      "rows": [
        {"city":"Cairo","nights":"3 Nights","hotel":"Ramses Hilton","meal":"Breakfast","sgl":"Contact us","dbl":"Contact us","tpl":"Contact us"},
        {"city":"Luxor","nights":"3 Nights","hotel":"To be confirmed","meal":"Breakfast","sgl":"","dbl":"","tpl":""}
      ]
    }
  ]'::jsonb,
  '[]'::jsonb,
  4
),
(
  'Cairo & Sharm El Sheikh Program',
  'Cairo & Sharm El Sheikh Program',
  'Cairo & Sharm El Sheikh Program',
  'Cairo - Sharm El Sheikh',
  '6 Days / 5 Nights',
  'Private transfers included during the program',
  '',
  'Contact us',
  '',
  'Published',
  '/images/packages/cairo-sharm.png',
  '[]'::jsonb,
  '[
    {"day":"Day 1","title":"Arrival in Cairo & Pyramids Tour","details":["Meet & assist service upon arrival at Cairo Airport.","Private transfer to the hotel.","Check-in and overnight in Cairo.","Full-day tour including Giza Pyramids, The Sphinx, and Grand Egyptian Museum.","Professional English-speaking tour guide during the tour.","Return to the hotel and overnight."]},
    {"day":"Day 2","title":"Islamic Cairo Tour","details":["Breakfast at the hotel.","Full-day tour in Islamic Cairo including Al Muizz Street, Al Hussein Mosque, Khan El Khalili Bazaar, and Al Azhar Mosque.","Free time for shopping and exploring the historical atmosphere.","Private transportation and professional tour guide included.","Return to the hotel and overnight."]},
    {"day":"Day 3","title":"Transfer to Sharm El Sheikh","details":["Transfer to the hotel and check-in.","Free time at leisure.","Overnight in Sharm El Sheikh."]},
    {"day":"Day 4","title":"Boat Trip & Snorkeling","details":["Boat trip to Tiran Island or Ras Mohammed National Park.","Snorkeling experience with lunch onboard.","Round-trip transfers included.","Overnight in Sharm El Sheikh."]},
    {"day":"Day 5","title":"Desert Safari Experience","details":["Desert safari experience with quad biking or buggy ride.","Bedouin dinner with oriental show.","Overnight in Sharm El Sheikh."]},
    {"day":"Day 6","title":"Departure","details":["Breakfast at the hotel.","Transfer to Cairo airport for final departure."]}
  ]'::jsonb,
  5
),
(
  'Cairo & North Coast Package',
  'Cairo & North Coast Package',
  'Cairo & North Coast Package - 6 Nights / 7 Days',
  'Cairo - North Coast',
  '6 Nights / 7 Days',
  '3 Nights in Cairo + 3 Nights in North Coast with transfer included',
  '',
  'From 1,293$',
  '',
  'Published',
  '/images/packages/alexandria.png',
  '[
    {
      "title": "Luxury Package",
      "rows": [
        {"city":"Cairo","nights":"3 Nights","hotel":"Hilton Ramses","meal":"To be confirmed","sgl":"1,562$","dbl":"1,781$","tpl":"2,346$"},
        {"city":"North Coast","nights":"3 Nights","hotel":"Rixos Premium Alamein","meal":"To be confirmed","sgl":"","dbl":"","tpl":""}
      ]
    },
    {
      "title": "Premium Package",
      "rows": [
        {"city":"Cairo","nights":"3 Nights","hotel":"Fairmont Nile City","meal":"To be confirmed","sgl":"1,925$","dbl":"2,150$","tpl":"2,500$"},
        {"city":"North Coast","nights":"3 Nights","hotel":"Gewan Palace","meal":"To be confirmed","sgl":"","dbl":"","tpl":""}
      ]
    },
    {
      "title": "Standard Package",
      "rows": [
        {"city":"Cairo","nights":"3 Nights","hotel":"Hilton Ramses","meal":"To be confirmed","sgl":"1,293$","dbl":"1,457$","tpl":"1,902$"},
        {"city":"North Coast","nights":"3 Nights","hotel":"Azur One Eleven","meal":"To be confirmed","sgl":"","dbl":"","tpl":""}
      ]
    }
  ]'::jsonb,
  '[]'::jsonb,
  6
),
(
  'Cairo & Ain El Sokhna Package',
  'Cairo & Ain El Sokhna Package',
  'Cairo & Ain El Sokhna Package - 6 Nights / 7 Days',
  'Cairo - Ain El Sokhna',
  '6 Nights / 7 Days',
  '3 Nights in Cairo + 3 Nights in Ain El Sokhna with transfer included',
  '',
  'From 1,072$',
  '',
  'Published',
  '/images/packages/ainsokhna.jpg',
  '[
    {
      "title": "Luxury Package",
      "rows": [
        {"city":"Cairo","nights":"3 Nights","hotel":"The St. Regis Cairo","meal":"To be confirmed","sgl":"1,825$","dbl":"1,900$","tpl":"2,500$"},
        {"city":"Ain El Sokhna","nights":"3 Nights","hotel":"Movenpick El Sokhna","meal":"To be confirmed","sgl":"","dbl":"","tpl":""}
      ]
    },
    {
      "title": "Premium Package",
      "rows": [
        {"city":"Cairo","nights":"3 Nights","hotel":"Hilton Ramses","meal":"To be confirmed","sgl":"1,084$","dbl":"1,260$","tpl":"1,716$"},
        {"city":"Ain El Sokhna","nights":"3 Nights","hotel":"Coral Sea Beach","meal":"To be confirmed","sgl":"","dbl":"","tpl":""}
      ]
    },
    {
      "title": "Standard Package",
      "rows": [
        {"city":"Cairo","nights":"3 Nights","hotel":"Fairmont Nile City","meal":"To be confirmed","sgl":"1,072$","dbl":"1,214$","tpl":"1,656$"},
        {"city":"Ain El Sokhna","nights":"3 Nights","hotel":"Stella Grand","meal":"To be confirmed","sgl":"","dbl":"","tpl":""}
      ]
    }
  ]'::jsonb,
  '[]'::jsonb,
  7
),
(
  'Hilton Zamalek Package',
  'Hilton Zamalek Package',
  'Hilton Zamalek - 5 Nights / 6 Days',
  'Cairo',
  '5 Nights / 6 Days',
  'Pick up & drop off with Cairo tours and transportation included',
  '',
  'From 414$',
  'Accommodation in hotel with breakfast; Pick up & drop off; Pyramids & Sphinx tour with ticket & transportation; Grand Egyptian Museum tour with ticket & transportation; Khan El Khalili and Old Egypt tour & mall; All taxes included; Flight ticket optional by request',
  'Published',
  '/images/packages/alexandria.png',
  '[
    {
      "title": "Price Per Person",
      "rows": [
        {"city":"Cairo","nights":"5 Nights","hotel":"Hilton Zamalek","meal":"Breakfast","sgl":"555$","dbl":"444$","tpl":"414$"}
      ]
    },
    {
      "title": "Children Price",
      "rows": [
        {"city":"Child","nights":"0 - 2 Year","hotel":"-","meal":"-","sgl":"Free","dbl":"Free","tpl":"Free"},
        {"city":"Child","nights":"2 - 12 Year","hotel":"-","meal":"-","sgl":"99$","dbl":"99$","tpl":"99$"},
        {"city":"Child","nights":"6 - 12 Year","hotel":"-","meal":"-","sgl":"265$","dbl":"265$","tpl":"Second child: 265$"}
      ]
    }
  ]'::jsonb,
  '[]'::jsonb,
  8
),
(
  'Hilton Ramsis Package',
  'Hilton Ramsis Package',
  'Hilton Ramsis - 3 Nights / 4 Days',
  'Cairo',
  '3 Nights / 4 Days',
  'Pick up & drop off with Cairo tours and transportation included',
  '',
  'From 249$',
  'Accommodation in hotel with breakfast; Pick up & drop off; Pyramids & Sphinx tour with ticket & transportation; Grand Egyptian Museum tour with ticket & transportation; All taxes included; Flight ticket optional by request',
  'Published',
  '/images/packages/ainsokhna.jpg',
  '[
    {
      "title": "Price Per Person",
      "rows": [
        {"city":"Cairo","nights":"3 Nights","hotel":"Hilton Ramsis","meal":"Breakfast","sgl":"370$","dbl":"269$","tpl":"249$"}
      ]
    },
    {
      "title": "Children Price",
      "rows": [
        {"city":"Child","nights":"0 - 2 Year","hotel":"-","meal":"-","sgl":"Free","dbl":"Free","tpl":"Free"},
        {"city":"Child","nights":"2 - 12 Year","hotel":"-","meal":"-","sgl":"99$","dbl":"99$","tpl":"99$"},
        {"city":"Child","nights":"6 - 12 Year","hotel":"-","meal":"-","sgl":"199$","dbl":"199$","tpl":"Second child: 199$"}
      ]
    }
  ]'::jsonb,
  '[]'::jsonb,
  9
),
(
  'Hilton Ramsis Package',
  'Hilton Ramsis Package',
  'Hilton Ramsis - 5 Nights / 6 Days',
  'Cairo',
  '5 Nights / 6 Days',
  'Pick up & drop off with Cairo tours and transportation included',
  '',
  'From 379$',
  'Accommodation in hotel with breakfast; Pick up & drop off; Pyramids & Sphinx tour with ticket & transportation; Grand Egyptian Museum tour with ticket & transportation; Khan El Khalili and Old Egypt tour & mall; All taxes included; Flight ticket optional by request',
  'Published',
  '/images/packages/cairo-alexandria1.png',
  '[
    {
      "title": "Price Per Person",
      "rows": [
        {"city":"Cairo","nights":"5 Nights","hotel":"Hilton Ramsis","meal":"Breakfast","sgl":"499$","dbl":"389$","tpl":"379$"}
      ]
    },
    {
      "title": "Children Price",
      "rows": [
        {"city":"Child","nights":"0 - 2 Year","hotel":"-","meal":"-","sgl":"Free","dbl":"Free","tpl":"Free"},
        {"city":"Child","nights":"2 - 12 Year","hotel":"-","meal":"-","sgl":"99$","dbl":"99$","tpl":"99$"},
        {"city":"Child","nights":"6 - 12 Year","hotel":"-","meal":"-","sgl":"265$","dbl":"265$","tpl":"Second child: 265$"}
      ]
    }
  ]'::jsonb,
  '[]'::jsonb,
  10
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
  visibility,
  image,
  options,
  itinerary,
  display_order
)
SELECT
  copy.title,
  copy.name,
  copy.backend_name,
  copy.route,
  original.duration,
  original.transfer,
  original.transfer_reduction,
  original.start_price,
  original.programme,
  original.visibility,
  original.image,
  original.options,
  original.itinerary,
  copy.display_order
FROM (
  VALUES
    (
      '( Cairo - Hurghada ) 5 Nights',
      '( Cairo - Hurghada ) 5 Nights',
      '( Cairo - Hurghada ) 5 Nights',
      '( Cairo – Hurghada ) 5 Nights',
      'Cairo – Hurghada',
      11
    ),
    (
      '( Cairo - Hurghada ) 6 Nights',
      '( Cairo - Hurghada ) 6 Nights',
      '( Cairo - Hurghada ) 6 Nights',
      '( Cairo – Hurghada ) 6 Nights',
      'Cairo – Hurghada',
      12
    ),
    (
      '( Cairo - Alexandria ) 6 Nights',
      '( Cairo - Alexandria ) 6 Nights',
      '( Cairo - Alexandria ) 6 Nights',
      '( Cairo – Alexandria ) 6 Nights',
      'Cairo – Alexandria',
      13
    ),
    (
      '( Cairo - Luxor ) 6 Nights',
      '( Cairo - Luxor ) 6 Nights',
      '( Cairo - Luxor ) 6 Nights',
      '( Cairo – Luxor ) 6 Nights',
      'Cairo – Luxor',
      14
    ),
    (
      'Cairo & Sharm El Sheikh Program',
      'Cairo & Sharm El Sheikh Program',
      'Cairo & Sharm El Sheikh Program',
      'Cairo & Sharm El Sheikh Program (Frontend)',
      'Cairo – Sharm El Sheikh',
      15
    ),
    (
      'Cairo & North Coast Package - 6 Nights / 7 Days',
      'Cairo & North Coast Package',
      'Cairo & North Coast Package',
      'Cairo & North Coast Package – 6 Nights / 7 Days',
      'Cairo – North Coast',
      16
    ),
    (
      'Cairo & Ain El Sokhna Package - 6 Nights / 7 Days',
      'Cairo & Ain El Sokhna Package',
      'Cairo & Ain El Sokhna Package',
      'Cairo & Ain El Sokhna Package – 6 Nights / 7 Days',
      'Cairo – Ain El Sokhna',
      17
    )
) AS copy
(
  source_backend_name,
  title,
  name,
  backend_name,
  route,
  display_order
)
JOIN packages original
  ON original.backend_name = copy.source_backend_name;
