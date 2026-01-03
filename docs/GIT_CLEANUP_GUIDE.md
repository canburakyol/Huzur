# 📝 Git Commit ve Temizleme Rehberi

## Senaryo 1: İlk Kez Git Kullanıyorsanız (ÖNERİLEN)

Projenizde henüz `.git` klasörü yok, yani git kullanmamışsınız. Bu durumda işler çok kolay:

### Adım 1: Git Repository Oluşturun

```powershell
cd D:\Projem
git init
```

### Adım 2: .gitignore Dosyasını Kontrol Edin

`.gitignore` dosyanıza `.env` eklenerek gerçek API anahtarlarınızın asla commit edilmemesini sağlayın:

```
# .gitignore dosyasına ekleyin (zaten var olmalı)
.env
.env.local
node_modules/
dist/
android/app/google-services.json
```

### Adım 3: İlk Commit Yapın

```powershell
git add .
git commit -m "Initial commit with security improvements"
```

✅ **Bu kadar!** İlk commit'inizde `.env.example` zaten temiz olduğu için sorun yok.

---

## Senaryo 2: Daha Önce Git Kullandıysanız ve .env.example'ı Gerçek Anahtarlarla Commit Ettiyseniz

Eğer daha önce git kullandıysanız ve `.env.example` dosyasını gerçek anahtarlarla commit ettiyseniz, git geçmişinden temizlemeniz gerekir.

### Adım 1: Mevcut Değişiklikleri Commit Edin

```powershell
cd D:\Projem
git add .env.example
git commit -m "security: remove real API keys from .env.example"
```

### Adım 2: Git Geçmişinden Dosyayı Temizleyin (İLERİ DÜZEY)

Bu işlem **tehlikeli** olabilir çünkü git geçmişinizi yeniden yazar. **YEDEK ALIN!**

#### Yöntem A: BFG Repo-Cleaner (KOLAY - ÖNERİLEN)

1. BFG'yi indirin: https://rtyley.github.io/bfg-repo-cleaner/

2. Gerçek API anahtarlarını bir dosyaya yazın (`passwords.txt`):
```
AIzaSyAZbDYbhv3k3h_HfJGMiRU-JABBTc_yngo
goog_VmQUNwRXziTjIdByhvrImtIkBTK
```

3. BFG'yi çalıştırın:
```powershell
java -jar bfg-1.14.0.jar --replace-text passwords.txt D:\Projem
cd D:\Projem
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

#### Yöntem B: git filter-repo (DAHA MODERN)

1. git-filter-repo kurun:
```powershell
pip install git-filter-repo
```

2. Çalıştırın:
```powershell
git filter-repo --path .env.example --invert-paths
git filter-repo --replace-text <(echo "AIzaSyAZbDYbhv3k3h_HfJGMiRU-JABBTc_yngo==>your_api_key_here")
```

### Adım 3: Force Push (Remote'a Gönderdiyseniz)

**UYARI**: Bu işlem GitHub/GitLab gibi uzak sunuculardaki geçmişi değiştirir!

```powershell
git push origin --force --all
```

---

## 🤔 Hangisini Yapmalıyım?

### Test: Git Kullanıyor muyum?

```powershell
cd D:\Projem
git log --all --oneline -- .env.example
```

**Sonuç boşsa**: Hiç commit etmemişsiniz → **Senaryo 1** yapın ✅  
**Sonuç varsa**: Daha önce commit etmişsiniz → **Senaryo 2** yapın ⚠️

---

## 🛡️ Gelecekte Sorun Yaşamamak İçin

1. **.env dosyanızı asla commit ETMEYİN**
   - `.gitignore` dosyanıza `.env` eklenerek otomatik engellenir

2. **.env.example sadece placeholder içermeli**
   - Gerçek değerler ASLA yazılmamalı

3. **Pre-commit Hook ekleyin** (Opsiyonel):
```bash
# .git/hooks/pre-commit
if git diff --cached --name-only | grep -q ".env$"; then
    echo "ERROR: .env dosyasını commit etmeye çalışıyorsunuz!"
    exit 1
fi
```

---

## 📞 Yardıma İhtiyacınız Olursa

Ben sizin için komutları çalıştırabilirim. Sadece hangi senaryodasınız söyleyin:
- "İlk kez git kullanıyorum" → Senaryo 1
- "Daha önce commit ettim" → Senaryo 2
