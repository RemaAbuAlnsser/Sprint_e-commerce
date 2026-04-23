--
-- PostgreSQL database dump
--

\restrict vaucUYtjCMcggoxQ8j7gRL3mdAYmbyGq4uLiJgaUSUH1Rltmq2kUH52KFtGfbMU

-- Dumped from database version 17.7
-- Dumped by pg_dump version 17.7

-- Started on 2026-01-11 19:59:44


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

--
-- TOC entry 4 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- TOC entry 5107 (class 0 OID 0)
-- Dependencies: 4
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 230 (class 1259 OID 19064)
-- Name: brands; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.brands (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    logo_url text
);


ALTER TABLE public.brands OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 18969)
-- Name: cart_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cart_id uuid,
    variant_id uuid,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.cart_items OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 18954)
-- Name: carts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.carts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    email character varying(255),
    region character varying(50) DEFAULT 'sa'::character varying,
    currency_code character varying(10) DEFAULT 'SAR'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.carts OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 18895)
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    handle character varying(255) NOT NULL,
    description text,
    image_url text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    banner_image text
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 19033)
-- Name: discounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.discounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(50) NOT NULL,
    type character varying(20) DEFAULT 'percentage'::character varying,
    value integer NOT NULL,
    usage_limit integer,
    usage_count integer DEFAULT 0,
    starts_at timestamp without time zone,
    ends_at timestamp without time zone,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.discounts OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 19015)
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid,
    variant_id uuid,
    title character varying(255) NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 18988)
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    display_id integer NOT NULL,
    cart_id uuid,
    user_id uuid,
    email character varying(255),
    shipping_address jsonb,
    billing_address jsonb,
    subtotal integer DEFAULT 0,
    shipping_total integer DEFAULT 0,
    tax_total integer DEFAULT 0,
    total integer DEFAULT 0,
    status character varying(20) DEFAULT 'pending'::character varying,
    payment_status character varying(20) DEFAULT 'awaiting'::character varying,
    fulfillment_status character varying(20) DEFAULT 'not_fulfilled'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 18987)
-- Name: orders_display_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orders_display_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_display_id_seq OWNER TO postgres;

--
-- TOC entry 5108 (class 0 OID 0)
-- Dependencies: 224
-- Name: orders_display_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_display_id_seq OWNED BY public.orders.display_id;


--
-- TOC entry 231 (class 1259 OID 19073)
-- Name: product_colors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_colors (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid,
    color_name character varying(100) NOT NULL,
    image_url text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.product_colors OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 18940)
-- Name: product_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_images (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid,
    url text NOT NULL,
    alt text,
    "position" integer DEFAULT 0
);


ALTER TABLE public.product_images OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 18924)
-- Name: product_variants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_variants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid,
    title character varying(255) NOT NULL,
    sku character varying(100),
    price integer DEFAULT 0 NOT NULL,
    compare_at_price integer,
    inventory_quantity integer DEFAULT 0,
    options jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.product_variants OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 18906)
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    subtitle character varying(255),
    description text,
    handle character varying(255) NOT NULL,
    thumbnail text,
    status character varying(20) DEFAULT 'draft'::character varying,
    category_id uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    brand_id uuid,
    connection_type character varying(20),
    show_in_latest boolean DEFAULT true,
    hover_image text
);


ALTER TABLE public.products OWNER TO postgres;

--
-- TOC entry 5109 (class 0 OID 0)
-- Dependencies: 219
-- Name: COLUMN products.connection_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.products.connection_type IS 'Product connection type: wired, wireless, or both';


--
-- TOC entry 228 (class 1259 OID 19045)
-- Name: regions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.regions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    currency_code character varying(10) NOT NULL,
    tax_rate numeric(5,2) DEFAULT 0
);


ALTER TABLE public.regions OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 19052)
-- Name: shipping_options; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shipping_options (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    region_id uuid,
    name character varying(100) NOT NULL,
    price integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.shipping_options OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 19149)
-- Name: site_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.site_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    setting_key character varying(255) NOT NULL,
    setting_value text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.site_settings OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 19105)
-- Name: stock_notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid,
    variant_id uuid,
    email character varying(255) NOT NULL,
    notified boolean DEFAULT false,
    notified_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.stock_notifications OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 19127)
-- Name: user_notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255) NOT NULL,
    product_id uuid,
    variant_id uuid,
    message text NOT NULL,
    read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_notifications OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 18883)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    role character varying(20) DEFAULT 'customer'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 4831 (class 2604 OID 18992)
-- Name: orders display_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN display_id SET DEFAULT nextval('public.orders_display_id_seq'::regclass);


--
-- TOC entry 5097 (class 0 OID 19064)
-- Dependencies: 230
-- Data for Name: brands; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.brands (id, name, created_at, logo_url) FROM stdin;
962c925b-1c0f-43be-9b26-37e0b1db2d13	Attack shark	2026-01-07 17:49:18.315082	\N
2f371802-3789-4c5b-bca9-ec06a59026f2	AULA	2026-01-07 17:49:18.315082	\N
1b15675d-a10c-4535-ba08-8189c8f18e8c	FIFINE	2026-01-07 17:49:18.315082	\N
60a4ae78-e8e8-4bc7-8ae4-8cd43692f3b0	IROK	2026-01-07 17:49:18.315082	\N
110d5798-a8a9-4852-bcf4-e4b960ab9f77	SCYROX	2026-01-07 17:49:18.315082	\N
c5e1fad6-69a8-4938-a13e-1ea85885c392	AJAZZ	2026-01-07 17:49:18.315082	/uploads/fcc98d4c-85f7-4178-8e05-2b5d088467c3.webp
4efe39c2-81b3-4b65-87ee-7dc37425d3e8	MADLIONS	2026-01-07 17:49:18.315082	/uploads/980651b9-8505-46c1-bf5f-6932dc6ea75d.png
26a631b7-dd29-4176-86ae-dd26001a861a	MONSGEEK	2026-01-07 17:49:18.315082	/uploads/f99b2971-be7b-447c-a70d-4b12eab342ba.png
3c1d04d7-c46f-434a-9190-057781d5be94	MCHOSE	2026-01-07 17:49:18.315082	/uploads/8c72cf3c-74fb-4ff4-bfa4-c1ee14965e8e.webp
7e849add-9fd7-4891-a7df-24f85b6cec72	VGN	2026-01-07 17:49:18.315082	/uploads/9e40334b-b665-48aa-89e6-299cfa59af2c.webp
ead6e311-eb1f-4baa-af19-183a49462fb9	XINMENG	2026-01-07 17:49:18.315082	/uploads/6923e475-87b4-4474-88a4-3f3fd0bf4e55.webp
\.


--
-- TOC entry 5090 (class 0 OID 18969)
-- Dependencies: 223
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_items (id, cart_id, variant_id, quantity, unit_price) FROM stdin;
\.


--
-- TOC entry 5089 (class 0 OID 18954)
-- Dependencies: 222
-- Data for Name: carts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.carts (id, user_id, email, region, currency_code, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5085 (class 0 OID 18895)
-- Dependencies: 218
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, handle, description, image_url, created_at, banner_image) FROM stdin;
b9b52127-f82f-4ff6-b1bc-dbf1977c3deb	Mouse	mouse	ماوسات ألعاب واحترافية	http://localhost:9000/uploads/c84ae225-ad51-4b3a-a524-ae66f74cecd6.jpg	2026-01-07 05:28:50.850889	\N
8b8d6aca-68e1-432c-9463-0a81b67251f2	Mousepad	mousepad		http://localhost:9000/uploads/6ccc9f52-ba5e-439a-a6dc-8ac9e7336062.jpeg	2026-01-08 08:35:41.221855	\N
ad320019-3b81-4f18-b93a-d01c9fe42399	Magnetic Keyboard	magnetic-keyboard	كيبوردات مغناطيسية	http://localhost:9000/uploads/c3a0ab76-c649-4cb2-9043-3f63b275ee90.png	2026-01-07 07:29:06.331479	http://localhost:9000/uploads/818c5a60-9857-4e51-b8b7-e6b2c4f24417.png
fb2fff41-8fc2-4a04-9670-cef65159a8b1	Headsets	headsets	سماعات 	http://localhost:9000/uploads/939caeb8-e74e-4c1d-af8f-ce2ea009737b.webp	2026-01-07 05:28:50.851271	\N
b562eeff-4934-4f51-b7e3-04731d15b6aa	Microphone	microphone	microphone	http://localhost:9000/uploads/74b5d4df-7e30-401b-973a-91a209819023.webp	2026-01-08 14:30:34.094736	\N
\.


--
-- TOC entry 5094 (class 0 OID 19033)
-- Dependencies: 227
-- Data for Name: discounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.discounts (id, code, type, value, usage_limit, usage_count, starts_at, ends_at, is_active, created_at) FROM stdin;
6aaeb0e5-2a81-48db-a719-37be0e92f5e4	WELCOME10	percentage	10	100	0	\N	\N	t	2026-01-07 05:28:50.861768
cb3c3d88-09e4-4c1f-9ba7-d77aa8e38f42	SAVE50	fixed	5000	50	0	\N	\N	t	2026-01-07 05:28:50.861768
\.


