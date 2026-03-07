# Picsellio – Full folder structure and working code

AI-verified marketplace: pixel-perfect landing, Next.js + Tailwind, Fastify API, PostgreSQL (Prisma), Stripe, AI verification, Admin dashboard, WhatsApp contact.

---

## Folder structure

```
yeterin/
├── frontend/                 # Next.js 16 + Tailwind + Framer Motion
│   ├── app/
│   │   ├── page.tsx          # Landing (hero, AI shield, product grid, WhatsApp)
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── dashboard/page.tsx # User: my products, create product, Stripe checkout
│   │   ├── products/page.tsx  # Public product listing + WhatsApp buttons
│   │   ├── admin/
│   │   │   ├── layout.tsx    # Admin-only layout
│   │   │   ├── page.tsx      # Admin dashboard (stats)
│   │   │   ├── products/page.tsx  # Moderation (approve/reject)
│   │   │   └── users/page.tsx
│   │   ├── components/
│   │   │   ├── PicsellioLogo.tsx
│   │   │   └── AIVerifiedShield.tsx
│   │   └── ...
│   ├── lib/
│   │   └── api.ts            # auth, products, stripe, ai, admin, whatsappUrl
│   ├── next.config.ts
│   ├── vercel.json
│   └── package.json
│
├── backend/                  # Fastify API
│   ├── src/
│   │   ├── index.ts          # CORS, JWT, routes
│   │   ├── lib/
│   │   │   ├── prisma.ts
│   │   │   ├── auth.ts       # hashPassword, requireAuth, requireAdmin
│   │   │   └── r2.ts         # Cloudflare R2 upload
│   │   ├── routes/
│   │   │   ├── index.ts      # GET /api
│   │   │   ├── auth.ts       # register, login, me
│   │   │   ├── products.ts   # CRUD, list
│   │   │   ├── stripe.ts     # checkout-session, webhook
│   │   │   ├── ai.ts         # verify, verify-image, verify-product
│   │   │   └── admin.ts      # users, payments, products, moderate
│   │   └── services/
│   │       └── aiVerification.ts  # Product image AI/stock/fake detection
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .env.example
│   ├── API.md
│   └── package.json
│
├── database/
│   ├── prisma/
│   │   └── schema.prisma     # User, Product, Order, OrderItem, Review, Payment, Image, Verification
│   ├── schema.sql            # Raw PostgreSQL reference
│   └── .env.example
│
├── admin/                    # Legacy Vite admin (optional; Next.js /admin used above)
├── ai/                       # Standalone AI service (optional; backend has /api/ai)
├── package.json              # Workspace root
├── DEPLOYMENT.md             # Vercel, Docker, Supabase, R2
└── README.md
```

---

## Run locally

1. **Database**
   - Copy `database/.env.example` → `database/.env`, set `DATABASE_URL` (PostgreSQL).
   - From repo root: `npm run db:generate` then `npm run db:migrate`.
   - Backend Prisma client: `cd backend && npm run prisma:generate`.

2. **Backend**
   - Copy `backend/.env.example` → `backend/.env` (DATABASE_URL, JWT_SECRET, STRIPE_*, OPENAI_API_KEY, FRONTEND_URL).
   - `cd backend && npm install && npm run dev` → http://localhost:4000.

3. **Frontend**
   - Copy `frontend/.env.example` → `frontend/.env.local` (NEXT_PUBLIC_API_URL=http://localhost:4000, optional NEXT_PUBLIC_WHATSAPP_NUMBER).
   - `cd frontend && npm install && npm run dev` → http://localhost:3000.

4. **First admin user**
   - Register via /register, then in DB set that user’s `role` to `ADMIN` (e.g. Prisma Studio or SQL).

---

## Features checklist

| Feature | Location |
|--------|----------|
| Pixel-perfect landing | `frontend/app/page.tsx` (dark blue, glass header, hero, AI shield, product grid, workflow, footer, floating WhatsApp) |
| Next.js + Tailwind | `frontend/` |
| Fastify API | `backend/src/` |
| PostgreSQL + Prisma | `database/prisma/schema.prisma` |
| Stripe | `backend/src/routes/stripe.ts` + checkout from dashboard |
| AI product verification | `backend/src/routes/ai.ts` + `services/aiVerification.ts` (verify-image, verify-product) |
| Admin dashboard | `frontend/app/admin/` (stats, products moderation, users) |
| WhatsApp | Landing + products: `whatsappUrl()` in `lib/api.ts`; product cards + floating button; `NEXT_PUBLIC_WHATSAPP_NUMBER` |
