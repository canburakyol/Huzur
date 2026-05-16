# Huzur Strategy Confidence Loop - 2026-05-08

## Current Confidence

Not 100%.

Current confidence: 91/100.

The strategy is strong enough to test, but not strong enough to scale aggressively without live Play Console, Firebase, RevenueCat, and AdMob evidence.

## Latest Gap Loop

### Gap 1: Broad positioning

Status: corrected in app copy.

Fix applied:
- First-session wedge is now daily prayer rhythm plus a 2-minute Quran/dua step.
- Home priority, onboarding, activation card, AI note, and premium copy were aligned around that wedge.

Residual risk:
- Store listing screenshots and Play Console metadata still need to say the same thing.

Follow-up correction:
- Turkish Play Store listing draft and screenshot order now live in `marketing/play-console-assets/store-listing-rhythm-wedge-tr.md`.

### Gap 2: False activation confidence

Status: partially corrected.

Fix applied:
- Added `first_activation_feature_opened` so opening a target feature is no longer confused with true ibadah completion.
- Kept the legacy `first_prayer_action_completed` event for compatibility, but it must not be used alone as the north-star activation proof.

Residual risk:
- True task completion still needs to be reviewed per target feature and dashboarded separately.

### Gap 3: Locale inconsistency

Status: corrected for onboarding copy.

Fix applied:
- Growth onboarding copy now communicates the same daily rhythm promise across supported locales.

Residual risk:
- Store listings, screenshots, and paywall copy still need full locale-level review before non-TR growth campaigns.

Follow-up correction:
- Growth onboarding copy has been aligned across supported locale files.

### Gap 4: Benchmark uncertainty

Status: cannot be fully corrected from the repo.

External evidence:
- RevenueCat 2026 shows subscription value and trial intent concentrate early, but AI apps have weaker long-term retention than non-AI apps.
- Google Play recommends using acquisition and store listing performance reports to diagnose listing conversion and user growth.
- Muslim Pro still has massive incumbent distribution, so Huzur should avoid broad super-app positioning.

Residual risk:
- Without live cohort data, the wedge is a hypothesis, not a proven truth.

## Evidence Required For 95% Confidence

- Play Console: store listing visitors, acquisitions, conversion rate, source/country breakdown, reviews.
- Firebase/Analytics: onboarding funnel, first activation feature open, true completion, D1/D7/D30 retention.
- RevenueCat: paywall view to purchase, trial start, trial conversion, renewal by plan.
- AdMob: ad impression timing, retention impact, revenue per active user.

## What Would Be Required For 100% Confidence

100% confidence is not a responsible strategy target. It would require seeing the future behavior of users who have not yet installed the app.

The practical maximum before launch is 95%.

The remaining 4 points cannot be closed from code or documents:

- Live acquisition cohorts are unknown.
- Store listing conversion after the new promise is unknown.
- D1/D7 retention for the new wedge is unknown.
- Purchase behavior after the new premium framing is unknown.

Therefore the correct loop is not "wait until certainty"; it is "ship the smallest coherent wedge, measure, then decide."

## Decision Thresholds

- If store listing visitors are low: prioritize ASO, screenshots, reviews, and distribution.
- If store conversion is low: rewrite title, short description, screenshots, and trust copy.
- If onboarding completion is below 70%: reduce setup friction before changing the product.
- If first activation feature open is below 35%: fix the first activation card and CTA.
- If feature open is healthy but true completion is weak: fix the target feature task flow.
- If D1 is below 25% or D7 below 10%: fix reminders, content relevance, and recovery loops.
- If retention is healthy but purchases are weak: optimize premium packaging and price.

## Final Position

The best current strategy remains:

> Lead with a calm daily ibadah rhythm, not a broad Islamic super app and not an AI-first app.

This is the highest-confidence strategy available from repo and market evidence, but it becomes truly reliable only after the next production cohort validates the funnel.