--
-- TOC entry 5093 (class 0 OID 19015)
-- Dependencies: 226
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, order_id, variant_id, title, quantity, unit_price) FROM stdin;
\.


--
-- TOC entry 5092 (class 0 OID 18988)
-- Dependencies: 225
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, display_id, cart_id, user_id, email, shipping_address, billing_address, subtotal, shipping_total, tax_total, total, status, payment_status, fulfillment_status, created_at) FROM stdin;
\.


--
-- TOC entry 5098 (class 0 OID 19073)
-- Dependencies: 231
-- Data for Name: product_colors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_colors (id, product_id, color_name, image_url, created_at) FROM stdin;
a3439f70-7aae-4208-9f40-2dc47f44ca3b	bd0bb138-6da9-4270-9974-40170f556613	أبيض	http://localhost:9000/uploads/62b8939c-f56d-4a78-8541-c89f09573995.jpeg	2026-01-08 07:23:59.355664
dfcb5c1a-141d-4482-9e67-0ed5da50cf9e	bd0bb138-6da9-4270-9974-40170f556613	أسود	http://localhost:9000/uploads/1e6619ff-bd31-4b41-9303-833fec911214.jpeg	2026-01-08 07:23:59.356604
3d58afca-9939-4c19-a3d3-34d2db532cb8	4ff5744d-677b-449b-81d0-721b6e110f4c	أسود	http://localhost:9000/uploads/64fb80a4-2fec-453e-a21f-81e368d77e82.jpeg	2026-01-08 07:26:28.462611
5750c092-b87a-46db-9d56-7787d81bb77c	4ff5744d-677b-449b-81d0-721b6e110f4c	أبيض	http://localhost:9000/uploads/d6e2eaab-4119-4a79-88d9-8931e415aa8a.jpeg	2026-01-08 07:26:28.46311
851877f4-eecb-465f-9a66-ccdb202d1251	14335549-6efd-40b2-ba4f-ba79d044b172	أسود	http://localhost:9000/uploads/db5c2de9-519d-4b2b-bc91-f7ac9ee4779b.webp	2026-01-08 08:15:37.571861
ff46dc9a-74db-4583-97ff-f3edb3b4482e	14335549-6efd-40b2-ba4f-ba79d044b172	أبيض	http://localhost:9000/uploads/906fbdd8-1f58-4965-8a5a-b3258ab9c9c7.jpeg	2026-01-08 08:15:37.572453
1ad3325d-4575-4813-a44f-5a343dc76e8b	e28a4821-9936-4551-8b78-4ff7db34b57b	أبيض	http://localhost:9000/uploads/a066a0da-5cb8-4966-9d49-bf7b328c86d5.webp	2026-01-08 08:15:44.891739
5dfb8eb8-b73a-4410-9dd7-d5d59e945e36	e28a4821-9936-4551-8b78-4ff7db34b57b	أسود	http://localhost:9000/uploads/2b914208-4f8c-4b80-a212-346f59c69ea5.jpeg	2026-01-08 08:15:44.892135
9c86b9c6-915b-4205-ad46-d2cb8f0abaec	529461e0-bc83-4d0e-afd5-81d42af6358e	أسود	http://localhost:9000/uploads/125648db-9768-458f-b3fd-12713926b808.webp	2026-01-08 08:18:59.704882
5b4ce9f9-a425-44ac-a193-2f6abb6b5e14	529461e0-bc83-4d0e-afd5-81d42af6358e	أبيض	http://localhost:9000/uploads/af3f3810-07a9-4108-a316-6defcffa1145.jpeg	2026-01-08 08:18:59.705267
62944155-6404-4b67-97d1-9fba4f91a8aa	902c9e63-8be4-4f4a-a57a-e86f4b4da94e	أسود	http://localhost:9000/uploads/65509ce3-2c5e-4038-8253-05432936b039.webp	2026-01-08 09:10:32.180808
06199f50-62ce-4523-a11d-f293259d3d24	7a7b11ce-cc3b-4caf-a953-a8abebd2561c	أسود	http://localhost:9000/uploads/e008cc6a-c1b6-4bf9-b509-5ef2c3808a05.webp	2026-01-08 09:14:21.837912
dd897322-58e2-46ec-91b9-7d4733c3eced	e28fcd21-4ce4-4e88-92c1-7bf62301e7f5	أسود	http://localhost:9000/uploads/6f7c7d80-d3f0-4484-a63c-eae69f47e9bb.jpeg	2026-01-08 09:17:58.17318
efeb988b-c040-4fe4-a178-a12f44117887	e28fcd21-4ce4-4e88-92c1-7bf62301e7f5	أبيض	http://localhost:9000/uploads/800859e4-ef0e-4a31-91aa-4b907fe28ec7.webp	2026-01-08 09:17:58.173579
50a4078d-aa05-480a-bc8c-c29e5b4f6699	03768ca9-e6bb-41fd-b221-4d997d8534a1	أبيض	http://localhost:9000/uploads/351a92dd-7383-4204-8559-94e63c383da8.jpg	2026-01-08 13:28:52.42815
ea435a94-6871-4f01-a25c-b28baa88a8fa	7f3083f4-7ec0-4ef1-9da0-d883b327ed80	أبيض	http://localhost:9000/uploads/a942dffa-8074-46f2-8247-73937450c3c3.webp	2026-01-08 14:20:48.522319
f222917b-de94-4dba-a3a4-d46ce8bbfc66	7f3083f4-7ec0-4ef1-9da0-d883b327ed80	أسود	http://localhost:9000/uploads/7fc6312d-77b2-4493-8e90-28a20f3a0bd5.jpeg	2026-01-08 14:20:48.522728
a9a3a191-096b-4080-9ba3-851d2fbc60e1	ae6f513e-3f30-4a70-abf9-8da282a9b156	أسود	http://localhost:9000/uploads/8d3dcdf2-3e74-45c1-8a58-7d5ceaf4c5d9.webp	2026-01-08 14:25:13.035585
805a6e74-4b99-4468-8682-2773f0e0c43a	ae6f513e-3f30-4a70-abf9-8da282a9b156	أبيض	http://localhost:9000/uploads/04bb745b-3eb0-4af9-90f0-e9dc87211371.jpeg	2026-01-08 14:25:13.03598
4f306b54-2eaa-4500-a871-7179d5f3e90e	183f73bc-3388-43a2-99d3-c0a8a3544aca	أسود	http://localhost:9000/uploads/1f1d1ef6-7c11-4e95-8fff-b130aaa47370.jpeg	2026-01-08 14:52:04.266352
916aeb2f-a7c7-4a85-98d5-49505e1e5f9b	2fc83eb1-932b-465a-9083-f3886615bd8b	أبيض	http://localhost:9000/uploads/ed5bb1f8-9677-4c12-8653-602cd8f226b7.jpeg	2026-01-08 14:56:51.585932
f3247d27-acdf-4cd4-99e1-d1fe068942c7	2fc83eb1-932b-465a-9083-f3886615bd8b	أسود	http://localhost:9000/uploads/00da84d6-8822-4ebc-8d59-8e2addc805f0.jpeg	2026-01-08 14:56:51.586363
e3b6f520-41d5-435c-815a-60f184daf730	bb69ba20-654e-4bc5-b7bc-ec15143ea04f	أبيض	http://localhost:9000/uploads/3be9d4fd-5a7f-4eac-bd61-80d6c35cf52b.jpeg	2026-01-10 01:38:53.44991
a2a51ef8-25b7-44a4-8435-24b966eced87	bb69ba20-654e-4bc5-b7bc-ec15143ea04f	أسود	http://localhost:9000/uploads/330aa1b7-41b7-451e-8330-21d635bc1aa5.webp	2026-01-10 01:38:53.450354
90d3e3cd-567d-4f2e-8bdd-fea7a853e423	f64a2f59-d33a-4c51-8adf-380519711a17	أسود	http://localhost:9000/uploads/7c87b00a-0366-41f4-9280-06bf71c942db.jpeg	2026-01-11 13:32:53.558339
a160d068-d9ae-48e0-9692-6a5c2f1426f6	f64a2f59-d33a-4c51-8adf-380519711a17	أبيض	http://localhost:9000/uploads/cea30e1f-0a0e-4051-a0dd-60af61452ded.jpeg	2026-01-11 13:32:53.55893
0616dd80-f8bb-4826-80ab-14036d023c2b	0ac2f59f-3f42-49d1-bc76-52b4625b1640	أسود	http://localhost:9000/uploads/3293de3a-95d5-47ac-9c44-3793045758f0.jpeg	2026-01-11 13:56:28.168403
6af44498-0ae2-4f32-ab4b-9ffe057e7e3c	0ac2f59f-3f42-49d1-bc76-52b4625b1640	أبيض	http://localhost:9000/uploads/8fba8633-6e0a-4204-8b25-475b237b7938.jpeg	2026-01-11 13:56:28.169156
\.


