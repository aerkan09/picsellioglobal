# PICSELLIO

AI-powered marketplace platform: listing plans (Shopier), AI text enhancement, image verification, and admin panel.

## Structure

| Folder     | Description                    | Port |
|-----------|---------------------------------|------|
| `frontend` | Next.js 14 + Tailwind + Framer Motion | 3000 |
| `backend`  | Fastify API (auth, Shopier, AI, Admin) | 4000 |
| `database` | Prisma + PostgreSQL             | -    |
| `admin`    | Admin panel (Vite)               | 3001 |

## Plug-and-play setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment**
   - Copy root `.env.example` and fill values (or copy into `backend/.env`, `frontend/.env.local`, `database/.env` as needed).
   - Required: `DATABASE_URL`, `JWT_SECRET`, `OPENAI_API_KEY`.
   - For payments: `SHOPIER_API_KEY`, `SHOPIER_API_SECRET`.
   - Optional: `STABILITY_API_KEY`, `PHOTOROOM_API_KEY`, `CLOUDINARY_*`, `GOOGLE_CLOUD_*`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`.

3. **Database**
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed --workspace=database
   ```
   Seed creates listing plans: 10-day (100 TL), 30-day (250 TL).

4. **Run**
   ```bash
   npm run dev
   ```
   - Frontend: http://localhost:3000  
   - API: http://localhost:4000  
   - Admin: `npm run dev:admin` → http://localhost:3001  

## Features

- **Auth**: Register, login, JWT, `/api/auth/me` (includes `unusedListingCredits`).
- **Plans**: `GET /api/plans` — 10-day (100 TL), 30-day (250 TL). Users must buy a plan to create listings.
- **Shopier**: `POST /api/shopier/checkout` (body: `{ planSlug: "10_DAY" | "30_DAY" }`) returns `url` + `formData` to redirect to payment. Callback creates payment and listing credit.
- **Listings**: Create product only with an unused listing credit; `listingExpiresAt` set from plan days.
- **AI text**: `POST /api/ai/enhance-text` — GPT-4 Turbo: optimized title, description, hashtags.
- **AI image**: `POST /api/ai/verify-image` — VERIFIED / SUSPICIOUS / REJECTED. Rejected listings cannot be published.
- **Image pipeline**: `POST /api/ai/process-image` — Stability (upscale) → Photoroom (remove BG) → optional Cloudinary.
- **Admin**: Listings (approve/reject), payments, users (ban), verifications. Use a user with `role: ADMIN` (set in DB or seed).

## Environment variables (see `.env.example`)

- `DATABASE_URL`, `PORT`, `JWT_SECRET`, `FRONTEND_URL`, `API_URL`
- `SHOPIER_API_KEY`, `SHOPIER_API_SECRET`
- `OPENAI_API_KEY`, `STABILITY_API_KEY`, `PHOTOROOM_API_KEY`, `CLOUDINARY_*`
- `GOOGLE_CLOUD_*` (Error Reporting)
- `ADMIN_USERNAME`, `ADMIN_PASSWORD` (for first admin or admin panel login)

## Build

```bash
npm run build
```
