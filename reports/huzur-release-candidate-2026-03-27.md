# Huzur Release Candidate Report

Date: 2026-03-28
Scope: Android release adayi, Firebase backend, AI/recovery/premium/referral akislari
Prepared by: Codex

## Karar
Durum: SARTLI HAZIR

Gerekce:
- Kod ve backend kalite kapilari temiz.
- Firebase Functions production deploy basarili.
- Android release derlemesi basarili.
- Ancak depodaki release artifact halen `unsigned`; store'a cikmadan once imzali upload artifact alinmasi ve hedefli cihaz smoke testi yapilmasi gerekiyor.

## Gecen Kapilar
- `npm run lint`
- `npm run build`
- `npm run test:all`
- `node -c functions/index.js`
- `npm audit --omit=dev --json` -> repo root temiz
- `npm audit --omit=dev --json` -> `functions/` temiz
- `npx cap sync android`
- `android\\gradlew.bat assembleRelease`
- `android\\gradlew.bat bundleRelease`
- `firebase deploy --only "functions"`

## Uygulanan Sertlestirmeler
- `functions/package.json` icinde transitif audit aciklari override edildi:
  - `brace-expansion@2.0.3`
  - `node-forge@1.4.0`
  - `path-to-regexp@0.1.13`
- Bu dependency seti production Functions'a yeniden deploy edildi.
- `android/app/build.gradle` release signing icin hazirlandi.
  - `android/keystore.properties` veya env secret gelirse signed release uretebilir.
- Ornek dosya eklendi:
  - `android/keystore.properties.example`

## Artifact Durumu
- Uygulama kimligi: `com.huzurapp.android`
- Version name: `18.2.7`
- Version code: `26`
- Derlenen artifact:
  - `D:\Projem\android\app\build\outputs\apk\release\app-release-unsigned.apk`
- Derlenen bundle:
  - `D:\Projem\android\app\build\outputs\bundle\release\app-release.aab`
- Boyut:
  - `58,682,538 bytes`
- Bundle boyutu:
  - `60,803,554 bytes`

## Kalan Blokerler
1. Guncel signed upload bundle yok.
   - Repoda `android/app/keystore.jks` var ama signing kimlik bilgileri bu ortamda erisilebilir degil.
   - `android/keystore.properties` olusturulup gercek degerlerle doldurulmali veya env secret verilmelidir.
   - Mevcut `D:\Projem\android\app\build\outputs\bundle\release\app-release.aab` guncel ama unsigned.
2. Gercek cihaz smoke testi henuz kosulmadi.
   - En az bir Android 13+ cihaz ve bir daha eski cihazda kritik akislar gorulmeli.
3. Dis konsol kontrolleri henuz manuel bekliyor.
   - Play Console vitals
   - RevenueCat sandbox purchase/restore
   - AdMob production health

## Zorunlu Son Smoke Seti
1. Onboarding
   - remote onboarding config acikken `language -> permissions -> goal` akisi
   - referred onboarding geldiyse kalan adimlar ve reward dili
2. AI yuzeyleri
   - Assistant V2 cevap + safe mode
   - Home ranking V2
   - Weekly insight
   - Push hint fallback
3. Premium
   - paywall gorunumu
   - purchase start
   - purchase success
   - restore success / not found
4. Push
   - notification izni
   - FCM token sync
   - test push teslimi
5. Referral
   - davet linki uretme
   - referred onboarding
   - ilk ibadet sonrasi funnel counter artisinin backend'de gorunmesi
6. Sosyal
   - dua amin
   - hatim join by code
   - family invite join
7. Reklam / Pro ayrimi
   - free kullanicida reklam
   - pro kullanicida reklam gizleme

## Non-Blocking Notlar
- `smartNotificationService.js` icin gorulen eski statik/dinamik import uyarisi temizlendi.
- `android/keystore.properties.example` eklendi; signing bilgileri geldigi anda signed release almak kolaylasti.

## Staged Rollout Onerisi
1. Imzali artifact al ve internal test kanalina yukle.
2. Kritik smoke temizse `%5` staged rollout ile basla.
3. 24 saat sonra:
   - crash-free users saglikli
   - ANR spike yok
   - purchase/restore sorunsuz
   - push teslimi normal
   ise `%20`ye cik.
4. Bir 24-48 saat daha temiz giderse `%100` rollout.

## Net Sonuc
Kod tabani, Firebase backend'i ve release derleme hattı hazir. Store'a cikis icin kalan tek teknik eksik signed artifact; kalanlar operasyonel dogrulama ve son smoke turu.
