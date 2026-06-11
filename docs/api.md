# API Reference

Base URL: `http://localhost:3000/api` (development)

All protected routes require: `Authorization: Bearer <accessToken>`

---

## Auth

### Register
`POST /auth/register`

**Body**
```json
{
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "password": "password123"
}
```

**Response 201**
```json
{
  "user": { "id": "...", "name": "Alice Johnson", "email": "alice@example.com" },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

---

### Login
`POST /auth/login`

**Body**
```json
{ "email": "alice@example.com", "password": "password123" }
```

**Response 200** — same shape as register

---

### Logout
`POST /auth/logout` 🔒

**Body**
```json
{ "refreshToken": "eyJ..." }
```

**Response 204** — no content

---

### Refresh Token
`POST /auth/refresh`

**Body**
```json
{ "refreshToken": "eyJ..." }
```

**Response 200**
```json
{ "accessToken": "eyJ..." }
```

---

## Users

### Get My Profile
`GET /users/me` 🔒

**Response 200**
```json
{
  "id": "...",
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "profileImageUrl": null,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

### Update My Profile
`PATCH /users/me` 🔒

**Body** (multipart/form-data or JSON)
```json
{ "name": "Alice J." }
```
Or with image: send as `multipart/form-data` with field `profileImage`.

**Response 200** — updated user object

---

## Products

### List Products
`GET /products` 🔒

**Query params**

| Param | Type | Description |
|---|---|---|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20, max: 100) |
| `q` | string | Search term (name + description) |
| `categoryId` | UUID | Filter by category |
| `minPrice` | number | Minimum price filter |
| `maxPrice` | number | Maximum price filter |
| `sortBy` | string | `created_at` \| `price` \| `name` (default: `created_at`) |
| `order` | string | `asc` \| `desc` (default: `desc`) |

**Response 200**
```json
{
  "data": [ { "id": "...", "name": "...", "price": 29.99, ... } ],
  "pagination": { "page": 1, "limit": 20, "total": 42, "pages": 3 }
}
```

---

### Create Product
`POST /products` 🔒

**Body** (multipart/form-data)

| Field | Type | Required |
|---|---|---|
| `name` | string | ✅ |
| `price` | number | ✅ |
| `quantity` | number | ✅ |
| `description` | string | |
| `categoryId` | UUID | |
| `image` | file | |

**Response 201** — created product object

---

### Get Product
`GET /products/:id` 🔒

**Response 200** — product object (includes category if set)

---

### Update Product
`PATCH /products/:id` 🔒

**Body** — any subset of create fields

**Response 200** — updated product object

---

### Delete Product
`DELETE /products/:id` 🔒

**Response 204** — no content

---

## Categories

### List Categories
`GET /categories` 🔒

**Response 200**
```json
[{ "id": "...", "name": "Electronics", "description": "...", "productCount": 5 }]
```

---

### Create Category
`POST /categories` 🔒

**Body** (multipart/form-data)

| Field | Type | Required |
|---|---|---|
| `name` | string | ✅ |
| `description` | string | |
| `image` | file | |

**Response 201** — created category

---

### Get Category
`GET /categories/:id` 🔒

**Response 200** — category with its products array

---

### Update Category
`PATCH /categories/:id` 🔒

**Response 200** — updated category

---

### Delete Category
`DELETE /categories/:id` 🔒

**Response 204** — no content; products become uncategorized

---

## Search History

### Get History
`GET /search-history` 🔒

**Query params**: `limit` (default: 20)

**Response 200**
```json
[{ "id": "...", "searchTerm": "headphones", "searchedAt": "2024-01-01T00:00:00Z" }]
```

---

### Clear All History
`DELETE /search-history` 🔒

**Response 204**

---

### Remove One Entry
`DELETE /search-history/:id` 🔒

**Response 204**

---

## Error Format

All errors follow a consistent shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": [ { "field": "email", "message": "Invalid email" } ]
  }
}
```

| HTTP Status | Code | Meaning |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Invalid request body / params |
| 401 | `UNAUTHORIZED` | Missing or invalid token |
| 403 | `FORBIDDEN` | Authenticated but not allowed |
| 404 | `NOT_FOUND` | Resource does not exist |
| 409 | `CONFLICT` | Duplicate (e.g. email already registered) |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Server error |
