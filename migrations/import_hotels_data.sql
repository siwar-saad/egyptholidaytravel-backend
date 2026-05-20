INSERT INTO hotels
(name, city, meal, image, gallery, group_title, group_subtitle, periods, display_order)
VALUES
(
  'Renaissance Sharm El Sheikh',
  'Sharm El Sheikh',
  'Soft All Inclusive',
  '/images/hotels/hotel1-1.jpg',
  '["/images/hotels/hotel1-1.jpg","/images/hotels/hotel1-2.jpg","/images/hotels/hotel1-3.jpg"]'::jsonb,
  'Hotels in Sharm El Sheikh',
  'Luxury beach resorts, Red Sea views, and unforgettable relaxing stays.',
  '[
    {"from":"01-May-2026","to":"24-May-2026","single":"40 USD","double":"63 USD","triple":"2 USD Reduction"},
    {"from":"25-May-2026","to":"31-May-2026","single":"55 USD","double":"90 USD","triple":"2 USD Reduction"},
    {"from":"01-Jun-2026","to":"30-Jun-2026","single":"40 USD","double":"60 USD","triple":"2 USD Reduction"},
    {"from":"01-Jul-2026","to":"10-Jul-2026","single":"40 USD","double":"65 USD","triple":"2 USD Reduction"},
    {"from":"11-Jul-2026","to":"31-Jul-2026","single":"40 USD","double":"70 USD","triple":"2 USD Reduction"},
    {"from":"01-Aug-2026","to":"31-Aug-2026","single":"40 USD","double":"75 USD","triple":"2 USD Reduction"},
    {"from":"01-Sep-2026","to":"30-Sep-2026","single":"40 USD","double":"70 USD","triple":"2 USD Reduction"},
    {"from":"01-Oct-2026","to":"31-Oct-2026","single":"40 USD","double":"75 USD","triple":"2 USD Reduction"}
  ]'::jsonb,
  1
),
(
  'Safir Sharm Waterfalls Resort',
  'Sharm El Sheikh',
  'Soft All Inclusive',
  '/images/hotels/safir1.jpg',
  '["/images/hotels/safir1.jpg","/images/hotels/safir.jpg","/images/hotels/safir2.jpg"]'::jsonb,
  'Hotels in Sharm El Sheikh',
  'Luxury beach resorts, Red Sea views, and unforgettable relaxing stays.',
  '[
    {"from":"01-May-2026","to":"25-May-2026","single":"83 USD","double":"52 USD","triple":"50 USD"},
    {"from":"26-May-2026","to":"31-May-2026","single":"144 USD","double":"90 USD","triple":"88 USD"},
    {"from":"01-Jun-2026","to":"15-Jul-2026","single":"91 USD","double":"57 USD","triple":"55 USD"},
    {"from":"16-Jul-2026","to":"20-Nov-2026","single":"112 USD","double":"70 USD","triple":"68 USD"},
    {"from":"21-Nov-2026","to":"27-Dec-2026","single":"91 USD","double":"57 USD","triple":"55 USD"},
    {"from":"28-Dec-2026","to":"07-Jan-2027","single":"112 USD","double":"70 USD","triple":"68 USD"}
  ]'::jsonb,
  2
),
(
  'Charmillion Club Aqua Park',
  'Sharm El Sheikh',
  'Soft All Inclusive',
  '/images/hotels/charmillion.jpg',
  '["/images/hotels/charmillion.jpg","/images/hotels/charmillion1.jpg","/images/hotels/charmillion2.jpg"]'::jsonb,
  'Hotels in Sharm El Sheikh',
  'Luxury beach resorts, Red Sea views, and unforgettable relaxing stays.',
  '[
    {"from":"11-May-2026","to":"25-May-2026","single":"112 USD","double":"70 USD","triple":"68 USD"},
    {"from":"26-May-2026","to":"31-May-2026","single":"216 USD","double":"135 USD","triple":"133 USD"},
    {"from":"01-Jun-2026","to":"30-Jun-2026","single":"120 USD","double":"75 USD","triple":"73 USD"},
    {"from":"01-Jul-2026","to":"10-Jul-2026","single":"168 USD","double":"105 USD","triple":"103 USD"},
    {"from":"11-Jul-2026","to":"31-Aug-2026","single":"200 USD","double":"125 USD","triple":"123 USD"},
    {"from":"01-Sep-2026","to":"15-Sep-2026","single":"168 USD","double":"105 USD","triple":"103 USD"},
    {"from":"16-Sep-2026","to":"31-Oct-2026","single":"136 USD","double":"85 USD","triple":"83 USD"}
  ]'::jsonb,
  3
),
(
  'Park Regency Resort',
  'Sharm El Sheikh',
  'Soft All Inclusive',
  '/images/hotels/Park.jpg',
  '["/images/hotels/Park.jpg","/images/hotels/Park1.jpg","/images/hotels/Park2.jpg"]'::jsonb,
  'Hotels in Sharm El Sheikh',
  'Luxury beach resorts, Red Sea views, and unforgettable relaxing stays.',
  '[
    {"from":"24-Mar-2026","to":"30-Apr-2026","single":"136 USD","double":"85 USD","triple":"-"},
    {"from":"01-May-2026","to":"25-May-2026","single":"136 USD","double":"85 USD","triple":"-"},
    {"from":"26-May-2026","to":"31-May-2026","single":"160 USD","double":"100 USD","triple":"-"},
    {"from":"01-Jun-2026","to":"30-Jun-2026","single":"144 USD","double":"90 USD","triple":"-"},
    {"from":"01-Jul-2026","to":"31-Jul-2026","single":"192 USD","double":"120 USD","triple":"-"},
    {"from":"01-Aug-2026","to":"31-Aug-2026","single":"200 USD","double":"125 USD","triple":"-"},
    {"from":"01-Sep-2026","to":"31-Oct-2026","single":"160 USD","double":"100 USD","triple":"-"}
  ]'::jsonb,
  4
),
(
  'Fairmont Nile City',
  'Cairo',
  'Bed & Breakfast',
  '/images/hotels/Fairmont.jpg',
  '["/images/hotels/Fairmont.jpg","/images/hotels/Fairmont1.jpg","/images/hotels/Fairmont2.jpg","/images/hotels/Fairmont3.jpg","/images/hotels/Fairmont4.jpg","/images/hotels/Fairmont5.jpg"]'::jsonb,
  'Hotels in Cairo',
  'Premium city hotels close to culture, shopping, Nile views, and iconic landmarks.',
  '[{"from":"01-Jun-2026","to":"30-Sep-2026","single":"170 USD","double":"190 USD","triple":"240 USD"}]'::jsonb,
  5
),
(
  'Ramses Hilton',
  'Cairo',
  'Bed & Breakfast',
  '/images/hotels/Ramses.jpg',
  '["/images/hotels/Ramses.jpg","/images/hotels/Ramses1.jpg","/images/hotels/Ramses2.jpg","/images/hotels/Ramses3.jpg","/images/hotels/Ramses4.jpg","/images/hotels/Ramses5.jpg"]'::jsonb,
  'Hotels in Cairo',
  'Premium city hotels close to culture, shopping, Nile views, and iconic landmarks.',
  '[{"from":"26-Mar-2026","to":"01-Jun-2026","single":"100 USD","double":"100 USD","triple":"130 USD"}]'::jsonb,
  6
),
(
  'InterContinental Cairo Citystars',
  'Cairo',
  'Room Only',
  '/images/hotels/Inter.jpg',
  '["/images/hotels/Inter.jpg","/images/hotels/Inter1.jpg","/images/hotels/Inter2.jpg","/images/hotels/Inter3.jpg","/images/hotels/Inter4.jpg"]'::jsonb,
  'Hotels in Cairo',
  'Premium city hotels close to culture, shopping, Nile views, and iconic landmarks.',
  '[
    {"from":"05-May-2026","to":"17-May-2026","single":"190 USD","double":"190 USD","triple":"220 USD"},
    {"from":"18-May-2026","to":"20-May-2026","single":"220 USD","double":"220 USD","triple":"250 USD"},
    {"from":"21-May-2026","to":"04-Jun-2026","single":"190 USD","double":"190 USD","triple":"220 USD"},
    {"from":"05-Jun-2026","to":"09-Jun-2026","single":"250 USD","double":"250 USD","triple":"280 USD"},
    {"from":"10-Jun-2026","to":"30-Jun-2026","single":"210 USD","double":"210 USD","triple":"240 USD"}
  ]'::jsonb,
  7
),
(
  'Holiday Inn Cairo Citystars',
  'Cairo',
  'Room Only',
  '/images/hotels/Holiday.jpg',
  '["/images/hotels/Holiday.jpg","/images/hotels/Holiday1.jpg","/images/hotels/Holiday2.jpg","/images/hotels/Holiday4.jpg","/images/hotels/Holiday5.jpg"]'::jsonb,
  'Hotels in Cairo',
  'Premium city hotels close to culture, shopping, Nile views, and iconic landmarks.',
  '[
    {"from":"05-May-2026","to":"17-May-2026","single":"115 USD","double":"115 USD","triple":"185 USD"},
    {"from":"18-May-2026","to":"20-May-2026","single":"140 USD","double":"140 USD","triple":"195 USD"},
    {"from":"21-May-2026","to":"04-Jun-2026","single":"115 USD","double":"115 USD","triple":"185 USD"},
    {"from":"05-Jun-2026","to":"09-Jun-2026","single":"150 USD","double":"150 USD","triple":"200 USD"},
    {"from":"10-Jun-2026","to":"30-Jun-2026","single":"135 USD","double":"135 USD","triple":"185 USD"}
  ]'::jsonb,
  8
),
(
  'Staybridge Suites Cairo Citystars',
  'Cairo',
  'Bed & Complimentary Buffet Breakfast',
  '/images/hotels/Stay.jpg',
  '["/images/hotels/Stay.jpg","/images/hotels/Stay1.jpg","/images/hotels/Stay2.jpg","/images/hotels/Stay3.jpg","/images/hotels/Stay4.jpg","/images/hotels/Stay5.jpg"]'::jsonb,
  'Hotels in Cairo',
  'Premium city hotels close to culture, shopping, Nile views, and iconic landmarks.',
  '[{"from":"05-May-2026","to":"30-Jun-2026","single":"180 USD","double":"180 USD","triple":"225 USD"}]'::jsonb,
  9
),
(
  'Xanadu Makadi Bay',
  'Hurghada / Makadi Bay',
  'High Class All Inclusive',
  '/images/hotels/Xanadu.jpg',
  '["/images/hotels/Xanadu.jpg","/images/hotels/Xanadu1.jpg","/images/hotels/Xanadu2.jpg","/images/hotels/Xanadu3.jpg"]'::jsonb,
  'Hotels in Hurghada',
  'Premium Red Sea resorts in Hurghada, Makadi Bay, and Abu Soma.',
  '[
    {"from":"01-May-2026","to":"07-May-2026","single":"255 USD","double":"170 USD","triple":"-"},
    {"from":"08-May-2026","to":"20-May-2026","single":"225 USD","double":"150 USD","triple":"-"},
    {"from":"21-May-2026","to":"30-Jun-2026","single":"255 USD","double":"170 USD","triple":"-"},
    {"from":"01-Jul-2026","to":"31-Aug-2026","single":"270 USD","double":"180 USD","triple":"-"},
    {"from":"01-Sep-2026","to":"31-Oct-2026","single":"300 USD","double":"200 USD","triple":"-"}
  ]'::jsonb,
  10
),
(
  'Seven Seas Jolie Bay',
  'Hurghada / Abu Soma',
  'Ultra All Inclusive',
  '/images/hotels/Seven.jpg',
  '["/images/hotels/Seven.jpg","/images/hotels/Seven1.jpg","/images/hotels/Seven2.jpg","/images/hotels/Seven3.jpg"]'::jsonb,
  'Hotels in Hurghada',
  'Premium Red Sea resorts in Hurghada, Makadi Bay, and Abu Soma.',
  '[
    {"from":"01-May-2026","to":"25-May-2026","single":"93 USD","double":"62 USD","triple":"-"},
    {"from":"26-May-2026","to":"31-May-2026","single":"114 USD","double":"76 USD","triple":"-"},
    {"from":"01-Jun-2026","to":"30-Jun-2026","single":"102 USD","double":"68 USD","triple":"-"},
    {"from":"01-Jul-2026","to":"15-Jul-2026","single":"129 USD","double":"86 USD","triple":"-"},
    {"from":"16-Jul-2026","to":"18-Sep-2026","single":"129 USD","double":"86 USD","triple":"-"},
    {"from":"19-Sep-2026","to":"31-Oct-2026","single":"114 USD","double":"76 USD","triple":"-"}
  ]'::jsonb,
  11
),
(
  'Pharaoh Azur Resort',
  'Hurghada',
  'Soft All Inclusive',
  '/images/hotels/Pharaoh.jpg',
  '["/images/hotels/Pharaoh.jpg","/images/hotels/Pharaoh1.jpg","/images/hotels/Pharaoh2.jpg","/images/hotels/Pharaoh3.jpg"]'::jsonb,
  'Hotels in Hurghada',
  'Premium Red Sea resorts in Hurghada, Makadi Bay, and Abu Soma.',
  '[
    {"from":"01-May-2026","to":"08-Jul-2026","single":"81 USD","double":"56 USD","triple":"53 USD"},
    {"from":"09-Jul-2026","to":"19-Aug-2026","single":"86 USD","double":"61 USD","triple":"58 USD"},
    {"from":"20-Aug-2026","to":"23-Sep-2026","single":"81 USD","double":"56 USD","triple":"53 USD"},
    {"from":"24-Sep-2026","to":"31-Oct-2026","single":"86 USD","double":"61 USD","triple":"58 USD"}
  ]'::jsonb,
  12
),
(
  'Continental Hotel Hurghada',
  'Hurghada',
  'Soft All Inclusive',
  '/images/hotels/Continental.jpg',
  '["/images/hotels/Continental.jpg","/images/hotels/Continental1.jpg","/images/hotels/Continental2.jpg","/images/hotels/Continental3.jpg"]'::jsonb,
  'Hotels in Hurghada',
  'Premium Red Sea resorts in Hurghada, Makadi Bay, and Abu Soma.',
  '[
    {"from":"04-May-2026","to":"25-May-2026","single":"184 USD","double":"115 USD","triple":"113 USD"},
    {"from":"26-May-2026","to":"31-May-2026","single":"248 USD","double":"155 USD","triple":"153 USD"},
    {"from":"01-Jun-2026","to":"30-Jun-2026","single":"184 USD","double":"115 USD","triple":"113 USD"},
    {"from":"01-Jul-2026","to":"31-Oct-2026","single":"216 USD","double":"135 USD","triple":"133 USD"}
  ]'::jsonb,
  13
),
(
  'Cleopatra Luxury Makadi Bay',
  'Hurghada / Makadi Bay',
  'Soft All Inclusive',
  '/images/hotels/Cleopatra.jpg',
  '["/images/hotels/Cleopatra.jpg","/images/hotels/Cleopatra1.jpg","/images/hotels/Cleopatra2.jpg","/images/hotels/Cleopatra3.jpg"]'::jsonb,
  'Hotels in Hurghada',
  'Premium Red Sea resorts in Hurghada, Makadi Bay, and Abu Soma.',
  '[
    {"from":"01-May-2026","to":"25-May-2026","single":"128 USD","double":"80 USD","triple":"78 USD"},
    {"from":"26-May-2026","to":"31-May-2026","single":"160 USD","double":"100 USD","triple":"98 USD"},
    {"from":"01-Jun-2026","to":"31-Oct-2026","single":"128 USD","double":"80 USD","triple":"78 USD"}
  ]'::jsonb,
  14
),
(
  'Jaz Soma Beach',
  'Hurghada / Abu Soma',
  'All Inclusive',
  '/images/hotels/JazSoma.jpg',
  '["/images/hotels/JazSoma.jpg","/images/hotels/JazSoma1.jpg","/images/hotels/JazSoma2.jpg","/images/hotels/JazSoma3.jpg"]'::jsonb,
  'Hotels in Hurghada',
  'Premium Red Sea resorts in Hurghada, Makadi Bay, and Abu Soma.',
  '[
    {"from":"01-May-2026","to":"25-Jun-2026","single":"161 USD","double":"92 USD","triple":"-"},
    {"from":"26-Jun-2026","to":"06-Aug-2026","single":"175 USD","double":"100 USD","triple":"-"},
    {"from":"07-Aug-2026","to":"27-Aug-2026","single":"190.75 USD","double":"109 USD","triple":"-"},
    {"from":"28-Aug-2026","to":"01-Oct-2026","single":"175.10 USD","double":"100.06 USD","triple":"-"},
    {"from":"02-Oct-2026","to":"31-Oct-2026","single":"187.25 USD","double":"107 USD","triple":"-"}
  ]'::jsonb,
  15
),
(
  'Retac Dahab Resort & Spa',
  'Dahab',
  'Half Board',
  '/images/hotels/Retac.jpg',
  '["/images/hotels/Retac.jpg","/images/hotels/Retac1.jpg","/images/hotels/Retac2.jpg","/images/hotels/Retac3.jpg"]'::jsonb,
  'Hotels in Dahab',
  'Relaxing beach resorts, crystal-clear waters, and peaceful stays.',
  '[
    {"from":"15-Mar-2026","to":"17-Mar-2026","single":"85 USD","double":"55 USD","triple":"160 USD"},
    {"from":"18-Mar-2026","to":"25-Mar-2026","single":"120 USD","double":"80 USD","triple":"235 USD"},
    {"from":"26-Mar-2026","to":"08-Apr-2026","single":"105 USD","double":"70 USD","triple":"205 USD"},
    {"from":"09-Apr-2026","to":"14-Apr-2026","single":"135 USD","double":"90 USD","triple":"265 USD"},
    {"from":"15-Apr-2026","to":"29-Apr-2026","single":"105 USD","double":"70 USD","triple":"205 USD"},
    {"from":"30-Apr-2026","to":"05-May-2026","single":"135 USD","double":"90 USD","triple":"265 USD"},
    {"from":"06-May-2026","to":"20-May-2026","single":"105 USD","double":"70 USD","triple":"205 USD"},
    {"from":"21-May-2026","to":"31-May-2026","single":"135 USD","double":"90 USD","triple":"265 USD"},
    {"from":"01-Jun-2026","to":"15-Jul-2026","single":"105 USD","double":"70 USD","triple":"205 USD"},
    {"from":"16-Jul-2026","to":"10-Oct-2026","single":"120 USD","double":"80 USD","triple":"235 USD"},
    {"from":"11-Oct-2026","to":"31-Oct-2026","single":"105 USD","double":"70 USD","triple":"205 USD"}
  ]'::jsonb,
  16
),
(
  'Ecotel Dahab Bay View Resort',
  'Dahab',
  'Half Board',
  '/images/hotels/Ecootel.jpg',
  '["/images/hotels/Ecootel.jpg","/images/hotels/Ecootel1.jpg","/images/hotels/Ecootel2.jpg","/images/hotels/Ecootel3.jpg"]'::jsonb,
  'Hotels in Dahab',
  'Relaxing beach resorts, crystal-clear waters, and peaceful stays.',
  '[
    {"from":"27-Jan-2026","to":"06-Feb-2026","single":"120 USD","double":"140 USD","triple":"170 USD"},
    {"from":"07-Feb-2026","to":"19-Mar-2026","single":"110 USD","double":"130 USD","triple":"160 USD"},
    {"from":"20-Mar-2026","to":"27-Mar-2026","single":"120 USD","double":"140 USD","triple":"170 USD"},
    {"from":"28-Mar-2026","to":"08-Apr-2026","single":"110 USD","double":"130 USD","triple":"160 USD"},
    {"from":"09-Apr-2026","to":"18-Apr-2026","single":"120 USD","double":"140 USD","triple":"170 USD"},
    {"from":"19-Apr-2026","to":"25-May-2026","single":"110 USD","double":"130 USD","triple":"160 USD"},
    {"from":"26-May-2026","to":"31-May-2026","single":"120 USD","double":"140 USD","triple":"170 USD"},
    {"from":"01-Jun-2026","to":"20-Jul-2026","single":"110 USD","double":"130 USD","triple":"160 USD"},
    {"from":"21-Jul-2026","to":"31-Oct-2026","single":"120 USD","double":"140 USD","triple":"170 USD"}
  ]'::jsonb,
  17
),
(
  'Dahab Lagoon Club Resort',
  'Dahab',
  'Half Board',
  '/images/hotels/Lagoon.jpg',
  '["/images/hotels/Lagoon.jpg","/images/hotels/Lagoon1.jpg","/images/hotels/Lagoon2.jpg","/images/hotels/Lagoon3.jpg"]'::jsonb,
  'Hotels in Dahab',
  'Relaxing beach resorts, crystal-clear waters, and peaceful stays.',
  '[
    {"from":"14-Apr-2026","to":"25-May-2026","single":"96 USD","double":"120 USD","triple":"171 USD"},
    {"from":"26-May-2026","to":"31-May-2026","single":"112 USD","double":"140 USD","triple":"201 USD"},
    {"from":"01-Jun-2026","to":"09-Jul-2026","single":"96 USD","double":"120 USD","triple":"171 USD"},
    {"from":"10-Jul-2026","to":"31-Oct-2026","single":"112 USD","double":"140 USD","triple":"201 USD"}
  ]'::jsonb,
  18
),
(
  'Jaz Dahabeya',
  'Dahab',
  'Half Board',
  '/images/hotels/JazDahabeya.jpg',
  '["/images/hotels/JazDahabeya.jpg","/images/hotels/JazDahabeya1.jpg","/images/hotels/JazDahabeya2.jpg","/images/hotels/JazDahabeya3.jpg"]'::jsonb,
  'Hotels in Dahab',
  'Relaxing beach resorts, crystal-clear waters, and peaceful stays.',
  '[
    {"from":"01-May-2026","to":"21-May-2026","single":"131 USD","double":"75 USD","triple":"92 USD"},
    {"from":"22-May-2026","to":"31-May-2026","single":"228 USD","double":"130 USD","triple":"147 USD"},
    {"from":"01-Jun-2026","to":"17-Jul-2026","single":"193 USD","double":"110 USD","triple":"127 USD"},
    {"from":"18-Jul-2026","to":"31-Aug-2026","single":"158 USD","double":"90 USD","triple":"107 USD"},
    {"from":"01-Sep-2026","to":"30-Sep-2026","single":"201 USD","double":"115 USD","triple":"132 USD"},
    {"from":"01-Oct-2026","to":"31-Oct-2026","single":"201 USD","double":"115 USD","triple":"132 USD"}
  ]'::jsonb,
  19
),
(
  'Happy Life Village Dahab',
  'Dahab',
  'Half Board',
  '/images/hotels/HappyLife.jpg',
  '["/images/hotels/HappyLife.jpg","/images/hotels/HappyLife1.jpg","/images/hotels/HappyLife2.jpg"]'::jsonb,
  'Hotels in Dahab',
  'Relaxing beach resorts, crystal-clear waters, and peaceful stays.',
  '[
    {"from":"01-May-2026","to":"25-May-2026","single":"55 USD","double":"80 USD","triple":"115 USD"},
    {"from":"26-May-2026","to":"31-May-2026","single":"70 USD","double":"110 USD","triple":"160 USD"},
    {"from":"01-Jun-2026","to":"02-Jul-2026","single":"55 USD","double":"80 USD","triple":"115 USD"},
    {"from":"03-Jul-2026","to":"31-Oct-2026","single":"65 USD","double":"100 USD","triple":"145 USD"}
  ]'::jsonb,
  20
),
(
  'Gewan White Beach Resort',
  'New Alamein',
  'Bed & Breakfast',
  '/images/hotels/GewanWhite.jpg',
  '["/images/hotels/GewanWhite.jpg","/images/hotels/GewanWhite1.jpg","/images/hotels/GewanWhite2.jpg","/images/hotels/GewanWhite3.jpg"]'::jsonb,
  'Hotels in El Alamein',
  'Luxury Mediterranean resorts and premium summer escapes.',
  '[
    {"from":"27-May-2026","to":"31-May-2026 / 01-Jul-2026 to 31-Aug-2026","single":"310 USD","double":"330 USD","triple":"Lake View"},
    {"from":"01-Jun-2026","to":"15-Jun-2026","single":"175 USD","double":"195 USD","triple":"Lake View"},
    {"from":"16-Jun-2026","to":"30-Jun-2026","single":"235 USD","double":"255 USD","triple":"Lake View"}
  ]'::jsonb,
  21
),
(
  'Gewan Resort New Alamein',
  'New Alamein',
  'Bed & Breakfast',
  '/images/hotels/GewanResort.jpg',
  '["/images/hotels/GewanResort.jpg","/images/hotels/GewanResort1.jpg","/images/hotels/GewanResort2.jpg","/images/hotels/GewanResort3.jpg"]'::jsonb,
  'Hotels in El Alamein',
  'Luxury Mediterranean resorts and premium summer escapes.',
  '[
    {"from":"27-May-2026","to":"31-May-2026 / 01-Jul-2026 to 31-Aug-2026","single":"300 USD","double":"320 USD","triple":"Garden View"},
    {"from":"01-Jun-2026","to":"15-Jun-2026","single":"165 USD","double":"185 USD","triple":"Garden View"},
    {"from":"16-Jun-2026","to":"30-Jun-2026","single":"225 USD","double":"245 USD","triple":"Garden View"}
  ]'::jsonb,
  22
),
(
  'Gewan Palace New Alamein',
  'New Alamein',
  'Bed & Breakfast',
  '/images/hotels/GewanPalace.jpg',
  '["/images/hotels/GewanPalace.jpg","/images/hotels/GewanPalace1.jpg"]'::jsonb,
  'Hotels in El Alamein',
  'Luxury Mediterranean resorts and premium summer escapes.',
  '[
    {"from":"27-May-2026","to":"31-May-2026 / 01-Jul-2026 to 31-Aug-2026","single":"425 USD","double":"445 USD","triple":"Standard Room"},
    {"from":"01-Jun-2026","to":"15-Jun-2026","single":"300 USD","double":"320 USD","triple":"Standard Room"},
    {"from":"16-Jun-2026","to":"30-Jun-2026","single":"350 USD","double":"370 USD","triple":"Standard Room"}
  ]'::jsonb,
  23
);
