# Huzur Projesi - Firebase DAU/MAU Entegrasyon Planı

## Genel Bakış
Firebase Analytics GA4 üzerinden Daily Active Users (DAU) ve Monthly Active Users (MAU) verilerini çekmek için Cloud Function endpoint'i oluşturulacak.

## Mevcut Durum
- Firebase Projesi: `huzur-app-c01b7`
- Firebase Analytics: GA4 (Google Analytics 4) kullanılıyor
- Cloud Functions: Node.js 22 runtime, `europe-west1` bölgesi

## Gereksinimler
1. **Google Analytics Data API** - Firebase projesine bağlı GA4 property ID
2. **Service Account** - Cloud Function'ın GA4 verilerine erişimi için

## Uygulama Adımları

### 1. GA4 Property ID'yi Bulma
Firebase Console → Analytics → Reports veya Google Analytics Console üzerinden property ID alınır.
**Property ID: 123456789**
Format: `properties/123456789`

### 2. Cloud Function Oluşturma
`functions/index.js` dosyasına yeni endpoint ekle:

```javascript
// getAnalyticsStats - DAU/MAU endpoint
exports.getAnalyticsStats = onCall(
  { region: REGION },
  async (request) => {
    // GA4 Data API kullanarak DAU/MAU çek
  }
);
```

### 3. Bağımlılık Ekleme
`functions/package.json`'a `@google-analytics/data` paketi ekle.

### 4. Client Service Oluşturma
`src/services/analyticsStatsService.js` - Frontend için veri çekme servisi.

## Teknik Detaylar

### DAU Hesaplama
- Son 1 gün (today) için `activeUsers` metriği
- `dateRanges: [{ startDate: 'yesterday', endDate: 'today' }]`

### MAU Hesaplama  
- Son 30 gün için `activeUsers` metriği
- `dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }]`

## Örnek Çıktı
```json
{
  "dau": 1250,
  "mau": 8500,
  "dauChange": 5.2,
  "mauChange": -2.1,
  "date": "2024-01-15"
}
```

## İmplementasyon Durumu ✅

### Tamamlandı:
1. ✅ Cloud Function - `functions/index.js` - `getAnalyticsStats` endpoint
2. ✅ Bağımlılık - `functions/package.json` - `@google-analytics/data` eklendi
3. ✅ Client Service - `src/services/analyticsStatsService.js` oluşturuldu

### Kullanım:

```javascript
import { getAnalyticsStats, getDAU, getMAU, getDAUChange, getMAUChange } from './services/analyticsStatsService';

// Tüm istatistikleri al
const stats = await getAnalyticsStats();
console.log(stats.dau, stats.mau);

// Sadece DAU al
const dau = await getDAU();

// Sadece MAU al  
const mau = await getMAU();

// Değişim oranlarını al
const dauChange = await getDAUChange();
const mauChange = await getMAUChange();
```

## Deploy Adımları
1. `cd functions && npm install` - Bağımlılıkları kur
2. `firebase deploy --only functions` - Cloud Function'ı deploy et
3. Test etmek için client'da service'i kullan
