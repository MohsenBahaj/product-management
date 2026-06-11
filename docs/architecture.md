# System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                        │
│                                                         │
│   ┌───────────────────┐     ┌───────────────────────┐   │
│   │   Mobile App      │     │      Web App          │   │
│   │   (Flutter)       │     │   (React + Vite)      │   │
│   │                   │     │                       │   │
│   │  • Auth screens   │     │  • Auth pages         │   │
│   │  • Product list   │     │  • Product list       │   │
│   │  • Product CRUD   │     │  • Product CRUD       │   │
│   │  • Search         │     │  • Search             │   │
│   │  • Profile        │     │  • Profile            │   │
│   └────────┬──────────┘     └──────────┬────────────┘   │
└────────────│────────────────────────────│────────────────┘
             │ HTTPS / REST               │ HTTPS / REST
             └──────────────┬─────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│                    API LAYER                            │
│                                                         │
│              REST API (Node.js + Express)               │
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │   auth   │ │  users   │ │products  │ │categories│   │
│  │  module  │ │  module  │ │  module  │ │  module  │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│                        ┌──────────────┐                 │
│                        │search-history│                 │
│                        │   module     │                 │
│                        └──────────────┘                 │
│                                                         │
│  Middleware: JWT Auth | Rate Limit | CORS | Helmet      │
│  File storage: Multer → local uploads/ (dev)            │
└───────────────────────────┬─────────────────────────────┘
                            │ pg driver (SSL in prod)
┌───────────────────────────▼─────────────────────────────┐
│                   DATA LAYER                            │
│                                                         │
│              PostgreSQL 17                              │
│                                                         │
│   users | categories | products | search_history        │
└─────────────────────────────────────────────────────────┘
```

## Module Responsibilities

### auth
- `POST /api/auth/register` — create user, hash password, return JWT
- `POST /api/auth/login` — verify credentials, return JWT + refresh token
- `POST /api/auth/logout` — invalidate refresh token
- `POST /api/auth/refresh` — exchange refresh token for new access token

### users
- `GET /api/users/me` — get current user profile
- `PATCH /api/users/me` — update name / profile image

### products
- `GET /api/products` — list with pagination; filter by category, price range, featured flag; full-text search
- `POST /api/products` — create product (with optional image upload and `is_featured` flag)
- `GET /api/products/:id` — get single product
- `PATCH /api/products/:id` — update product (including toggling `is_featured`)
- `DELETE /api/products/:id` — soft-delete product

### categories
- `GET /api/categories` — list user's categories
- `POST /api/categories` — create category
- `GET /api/categories/:id` — get category + its products
- `PATCH /api/categories/:id` — update category
- `DELETE /api/categories/:id` — delete category (products → uncategorized)

### search-history
- `GET /api/search-history` — get user's recent searches (latest first)
- `DELETE /api/search-history` — clear all history
- `DELETE /api/search-history/:id` — remove one entry

## Authentication Flow

```
Client                     API                      DB
  │                          │                       │
  │── POST /auth/register ──►│                       │
  │                          │── INSERT user ───────►│
  │                          │◄─ user row ───────────│
  │◄── { accessToken,        │                       │
  │      refreshToken } ────│                       │
  │                          │                       │
  │── POST /auth/login ─────►│                       │
  │                          │── SELECT WHERE email  │
  │                          │   AND is_active=TRUE ►│
  │                          │◄─ user row ───────────│
  │                          │   (403 if not found)  │
  │◄── { accessToken } ─────│                       │
  │                          │                       │
  │── GET /products ────────►│                       │
  │   Authorization: Bearer  │                       │
  │                          │── verify JWT          │
  │                          │── SELECT WHERE        │
  │                          │   is_active=TRUE ────►│
  │◄── products[] ──────────│◄─ rows ───────────────│
```

## Soft Activation Strategy

Every user-owned record (`users`, `categories`, `products`) carries an `is_active BOOLEAN NOT NULL DEFAULT TRUE` column. Records are deactivated by setting this flag to `FALSE` rather than issuing a `DELETE`.

### Enforcement points

| Layer | Enforcement |
|---|---|
| Authentication | `WHERE email = $1 AND is_active = TRUE` — inactive users receive 401 |
| Product listing / search | `WHERE user_id = $1 AND is_active = TRUE` |
| Category dropdown | `WHERE user_id = $1 AND is_active = TRUE` |
| Single-record fetch | `WHERE id = $1 AND is_active = TRUE` — returns 404 if deactivated |

### Why `is_active` instead of hard deletion

- **Referential integrity** — deleting a user or category that still has foreign-key dependents requires cascading or nullifying child rows. Flipping a flag requires no cascade logic.
- **History preservation** — deactivated products still appear in any future order history, analytics, or audit trail without complex restore flows.
- **Reversibility** — an accidental deactivation is a one-row UPDATE; an accidental DELETE may be unrecoverable.
- **Simplicity** — a single boolean avoids the complexity of `deleted_at` timestamp columns, soft-delete middleware, or shadow tables, while achieving the same outcome for this assessment scope.

### What it does NOT cover

- Role-based visibility (an admin seeing inactive records) — deferred; no role system exists yet.
- Cascading deactivation (deactivating a user auto-deactivates their products) — a future enhancement; current scope deactivates each entity independently.

## File Upload Strategy

**Development:** Files stored in `backend/uploads/{products,profiles,categories}/` on the local filesystem. Served as static assets by Express.

**Production (future):** Move to object storage (Cloudinary / AWS S3 / Railway Volumes) by swapping the Multer storage engine — no API surface changes required.

## Rate Limiting Strategy

Rate limiting is implemented with `express-rate-limit` and applied at two levels:

### Authentication endpoints (`/api/auth/register`, `/api/auth/login`)

| Setting | Value | Env var |
|---|---|---|
| Window | 15 minutes | `AUTH_RATE_LIMIT_WINDOW` |
| Max requests | 5 per IP | `AUTH_RATE_LIMIT_MAX` |
| Response | `{ success: false, message: "Too many authentication attempts..." }` | — |

**Why stricter:** These are the only endpoints that accept plaintext passwords. Without a tight limit, an attacker could enumerate passwords via automated brute-force within minutes. Five attempts per 15-minute window matches common industry defaults (e.g. GitHub, Auth0) while still allowing legitimate users who mistype their password.

### General API (`/api/*`)

| Setting | Value | Env var |
|---|---|---|
| Window | 15 minutes | `API_RATE_LIMIT_WINDOW` |
| Max requests | 100 per IP | `API_RATE_LIMIT_MAX` |
| Response | `{ success: false, message: "Too many requests..." }` | — |

**Why broader:** Normal usage involves reading and writing data frequently — listing products, uploading images, searching. A 100-request window allows real users to work freely while preventing accidental API flooding from misconfigured clients or runaway loops.

### Swagger UI (`/api-docs`)

Swagger documentation is explicitly excluded from both limiters so developers can browse the spec without hitting a rate wall.

### Headers

Both limiters set `RateLimit-*` standard headers (RFC 6585 draft) so clients can read remaining quota and reset time programmatically.

## Deployment Topology

```
GitHub (main branch)
    │
    ├──► Railway         (API + PostgreSQL)
    │      auto-deploy on push
    │
    └──► Vercel          (React web app)
           auto-deploy on push
```

- Mobile: built locally and distributed as APK / submitted to app stores separately.
- Environment variables are injected by Railway and Vercel at build/runtime — no `.env` files in production.
