# Environment configuration

All configuration is done via environment variables. **No secrets or API keys are stored in source code.**

## Hangi dosyayı dolduracaksınız?

**Tüm API key'leri ve şifreleri doldurmanız gereken tek dosya:**

| Nerede | Tam yol |
|--------|--------|
| **Backend .env** | `yeterin\backend\.env` |
| Tam Windows yolu | `c:\Users\Ozlem\Desktop\yeterin\backend\.env` |

- Backend sunucusu (`npm run dev` backend klasöründen) bu dosyayı otomatik yükler.
- Bu dosyada olmayan değişkenler için proje kökündeki `.env.example` şablonuna bakın; oradaki tüm anahtarları `backend\.env` içine kopyalayıp doldurun.

Frontend (Next.js) sadece `NEXT_PUBLIC_*` kullanıyorsa `frontend\.env.local` kullanılır; çoğu API key backend’de olduğu için **gerçek site için asıl dolduracağınız yer `backend\.env`.**

## Setup

1. Şablonu kopyalayın (proje kökündeki `.env.example` veya `backend\.env.example`):
   ```bash
   # Backend klasöründe:
   copy .env.example .env
   ```
2. **`backend\.env`** dosyasını açıp tüm değerleri doldurun. `.env` dosyasını asla commit etmeyin (`.gitignore`’da).

## Variables (loaded from `.env`)

| Category    | Variables | Used for |
|------------|-----------|----------|
| **Site**   | `SITE_NAME`, `SITE_URL` | Branding and canonical URL |
| **Admin**  | `ADMIN_USERNAME`, `ADMIN_PASSWORD` | First-time admin user (seed) |
| **Database** | `DATABASE_URL` | PostgreSQL connection (Prisma) |
| **Backend** | `PORT`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `FRONTEND_URL` | API server and auth |
| **Shopier** | `SHOPIER_API_KEY`, `SHOPIER_API_SECRET`, `SHOPIER_CALLBACK_URL` | Payment and listing plans |
| **OpenAI** | `OPENAI_API_KEY` | AI text and verification |
| **Cloudinary** | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Image processing |
| **Photoroom** | `PHOTOROOM_API_KEY` | Background removal |
| **Stability AI** | `STABILITY_API_KEY` | Image upscale |
| **Google Vision** | `GOOGLE_VISION_API_KEY` | Fake/image detection |
| **SMTP** | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Email sending |

Backend reads these via `process.env`; optional central reference is `backend/src/config/env.ts`.

## Admin panel

- **Route:** `/admin`
- **Auth:** Admin is a user in the database with `role: ADMIN`. Login via normal login with that user’s email and password. `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env` are used when creating the initial admin user (e.g. via seed), not for every request.
- **Permissions:** Full access to users, listings (products), payments, AI reports (verifications), and spam/rejected listings. Enforced by `requireAdmin` on all `/api/admin/*` routes.
