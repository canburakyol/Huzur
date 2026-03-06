# Phase 1 Plan: CI/CD & Sync Reliability

## Overview
Phase 1 focuses on ensuring the development environment is 100% reliable before starting the major design overhaul in Milestone 2. We previously resolved the Android Gradle sync issues and verified the GitHub Actions false-positives. This plan focuses on verifying the final piece of the stability puzzle: Playwright E2E tests.

## Context Constraints
- Do not break existing RevenueCat subscriptions (`1-CONTEXT.md`).
- Focus solely on environment and test reliability; no UI components will be altered yet.

## Steps

### Step 1: E2E Test Execution & Verification
- Execute existing Playwright tests in the `e2e/tests` directory.
- **Goal:** Ensure core flows (Prayer, Navigation) pass without errors.
- **Fallback:** If tests fail, investigate and fix the selectors or state initialization.

### Step 2: Android Build Verification
- Perform a final dry-run build (`./gradlew assembleDebug`) for the Android app to guarantee that previous 'sync' fixes have permanently resolved the classpath issues.
- **Goal:** Ensure the build succeeds.

### Step 3: CI/CD Workflow Audit
- Review the `.github/workflows/e2e-tests.yml` to ensure it invokes the right scripts and handles caching correctly now that the environment is stable.

## Definition of Done
- `npx playwright test` passes 100%.
- `./gradlew assembleDebug` completes successfully.
- The environment is certified stable, unlocking Phase 2 (Design Update).