--
-- TOC entry 5088 (class 0 OID 18940)
-- Dependencies: 221
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_images (id, product_id, url, alt, "position") FROM stdin;
\.


--
-- TOC entry 5087 (class 0 OID 18924)
-- Dependencies: 220
-- Data for Name: product_variants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_variants (id, product_id, title, sku, price, compare_at_price, inventory_quantity, options, created_at) FROM stdin;
402b09fa-ab86-4faa-9d52-7639c2586298	908a83c1-8e0a-48d7-b9a5-c6dd0bbf9d77	افتراضي		1500	\N	5	\N	2026-01-08 08:56:04.13559
933d85b8-3e54-4747-b8c9-1ddc81a39390	7272d8ab-df08-4753-84a0-7a3212abfbd1	افتراضي		1200	\N	62	\N	2026-01-08 08:59:29.225838
30268946-424d-447e-b19b-ffe38097236a	7a7b11ce-cc3b-4caf-a953-a8abebd2561c	افتراضي		1000	\N	21	\N	2026-01-08 09:14:21.83608
2a2336c5-47b7-4819-a05a-b9bf5f4d02ef	ae6f513e-3f30-4a70-abf9-8da282a9b156	افتراضي		20000	\N	77	\N	2026-01-08 14:25:13.034044
319f494f-1209-488d-a998-cdb59e2b6e20	03768ca9-e6bb-41fd-b221-4d997d8534a1	افتراضي		10000	\N	23	\N	2026-01-08 13:28:52.426219
e3063dee-bf84-4bb1-9a45-2271616ba900	902c9e63-8be4-4f4a-a57a-e86f4b4da94e	افتراضي		15000	\N	7	\N	2026-01-08 09:10:32.178953
991391d7-38cb-4093-9839-28e540d61436	7f3083f4-7ec0-4ef1-9da0-d883b327ed80	افتراضي		20000	\N	31	\N	2026-01-08 14:20:48.520866
041eaf7f-53e5-4693-9c11-49af4517f243	bd0bb138-6da9-4270-9974-40170f556613	افتراضي		16000	\N	4	\N	2026-01-08 07:23:59.354561
5fe2dea7-db62-4cbb-98b2-442706b88aa0	4ff5744d-677b-449b-81d0-721b6e110f4c	افتراضي		4444	\N	22	\N	2026-01-08 07:26:28.461472
07dcb257-35ea-4163-9dc4-165310a035f7	bb69ba20-654e-4bc5-b7bc-ec15143ea04f	افتراضي		15000	\N	20	\N	2026-01-10 01:38:53.447487
1f16a156-ec90-4600-926f-17f18fc67d27	183f73bc-3388-43a2-99d3-c0a8a3544aca	افتراضي		30000	\N	2	\N	2026-01-08 14:52:04.264806
73197959-d607-42ae-9d81-7a270527c8a3	529461e0-bc83-4d0e-afd5-81d42af6358e	افتراضي		29000	\N	23	\N	2026-01-08 08:18:59.703951
47027b83-c879-4531-a7a6-5bc52066be7f	14335549-6efd-40b2-ba4f-ba79d044b172	افتراضي		24000	\N	20	\N	2026-01-08 08:15:37.571213
7b2ac04d-5752-498b-ac27-df5542672399	e28a4821-9936-4551-8b78-4ff7db34b57b	افتراضي		28000	\N	22	\N	2026-01-08 08:15:44.890912
14185a1b-4282-44ba-9e59-945bacf692a5	9a753370-0833-4e51-bb05-44f8b104d6b1	افتراضي		20000	\N	22	\N	2026-01-08 08:40:31.345757
973fac8e-8011-47f8-a018-1b6fdfd9e4fb	e28fcd21-4ce4-4e88-92c1-7bf62301e7f5	افتراضي		17000	\N	50	\N	2026-01-08 09:17:58.171589
98d7f46b-71a9-4faf-9d7b-2e510e851421	9fb8a761-0144-42dd-9ad4-132b0acbf707	افتراضي		20000	\N	22	\N	2026-01-08 08:50:18.698651
555b5f0a-5e31-4d27-aa51-d5c3bff8e84e	2fc83eb1-932b-465a-9083-f3886615bd8b	افتراضي		50000	\N	14	\N	2026-01-08 14:56:51.584906
c4135b0a-6289-49b3-a111-d33895a49b6b	1fe1283e-ab84-491d-b3f8-b5652f471126	افتراضي		12000	\N	34	\N	2026-01-08 08:52:30.587554
b9df7538-4860-46a0-8603-ab15a400a6a1	f64a2f59-d33a-4c51-8adf-380519711a17	افتراضي		40000	\N	4	\N	2026-01-11 13:32:53.556214
435ea2dc-e34b-454e-bcdc-97a34ea27494	0ac2f59f-3f42-49d1-bc76-52b4625b1640	افتراضي		10000	\N	3	{}	2026-01-08 14:28:32.328053
a7f32cd7-c594-45a1-946c-cd2441a4e131	f3535a83-30d3-4e57-8b59-e1b38b2315d8	افتراضي		2345	\N	10	{}	2026-01-10 03:51:08.827519
\.


