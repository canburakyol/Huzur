# Huzur Release Readiness Checklist

Date: 2026-03-28
Product: Huzur Android
Package: `com.huzurapp.android`
Version: `18.2.7 (26)`

## 1. Otomatik Kod Kapilari
- [x] `npm run lint`
- [x] `npm run test:all`
- [x] `npm run build`
- [x] `node -c functions/index.js`
- [x] root `npm audit --omit=dev --json`
- [x] `functions/` icinde `npm audit --omit=dev --json`
- [x] `npx cap sync android`
- [x] `android\\gradlew.bat assembleRelease`

## 2. Firebase / Backend
- [x] Functions production deploy guncel
- [x] AI callable akislari deploy edildi
- [x] Referral server sync akislari deploy edildi
- [x] AI observability cron deploy edildi
- [x] Firestore rules guncel
- [x] `config/aiFlags` aktif rollout durumunda

## 3. Android Release Artifact
- [x] Unsigned release APK olustu
- [x] Eski signed AAB dogrulandi
- [x] Release signing config dosya/env destekleyecek sekilde hazirlandi
- [ ] Guncel signed AAB uretildi
- [ ] Play Console'a upload edildi

## 4. Cekirdek Release Smoke Seti
- [ ] Ilk acilis ve anonim auth
- [ ] Namaz vakitleri yukleniyor
- [ ] Push izni ve token sync
- [ ] Assistant V2
- [ ] Home ranking V2
- [ ] Weekly insight
- [ ] Purchase
- [ ] Restore
- [ ] Aileye kod ile katilim
- [ ] Hatime kod ile katilim
- [ ] Dua olusturma ve amin verme
- [ ] Referral link uretme ve referred onboarding
- [ ] Free kullanicida reklam
- [ ] Pro kullanicida reklam gizleme

## 5. Manuel Konsol Kontrolleri
- [ ] Play Console vitals
- [ ] Play pre-launch report
- [ ] RevenueCat sandbox purchase / restore / entitlement
- [ ] AdMob serving ve fill kontrolu
- [ ] Crashlytics yeni release filtresi
- [ ] AI health panel + release brief kontrolu

## 6. Rollout Karari
- Internal test
- `%5` staged rollout
- 24 saat izleme
- `%20`
- `%50`
- `%100`

## 7. Go / No-Go Esikleri
- Crash-free users `>= 99.5%`
- ANR `<= 0.30%`
- Purchase basari `>= 98%`
- Restore basari `>= 98%`
- AI release status `healthy` veya gerekceli `watch`

## 8. Son Not
Kod ve backend kapilari yesil. Magaza yayini icin kalan kritik teknik adim guncel signed AAB uretmek ve cihaz smoke setini tamamlamaktir.
