--
-- PostgreSQL database dump
--

\restrict UGYoinaVsnyrLzhl2baxdBtODTancj989mK5qbkb0aDcQVJC19TabKbldarZ5MS

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

-- Started on 2025-12-27 16:06:21

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
-- TOC entry 218 (class 1259 OID 25143)
-- Name: app_user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.app_user (
    user_id integer NOT NULL,
    name character varying(150) NOT NULL,
    email character varying(150) NOT NULL,
    password_hash text NOT NULL,
    role character varying(30) NOT NULL,
    team_id integer
);


ALTER TABLE public.app_user OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 25142)
-- Name: app_user_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.app_user_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.app_user_user_id_seq OWNER TO postgres;

--
-- TOC entry 4947 (class 0 OID 0)
-- Dependencies: 217
-- Name: app_user_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.app_user_user_id_seq OWNED BY public.app_user.user_id;


--
-- TOC entry 220 (class 1259 OID 25154)
-- Name: equipment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equipment (
    equipment_id integer NOT NULL,
    equipment_name character varying(150) NOT NULL,
    custom_id character varying(50),
    purchase_date date,
    warranty_expiry character varying(50),
    location character varying(150),
    status character varying(50) DEFAULT 'Active'::character varying,
    category character varying(50),
    maintenance_team character varying(50)
);


ALTER TABLE public.equipment OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 25153)
-- Name: equipment_equipment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.equipment_equipment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.equipment_equipment_id_seq OWNER TO postgres;

--
-- TOC entry 4948 (class 0 OID 0)
-- Dependencies: 219
-- Name: equipment_equipment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.equipment_equipment_id_seq OWNED BY public.equipment.equipment_id;


--
-- TOC entry 224 (class 1259 OID 25170)
-- Name: kanban_tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kanban_tasks (
    task_id integer NOT NULL,
    subject character varying(255),
    equipment_name character varying(150),
    equipment_custom_id character varying(50),
    due_date date,
    status character varying(20) DEFAULT 'New'::character varying
);


ALTER TABLE public.kanban_tasks OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 25169)
-- Name: kanban_tasks_task_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.kanban_tasks_task_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.kanban_tasks_task_id_seq OWNER TO postgres;

--
-- TOC entry 4949 (class 0 OID 0)
-- Dependencies: 223
-- Name: kanban_tasks_task_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.kanban_tasks_task_id_seq OWNED BY public.kanban_tasks.task_id;


--
-- TOC entry 222 (class 1259 OID 25161)
-- Name: maintenance_request; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenance_request (
    request_id integer NOT NULL,
    subject character varying(255) NOT NULL,
    description text,
    maintenance_date date NOT NULL,
    equipment_name character varying(100),
    category character varying(50),
    maintenance_team character varying(50),
    assigned_to_user_id integer,
    status character varying(20) DEFAULT 'Open'::character varying,
    request_type character varying(20) DEFAULT 'Corrective'::character varying,
    duration_hours numeric(5,2)
);


ALTER TABLE public.maintenance_request OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 25160)
-- Name: maintenance_request_request_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.maintenance_request_request_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.maintenance_request_request_id_seq OWNER TO postgres;

--
-- TOC entry 4950 (class 0 OID 0)
-- Dependencies: 221
-- Name: maintenance_request_request_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.maintenance_request_request_id_seq OWNED BY public.maintenance_request.request_id;


--
-- TOC entry 226 (class 1259 OID 25181)
-- Name: teams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teams (
    team_id integer NOT NULL,
    team_name character varying(50) NOT NULL
);


ALTER TABLE public.teams OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 25180)
-- Name: teams_team_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.teams_team_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.teams_team_id_seq OWNER TO postgres;

--
-- TOC entry 4951 (class 0 OID 0)
-- Dependencies: 225
-- Name: teams_team_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.teams_team_id_seq OWNED BY public.teams.team_id;


--
-- TOC entry 4762 (class 2604 OID 25146)
-- Name: app_user user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_user ALTER COLUMN user_id SET DEFAULT nextval('public.app_user_user_id_seq'::regclass);


--
-- TOC entry 4763 (class 2604 OID 25157)
-- Name: equipment equipment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment ALTER COLUMN equipment_id SET DEFAULT nextval('public.equipment_equipment_id_seq'::regclass);


--
-- TOC entry 4768 (class 2604 OID 25173)
-- Name: kanban_tasks task_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kanban_tasks ALTER COLUMN task_id SET DEFAULT nextval('public.kanban_tasks_task_id_seq'::regclass);


--
-- TOC entry 4765 (class 2604 OID 25164)
-- Name: maintenance_request request_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_request ALTER COLUMN request_id SET DEFAULT nextval('public.maintenance_request_request_id_seq'::regclass);


