# E2E Testing Guide for Huzur App

Bu doküman, Huzur App'in Playwright ile E2E test altyapısını ve kullanımını açıklar.

## 📋 İçindekiler

- [Kurulum](#kurulum)
- [Test Çalıştırma](#test-çalıştırma)
- [Test Yapısı](#test-yapısı)
- [Mock Veri Tespiti](#mock-veri-tespiti)
- [CI/CD Entegrasyonu](#cicd-entegrasyonu)

## 🚀 Kurulum

Playwright zaten projeye dahil edilmiştir. İlk kurulum için:

```bash
npm install
npx playwright install
```

## 🧪 Test Çalıştırma

### Tüm testleri çalıştır
```bash
npm run test:e2e
```

### UI modunda çalıştır (geliştirme için)
```bash
npm run test:e2e:ui
```

### Debug modunda çalıştır
```bash
npm run test:e2e:debug
```

### Belirli bir test dosyasını çalıştır
```bash
npx playwright test e2e/tests/family-mode.spec.js
```

### Rapor görüntüle
```bash
npm run test:report
```

## 📁 Test Yapısı

```
e2e/
├── tests/
│   ├── navigation.spec.js        # Ana sayfa ve navigasyon testleri
│   ├── family-mode.spec.js       # Aile Modu testleri
│   ├── features.spec.js          # Tüm özelliklerin temel testleri
│   └── mock-data-detection.spec.js # Mock veri tespit testleri
├── utils/
│   └── test-helpers.js           # Test yardımcı fonksiyonları
├── results/                      # Ekran görüntüleri ve raporlar
└── playwright.config.js          # Playwright yapılandırması
```

## 🔍 Mock Veri Tespiti

Testler, uygulamadaki mock verileri otomatik olarak tespit eder:

### Tespit Edilen Mock Veriler

#### Family Mode - Home Tab
- **Aktivite Beslemesi**: Ahmet, Zeynep, Fatma (Anne) gibi sabit kullanıcı adları
- **Aile Hatmi**: Sabit ilerleme değeri (15/30 cüz)

#### Family Mode - Challenges Tab
- **Aile Hatmi**: 15/30 cüz (hardcoded)
- **Sabah Namazı Yarışması**: 3/7 gün (hardcoded)
- **Günlük Zikir**: 6500/10000 zikir (hardcoded)

#### Family Mode - Dashboard Tab
- **Çocuk İstatistikleri**: Sabit değerler (3/5 namaz, 2 sayfa, 100 zikir, 5 görev)
- **Takdir Mesajları**: "Anne" tarafından gönderilmiş mock mesaj

#### TODO Yorumları
- `handleSendAppreciation`: Takdir mesajı gönderme fonksiyonu implemente edilmemiş

## 📝 Test Sonuçları

Test sonuçları şu konumlarda saklanır:

- **HTML Rapor**: `playwright-report/index.html`
- **JSON Rapor**: `e2e/results/test-results.json`
- **Ekran Görüntüleri**: `e2e/results/*.png`
- **Videolar**: `test-results/` (sadece başarısız testler için)

## 🔧 CI/CD Entegrasyonu

GitHub Actions ile otomatik test çalıştırma:

```yaml
# .github/workflows/e2e-tests.yml
```

Her push ve pull request'te testler otomatik çalışır.

## 🎯 Test Stratejisi

### Öncelikli Testler
1. **Kritik Özellikler**: Namaz vakitleri, Kıble, Kuran
2. **Aile Modu**: Yarışmalar sekmesi, grup yönetimi
3. **Mock Veri**: Tespit edilen mock verilerin gerçek veriyle değiştirilmesi

### Test Kategorileri

| Kategori | Test Sayısı | Durum |
|----------|-------------|-------|
| Navigation | 4 | ✅ Hazır |
| Family Mode | 9 | ✅ Hazır |
| Core Features | 2 | ✅ Hazır |
| Ibadet Features | 3 | ✅ Hazır |
| Content Features | 2 | ✅ Hazır |
| Mock Detection | 5 | ✅ Hazır |

## 🐛 Bilinen Sorunlar

### Family Mode - Yarışmalar Sekmesi
- **Sorun**: Mock veri kullanımı
- **Çözüm**: Firestore'dan gerçek veri çekilmeli
- **Dosya**: `src/components/FamilyMode.jsx`

### Aile Hatmi
- **Sorun**: Sabit 15/30 ilerleme değeri
- **Çözüm**: Firestore'dan dinamik veri çekilmeli
- **Dosya**: `src/components/FamilyMode.jsx` (satır 678)

### Takdir Sistemi
- **Sorun**: `handleSendAppreciation` fonksiyonu boş
- **Çözüm**: Firestore entegrasyonu eklenmeli
- **Dosya**: `src/components/FamilyMode.jsx` (satır 550-553)

## 📊 Test Raporu Örneği

```json
{
  "familyMode": {
    "homeTab": ["Contains mock activity data"],
    "challengesTab": ["Hardcoded challenge progress"],
    "dashboardTab": ["Mock child statistics"]
  }
}
```

## 🔄 Güncelleme Planı

1. **Phase 1**: Mock verileri tespit et ✅
2. **Phase 2**: Mock verileri gerçek veriyle değiştir
3. **Phase 3**: Eksik fonksiyonları implemente et
4. **Phase 4**: Tüm testleri geçir

## 📞 Destek

Testlerle ilgili sorular için:
- Playwright dokümantasyonu: https://playwright.dev
- Proje README: `README.md`
- Test raporları: `playwright-report/index.html`