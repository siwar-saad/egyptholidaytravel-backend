--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

-- Started on 2026-05-06 11:32:13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 225 (class 1259 OID 35912)
-- Name: bookings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bookings (
    id integer NOT NULL,
    booking_reference character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(50) DEFAULT 'pending'::character varying,
    search_params jsonb,
    selected_hotel jsonb,
    selected_activities jsonb,
    total_price numeric(10,2),
    customer_info jsonb
);


ALTER TABLE public.bookings OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 35911)
-- Name: bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bookings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bookings_id_seq OWNER TO postgres;

--
-- TOC entry 4964 (class 0 OID 0)
-- Dependencies: 224
-- Name: bookings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bookings_id_seq OWNED BY public.bookings.id;


--
-- TOC entry 221 (class 1259 OID 35895)
-- Name: destinations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.destinations (
    id character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    region character varying(100),
    image character varying(255),
    data jsonb
);


ALTER TABLE public.destinations OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 35903)
-- Name: packages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.packages (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    image character varying(255)
);


ALTER TABLE public.packages OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 35902)
-- Name: packages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.packages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.packages_id_seq OWNER TO postgres;

--
-- TOC entry 4965 (class 0 OID 0)
-- Dependencies: 222
-- Name: packages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.packages_id_seq OWNED BY public.packages.id;


--
-- TOC entry 227 (class 1259 OID 35927)
-- Name: password_resets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_resets (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token character varying(255) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.password_resets OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 35926)
-- Name: password_resets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.password_resets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.password_resets_id_seq OWNER TO postgres;

--
-- TOC entry 4966 (class 0 OID 0)
-- Dependencies: 226
-- Name: password_resets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.password_resets_id_seq OWNED BY public.password_resets.id;


--
-- TOC entry 218 (class 1259 OID 35865)
-- Name: subscribers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscribers (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    subscribed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(50) DEFAULT 'active'::character varying,
    ip_address character varying(45),
    user_agent text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.subscribers OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 35864)
-- Name: subscribers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subscribers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subscribers_id_seq OWNER TO postgres;

--
-- TOC entry 4967 (class 0 OID 0)
-- Dependencies: 217
-- Name: subscribers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subscribers_id_seq OWNED BY public.subscribers.id;


--
-- TOC entry 220 (class 1259 OID 35882)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    reset_token text,
    reset_token_expires timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 35881)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 4968 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4775 (class 2604 OID 35915)
-- Name: bookings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings ALTER COLUMN id SET DEFAULT nextval('public.bookings_id_seq'::regclass);


--
-- TOC entry 4774 (class 2604 OID 35906)
-- Name: packages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.packages ALTER COLUMN id SET DEFAULT nextval('public.packages_id_seq'::regclass);


--
-- TOC entry 4778 (class 2604 OID 35930)
-- Name: password_resets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_resets ALTER COLUMN id SET DEFAULT nextval('public.password_resets_id_seq'::regclass);


--
-- TOC entry 4766 (class 2604 OID 35868)
-- Name: subscribers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscribers ALTER COLUMN id SET DEFAULT nextval('public.subscribers_id_seq'::regclass);


--
-- TOC entry 4771 (class 2604 OID 35885)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4956 (class 0 OID 35912)
-- Dependencies: 225
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bookings (id, booking_reference, created_at, status, search_params, selected_hotel, selected_activities, total_price, customer_info) FROM stdin;
\.


