# 🚀 Huzur Uygulaması - Play Store Yayın Rehberi

## 1️⃣ Ön Gereksinimler

### Google Play Console Hesabı
- [ ] Google Play Console hesabı aç: https://play.google.com/console
- [ ] 25$ tek seferlik kayıt ücreti öde
- [ ] Geliştirici hesap bilgilerini doldur

### Gerekli Dosyalar (Hazır ✅)
- [x] Uygulama ikonu (512x512) → `store_assets/app_icon_512.png`
- [x] Ekran görüntüleri (4 adet) → `store_assets/screenshot_*.png`
- [ ] Feature Graphic (1024x500) → Manuel tasarla (Canva önerilir)
- [x] Store açıklamaları → `PLAY_STORE_CONTENT.md`

---

## 2️⃣ Signed APK/AAB Oluşturma

### Adım 1: Android Studio'yu Aç
```bash
npx cap open android
```

### Adım 2: Keystore Oluştur (İlk kez)
1. **Build → Generate Signed Bundle / APK**
2. **Android App Bundle** seç (Play Store için gerekli)
3. **Create new...** tıkla
4. Keystore bilgilerini doldur:
   - Key store path: `D:\Projem\android\huzur-release.jks`
   - Password: (güçlü şifre belirle - KAYDET!)
   - Alias: `huzur-key`
   - Key password: (aynı veya farklı şifre)
   - Validity: 25 years
   - Certificate: Adınız, şirket bilgileri

⚠️ **ÖNEMLİ**: Keystore dosyasını ve şifreleri GÜVENLİ yerde sakla! Kaybedersen uygulamayı güncelleyemezsin.

### Adım 3: AAB Oluştur
1. Keystore bilgilerini gir
2. **release** seç
3. **Finish** tıkla
4. Dosya: `android/app/release/app-release.aab`

---

## 3️⃣ Play Console'da Uygulama Oluşturma

### Adım 1: Yeni Uygulama
1. Play Console → **Uygulama oluştur**
2. Varsayılan dil: **Türkçe**
3. Uygulama adı: **Huzur - Namaz Vakitleri & Kuran**
4. Uygulama veya oyun: **Uygulama**
5. Ücretsiz veya ücretli: **Ücretsiz**

### Adım 2: Store Listesi
1. **Büyüme → Store listesi → Ana store listesi**
2. Bilgileri `PLAY_STORE_CONTENT.md` dosyasından kopyala:
   - Kısa açıklama
   - Tam açıklama
3. Grafikleri yükle:
   - Uygulama simgesi (512x512)
   - Feature graphic (1024x500)
   - Ekran görüntüleri (min 2, max 8)

### Adım 3: İçerik Derecelendirmesi
1. **Politika → Uygulama içeriği → İçerik derecelendirmesi**
2. Anketi doldur (din/manevi içerik)
3. Sonuç: Muhtemelen **3+** veya **Herkes**

### Adım 4: Gizlilik Politikası
1. **Politika → Uygulama içeriği → Gizlilik politikası**
2. URL gir (GitHub Pages veya kendi siteniz)
   - Örnek: `https://username.github.io/huzur-privacy-policy`

---

## 4️⃣ AAB Yükleme ve Yayın

### Adım 1: Dahili Test (Önerilir)
1. **Test → Dahili test**
2. **Yeni sürüm oluştur**
3. AAB dosyasını yükle
4. Sürüm notları yaz
5. **İncelemeye gönder**

### Adım 2: Üretim Yayını
1. Dahili test başarılıysa → **Üretim**
2. **Yayınlamaya başla**
3. Google incelemesi: 3-7 gün

---

## 5️⃣ Kontrol Listesi

### Yayın Öncesi
- [ ] Keystore oluşturuldu ve saklandı
- [ ] AAB dosyası oluşturuldu
- [ ] Play Console hesabı aktif
- [ ] Store listesi dolduruldu
- [ ] Grafikler yüklendi
- [ ] İçerik derecelendirmesi tamamlandı
- [ ] Gizlilik politikası URL'si girildi

### Yayın Sonrası
- [ ] Dahili test yapıldı
- [ ] Üretim sürümü yayınlandı
- [ ] Google incelemesi geçti

---

## 📞 Yardım

Herhangi bir adımda takılırsan bana sor!
