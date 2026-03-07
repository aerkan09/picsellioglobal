# Picsellio Deployment

- **Frontend** → Vercel  
- **Backend** → Docker container  
- **Database** → Supabase (PostgreSQL)  
- **Storage** → Cloudflare R2  

---

## 1. Database (Supabase)

1. Create a project at [supabase.com](https://supabase.com).
2. **Settings → Database** → copy the **Connection string** (URI). Use **Transaction** or **Session** mode for Prisma; for connection pooling use the **Pooler** URI (port 6543).
3. Add to backend env:
   ```env
   DATABASE_URL="postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
   ```
4. Run migrations from your machine (with the same `DATABASE_URL`):
   ```bash
   cd database && npx prisma migrate deploy
   ```
   Or use Supabase SQL Editor to run migrations if you prefer.

---

## 2. Storage (Cloudflare R2)

1. In [Cloudflare Dashboard](https://dash.cloudflare.com) → **R2 → Create bucket** (e.g. `picsellio-uploads`).
2. **R2 → Manage R2 API Tokens** → Create API token with Object Read & Write. Note **Access Key ID** and **Secret Access Key**.
3. **Account ID** is in the R2 overview URL or dashboard sidebar.
4. Optional: enable **Public access** for the bucket and note the public URL (e.g. `https://pub-xxx.r2.dev`) or attach a custom domain.
5. Backend env:
   ```env
   R2_ACCOUNT_ID=your_account_id
   R2_ACCESS_KEY_ID=...
   R2_SECRET_ACCESS_KEY=...
   R2_BUCKET_NAME=picsellio-uploads
   R2_PUBLIC_URL=https://pub-xxx.r2.dev
   ```
6. Use `uploadToR2(key, buffer, contentType)` from `backend/src/lib/r2.ts` for product images; store the returned URL in `Product.imageUrl`. Frontend can use `NEXT_PUBLIC_R2_PUBLIC_URL` or the full URL returned by the API.

---

## 3. Frontend (Vercel)

1. Push the repo to GitHub and import the project in [Vercel](https://vercel.com); set **Root Directory** to `frontend` (or deploy from monorepo with root in repo and build settings pointing to `frontend`).
2. In Vercel **Project → Settings → Environment Variables** add:
   - `NEXT_PUBLIC_API_URL` = your backend URL (e.g. `https://api.yourdomain.com`)
   - `NEXT_PUBLIC_ADMIN_URL` = admin app URL if separate
   - `NEXT_PUBLIC_R2_PUBLIC_URL` = R2 public URL if you use it for images
3. Build command: `npm run build` (or leave default for Next.js). Output: `.next`.
4. Optional: add your R2 public hostname to `frontend/next.config.ts` → `images.remotePatterns` (e.g. `hostname: "pub-xxx.r2.dev"`) so `next/image` can load R2 images.

---

## 4. Backend (Docker)

1. Build from **repo root** (so that `database/prisma` is available):
   ```bash
   docker build -f backend/Dockerfile -t picsellio-api .
   ```
2. Run with env (use `--env-file` or pass `-e`):
   ```bash
   docker run -p 4000:4000 --env-file backend/.env picsellio-api
   ```
3. For production, use a platform (e.g. Railway, Fly.io, AWS ECS, or a VPS). Set the same env vars as in `backend/.env.example`; point `DATABASE_URL` to Supabase and configure R2 and Stripe.
4. Ensure **migrations** have been run against the Supabase DB (see §1). Prisma client is generated at build time in the Docker image.

---

## Env checklist

| Variable | Where | Purpose |
|----------|--------|--------|
| `DATABASE_URL` | Backend | Supabase PostgreSQL (pooler URI recommended) |
| `JWT_SECRET` | Backend | JWT signing |
| `STRIPE_*` | Backend | Payments |
| `OPENAI_API_KEY` | Backend | AI verification |
| `FRONTEND_URL` | Backend | CORS / redirects |
| `R2_*` | Backend | Cloudflare R2 storage |
| `NEXT_PUBLIC_API_URL` | Frontend (Vercel) | Backend API |
| `NEXT_PUBLIC_ADMIN_URL` | Frontend (Vercel) | Admin app URL |
| `NEXT_PUBLIC_R2_PUBLIC_URL` | Frontend (Vercel) | Optional R2 image base URL |
