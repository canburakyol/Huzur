# Huzur 2026 SOTA Değerlendirmesi

Tarih: 27 Mart 2026
Hazırlayan: Codex
Rol: Principal Mobile Architect / AI Integration Specialist / Cybersecurity Expert

## 1. Yönetici Özeti

Bu değerlendirme sonucunda Huzur'un tek bir skorla 2026 SOTA seviyesi:

**67 / 100**

Bu skorun anlamı:

- Uygulama genel mobil mühendislik kalitesi açısından güçlü.
- Android native reliability, App Check, background scheduling, test disiplininin bazı bölümleri ve ürün genişliği olgun.
- Ancak uygulamanın ilan edilen çekirdek USP'si olan **"Absolute Privacy + On-Device AI"** bugün kod tabanındaki gerçek davranışla tam hizalı değil.

En kritik üç gerçek:

1. Repo **Capacitor 6 değil, Capacitor 8** kullanıyor: [package.json](/D:/Projem/package.json), [capacitor.config.ts](/D:/Projem/capacitor.config.ts)
2. Uygulama bugün **zero telemetry değil**; Firebase Analytics ve Crashlytics aktif yüzeyler içeriyor: [analyticsService.js](/D:/Projem/src/services/analyticsService.js), [firebase.js](/D:/Projem/src/services/firebase.js), [build.gradle](/D:/Projem/android/app/build.gradle)
3. Uygulama bugün **on-device AI only değil**; home ranking, assistant, weekly insight ve push hints Firebase callable üzerinden bulut tarafına gidiyor: [aiService.js](/D:/Projem/src/services/aiService.js), [AppHomeTabContent.jsx](/D:/Projem/src/components/app-shell/AppHomeTabContent.jsx), [Assistant.jsx](/D:/Projem/src/components/Assistant.jsx), [smartNotificationService.js](/D:/Projem/src/services/smartNotificationService.js)

Bu nedenle Huzur'u bugün "iyi bir AI destekli mobil uygulama" olarak değerlendirebilirim; fakat "absolute privacy ve on-device AI ile dünya klasmanında SOTA" olarak henüz değerlendiremiyorum.

## 2. İnceleme Kapsamı

Derin taranan alanlar:

- `src`
- `android`
- `functions`
- `package.json`
- `capacitor.config.ts`

Doğrulanan kalite kapıları:

- `npm run lint` -> geçti
- `npm run test:unit` -> geçti, 16 dosya / 31 test
- `npm run test:backend` -> geçti, 3 dosya / 28 test
- `npm run build` -> geçti
- `npm run bundle:budget` -> kaldı

Bundle budget sonucu:

- `index` bundle: **309.91 kB > 270 kB** limit

## 3. SOTA Skor Kartı

### Genel Skor

| Pillar | Skor | Kısa Hüküm |
|---|---:|---|
| 1. On-Device AI & Dynamic UI | 52/100 | Yerel heuristics var, ama çekirdek AI hala cloud-first |
| 2. Absolute Privacy & Zero-Data Leak | 40/100 | Güvenlik güçlü, fakat zero-telemetry iddiası bugün doğru değil |
| 3. Architecture & Capacitor SOTA | 82/100 | Native entegrasyon güçlü, ancak state ve legacy yüzeyler var |
| 4. Performance & Resource Management | 74/100 | WorkManager ve lazy-loading iyi, bundle/startup tarafında net açık var |
| 5. Execution Readiness | 86/100 | Lint, build, unit ve backend test kapıları çalışıyor |

**Ağırlıklı genel sonuç: 67/100**

## 4. Pillar 1: On-Device AI & Dynamic UI

### Mevcut Durum

Kullanıcı davranışı yerelde tutuluyor, fakat yapı bugün SOTA bir local feature store değil.

Kanıtlar:

