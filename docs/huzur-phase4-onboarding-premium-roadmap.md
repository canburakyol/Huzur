# Huzur Faz 4 Onboarding ve Premium Yol Haritasi

## Faz 4 amaci
Yeni kullanicinin ilk deger anini hizlandirmak ve premium'u reklam kapatma yerine daha derin rehberlik ve sureklilik degeri etrafinda konumlandirmak.

## Bu fazda teslim edilen katmanlar

### 1. Firestore-backed onboarding config
- Kanonik dokuman: `config/onboardingExperience`
- Alanlar:
  - `flowVersion`
  - `enabled`
  - `steps`
  - `headlineVariant`
  - `permissionEmphasis`
  - `goalDefault`
  - `premiumTeaserEnabled`

### 2. Config-driven onboarding
- `GrowthOnboarding` artik adim sirasini config'ten okuyabilir
- config yoksa mevcut fallback akis korunur
- yeni analytics:
  - `onboarding_step_viewed`
  - `onboarding_step_completed`
  - `onboarding_goal_selected`
  - `onboarding_permission_choice`

### 3. Premium moment engine
- Kanonik dokuman: `config/premiumMoments`
- yeni servis: `premiumMomentService`
- ilk yuzeyler:
  - `home_recovery_support`
  - `weekly_report`
  - `assistant_success`
  - `onboarding_complete`

### 4. Source-aware paywall
- `ProUpgrade` artik source ve moment baglamini bilir
- `experimentService` uzerinden:
  - `paywall_value_stack_v1`
  - `paywall_cta_v1`
  varyantlari kullanilir

## Premium copy ilkeleri
- ana mesaj `AI rehberlik`, `haftalik derinlik`, `aile ritmi`, `sessiz destek`
- `Ad-free` yardimci mesaj olarak kalir
- Pro kullanicida premium moment tetiklenmez

## Faz 4 rollout sirasi
1. `remote_onboarding_v1_enabled`
2. `premium_moments_v1_enabled`
3. onboarding config optimizasyonu
4. paywall copy varyantlari

## Faz 4 kabul kriteri
- onboarding akisi release atmadan Firestore config ile degistirilebilir olmali
- premium moment kaynagi analytics'e duzgun dusmeli
- ayni kullanici ayni experiment varyantini gormeli
- premium momentler Pro kullanicida gorunmemeli
