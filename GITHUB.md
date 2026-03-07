# GitHub bağlantısı

Proje kökünde (yeterin klasöründe) aşağıdaki komutları sırayla çalıştır.

## 1. Git deposunu başlat

```powershell
cd c:\Users\Ozlem\Desktop\yeterin

git init
```

## 2. Tüm dosyaları ekle ve ilk commit

```powershell
git add .
git commit -m "Initial commit: Picsellio frontend, backend, Docker"
```

## 3. GitHub’da yeni repo oluştur

- https://github.com/new adresine git
- Repository name: **yeterin** (veya **picsellio**)
- Public seç
- “Add a README” / “Add .gitignore” **işaretleme** (zaten projede var)
- **Create repository** tıkla

## 4. Remote ekle ve push

GitHub’da repo oluşturduktan sonra sayfada gösterilen repo adresini kullan (örn. `https://github.com/KULLANICI/yeterin.git` veya `git@github.com:KULLANICI/yeterin.git`):

```powershell
git remote add origin https://github.com/KULLANICI_ADIN/yeterin.git
git branch -M main
git push -u origin main
```

**SSH kullanıyorsan:**

```powershell
git remote add origin git@github.com:KULLANICI_ADIN/yeterin.git
git branch -M main
git push -u origin main
```

`KULLANICI_ADIN` yerine kendi GitHub kullanıcı adını yaz.

---

**Not:** `.env` dosyaları `.gitignore`’da; GitHub’a gönderilmez. API anahtarlarını sadece sunucuda veya kendi bilgisayarında tut.
