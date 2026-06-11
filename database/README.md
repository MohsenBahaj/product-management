# Database

PostgreSQL 17 database for the Product Management System.

## Files

| File | Purpose |
|------|---------|
| `schema.sql` | Full DDL — tables, indexes, triggers, extensions |
| `seed.sql` | Development/test seed data (2 users, 3 categories, 5 products) |
| `erd.md` | Entity-relationship diagram (text notation) |

## Tables

| Table | Description |
|-------|-------------|
| `users` | Registered users with hashed passwords and optional avatar |
| `categories` | User-owned product categories |
| `products` | Core entity — name, description, price, quantity, optional category |
| `search_history` | Log of search terms per user |

## Local Setup

The database is bootstrapped automatically when you run Docker Compose.
The `docker-entrypoint-initdb.d/` mechanism runs `schema.sql` then `seed.sql`
on first container creation.

```bash
# Start fresh
docker compose up postgres -d

# Connect with psql
docker exec -it product_management_postgres \
  psql -U postgres -d product_management_db

# Wipe and rebuild (destructive!)
docker compose down -v && docker compose up postgres -d
```

## Key Design Choices

- **UUID primary keys** — safe for distributed systems, no sequential ID leakage.
- **`updated_at` trigger** — auto-maintained by `set_updated_at()` PL/pgSQL function.
- **`pg_trgm` GIN indexes** — efficient `ILIKE '%term%'` / `similarity()` queries for search.
- **`category_id` nullable** — products can exist without a category; deleting a category
  sets `category_id` to `NULL` rather than deleting the product.
- **Cascade deletes on `user_id`** — removing a user removes all their owned data.
