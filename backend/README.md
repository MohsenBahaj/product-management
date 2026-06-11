# Backend API

Node.js + Express REST API for the Product Management System.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20+ |
| Framework | Express 4 |
| Database | PostgreSQL 17 via `pg` |
| Auth | JWT (`jsonwebtoken`) + bcrypt (`bcryptjs`) |
| Validation | `express-validator` |
| File Upload | `multer` (memory storage) |
| Image Storage | Firebase Storage (`firebase-admin`) |
| Security | `helmet`, `cors`, `express-rate-limit` |
| Testing | Jest + Supertest |

## Directory Structure

```
backend/
├── src/
│   ├── config/           Environment config, DB pool, constants
│   ├── middleware/        Auth guard, error handler, upload handler
│   ├── modules/
│   │   ├── auth/         Register, Login, Logout
│   │   ├── users/        Profile CRUD + avatar upload
│   │   ├── products/     Product CRUD + gallery management
│   │   ├── categories/   Category CRUD
│   │   └── search-history/  History list + delete
│   ├── routes/           Top-level router (mounts all module routers)
│   ├── services/
│   │   └── storage/      Firebase Storage abstraction layer
│   │       ├── storage.interface.js   Interface contract (JSDoc)
│   │       ├── firebase-storage.service.js  Implementation
│   │       └── index.js               Singleton export
│   ├── utils/            Helpers (pagination, response formatter, etc.)
│   └── app.js            Express app setup
├── tests/                Integration & unit tests
├── .env.example          Environment variable template
└── package.json
```

## Image Upload Architecture

```
Client (multipart/form-data)
        ↓
Express API  (multer — memoryStorage, file never hits disk)
        ↓
Firebase Storage  (uploaded via firebase-admin SDK)
        ↓
Public URL  (https://storage.googleapis.com/…)
        ↓
PostgreSQL  (URL stored in image_url / thumbnail_image_url / profile_image_url)
```

Controllers call **only** `storageService.uploadFile(file, folder)` and
`storageService.deleteFile(url)` — they never import firebase-admin directly.

### Storage folders

| Folder | Used for |
|--------|---------|
| `products/thumbnails` | Product card/list thumbnail |
| `products/gallery` | Product detail gallery images |
| `categories` | Category cover image |
| `profiles` | User avatar |

### Gallery deletion

When `DELETE /api/products/:id/images/:imageId` is called:
1. The database record is deleted first (PostgreSQL is source of truth).
2. The Firebase file is deleted best-effort — a Firebase failure does NOT roll back the DB delete.

## Firebase Setup

### 1 — Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/) → **Add project**
2. Give it a name and complete the wizard (Analytics optional)

### 2 — Enable Firebase Storage

1. In the left sidebar, select **Build → Storage**
2. Click **Get started** → choose a region → **Done**
3. In the **Rules** tab, paste the following to allow public reads (images are served directly to clients):

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

### 3 — Generate a Service Account Key

1. Go to **Project Settings** (gear icon) → **Service accounts**
2. Click **Generate new private key** → **Generate key**
3. A JSON file downloads — keep it secret, never commit it

### 4 — Configure Environment Variables

Open the downloaded JSON and map its fields to `.env`:

| `.env` variable | JSON field |
|---|---|
| `FIREBASE_PROJECT_ID` | `project_id` |
| `FIREBASE_CLIENT_EMAIL` | `client_email` |
| `FIREBASE_PRIVATE_KEY` | `private_key` (copy the full value including `-----BEGIN …-----`) |
| `FIREBASE_STORAGE_BUCKET` | shown in Storage → your bucket name (e.g. `my-project.appspot.com`) |

> **FIREBASE_PRIVATE_KEY** — wrap the value in double quotes in `.env` so newlines are preserved:
> ```
> FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE…\n-----END PRIVATE KEY-----\n"
> ```

## Running Locally

```bash
# Install dependencies
npm install

# Copy and configure environment (fill in Firebase + DB vars)
cp .env.example .env

# Start in development mode (hot reload)
npm run dev

# Run tests
npm test

# Lint
npm run lint
```

## API

Interactive docs available at `http://localhost:3001/api-docs` after starting the server.

Base URL: `http://localhost:3001/api`
Health check: `GET /api/health`
