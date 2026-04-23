-- ─── Countries ────────────────────────────────────────────────────────────────
INSERT IGNORE INTO country (name) VALUES
('Afghanistan'),('Australia'),('Bangladesh'),('Canada'),('China'),
('France'),('Germany'),('India'),('Indonesia'),('Italy'),
('Japan'),('Malaysia'),('Maldives'),('Myanmar'),('Nepal'),
('Netherlands'),('New Zealand'),('Pakistan'),('Philippines'),('Russia'),
('Saudi Arabia'),('Singapore'),('South Korea'),('Spain'),('Sri Lanka'),
('Thailand'),('United Arab Emirates'),('United Kingdom'),('United States'),('Vietnam');

-- ─── Cities (Sri Lanka) ───────────────────────────────────────────────────────
INSERT IGNORE INTO city (name, country_id)
SELECT c.name, co.id FROM (
    SELECT 'Colombo'       AS name UNION ALL
    SELECT 'Kandy'         UNION ALL
    SELECT 'Galle'         UNION ALL
    SELECT 'Jaffna'        UNION ALL
    SELECT 'Negombo'       UNION ALL
    SELECT 'Anuradhapura'  UNION ALL
    SELECT 'Trincomalee'   UNION ALL
    SELECT 'Batticaloa'    UNION ALL
    SELECT 'Matara'        UNION ALL
    SELECT 'Kurunegala'
) c CROSS JOIN country co WHERE co.name = 'Sri Lanka';

-- ─── Cities (India) ───────────────────────────────────────────────────────────
INSERT IGNORE INTO city (name, country_id)
SELECT c.name, co.id FROM (
    SELECT 'Mumbai'    AS name UNION ALL
    SELECT 'Delhi'             UNION ALL
    SELECT 'Bangalore'         UNION ALL
    SELECT 'Chennai'           UNION ALL
    SELECT 'Kolkata'           UNION ALL
    SELECT 'Hyderabad'         UNION ALL
    SELECT 'Pune'              UNION ALL
    SELECT 'Ahmedabad'
) c CROSS JOIN country co WHERE co.name = 'India';

-- ─── Cities (United States) ───────────────────────────────────────────────────
INSERT IGNORE INTO city (name, country_id)
SELECT c.name, co.id FROM (
    SELECT 'New York'      AS name UNION ALL
    SELECT 'Los Angeles'           UNION ALL
    SELECT 'Chicago'               UNION ALL
    SELECT 'Houston'               UNION ALL
    SELECT 'San Francisco'         UNION ALL
    SELECT 'Seattle'               UNION ALL
    SELECT 'Boston'                UNION ALL
    SELECT 'Miami'
) c CROSS JOIN country co WHERE co.name = 'United States';

-- ─── Cities (United Kingdom) ──────────────────────────────────────────────────
INSERT IGNORE INTO city (name, country_id)
SELECT c.name, co.id FROM (
    SELECT 'London'      AS name UNION ALL
    SELECT 'Manchester'           UNION ALL
    SELECT 'Birmingham'           UNION ALL
    SELECT 'Edinburgh'            UNION ALL
    SELECT 'Glasgow'
) c CROSS JOIN country co WHERE co.name = 'United Kingdom';

-- ─── Cities (Australia) ───────────────────────────────────────────────────────
INSERT IGNORE INTO city (name, country_id)
SELECT c.name, co.id FROM (
    SELECT 'Sydney'    AS name UNION ALL
    SELECT 'Melbourne'          UNION ALL
    SELECT 'Brisbane'           UNION ALL
    SELECT 'Perth'              UNION ALL
    SELECT 'Adelaide'
) c CROSS JOIN country co WHERE co.name = 'Australia';

-- ─── Cities (UAE) ─────────────────────────────────────────────────────────────
INSERT IGNORE INTO city (name, country_id)
SELECT c.name, co.id FROM (
    SELECT 'Dubai'      AS name UNION ALL
    SELECT 'Abu Dhabi'           UNION ALL
    SELECT 'Sharjah'
) c CROSS JOIN country co WHERE co.name = 'United Arab Emirates';
