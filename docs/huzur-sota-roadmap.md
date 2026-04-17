# Huzur SOTA Yol Haritasi

## Amac
Huzur'u iki kisilik ekiple, mevcut `React + Capacitor + Firebase` mimarisini bozmadan, kategori lideri seviyesinde bir `kisisel manevi rehber + aliskanlik motoru + guvenilir islami yasam platformu` haline getirmek.

## Kuzey Yildizi
- `D30 retention`
- `haftalik aktif kullanim`
- `AI rehber fayda orani`
- `premium donusum`

## Uygulama Prensipleri
- Eski akislari silmeden `feature flag + fallback` ile ilerle.
- Yeni AI davranisi her zaman `guvenli, yargisiz, sakin` olsun.
- Tek seferde cok sey degil, az sayida ama derin etkili sistem ship et.
- Her faz sonunda `build + lint + test + smoke test` zorunlu olsun.

## Faz 1: AI Cekirdek Stabilizasyonu
Durum: Basladi

Hedef:
- AI katmanini bozulmaya dayanikli hale getirmek.
- Mevcut assistant/home/insight/push akislarini schema-guvenli sekilde dondurmek.
- Rollout ve gozlemlenebilirlik icin saglam temel kurmak.

Teslimatlar:
- Server-side AI response normalization
- Deterministic fallback davranisi
- AI flags rollout kontrolu
- Assistant V2 kalite turu
- Home ranking V2 kalite turu
- Weekly insights V1 kalite turu

Bu fazda yapilacaklar:
1. Tüm AI callable endpoint'lerinde ortak response normalizasyonu kullan.
2. Parse edilemeyen veya eksik model cevabinda fallback'e dön.
3. Assistant cevaplarini session memory ile ama ozet tabanli tut.
4. Home ranking sonucunu aday modullerle sinirli tut ve duplicate engelle.
5. Weekly insight ve push hint cevaplarini sabit semaya indir.
6. Her endpoint icin latency, error, fallback oranlarini analytics veya log ile gorunur kil.

Tamamlanma kriteri:
- AI cevabi bozulsa bile client crash etmemeli.
- Her endpoint fallback ile calisabilir olmali.
- Flag kapaliyken mevcut urun davranisi birebir korunmali.

## Faz 2: Kisisellestirme ve Retention Motoru
Hedef:
- Kullaniciya "bu uygulama bana gore davraniyor" hissini vermek.

Teslimatlar:
- Home ranking iyilestirmeleri
- Weekly summary kartlari
- Push personalization v1
- Recovery loops
- Goal ve streak iyilestirmeleri

Bu fazda yapilacaklar:
1. Event sozlugunu netlestir.
2. User segmentlerini uret.
3. Risk band mantigini urun geneline yay.
4. Weekly insight'i ana ekrana uygun acilis momenti haline getir.
5. Push metinlerini sessiz ama daha ilgili hale getir.

Tamamlanma kriteri:
- Home CTA etkilesiminde artis
- Weekly insight acilisinda artis
- Push -> open -> action zincirinde iyilesme

## Faz 3: Trust Stack
Hedef:
- AI ve icerik guvenilirligini kategori lideri seviyesine tasimak.

Teslimatlar:
- Source metadata
- Confidence scoring
- Review status
- Hassas konular icin guvenli cevap politikasi
- Basic eval harness

Bu fazda yapilacaklar:
1. Ayet, hadis, dua ve aciklama iceriklerine kaynak alani ekle.
2. Assistant kaynakli cevaplari uygun oldugunda source metadata ile besle.
3. Belirsiz cevaplari `confidence=low` ile etiketle.
4. Basit eval seti ile assistant kalitesini olc.

## Faz 4: Growth ve Premium Flywheel
Hedef:
- SOTA deneyimi gelir ve geri donus motoruna cevirmek.

Teslimatlar:
- Remote-config onboarding
- Premium deger momentleri
- Paywall experiment altyapisi
- Aile / sosyal hafif referral loop'lari

## 30 Gunluk Icra Plani
### 1. Hafta
- AI response normalization
- Fallback audit
- Rollout checklist

### 2. Hafta
- Assistant V2 quality pass
- 10-15 gercek kullanici senaryosu testi
- Prompt ve response tuning

### 3. Hafta
- Home ranking polish
- Ranking aciklama metinleri
- Home modullerinde tutarli oncelik mantigi

### 4. Hafta
- Weekly insights polish
- Push hints polish
- Ilk retention dashboard'lari

## Bu Sprintte Baslayan Is
- `functions/index.js` icinde AI endpoint response normalizasyonu
- Sonraki adim: assistant ve home ranking icin hedefli smoke test + telemetry iyilestirmesi
