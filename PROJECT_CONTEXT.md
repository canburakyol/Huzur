# PROJECT CONTEXT - Huzur V1 (`huzur-app`)

Bu dosya Codex/AI icin hizli baglam dosyasidir. Amac, her iste tum projeyi bastan okumadan once mevcut mimariyi hatirlatmak ve sadece ilgili dosyalara yonlendirmektir.

Kural: Bu dosya karar vermek icin ilk baglamdir, tek dogruluk kaynagi degildir. Kod degistirmeden once ilgili canli dosya mutlaka kontrol edilmelidir.

---

## 1. Teknoloji ve Runtime

- Core: React 19.2.x, React DOM 19.2.x, React Router DOM 7.18.x, TypeScript 5.9.x, Vite 7.3.x.
- Runtime: Node.js `>=22 <23`.
- Mobil: Capacitor 8.x ile Android native WebView.
- State: Zustand 5.x, merkezi store `src/stores/useAppStore.ts` ve slice yapisi.
- Local DB: `@capacitor-community/sqlite`, ana adapter `src/services/sqliteAdapter.ts`.
- Backend: Firebase SDK 12.x, Auth, Firestore, Cloud Functions, App Check.
- Monetization: RevenueCat (`src/services/revenueCatService.ts`) ve AdMob (`src/services/admobService.ts`).

Guncel kesin surumler icin `package.json` kontrol edilmelidir.

---

## 2. Ana Giris Noktalari

- `src/main.jsx`: Uygulama girisi, Android WebView CSS sinifi, tema baslatma, font yukleme ve hata overlay baslangici.
- `src/AppProviders.jsx`: Global provider zinciri, ErrorBoundary, toast, time, focus, gamification, family ve native update kontrolu.
- `src/App.jsx`: App shell veya aktif feature overlay secimi.
- `src/components/app-shell/AppChrome.jsx`: Ana chrome, tab router, overlayler, hamburger menu ve bottom nav.
- `src/components/BottomNav.jsx`: Alt navigasyon bileseni.
- `src/components/app-shell/AppTabRouter.jsx`: Aktif tab icerik yonlendirmesi.

---

## 3. Kritik Servisler

- `src/services/firebase.ts`: Firebase/App Check entegrasyonu. `db` veya `auth` senkron kullanilmaz; her zaman `await getDb()` ve `await getAuthInstance()` kullan.
- `src/services/prayerService.ts`: Gunluk/aylik namaz vakti cekme, cache ve Diyanet ilce esleme kullanan ana servis.
- `src/services/diyanetLocationService.ts`: Diyanet il/ilce ID eslemeleri ve secili ilce kaliciligi.
- `src/services/prayerScheduleService.ts`: Native/local namaz bildirimi ve aylik schedule senkronizasyonu.
- `src/services/admobService.ts`: AdMob initialize, banner, rewarded ve reklam cleanup.
- `src/services/revenueCatService.ts`: Pro/premium satin alma ve restore akisi.
- `src/services/storageService.ts`: SQLite destekli kalici storage yardimcilari.
- `src/services/sqliteAdapter.ts`: SQLite sema ve entity adapter katmani.
- `src/services/focusSessionService.ts`: Deadline tabanli focus session runtime ve reklam cleanup etkileri.

---

## 4. Sik Dokunulan UI Alanlari

- Tema tokenlari: `src/styles/variables.css`.
- Genel component CSS: `src/styles/components.css`.
- App shell/navigation CSS: `src/components/app-shell/Navigation.css`.
- Home: `src/components/app-shell/AppHomeTabContent.jsx` ve `src/components/app-shell/home/*`.
- Quran: `src/domains/quran/components/Quran.jsx` ve `Quran.css`.
- Prayer: `src/domains/prayer/components/*`.
- Onboarding ve Pro: `src/domains/onboarding/components/*`.

Tema isi yaparken davranis ve mimariyi degistirme; once `src/styles/variables.css` ve ilgili component CSS dosyasini oku.

---

## 5. Namaz Vakti ve Bildirim Akisi

- Konum izni ve ters geocode: `src/hooks/useLocationConsent.ts`.
- Namaz vakti hook'u: `src/hooks/usePrayerTimes.ts`.
- Diyanet ilce secimi: `src/services/diyanetLocationService.ts`.
- Vakit cekme/cache: `src/services/prayerService.ts`.
- Native bildirim schedule: `src/services/prayerScheduleService.ts` ve Android native plugin taraflari.

Onemli invariantlar:

- Koordinat geldiyse once konum adi/ilce eslemesi cozulmeli, sonra namaz vakti cekilmeli.
- Cache anahtarlarinda ilce/Diyanet ID ayrimi korunmali.
- Kullanici bildirimleri kapattiysa ezan/namaz bildirimleri native tarafta da iptal edilmeli.
- Diyanet uyumsuzlugu iddiasi repo kodu ve resmi kaynakla dogrulanmadan kabul edilmemeli.

---

## 6. Reklam ve Premium Akisi

- AdMob init ve banner: `src/hooks/useAppInit.ts` -> `src/services/admobService.ts`.
- Pro kullanicida reklamlar kapatilmali: `adMobService.stopAds()`.
- Alt banner, bottom nav'i kapatmamali. Native banner DOM disinda cizildigi icin CSS rezervi ve AdMob banner boyutu birlikte kontrol edilmeli.
- Rewarded akista odul sadece gercek reward eventiyle verilmeli.
- Consent yoksa AdMob initialize edilmemeli.

---

## 7. Kodlama Kurallari

- Var olan mimariyi koru; genis rewrite yapma.
- Kirli worktree varsa kullanici degisikliklerini koru.
- Firebase icin senkron `db`/`auth` kullanma.
- `.env` degerlerini koda gommek yasak; `import.meta.env` veya mevcut runtime/env servislerini kullan.
- TypeScript'te `any` ekleme; gerekirse `unknown` ve type narrowing kullan.
- Kullanici bir teshis yaptiginda once kod yolunu kontrol et, sonra karar ver.
- Android etkili degisikliklerde en az `npm run build`, gerekirse `npx cap sync android` ve `./gradlew.bat :app:assembleDebug` calistir.

---

## 8. Huzli Komutlar

```powershell
npm test -- --run
npm run build
npx cap sync android
cd android
.\gradlew.bat :app:assembleDebug
```

Dar kapsamli arama icin once `rg` kullan:

```powershell
rg -n "aranacakMetin" E:\D_Backup\Projem\src -S
```

---

## 9. Bilinen Riskler

- Samsung/kucuk ekranlarda onboarding veya fixed yuzeyler tasabilir; responsive yukseklik ve scroll kontrolu yap.
- Native ses/ezan/muzik uygulama kapansa bile calisabilir; Android lifecycle ve foreground/background cleanup kontrol edilmeli.
- Native local notification tercihleri web preference'dan bagimsiz kalabilir; kapatma akisi native schedule iptaliyle dogrulanmali.
- AdMob adaptive banner bazi cihazlarda beklenenden yuksek cizilebilir; bottom nav ve reklam cakismasi cihazda smoke test edilmeli.
- Pro/consent/reklam akislari gelir ve policy riski tasir; sadece UI olarak ele alinmamali.
