# Global Language Rollout Plan (TR / EU / US / ID)

## Faz 1 Dil Seti
- Mevcut: `tr`, `en`, `ar`
- Yeni: `id`, `es`, `fr`, `de`

Toplam aktif dil: 7

## Bölgesel Varsayılan Kuralı
- Türkiye (`TR`) -> `tr`
- Endonezya (`ID`) -> `id`
- Avrupa (`DE`, `FR`, `ES`) -> cihaz dili uygunsa ilgili dil, aksi halde `en`
- Amerika (`US`) -> `en` (ikincil seçenek `es`)
- Kullanıcı manuel seçimi her zaman öncelikli

## Mimari Kararlar
- i18n destekli dil listesi genişletildi: [`src/i18n.js`](src/i18n.js)
- Dil tespit servisi bölgesel varsayılanla güncellendi: [`src/services/languageService.js`](src/services/languageService.js)
- Onboarding dil seçenekleri genişletildi: [`src/components/GrowthOnboarding.jsx`](src/components/GrowthOnboarding.jsx)
- Yeni locale klasörleri oluşturuldu:
  - `public/locales/id/`
  - `public/locales/es/`
  - `public/locales/fr/`
  - `public/locales/de/`

## Çeviri Süreci (AI + Editör)
1. EN kaynak metin üzerinden AI ilk taslak üretir
2. Editör dini terimleri ve tonu normalize eder
3. LQA doğrulaması yapılır

## Dini Terim Glossary Önerisi
- Salah / Namaz
- Dhikr / Zikir
- Dua
- Fajr, Dhuhr, Asr, Maghrib, Isha
- Sunnah, Fardh

Her dilde bu terimlerin tercih edilen karşılıkları sabitlenmeli.

## LQA Checklist
- Eksik key var mı?
- Placeholder bozulmuş mu? (`{{name}}`, `{{count}}`)
- Sağdan sola/sola doğru metin akışı uygun mu?
- Kritik ekranlar okunabilir mi?
  - Onboarding
  - Home
  - Notification
  - Invite / Referral
  - Settings
  - Legal

## Rollout Stratejisi
1. Internal QA
2. %5 staged rollout
3. %25 rollout (locale metrik kontrolü)
4. %100 rollout

## Ölçüm Metrikleri
- Locale bazlı onboarding completion
- Locale bazlı D1 / D7 retention
- Locale bazlı share conversion
- Locale bazlı invite acceptance

## Sonraki Adım
- Faz 1 sonrası `pt-BR` ve `ur` Faz 2 aday dil seti olarak değerlendirilecek.
