# PROJECT CONTEXT — Huzur V1 (huzur-app)

## 1. Sistem Mimarisi ve Teknoloji Yığını (Tech Stack & Architecture)
* **Core:** React 19.2.0, React DOM 19.2.0, React Router DOM 7.18.0, Vite 7.3.1, TypeScript 5.9.3.
* **Runtime:** Node.js `>=22 <23`, web tabanlı SPA ve Capacitor 8.3.4 ile Android native WebView runtime.
* **Architecture:** 
  * Hibrit Mobil/Web SPA.
  * Modüler klasör yapısı: `@src/domains` (özellik bazlı dikey bölümler) ve `@src/features` (yatay yetenekler).
* **State & Data:**
  * **State:** Zustand 5.0.13, dilimlere (`@src/stores/slices/*`) bölünmüş tek bir store (`useAppStore.ts`).
  * **Local Database:** `@capacitor-community/sqlite` 8.1.0 (`@src/services/sqliteAdapter.ts`) çevrimdışı kullanım için.
  * **Cloud Backend:** Firebase SDK 12.6.0 (Authentication, Firestore, Cloud Functions).
  * **Offline-First Cache:** Firestore persistent local cache (`persistentLocalCache` + `persistentMultipleTabManager`) devrede.

---

## 2. Kritik Giriş Noktaları ve Bağımlılık Haritası (Entry Points & Dependency Map)
* **Initialization (Ayağa Kalkış):**
  1. [`src/main.jsx`](file:///E:/D_Backup/Projem/src/main.jsx): Giriş noktası. Android WebView CSS sınıfını uygular. Yerel saklama alanından (`storageService`) temayı (`app_theme`) okur ve HTML `data-theme` attribute'ünü set eder. Noto Naskh ve Scheherazade fontlarını gecikmeli yükler (`startupScheduler`). Hata overlay'i tanımlar.
  2. [`src/AppProviders.jsx`](file:///E:/D_Backup/Projem/src/AppProviders.jsx): Global sağlayıcıları (`ErrorBoundary`, `ToastProvider`, `TimeProvider`, `FocusProvider`, `GamificationProvider`, `FamilyProvider`) sarar. Native güncellemeleri kontrol eder (`@capawesome/capacitor-app-update`).
  3. [`src/App.jsx`](file:///E:/D_Backup/Projem/src/App.jsx): `AppChrome` (navigasyon ve ana arayüz kabuğu) veya aktif overlay'leri yönetir.
* **En Kritik 5 Dosya:**
  * [`src/services/firebase.ts`](file:///E:/D_Backup/Projem/src/services/firebase.ts): Firebase ve App Check entegrasyonu. **Kritik:** Firebase `db` ve `auth` nesnelerine senkron erişim yasaktır; asenkron getter fonksiyonları (`getDb()`, `getAuthInstance()`) kullanılmalıdır.
  * [`src/stores/useAppStore.ts`](file:///E:/D_Backup/Projem/src/stores/useAppStore.ts): Tüm Zustand state dilimlerinin birleştiği merkezi yerel depo.
  * [`src/services/prayerScheduleService.ts`](file:///E:/D_Backup/Projem/src/services/prayerScheduleService.ts): Namaz vakti hesaplamaları, Diyanet API senkronizasyonu ve çevrimdışı hesaplama yedekleri.
  * [`src/services/revenueCatService.ts`](file:///E:/D_Backup/Projem/src/services/revenueCatService.ts): RevenueCat Capacitor SDK (`@revenuecat/purchases-capacitor`) üzerinden premium abonelik (Pro) yönetimi.
  * [`src/services/sqliteAdapter.ts`](file:///E:/D_Backup/Projem/src/services/sqliteAdapter.ts): Yerel SQLite veritabanı bağlantısı ve şema yönetimi.

---

## 3. Veri Modelleri ve API / Kontrat Yapısı (Data Models & Contracts)
* **Zustand & Veritabanı Modelleri (`types.ts`):**
  * `Settings`: `{ language: string, theme: string, accentColor: string, notifications: boolean, stickyNotification: boolean }`
  * `Quest`: `{ id: string, type: string, subType?: string, progress: number, target: number, completed: boolean, xp: number }`
  * `Family`: `{ id: string, name: string, members: string[] }`
  * `Toast`: `{ id: number, message: string, type: string, duration: number }`
* **Dış Servis Entegrasyonları:**
  * **Firebase SDK:** Auth, Firestore (offline persistent cache), Functions (region: `europe-west1`), App Check (Web: reCAPTCHA v3/Enterprise; Native: Play Integrity).
  * **RevenueCat Purchases:** Premium durum kontrolü (`isProUser` flag).
  * **AdMob:** Google AdMob reklamları (`@capacitor-community/admob`). Test ve Real Banner ID'leri `constants.ts` içindedir.
  * **Diyanet API:** Namaz vakitlerini ve konum bazlı koordinatları almak için kullanılır.

---

## 4. İş Akışları ve Senaryolar (Core Workflows)
* **Namaz Vakti Güncelleme & Alarm Akışı:**
  `main.jsx` -> `prayerScheduleService.ts` (Diyanet API veya Offline `adhan` kütüphanesi) -> `prayerSlice.ts` -> SQLite / storage -> Local Notifications.
* **Pro/Premium Abonelik Kontrol Akışı:**
  `AppProviders.jsx` -> `proService.ts` / `revenueCatService.ts` -> Purchases SDK -> `proSlice.ts` (`isProUser` set edilir) -> Arayüzde `FREE_LIMITS` (kısıt kontrolü) uygulaması.
* **Görev ve Gamification Akışı:**
  Kullanıcı ibadet veya Kur'an okuma aksiyonu gerçekleştirir -> `gamificationService.ts` -> `updateQuestProgress` / `updatePoints` -> `gamificationSlice.ts` -> Firestore sync.

---

## 5. Yapay Zeka İçin Geliştirme ve Stil Kılavuzu (AI Rules & Constraints)
* **Dosya Adlandırma & Klasörleme:**
  * **React Bileşenleri:** `src/components/` veya `src/domains/*/components/` altında **PascalCase** (`Quran.jsx`, `PremiumHomeHero.jsx`).
  * **Servis ve Mağazalar (Store):** `src/services/` veya `src/stores/` altında **camelCase** (`prayerScheduleService.ts`, `familySlice.ts`).
  * **Stylesheets:** Centralize CSS değişkenleri `src/styles/variables.css` içindedir. Bileşene özgü stiller `.css` uzantısıyla yanına eklenir.
* **Kodlama Standartları:**
  * **TypeScript Katı Kuralları:** `any` kullanımı tamamen yasaktır. Bilinmeyen tipler için `unknown` kullanıp tip daraltma (type narrowing) yapın.
  * **Asenkron Firebase:** Firestore veya Auth erişiminde doğrudan `db` veya `auth` çağırmayın. Her zaman `await getDb()` veya `await getAuthInstance()` kullanın.
  * **Döngüler:** `for` yerine fonksiyonel dizi metotlarını (`map`, `filter`, `reduce`) tercih edin.
* **Yasaklar (Anti-Patterns):**
  * Firebase nesnelerine senkron erişim yapma (hata fırlatır).
  * Global state'i Zustand slice'ları dışından doğrudan mutasyona uğratma.
  * `.env` dosyasındaki API anahtarlarını koda doğrudan gömme (`import.meta.env` kullanın).
