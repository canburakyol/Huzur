# 🎯 AI Günlük Koçu - Detaylı Strateji ve Maliyet Raporu

**Hazırlayan:** Kilo Code  
**Tarih:** 29 Ocak 2026  
**Proje:** AI Günlük Koçu Mobil Uygulaması

---

## 📋 İÇİNDEKİLER

1. [Hedef Ülke Seçimi](#1-hedef-ülke-seçimi)
2. [Rakip Analizi](#2-rakip-analizi)
3. [Kullanıcı Persona](#3-kullanıcı-persona)
4. [MVP Özellik Seti](#4-mvp-özellik-seti)
5. [Monetizasyon Stratejisi](#5-monetizasyon-stratejisi)
6. [Teknik Mimari](#6-teknik-mimari)
7. [Go-to-Market Stratejisi](#7-go-to-market-stratejisi)
8. [Risk Analizi](#8-risk-analizi)
9. [Detaylı Maliyet Analizi](#9-detaylı-maliyet-analizi)
10. [Gelir Projeksiyonu](#10-gelir-projeksiyonu)

---

## 1. HEDEF ÜLKE SEÇİMİ

### 🏆 Önerilen Strateji: Türkiye First, Global Expansion

| Ülke | Neden? | Zorluk | Öncelik |
|------|--------|--------|---------|
| **🇹🇷 Türkiye** | Yerel pazar bilgisi, düşük rekabet, maliyet avantajı | Döviz krizi, satın alma gücü | **Phase 1** |
| **🇩🇪 Almanya** | Türk diasporası, yüksek gelir | Yerelleştirme | Phase 2 |
| **🇬🇧 UK** | Büyük pazar, İngilizce içerik | Yüksek rekabet | Phase 3 |

### Türkiye Pazar Analizi

```
📊 Türkiye Mental Wellness Pazarı (2026)
├── Toplam Pazar: ~$150M
├── Büyüme Oranı: %25 Yıllık
├── Hedef Kitle: 18-35 yaş (25M kişi)
├── Akıllı Telefon Penetrasyonu: %92
└── Play Store Türkiye: #3 en büyük pazar (indirme bazlı)
```

**Neden Türkiye?**
1. **Düşük rekabet:** Headspace/Calm Türkçe desteği yok
2. **Kültürel boşluk:** Yerel içerik eksikliği
3. **Maliyet avantajı:** Düşük kullanıcı edinme maliyeti (CAC)
4. **Test pazarı:** Global açılım öncesi MVP validasyonu

---

## 2. RAKİP ANALİZİ

### Doğrudan Rakipler (Türkiye)

| Uygulama | Güçlü Yön | Zayıf Yön | Fırsatımız |
|----------|-----------|-----------|------------|
| **Meditopia** | Yerel marka, Türkçe | Sadece meditasyon | Geniş kapsamlı AI koç |
| **Faladdin** | Büyük kullanıcı tabanı | Astroloji odaklı | Bilimsel wellness |
| **Dolunay** | Günlük formatı | Basit özellikler | AI entegrasyonu |

### Global Rakipler

| Uygulama | Türkiye'de Durum | Zayıflığı |
|----------|------------------|-----------|
| **Headspace** | İngilizce only | Yerelleştirme yok |
| **Calm** | Sınırlı Türkçe | Yüksek fiyat ($70/yıl) |
| **Replika** | Var | Sohbet odaklı, wellness değil |

### 🎯 Farklılaştırma Stratejimiz

- **Türkçe + Yerel Kültür:** Ramazan modu, bayram rutinleri
- **Holistik Yaklaşım:** Ruh hali + alışkanlık + sosyal
- **Uygun Fiyat:** ₺49/ay vs $12/ay
- **Offline Özellikler:** Şebeke olmadan çalışır

---

## 3. KULLANICI PERSONA

### Primary Persona: "Stresli Zeynep"

```yaml
Demografik:
  Yaş: 24-32
  Cinsiyet: Kadın/Erkek
  Şehir: İstanbul, Ankara, İzmir
  Eğitim: Üniversite+
  Gelir: ₺25K-60K/ay

Psikografik:
  Meslek: Kurumsal çalışan, freelancer
  Pain Points:
    - "Kendime zaman ayıramıyorum"
    - "Sürekli tükenmiş hissediyorum"
    - "Sosyal medya bağımlılığı"
    - "Uyku sorunları"
  
Goals:
  - Günde 10 dk kendine zaman
  - Daha iyi uyku
  - Stres yönetimi
  - Üretkenlik artışı

Davranışlar:
  - Instagram/TikTok aktif kullanıcı
  - Podcast dinler
  - Mobil ödeme yapar
  - Ücretsiz denemeyi sever
```

### Secondary Persona: "Öğrenci Emre"

```yaml
Yaş: 18-24
Durum: Üniversite öğrencisi
Pain Points:
  - Sınav stresi
  - Odaklanma sorunu
  - Sosyal kaygı
Bütçe: ₺0-99/ay (öğrenci indirimi kritik)
```

---

## 4. MVP ÖZELLİK SETİ

### Phase 1 (Launch - 6 hafta)

| Modül | Özellik | Teknik Gereksinim |
|-------|---------|-------------------|
| **🎭 Ruh Hali Takibi** | Günlük mood girişi, grafikler | Local storage + Firebase |
| **🤖 AI Sohbet** | Günlük yansıtma, tavsiyeler | OpenAI API / Gemini |
| **📊 Alışkanlık Takibi** | 3-5 temel alışkanlık | Local notifications |
| **🧘 Mini Meditasyon** | 5-10 dk sesli meditasyonlar | Audio player |
| **📱 Widget** | Günlük hatırlatıcı | Android widget |

### Phase 2 (3 ay sonra)

- **Uyku Takibi:** Uyku kalitesi, uyanma rutinleri
- **Sosyal Özellikler:** Anonim topluluk, destek grupları
- **Journaling:** AI destekli günlük yazma
- **Premium İçerik:** Uzman seslendirmeleri

### Phase 3 (6 ay sonra)

- **Terapist Bağlantısı:** Online terapi entegrasyonu
- **Kurumsal:** B2B wellness paketleri
- **Global:** İngilizce versiyon

---

## 5. MONETİZASYON STRATEJİSİ

### Freemium Model

```
📱 Free Tier (Sınırsız kullanıcı)
├── Günlük ruh hali takibi
├── 3 temel alışkanlık
├── 5 temel meditasyon
├── Temel AI sohbet (günlük limit)
└── Reklamlar (AdMob)

💎 Premium Tier (₺49/ay veya ₺349/yıl)
├── Sınırsız AI sohbet
├── Tüm meditasyon kütüphanesi
├── Sınırsız alışkanlık
├── Gelişmiş analitik
├── Widget temaları
├── Offline mod
└── Aile paylaşımı (5 kişi)
```

### Gelir Projeksiyonu (Türkiye)

| Ay | Kullanıcı | Premium % | Gelir (₺) |
|----|-----------|-----------|-----------|
| 1 | 5,000 | 2% | 4,900 |
| 3 | 25,000 | 3% | 36,750 |
| 6 | 75,000 | 4% | 147,000 |
| 12 | 200,000 | 5% | 490,000 |

**Yıllık Hedef:** ₺5-8M gelir (Türkiye)

---

## 6. TEKNİK MİMARİ

### Mevcut Altyapı Kullanımı (Huzur'dan)

```yaml
Kullanılabilir Bileşenler:
  UI Framework: React 19 + Vite
  Native Bridge: Capacitor 8
  Auth: Firebase Auth
  Database: Firestore
  Storage: Firebase Storage
  Notifications: Capacitor Local Notifications
  Payments: RevenueCat (hazır!)
  Ads: AdMob (hazır!)
  
Yeni Eklenecekler:
  AI API: OpenAI GPT-4o mini / Gemini 1.5 Flash
  Audio: React audio player
  Charts: Recharts / Chart.js
  State: Zustand / Redux Toolkit
```

### AI Entegrasyon Mimarisı

```
Client App → Local Processing → Context Builder → 
Firebase Functions → AI API Gateway → OpenAI/Gemini → 
Response Cache
```

### AI Prompt Stratejisi

```typescript
// Günlük yansıtma prompt örneği
const dailyReflectionPrompt = {
  system: `Sen bir wellness koçusun. Adın "Zihin". 
           Kullanıcının ruh halini ve alışkanlıklarını analiz ederek 
           kişiselleştirilmiş, destekleyici ve pratik tavsiyeler ver.`,
  
  context: {
    userMood: user.todayMood,
    moodHistory: user.last7DaysMoods,
    habits: user.activeHabits,
    streak: user.currentStreak
  },
  
  output: {
    reflection: "Bugünkü ruh halinizin olası sebepleri...",
    suggestion: "Yarın deneyebileceğiniz bir şey...",
    encouragement: "Motivasyon mesajı..."
  }
};
```

---

## 7. GO-TO-MARKET STRATEJİSİ

### Launch Fazları

#### Pre-Launch (2 hafta)

```yaml
Hedef: 500 beta kullanıcı
Aktiviteler:
  - Arkadaş ve aile testi
  - Instagram/TikTok teaser içerik
  - Beta kayıt formu
  - Influencer erken erişim
```

#### Soft Launch (4 hafta)

```yaml
Hedef: 5,000 indirme
Kanallar:
  - Play Store ASO (Türkçe keyword optimizasyonu)
  - Instagram Reels (günlük wellness içerik)
  - TikTok (genç kitleye ulaşım)
  - Reddit r/Turkey (organik tartışma)
  - Product Hunt (global visibility)
```

#### Growth Phase (3 ay)

```yaml
Hedef: 50,000 aktif kullanıcı
Stratejiler:
  - Referans programı (1 ay premium hediye)
  - Influencer işbirlikleri (wellness, lifestyle)
  - Podcast sponsorlukları
  - Üniversite kulüpleri partnerliği
  - Kurumsal wellness pilot programı
```

### Marketing Bütçesi (İlk 6 ay)

| Kanal | Bütçe (₺) | Beklenen ROI |
|-------|-----------|--------------|
| Instagram/TikTok Ads | 50,000 | 3:1 |
| Influencer | 30,000 | 4:1 |
| ASO/SEO | 10,000 | 5:1 |
| Content Marketing | 10,000 | 6:1 |
| **Toplam** | **100,000** | **4:1** |

---

## 8. RİSK ANALİZİ

| Risk | Olasılık | Etki | Çözüm |
|------|----------|------|-------|
| **AI maliyetleri** | Orta | Yüksek | Caching, rate limiting, local AI |
| **Kullanıcı tutma** | Yüksek | Yüksek | Gamification, topluluk özellikleri |
| **Rekabet** | Düşük | Orta | Hızlı iterasyon, yerel içerik |
| **Regülasyon** | Düşük | Orta | Sağlık iddiası yapmama, disclaimer |
| **Ödeme altyapısı** | Orta | Orta | RevenueCat + alternatif ödeme |

---

## 9. DETAYLI MALİYET ANALİZİ

### 📊 ÖZET (İlk 6 Ay)

| Kategori | Maliyet (₺) | Maliyet ($) |
|----------|-------------|-------------|
| **Geliştirme** | 0 | $0 |
| **Operasyonel** | 45,000 | ~$1,300 |
| **Pazarlama** | 100,000 | ~$2,900 |
| **AI/API** | 18,000 | ~$520 |
| **Toplam** | **163,000** | **~$4,720** |

### 9.1 GELİŞTİRME MALİYETLERİ

### Avantajınız: Mevcut Altyapı

Mevcut **Huzur** projenizden **₺0** maliyetle taşıyabileceğiniz altyapı:

```yaml
Ücretsiz (Mevcut):
  React 19 + Vite: ✅ Huzur'da var
  Capacitor 8: ✅ Huzur'da var
  Firebase (Spark Plan): ✅ Ücretsiz tier
  RevenueCat: ✅ Ücretsiz başlangıç
  AdMob: ✅ Mevcut entegrasyon
  GitHub: ✅ Ücretsiz repo
  
Yeni Gereksinimler:
  UI Kütüphaneleri: Ücretsiz (MIT lisanslı)
  Chart Library: Recharts (ücretsiz)
  State Management: Zustand (ücretsiz)
```

### Geliştirme Süresi ve Maliyet

| Kaynak | Maliyet | Not |
|--------|---------|-----|
| Kendi geliştirme zamanınız | ₺0 | Siz yapıyorsunuz |
| AI asistan (Kilo Code) | ₺0 | Mevcut abonelik |
| Toplam Geliştirme | **₺0** | - |

### 9.2 OPERASYONEL MALİYETLER (Aylık)

### Firebase (Spark Plan → Blaze Plan)

```yaml
Spark Plan (Ücretsiz - İlk 3 ay):
  Auth: 50,000 kullanıcı/ay ücretsiz
  Firestore: 50,000 okuma/gün ücretsiz
  Storage: 1GB ücretsiz
  Functions: 2M çağrı/ay ücretsiz
  
Blaze Plan (Ödeme başlayınca):
  Tahmini kullanım (10K kullanıcı):
    Firestore: ~₺150/ay
    Auth: Ücretsiz
    Storage: ~₺50/ay
    Functions: ~₺100/ay
    Toplam: ~₺300/ay
```

### Diğer Operasyonel Giderler

| Hizmet | Aylık (₺) | Yıllık (₺) | Not |
|--------|-----------|------------|-----|
| Google Play Developer | - | 1,200 | Bir kerelik |
| Domain + SSL | 50 | 600 | - |
| E-posta servisi (Resend) | Ücretsiz | 0 | 3,000 mail/ay ücretsiz |
| Analytics (Firebase) | Ücretsiz | 0 | - |
| Error Tracking (Sentry) | Ücretsiz | 0 | 5,000 event/ay |
| **Toplam Operasyonel** | **~350** | **~4,200** | 3. aydan itibaren |

**İlk 6 Ay Toplam:** ~₺45,000

### 9.3 AI / API MALİYETLERİ

### OpenAI GPT-4o Mini (Önerilen)

```yaml
Fiyatlandırma:
  Input: $0.15 / 1M tokens
  Output: $0.60 / 1M tokens
  
Tahmini Kullanım (Günlük 1000 AI etkileşim):
  Ortalama token/istek: 500 input + 300 output
  Günlük maliyet: ~$0.12
  Aylık maliyet: ~$3.60 (~₺125)
  
Ölçeklendirme (10K günlük etkileşim):
  Aylık: ~$36 (~₺1,250)
```

### Maliyet Optimizasyon Stratejileri

| Strateji | Tasarruf | Uygulama |
|----------|----------|----------|
| **Caching** | %60 | Tekrar sorulara önbellekten yanıt |
| **Rate Limiting** | %30 | Günlük limit (free tier) |
| **Prompt Optimizasyonu** | %20 | Kısa, etkili promptlar |
| **Local AI (Gemini Nano)** | %80 | Cihaz üzerinde inference |

### AI Maliyet Projeksiyonu

| Ay | Günlük Kullanım | Aylık Maliyet (₺) |
|----|-----------------|-------------------|
| 1-2 | 500 | 60 |
| 3-4 | 2,000 | 250 |
| 5-6 | 5,000 | 600 |
| **6 Ay Toplam** | - | **~₺18,000** |

### 9.4 PAZARLAMA MALİYETLERİ

### İlk 6 Aylık Pazarlama Bütçesi

| Kanal | Aylık (₺) | 6 Ay (₺) | Beklenen Sonuç |
|-------|-----------|----------|----------------|
| **Meta Ads** (IG/FB) | 10,000 | 60,000 | 15,000 indirme |
| **TikTok Ads** | 5,000 | 30,000 | 10,000 indirme |
| **Influencer** | 5,000 | 30,000 | 25,000 erişim |
| **ASO/SEO** | 1,500 | 9,000 | Organik büyüme |
| **Content** | 1,500 | 9,000 | Marka bilinirliği |
| **Acil Durum** | - | 10,000 | Yedek bütçe |
| **Toplam** | **23,000** | **148,000** | - |

### Kullanıcı Edinme Maliyeti (CAC)

```
📊 Hedef Metrikler:
├── Toplam Bütçe: ₺100,000 (6 ay)
├── Hedef İndirme: 50,000
├── Ortalama CAC: ₺2.00 ($0.06)
├── Premium Dönüşüm: %4
├── Premium CAC: ₺50 ($1.45)
└── LTV (Lifetime Value): ₺420 ($12)

✅ LTV/CAC Oranı: 8.4 (Sağlıklı >3)
```

### 9.5 TOPLAM MALİYET TABLOSU

### İlk 6 Ay (MVP → Soft Launch)

| Kategori | Ay 1-2 | Ay 3-4 | Ay 5-6 | Toplam |
|----------|--------|--------|--------|--------|
| Geliştirme | 0 | 0 | 0 | 0 |
| Operasyonel | 1,200 | 2,400 | 3,600 | 7,200 |
| AI/API | 120 | 500 | 1,200 | 1,820 |
| Pazarlama | 15,000 | 35,000 | 50,000 | 100,000 |
| **Aylık Toplam** | **16,320** | **37,900** | **54,800** | - |
| **6 Ay Toplam** | - | - | - | **₺163,000** |

### Senaryo Analizi

| Senaryo | Bütçe | Beklenen Sonuç |
|---------|-------|----------------|
| **Minimal** | ₺50,000 | Yavaş büyüme, sadece organik, 6 ayda 10K kullanıcı |
| **Optimal** | ₺163,000 | Dengeli büyüme, karışık kanallar, 6 ayda 50K kullanıcı |
| **Aggresive** | ₺300,000 | Hızlı büyüme, ağır reklam, 6 ayda 150K kullanıcı |

### 9.6 MALİYET DÜŞÜRME STRATEJİLERİ

### Hemen Uygulanabilir

| Strateji | Tasarruf | Nasıl? |
|----------|----------|--------|
| **Firebase Spark** | ₺300/ay | İlk 3 ay ücretsiz tier |
| **OpenAI yerine Gemini** | %50 | Google AI ücretsiz kredi |
| **Organik büyüme** | %50 | TikTok/Reels viral içerik |
| **Beta testerlar** | ₺10,000 | Ücretsiz erken erişim |
| **Açık kaynak** | ₺5,000 | Ücretsiz kütüphaneler |

### Minimal Bütçe ile Başlangıç (₺50,000)

```yaml
Geliştirme: ₺0 (siz yapıyorsunuz)
Operasyonel: ₺7,200 (6 ay)
AI/API: ₺1,800 (6 ay - caching ile)
Pazarlama: ₺40,000 (sadece organik + az paid)
Yedek: ₺1,000

Toplam: ₺50,000
Beklenen: 6 ayda 20,000 kullanıcı
```

---

## 10. GELİR PROJEKSİYONU

### 6 Aylık Finansal Özet

| Ay | Maliyet (₺) | Gelir (₺) | Net (₺) | Kümülatif |
|----|-------------|-----------|---------|-----------|
| 1 | 16,320 | 0 | -16,320 | -16,320 |
| 2 | 16,320 | 5,000 | -11,320 | -27,640 |
| 3 | 37,900 | 15,000 | -22,900 | -50,540 |
| 4 | 37,900 | 35,000 | -2,900 | -53,440 |
| 5 | 54,800 | 70,000 | +15,200 | -38,240 |
| 6 | 54,800 | 120,000 | +65,200 | +26,960 |

**Breakeven:** Ay 6'da gerçekleşir  
**ROI (6 ay):** %16.5

### Maliyet Dağılımı

```
Pazarlama     ████████████████████████████████████  %61
Operasyonel   ██████████                            %17
AI/API        ██████                                %11
Yedek         █████                                 %11
```

---

## 🎯 SONUÇ ve ÖNERİ

### Önerilen Bütçe: ₺100,000 - 150,000

**Bu bütçe ile:**
- ✅ Profesyonel MVP (6 hafta)
- ✅ 50,000+ kullanıcı (6 ay)
- ✅ Breakeven ay 6'da
- ✅ Global expansion için temel

### Strateji Özeti

1. **Türkiye first** - Yerel pazar avantajını kullan
2. **AI farklılaştırması** - Rakiplerden ayrış
3. **Freemium model** - Düşük bariyer, viral büyüme
4. **Hızlı MVP** - 6 haftada pazara çık
5. **Data-driven** - Metriklerle büyü

---

**Rapor Tarihi:** 29 Ocak 2026  
**Son Güncelleme:** 29 Ocak 2026
