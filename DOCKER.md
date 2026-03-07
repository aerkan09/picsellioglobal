# Picsellio – Docker (Hetzner / production)

## Gereksinimler

- Docker & Docker Compose
- Sunucuda (Hetzner) veya yerelde `.env` dosyası

## 1. Ortam değişkenleri

Proje kökünde `.env` oluşturun (veya `backend/.env` değişkenlerini export edin):

```env
# Zorunlu
POSTGRES_PASSWORD=güçlü_bir_şifre

# Production için
POSTGRES_USER=picsellio
POSTGRES_DB=picsellio
JWT_SECRET=uzun-gizli-anahtar
FRONTEND_URL=https://siteniz.com
NEXT_PUBLIC_API_URL=https://api.siteniz.com

# Shopier, OpenAI, Cloudinary vb. (backend/.env.example'a bakın)
SHOPIER_API_KEY=...
SHOPIER_API_SECRET=...
SHOPIER_CALLBACK_URL=...
```

`NEXT_PUBLIC_API_URL` tarayıcıda kullanılır; production’da API’nin gerçek adresi olmalı (örn. `https://api.picsellioglobal.com`).

## 2. Build ve çalıştırma

```bash
cd /path/to/yeterin
docker compose up -d --build
```

- **Frontend:** http://localhost:3000  
- **Backend API:** http://localhost:4000  

## 3. Sadece veritabanı dışarıda

PostgreSQL’i sunucuda ayrı çalıştırıyorsanız `docker-compose.yml` içinde `postgres` servisini kaldırın ve `backend`’in `DATABASE_URL`’ini kendi veritabanı adresinize çevirin.

## 4. Migration

Backend konteyneri her başlamada `prisma migrate deploy` çalıştırır. İlk kurulumda tablolar otomatik oluşur.

## 5. Durdurma

```bash
docker compose down
```

Veriler `postgres_data` ve `backend_uploads` volume’larında kalır.