--
-- TOC entry 4770 (class 2604 OID 25184)
-- Name: teams team_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams ALTER COLUMN team_id SET DEFAULT nextval('public.teams_team_id_seq'::regclass);


--
-- TOC entry 4933 (class 0 OID 25143)
-- Dependencies: 218
-- Data for Name: app_user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.app_user (user_id, name, email, password_hash, role, team_id) FROM stdin;
1	test1	test1@gmail.com	1234	Manager	\N
\.


--
-- TOC entry 4935 (class 0 OID 25154)
-- Dependencies: 220
-- Data for Name: equipment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.equipment (equipment_id, equipment_name, custom_id, purchase_date, warranty_expiry, location, status, category, maintenance_team) FROM stdin;
1	screw driver	1	\N	10	ahmedabad	Active	\N	\N
2	chain saw	2	\N	11	adelaide	Active	\N	\N
\.


--
-- TOC entry 4939 (class 0 OID 25170)
-- Dependencies: 224
-- Data for Name: kanban_tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.kanban_tasks (task_id, subject, equipment_name, equipment_custom_id, due_date, status) FROM stdin;
1	oil leakage 	chain saw	2	2025-01-24	New
\.


--
-- TOC entry 4937 (class 0 OID 25161)
-- Dependencies: 222
-- Data for Name: maintenance_request; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance_request (request_id, subject, description, maintenance_date, equipment_name, category, maintenance_team, assigned_to_user_id, status, request_type, duration_hours) FROM stdin;
1	oil leakage 	There is an oil leakage in the chain saw as someone has added more oil in the chain saw and now oil is now flowing out of it and is unusable.	2025-08-15	\N	\N	\N	\N	Open	Corrective	\N
2	gas leakage 	gas leakage in gas cylinder	2025-12-27	\N	\N	\N	\N	Open	Corrective	\N
\.


--
-- TOC entry 4941 (class 0 OID 25181)
-- Dependencies: 226
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teams (team_id, team_name) FROM stdin;
1	General
2	Mechanics
3	Electricians
4	IT Support
\.


--
-- TOC entry 4952 (class 0 OID 0)
-- Dependencies: 217
-- Name: app_user_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.app_user_user_id_seq', 1, true);


--
-- TOC entry 4953 (class 0 OID 0)
-- Dependencies: 219
-- Name: equipment_equipment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.equipment_equipment_id_seq', 2, true);


--
-- TOC entry 4954 (class 0 OID 0)
-- Dependencies: 223
-- Name: kanban_tasks_task_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.kanban_tasks_task_id_seq', 1, true);


--
-- TOC entry 4955 (class 0 OID 0)
-- Dependencies: 221
-- Name: maintenance_request_request_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.maintenance_request_request_id_seq', 2, true);


--
-- TOC entry 4956 (class 0 OID 0)
-- Dependencies: 225
-- Name: teams_team_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.teams_team_id_seq', 4, true);


--
-- TOC entry 4772 (class 2606 OID 25152)
-- Name: app_user app_user_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_user
    ADD CONSTRAINT app_user_email_key UNIQUE (email);


--
-- TOC entry 4774 (class 2606 OID 25150)
-- Name: app_user app_user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_user
    ADD CONSTRAINT app_user_pkey PRIMARY KEY (user_id);


--
-- TOC entry 4776 (class 2606 OID 25159)
-- Name: equipment equipment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_pkey PRIMARY KEY (equipment_id);


--
-- TOC entry 4780 (class 2606 OID 25176)
-- Name: kanban_tasks kanban_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kanban_tasks
    ADD CONSTRAINT kanban_tasks_pkey PRIMARY KEY (task_id);


--
-- TOC entry 4778 (class 2606 OID 25168)
-- Name: maintenance_request maintenance_request_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_request
    ADD CONSTRAINT maintenance_request_pkey PRIMARY KEY (request_id);


--
-- TOC entry 4782 (class 2606 OID 25186)
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (team_id);


--
-- TOC entry 4784 (class 2606 OID 25188)
-- Name: teams teams_team_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_team_name_key UNIQUE (team_name);


--
-- TOC entry 4785 (class 2606 OID 25189)
-- Name: app_user app_user_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_user
    ADD CONSTRAINT app_user_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(team_id);


--
-- TOC entry 4786 (class 2606 OID 25195)
-- Name: maintenance_request maintenance_request_assigned_to_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_request
    ADD CONSTRAINT maintenance_request_assigned_to_user_id_fkey FOREIGN KEY (assigned_to_user_id) REFERENCES public.app_user(user_id);


-- Completed on 2025-12-27 16:06:21

--
-- PostgreSQL database dump complete
--

\unrestrict UGYoinaVsnyrLzhl2baxdBtODTancj989mK5qbkb0aDcQVJC19TabKbldarZ5MS

