# Huzur P0 Stabilization Pack

Tarih: 27 Mart 2026  
Kapsam: `Absolute Privacy Mode` + `Local-First Home Ranking` + `Bundle & Startup Recovery`

## Release Guardrail

- Bu build `zero telemetry only` kapsamindadir.
- Telemetry opt-in UI bu P0 paketine dahil degildir.
- Bu nedenle startup aninda Firebase Analytics veya Crashlytics'e giden tek bir request bile release blocker sayilmalidir.

## Release-Ready Changelog

### Added

- Varsayilan olarak kapali gelen `Zero Telemetry by Default` gizlilik omurgasi eklendi.
- `privacyModeService` ile telemetry ve crash reporting davranisi merkezi ve sert bir kill-switch altina alindi.
- `Preferences` tabanli cihaz ici davranis hafizasi eklendi.
- Home ranking ve push hint icin cloud-free yerel heuristic motoru eklendi.
- `AppProviders` lazy bootstrap katmani eklendi.
- WorkManager icin `12 saat enqueue debounce` korumasi eklendi.

### Changed

- `analyticsService` telemetry kapaliyken backend yerine local stub/log moduna alindi.
- `firebase.js` analytics importunu consent kontrollu ve lazy hale getirdi.
- Home ekraninin dinamik siralamasi artik cloud callable yerine cihaz ici skorlamayla hesaplanuyor.
- `AppHomeTabContent` tarafinda `useDeferredValue` ve `startTransition` ile non-blocking dynamic UI gecisi uygulandi.
- `main.jsx` ve `App.jsx` startup yukunu azaltmak icin `lazy` ve `Suspense` ile yeniden duzenlendi.
- Prayer, FCM ve notification runtime importlari ilk acilista eager yerine ihtiyac aninda yuklenir hale getirildi.
- Firebase vendor chunk'i tek parca yerine `core/auth/functions/analytics/app-check/firestore` olarak parcali hale getirildi.
- Android startup path'inde WorkManager enqueue cagrisi ilk frame sonrasina ertelendi.

### Removed Or Severed

- Home ranking ve push hints icin cloud callable baglantisi kesildi.
- Android build tarafinda native Firebase Analytics ve Crashlytics agirligi P0 privacy mimarisine gore devre disi birakildi.
- Startup sirasinda telemetry backend init zorlamasi kaldirildi.
- Her uygulama acilisinda tekrar tekrar job enqueue etmeye yol acan agresif WorkManager davranisi kaldirildi.

### Fixed

- Ana `index` startup bundle budget'i kritik seviyeden toparlandi.
- Firebase SDK chunk'i budget'i asmayacak sekilde parcalandi.
- Ilk navigasyonda Qibla, Prayer runtime ve FCM yuklemelerinde crash riski azaltildi.
- Startup'ta arka plan yan etkileri ana thread'i bloke etmeyecek sekilde ertelendi.

### Verification Snapshot

- `npm run lint` geciyor
- `npm run build` geciyor
- `npm run test:unit` geciyor
- `npm run test:backend` geciyor
- `.\gradlew.bat :app:assembleDebug` geciyor
- `npm run bundle:budget` geciyor

### Performance Snapshot

- `index` bundle: `26.77 kB / 270 kB`
- en buyuk Firebase chunk'i: `249.03 kB / 360 kB`
- `vendor-react`: `185.86 kB / 210 kB`
- `vendor-html2canvas`: `193.96 kB / 220 kB`

## Commit Message Body Olarak Kopyalanabilir Ozet

```md
## Huzur P0 Stabilization Pack

- Zero Telemetry by Default mimarisi eklendi; analytics ve crash reporting varsayilan olarak sert sekilde kapatildi
- analyticsService ve firebase analytics akisi consent kontrollu stub/lazy modele tasindi
- Home Ranking ve Push Hint akislari cloud callables'tan ayrilip Preferences tabanli cihaz ici heuristic motora alindi
- AppHomeTabContent tarafinda useDeferredValue + startTransition ile non-blocking dynamic UI gecisi uygulandi
- main.jsx ve App.jsx startup shell'i lazy bootstrap yapisina cekildi
- Prayer runtime, FCM ve notification importlari eager yerine on-demand yuklenir hale getirildi
- Firebase vendor chunk'i parcali hale getirilerek bundle budget gecer duruma getirildi
- WorkManager startup path'i ilk frame sonrasina ertelendi ve 12 saat enqueue debounce eklendi

## Verification

- lint, build, unit, backend ve android debug assemble gecti
- bundle budget gecti
- index bundle 26.77 kB seviyesine indirildi
```

## Cekirdek Release Smoke Seti

- Offline home ranking smoke
- Zero telemetry startup smoke
- Lazy-load ilk navigasyon smoke
- WorkManager debounce smoke
- Notification permission ve FCM init smoke
- Prayer times render smoke
- Qibla ilk acilis smoke

## Strict QA Checklist

## 1. Airplane Mode Test

Amaç: Home ranking'in cloud olmadan, tamamen cihaz ici sinyallerle degistigini kanitlamak.

### On Kosullar