--
-- TOC entry 5086 (class 0 OID 18906)
-- Dependencies: 219
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, title, subtitle, description, handle, thumbnail, status, category_id, created_at, updated_at, brand_id, connection_type, show_in_latest, hover_image) FROM stdin;
bd0bb138-6da9-4270-9974-40170f556613	Atk vxe mad r major	Atk	* المستشعر: PixArt PAW3950 بدقة عالية حتى ~42,000 DPI مع تتبع 750 IPS وتسارع 50 G  \n* الاتصال: سلكي USB-C + لاسلكي 2.4 GHz مع Dongle 8K لأداء سريع جدًا  \n* معدل الاستجابة (Polling Rate): حتى 8000 Hz في الوضع السلكي واللاسلكي  \n* الوزن: حوالي 36 غرام (خفيف جدًا)  \n* البطارية: ~200 mAh مع بطارية تدوم حتى ~130 ساعة حسب الاستخدام  \n* المفاتيح: Omron Optical (سريعة ودقيقة)  \n* عجلة التمرير: F-Switch E10A2 عالية الدقة  \n* التشطيب: طلاء Ice-Feel لملمس مريح وغير زلق  \n* الأبعاد: تقريبًا 120.1 × 63.2 × 38.1 مم  \n* التوافق: يدعم Windows/أنظمة عادية عبر التعريف أو الإعدادات المتاحة	atk2	http://localhost:9000/uploads/2a25e94a-108a-420c-a117-2f9363333700.jpeg	published	b9b52127-f82f-4ff6-b1bc-dbf1977c3deb	2026-01-08 07:23:59.345389	2026-01-08 07:23:59.345389	4efe39c2-81b3-4b65-87ee-7dc37425d3e8	wireless	t	\N
4ff5744d-677b-449b-81d0-721b6e110f4c	Scyrox v8	Scyrox	* المستشعر: PixArt PAW3950 حتى ~30,000 DPI\n* الاتصال: لاسلكي 2.4 GHz + سلكي USB-C (8K dongle مرفق)\n* معدل الاستجابة: حتى 8000 Hz (لاسلكي عالي الاستجابة)  \n* الوزن: حوالي 36 غرام (خفيف جدًا)  \n* التتبع: حتى 750 IPS وتسارع 50 G  \n* المفاتيح: Omron Optical عالية الإستجابة  \n* أزرار عددها: ~6 أزرار قابلة للبرمجة  \n* ارتفاع إلغاء التتبع (LOD): ~0.7–2 مم  \n* البطارية: ~250 mAh قابلة للشحن  \n* التوافق: Windows/أجهزة عادية مع برنامج ويب للتخصيص  \n* الأبعاد تقريبية: ~118 × 63 × 38 مم	Scyroxv8	http://localhost:9000/uploads/944e091c-660a-4146-80bd-8287468b9e22.jpeg	published	b9b52127-f82f-4ff6-b1bc-dbf1977c3deb	2026-01-07 15:12:25.574125	2026-01-08 07:26:28.457781	110d5798-a8a9-4852-bcf4-e4b960ab9f77	wireless	t	\N
e28a4821-9936-4551-8b78-4ff7db34b57b	Attack shark r82 	Magnetic Switch	•  التخطيط (Layout): 75% (80 مفتاح تقريبًا)، مع لوحة ألمنيوم.\n•  نوع المفاتيح (Switches): مفاتيح مغناطيسية Hall Effect (Linear)، hot-swappable (دعم تبديل المفاتيح، متوافق مع N-pole downward).\n•  نقطة التشغيل (Actuation Point): قابلة للتعديل من 0.1mm إلى 3.4mm.\n•  Rapid Trigger (RT): دقة 0.005mm، بدون dead zone.\n•  معدل الاستطلاع (Polling Rate): 8000Hz (8K حقيقي).\n•  معدل المسح (Scan Rate): 256KHz.\n•  الكمون (Latency): 0.08ms (منخفض جدًا).\n•  الاتصال: سلكي فقط (USB-C).\n•  الهيكل: 5 طبقات لتخميد الصوت (5-Layer Sound Dampening) لصوت ناعم وكريمي.\n•  الإضاءة: RGB كاملة (South-facing LEDs) مع تأثيرات قابلة للتخصيص.	attack-shark-r82	http://localhost:9000/uploads/afb291b8-9d94-457f-bc45-e67778fbaf73.webp	published	ad320019-3b81-4f18-b93a-d01c9fe42399	2026-01-08 08:08:45.814309	2026-01-08 08:15:44.888961	962c925b-1c0f-43be-9b26-37e0b1db2d13	wireless	t	\N
e28fcd21-4ce4-4e88-92c1-7bf62301e7f5	Attack shark x3 max	Attack shark	* المستشعر: PixArt PAW3950 بدقة عالية حتى 42,000 DPI\n* الاتصال: ثلاثي الأوضاع — سلكي USB-C + 2.4 GHz لاسلكي + Bluetooth 5.2\n* الوزن: حوالي 49 غرام (خفيف جدًا)\n* عمر البطارية: حتى 200 ساعة في الوضع اللاسلكي\n* معدل الاستجابة (Polling Rate): 1000 Hz (سلكي/لاسلكي)\n* السحب/التتبع: 750 IPS وتسارع 50 G\n* المفاتيح: Omron Optical بعمر حتى 100 مليون نقرة\n* كفوف الانزلاق (Feet): PTFE 100% لأداء انزلاق سلس\n* دعم تخصيص الإعدادات عبر برنامج/سائق (DPI، أزرار، Polling Rate)\n* شكل مريح يدعم قبضة المخلب، الإصبع، والكف	attack-shark-x3-max	http://localhost:9000/uploads/b20bdf09-959d-4358-8e76-a39b1451ba81.webp	published	b9b52127-f82f-4ff6-b1bc-dbf1977c3deb	2026-01-08 07:29:29.149177	2026-01-08 09:17:58.166199	962c925b-1c0f-43be-9b26-37e0b1db2d13	wireless	t	\N
14335549-6efd-40b2-ba4f-ba79d044b172	Ajazz ak820 max ultra	Magnetic Switch	•  التخطيط (Layout): 75% (82 مفتاح) مع knob للتحكم في الصوت والإضاءة.\n•  نوع المفاتيح (Switches): مفاتيح مغناطيسية Hall Effect (Linear، hot-swappable).\n•  نقطة التشغيل (Actuation Point): قابلة للتعديل من 0.1mm إلى 4.0mm (دقة عالمية 0.01mm).\n•  Rapid Trigger (RT): مدعوم بدقة 0.01mm، مع Dynamic Keystrokes (DKS) لإجراءات متعددة per key.\n•  معدل الاستطلاع (Polling Rate): 8000Hz (8K) في السلكي والـ2.4GHz، وأقل في البلوتوث.\n•  معدل المسح (Scan Rate): عالي (حوالي 128K لكل مفتاح).\n•  الاتصال (Connectivity): ثلاثي الوضع - سلكي USB-C، لاسلكي 2.4GHz، بلوتوث 5.0.\n•  البطارية: سعة كبيرة (حوالي 8000mAh لاستخدام طويل).\n•  الهيكل: Gasket Mount مع تخميد صوت متعدد الطبقات لصوت كريمي وناعم.\n•  الإضاءة: RGB كاملة per-key (South-facing LEDs) مع تأثيرات متعددة.	ajazz-ak820-max-ultra	http://localhost:9000/uploads/7085899c-746a-4694-92d1-bd746221c2b0.webp	published	ad320019-3b81-4f18-b93a-d01c9fe42399	2026-01-08 08:15:37.568689	2026-01-08 08:15:37.568689	c5e1fad6-69a8-4938-a13e-1ea85885c392	wireless	t	\N
03768ca9-e6bb-41fd-b221-4d997d8534a1	Attack Shark X6	Mouse	•  التخطيط (Layout): 75% (82 مفتاح) مع knob للتحكم في الصوت والإضاءة.\n•  نوع المفاتيح (Switches): مفاتيح مغناطيسية Hall Effect (Linear، hot-swappable).\n•  نقطة التشغيل (Actuation Point): قابلة للتعديل من 0.1mm إلى 4.0mm (دقة عالمية 0.01mm).\n•  Rapid Trigger (RT): مدعوم بدقة 0.01mm، مع Dynamic Keystrokes (DKS) لإجراءات متعددة per key.\n•  معدل الاستطلاع (Polling Rate): 8000Hz (8K) في السلكي والـ2.4GHz، وأقل في البلوتوث.\n•  معدل المسح (Scan Rate): عالي (حوالي 128K لكل مفتاح).\n•  الاتصال (Connectivity): ثلاثي الوضع - سلكي USB-C، لاسلكي 2.4GHz، بلوتوث 5.0.\n•  البطارية: سعة كبيرة (حوالي 8000mAh لاستخدام طويل).\n•  الهيكل: Gasket Mount مع تخميد صوت متعدد الطبقات لصوت كريمي وناعم.\n•  الإضاءة: RGB كاملة per-key (South-facing LEDs) مع تأثيرات متعددة.	attack-shark-x6	http://localhost:9000/uploads/7e288744-b97b-413f-9686-e029bd9ab7e2.jpg	published	b9b52127-f82f-4ff6-b1bc-dbf1977c3deb	2026-01-08 09:16:14.260538	2026-01-10 03:44:53.833043	962c925b-1c0f-43be-9b26-37e0b1db2d13	wireless	f	http://localhost:9000/uploads/781c94e5-1dee-4eed-9a44-aede72af1ec7.webp
f3535a83-30d3-4e57-8b59-e1b38b2315d8	FIFINE A6	Microphone	المواصفات الرئيسية:\n•  نوع الميكروفون: كوندنسر (Condenser) مع نمط كارديويد (Cardioid) – يركز على الصوت الأمامي ويقلل الضوضاء الجانبية.\n•  نطاق التردد: 60 هرتز - 18 كيلو هرتز.\n•  الحساسية: -40 ديسيبل (±3 ديسيبل).\n•  دقة التسجيل: حتى 24 بت / 192 كيلو هرتز (في بعض الإصدارات).\n•  التوصيل: USB (plug-and-play، بدون درايفرات).\n•  إضاءة RGB: تلقائية (تتغير لوحدها، لا تحكم كامل، وتُطفأ عند الكتم).\n•  أزرار تحكم: زر لمس علوي للكتم السريع (tap-to-mute)، عجلة gain لضبط الحساسية.\n•  إكسسوارات مرفقة (حسب الإصدار):\n\t•  A6V: ترايبود مكتبي صغير، shock mount، pop filter معدني.\n\t•  A6T: ذراع boom arm، pop filter، shock mount.\n•  التوافق: PC (ويندوز/ماك)، PS4/PS5 (جزئيًا)، غير مثالي لـXbox أو الهواتف.	fifine-a6	http://localhost:9000/uploads/3544613c-5e69-47c7-99dc-9167788df40d.webp	published	b562eeff-4934-4f51-b7e3-04731d15b6aa	2026-01-08 14:59:09.832836	2026-01-11 14:10:10.155967	1b15675d-a10c-4535-ba08-8189c8f18e8c	wired	t	http://localhost:9000/uploads/fa96d160-3c76-44f1-9e9e-19dde108422f.webp
529461e0-bc83-4d0e-afd5-81d42af6358e	Ajazz ak820 max plus	 Magnetic Switch	الاسم الكامل: Ajazz AK820 Max plus HE Magnetic Switch Keyboard.\n•  التخطيط (Layout): 75% (82 مفتاح) مع knob معدني متعدد الوظائف (تحكم في الصوت، الإضاءة، والوضع).\n•  نوع المفاتيح (Switches): مفاتيح مغناطيسية Hall Effect (Linear، factory-lubed، hot-swappable).\n•  نقطة التشغيل (Actuation Point): قابلة للتعديل من 0.1mm إلى 4.0mm بدقة 0.01mm (Global accuracy).\n•  Rapid Trigger (RT): مدعوم كاملاً مع دقة عالية، بدون dead zone.\n•  ميزات إضافية للمفاتيح: Dynamic Keystrokes (DKS) لإجراءات متعددة per key، Mod Tap (MT)، Toggle Key، SOCD (في بعض التحديثات).\n•  معدل الاستطلاع (Polling Rate):\n\t•  8000Hz (8K) في الوضع السلكي.\n\t•  8000Hz أو 1000Hz في 2.4GHz (حسب الإصدار، بعض يدعم 8K كامل).\n\t•  125Hz في البلوتوث.\n•  الكمون (Latency): منخفض جدًا (~0.125ms في الوضع الأمثل).\n•  الاتصال (Connectivity): ثلاثي الوضع - سلكي USB-C، لاسلكي 2.4GHz، بلوتوث 5.0.\n•  البطارية: 4000mAh إلى 8000mAh (حسب الإصدار Tri-mode، استخدام طويل يصل أسابيع).\n•  الهيكل (Structure): Gasket Mount مع تخميد صوت متعدد الطبقات (creamy sound)، FR4 plate أو flex-cut PCB.\n•  الإضاءة: RGB كاملة per-key (South-facing LEDs) مع تأثيرات قابلة للتخصيص.\n•  الشاشة: 0.85-inch TFT screen لعرض المعلومات (البطارية، الوضع، التخصيص).\n•  الأبعاد: حوالي 333 × 145 × 44 mm.\n•  الوزن: حوالي 770g إلى 900g (حسب الإصدار).\n•  ميزات أخرى:\n\t•  Hot-swappable PCB (تبديل المفاتيح بسهولة).\n\t•  NKRO (Full N-Key Rollover).\n\t•  برنامج تخصيص عبر Web Driver مع ذاكرة onboard (دعم firmware updates).\n\t•  كي كابس: PBT Cherry Profile.\n\t•  توافق: Windows، Mac، Linux.\n\t•  صوت: كريمي وناعم بفضل الـ gasket وتخميد الصوت.	ajazz-ak820-max-plus	http://localhost:9000/uploads/0c829278-9521-4184-8018-4196908c414c.webp	published	ad320019-3b81-4f18-b93a-d01c9fe42399	2026-01-08 08:18:37.598777	2026-01-08 08:18:59.701042	c5e1fad6-69a8-4938-a13e-1ea85885c392	wireless	t	\N
9a753370-0833-4e51-bb05-44f8b104d6b1	Mousepad 4mm waterproof	Mousepad	اسم المنتج: ماوس باد ألعاب ومكتب كبير مقاوم للماء\nالحجم: 900 × 400 مم (90 × 40 سم)\nالسماكة: 4 مم\nالخامة:\n•  السطح العلوي: قماش ناعم عالي الجودة (Micro-woven cloth) لانزلاق سلس ودقيق للماوس.\n•  القاعدة: مطاط طبيعي مضاد للانزلاق (Non-slip rubber base) لثبات كامل على المكتب.\nالمميزات الرئيسية:\n•  مقاوم للماء والسوائل: سطح مقاوم للماء 100%، سهل التنظيف بمسحه بقطعة قماش مبللة (لا يتأثر بالانسكابات).\n•  أطراف مخيطة: حواف مخيطة بدقة لمنع التقشر أو التلف مع الاستخدام الطويل.\n•  مساحة واسعة: تغطي مساحة كافية للماوس + الكيبورد + جزء من المكتب، مثالي للجيمنج والعمل المكتبي.\n•  راحة عالية: سماكة 4 مم توفر دعم مريح للمعصم واليد أثناء الاستخدام الطويل.\n•  دقة عالية: سطح محسن لجميع أنواع الماوسات (Optical & Laser sensors).\n•  غير قابل للانزلاق: قاعدة مطاطية قوية تمنع الحركة حتى في الجيمنج السريع.\n\nالاستخدام: مثالي للألعاب التنافسية، العمل المكتبي، وحماية سطح المكتب.\nالتوافق: يناسب جميع أنواع الماوسات والكيبوردات.	mousepad-4mm-waterproof1	http://localhost:9000/uploads/dacfb37a-e978-47a7-b736-68cd1f390cab.webp	published	8b8d6aca-68e1-432c-9463-0a81b67251f2	2026-01-08 08:40:07.006954	2026-01-08 08:40:31.340163	4efe39c2-81b3-4b65-87ee-7dc37425d3e8		t	\N
7f3083f4-7ec0-4ef1-9da0-d883b327ed80	ATK M1 Mercury	Headset	� نوع: سماعة ألعاب over-ear (تغطي الأذن)\n📶 اتصال بثلاث طرق:\n\t•\tلاسلكي 2.4 GHz (تأخير منخفض ~13 ms)\n\t•\tBluetooth 5.3\n\t•\tسلكي USB-C / 3.5mm 📊 صوت:\n\t•\tسماعات 50 mm\n\t•\tصوت محيطي 7.1 افتراضي للألعاب 📢 ميكروفون: مزوّد بخاصية ENC لإلغاء الضوضاء 🔋 بطارية: حتى حوالي 60 ساعة تشغيل 🎮 راحة: وسائد مريحة وتصميم خفيف 📱 توافق: PC / PS4 / PS5 / Nintendo / هواتف وغيرها	atk-m1-mercury	http://localhost:9000/uploads/935aca61-bfa2-4567-a581-f052a38d70a3.webp	published	fb2fff41-8fc2-4a04-9670-cef65159a8b1	2026-01-08 14:19:18.326038	2026-01-08 14:20:48.516446	962c925b-1c0f-43be-9b26-37e0b1db2d13	both	t	\N
1fe1283e-ab84-491d-b3f8-b5652f471126	Night Mousepad	 4mm waterproof	اسم المنتج: ماوس باد ألعاب ومكتب كبير مقاوم للماء\nالحجم: 900 × 400 مم (90 × 40 سم)\nالسماكة: 4 مم\nالخامة:\n•  السطح العلوي: قماش ناعم عالي الجودة (Micro-woven cloth) لانزلاق سلس ودقيق للماوس.\n•  القاعدة: مطاط طبيعي مضاد للانزلاق (Non-slip rubber base) لثبات كامل على المكتب.\nالمميزات الرئيسية:\n•  مقاوم للماء والسوائل: سطح مقاوم للماء 100%، سهل التنظيف بمسحه بقطعة قماش مبللة (لا يتأثر بالانسكابات).\n•  أطراف مخيطة: حواف مخيطة بدقة لمنع التقشر أو التلف مع الاستخدام الطويل.\n•  مساحة واسعة: تغطي مساحة كافية للماوس + الكيبورد + جزء من المكتب، مثالي للجيمنج والعمل المكتبي.\n•  راحة عالية: سماكة 4 مم توفر دعم مريح للمعصم واليد أثناء الاستخدام الطويل.\n•  دقة عالية: سطح محسن لجميع أنواع الماوسات (Optical & Laser sensors).\n•  غير قابل للانزلاق: قاعدة مطاطية قوية تمنع الحركة حتى في الجيمنج السريع.\n\nالاستخدام: مثالي للألعاب التنافسية، العمل المكتبي، وحماية سطح المكتب.\nالتوافق: يناسب جميع أنواع الماوسات والكيبوردات.	night-mousepad	http://localhost:9000/uploads/71849bc5-dc8c-4311-93f7-3bf442324333.webp	published	8b8d6aca-68e1-432c-9463-0a81b67251f2	2026-01-08 08:46:28.390306	2026-01-08 08:52:30.584398	4efe39c2-81b3-4b65-87ee-7dc37425d3e8		f	\N
9fb8a761-0144-42dd-9ad4-132b0acbf707	Ninga Mousepad 	4mm waterproof	اسم المنتج: ماوس باد ألعاب ومكتب كبير مقاوم للماء\nالحجم: 900 × 400 مم (90 × 40 سم)\nالسماكة: 4 مم\nالخامة:\n•  السطح العلوي: قماش ناعم عالي الجودة (Micro-woven cloth) لانزلاق سلس ودقيق للماوس.\n•  القاعدة: مطاط طبيعي مضاد للانزلاق (Non-slip rubber base) لثبات كامل على المكتب.\nالمميزات الرئيسية:\n•  مقاوم للماء والسوائل: سطح مقاوم للماء 100%، سهل التنظيف بمسحه بقطعة قماش مبللة (لا يتأثر بالانسكابات).\n•  أطراف مخيطة: حواف مخيطة بدقة لمنع التقشر أو التلف مع الاستخدام الطويل.\n•  مساحة واسعة: تغطي مساحة كافية للماوس + الكيبورد + جزء من المكتب، مثالي للجيمنج والعمل المكتبي.\n•  راحة عالية: سماكة 4 مم توفر دعم مريح للمعصم واليد أثناء الاستخدام الطويل.\n•  دقة عالية: سطح محسن لجميع أنواع الماوسات (Optical & Laser sensors).\n•  غير قابل للانزلاق: قاعدة مطاطية قوية تمنع الحركة حتى في الجيمنج السريع.\n\nالاستخدام: مثالي للألعاب التنافسية، العمل المكتبي، وحماية سطح المكتب.\nالتوافق: يناسب جميع أنواع الماوسات والكيبوردات.	ninga-mousepad	http://localhost:9000/uploads/4278be86-06fd-4874-a37b-af81ca62c1cc.webp	published	8b8d6aca-68e1-432c-9463-0a81b67251f2	2026-01-08 08:43:29.937514	2026-01-08 08:50:18.695006	4efe39c2-81b3-4b65-87ee-7dc37425d3e8		f	\N
908a83c1-8e0a-48d7-b9a5-c6dd0bbf9d77	Demon Slayer Mousepad	4mm waterproof	اسم المنتج: ماوس باد ألعاب ومكتب كبير مقاوم للماء\nالحجم: 900 × 400 مم (90 × 40 سم)\nالسماكة: 4 مم\nالخامة:\n•  السطح العلوي: قماش ناعم عالي الجودة (Micro-woven cloth) لانزلاق سلس ودقيق للماوس.\n•  القاعدة: مطاط طبيعي مضاد للانزلاق (Non-slip rubber base) لثبات كامل على المكتب.\nالمميزات الرئيسية:\n•  مقاوم للماء والسوائل: سطح مقاوم للماء 100%، سهل التنظيف بمسحه بقطعة قماش مبللة (لا يتأثر بالانسكابات).\n•  أطراف مخيطة: حواف مخيطة بدقة لمنع التقشر أو التلف مع الاستخدام الطويل.\n•  مساحة واسعة: تغطي مساحة كافية للماوس + الكيبورد + جزء من المكتب، مثالي للجيمنج والعمل المكتبي.\n•  راحة عالية: سماكة 4 مم توفر دعم مريح للمعصم واليد أثناء الاستخدام الطويل.\n•  دقة عالية: سطح محسن لجميع أنواع الماوسات (Optical & Laser sensors).\n•  غير قابل للانزلاق: قاعدة مطاطية قوية تمنع الحركة حتى في الجيمنج السريع.\n\nالاستخدام: مثالي للألعاب التنافسية، العمل المكتبي، وحماية سطح المكتب.\nالتوافق: يناسب جميع أنواع الماوسات والكيبوردات.	demon-slayer-mousepad	http://localhost:9000/uploads/7cb89f90-4dfe-477d-b79a-2b0cc53755be.webp	published	8b8d6aca-68e1-432c-9463-0a81b67251f2	2026-01-08 08:56:04.131998	2026-01-08 08:56:04.131998	4efe39c2-81b3-4b65-87ee-7dc37425d3e8		f	\N
7272d8ab-df08-4753-84a0-7a3212abfbd1	Samurai Mousepad 	4mm waterproof	اسم المنتج: ماوس باد ألعاب ومكتب كبير مقاوم للماء\nالحجم: 900 × 400 مم (90 × 40 سم)\nالسماكة: 4 مم\nالخامة:\n•  السطح العلوي: قماش ناعم عالي الجودة (Micro-woven cloth) لانزلاق سلس ودقيق للماوس.\n•  القاعدة: مطاط طبيعي مضاد للانزلاق (Non-slip rubber base) لثبات كامل على المكتب.\nالمميزات الرئيسية:\n•  مقاوم للماء والسوائل: سطح مقاوم للماء 100%، سهل التنظيف بمسحه بقطعة قماش مبللة (لا يتأثر بالانسكابات).\n•  أطراف مخيطة: حواف مخيطة بدقة لمنع التقشر أو التلف مع الاستخدام الطويل.\n•  مساحة واسعة: تغطي مساحة كافية للماوس + الكيبورد + جزء من المكتب، مثالي للجيمنج والعمل المكتبي.\n•  راحة عالية: سماكة 4 مم توفر دعم مريح للمعصم واليد أثناء الاستخدام الطويل.\n•  دقة عالية: سطح محسن لجميع أنواع الماوسات (Optical & Laser sensors).\n•  غير قابل للانزلاق: قاعدة مطاطية قوية تمنع الحركة حتى في الجيمنج السريع.\n\nالاستخدام: مثالي للألعاب التنافسية، العمل المكتبي، وحماية سطح المكتب.\nالتوافق: يناسب جميع أنواع الماوسات والكيبوردات.	samurai-mousepad	http://localhost:9000/uploads/183fb8c8-f1e2-4704-89b3-309d46e2fbb1.webp	published	8b8d6aca-68e1-432c-9463-0a81b67251f2	2026-01-08 08:59:29.221876	2026-01-08 08:59:29.221876	4efe39c2-81b3-4b65-87ee-7dc37425d3e8		f	\N
902c9e63-8be4-4f4a-a57a-e86f4b4da94e	Mad HE 68	 Magnetic Switch Keyboard	•  التخطيط (Layout): 75% (82 مفتاح) مع knob للتحكم في الصوت والإضاءة.\n•  نوع المفاتيح (Switches): مفاتيح مغناطيسية Hall Effect (Linear، hot-swappable).\n•  نقطة التشغيل (Actuation Point): قابلة للتعديل من 0.1mm إلى 4.0mm (دقة عالمية 0.01mm).\n•  Rapid Trigger (RT): مدعوم بدقة 0.01mm، مع Dynamic Keystrokes (DKS) لإجراءات متعددة per key.\n•  معدل الاستطلاع (Polling Rate): 8000Hz (8K) في السلكي والـ2.4GHz، وأقل في البلوتوث.\n•  معدل المسح (Scan Rate): عالي (حوالي 128K لكل مفتاح).\n•  الاتصال (Connectivity): ثلاثي الوضع - سلكي USB-C، لاسلكي 2.4GHz، بلوتوث 5.0.\n•  البطارية: سعة كبيرة (حوالي 8000mAh لاستخدام طويل).\n•  الهيكل: Gasket Mount مع تخميد صوت متعدد الطبقات لصوت كريمي وناعم.\n•  الإضاءة: RGB كاملة per-key (South-facing LEDs) مع تأثيرات متعددة.	mad-he-68	http://localhost:9000/uploads/48c55f4c-cf90-4acc-beaa-e25fdd6e9e66.webp	published	ad320019-3b81-4f18-b93a-d01c9fe42399	2026-01-08 09:08:15.631251	2026-01-08 09:10:32.173412	4efe39c2-81b3-4b65-87ee-7dc37425d3e8	wireless	t	\N
7a7b11ce-cc3b-4caf-a953-a8abebd2561c	G PRO Superlight	Mouse 	•  التخطيط (Layout): 75% (82 مفتاح) مع knob للتحكم في الصوت والإضاءة.\n•  نوع المفاتيح (Switches): مفاتيح مغناطيسية Hall Effect (Linear، hot-swappable).\n•  نقطة التشغيل (Actuation Point): قابلة للتعديل من 0.1mm إلى 4.0mm (دقة عالمية 0.01mm).\n•  Rapid Trigger (RT): مدعوم بدقة 0.01mm، مع Dynamic Keystrokes (DKS) لإجراءات متعددة per key.\n•  معدل الاستطلاع (Polling Rate): 8000Hz (8K) في السلكي والـ2.4GHz، وأقل في البلوتوث.\n•  معدل المسح (Scan Rate): عالي (حوالي 128K لكل مفتاح).\n•  الاتصال (Connectivity): ثلاثي الوضع - سلكي USB-C، لاسلكي 2.4GHz، بلوتوث 5.0.\n•  البطارية: سعة كبيرة (حوالي 8000mAh لاستخدام طويل).\n•  الهيكل: Gasket Mount مع تخميد صوت متعدد الطبقات لصوت كريمي وناعم.\n•  الإضاءة: RGB كاملة per-key (South-facing LEDs) مع تأثيرات متعددة.	g-pro-superlight	http://localhost:9000/uploads/ee62c262-3d81-43b0-ac4e-08aab4aafe76.webp	published	b9b52127-f82f-4ff6-b1bc-dbf1977c3deb	2026-01-08 09:14:21.832582	2026-01-08 09:14:21.832582	ead6e311-eb1f-4baa-af19-183a49462fb9	wireless	t	\N
ae6f513e-3f30-4a70-abf9-8da282a9b156	Fifine H9	Headset	\nالنوع والاستخدام\n\n\t•\tسماعة رأس سلكية للألعاب (Over-Ear) مناسبة للـ كمبيوتر وأجهزة اللعب مثل PS4/PS5 وXbox وNintendo وSwitch وحتى هواتف بدعم 3.5mm.  \n🔊 \nالصوت\n\n\n\t•\tتأتي بصوت محيطي 7.1 افتراضي يعطي إحساس أوسع في الألعاب.  \n\t•\tمحركات 50 مم قوية للصوت مع تفاصيل جيدة في الألعاب والأفلام.  \n🎤 \nالميكروفون\n\t•\tميكروفون قابل للإزالة مع تصميم مرن يسهّل التحكم به.  \n\t•\tالصوت واضح لتواصل مع الفريق أثناء اللعب أو في المكالمات.  \n🎧 \nالراحة والتصميم\n\t•\tمريح للّعب الطويل بفضل وسائد الأذن الناعمة وعصابة رأس قابلة للتعديل.  \n\t•\tخفيف الوزن نسبيًا لتحمّل جلسات لعب مطوّلة من دون تعب.  \n🔌 \nالاتصال والتحكم\n\n\n\t•\tتوصيل USB و3.5mm (مع وحدة تحكم USB) يعني توافق عالي مع أجهزة مختلفة.  \n\t•\tوحدة التحكم الخارجية تسهّل تعديل مستوى الصوت وكتم الميكروفون دون الدخول لإعدادات الجهاز.  \n💡 \nمميزات إضافية\n\t•\tعزل بسيط للضوضاء بسبب تصميم السماعة المغلق.	fifine-h9	http://localhost:9000/uploads/60311c9b-dd44-47eb-8438-808dbbd58d14.webp	published	fb2fff41-8fc2-4a04-9670-cef65159a8b1	2026-01-08 14:23:32.195596	2026-01-08 14:25:13.029293	1b15675d-a10c-4535-ba08-8189c8f18e8c	wired	f	\N
183f73bc-3388-43a2-99d3-c0a8a3544aca	FIFINE AM6	Microphone	المواصفات الرئيسية:\n•  نوع الميكروفون: كوندنسر (Condenser) مع نمط التقاط صوتي كارديويد (Cardioid) – يركز على الصوت الأمامي ويقلل الضوضاء الجانبية/الخلفية بشكل جيد.\n•  نطاق التردد: 70 هرتز - 20 كيلو هرتز.\n•  الحساسية: -42 ديسيبل (±3 ديسيبل).\n•  دقة التسجيل: 48 كيلو هرتز / 16-24 بت (حسب المراجعات).\n•  التوصيل: USB-C إلى USB-A (كابل مرفق، plug-and-play بدون درايفرات).\n•  منفذ مراقبة: جاك 3.5 مم لسماع الصوت مباشرة بدون تأخير (zero-latency monitoring).\n•  إضاءة RGB: قابلة للتغيير (ألوان متعددة أو إيقاف عبر زر).\n•  أزرار تحكم:\n\t•  زر لمس علوي للكتم السريع (touch mute) مع إشارة ضوئية.\n\t•  عجلة أمامية لتوازن الصوت بين اللعبة والشات (Game/Chat Balance) – ميزة رائعة للجيمرز، تحول الميك إلى جهازين صوتيين (FIFINE Game وFIFINE Chat).\n\t•  زر لتقليل الضوضاء (noise cancellation button).\n\t•  عجلات جانبية لضبط الـgain (حساسية الميك) وصوت السماعات.\n•  إكسسوارات مرفقة: قاعدة مكتبية، فلتر بوب معدني قابل للإزالة، كابل USB (هناك إصدار AM6T مع ذراع boom arm).\n•  التوافق: كمبيوتر (ويندوز/ماك)، PS4/PS5 (محدود)، غير مثالي لـXbox أو الهواتف مباشرة.	fifine-am6	http://localhost:9000/uploads/398879cf-274b-41de-8edc-43eb310b8a85.webp	published	b562eeff-4934-4f51-b7e3-04731d15b6aa	2026-01-08 14:35:17.905872	2026-01-08 14:52:04.259393	1b15675d-a10c-4535-ba08-8189c8f18e8c	wired	t	\N
2fc83eb1-932b-465a-9083-f3886615bd8b	FIFINE A8	Microphone	•  نوع الميكروفون: كوندنسر (Condenser) مع نمط كارديويد (Cardioid) – يلتقط الصوت من الأمام بشكل ممتاز ويقلل الضوضاء الجانبية.\n•  نطاق التردد: 50 هرتز - 20 كيلو هرتز.\n•  الحساسية: -40 ديسيبل (±3 ديسيبل).\n•  دقة التسجيل: 16 بت / 48 كيلو هرتز.\n•  التوصيل: USB-C (مع كابل إلى USB-A مرفق)، plug-and-play.\n•  منفذ مراقبة: جاك 3.5 مم (zero-latency monitoring).\n•  إضاءة RGB: متعددة الأوضاع (قوس قزح، ألوان ثابتة، ديناميكية، أو إيقاف) مع زر تحكم خلفي.\n•  أزرار تحكم: زر لمس علوي للكتم (touch mute) مع إضاءة حمراء عند الكتم، عجلة gain أمامية لضبط الحساسية، زر RGB.\n•  إكسسوارات مرفقة: shock mount مطاطي، pop filter معدني قابل للإزالة، قاعدة مكتبية، كابل USB (هناك إصدار A8T مع boom arm).\n•  التوافق: PC (ويندوز/ماك)، PS4/PS5 (جزئيًا)، غير مثالي لـXbox أو الهواتف.	fifine-a8	http://localhost:9000/uploads/d1427251-7fe8-46b4-9cc7-d862faf3dbad.webp	published	b562eeff-4934-4f51-b7e3-04731d15b6aa	2026-01-08 14:53:50.148182	2026-01-08 14:56:51.581575	1b15675d-a10c-4535-ba08-8189c8f18e8c	wired	f	\N
0ac2f59f-3f42-49d1-bc76-52b4625b1640	Fifine H6	Headsets	 نوع: سماعة ألعاب سلكية\n🔊 صوت محيطي (عادة 7.1 افتراضي)\n🎤 ميكروفون مدمج واضح للمكالمات والألعاب\n🔌 اتصال: USB (لتشغيل الصوت والتحكم بسهولة)\n🪶 راحة جيدة للاستخدام الطويل\n	fifine-h6	http://localhost:9000/uploads/0f41e5af-a33e-441d-83d5-4ff4b49cd075.webp	published	fb2fff41-8fc2-4a04-9670-cef65159a8b1	2026-01-08 14:27:49.593746	2026-01-11 13:56:28.147913	1b15675d-a10c-4535-ba08-8189c8f18e8c	wired	t	
bb69ba20-654e-4bc5-b7bc-ec15143ea04f	VGN neon 75 pro	Vgn	•  التخطيط (Layout) — 75% (حوالي 80-82 مفتاح).\n•  نوع المفاتيح (Switches) — مفاتيح مغناطيسية Hall Effect (مثل Thanos Magnetic Switch أو مشابه في إصدارات Pro)، تدعم Rapid Trigger بدقة تصل إلى 0.005mm.\n•  الاتصال (Connectivity) — ثلاثي الوضع: سلكي (USB-C)، لاسلكي 2.4GHz، وبلوتوث 5.0.\n•  الهيكل (Structure) — Gasket Mount لتجربة كتابة ناعمة وصوت محسن.\n•  الإضاءة (Backlighting) — RGB كامل مع تأثيرات نيون ديناميكية وقابلة للتخصيص.\n•  معدل الاستطلاع (Polling Rate) — يصل إلى 8000Hz (8K).\n•  الكمون (Latency) — منخفض جدًا (حوالي 0.1ms).\n•  الدقة (Precision) — 0.005mm للـ Rapid Trigger.\n•  البطارية — سعة كبيرة (غالبًا 4000mAh أو أكثر في الإصدارات اللاسلكية).\n•  التوافق — Windows / MacOS / Linux.	vgn-neon-75-pro	http://localhost:9000/uploads/5e3735ce-ceba-496b-8cd6-0fa6f66b085a.webp	published	ad320019-3b81-4f18-b93a-d01c9fe42399	2026-01-08 07:55:51.198575	2026-01-10 01:38:53.441319	7e849add-9fd7-4891-a7df-24f85b6cec72	wireless	t	\N
f64a2f59-d33a-4c51-8adf-380519711a17	Fifine AM8	Microphone	•  نوع الميكروفون: كوندنسر (Condenser) مع نمط التقاط صوتي كارديويد (Cardioid) – يركز على الصوت من الأمام ويقلل الضوضاء الجانبية والخلفية.\n•  نطاق التردد: 50 هرتز - 20 كيلو هرتز.\n•  الحساسية: -40 ديسيبل (±3 ديسيبل).\n•  نسبة الإشارة إلى الضوضاء (S/N Ratio): أكثر من 70 ديسيبل.\n•  دقة التسجيل: 16 بت / 48 كيلو هرتز.\n•  التوصيل: USB-C (مع محول إلى USB-A مرفق)، plug-and-play (لا يحتاج درايفرات).\n•  منفذ مراقبة: جاك 3.5 مم لسماع الصوت مباشرة بدون تأخير (low-latency monitoring).\n•  إضاءة RGB: قابلة للتحكم (عدة أوضاع: قوس قزح، ألوان ثابتة، ديناميكية، أو إيقاف).\n•  أزرار تحكم: زر لمس للكتم (mute) مع إضاءة إشارة، عجلة لضبط مستوى الصوت (gain)، زر للتحكم في RGB.\n•  إكسسوارات مرفقة: حامل مضاد للاهتزاز (shock mount)، فلتر بوب (pop filter) قابل للإزالة، قاعدة مكتبية قابلة للتعديل، كابل USB.\n•  التوافق: كمبيوتر (ويندوز/ماك)، PS4/PS5 (غير متوافق مع Xbox أو معظم الهواتف مباشرة بسبب الطاقة للـRGB).	fifine-am8	http://localhost:9000/uploads/12c9669f-8909-4010-8d5c-392f012a10f6.webp	published	b562eeff-4934-4f51-b7e3-04731d15b6aa	2026-01-08 14:32:32.120005	2026-01-11 13:32:53.546647	1b15675d-a10c-4535-ba08-8189c8f18e8c	wired	t	
\.