- Davranış geçmişi `localStorage` tabanlı: [storageService.js:3](/D:/Projem/src/services/storageService.js:3), [storageService.js:4](/D:/Projem/src/services/storageService.js:4), [storageService.js:218](/D:/Projem/src/services/storageService.js:218)
- `Preferences` kullanımı var ama servis bunu açıkça "database değil" ve "strong security boundary değil" seviyesinde görüyor: [secureStorage.js:5](/D:/Projem/src/services/secureStorage.js:5)
- App open davranışı yerelde tutuluyor: [userActivityTracker.js:10](/D:/Projem/src/services/userActivityTracker.js:10), [userActivityTracker.js:11](/D:/Projem/src/services/userActivityTracker.js:11), [userActivityTracker.js:70](/D:/Projem/src/services/userActivityTracker.js:70), [userActivityTracker.js:109](/D:/Projem/src/services/userActivityTracker.js:109)
- Yerel öneri motoru ML değil, heuristic: [recommendationEngine.js:169](/D:/Projem/src/services/recommendationEngine.js:169)
- AI context yerelden derleniyor ama sonra cloud callable'a gönderiliyor: [aiContextService.js:12](/D:/Projem/src/services/aiContextService.js:12), [AppHomeTabContent.jsx:386](/D:/Projem/src/components/app-shell/AppHomeTabContent.jsx:386), [AppHomeTabContent.jsx:397](/D:/Projem/src/components/app-shell/AppHomeTabContent.jsx:397), [Assistant.jsx:150](/D:/Projem/src/components/Assistant.jsx:150), [Assistant.jsx:222](/D:/Projem/src/components/Assistant.jsx:222), [Assistant.jsx:224](/D:/Projem/src/components/Assistant.jsx:224), [smartNotificationService.js:242](/D:/Projem/src/services/smartNotificationService.js:242), [smartNotificationService.js:192](/D:/Projem/src/services/smartNotificationService.js:192)

### Hüküm

Bugünkü mimari:

- `local heuristics + remote ranking + remote assistant + remote push hints`

Bu, "on-device AI" iddiasının ancak kısmi bir versiyonu.

### SOTA Açığı

2026 seviyesinde Huzur'un hedef mimarisi şu olmalı:

1. Yerel olay deposu
2. Yerel feature engineering katmanı
3. Yerel ranking / recommendation modeli
4. Cloud AI'nin sadece opsiyonel "content intelligence" katmanında kalması

Bugünkü en büyük açıklar:

- `localStorage` halen ana persistence yolu
- SQLite tabanlı feature store yok
- ONNX Runtime / LiteRT / TFLite benzeri local inference runtime yok
- React tarafında `startTransition` ve `useDeferredValue` hiç kullanılmıyor

Kanıt:

- React concurrent primitives aramasında `useTransition`, `startTransition`, `useDeferredValue`, `useSyncExternalStore` kullanımına rastlanmadı
- Dynamic UI tarafı `useMemo + lazy + Suspense` seviyesinde kalmış: [AppHomeTabContent.jsx:1](/D:/Projem/src/components/app-shell/AppHomeTabContent.jsx:1), [AppHomeTabContent.jsx:29](/D:/Projem/src/components/app-shell/AppHomeTabContent.jsx:29), [AppHomeTabContent.jsx:341](/D:/Projem/src/components/app-shell/AppHomeTabContent.jsx:341), [AppHomeTabContent.jsx:430](/D:/Projem/src/components/app-shell/AppHomeTabContent.jsx:430)

### SOTA Tavsiye

#### Hedef Mimari

- **Faz 1:** Cloud ranking'i local-first hale getir
- **Faz 2:** Kullanıcı davranışını SQLite ring-buffer'a taşı
- **Faz 3:** ONNX Runtime Mobile veya LiteRT ile küçük ranking modeli çalıştır
- **Faz 4:** Cloud AI'yi sadece içerik üretimi / denetimli fallback için bırak

#### Teknoloji Kararı

Benim önerim:

- UI ranking için: **ONNX Runtime Mobile**
- Sebep:
  - küçük footprint'e özel custom build desteği var
  - Android tarafında NNAPI ve XNNPACK gibi execution provider ekosistemi mevcut
  - runtime küçültme ve operator reduction açıkça destekleniyor

Resmi dayanak:

