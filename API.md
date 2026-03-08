# Picsellio Marketplace API

Base URL: `http://localhost:4000`

## Authentication (JWT)

All protected routes require header: `Authorization: Bearer <token>`

### POST /api/auth/register
- Body: `{ "email", "password", "name?" }`
- Returns: `{ user, token }`

### POST /api/auth/login
- Body: `{ "email", "password" }`
- Returns: `{ user, token }`

### GET /api/auth/me
- Auth: required
- Returns: current user (id, email, name, role, createdAt)

---

## Products

### GET /api/products
- Query: `status` (default: APPROVED), `page`, `limit`, `userId`
- Returns: `{ data: Product[], pagination }`
- Public: only APPROVED products unless filtered by userId (own) with auth

### GET /api/products/:id
- Returns: single product (404 if not APPROVED and not owner/admin)

### POST /api/products
- Auth: required
- Body: `{ "title", "description?", "price" (cents), "imageUrl" }`
- Returns: created product (status: PENDING)

### PATCH /api/products/:id
- Auth: required (owner only)
- Body: `{ "title?", "description?", "price?", "imageUrl?" }`
- Only PENDING products can be updated

### DELETE /api/products/:id
- Auth: required (owner only)
- Returns: 204

---

## Stripe

### POST /api/stripe/checkout-session
- Body: `{ "userId", "amount?", "productId?", "successUrl?", "cancelUrl?" }`
- If `productId` provided: amount is taken from product price, only APPROVED products.
- Returns: `{ url, sessionId }`

### POST /api/stripe/webhook
- Stripe webhook; creates Payment record (productId from metadata if present).

---

## AI Verification

### POST /api/ai/verify-image (Product image verification service)
- **Input:** Product image (URL or base64).
- **Body:** `{ "imageUrl": "https://..." }` or `{ "imageBase64": "data:image/...;base64,..." }` (or raw base64 string).
- **Detects:** AI-generated images, stock photos, fake product images.
- **Returns:**
  - `verification.status`: `"verified"` | `"rejected"`
  - `verification.flags`: `{ aiGenerated, stockPhoto, fakeProduct }` (booleans)
  - `verification.confidence`: `"high"` | `"medium"` | `"low"`
  - `verification.details`: Short explanation.

Example response:
```json
{
  "success": true,
  "verification": {
    "status": "rejected",
    "flags": { "aiGenerated": true, "stockPhoto": false, "fakeProduct": false },
    "confidence": "high",
    "details": "Image shows typical AI artifacts and unnatural textures."
  }
}
```

### POST /api/ai/verify
- Body: `{ "imageUrl?", "text?", "imageId?" }`
- Returns: `{ success, status, aiResult }`

### POST /api/ai/verify-product/:productId
- Verifies product image with OpenAI; sets `product.aiVerified`.
- Returns: `{ success, aiVerified, aiResult }`

---

## Admin (role: ADMIN required)

All admin routes require valid JWT with `role: "ADMIN"`.

### GET /api/admin/users
- Returns: list of users (with counts)

### GET /api/admin/payments
- Returns: list of payments (with user, product)

### GET /api/admin/verifications
- Returns: list of verifications

### GET /api/admin/products
- Query: `status?`
- Returns: all products (any status)

### PATCH /api/admin/products/:id/moderate
- Body: `{ "status": "APPROVED" | "REJECTED" }`
- Returns: updated product

---

## Database (Prisma)

- Run migration: from repo root `npm run db:migrate` (database workspace).
- Generate client: `npm run prisma:generate` (backend workspace).
- Env: `DATABASE_URL`, `JWT_SECRET`, `STRIPE_*`, `OPENAI_API_KEY`.