--
-- TOC entry 5095 (class 0 OID 19045)
-- Dependencies: 228
-- Data for Name: regions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.regions (id, name, currency_code, tax_rate) FROM stdin;
ca38b8e5-44c6-4e36-ab02-3dda579dd124	Saudi Arabia	SAR	15.00
bba62af6-21b9-43ae-80fe-71c9b9cdf32e	United States	USD	0.00
3db6ade3-ada3-4363-a23a-5e2f7a6d4904	Saudi Arabia	SAR	15.00
eec7d109-69bb-4971-a8a8-5232eed0549d	United States	USD	0.00
\.


--
-- TOC entry 5096 (class 0 OID 19052)
-- Dependencies: 229
-- Data for Name: shipping_options; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shipping_options (id, region_id, name, price) FROM stdin;
\.


--
-- TOC entry 5101 (class 0 OID 19149)
-- Dependencies: 234
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.site_settings (id, setting_key, setting_value, created_at, updated_at) FROM stdin;
00b605fc-470b-4c3d-9f42-802a9b11a6e7	hero_background_dimensions	1920x1080	2026-01-11 14:42:32.070038	2026-01-11 14:42:32.070038
9bb48a9d-e902-4410-8f47-d47abf186f30	hero_background_image	/uploads/e0262c9e-9ef3-48da-9bb9-8e50110e909f.webp	2026-01-11 14:42:32.070038	2026-01-11 14:48:02.233962
\.


