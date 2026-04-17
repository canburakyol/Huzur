# Huzur Faz 4 Config Runbook

## Kullanilan Firestore dokumanlari
- `config/onboardingExperience`
- `config/premiumMoments`
- `config/aiFlags`

## Ornek onboarding config
```json
{
  "flowVersion": "v1",
  "enabled": true,
  "steps": ["language", "permissions", "goal"],
  "headlineVariant": "calm",
  "permissionEmphasis": "balanced",
  "goalDefault": "prayer_rhythm",
  "premiumTeaserEnabled": true
}
```

## Ornek premium moments config
```json
{
  "enabled": true,
  "preferredPackages": {
    "assistant_success": "yearly",
    "weekly_report": "yearly",
    "home_recovery_support": "monthly",
    "onboarding_complete": "yearly"
  },
  "copyVariants": {
    "assistant_success": "ai_guidance",
    "weekly_report": "weekly_depth",
    "home_recovery_support": "quiet_support",
    "onboarding_complete": "family_rhythm"
  }
}
```

## Gerekli AI flag alanlari
```json
{
  "ai_ops_rollup_v1_enabled": true,
  "remote_onboarding_v1_enabled": true,
  "premium_moments_v1_enabled": true
}
```

## Rollout notlari
1. Ilk once `ai_ops_rollup_v1_enabled` acik olmali.
2. Ardindan `remote_onboarding_v1_enabled` acilir ve onboarding analytics izlenir.
3. Sonra `premium_moments_v1_enabled` acilir.
4. `ops/aiReleaseStatus.status = critical` ise yeni AI/premium rollout ileri goturulmez.
