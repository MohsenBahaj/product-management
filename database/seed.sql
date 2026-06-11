-- =============================================================================
-- Product Management System — Seed Data (Development / Testing)
-- Run after schema.sql
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Demo users (passwords are bcrypt hashes of "password123")
-- ---------------------------------------------------------------------------
INSERT INTO users (id, name, email, password_hash) VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'Alice Johnson',
    'alice@example.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Bob Smith',
    'bob@example.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
  );


-- ---------------------------------------------------------------------------
-- Demo categories
-- ---------------------------------------------------------------------------
INSERT INTO categories (id, user_id, name, description) VALUES
  (
    'aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'Electronics',
    'Electronic devices and accessories'
  ),
  (
    'bbbb2222-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '11111111-1111-1111-1111-111111111111',
    'Books',
    'Physical and digital books'
  ),
  (
    'cccc3333-cccc-cccc-cccc-cccccccccccc',
    '22222222-2222-2222-2222-222222222222',
    'Clothing',
    'Apparel and accessories'
  );


-- ---------------------------------------------------------------------------
-- Demo products
-- ---------------------------------------------------------------------------
INSERT INTO products (user_id, category_id, name, description, price, quantity) VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Wireless Headphones',
    'Over-ear noise-cancelling wireless headphones with 30h battery life',
    79.99,
    25
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'USB-C Hub 7-in-1',
    'Multi-port hub with HDMI, USB-A x3, SD card, and PD charging',
    34.99,
    50
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'bbbb2222-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Clean Code',
    'A Handbook of Agile Software Craftsmanship by Robert C. Martin',
    29.99,
    10
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'cccc3333-cccc-cccc-cccc-cccccccccccc',
    'Classic White T-Shirt',
    '100% cotton unisex t-shirt, available in sizes S-XXL',
    14.99,
    100
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    NULL,
    'Stainless Steel Water Bottle',
    'Insulated 500ml bottle, keeps cold 24h / hot 12h',
    24.99,
    40
  );


-- ---------------------------------------------------------------------------
-- Demo search history
-- ---------------------------------------------------------------------------
INSERT INTO search_history (user_id, search_term) VALUES
  ('11111111-1111-1111-1111-111111111111', 'headphones'),
  ('11111111-1111-1111-1111-111111111111', 'wireless'),
  ('22222222-2222-2222-2222-222222222222', 't-shirt'),
  ('22222222-2222-2222-2222-222222222222', 'bottle');