--
-- TOC entry 5099 (class 0 OID 19105)
-- Dependencies: 232
-- Data for Name: stock_notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_notifications (id, product_id, variant_id, email, notified, notified_at, created_at) FROM stdin;
e5177903-7b62-499d-964b-0f872d0a34d3	0ac2f59f-3f42-49d1-bc76-52b4625b1640	435ea2dc-e34b-454e-bcdc-97a34ea27494	zaidboom22@gmail.com	t	2026-01-11 13:56:28.165322	2026-01-11 13:45:42.341705
\.


--
-- TOC entry 5100 (class 0 OID 19127)
-- Dependencies: 233
-- Data for Name: user_notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_notifications (id, email, product_id, variant_id, message, read, created_at) FROM stdin;
63b863a8-de5b-4424-938f-7ed35aad0270	zaidboom22@gmail.com	0ac2f59f-3f42-49d1-bc76-52b4625b1640	435ea2dc-e34b-454e-bcdc-97a34ea27494	المنتج "Fifine H6" أصبح متوفراً الآن!	f	2026-01-11 13:56:28.162647
\.


--
-- TOC entry 5084 (class 0 OID 18883)
-- Dependencies: 217
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password_hash, first_name, last_name, role, created_at) FROM stdin;
3cfbdba9-af99-494c-aef3-b8bbf4367c29	zaid@magnetix.com	$2a$10$JO6WOEFX/W.Z6mFm7/niD..UA1CgYG/HqoTodrm4KGS0GVUnZvjuK	Zaid	Admin	admin	2026-01-07 05:28:50.845286
\.


