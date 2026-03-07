# Picsellio – Siteyi Yayına Alma Rehberi

Bu rehber, projeyi sunucuya aktarıp canlı yayına almanız için adım adım kılavuzdur.

- **Canlı site:** https://picsellioglobal.com  
- **Dağıtım:** Kod GitHub’a pushlanır → Ubuntu sunucuda `git pull` + Docker ile yayına alınır.  
- **Sunucu:** Ubuntu, root kullanıcısı ile SSH ile bağlanılır.  
- **Sunucu IP:** 46.225.81.87  

---

## 1. Bilgisayarınızda (Son kontrol)

Kodu GitHub’a pushladığınızdan emin olun:

```bash
git add -A && git commit -m "Yayına hazır" && git push origin main
```

İsterseniz yerel test:

```bash
npm install && npm run build
```

Hata yoksa devam edin.

---

## 2. Sunucuya Bağlanın (Ubuntu, root)

```bash
ssh root@46.225.81.87
```

(Şifre veya SSH key ile giriş yapın.)

---

## 3. Proje Klasörü ve Kod

Sunucuda proje **/opt/picsellioglobal** altında olacak.

**İlk kez kuruyorsanız:**

```bash
mkdir -p /opt
cd /opt
git clone https://github.com/KULLANICI_ADINIZ/picsellioglobal.git
cd picsellioglobal
```

*(Repo adı farklıysa – örn. yeterin – onu kullanın; klasörü isterseniz `mv yeterin picsellioglobal` ile yeniden adlandırabilirsiniz.)*

**Zaten klonladıysanız sadece güncel kodu çekin:**

```bash
cd /opt/picsellioglobal
git pull origin main
```

---

## 4. Ortam Dosyası (.env)

Sunucuda proje kökünde `.env` olmalı. Yoksa örnekten oluşturup doldurun:

```bash
cd /opt/picsellioglobal
cp .env.example .env
nano .env
```

En az şunları ayarlayın:

| Değişken | Açıklama | Örnek |
|----------|----------|--------|
| `POSTGRES_PASSWORD` | Veritabanı şifresi (güçlü olsun) | Güvenli bir şifre |
| `JWT_SECRET` | API oturum anahtarı (32+ karakter) | Uzun rastgele string |
| `ADMIN_USERNAME` | Admin girişi kullanıcı adı | Admin |
| `ADMIN_PASSWORD` | Admin girişi şifresi | Güvenli şifre |
| `FRONTEND_URL` | Canlı site adresi | https://picsellioglobal.com |
| `NEXT_PUBLIC_API_URL` | Tarayıcıdan API adresi | https://picsellioglobal.com |
| `OPENAI_API_KEY` | OpenAI (AI metin/foto) | sk-... |
| `SHOPIER_*` | Ödeme (ilan paketleri) | ... |

Admin paneli: Veritabanında `role: ADMIN` olan kullanıcı ile normal giriş yapılır. İlk admin, uygulama ilk çalıştığında seed ile `ADMIN_USERNAME` / `ADMIN_PASSWORD` kullanılarak oluşturulabilir (seed varsa). Yoksa manuel bir kullanıcıyı veritabanında ADMIN yapın.

---

## 5. Nginx: HTTP mi, HTTPS mi?

**Sadece IP ile veya henüz domain/SSL yok:**

Varsayılan `devops/nginx/nginx.conf` zaten sadece 80 portunda (HTTP) çalışacak şekilde ayarlıdır. Ekstra bir şey yapmanız gerekmez.

**Domain (picsellioglobal.com) + SSL var:**

1. `certs/` klasörüne Cloudflare Origin Certificate dosyalarını koyun:
   - `certs/cloudflare_origin.pem`
   - `certs/cloudflare_origin.key`
2. Nginx’i HTTPS config ile kullanın:

```bash
cd /opt/picsellioglobal
cp devops/nginx/nginx.conf.https devops/nginx/nginx.conf
```

Sonra Docker’ı yeniden başlatın (6. adım).

---

## 6. Docker ile Derleyip Çalıştırma

```bash
cd /opt/picsellioglobal
docker compose build --no-cache
docker compose up -d
```

**Kontroller:**

```bash
docker compose ps
```

Hepsi “Up” olmalı: **postgres**, **backend**, **frontend**, **nginx**.

**Loglara bakmak için:**

```bash
docker compose logs -f
# Çıkmak için Ctrl+C
```

---

## 7. Çalışıyor mu?

- **HTTP (IP veya domain):** Tarayıcıda açın  
  - http://46.225.81.87  
  - veya (DNS ayarlıysa) http://picsellioglobal.com  

- **HTTPS (SSL kullanıyorsanız):**  
  - https://picsellioglobal.com  

Ana sayfa, vitrin, giriş, ilan verme açılıyorsa yayın tamamdır.

**API sağlık kontrolü:**

```bash
curl http://46.225.81.87/api/health
# veya
curl http://localhost/api/health
```

`{"status":"ok"}` dönmeli.

---

## 8. Domain ve SSL (picsellioglobal.com)

- **Domain sağlayıcı / Cloudflare:**  
  - picsellioglobal.com (ve isterseniz www) için **A kaydı** → **46.225.81.87**

- **Cloudflare:**  
  - SSL/TLS: Full veya Full (strict)  
  - “Always Use HTTPS” açık  
  - Origin Certificate indirip `certs/cloudflare_origin.pem` ve `certs/cloudflare_origin.key` olarak sunucuya koyun, sonra 5. adımdaki HTTPS config’e geçin.

---

## 9. Tema / Frontend Güncellemesi

Tasarım veya frontend değiştiyse sunucuda frontend’i yeniden build etmelisiniz. Sadece `git pull` + `up -d` yetmez; eski image çalışmaya devam eder.

**Bilgisayarınızda:**

```bash
git add -A
git commit -m "Tema"
git push origin main
```

**Sunucuda:**

```bash
cd /opt/picsellioglobal
git pull origin main
docker compose stop frontend
docker compose build --no-cache frontend
docker compose up -d
```

---

## 10. Sonraki Güncellemeler (Kod Değişince)

**A) Bilgisayarınızda (kodu GitHub’a atın):**

```bash
cd c:\Users\Ozlem\Desktop\yeterin
git add -A
git commit -m "Kısa açıklama"
git push origin main
```

**B) Ubuntu sunucuda (root ile SSH: `ssh root@46.225.81.87`):**

```bash
cd /opt/picsellioglobal
git pull origin main
docker compose build --no-cache frontend
docker compose up -d
```

*(Sadece backend değiştiyse: `frontend` yerine `backend` yazın. Tema/frontend değiştiyse mutlaka `build --no-cache frontend` yapın.)*

---

## Özet Kontrol Listesi

- [ ] Kod GitHub’a pushlandı  
- [ ] Ubuntu sunucuda root ile SSH yapıldı, `/opt/picsellioglobal` var ve `git pull` yapıldı  
- [ ] `.env` oluşturuldu; `POSTGRES_PASSWORD`, `JWT_SECRET`, `ADMIN_*`, API anahtarları dolduruldu  
- [ ] Nginx: SSL yoksa varsayılan `nginx.conf` (HTTP), SSL varsa `nginx.conf.https` → `nginx.conf` kopyalandı  
- [ ] `docker compose build --no-cache` ve `docker compose up -d` çalıştırıldı  
- [ ] http://46.225.81.87 veya https://picsellioglobal.com açılıyor  
- [ ] `/api/health` cevap veriyor  

Bu adımlar tamamsa Picsellio canlı yayındadır.
