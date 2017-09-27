--+++ SYNTAX STRUCTURE ++++++++++++++++++++++++++++++++++++++++++++

-- 1. Create DATABASE
-- 2. Create all TABLES
-- 4. TRIGGER FUNCTIONS
-- 3. Data QUERIES
                                                                   -- COMMENTS
--+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

-------------------------------------------------------------------
--##### 1. Create DATABASE ##########################################
-------------------------------------------------------------------

CREATE DATABASE cordat_v_0_1
  WITH OWNER = abrauser
       ENCODING = 'UTF8'
       TABLESPACE = pg_default
       LC_COLLATE = 'C'
       LC_CTYPE = 'C'
       CONNECTION LIMIT = -1;


-------------------------------------------------------------------
--##### 2. Create all TABLES (20/23 done) ###########################
-------------------------------------------------------------------

CREATE TABLE public.country
(
  code varchar(2) NOT NULL,
  name text,
  continent text,
  CONSTRAINT pk_country PRIMARY KEY (code)
)
WITH( OIDS=FALSE );
ALTER TABLE public.country
  OWNER TO abrauser;

-------------------------------------------------------------------
CREATE SEQUENCE climate_id_seq;                                    -- Sequenz für serial Datentyp

CREATE TABLE public.climate
(
  id integer NOT NULL DEFAULT nextval('climate_id_seq'::regclass), -- entspricht dem Datentyp serial
  koeppen_geiger_class text NOT NULL,
  description text,
  CONSTRAINT pk_climate PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.climate
  OWNER TO abrauser;

-------------------------------------------------------------------
CREATE SEQUENCE catchment_id_seq;

CREATE TABLE public.catchment
(
  id integer NOT NULL DEFAULT nextval('catchment_id_seq'::regclass),
  name text,
  area numeric,
  geology text,
  vegetation text,
  comment text,
  CONSTRAINT pk_catchment PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.catchment
  OWNER TO abrauser;

-------------------------------------------------------------------
CREATE SEQUENCE lake_id_seq;


CREATE TABLE public.lake
(
  id integer NOT NULL DEFAULT nextval('lake_id_seq'::regclass),
  name text NOT NULL,
  lat numeric NOT NULL,
  long numeric NOT NULL,
  surface_level numeric,
  max_depth numeric,
  surface_area numeric,
  conductivity_category varchar(20),
  climate_id integer,
  catchment_id integer,
  country_id varchar(2) NOT NULL,
  timestmp timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT pk_lake PRIMARY KEY (id),
  CONSTRAINT fk_catchment_id FOREIGN KEY (catchment_id)
      REFERENCES public.catchment (id) MATCH FULL
      ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT fk_climate_id FOREIGN KEY (climate_id)
      REFERENCES public.climate (id) MATCH FULL
      ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT fk_country_id FOREIGN KEY (country_id)
      REFERENCES public.country (code) MATCH FULL
      ON UPDATE NO ACTION ON DELETE NO ACTION
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.lake
  OWNER TO abrauser;

-------------------------------------------------------------------
CREATE SEQUENCE publication_id_seq;

CREATE TABLE public.publication
(
  id integer NOT NULL DEFAULT nextval('publication_id_seq'::regclass),
  authors text,
  year integer,
  title text,
  source text,
  weblink text,
  doi varchar(30),
  abstract text,
  contact_mail varchar (30),
  CONSTRAINT pk_publication PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.publication
  OWNER TO abrauser;

-------------------------------------------------------------------
CREATE SEQUENCE core_id_seq;

CREATE TABLE public.core
(
  id integer NOT NULL DEFAULT nextval('core_id_seq'::regclass),
  lake_id integer NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  core_type text,
  label text,
  water_depth numeric,
  depth_start numeric,
  depth_end numeric,
  core_length numeric,
  drill_date date,
  analysis_date date,
  age_depth_method text,
  c14 boolean,
  luminiscense boolean,
  varves boolean,
  pb_cs boolean,
  holocene_1_date_per_2000_a boolean,
  holocene_lower_age_resolution boolean,
  pre_holocene_1_date_per_5000_a boolean,
  pre_holocene_lower_age_resolution boolean,
  c14_sample_type_categories text,
  timestmp timestamp without time zone DEFAULT now(),
  CONSTRAINT pk_core PRIMARY KEY (id),
  CONSTRAINT fk_lake_id FOREIGN KEY (lake_id)
      REFERENCES public.lake (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.core
  OWNER TO abrauser;

-------------------------------------------------------------------
CREATE TABLE public.depth_age_model
(
  core_id integer NOT NULL,
  composit_depth numeric NOT NULL,
  modelled_age_min numeric,
  modelled_age_mean numeric,
  modelled_age_max numeric,
  modelled_error numeric,
  c14_age_min numeric,
  c14_age_mean numeric,
  c14_age_max numeric,
  c14_error numeric,
  CONSTRAINT pk_d_a_model PRIMARY KEY (core_id, composit_depth),
  CONSTRAINT fk_core_id FOREIGN KEY (core_id)
    REFERENCES public.core (id) MATCH FULL
    ON UPDATE NO ACTION ON DELETE CASCADE
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.depth_age_model
  OWNER TO abrauser;

-------------------------------------------------------------------
CREATE TABLE public.method
(
  label text, 
  category text, 
  description text,
  CONSTRAINT pk_method PRIMARY KEY (label)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.method
  OWNER TO abrauser;

-------------------------------------------------------------------
CREATE TABLE public.associate
(
  username text NOT NULL,
  password_not_safe_for_work text NOT NULL,
  first_name text NOT NULL,
  surname text NOT NULL,
  member_since timestamp without time zone NOT NULL DEFAULT now(),
  institution text NOT NULL,
  department text NOT NULL,
  specification text NOT NULL,
  contact_mail text NOT NULL,
  CONSTRAINT pk_associate PRIMARY KEY (username)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.associate
  OWNER TO abrauser;

-------------------------------------------------------------------
CREATE SEQUENCE record_id_seq;

CREATE TABLE public.record
(
    id integer NOT NULL DEFAULT nextval('record_id_seq'::regclass), 
    core_id integer,  
    date timestamp without time zone NOT NULL DEFAULT now(), 
    data_type integer, 
    data_description text, 
    publication_id integer,
    publish_data boolean, 
    method_label text, 
    measuring_error numeric,
    CONSTRAINT pk_record PRIMARY KEY (id),
    CONSTRAINT fk_core_id FOREIGN KEY (core_id)
        REFERENCES public.core (id) MATCH FULL
        ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT fk_method_label FOREIGN KEY (method_label)
        REFERENCES public.method (label) MATCH FULL
        ON UPDATE NO ACTION ON DELETE NO ACTION
)    
WITH (
  OIDS=FALSE
);
ALTER TABLE public.record
  OWNER TO abrauser;

-------------------------------------------------------------------
CREATE TABLE public.produces
(
    record_id integer NOT NULL,
    associate_username text,
    CONSTRAINT fk_record_id FOREIGN KEY (record_id)
        REFERENCES public.record (id) MATCH FULL
        ON UPDATE CASCADE ON DELETE NO ACTION,
    CONSTRAINT fk_associate_username FOREIGN KEY (associate_username)
        REFERENCES public.associate (username) MATCH FULL
        ON UPDATE NO ACTION ON DELETE NO ACTION   
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.produces
  OWNER TO abrauser;

-------------------------------------------------------------------  
CREATE TABLE organics 
(
  record_id integer NOT NULL, 
  depth numeric NOT NULL, 
  nitrogen_tn numeric, 
  total_carbon_tc numeric, 
  total_organic_carbon_toc numeric, 
  total_inorganic_carbon_tic numeric, 
  toc_tn_atomic_ratio numeric, 
  d13c_o_oo_vs numeric, 
  CONSTRAINT pk_organics PRIMARY KEY (record_id, depth),
  CONSTRAINT fk_record_id FOREIGN KEY (record_id)
      REFERENCES public.record (id) MATCH FULL
      ON UPDATE NO ACTION ON DELETE CASCADE  
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.organics
  OWNER TO abrauser;


-------------------------------------------------------------------  
--#--#--#--#--#--#--#- UNDER CONSTRUCTION --#--#--#--#--#--#--#--#--# 
--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#

--CREATE TABLE pollen {[ ……….]}

--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#
--#--#--#--#--#--#--#- UNDER CONSTRUCTION --#--#--#--#--#--#--#--#--#
--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#

--CREATE TABLE diatoms
--(
  --record_id, 
  --depth, 
  --diatom_type_1,
  --…, 
  --diatom_type_n
--)

--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#
--#--#--#--#--#--#--#- UNDER CONSTRUCTION --#--#--#--#--#--#--#--#--#
--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#

--CREATE TABLE diatom_type
--(
  --name,
  -- alternative_name1, 
  --diatom_type_1,
  --…, 
  --diatom_type_n
--)

--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#
--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#--#
-------------------------------------------------------------------  
CREATE TABLE diatom_statistics
(
  record_id integer NOT NULL, 
  depth numeric, 
  diatom_valve_concentration numeric, 
  diatom_acc_rate numeric, 
  diatom_chrysophyte_cysts_ratio numeric, 
  f_index numeric, 
  hills_n2_diversity_index numeric, 
  sedimentation_rate numeric, 
  CONSTRAINT pk_diatom_statistics PRIMARY KEY (record_id, depth),
  CONSTRAINT fk_record_id FOREIGN KEY (record_id)
      REFERENCES public.record (id) MATCH FULL
      ON UPDATE NO ACTION ON DELETE CASCADE   
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.diatom_statistics
  OWNER TO abrauser;

-------------------------------------------------------------------  
CREATE TABLE public.varves
(
  record_id integer NOT NULL,
  varve_number integer NOT NULL,
  composit_depth numeric,
  section_depth numeric,
  section_id character varying(5),
  varve_thick_total numeric,
  dark_layer_thick numeric,
  light_layer_thick numeric,
  diatom_thick numeric,
  calcite_thick numeric,
  org_mat_thick numeric,
  prec_per_a numeric,
  comment text,
  varve_age_bp numeric,
  CONSTRAINT pk_varves PRIMARY KEY (record_id, varve_number)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.varves
  OWNER TO abrauser;

-------------------------------------------------------------------  
CREATE TABLE alkanes 
(
  record_id integer NOT NULL, 
  depth numeric NOT NULL, 
  sample_id smallint NOT NULL, 
  c23 numeric, 
  c25 numeric, 
  c237 numeric, 
  c29 numeric, 
  c31 numeric,
  CONSTRAINT pk_alkanes PRIMARY KEY (record_id, depth),
   CONSTRAINT fk_record_id FOREIGN KEY (record_id)
      REFERENCES public.record (id) MATCH FULL
     ON UPDATE NO ACTION ON DELETE CASCADE   
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.alkanes
  OWNER TO abrauser;

------------------------------------------------------------------
CREATE TABLE tephra_layer
( 
record_id integer NOT NULL, 
depth_mean numeric NOT NULL, 
depth_top numeric, 
depth_bottom numeric, 
label varchar(20), 
thickness numeric, 
global_label varchar (20), 
comment text, 
CONSTRAINT pk_tephra_layer PRIMARY KEY (record_id, depth_mean),
  CONSTRAINT fk_record_id FOREIGN KEY (record_id)
    REFERENCES public.record (id) MATCH FULL
    ON UPDATE NO ACTION ON DELETE CASCADE   
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.tephra_layer
  OWNER TO abrauser;

------------------------------------------------------------------
CREATE TABLE isotopes 
(
  record_id integer NOT NULL, 
  depth numeric NOT NULL, 
  c23_dd numeric, 
  c23dd_std_dev numeric,  
  c29_dd numeric, 
  c29dd_std_dev numeric, 
  c31_dd numeric,
  c31dd_std_dev numeric,
  CONSTRAINT pk_isotopes PRIMARY KEY (record_id, depth),
    CONSTRAINT fk_record_id FOREIGN KEY (record_id)
     REFERENCES public.record (id) MATCH FULL
     ON UPDATE NO ACTION ON DELETE CASCADE   
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.isotopes
  OWNER TO abrauser;

------------------------------------------------------------------
CREATE TABLE xrf 
(
  record_id integer NOT NULL, 
  depth numeric NOT NULL, 
  cu_area numeric, 
  zn_area numeric, 
  ga_area numeric, 
  br_area numeric, 
  rb_area numeric, 
  sr_area numeric, 
  y_area numeric, 
  zr_area numeric, 
  pb_area numeric, 
  bi_area numeric, 
  zr_rb numeric, 
  zr_sr numeric, 
  sr_rb numeric, 
  CONSTRAINT pk_xrf PRIMARY KEY (record_id, depth),
    CONSTRAINT fk_record_id FOREIGN KEY (record_id)
     REFERENCES public.record (id) MATCH FULL
     ON UPDATE NO ACTION ON DELETE CASCADE     
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.xrf
  OWNER TO abrauser;

------------------------------------------------------------------
CREATE TABLE xrd 
(
  record_id integer NOT NULL,
  depth numeric, 
  total_intensity numeric, 
  pyrite_ti numeric, 
  quarz_ti numeric, 
  plagioclase_ti numeric, 
  k_feldspar_ti numeric, 
  mica_ti numeric, 
  kaolinite_plus_chlorite_ti numeric, 
  hornblende_ti numeric,
  CONSTRAINT pk_xrd PRIMARY KEY (record_id, depth),
    CONSTRAINT fk_record_id FOREIGN KEY (record_id)
     REFERENCES public.record (id) MATCH FULL
     ON UPDATE NO ACTION ON DELETE CASCADE 
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.xrd
  OWNER TO abrauser;

------------------------------------------------------------------
CREATE TABLE tephra_layer_global
(
  tephra_label varchar(20), 
  alternative_spelling1 varchar(20), 
  alternative_spelling2 varchar(20), 
  mean_age numeric, 
  min_age numeric, 
  max_age numeric,
  CONSTRAINT pk_tephra_layer_global PRIMARY KEY (tephra_label)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.tephra_layer_global
  OWNER TO abrauser;



------------------------------------------------------------------

--#################################################################
--##### 3. TRIGGER FUNCTIONS #########################################
--#################################################################


------------------------------------------------------------------
--##### 4. Data QUERIES #############################################
------------------------------------------------------------------