--
-- TOC entry 5110 (class 0 OID 0)
-- Dependencies: 224
-- Name: orders_display_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_display_id_seq', 23, true);


--
-- TOC entry 4901 (class 2606 OID 19072)
-- Name: brands brands_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_name_key UNIQUE (name);


--
-- TOC entry 4903 (class 2606 OID 19070)
-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (id);


--
-- TOC entry 4887 (class 2606 OID 18976)
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4885 (class 2606 OID 18963)
-- Name: carts carts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (id);


--
-- TOC entry 4870 (class 2606 OID 18905)
-- Name: categories categories_handle_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_handle_key UNIQUE (handle);


--
-- TOC entry 4872 (class 2606 OID 18903)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 4893 (class 2606 OID 19044)
-- Name: discounts discounts_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discounts
    ADD CONSTRAINT discounts_code_key UNIQUE (code);


--
-- TOC entry 4895 (class 2606 OID 19042)
-- Name: discounts discounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discounts
    ADD CONSTRAINT discounts_pkey PRIMARY KEY (id);


--
-- TOC entry 4891 (class 2606 OID 19022)
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4889 (class 2606 OID 19004)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 4906 (class 2606 OID 19081)
-- Name: product_colors product_colors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_colors
    ADD CONSTRAINT product_colors_pkey PRIMARY KEY (id);