- Android cihazda uygulama kurulu olmali
- Test boyunca cihaz `Airplane Mode` durumunda olmali
- Mümkunse test profili `quran_learning` ana hedefinde olmamali
- Mümkunse test profili bir aileye bagli olmamali

### Adimlar

1. Uygulamayi tamamen kapat.
2. Cihazda `Airplane Mode` ac.
3. `Settings > System > Date & Time` altindan otomatik saati kapat.
4. Cihaz saatini `08:00` yap.
5. Uygulamayi ac ve Home ekraninin hero altindaki ilk 3 modulu ekran goruntusu ile kaydet.
6. Home'dan `Quran` veya `Gunluk Kesif`e goturen akis uzerinden Kuran ozelligini ac.
7. 5-10 saniye bekle ve tekrar Home'a don.
8. Uygulamayi recent apps'ten tamamen kapat.
9. Hala `Airplane Mode` acikken uygulamayi yeniden ac.
10. Hero altindaki ilk 3 modulu tekrar kaydet.
11. Cihaz saatini bu kez `22:30` yap.
12. Uygulamayi tekrar tamamen kapat ve yeniden ac.
13. Home ekraninin ilk 3 modulu ve ustteki ranking aciklama metnini tekrar kaydet.

### Beklenen Sonuc

- `08:00` baseline ile `Quran` kullanimi sonrasi acilis arasinda Home modul sirasi degismeli veya `Gunluk kesif` daha yukari cikmali.
- `22:30` acilisinda `Hikayeler` veya daha sakin tuketim modulleri yukari tasinmali.
- Ranking aciklama metni cloud, API ya da sunucuya deginmeden yerel davranis/saat bazli bir mantik izlenimi vermeli.
- Uygulama tamamen offline iken Home ekraninda beyaz ekran, sonsuz spinner veya crash olmamali.

### Opsiyonel Kanit

- Android WebView remote inspect acikken Console'da `window.Capacitor?.Plugins?.Preferences?.get({ key: 'huzur_local_intelligence_v1' })` calistir.
- Beklenti: JSON state donmeli; `lastTopModule`, `lastRankedAt`, `slotUsage` veya `hintUsage` alanlari dolu olmali.

### Fail Sinyalleri

- Offline durumda Home ranking hic degismiyorsa
- `Quran` kullanimi sonrasi ayni siralama korunuyor ve aciklama metni de degismiyorsa
- Offline acilista cloud hatasi, fetch hatasi veya AI timeout hatasi goruluyorsa

## 2. Zero Telemetry Test

Amaç: Startup sirasinda Firebase Analytics veya Crashlytics'e sifir veri gittigini olculebilir sekilde kanitlamak.

### Test Kuralı

- Bu testte tum kanit yalnizca `startup` anina odaklanir.
- Firebase Auth, Firestore veya App Check gibi uygulamanin cekirdek backend akislarini telemetry ile karistirma.
- Yalnizca analytics ve crash reporting endpoint/tag'leri sayilir.

### Yontem A: Chrome DevTools Network

1. Android cihazda `USB debugging` ac.
2. Uygulamayi cihaza kur ve tamamen kapat.
3. Chrome'da `chrome://inspect/#devices` ac ve Huzur WebView'ini inspect et.
4. `Network` tab'inda `Preserve log` ve `Disable cache` ac.
5. Network filtresine sirasiyla su metinleri uygula:
   `google-analytics`
   `app-measurement`
   `crashlytics`
   `firebaselogging`
   `crashlyticsreports`
6. Network kaydini temizle.
7. Uygulamayi cold start ile ac.
8. Home ekrani gorunur olana kadar bekle.
9. Kaydi durdur ve eslesen request sayisini not et.
10. Bu cold start testini 3 kez tekrarla.

### Geçme Kriteri

- Asagidaki formül saglanmali:

```text
Toplam telemetry startup request sayisi
= Run1 + Run2 + Run3
= 0 + 0 + 0
= 0
```

- Yani filtrelenen telemetry endpointlerine giden toplam request sayisi `0` olmali.

### Yontem B: Android Studio Logcat

1. Android Studio'da `Logcat` ac.
2. Uygulamayi tamamen kapat.
3. Logcat'i temizle.
4. Asagidaki anahtar kelimelerle filtre uygula:
   `FirebaseAnalytics`
   `Crashlytics`
   `AppMeasurement`
   `FA`
   `TransportRuntime`
5. Uygulamayi cold start ile ac.
6. Home gorunur olana kadar loglari izle.
7. 3 kez tekrarla.

### Beklenen Sonuc

- Firebase Analytics upload, event dispatch, transport scheduling veya Crashlytics report upload logu gorulmemeli.
- `AnalyticsStub` veya `Zero-telemetry mode active` benzeri lokal loglar kabul edilebilir.

### Fail Sinyalleri

- `app-measurement.com`, `google-analytics.com`, `crashlyticsreports-pa.googleapis.com` veya benzeri telemetry domainlerine request dusmesi
- Logcat'te analytics upload/schedule veya crash report enqueue loglari gorulmesi

## 3. Lazy-Load Render Test

