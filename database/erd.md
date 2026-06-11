# Entity-Relationship Diagram

## ERD (Text notation)

```
┌──────────────────────────────────────┐
│                users                 │
├──────────────────────────────────────┤
│ PK  id               UUID            │
│     name             VARCHAR(255)    │
│     email            VARCHAR(255)    │  UNIQUE
│     password_hash    TEXT            │
│     profile_image_url TEXT           │
│     is_active        BOOLEAN         │  DEFAULT TRUE
│     created_at       TIMESTAMPTZ     │
│     updated_at       TIMESTAMPTZ     │
└──────────┬───────────────────────────┘
           │ 1
           │
           ├──────────────────────────────────────┐
           │                                      │
           │ N                                    │ N
┌──────────▼─────────────────────────┐  ┌─────────▼────────────────────────────┐
│            categories              │  │               products               │
├────────────────────────────────────┤  ├──────────────────────────────────────┤
│ PK  id          UUID               │  │ PK  id                  UUID         │
│ FK  user_id     UUID  → users.id   │  │ FK  user_id             UUID → users │
│     name        VARCHAR(255)       │  │ FK  category_id         UUID → categ │
│     description TEXT               │  │     name                VARCHAR(255) │
│     image_url   TEXT               │  │     description         TEXT         │
│     is_active   BOOLEAN            │  │     image_url           TEXT         │
│     created_at  TIMESTAMPTZ        │  │     thumbnail_image_url TEXT         │
│     updated_at  TIMESTAMPTZ        │  │     price               NUMERIC(12,2)│
└──────────┬─────────────────────────┘  │     quantity            INTEGER      │
           │ 1                          │     is_active           BOOLEAN      │  DEFAULT TRUE
           │                            │     is_featured         BOOLEAN      │  DEFAULT FALSE
           │ N                          │     created_at          TIMESTAMPTZ  │
           └────────────────────────────│     updated_at          TIMESTAMPTZ  │
                (category 1 → N products)└──────────────┬───────────────────────┘
                                                        │ 1
                                                        │
                                                        │ N
                                         ┌──────────────▼───────────────────────┐
                                         │           product_images             │
                                         ├──────────────────────────────────────┤
                                         │ PK  id            UUID               │
                                         │ FK  product_id    UUID → products.id │
                                         │     image_url     TEXT               │
                                         │     display_order INTEGER DEFAULT 0  │
                                         │     created_at    TIMESTAMPTZ        │
                                         └──────────────────────────────────────┘
                                           ON DELETE CASCADE from products

           ┌───────────────────────────────────────┐
           │ 1 (users)                             │
           │                                       │
           │ N                                     │
┌──────────▼───────────────────────┐               │
│          search_history          │               │
├──────────────────────────────────┤               │
│ PK  id          UUID             │               │
│ FK  user_id     UUID  → users.id │───────────────┘
│     search_term VARCHAR(500)     │
│     searched_at TIMESTAMPTZ      │
└──────────────────────────────────┘
```

> `search_history` has no `is_active` flag — history entries are immutable log records
> managed entirely by explicit user deletion, not activation state.

## Relationships

| Relationship | Type | Details |
|---|---|---|
| users → categories | 1 : N | User owns categories; CASCADE DELETE |
| users → products | 1 : N | User owns products; CASCADE DELETE |
| users → search_history | 1 : N | User's search log; CASCADE DELETE |
| categories → products | 1 : N (optional) | Product may have no category; SET NULL on delete |
| products → product_images | 1 : N | Product gallery; CASCADE DELETE |

## Key Constraints

| Table | Constraint | Detail |
|---|---|---|
| users | UNIQUE | email |
| users | DEFAULT | is_active = TRUE |
| categories | DEFAULT | is_active = TRUE |
| products | CHECK | price >= 0 |
| products | CHECK | quantity >= 0 |
| products | DEFAULT | is_active = TRUE |
| products | DEFAULT | is_featured = FALSE |
| product_images | DEFAULT | display_order = 0 |

## Soft Activation Rules

| Context | Rule |
|---|---|
| Authentication | Only users with `is_active = TRUE` may log in |
| Product listing | Only products with `is_active = TRUE` are returned |
| Product search | Search runs only over products with `is_active = TRUE` |
| Category dropdown | Only categories with `is_active = TRUE` are selectable |

## Image Strategy

| Field | Location | Usage |
|---|---|---|
| `products.thumbnail_image_url` | Products table | Card/list/search views |
| `product_images.image_url` | product_images table | Detail screen gallery/carousel |
| `products.image_url` | Products table | Legacy field (backward compat only) |

## Indexes Summary

| Table | Index | Type | Purpose |
|---|---|---|---|
| users | email | BTREE | full-table login lookup |
| users | email WHERE is_active = TRUE | BTREE (partial) | login lookup — active users only |
| users | created_at | BTREE | chronological ordering |
| categories | user_id | BTREE | per-user listing |
| categories | user_id WHERE is_active = TRUE | BTREE (partial) | active-category listing per user |
| categories | name (trgm) | GIN | search |
| products | user_id | BTREE | per-user listing |
| products | user_id WHERE is_active = TRUE | BTREE (partial) | active-product listing per user |
| products | category_id | BTREE | filter by category |
| products | category_id WHERE is_active = TRUE | BTREE (partial) | active products within a category |
| products | user_id WHERE is_featured = TRUE AND is_active = TRUE | BTREE (partial) | featured active product listing |
| products | price | BTREE | price range filter |
| products | name (trgm) | GIN | search |
| products | description (trgm) | GIN | search |
| product_images | product_id | BTREE | all images for a product |
| product_images | (product_id, display_order) | BTREE (composite) | ordered gallery fetch |
| search_history | user_id + searched_at | BTREE (composite) | recent searches per user |
