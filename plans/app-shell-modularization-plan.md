# App Shell Modülerleştirme Planı

## Hedef
[`App`](src/App.jsx:68) içindeki orchestration yoğunluğunu azaltarak bakım, test edilebilirlik ve güvenli refactor hızını artırmak.

## Mevcut Sorumluluk Haritası

### 1) Bootstrap ve platform init
- Auth init: [`ensureAuthenticated`](src/App.jsx:141)
- Analytics init: [`analyticsService.init`](src/App.jsx:150)
- Crashlytics/test hook: [`initCrashlyticsTestHook`](src/App.jsx:201)
- Global error listeners: [`window.addEventListener`](src/App.jsx:215)

### 2) Deep link ve referral giriş akışı
- İlk URL yakalama: [`captureInviteAcceptanceFromUrl`](src/App.jsx:154)
- Android launch URL: [`CapacitorApp.getLaunchUrl`](src/App.jsx:162)
- Runtime URL open listener: [`CapacitorApp.addListener`](src/App.jsx:169)

### 3) Onboarding orkestrasyonu
- Başlangıç flag: [`showGrowthOnboarding`](src/App.jsx:79)
- Başlama eventi: [`logOnboardingStarted`](src/App.jsx:193)
- Tamamlama eventi + referral tetik: [`handleGrowthComplete`](src/App.jsx:285)

### 4) Navigation ve overlay state
- Tab, feature, modal/overlay state: [`activeTab`](src/App.jsx:74), [`activeFeature`](src/App.jsx:73), [`showMoodSelector`](src/App.jsx:76)
- Global custom event bridge: [`openFeature`](src/App.jsx:263), [`setActiveTab`](src/App.jsx:264)

### 5) Streak recovery/protection flow
- Risk check: [`checkAndNotifyStreakRisk`](src/App.jsx:227)
- Recovery state: [`setStreak24hRecovery`](src/App.jsx:247)
- Confirm handler: [`handleConfirm24hRecovery`](src/App.jsx:300)

### 6) View composition
- Home tab birleşik render bloğu: [`activeTab === 'home'`](src/App.jsx:434)
- Feature overlay render gate: [`if (activeFeature)`](src/App.jsx:311)

## Hedef Mimari (Dosya Bazlı)

### A) Yeni hook katmanı
1. `src/hooks/app-shell/useBootstrapEffects.js`
   - Auth + analytics + crashlytics + global error wiring
   - Dışa API: `useBootstrapEffects()`

2. `src/hooks/app-shell/useDeepLinkBridge.js`
   - Launch URL + appUrlOpen handling
   - Dışa API: `useDeepLinkBridge()`

3. `src/hooks/app-shell/useGrowthOnboardingFlow.js`
   - onboarding state + language + complete handler
   - Dışa API:
     - `showGrowthOnboarding`
     - `onboardingLanguage`
     - `handleGrowthLanguageSelect`
     - `handleGrowthLocationRequest`
     - `handleGrowthNotificationRequest`
     - `handleGrowthComplete`

4. `src/hooks/app-shell/useStreakGuards.js`
   - protectionTarget + streak24hRecovery + recovery handlers
   - Dışa API:
     - `protectionTarget`
     - `setProtectionTarget`
     - `streak24hRecovery`
     - `setStreak24hRecovery`
     - `handleConfirm24hRecovery`

5. `src/hooks/app-shell/useNavigationState.js`
   - `activeTab`, `activeFeature`, hamburger/mood/invite state
   - custom event listeners `openFeature`/`setActiveTab`

### B) Yeni render component katmanı
1. `src/components/app-shell/AppOverlays.jsx`
   - Splash, GrowthOnboarding, InviteModal, MoodSelector, badge popup, streak modals, confetti

2. `src/components/app-shell/AppHomeTabContent.jsx`
   - Home tab içeriğinin tamamı (banner, header, stories, countdown, quests, content grid, ad, feature grid)

3. `src/components/app-shell/AppTabRouter.jsx`
   - prayers, quran, community, assistant tab switch render

## Migrasyon Sırası (Düşük Risk)

### Sprint 1 - Hook extraction (davranış koruma)
1. [`useDeepLinkBridge`](src/hooks/app-shell/useDeepLinkBridge.js) ekle ve [`App`](src/App.jsx:68) içinde mevcut `useEffect` bloklarını bu hook ile değiştir.
2. [`useBootstrapEffects`](src/hooks/app-shell/useBootstrapEffects.js) ekle; init effectlerini taşı.
3. [`useStreakGuards`](src/hooks/app-shell/useStreakGuards.js) ekle; streak effect + confirm logic taşı.

**Rollback noktası:** Her adım sonrası sadece import kaldırıp eski `useEffect` bloklarını geri almak yeterli.

### Sprint 2 - Navigation + onboarding akışı
4. [`useNavigationState`](src/hooks/app-shell/useNavigationState.js) ile UI state kümelerini taşı.
5. [`useGrowthOnboardingFlow`](src/hooks/app-shell/useGrowthOnboardingFlow.js) ile onboarding/referral/analytics bağını taşı.

**Rollback noktası:** State yine [`App`](src/App.jsx:68) içinde aynı isimlerle tutulabildiği için tek commit geri dönüşü güvenli.

### Sprint 3 - Render parçalama
6. [`AppOverlays`](src/components/app-shell/AppOverlays.jsx) oluştur.
7. [`AppHomeTabContent`](src/components/app-shell/AppHomeTabContent.jsx) oluştur.
8. [`AppTabRouter`](src/components/app-shell/AppTabRouter.jsx) oluştur.
9. [`App`](src/App.jsx:68) yalnızca shell/orchestrator olacak şekilde sadeleştir.