--
-- TOC entry 4952 (class 0 OID 35895)
-- Dependencies: 221
-- Data for Name: destinations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.destinations (id, name, description, region, image, data) FROM stdin;
sharm	Sharm El Sheikh	World-class diving, crystal clear waters, and luxury resorts	Sinai	/images/sharm.jpeg	{"id": "sharm", "name": "Sharm El Sheikh", "image": "/images/sharm.jpeg", "hotels": [{"id": "amarina_sun", "name": "Amarina Sun Rise Aqua Park", "category": "4-Star Aqua Park", "features": ["Aqua Park", "Family-friendly"], "childPolicy": "Children FREE up to 12 years", "priceRanges": {"double": {"max": 8500, "min": 5850}, "single": {"max": 8500, "min": 4700}, "triple": {"max": 11600, "min": 8500}}}, {"id": "barcelo_tiran", "name": "Barcelo Tiran Resort", "category": "5-Star Beachfront", "features": ["Naama Bay location", "Couples & Divers"], "childPolicy": "Children 6-12: 50% discount", "priceRanges": {"double": {"max": 8000, "min": 6950}, "single": {"max": 6850, "min": 5950}, "triple": {"max": 11300, "min": 9750}}}], "region": "Sinai", "activities": [{"id": "diving", "name": "Diving at Ras Mohammed", "price": 450, "perPerson": true}, {"id": "quad_biking", "name": "Quad Biking Desert Safari", "price": 650, "perPerson": true}], "description": "World-class diving, crystal clear waters, and luxury resorts"}
hurghada	Hurghada	Vibrant coastal city with amazing water sports	Red Sea	/images/hurghada.jpg	{"id": "hurghada", "name": "Hurghada", "image": "/images/hurghada.jpg", "hotels": [{"id": "mirage_bay", "name": "Mirage Bay Aqua Park", "category": "4-Star Family Resort", "features": ["Budget families", "Aqua park fun"], "childPolicy": "Children 0-12 years FREE", "priceRanges": {"double": {"max": 4550, "min": 4550}, "single": {"max": 3550, "min": 3550}, "triple": {"max": 6850, "min": 6850}}}], "region": "Red Sea", "activities": [{"id": "giftun_island", "name": "Giftun Island Boat Trip", "price": 450, "perPerson": true}], "description": "Vibrant coastal city with amazing water sports"}
dahab	Dahab	Bohemian paradise with world-class diving	Sinai	/images/dahab.jpg	{"id": "dahab", "name": "Dahab", "image": "/images/dahab.jpg", "hotels": [{"id": "green_valley", "name": "Green Valley Resort", "category": "Budget", "features": ["Budget-friendly", "Basic comfort"], "childPolicy": "First child FREE up to 11.99 years", "priceRanges": {"double": {"max": 1450, "min": 950}, "single": {"max": 1200, "min": 800}, "triple": {"max": 2150, "min": 1350}}}], "region": "Sinai", "activities": [{"id": "blue_hole", "name": "Blue Hole Diving", "price": 250, "perPerson": true}], "description": "Bohemian paradise with world-class diving"}
luxor	Luxor	Ancient Thebes - world's greatest open-air museum	Upper Egypt	/images/luxor.jpg	{"id": "luxor", "name": "Luxor", "image": "/images/luxor.jpg", "hotels": [{"id": "winter_palace", "name": "Winter Palace Luxor", "category": "5-Star Historic Luxury", "features": ["Historic", "Luxury", "Nile views"], "childPolicy": "Contact hotel for child rates", "priceRanges": {"double": {"max": 14000, "min": 7000}, "single": {"max": 10000, "min": 5000}, "triple": {"max": 20000, "min": 10000}}}], "region": "Upper Egypt", "activities": [{"id": "valley_kings", "name": "Valley of the Kings Tour", "price": 360, "perPerson": true}], "description": "Ancient Thebes - world's greatest open-air museum"}
aswan	Aswan	Tranquil Nile city with Nubian culture	Upper Egypt	/images/aswan.jpg	{"id": "aswan", "name": "Aswan", "image": "/images/aswan.jpg", "hotels": [{"id": "old_cataract", "name": "Old Cataract Hotel", "category": "5-Star Historic Luxury", "features": ["Historic", "Where Agatha Christie stayed"], "childPolicy": "Contact hotel", "priceRanges": {"double": {"max": 16000, "min": 8000}, "single": {"max": 12000, "min": 6000}, "triple": {"max": 24000, "min": 12000}}}], "region": "Upper Egypt", "activities": [{"id": "abu_simbel", "name": "Abu Simbel Day Trip", "price": 450, "perPerson": true}], "description": "Tranquil Nile city with Nubian culture"}
cairo	Cairo	Egypt's vibrant capital with pyramids and history	Cairo	/images/cairo.jpg	{"id": "cairo", "name": "Cairo", "image": "/images/cairo.jpg", "hotels": [{"id": "mena_house", "name": "Marriott Mena House", "category": "5-Star Historic", "features": ["Pyramid views", "Historic luxury"], "childPolicy": "Contact hotel", "priceRanges": {"double": {"max": 18000, "min": 8000}, "single": {"max": 18000, "min": 8000}, "triple": {"max": 25000, "min": 12000}}}], "region": "Cairo", "activities": [{"id": "pyramids_tour", "name": "Pyramids & Sphinx Tour", "price": 540, "perPerson": true}], "description": "Egypt's vibrant capital with pyramids and history"}
alexandria	Alexandria	Mediterranean pearl with Greco-Roman history	North Coast	/images/alexandria.jpg	{"id": "alexandria", "name": "Alexandria", "image": "/images/alexandria.jpg", "hotels": [{"id": "steigenberger_alex", "name": "Steigenberger Cecil Hotel", "category": "4-Star Historic", "features": ["Historic", "Sea views"], "childPolicy": "Family-friendly", "priceRanges": {"double": {"max": 8000, "min": 4000}, "single": {"max": 6000, "min": 3000}, "triple": {"max": 11000, "min": 5500}}}], "region": "North Coast", "activities": [{"id": "bibliotheca", "name": "Bibliotheca Alexandrina", "price": 170, "perPerson": true}], "description": "Mediterranean pearl with Greco-Roman history"}
fayoum	Fayoum Oasis	Natural waterfalls, Magic Lake, and whale fossils	Oasis	/images/fayoum.jpg	{"id": "fayoum", "name": "Fayoum Oasis", "image": "/images/fayoum.jpg", "hotels": [{"id": "lazib_inn", "name": "Lazib Inn Eco-lodge", "category": "Eco-Lodge", "features": ["Eco-lodge", "Organic farm"], "childPolicy": "Family-friendly", "priceRanges": {"double": {"max": 4000, "min": 2800}, "single": {"max": 3000, "min": 2000}, "triple": {"max": 6000, "min": 4000}}}], "region": "Oasis", "activities": [{"id": "waterfalls", "name": "Wadi El-Rayan Waterfalls", "price": 100, "perPerson": true}], "description": "Natural waterfalls, Magic Lake, and whale fossils"}
marsa_alam	Marsa Alam	Hidden paradise with dugongs and dolphins	Red Sea	/images/marsa-alam.jpg	{"id": "marsa_alam", "name": "Marsa Alam", "image": "/images/marsa-alam.jpg", "hotels": [], "region": "Red Sea", "activities": [], "description": "Hidden paradise with dugongs and dolphins"}
ain_sokhna	Ain Sokhna	Weekend getaway near Cairo	Red Sea	/images/ain-sokhna.jpg	{"id": "ain_sokhna", "name": "Ain Sokhna", "image": "/images/ain-sokhna.jpg", "hotels": [], "region": "Red Sea", "activities": [], "description": "Weekend getaway near Cairo"}
siwa	Siwa Oasis	Remote desert oasis with ancient culture	Western Desert	/images/siwa.jpg	{"id": "siwa", "name": "Siwa Oasis", "image": "/images/siwa.jpg", "hotels": [], "region": "Western Desert", "activities": [], "description": "Remote desert oasis with ancient culture"}
sahel	Sahel (North Coast)	Summer beach destination	North Coast	/images/sahel.jpg	{"id": "sahel", "name": "Sahel (North Coast)", "image": "/images/sahel.jpg", "hotels": [], "region": "North Coast", "activities": [], "description": "Summer beach destination"}
\.


