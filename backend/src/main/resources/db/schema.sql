-- ─── Master : country ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS country (
    id   BIGINT       NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_country_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Master : city ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS city (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    name       VARCHAR(100) NOT NULL,
    country_id BIGINT       NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_city_country FOREIGN KEY (country_id) REFERENCES country(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Core : customer ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customer (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    name          VARCHAR(120) NOT NULL,
    date_of_birth DATE         NOT NULL,
    nic_number    VARCHAR(20)  NOT NULL,
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_customer_nic (nic_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Mobile numbers ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mobile_number (
    id          BIGINT      NOT NULL AUTO_INCREMENT,
    customer_id BIGINT      NOT NULL,
    number      VARCHAR(30) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_mobile_customer FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Addresses ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS address (
    id             BIGINT       NOT NULL AUTO_INCREMENT,
    customer_id    BIGINT       NOT NULL,
    address_line1  VARCHAR(200),
    address_line2  VARCHAR(200),
    city_id        BIGINT,
    country_id     BIGINT,
    PRIMARY KEY (id),
    CONSTRAINT fk_address_customer FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE CASCADE,
    CONSTRAINT fk_address_city     FOREIGN KEY (city_id)     REFERENCES city(id),
    CONSTRAINT fk_address_country  FOREIGN KEY (country_id)  REFERENCES country(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Family members (self-referencing M:M) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS customer_family (
    customer_id       BIGINT NOT NULL,
    family_member_id  BIGINT NOT NULL,
    PRIMARY KEY (customer_id, family_member_id),
    CONSTRAINT fk_cf_customer FOREIGN KEY (customer_id)      REFERENCES customer(id) ON DELETE CASCADE,
    CONSTRAINT fk_cf_member   FOREIGN KEY (family_member_id) REFERENCES customer(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
