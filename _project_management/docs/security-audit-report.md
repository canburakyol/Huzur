# Huzur App - Güvenlik Denetim Raporu

**Tarih:** 2026-02-01  
**Denetim Türü:** A'dan Z'ye Güvenlik Taraması  
**Platform:** Android (Capacitor + React)

---

## 🎯 Özet

Bu rapor, Huzur App'in kaynak kodunun tamamının güvenlik açısından detaylı analizini içerir. Genel olarak uygulama iyi güvenlik pratiklerine sahip ancak bazı kritik ve orta seviye güvenlik açıkları tespit edilmiştir.

**Risk Dağılımı:**
- 🔴 Kritik: 3 adet
- 🟡 Orta: 5 adet  
- 🟢 Düşük: 4 adet

---

## 🔴 Kritik Güvenlik Açıkları

### 1. API Anahtarlarının Client-Side Bulunması

**Dosyalar:**
- [`firebase.js:8-15`](src/services/firebase.js:8) - Firebase config
- [`geminiService.js:130`](src/services/geminiService.js:130) - Gemini API key
- [`revenueCatService.js:9-12`](src/services/revenueCatService.js:9) - RevenueCat keys
- [`nativeAdService.js:6-8`](src/services/nativeAdService.js:6) - AdMob IDs

**Risk:** API anahtarları derleme sonrası JavaScript bundle'ına gömülür ve tersine mühendislikle kolayca çıkarılabilir.

**Etki:**
- Firebase veritabanına yetkisiz erişim
- Gemini API kotasının tüketilmesi
- AdMob sahtekarlığı (ad fraud)
- RevenueCat bypass

**Çözüm:**
```javascript
// ❌ Mevcut (Güvensiz)
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// ✅ Önerilen (Güvenli)
// API çağrıları Cloud Functions üzerinden yapılmalı
const generateContent = async (prompt) => {
  const result = await httpsCallable(functions, 'generateGeminiContent')({ prompt });
  return result.data;
};
```

**Öncelik:** 🔴 Kritik - Hemen düzeltilmeli

---

### 2. window.debugLat / window.debugLon Global Değişkenleri

**Dosyalar:**
- [`useLocationConsent.js:68-69`](src/hooks/useLocationConsent.js:68)
- [`useLocationConsent.js:80-81`](src/hooks/useLocationConsent.js:80)
- [`useLocationConsent.js:113-114`](src/hooks/useLocationConsent.js:113)
- [`useLocationConsent.js:122-123`](src/hooks/useLocationConsent.js:122)
- [`useLocationConsent.js:129-130`](src/hooks/useLocationConsent.js:129)

**Risk:** Kullanıcı konum bilgisi global `window` nesnesine atanıyor.

```javascript
window.debugLat = latitude;
window.debugLon = longitude;
```

**Etki:**
- XSS saldırısı durumunda saldırgan konum bilgisine erişebilir
- Üçüncü parti script'ler konum bilgisini okuyabilir

**Çözüm:**
```javascript
// ❌ Mevcut
debugLat = latitude;

// ✅ Önerilen - Debug modunda bile module-scope kullan
const debugCoords = { lat: latitude, lon: longitude };
// veya tamamen kaldır
```

**Öncelik:** 🔴 Kritik - Production'da kaldırılmalı

---

### 3. localStorage'da Hassas Veri Saklama

**Dosyalar:**
- [`constants.js:218`](src/constants.js:218) - `GEMINI_API_KEY` storage key
- [`analyticsService.js:231`](src/services/analyticsService.js:231) - User ID
- [`authService.js:40`](src/services/authService.js:40) - Eski user ID

**Risk:** localStorage şifrelenmemiş ve her JavaScript kodu tarafından okunabilir.

**Etki:**
- XSS saldırısında tüm veriler çalınabilir
- Kötü amaçlı eklentiler verilere erişebilir