**Rollback noktası:** Render extraction commitleri bağımsız tutulur; bir component geri alınsa dahi diğerleri çalışır.

## Dosya Bazlı Backlog
- `src/App.jsx` refactor (import ve orchestration sadeleşmesi)
- `src/hooks/app-shell/useBootstrapEffects.js` yeni
- `src/hooks/app-shell/useDeepLinkBridge.js` yeni
- `src/hooks/app-shell/useGrowthOnboardingFlow.js` yeni
- `src/hooks/app-shell/useStreakGuards.js` yeni
- `src/hooks/app-shell/useNavigationState.js` yeni
- `src/components/app-shell/AppOverlays.jsx` yeni
- `src/components/app-shell/AppHomeTabContent.jsx` yeni
- `src/components/app-shell/AppTabRouter.jsx` yeni

## Kabul Kriterleri
1. [`App`](src/App.jsx:68) dosyasında sadece shell seviyesinde state orchestration kalmalı.
2. Deep link kabulü davranışı korunmalı: launch + runtime URL akışı.
3. Onboarding completion sonrası referral ve analytics tetikleri birebir korunmalı.
4. Streak recovery/protection modal davranışı korunmalı.
5. Render çıktısı parity: home tab + tab router + overlay davranışları değişmemeli.

## Prefetch Politikası (Bu Faz için sabit)
- Bu sprintte yeni agresif prefetch eklenmeyecek.
- Sadece mevcut lazy sınırları korunacak.
- Prefetch optimizasyonu ayrı sprintte yapılacak.

## lottie-web Uyarısı İçin Strateji Seçenekleri

### Mevcut durum
- Paket: [`lottie-react`](package.json:41)
- Chunk ayrımı: [`vendor-lottie`](vite.config.js:42)
- Uyarı kaynağı: [`lottie-web`](node_modules/lottie-web/build/player/lottie.js)

### Seçenek A - İzole et ve koşullu yükle (önerilen)
1. Lottie kullanan ekranları ayrı lazy boundary altında tut.
2. Düşük cihaz profillerinde Lottie yerine statik fallback göster.
3. Lottie kullanılmadığı akışlarda chunk fetch etme.

**Artı:** En düşük risk, mevcut davranışı bozmaz.
**Eksi:** `eval` uyarısı teknik olarak devam eder.

### Seçenek B - Animasyonu JSON tabanlı ama non-lottie renderer ile değiştir
1. Lottie bağımlılığını azaltacak alternatif renderer dene.
2. Kritik ekranlarda SVG/CSS animasyon fallback’e geç.

**Artı:** `lottie-web` bağımlılığını azaltır.
**Eksi:** Görsel parity ve geliştirme maliyeti artar.

### Seçenek C - Tam kaldırma ve yerel animasyon sistemi
1. `lottie-react` kaldırılır.
2. Yerine CSS/SVG/Canvas animasyon katmanı kurulur.

**Artı:** Uyarı tamamen biter, kontrol artar.
**Eksi:** Yüksek migration maliyeti ve ürün riski.

### Karar
- Kısa vadede Seçenek A uygulanmalı.
- Orta vadede Seçenek B için PoC açılmalı.

## CI Bundle Budget Kural Seti

### Ölçüm kaynağı
- Build çıktısı (`vite build`) ve chunk boyutları.
- Gerekirse [`bundle-stats.html`](bundle-stats.html) artefact olarak saklanır.

### Önerilen eşikler
1. `index-*.js` gzip <= 80 kB (şu an ~75.8 kB civarı)
2. Yeni eklenen feature chunk gzip <= 10 kB hedefi
3. Tekil vendor chunk gzip <= 110 kB (firebase hariç)
4. PR bazında toplam gzip artışı > 20 kB ise uyarı

### Pipeline davranışı
- Soft fail: eşik aşımlarında warning + rapor yorum.
- Hard fail: `index-*.js` veya kritik vendor için %15+ sapma.

## Code Modu Sprint Backlogu (Final)

### Sprint 1 - Güvenli extraction
- [`useDeepLinkBridge`](src/hooks/app-shell/useDeepLinkBridge.js) oluştur
- [`useBootstrapEffects`](src/hooks/app-shell/useBootstrapEffects.js) oluştur
- [`useStreakGuards`](src/hooks/app-shell/useStreakGuards.js) oluştur
- [`App`](src/App.jsx:68) effect bloklarını yeni hooklara delege et

### Sprint 2 - State orchestration ayrımı
- [`useNavigationState`](src/hooks/app-shell/useNavigationState.js) oluştur
- [`useGrowthOnboardingFlow`](src/hooks/app-shell/useGrowthOnboardingFlow.js) oluştur
- [`App`](src/App.jsx:68) state/handler kalınlığını azalt

### Sprint 3 - Render decomposition
- [`AppOverlays`](src/components/app-shell/AppOverlays.jsx) oluştur
- [`AppHomeTabContent`](src/components/app-shell/AppHomeTabContent.jsx) oluştur
- [`AppTabRouter`](src/components/app-shell/AppTabRouter.jsx) oluştur
- [`App`](src/App.jsx:68) shell orchestrator seviyesine indir

### Doğrulama checklist
- ESLint: yeni hook/component dosyaları + [`App`](src/App.jsx:68)
- Build: chunk dağılımı ve budget kıyası
- Android: `cap sync` + debug assemble regresyon
