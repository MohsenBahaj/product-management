-- =============================================================================
-- Migration 001: Add thumbnail_image_url, is_featured, and product_images table
-- Safe to run on an existing database — all statements use IF NOT EXISTS / IF EXISTS.
-- =============================================================================

-- 1. Add is_featured to products (Task 4)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Add thumbnail_image_url to products (Task 5)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS thumbnail_image_url TEXT;

-- 3. Create product_images table (Task 5)
CREATE TABLE IF NOT EXISTS product_images (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id    UUID        NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  image_url     TEXT        NOT NULL,
  display_order INTEGER     NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Indexes for product_images
CREATE INDEX IF NOT EXISTS idx_product_images_product_id
  ON product_images (product_id);

CREATE INDEX IF NOT EXISTS idx_product_images_order
  ON product_images (product_id, display_order ASC);

-- 5. Partial index for featured products (Task 4)
CREATE INDEX IF NOT EXISTS idx_products_featured
  ON products (user_id)
  WHERE is_featured = TRUE AND is_active = TRUE;