**Çözüm:**
```javascript
// ❌ Mevcut
localStorage.setItem('analytics_user_id', userId);

// ✅ Önerilen - secureStorage kullan
await secureStorage.setString(SECURE_STORAGE_KEYS.USER_ID, userId);
```

**Öncelik:** 🔴 Kritik - Hassas veriler secureStorage'a taşınmalı

---

## 🟡 Orta Seviye Güvenlik Açıkları

### 4. Math.random() Kullanımı (Kısmen Çözüldü)

**Durum:** `familyService.js` ve `streakService.js` çözüldü ✅  
**Kalan:**
- [`notificationService.js:32`](src/services/notificationService.js:32)
- [`fcmService.js:103`](src/services/fcmService.js:103)
- [`dailyTasksService.js:28`](src/services/dailyTasksService.js:28)
- [`data/hikmetData.js:83`](src/data/hikmetData.js:83)
- [`data/hadiths.js:775`](src/data/hadiths.js:775)
- [`data/esmaUlHusnaData.js:108`](src/data/esmaUlHusnaData.js:108)

**Risk:** Bildirim ID çakışmaları, tahmin edilebilir davranış

**Öncelik:** 🟡 Orta

---

### 5. console.log Kullanımı (Kısmen Çözüldü)

**Durum:** Ana servisler çözüldü ✅  
**Kalan Dosyalar:**
- [`firebase.js:31,34`](src/services/firebase.js:31)
- [`storageService.js`](src/services/storageService.js) - 5 adet
- [`secureStorage.js`](src/services/secureStorage.js) - 7 adet
- [`fcmService.js:91`](src/services/fcmService.js:91)
- [`analyticsService.js`](src/services/analyticsService.js) - 4 adet
- [`quranService.js`](src/services/quranService.js) - 3 adet

**Risk:** Logcat üzerinden bilgi sızıntısı

**Öncelik:** 🟡 Orta

---

### 6. Input Validasyon Eksikliği

**Dosyalar:**
- [`familyService.js`](src/services/familyService.js) - Grup ismi validasyonu yok
- [`geminiService.js`](src/services/geminiService.js) - Prompt validasyonu sınırlı

**Risk:** Injection saldırıları, XSS

**Örnek:**
```javascript
// ❌ Mevcut - Validasyon yok
const fullPrompt = `${systemPrompt}\n\nKullanıcı Sorusu: ${prompt}`;

// ✅ Önerilen
const sanitizeInput = (input) => {
  return input.replace(/[<>\"']/g, '');
};
const fullPrompt = `${systemPrompt}\n\nKullanıcı Sorusu: ${sanitizeInput(prompt)}`;
```

**Öncelik:** 🟡 Orta

---

### 7. Rate Limiting Eksikliği (Kısmen Var)

**Durum:** `geminiService.js` throttle mekanizması var ✅  
**Eksik:** Diğer API çağrılarında rate limiting yok

**Risk:** API abuse, DDoS

**Öncelik:** 🟡 Orta

---

### 8. Error Handling Bilgi Sızıntısı

**Dosyalar:**
- [`errorHandler.js`](src/services/errorHandler.js) - Detaylı hata bilgisi loglanıyor

**Risk:** Stack trace'ler saldırganlara sistem bilgisi verebilir

**Öncelik:** 🟡 Orta

---

## 🟢 Düşük Seviye Güvenlik Açıkları

### 9. VITE_APP_SECRET Kullanımı

**Dosya:** [`secureStorage.js:235`](src/services/secureStorage.js:235)

```javascript
const str = `${active}-${expiresAt}-${verifiedBy}-${import.meta.env.VITE_APP_SECRET || 'huzur-default'}`;
```

**Risk:** Client-side secret tersine mühendislikle bulunabilir

**Not:** Bu sadece client-side integrity check için kullanılıyor, kritik değil

**Öncelik:** 🟢 Düşük

---

### 10. Throttle State Module-Level

