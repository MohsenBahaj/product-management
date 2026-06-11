# Architecture Decision Records

---

## ADR-001: PostgreSQL UUID primary keys

**Status:** Accepted

**Decision:** Use `uuid_generate_v4()` (via `uuid-ossp` extension) as the default PK for all tables.

**Reasoning:**
- No sequential ID leakage in API responses (security).
- IDs are globally unique — safe if multiple services ever write to the same DB.
- Works naturally with client-generated IDs if needed later.

**Trade-off:** Slightly larger index size vs. `BIGSERIAL`; negligible at this scale.

---

## ADR-002: `pg_trgm` for product/category search

**Status:** Accepted

**Decision:** Use PostgreSQL `pg_trgm` GIN indexes for full-text search instead of a separate search engine.

**Reasoning:**
- No additional infrastructure (no Elasticsearch, no Meilisearch).
- Supports `ILIKE '%term%'` efficiently and fuzzy matching via `similarity()`.
- Sufficient for a product catalog of tens of thousands of items.

**Trade-off:** For very large catalogs (millions of rows) or complex relevance ranking, a dedicated search engine would be preferred.

---

## ADR-003: `category_id` is nullable on products

**Status:** Accepted

**Decision:** `products.category_id` is an optional FK with `ON DELETE SET NULL`.

**Reasoning:**
- Products can exist without a category ("uncategorized").
- Deleting a category does not destroy its products — better UX than CASCADE DELETE.

---

## ADR-004: JWT + refresh token authentication

**Status:** Accepted

**Decision:** Short-lived access tokens (7d default) paired with refresh tokens stored by the client.

**Reasoning:**
- Stateless API — no server-side session store needed.
- Refresh tokens allow revocation without frequent re-login.

**Trade-off:** True token revocation requires a denylist (Redis / DB table) — deferred for MVP.

---

## ADR-005: Local file storage for uploads (dev), pluggable for production

**Status:** Accepted

**Decision:** Multer writes files to `backend/uploads/` in development. The storage engine is abstracted so production can swap to Cloudinary or S3 without API changes.

**Reasoning:**
- Zero external dependencies for local development.
- Railway provides ephemeral disk — a proper object store is required for production persistence.

---

## ADR-006: Monorepo structure

**Status:** Accepted

**Decision:** Single Git repository containing `backend/`, `apps/mobile/`, `apps/web/`, `database/`, and `docs/`.

**Reasoning:**
- Easier atomic commits spanning multiple layers.
- Shared documentation and deployment config in one place.
- Appropriate for a small team / single developer.

**Trade-off:** Large teams may prefer separate repos with independent CI pipelines.

---

## ADR-007: Railway for backend + Vercel for web

**Status:** Accepted

**Decision:** Deploy the API and PostgreSQL on Railway; deploy the React app on Vercel.

**Reasoning:**
- Railway has a first-class PostgreSQL plugin with automatic `DATABASE_URL` injection.
- Vercel has a best-in-class Vite/React build pipeline with edge CDN.
- Both have generous free tiers and GitHub auto-deploy.

---

## ADR-008: Soft activation via `is_active` flag

**Status:** Accepted

**Decision:** Add `is_active BOOLEAN NOT NULL DEFAULT TRUE` to `users`, `categories`, and `products`. Deactivation sets the flag to `FALSE`; no rows are physically deleted through this mechanism.

**Applies to:** `users`, `categories`, `products`
**Does not apply to:** `search_history` (log records managed by explicit user deletion only)

**Why records are not physically deleted:**

Hard deletion is simple until it isn't. The moment a `DELETE` on a parent row cascades to child rows — or breaks a foreign key — recovery requires restoring from backup. A boolean flag sidesteps all of that:

- A deactivated user's products, categories, and search history remain intact and consistent.
- Reversing an accidental deactivation is a single `UPDATE … SET is_active = TRUE`.
- No schema changes, no migration risk, no data loss.

**Benefits for auditing and future scalability:**

- Deactivated records stay queryable for analytics, reporting, or customer support lookups.
- A future admin panel can list and restore deactivated items without any new schema work.
- The pattern extends naturally: add a `deactivated_at TIMESTAMPTZ` column later for timestamped audit trails without breaking existing queries.

**Why not `deleted_at` (soft-delete timestamp)?**

`deleted_at` is the standard soft-delete pattern and is a reasonable choice. It was rejected here because:

1. It requires every query to add `WHERE deleted_at IS NULL`, which is identical in effort to `WHERE is_active = TRUE` but uses a nullable timestamp that can be `NULL`, a timestamp, or accidentally wrong — three states instead of two.
2. The assessment scope has no requirement to know *when* something was deactivated, only *whether* it is active.
3. A boolean is self-documenting (`is_active = FALSE` vs. `deleted_at IS NOT NULL`).

**Trade-off:** `is_active` does not record the time or actor of a deactivation. If that audit trail becomes necessary, add a `deactivated_at TIMESTAMPTZ` column alongside `is_active` rather than replacing it.

**Implementation rules:**

- All `SELECT` queries in the API **must** include `WHERE is_active = TRUE` unless explicitly fetching deactivated records (admin use case, not in current scope).
- The login query **must** gate on `is_active = TRUE` — an inactive user receives a `401 Unauthorized` with a generic "invalid credentials" message (no information leakage).
- Partial indexes `WHERE is_active = TRUE` are defined in `schema.sql` for the most common query paths to prevent full-table scans as data grows.