- ONNX Runtime mobile/custom build: küçük footprint ve operatör azaltımı: [ONNX Runtime Custom Build](https://onnxruntime.ai/docs/build/custom.html)
- Mobile execution providers: NNAPI, XNNPACK: [ONNX Runtime Mobile](https://onnxruntime.ai/docs/get-started/with-mobile.html)

#### Kopyala-Yapıştır Snippet 1: Dynamic UI'yi non-blocking hale getir

Yeni dosya önerisi: `src/hooks/useDynamicUiRanking.js`

```js
import { startTransition, useDeferredValue, useEffect, useRef, useState } from 'react';
import { getHomeRankingV2 } from '../services/aiService';
import { buildAiContext } from '../services/aiContextService';
import { rankHomeCandidatesLocally } from '../services/deviceRecommendationService';
import { isAbsolutePrivacyEnabled } from '../services/privacyModeService';

export function useDynamicUiRanking({
  candidates = [],
  activeTab = 'home',
  activeFeature = 'home',
  streakData = null,
  dailyContent = null,
  timings = null,
  nextPrayer = null,
  locationName = '',
  isProUser = false,
  family = null,
  familyWeeklyGoal = null,
}) {
  const deferredCandidates = useDeferredValue(candidates);
  const [rankedItems, setRankedItems] = useState(() => deferredCandidates);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!Array.isArray(deferredCandidates) || deferredCandidates.length === 0) {
      setRankedItems([]);
      return;
    }

    const requestId = ++requestIdRef.current;
    const context = buildAiContext({
      activeTab,
      activeFeature,
      streakData,
      dailyContent,
      timings,
      nextPrayer,
      locationName,
      isProUser,
      family,
      familyWeeklyGoal,
    });

    const localRanked = rankHomeCandidatesLocally({ context, candidates: deferredCandidates });
    startTransition(() => {
      setRankedItems(localRanked);
    });

    if (isAbsolutePrivacyEnabled()) {
      return;
    }

    let cancelled = false;

    void (async () => {
      const result = await getHomeRankingV2({
        context,
        candidates: deferredCandidates,
      });

      if (cancelled || requestId !== requestIdRef.current) return;
      if (!Array.isArray(result?.rankedItems) || result.rankedItems.length === 0) return;

      startTransition(() => {
        setRankedItems(result.rankedItems);
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [
    deferredCandidates,
    activeTab,
    activeFeature,
    streakData,
    dailyContent,
    timings,
    nextPrayer,
    locationName,
    isProUser,
    family,
    familyWeeklyGoal,
  ]);

  return rankedItems;
}
```

#### Kopyala-Yapıştır Snippet 2: Local-first ranking motoru

Yeni dosya önerisi: `src/services/deviceRecommendationService.js`

```js
const scoreCandidate = (candidate, context) => {
  const hour = new Date().getHours();
  const streak = Number(context?.streak?.current || 0);
  const activity = context?.activityPattern || {};
  const reminderEnabled = context?.notificationPrefs?.reminder === true;

  let score = 0;

  if (candidate.id === 'dailyQuests') score += streak > 0 ? 30 : 10;
  if (candidate.id === 'familyMomentum') score += context?.family ? 25 : 0;
  if (candidate.id === 'dailyDiscovery') score += reminderEnabled ? 10 : 4;
  if (candidate.id === 'dailyContent') score += 8;
  if (candidate.id === 'featureGrid') score += 6;

  if (hour >= 5 && hour < 12) score += activity.morning || 0;
  if (hour >= 12 && hour < 17) score += activity.afternoon || 0;
  if (hour >= 17 && hour < 22) score += activity.evening || 0;

  if (candidate.feature === 'assistant' && streak === 0) score += 12;
  if (candidate.feature === 'quran' && (context?.streak?.quranCount || 0) > 0) score += 16;
  if (candidate.feature === 'prayers' && (context?.streak?.prayerCount || 0) > 0) score += 16;

  return score;
};

export const rankHomeCandidatesLocally = ({ context, candidates = [] }) => {
  return [...candidates]
    .map((candidate) => ({
      ...candidate,
      localScore: scoreCandidate(candidate, context),
    }))
    .sort((a, b) => b.localScore - a.localScore);
};
```

## 5. Pillar 2: Absolute Privacy & Zero-Data Leak

### Mevcut Durum

Güvenlik yüzeyinde iyi kararlar var:

- App Check aktif: [MainActivity.java:78](/D:/Projem/android/app/src/main/java/com/huzurapp/android/MainActivity.java:78), [MainActivity.java:85](/D:/Projem/android/app/src/main/java/com/huzurapp/android/MainActivity.java:85)
- FCM token client tarafından Firestore'a direkt yazılamıyor, callable ile sync ediliyor; backend testleri bunu doğruluyor: [fcmService.js:57](/D:/Projem/src/services/fcmService.js:57), [functions/index.js:3741](/D:/Projem/functions/index.js:3741), [firestore.rules.test.js](/D:/Projem/tests/backend/firestore.rules.test.js)
- OpenAI ve Gemini anahtarları client'ta değil, Functions Secret olarak tutuluyor: [functions/index.js:18](/D:/Projem/functions/index.js:18), [functions/index.js:19](/D:/Projem/functions/index.js:19)
- Network security config cleartext'i kapatmış: [network_security_config.xml](/D:/Projem/android/app/src/main/res/xml/network_security_config.xml)

Ancak "Absolute Privacy / Zero Telemetry" iddiası bugün doğru değil.

Kanıtlar:

- Firebase Analytics config ve measurementId mevcut: [firebase.js:19](/D:/Projem/src/services/firebase.js:19), [firebase.js:93](/D:/Projem/src/services/firebase.js:93), [firebase.js:99](/D:/Projem/src/services/firebase.js:99)
- Analytics servisi Firebase Analytics'e event gönderiyor: [analyticsService.js:3](/D:/Projem/src/services/analyticsService.js:3), [analyticsService.js:175](/D:/Projem/src/services/analyticsService.js:175), [analyticsService.js:871](/D:/Projem/src/services/analyticsService.js:871)
- Android tarafında Firebase Analytics ve Crashlytics bağımlılıkları var: [build.gradle:63](/D:/Projem/android/app/build.gradle:63), [build.gradle:69](/D:/Projem/android/app/build.gradle:69)
- Crashlytics reporter kullanım yüzeyleri var: [ErrorBoundary.jsx:24](/D:/Projem/src/components/ErrorBoundary.jsx:24), [useBootstrapEffects.js:30](/D:/Projem/src/hooks/app-shell/useBootstrapEffects.js:30)
- Assistant, home ranking ve push hints cloud callable çağırıyor: [aiService.js:1](/D:/Projem/src/services/aiService.js:1), [aiService.js:10](/D:/Projem/src/services/aiService.js:10)
- Kullanıcı bağlamı build edilip buluta gönderiliyor: [Assistant.jsx:224](/D:/Projem/src/components/Assistant.jsx:224), [AppHomeTabContent.jsx:397](/D:/Projem/src/components/app-shell/AppHomeTabContent.jsx:397), [smartNotificationService.js:192](/D:/Projem/src/services/smartNotificationService.js:192)

Ek veri sızıntı yüzeyleri:

- Google Fonts remote import: [index.css:1](/D:/Projem/src/index.css:1)
- Dış ağ servisleri: AlAdhan, Open Meteo, BigDataCloud, Overpass, AlQuran, acikkuran, mp3quran vb.: [prayerService.js](/D:/Projem/src/services/prayerService.js), [useLocationConsent.js](/D:/Projem/src/hooks/useLocationConsent.js), [MosqueFinder.jsx](/D:/Projem/src/components/MosqueFinder.jsx), [quranService.js](/D:/Projem/src/services/quranService.js)

### API Anahtarı Değerlendirmesi

Şu ayrımı net yapmak önemli:

- **Gizli olmaması normal olan client anahtarları / tanımlayıcılar:**
  - Firebase web config
  - RevenueCat public SDK key
  - AdMob app/ad unit ID
  - reCAPTCHA site key

- **Gizli kalması gereken gerçek server secret'lar:**
  - OpenAI API key
  - Gemini API key
  - RevenueCat server API key
  - webhook secret'ları

Huzur'da server secret'lar doğru yerde: Functions secret manager.

### Hüküm

Uygulama bugün:

- **Güvenli olabilir**
- **Abuse'a karşı sertleştirilmiş olabilir**
- ama **Zero Telemetry** değildir
- ve **All AI logic stays on device** de değildir

### SOTA Tavsiye

Hedef mod ikiye ayrılmalı:

1. **Absolute Privacy Mode**
   - Analytics kapalı
   - Crashlytics kapalı
   - remote AI kapalı
   - Google Fonts ve benzeri üçüncü parti ağ istekleri kapalı
2. **Connected Intelligence Mode**
   - Kullanıcı açık rıza ile cloud intelligence açabilir

#### Kopyala-Yapıştır Snippet 3: Privacy hard-kill kapısı

Yeni dosya önerisi: `src/services/privacyModeService.js`

```js
import { storageService } from './storageService';

const PRIVACY_MODE_KEY = 'huzur_absolute_privacy_mode';

export const isAbsolutePrivacyEnabled = () => {
  return storageService.getBoolean(PRIVACY_MODE_KEY, false);
};

export const setAbsolutePrivacyEnabled = (enabled) => {
  storageService.setBoolean(PRIVACY_MODE_KEY, enabled === true);
};

export const runIfPrivacyAllows = async (fn, fallback = null) => {
  if (isAbsolutePrivacyEnabled()) {
    return typeof fallback === 'function' ? fallback() : fallback;
  }

  return await fn();
};
```

`src/services/analyticsService.js` içine minimum patch:

```js
import { isAbsolutePrivacyEnabled } from './privacyModeService';

init() {
  if (this.initialized) return;

  if (isAbsolutePrivacyEnabled()) {
    this.enabled = false;
    this.consentGiven = false;
    this.initialized = true;
    this.queue = [];
    this.stopPeriodicFlush();
    return;
  }

  // mevcut init devam eder
}
```

`src/services/aiService.js` içine minimum patch:

```js
import { runIfPrivacyAllows } from './privacyModeService';

export const getHomeRankingV2 = async (payload = {}) => {
  return runIfPrivacyAllows(
    async () => {
      try {
        return await callAiFunction('getHomeRankingV2', payload);
      } catch (error) {
        recordAiIncident('home_ranking', 'callable_failed', error, buildAiIncidentMetadata(payload));
        logger.warn('[AIService] getHomeRankingV2 failed', error);
        return null;
      }
    },
    null
  );
};
```

## 6. Pillar 3: Architecture & Capacitor SOTA Practices

### Mevcut Durum

Bu bölümde en önemli düzeltme:

**Repo Capacitor 6 değil, Capacitor 8 kullanıyor.**

Kanıt:

- [package.json:33](/D:/Projem/package.json:33)
- [package.json:67](/D:/Projem/package.json:67)

Pozitif taraflar:

- Capacitor native plugin seti modern: [capacitor.plugins.json](/D:/Projem/android/app/src/main/assets/capacitor.plugins.json)
- SplashScreen modern AndroidX stackte: [build.gradle:52](/D:/Projem/android/app/build.gradle:52)
- Native App Check integration iyi: [MainActivity.java:41](/D:/Projem/android/app/src/main/java/com/huzurapp/android/MainActivity.java:41), [MainActivity.java:85](/D:/Projem/android/app/src/main/java/com/huzurapp/android/MainActivity.java:85)
- Notification channel organizasyonu iyi: [notificationPlatformService.js:6](/D:/Projem/src/services/notificationPlatformService.js:6), [notificationPlatformService.js:105](/D:/Projem/src/services/notificationPlatformService.js:105)

Negatif taraflar:

- Gradle'da Cordova compatibility katmanı hala taşınıyor: [build.gradle:44](/D:/Projem/android/app/build.gradle:44), [build.gradle:57](/D:/Projem/android/app/build.gradle:57)
- `cordova.js` ve `cordova_plugins.js` asset olarak hala paketleniyor: [android/app/src/main/assets/public/cordova.js](/D:/Projem/android/app/src/main/assets/public/cordova.js), [android/app/src/main/assets/public/cordova_plugins.js](/D:/Projem/android/app/src/main/assets/public/cordova_plugins.js)
- State yönetimi geniş Context provider'lar üzerinden ilerliyor: [FamilyProvider.jsx:133](/D:/Projem/src/context/FamilyProvider.jsx:133), [FamilyProvider.jsx:134](/D:/Projem/src/context/FamilyProvider.jsx:134), [GamificationProvider.jsx:254](/D:/Projem/src/context/GamificationProvider.jsx:254)
- Selector tabanlı store yok; `useSyncExternalStore` yok

### Hüküm

Native kabiliyet kullanımı güçlü, fakat React state mimarisi 2026 SOTA seviyesinde değil.

Bugünkü risk:

- Bir context içindeki unrelated state güncellemesi çok daha geniş render dalgası oluşturabilir
- Dynamic UI layout değişimleri büyüdükçe jank riski artar

### SOTA Tavsiye

Önerdiğim state mimarisi:

- `Context` sadece session-scope ve dependency injection için
- UI-critical state için selector tabanlı external store
- Dynamic home ranking state'i ayrı store
- Family ve gamification state'ini dilimlere ayır

Ek not:

- Background Runner bugün projede kullanılmıyor; bu sorun değil
- Android'de prayer sync için native WorkManager yaklaşımı, bu use-case için Capacitor JS background runner'dan daha doğru
- Background Runner ancak hafif headless JS event işleri için düşünülmeli

## 7. Pillar 4: Performance & Resource Management

### Mevcut Durum

İyi taraflar:

- Lazy-loading kullanılmış: [App.jsx:25](/D:/Projem/src/App.jsx:25), [App.jsx:26](/D:/Projem/src/App.jsx:26), [App.jsx:27](/D:/Projem/src/App.jsx:27), [App.jsx:29](/D:/Projem/src/App.jsx:29)
- `Suspense` kullanımı mevcut: [App.jsx:129](/D:/Projem/src/App.jsx:129), [AppHomeTabContent.jsx:435](/D:/Projem/src/components/app-shell/AppHomeTabContent.jsx:435)
- Android background scheduling modern: [PrayerDataSyncWorker.kt:49](/D:/Projem/android/app/src/main/java/com/huzurapp/android/PrayerDataSyncWorker.kt:49), [PrayerDataSyncWorker.kt:57](/D:/Projem/android/app/src/main/java/com/huzurapp/android/PrayerDataSyncWorker.kt:57), [PrayerDataSyncWorker.kt:69](/D:/Projem/android/app/src/main/java/com/huzurapp/android/PrayerDataSyncWorker.kt:69), [PrayerDataSyncWorker.kt:71](/D:/Projem/android/app/src/main/java/com/huzurapp/android/PrayerDataSyncWorker.kt:71)
- Foreground service kullanımı doğru use-case'te: [AndroidManifest.xml:25](/D:/Projem/android/app/src/main/AndroidManifest.xml:25)
- Notification listener cleanup var: [smartNotificationService.js:718](/D:/Projem/src/services/smartNotificationService.js:718), [fcmService.js:202](/D:/Projem/src/services/fcmService.js:202)

### Kritik Açıklar

#### 1. Bundle budget kırılıyor

- `index` bundle 309.91 kB ile limit üstünde
- `vendor-firebase` 447.14 kB
- `vendor-react` 190.32 kB

#### 2. Büyük dosya yoğunluğu fazla

En büyük kaynak dosyalar:

- [functions/index.js](/D:/Projem/functions/index.js)
- [Library.jsx](/D:/Projem/src/components/Library.jsx)
- [Settings.jsx](/D:/Projem/src/components/Settings.jsx)
- [PrayerTeacher.jsx](/D:/Projem/src/components/PrayerTeacher.jsx)
- [Quran.jsx](/D:/Projem/src/components/Quran.jsx)
- [analyticsService.js](/D:/Projem/src/services/analyticsService.js)
- [smartNotificationService.js](/D:/Projem/src/services/smartNotificationService.js)

#### 3. Startup optimization incomplete

Bulamadığım şeyler:

- uygulamaya ait Baseline Profile
- uygulamaya ait Startup Profile
- WorkManager on-demand initialization

Not:

- Kütüphane transitive profile metadata'sı görülüyor, ama app-owned Baseline/Startup profile izi görünmüyor

### SOTA Tavsiye

1. `firebase`, `maps`, `html2canvas` ve settings/premium/social alanlarını daha agresif code split et
2. App startup sıcak yolundaki init'leri ayır
3. Android Baseline Profile + Startup Profile ekle
4. WorkManager init'i startup path'ten çıkar

#### Kopyala-Yapıştır Snippet 4: WorkManager'ı startup path'ten çıkar

Yeni dosya önerisi: `android/app/src/main/java/com/huzurapp/android/HuzurApplication.kt`

```kotlin
package com.huzurapp.android

import android.app.Application
import android.util.Log
import androidx.work.Configuration

class HuzurApplication : Application(), Configuration.Provider {
    override val workManagerConfiguration: Configuration
        get() = Configuration.Builder()
            .setMinimumLoggingLevel(Log.INFO)
            .build()
}
```

`AndroidManifest.xml` içine:

```xml
<application
    android:name=".HuzurApplication"
    ... >

    <provider
        android:name="androidx.startup.InitializationProvider"
        android:authorities="${applicationId}.androidx-startup"
        android:exported="false"
        tools:node="merge">
        <meta-data
            android:name="androidx.work.WorkManagerInitializer"
            android:value="androidx.startup"
            tools:node="remove" />
    </provider>

</application>
```

Bu değişiklikten sonra WorkManager sadece ihtiyaç duyulduğunda initialize edilerek startup yolundan çıkarılabilir.

#### Kopyala-Yapıştır Snippet 5: Verified App Links

`AndroidManifest.xml` intent-filter önerisi:

```xml
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />

    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />

    <data
        android:scheme="https"
        android:host="huzurapp.com"
        android:pathPrefix="/invite" />
</intent-filter>
```

Bugün sadece custom scheme var: [AndroidManifest.xml:55](/D:/Projem/android/app/src/main/AndroidManifest.xml:55)

## 8. Pillar 5: Actionable SOTA Upgrade Plan

### 0-30 Gün: P0

1. **USP doğruluk düzeltmesi**
   - Ya analytics/crashlytics/remote AI kapat
   - ya da ürün vaadini "Privacy-first" olarak yeniden çerçevele

2. **Local-first AI routing**
   - Home ranking
   - push hint
   - assistant quick guidance

3. **Bundle kurtarma**
   - `firebase` split
   - `maps` split
   - `html2canvas` split
   - `Settings`, `SocialDashboard`, `Library` alt bölme

### 30-60 Gün: P1

1. Context parçalama ve selector-store
2. App-specific Baseline Profile + Startup Profile
3. WorkManager on-demand initialization
4. Google Fonts'ı self-host et
5. Verified App Links + `assetlinks.json`

### 60-90 Gün: P2

1. SQLite event store
2. ONNX Runtime Mobile local ranking modeli
3. Quantized model + NNAPI/XNNPACK denemeleri
4. Full privacy mode regression suite

## 9. World-Class Super App'i Engelleyen Top 3 Darboğaz

### 1. USP ile gerçek sistem davranışı arasındaki fark

En büyük stratejik risk budur.

Bugün pazarlama sözü:

- absolute privacy
- zero telemetry
- on-device AI

Bugünkü gerçek:

- telemetry var
- cloud AI var
- local ML yok

Bu fark teknik borçtan daha ağırdır; çünkü güven vaadini zayıflatır.

### 2. Local intelligence için yanlış veri omurgası

`localStorage + Preferences + heuristic logic`, 2026 seviyesinde sürdürülebilir personalization omurgası değildir.

Gerekli yapı:

- structured local event stream
- feature extraction
- versioned model artifacts
- local ranking policy

### 3. UI/state/performance katmanında ölçek sınırı

Bugün uygulama iyi çalışıyor; ama dünya klasmanında süper app seviyesinde home personalization, sosyal akış ve canlı AI katmanları büyüdükçe şu sınırlar daha görünür olacak:

- broad context rerender fan-out
- bundle budget ihlali
- giant service/component yoğunluğu

## 10. Nihai Karar

### Kısa Hüküm

Huzur bugün:

- **iyi mühendislik temeline sahip**
- **Android native reliability açısından güçlü**
- **backend trust/security açısından ciddi ilerleme göstermiş**

Ama bugün henüz:

- **absolute privacy app**
- **zero telemetry app**
- **on-device AI first app**

değil.

### Benim Net Sonuç Cümlem

**Huzur bugün "AI destekli, privacy-aware, modern hibrit mobil uygulama" seviyesinde. 2026 SOTA seviyesine çıkması için cloud-first AI ve telemetry omurgasını local-first privacy architecture'a çevirmesi gerekiyor.**

## 11. Kullanılan Resmi Kaynaklar

- React `useDeferredValue`: https://react.dev/reference/react/useDeferredValue
- React `startTransition`: https://react.dev/reference/react/startTransition
- Capacitor Preferences API: https://capacitorjs.com/docs/apis/preferences
- Capacitor Background Runner: https://capacitorjs.com/docs/apis/background-runner
- Android Background Tasks Overview: https://developer.android.com/develop/background-work/background-tasks
- Android Custom WorkManager Initialization: https://developer.android.com/develop/background-work/background-tasks/persistent/configuration/custom-configuration
- Android Baseline Profiles: https://developer.android.com/topic/performance/baselineprofiles/overview
- Android Verify App Links: https://developer.android.com/training/app-links/verify-applinks
- ONNX Runtime Mobile: https://onnxruntime.ai/docs/get-started/with-mobile.html
- ONNX Runtime Custom Build: https://onnxruntime.ai/docs/build/custom.html
- Google AI Edge LiteRT On-device Inference: https://ai.google.dev/edge/litert/inference
