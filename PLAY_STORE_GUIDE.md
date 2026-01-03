# Play Store Yükleme Rehberi

## 📋 Checklist - Play Store'a Yüklemeden Önce

### ✅ Tamamlananlar

- [x] Android izinleri eklendi (LOCATION, NOTIFICATION)
- [x] App metadata güncellendi (title, description, version)
- [x] Hata yönetimi eklendi
- [x] Loading state'leri eklendi
- [x] Privacy Policy sayfası eklendi
- [x] Terms of Service sayfası eklendi
- [x] ProGuard kuralları eklendi
- [x] Release build optimizasyonu yapıldı

### ⏳ Yapılması Gerekenler

#### 1. App Icon ve Görseller
- [ ] 512x512 PNG app icon (Play Store için)
- [ ] 1024x1024 PNG app icon (Play Store için)
- [ ] Feature graphic (1024x500 PNG)
- [ ] Screenshots (en az 2, tercihen 4-8 adet)
  - Telefon: 16:9 veya 9:16 oran
  - Tablet: 16:9 veya 9:16 oran

#### 2. Signing Key
- [ ] Release signing key oluşturulmalı
- [ ] KeyStore dosyası güvenli yerde saklanmalı
- [ ] KeyStore şifresi kaydedilmeli

#### 3. App Bilgileri
- [ ] Uygulama adı: "Huzur - Namaz ve Dua"
- [ ] Kısa açıklama (80 karakter max)
- [ ] Uzun açıklama (4000 karakter max)
- [ ] Kategori: Dini / Yaşam Tarzı
- [ ] İçerik derecelendirmesi

#### 4. Privacy Policy
- [ ] Privacy Policy URL (web sitesi gerekli)
- [ ] Veya uygulama içinde gösterilebilir (mevcut)

#### 5. Test
- [ ] Release build test edilmeli
- [ ] Tüm özellikler çalışıyor olmalı
- [ ] Bildirimler test edilmeli
- [ ] Konum izinleri test edilmeli

## 🚀 Build Adımları

### 1. Release Keystore Oluşturma

```bash
keytool -genkey -v -keystore huzur-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias huzur
```

### 2. Android Build Yapılandırması

`android/app/build.gradle` dosyasına signing config ekleyin:

```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file('path/to/huzur-release-key.jks')
            storePassword 'your-store-password'
            keyAlias 'huzur'
            keyPassword 'your-key-password'
        }
    }
    buildTypes {
        release {
            ...
            signingConfig signingConfigs.release
        }
    }
}
```

### 3. Release Build

```bash
# 1. Web build
npm run build

# 2. Capacitor sync
npx cap sync android

# 3. Android Studio'da aç
npx cap open android

# 4. Android Studio'da:
# - Build > Generate Signed Bundle / APK
# - Android App Bundle (AAB) seçin (önerilen)
# - veya APK seçin
```

## 📝 Play Store Listing Bilgileri

### Kısa Açıklama (80 karakter)
```
Günlük namaz vakitleri, Kuran, dualar ve dini içerikler. Huzur ile dini hayatınızı organize edin.
```

### Uzun Açıklama Örneği

```
Huzur, modern ve kullanıcı dostu bir İslami mobil uygulamadır. 

🌟 ÖZELLİKLER:

📿 Namaz Vakitleri
Günlük namaz vakitlerini otomatik olarak gösterir. Konumunuzu kullanarak doğru vakitleri hesaplar ve bildirimlerle hatırlatır.

📖 Kuran-ı Kerim
114 sureyi Arapça metin ve Türkçe meal ile okuyabilirsiniz. Farklı hafızların sesli okumalarını dinleyebilirsiniz.

🤲 Dualar
Kategorize edilmiş geniş dua koleksiyonu. Her dua için Arapça metin, okunuşu ve anlamı.

🧭 Kıble Pusulası
Kıble yönünü kolayca bulun. Pusula ile doğru yönü gösterir.

🕌 Cami Bulucu
Yakınınızdaki camileri bulun ve yön tarifi alın.

📿 Zikir Sayacı
Günlük zikirlerinizi sayın ve takip edin.

📅 Günlük İçerik
Her gün farklı Esma-ül Hüsna, ayet ve dua ile manevi hayatınızı zenginleştirin.

🌤️ Hava Durumu
Konum bazlı hava durumu bilgisi.

🔔 Bildirimler
Namaz vakitleri için otomatik hatırlatmalar.

Huzur, yaşlı dostu arayüzü ve sade tasarımı ile herkesin kolayca kullanabileceği bir uygulamadır.

Ücretsiz ve reklamsız.
```

### Kategoriler
- Ana kategori: Yaşam Tarzı / Dini
- İkincil kategori: Eğitim

### İçerik Derecelendirmesi
- Yaş: Herkes için uygun
- Şiddet: Yok
- Cinsel içerik: Yok

## 🔐 Güvenlik Notları

1. **KeyStore Güvenliği**: KeyStore dosyasını ve şifrelerini güvenli yerde saklayın
2. **API Keys**: Eğer API key kullanıyorsanız, bunları güvenli tutun
3. **ProGuard**: Release build'de aktif, kod koruması için

## 📞 Destek

Play Store'da uygulama yayınlandıktan sonra:
- Kullanıcı geri bildirimlerini takip edin
- Hata raporlarını düzenli kontrol edin
- Güncellemeleri düzenli yayınlayın

## 📊 İstatistikler

Play Console'da takip edilecekler:
- İndirme sayıları
- Kullanıcı geri bildirimleri
- Crash raporları
- Performans metrikleri