--
-- TOC entry 4954 (class 0 OID 35903)
-- Dependencies: 223
-- Data for Name: packages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.packages (id, title, image) FROM stdin;
1	sharm el sheikh	sharm.jpeg
2	cairo	cairo.jpeg
3	dahab	dahab.jpeg
4	aswan	aswan.jpeg
5	luxor	Luxor.jpg
6	snorkeling	snorkeling.jpg
7	saint catherine	saint-catherine.jpg
8	hurghada	hurghada.jpg
9	fayoum	fayoum.jpg
10	alexandria	alexandria.jpg
11	ain sokhna	ain-sokhna.jpg
\.


--
-- TOC entry 4958 (class 0 OID 35927)
-- Dependencies: 227
-- Data for Name: password_resets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_resets (id, user_id, token, expires_at, used, created_at) FROM stdin;
\.


--
-- TOC entry 4949 (class 0 OID 35865)
-- Dependencies: 218
-- Data for Name: subscribers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscribers (id, email, subscribed_at, status, ip_address, user_agent, created_at, updated_at) FROM stdin;
1	test@example.com	2026-04-30 15:00:11.114427	active	\N	\N	2026-04-30 15:00:11.114427	2026-04-30 15:00:11.114427
2	ghaddabnessrine@gmail.com	2026-05-03 10:10:40.158636	active	::1	PostmanRuntime/7.53.0	2026-05-03 10:10:40.158636	2026-05-03 10:10:40.158636
\.


