# Huzur Strategy Correction - 2026-05-07

## Decision

Huzur should stop presenting itself first as a broad Islamic super app.

For the next release cycle, the first-session wedge is:

> Namaz vaktini kacirma; her gun 2 dakikalik Kuran veya dua ritmi kur.

AI, family, social, referral, and premium remain available, but they are secondary layers. The first screen and onboarding should drive one small daily ibadah action.

## Why This Changed

- Broad "all-in-one Islamic lifestyle" positioning competes directly with much larger incumbents.
- Quranly wins with a narrow Quran habit promise.
- Pillars wins with a clear prayer/privacy/ad-free promise.
- Huzur's current strongest near-term wedge is not "more features"; it is a calmer daily rhythm that combines prayer timing with a tiny Quran/dua action.

## Product Defaults

- Default goal: `prayer_rhythm`
- First activation: one 2-minute action, not feature exploration
- Home priority copy: daily rhythm first, feature grid second
- Premium copy: weekly rhythm insight and recovery support first, AI as support

## Metrics Gate

Do not judge the strategy by installs alone. Judge the next release with this funnel:

1. `onboarding_started`
2. `onboarding_completed`
3. `first_activation_card_viewed`
4. `first_activation_card_clicked`
5. `first_activation_feature_opened`
6. true first ibadah completion event
7. D1 retention
8. D7 retention
9. `paywall_viewed`
10. `paywall_purchase_succeeded`

Minimum target for the next validation cycle:

- Onboarding completion: 70%+
- First activation click: 45%+
- First activation feature open: 35%+
- D1 retention: 25%+
- D7 retention: 10%+

## Decision Rules

- If store listing visitors are low: fix ASO, screenshots, reviews, and distribution before adding features.
- If store conversion is low: fix title, short description, screenshots, and trust copy.
- If onboarding completion is low: reduce setup friction.
- If first activation is low: make the first card more concrete and less feature-like.
- If feature opens are healthy but true completion is low: fix the target feature, not onboarding.
- If D1/D7 retention is low: improve reminders, daily content relevance, and recovery loops.
- If retention is healthy but revenue is low: only then optimize paywall and pricing.

## Confidence Loop

This strategy is not considered proven until the next production cohort shows:

- Store listing acquisition source and conversion are known from Play Console.
- The onboarding funnel has enough users to separate copy friction from product friction.
- `first_activation_feature_opened` is tracked separately from true task completion.
- D1 and D7 cohorts are reviewed by acquisition source and primary goal.

Current confidence without live dashboard access: high enough to test, not high enough to scale.

## Non-Goals For This Cycle

- Do not lead with "AI app".
- Do not add more home modules.
- Do not push social/family before first individual activation.
- Do not make premium the first success metric.
