# Huzur - Namaz ve Dua Uygulaması

Modern, kullanıcı dostu İslami mobil uygulama. Namaz vakitleri, Kuran-ı Kerim, dualar ve daha fazlası.

## 🌟 Özellikler

- ✅ **Namaz Vakitleri**: Günlük namaz vakitleri ve hatırlatmalar
- ✅ **Kuran-ı Kerim**: 114 sure, Arapça metin ve Türkçe meal
- ✅ **Dualar**: Kategorize edilmiş dua koleksiyonu
- ✅ **Zikir Sayacı**: Günlük zikir takibi
- ✅ **Kıble Pusulası**: Kıble yönünü bulma
- ✅ **Cami Bulucu**: Yakındaki camileri bulma
- ✅ **Namaz Takibi**: Kaza namazları takibi
- ✅ **Günlük İçerik**: Esma-ül Hüsna, günün ayeti ve duası
- ✅ **Hava Durumu**: Konum bazlı hava durumu
- ✅ **Bildirimler**: Namaz vakitleri hatırlatmaları

## 🚀 Kurulum

### Gereksinimler

- Node.js 22 LTS (önerilen: 22.x)
- npm veya yarn
- Android Studio (Android build için)
- Java JDK 11+

### Adımlar

1. **Bağımlılıkları yükleyin:**
```bash
npm install
```

2. **Geliştirme sunucusunu başlatın:**
```bash
npm run dev
```

3. **Production build:**
```bash
npm run build
```

4. **Android build için:**
```bash
# Capacitor sync
npx cap sync android

# Android Studio'da aç
npx cap open android
```

## 📱 Android Build

### Release APK/AAB Oluşturma

1. Android Studio'yu açın
2. `Build > Generate Signed Bundle / APK` seçin
3. Keystore oluşturun veya mevcut keystore'u kullanın
4. Release build'i oluşturun

### Play Store için Gereksinimler

- ✅ App icon (512x512, 1024x1024)
- ✅ Feature graphic (1024x500)
- ✅ Screenshots (en az 2 adet)
- ✅ Privacy Policy URL
- ✅ Terms of Service URL
- ✅ App description (kısa ve uzun)
- ✅ Category seçimi

## 🛠️ Teknolojiler

- **React 19**: UI framework
- **Vite 7**: Build tool
- **Capacitor 7**: Native bridge
- **Lucide React**: Icon library
- **Axios**: HTTP client
- **date-fns**: Date utilities

## 📦 Proje Yapısı

```
src/
├── components/      # React bileşenleri
├── services/       # API servisleri
├── data/          # Statik veriler
└── App.jsx        # Ana uygulama
```

## 🔧 Yapılandırma

### API Endpoints

- **Namaz Vakitleri**: Aladhan API
- **Kuran**: Al Quran Cloud API
- **Hava Durumu**: Open-Meteo API
- **Konum**: BigDataCloud API

### İzinler

- `INTERNET`: API çağrıları için
- `ACCESS_FINE_LOCATION`: Konum bazlı özellikler için
- `POST_NOTIFICATIONS`: Bildirimler için

## 📄 Lisans

Bu proje özel bir projedir.

## 👥 İletişim

Sorularınız için lütfen iletişime geçin.

## 🔄 Versiyon Geçmişi

### v1.0.0 (2024)
- İlk release
- Temel özellikler
- Play Store hazırlığı