--
-- TOC entry 4883 (class 2606 OID 18948)
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- TOC entry 4881 (class 2606 OID 18934)
-- Name: product_variants product_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_pkey PRIMARY KEY (id);


--
-- TOC entry 4877 (class 2606 OID 18918)
-- Name: products products_handle_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_handle_key UNIQUE (handle);


--
-- TOC entry 4879 (class 2606 OID 18916)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- TOC entry 4897 (class 2606 OID 19051)
-- Name: regions regions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.regions
    ADD CONSTRAINT regions_pkey PRIMARY KEY (id);


--
-- TOC entry 4899 (class 2606 OID 19058)
-- Name: shipping_options shipping_options_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_options
    ADD CONSTRAINT shipping_options_pkey PRIMARY KEY (id);


--
-- TOC entry 4919 (class 2606 OID 19158)
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 4921 (class 2606 OID 19160)
-- Name: site_settings site_settings_setting_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_setting_key_key UNIQUE (setting_key);


--
-- TOC entry 4912 (class 2606 OID 19112)
-- Name: stock_notifications stock_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_notifications
    ADD CONSTRAINT stock_notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 4916 (class 2606 OID 19136)
-- Name: user_notifications user_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_notifications
    ADD CONSTRAINT user_notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 4866 (class 2606 OID 18894)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4868 (class 2606 OID 18892)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4904 (class 1259 OID 19093)
-- Name: idx_product_colors_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_colors_product_id ON public.product_colors USING btree (product_id);


--
-- TOC entry 4873 (class 1259 OID 19092)
-- Name: idx_products_brand_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_brand_id ON public.products USING btree (brand_id);


--
-- TOC entry 4874 (class 1259 OID 19098)
-- Name: idx_products_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_created_at ON public.products USING btree (created_at DESC);


--
-- TOC entry 4875 (class 1259 OID 19097)
-- Name: idx_products_show_in_latest; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_show_in_latest ON public.products USING btree (show_in_latest);


--
-- TOC entry 4917 (class 1259 OID 19161)
-- Name: idx_settings_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_settings_key ON public.site_settings USING btree (setting_key);


--
-- TOC entry 4907 (class 1259 OID 19125)
-- Name: idx_stock_notifications_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stock_notifications_email ON public.stock_notifications USING btree (email);


--
-- TOC entry 4908 (class 1259 OID 19126)
-- Name: idx_stock_notifications_notified; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stock_notifications_notified ON public.stock_notifications USING btree (notified);


--
-- TOC entry 4909 (class 1259 OID 19123)
-- Name: idx_stock_notifications_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stock_notifications_product_id ON public.stock_notifications USING btree (product_id);


--
-- TOC entry 4910 (class 1259 OID 19124)
-- Name: idx_stock_notifications_variant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stock_notifications_variant_id ON public.stock_notifications USING btree (variant_id);


--
-- TOC entry 4913 (class 1259 OID 19147)
-- Name: idx_user_notifications_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_notifications_email ON public.user_notifications USING btree (email);


--
-- TOC entry 4914 (class 1259 OID 19148)
-- Name: idx_user_notifications_read; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_notifications_read ON public.user_notifications USING btree (read);


--
-- TOC entry 4927 (class 2606 OID 18977)
-- Name: cart_items cart_items_cart_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.carts(id) ON DELETE CASCADE;


--
-- TOC entry 4928 (class 2606 OID 18982)
-- Name: cart_items cart_items_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id);


--
-- TOC entry 4926 (class 2606 OID 18964)
-- Name: carts carts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4931 (class 2606 OID 19023)
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 4932 (class 2606 OID 19100)
-- Name: order_items order_items_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE RESTRICT;


--
-- TOC entry 4929 (class 2606 OID 19005)
-- Name: orders orders_cart_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.carts(id);


--
-- TOC entry 4930 (class 2606 OID 19010)
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4934 (class 2606 OID 19082)
-- Name: product_colors product_colors_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_colors
    ADD CONSTRAINT product_colors_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 4925 (class 2606 OID 18949)
-- Name: product_images product_images_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 4924 (class 2606 OID 18935)
-- Name: product_variants product_variants_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 4922 (class 2606 OID 19087)
-- Name: products products_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id);


--
-- TOC entry 4923 (class 2606 OID 18919)
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- TOC entry 4933 (class 2606 OID 19059)
-- Name: shipping_options shipping_options_region_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_options
    ADD CONSTRAINT shipping_options_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.regions(id);


--
-- TOC entry 4935 (class 2606 OID 19113)
-- Name: stock_notifications stock_notifications_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_notifications
    ADD CONSTRAINT stock_notifications_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 4936 (class 2606 OID 19118)
-- Name: stock_notifications stock_notifications_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_notifications
    ADD CONSTRAINT stock_notifications_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE CASCADE;


--
-- TOC entry 4937 (class 2606 OID 19137)
-- Name: user_notifications user_notifications_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_notifications
    ADD CONSTRAINT user_notifications_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 4938 (class 2606 OID 19142)
-- Name: user_notifications user_notifications_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_notifications
    ADD CONSTRAINT user_notifications_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE CASCADE;


-- Completed on 2026-01-11 19:59:44

--
-- PostgreSQL database dump complete
--

\unrestrict vaucUYtjCMcggoxQ8j7gRL3mdAYmbyGq4uLiJgaUSUH1Rltmq2kUH52KFtGfbMU