Amaç: Ilk navigasyonda yuklenen agir modullerin lazy import yuzunden crash, beyaz ekran veya kilitlenme olusturmadigini dogrulamak.

### Genel Test Kurali

- Her modulu ilk kez acarken uygulama cold start'tan gelmeli
- Her senaryo ayrica test edilmeli
- Ilk render sirasinda kisa sureli spinner kabul, crash kabul degil

### Senaryo A: Prayer Runtime

1. Uygulamayi cold start ile ac.
2. Home ekraninda namaz vakti verisinin gelmesini bekle.
3. Ayarlar veya ilgili notification akisindan bildirim ozelligine gir.
4. Bildirim izni istenirse kabul et.
5. Home'a don ve uygulamanin responsive kalip kalmadigini kontrol et.

Beklenen:

- Permission akisi tamamlanmali
- Uygulama donmemeli
- Sonsuz spinner olmamali
- Ana ekran geri dondugunde temel UI sabit kalmali

### Senaryo B: FCM Ilk Yukleme

1. Uygulamayi tamamen kapat.
2. Tekrar ac.
3. Notification veya push ile ilgili ilk ayara git.
4. Izin ver veya reddet.
5. Geri don ve tekrar ayni ekrana gir.

Beklenen:

- Ilk giriste crash olmamali
- Ikinci giriste daha hizli render gozlenmeli
- Reddetme durumunda da UI bozulmamali

### Senaryo C: Qibla Ilk Navigasyon

1. Uygulamayi cold start ile ac.
2. Hamburger menu veya uygun feature entry uzerinden `Qibla` ekranina ilk kez git.
3. Lokasyon izni sorulursa bir kez izin vererek, ayri bir kez reddederek test et.
4. Compass ekrani acilinca tekrar Home'a don.
5. Qibla'ya ikinci kez gir.

Beklenen:

- Ilk giriste lazy fallback sonrasi ekran render etmeli
- Beyaz ekran veya ani uygulama kapanisi olmamali
- Lokasyon reddedilse bile kontrollu fallback veya anlamli durum mesaji olmali
- Ikinci giriste daha sicak bir navigasyon hissi olmali

### Fail Sinyalleri

- Ilk navigasyonda siyah/beyaz ekran
- Sadece spinner gorulup ekran hic acilmamasi
- Ilk giriste crash olup ikinci giriste duzelmesi
- Permission dialog'undan donunce uygulamanin takilmasi

## 4. WorkManager Test

Amaç: `PrayerDataSyncWorker` enqueue davranisinin her acilista tekrar tetiklenmedigini ve 12 saat debounce ile kontrol altinda oldugunu dogrulamak.

### Yontem A: SharedPreferences Zaman Damgasi Kaniti

1. Uygulama verisini temizle.
2. Uygulamayi ac ve Home ekranina kadar bekle.
3. Android Studio `Device Explorer` ile su dosyayi ac:
   `/data/data/com.huzurapp.android/shared_prefs/PrayerDataSync.xml`
4. `last_enqueue_requested_at` degerini not al.
5. Uygulamayi kapat ve 1-2 dakika icinde tekrar ac.
6. Dosyayi yeniden kontrol et.

Beklenen:

- `last_enqueue_requested_at` ayni kalmali

### Yontem B: 12 Saat Sonrasi Yeniden Tetikleme

1. Cihazda otomatik tarihi kapat.
2. Sistem saatini `+13 saat` ileri al.
3. Uygulamayi tekrar ac.
4. `PrayerDataSync.xml` dosyasini tekrar kontrol et.

Beklenen:

- `last_enqueue_requested_at` yeni saate yakin bir zaman damgasina guncellenmeli

### Yontem C: Unique Work Sayisi Kaniti

1. Android Studio `App Inspection` veya WorkManager Inspector ac.
2. `prayer_data_sync` unique periodic work kaydini izle.
3. Uygulamayi pes pese 3 kez ac kapa.

Beklenen:

- Tek bir unique periodic work kaydi gorulmeli
- Her acilista yeni bir periodic work kopyasi olusmamali

### Fail Sinyalleri

- `last_enqueue_requested_at` her startup'ta degisiyorsa
- 12 saat gecmeden tekrar enqueue yapiliyorsa
- WorkManager tarafinda ayni isimde birden cok periodic work goruluyorsa
- Arka planda gereksiz sync tekrari pil tuketimini arttiriyorsa

## Manuel Konsol Kontrolleri

- Logcat'te startup sirasinda telemetry upload sinyali var mi
- Network tab'inda telemetry endpointleri sifir mi
- Offline home ranking'te siralama ve aciklama degisiyor mu
- Ilk Qibla acilisinda lazy fallback sonrasi ekran geliyor mu
- Notification/FCM ilk izin akisinda app freeze oluyor mu
- `PrayerDataSync.xml` zaman damgasi debounce davranisina uyuyor mu

## Release Verdict

- Yukaridaki 4 ana QA blogunun tamami gecmeden P1'e gecilmemeli.
- Ozellikle `Zero Telemetry Test` ve `Airplane Mode Test` bloklayici kabul edilmelidir.
