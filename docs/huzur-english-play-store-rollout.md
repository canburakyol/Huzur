# Huzur English Play Store Rollout

## Decision

Use the existing Google Play app and add English localization. Do not create a second app.

## Why

The app already has English locale files under `public/locales/en` and default Android strings in `android/app/src/main/res/values/strings.xml`. A separate Play app would split ratings, installs, analytics, billing, and release operations without solving the localization problem.

## Current Readiness

Ready:

- English web locale directory exists.
- Android default strings are English.
- Play Console image assets are stored in `marketing/play-console-assets`.
- Turkish store listing positioning already exists as a reference.

Not ready enough to scale paid acquisition:

- English app locale quality has visible encoding and mixed-language issues.
- Screenshots likely need English overlay text before use in English markets.
- Play Store performance must be measured separately by country and language.

## Play Console Steps

1. Open Play Console.
2. Select the existing Huzur app.
3. Go to Store presence > Main store listing.
4. Add English translation or edit the English listing if it already exists.
5. Paste the copy from `marketing/play-console-assets/store-listing-daily-worship-routine-en.md`.
6. Upload English screenshots or replace screenshot overlay text using the same screenshot order.
7. Submit the store listing update for review.
8. After approval, wait for real visitor data before creating more custom listings.

## First Custom Store Listing

Only create this after the main English listing is live.

- Name: English - Daily Worship Routine
- Countries: United States, United Kingdom, Canada, Australia
- Message: daily Islamic worship routine
- Screenshot order: prayer times, first step, Quran, dua/dhikr, tools, Pro support

## Quality Gate Before Wider Launch

Run:

```bash
npm run audit:localization
npm run build
```

Manually inspect the app in English:

- Onboarding
- Home
- Prayer times
- Quran
- Dua/dhikr
- Settings
- Pro/paywall
- Notification permission copy

Block wider launch if English users see broken characters, Turkish-only primary actions, or unclear payment text.

## Metrics To Export

Before launch and 7 days after launch:

- Store listing visitors
- Store listing acquisitions
- Conversion rate
- Country breakdown
- Language breakdown
- Search terms
- Acquisition source
- First open
- Onboarding completion
- D1 retention
- Reviews and ratings by language

## Operating Rule

If English traffic is low, fix distribution. If English traffic is healthy but conversion is weak, fix store listing assets. If conversion is healthy but retention is weak, fix English onboarding and first daily worship step.

