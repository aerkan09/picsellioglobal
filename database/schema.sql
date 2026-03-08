-- Marketplace PostgreSQL schema (reference)
-- Run migrations via Prisma: npm run db:migrate

-- Users
CREATE TABLE "User" (
  "id"           TEXT PRIMARY KEY,
  "email"        TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT,
  "name"         TEXT,
  "role"         TEXT NOT NULL DEFAULT 'USER',
  "stripeId"     TEXT UNIQUE,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL
);

-- Products (seller = userId)
CREATE TABLE "Product" (
  "id"          TEXT PRIMARY KEY,
  "title"       TEXT NOT NULL,
  "description" TEXT,
  "price"       INTEGER NOT NULL,
  "imageUrl"    TEXT NOT NULL,
  "userId"      TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "status"      TEXT NOT NULL DEFAULT 'PENDING',
  "aiVerified"  BOOLEAN NOT NULL DEFAULT false,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL
);
CREATE INDEX "Product_status_idx" ON "Product"("status");
CREATE INDEX "Product_userId_idx" ON "Product"("userId");

-- Orders (buyer = userId)
CREATE TABLE "Order" (
  "id"         TEXT PRIMARY KEY,
  "userId"     TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "status"     TEXT NOT NULL DEFAULT 'PENDING',
  "totalCents" INTEGER NOT NULL,
  "stripeId"   TEXT UNIQUE,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL
);
CREATE INDEX "Order_userId_idx" ON "Order"("userId");
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- Order items (line items per order)
CREATE TABLE "OrderItem" (
  "id"        TEXT PRIMARY KEY,
  "orderId"   TEXT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
  "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE RESTRICT,
  "quantity"  INTEGER NOT NULL DEFAULT 1,
  "unitCents" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("orderId", "productId")
);
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- Reviews (one per user per product)
CREATE TABLE "Review" (
  "id"        TEXT PRIMARY KEY,
  "userId"    TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
  "rating"    INTEGER NOT NULL,
  "body"      TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  UNIQUE("userId", "productId")
);
CREATE INDEX "Review_productId_idx" ON "Review"("productId");
CREATE INDEX "Review_userId_idx" ON "Review"("userId");
