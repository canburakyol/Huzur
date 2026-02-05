# Cloud Functions Kurulum Rehberi

## 🔐 API Anahtarı Güvenliği

Gemini API anahtarı artık **client-side'dan kaldırıldı** ve **Cloud Functions'a taşındı**.

---

## 📋 Kurulum Adımları

### 1. Firebase CLI Kurulumu

```bash
npm install -g firebase-tools
```

### 2. Firebase Login

```bash
firebase login
```

### 3. Gemini API Anahtarını Ayarla

```bash
firebase functions:config:set gemini.api_key="YOUR_GEMINI_API_KEY"
```

**Not:** API anahtarını [Google AI Studio](https://makersuite.google.com/app/apikey)'dan alabilirsiniz.

### 4. RevenueCat API Anahtarını Ayarla (Zaten varsa atla)

```bash
firebase functions:config:set revenuecat.api_key="YOUR_REVENUECAT_SECRET_API_KEY"
firebase functions:config:set revenuecat.webhook_token="YOUR_WEBHOOK_TOKEN"
```

### 5. Functions'ı Deploy Et

```bash
cd functions
npm install
firebase deploy --only functions
```

---

## 🚀 Deploy Edilen Functions

| Function | Amaç | Trigger |
|----------|------|---------|
| `generateGeminiContent` | Gemini API çağrıları | HTTPS Callable |
| `queryNuzulSebebi` | Nüzul sebebi sorguları | HTTPS Callable |
| `checkProStatus` | Pro subscription kontrolü | HTTPS Callable |
| `syncProStatus` | RevenueCat senkronizasyonu | HTTPS Callable |
| `revenueCatWebhook` | RevenueCat webhook handler | HTTPS Request |

---

## 🔒 Güvenlik Özellikleri

### 1. Authentication Zorunluluğu
Tüm functions `context.auth` kontrolü yapar. Giriş yapmadan kullanılamaz.

### 2. Rate Limiting
- Dakikada maksimum 10 istek / kullanıcı
- Client-side da ek throttle koruması var

### 3. Input Sanitization
- XSS koruması
- 2000 karakter limiti
- HTML tag temizleme

### 4. API Anahtarı Gizliliği
- API anahtarı sadece server-side (Cloud Functions)
- Client'ta hiçbir API anahtarı görünmüyor

---

## 🧪 Test Etme

### Emulator'da Test

```bash
firebase emulators:start --only functions
```

### Production'da Test

```javascript
// Client'ta test
import { queryNuzulSebebi } from './services/geminiService';

const result = await queryNuzulSebebi('Fecr suresinin nüzul sebebi nedir?');
console.log(result);
```

---

## 📊 Maliyet

Firebase Spark (Ücretsiz) Plan:
- 50,000 function çağrısı / ay
- 2M GB-saniye compute / ay
- 400,000 GB-saniye networking / ay

Huzur app kullanımı bu limitlerin çok altında kalacaktır.

---

## 🐛 Hata Ayıklama

### Logları Görüntüle

```bash
firebase functions:log
```

### Belirli Function'ın Logları

```bash
firebase functions:log --only generateGeminiContent
```

---

## 🔄 Geri Alma (Rollback)

Eski versiyona dönmek için:

```bash
firebase functions:rollback
```

---

## ✅ Kontrol Listesi

- [ ] `firebase login` yapıldı
- [ ] `gemini.api_key` config'e eklendi
- [ ] `functions` klasöründe `npm install` yapıldı
- [ ] Functions deploy edildi
- [ ] Client'ta test edildi
- [ ] `.env` dosyasından `VITE_GEMINI_API_KEY` kaldırıldı
- [ ] Google Play Console'da yeni versiyon yüklendi

---

## 🆘 Destek

Sorun yaşarsanız:
1. Firebase Console > Functions > Logs kontrol edin
2. Client'ta browser console hatalarını kontrol edin
3. `firebase functions:log` ile server loglarını inceleyin