--
-- TOC entry 4951 (class 0 OID 35882)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password, first_name, last_name, reset_token, reset_token_expires, created_at, updated_at) FROM stdin;
1	user@example.com	$2a$10$BTHq6N2mxjaTkZDiuNQ4u.zhMQcTSaS5gEUd9THd4/qAOYwTgbqru	John	Doe	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6InJlc2V0IiwiaWF0IjoxNzc3ODA2NzA1LCJleHAiOjE3Nzc4MTAzMDV9.BSeHqRRbOeCmuyzJ0VTBtJrgIyW7r4KMEpqgKh9m-4M	2026-05-03 12:11:45.123509+00	2026-05-03 11:10:27.045501+00	2026-05-03 11:10:27.045501+00
2	ghaddabnessrine@gmail.com	$2a$10$kPNaeaowawWzgAVeuc.Wce4y12FkQmzz/eKxdjJZnWrDKjj9pUKW2	Nessrine	Ghaddab	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidHlwZSI6InJlc2V0IiwiaWF0IjoxNzc3OTg2MDczLCJleHAiOjE3Nzc5ODk2NzN9.3WGi_kMv7zPxjzsp_5Jc35jutGoii-k3RcE--zcoMs8	2026-05-05 14:01:13.017327+00	2026-05-05 08:02:51.077025+00	2026-05-05 08:02:51.077025+00
4	ghaddabnessrine4@gmail.com	$2a$10$m.XLJWN2bQsr./TjSZ9tuu79SzOrbUSeySFoqTPnsnoVTeuD/.Sd.	Nessrine	Ghaddab	\N	\N	2026-05-05 13:51:15.196707+00	2026-05-05 13:51:15.196707+00
5	amrreyad6@gmail.com	$2a$10$ugi/W.hOpZUAjQ8qGhQi2Od92rUCbNDK/xkgpUxByb6ICrCoSxG2i	mr amr	User	529305	2026-05-05 14:57:56.215976+00	2026-05-05 14:46:21.431892+00	2026-05-05 14:46:21.431892+00
3	siwarsaad2000@gmail.com	$2a$10$PaXrFhPacB6PfO79zj/EU.4PdD5otKwmfE9C0axJQv6m0/5cYhP8a	Nessrine	Ghaddab	\N	\N	2026-05-05 13:01:54.557888+00	2026-05-05 13:01:54.557888+00
\.


--
-- TOC entry 4969 (class 0 OID 0)
-- Dependencies: 224
-- Name: bookings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bookings_id_seq', 1, false);


--
-- TOC entry 4970 (class 0 OID 0)
-- Dependencies: 222
-- Name: packages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.packages_id_seq', 1, false);


--
-- TOC entry 4971 (class 0 OID 0)
-- Dependencies: 226
-- Name: password_resets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.password_resets_id_seq', 1, false);


--
-- TOC entry 4972 (class 0 OID 0)
-- Dependencies: 217
-- Name: subscribers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subscribers_id_seq', 2, true);


--
-- TOC entry 4973 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 5, true);


--
-- TOC entry 4796 (class 2606 OID 35923)
-- Name: bookings bookings_booking_reference_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_booking_reference_key UNIQUE (booking_reference);


--
-- TOC entry 4798 (class 2606 OID 35921)
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- TOC entry 4792 (class 2606 OID 35901)
-- Name: destinations destinations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destinations
    ADD CONSTRAINT destinations_pkey PRIMARY KEY (id);


--
-- TOC entry 4794 (class 2606 OID 35910)
-- Name: packages packages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.packages
    ADD CONSTRAINT packages_pkey PRIMARY KEY (id);


--
-- TOC entry 4801 (class 2606 OID 35934)
-- Name: password_resets password_resets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_pkey PRIMARY KEY (id);


--
-- TOC entry 4783 (class 2606 OID 35878)
-- Name: subscribers subscribers_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscribers
    ADD CONSTRAINT subscribers_email_key UNIQUE (email);


--
-- TOC entry 4785 (class 2606 OID 35876)
-- Name: subscribers subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscribers
    ADD CONSTRAINT subscribers_pkey PRIMARY KEY (id);


--
-- TOC entry 4788 (class 2606 OID 35893)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4790 (class 2606 OID 35891)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4799 (class 1259 OID 35924)
-- Name: idx_bookings_reference; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bookings_reference ON public.bookings USING btree (booking_reference);


--
-- TOC entry 4781 (class 1259 OID 35879)
-- Name: idx_subscribers_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subscribers_email ON public.subscribers USING btree (email);


--
-- TOC entry 4786 (class 1259 OID 35894)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 4802 (class 2606 OID 35935)
-- Name: password_resets fk_password_reset_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT fk_password_reset_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2026-05-06 11:32:13

--
-- PostgreSQL database dump complete
--

