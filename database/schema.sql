-- =============================================================================
-- Product Management System — Database Schema
-- PostgreSQL 17
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for trigram-based full-text search


-- ---------------------------------------------------------------------------
-- Utility: updated_at auto-update trigger function
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =============================================================================
-- Table: users
-- =============================================================================
CREATE TABLE users (
  id                UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              VARCHAR(255)  NOT NULL,
  email             VARCHAR(255)  NOT NULL UNIQUE,
  password_hash     TEXT          NOT NULL,
  profile_image_url TEXT,
  is_active         BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email        ON users (email);
CREATE INDEX idx_users_created_at   ON users (created_at DESC);
-- partial index: covers the common login query (email + is_active = TRUE)
CREATE INDEX idx_users_email_active ON users (email) WHERE is_active = TRUE;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================================
-- Table: categories
-- =============================================================================
CREATE TABLE categories (
  id          UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID          NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  name        VARCHAR(255)  NOT NULL,
  description TEXT,
  image_url   TEXT,
  is_active   BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_user_id      ON categories (user_id);
CREATE INDEX idx_categories_name         ON categories (name);
CREATE INDEX idx_categories_created_at   ON categories (created_at DESC);
-- partial index: active-category listing per user
CREATE INDEX idx_categories_user_active  ON categories (user_id) WHERE is_active = TRUE;

-- trigram index for category name search
CREATE INDEX idx_categories_name_trgm    ON categories USING GIN (name gin_trgm_ops);

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================================
-- Table: products
-- =============================================================================
CREATE TABLE products (
  id          UUID           PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID           NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  category_id UUID                       REFERENCES categories (id) ON DELETE SET NULL,
  name        VARCHAR(255)   NOT NULL,
  description TEXT,
  image_url           TEXT,
  thumbnail_image_url TEXT,
  price               NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  quantity    INTEGER        NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  is_active   BOOLEAN        NOT NULL DEFAULT TRUE,
  is_featured BOOLEAN        NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_user_id          ON products (user_id);
CREATE INDEX idx_products_category_id      ON products (category_id);
CREATE INDEX idx_products_name             ON products (name);
CREATE INDEX idx_products_price            ON products (price);
CREATE INDEX idx_products_created_at       ON products (created_at DESC);
-- partial indexes: active-product listing and category filtering
CREATE INDEX idx_products_user_active      ON products (user_id)      WHERE is_active = TRUE;
CREATE INDEX idx_products_category_active  ON products (category_id)  WHERE is_active = TRUE;
-- partial index: featured active products per user
CREATE INDEX idx_products_featured         ON products (user_id)      WHERE is_featured = TRUE AND is_active = TRUE;

-- trigram index for product name + description search
CREATE INDEX idx_products_name_trgm        ON products USING GIN (name gin_trgm_ops);
CREATE INDEX idx_products_description_trgm ON products USING GIN (description gin_trgm_ops);

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================================
-- Table: product_images
-- =============================================================================
CREATE TABLE product_images (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id    UUID        NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  image_url     TEXT        NOT NULL,
  display_order INTEGER     NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_images_product_id ON product_images (product_id);
CREATE INDEX idx_product_images_order      ON product_images (product_id, display_order ASC);


-- =============================================================================
-- Table: search_history
-- =============================================================================
CREATE TABLE search_history (
  id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  search_term VARCHAR(500) NOT NULL,
  searched_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_search_history_user_id     ON search_history (user_id);
CREATE INDEX idx_search_history_searched_at ON search_history (searched_at DESC);
CREATE INDEX idx_search_history_term        ON search_history (search_term);
-- composite: latest searches per user
CREATE INDEX idx_search_history_user_time   ON search_history (user_id, searched_at DESC);