**Dosya:** [`geminiService.js:28-31`](src/services/geminiService.js:28)

```javascript
const throttleState = {
  lastRequestTime: 0,
  requestTimestamps: [],
};
```

**Risk:** Uygulama yeniden başlatıldığında throttle state sıfırlanır

**Öncelik:** 🟢 Düşük - Kabul edilebilir

---

### 11. localStorage JSON Parse Hatası Riski

**Dosyalar:** Birden fazla dosyada

```javascript
const data = JSON.parse(localStorage.getItem('key'));
```

**Risk:** Corrupted data durumunda uygulama crash edebilir

**Öncelik:** 🟢 Düşük

---

### 12. HTTP (Non-HTTPS) API Çağrıları

**Durum:** Tüm API çağrıları HTTPS kullanıyor ✅

**Kontrol Edilen:**
- Open-Meteo API ✅
- BigDataCloud API ✅  
- Firebase ✅
- Gemini API ✅

**Öncelik:** 🟢 Düşük - Sorun yok

---

## ✅ İyi Güvenlik Pratikleri

### 1. Anonymous Auth ✅
[`authService.js`](src/services/authService.js) - Firebase Anonymous Auth kullanıyor, güvenli

### 2. App Check ✅
[`firebase.js:25-36`](src/services/firebase.js:25) - Play Integrity entegre edilmiş

### 3. Secure Storage ✅
[`secureStorage.js`](src/services/secureStorage.js) - Capacitor Preferences kullanıyor (şifreli)

### 4. Pro Status Integrity Check ✅
[`secureStorage.js:233-243`](src/services/secureStorage.js:233) - Temper detection var

### 5. Logger Implementation ✅
[`logger.js`](src/utils/logger.js) - Production'da logları devre dışı bırakıyor

### 6. Throttling ✅
[`geminiService.js:20-31`](src/services/geminiService.js:20) - Rate limiting mekanizması var

### 7. Error Boundary ✅
[`main.jsx:22`](src/main.jsx:22) - React Error Boundary kullanılıyor

---

## 📊 Risk Matrisi

| Güvenlik Açığı | Seviye | Çözüm Karmaşıklığı | Öncelik |
|----------------|--------|-------------------|---------|
| API Keys in Bundle | 🔴 Kritik | Yüksek | P0 |
| window.debugLat/Lon | 🔴 Kritik | Düşük | P0 |
| localStorage Hassas Veri | 🔴 Kritik | Orta | P0 |
| Math.random() (kalan) | 🟡 Orta | Düşük | P1 |
| console.log (kalan) | 🟡 Orta | Düşük | P1 |
| Input Validasyon | 🟡 Orta | Orta | P1 |
| Rate Limiting (diğer) | 🟡 Orta | Orta | P2 |
| Error Info Leak | 🟡 Orta | Düşük | P2 |
| VITE_APP_SECRET | 🟢 Düşük | Düşük | P3 |

---

## 🎯 Önerilen Aksiyon Planı

### Faz 1: Kritik (Bu Hafta)
1. API anahtarlarını Cloud Functions'a taşı
2. `window.debugLat/debugLon` kaldır
3. Hassas verileri secureStorage'a taşı

### Faz 2: Orta (Önümüzdeki Hafta)
4. Kalan `Math.random()` düzelt
5. Kalan `console.log` temizle
6. Input validasyon ekle

### Faz 3: İyileştirme (Opsiyonel)
7. Rate limiting genişlet
8. Error handling iyileştir

---

## Sonuç

Huzur App genel olarak iyi güvenlik pratiklerine sahip. Ancak **API anahtarlarının client-side bulunması** ve **konum bilgisinin global değişkende saklanması** kritik sorunlar. Bu iki konu çözüldüğünde uygulamanın güvenlik seviyesi çok daha yüksek olacaktır.

**Acil aksiyon:** API anahtarlarını Cloud Functions'a taşımak.
