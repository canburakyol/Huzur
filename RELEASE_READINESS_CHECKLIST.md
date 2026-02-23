# Huzur Android Release Readiness Checklist

Last update: 2026-02-23
Scope: Android only (web out of scope)

## 1) Completed (Baseline)
- [x] App is live on Google Play
- [x] AdMob integration active
- [x] RevenueCat integration active
- [x] Android build/lint passing

## 2) Critical Remaining (P0)
- [x] Firestore rule hardening:
  - [x] Limit `duas` update fields with whitelist
  - [x] Ensure only required fields can change
- [x] Cloud Functions webhook hardening:
  - [x] Code hardening completed
  - [x] Reject request if `revenueCatWebhook` secret is missing
  - [x] Accept only `POST`
  - [x] Make error/log policy production-safe
  - [x] Deploy hardened functions to production
- [ ] Android crash/ANR tracking:
  - [ ] Check last 30 days Play Vitals (ANR, crash-free users)
  - [ ] Measure P95/P99 startup and critical screen transitions

## 3) Important Remaining (P1)
- [ ] Firebase security audit:
  - [x] Verify no cross-user data read access (owner-only)
  - [ ] Write/run rules test scenarios (allowed + denied)
- [ ] Pro/subscription reliability:
  - [ ] Review server-authoritative validation points for critical premium actions
- [ ] Push reliability:
  - [ ] Track token cleanup flow and failed-token ratio weekly

## 4) Operational Readiness (P1-P2)
- [ ] Incident runbook ready:
  - [ ] Payment/subscription outage action plan
  - [ ] Push notification outage action plan
  - [ ] Firebase rules misconfig rollback plan
- [ ] Rollout discipline:
  - [ ] Use staged rollout for new releases (%5 -> %20 -> %50 -> %100)
  - [ ] Validate crash/ANR/revenue metrics at each stage

## 5) Android Release Gate
All must be YES before 100% rollout:
- [ ] Crash-free users above target threshold
- [ ] ANR rate below target threshold
- [ ] Subscription purchase/restore stable in production
- [ ] Ad serving/reward flow within expected range
- [ ] No open critical security findings

## 6) Notes
- Web code exists but this checklist is Android-first.
- AdMob and RevenueCat are treated as completed in this plan.
- Firebase billing is enabled and required RevenueCat secrets are configured.

## 7) Execution Plan (Android) - 2026-02-23 to 2026-03-08

### Phase 1: Measurement and Test Baseline (2026-02-23 to 2026-02-27)
- [ ] 2026-02-23: Collect baseline production metrics (last 30 days)
  - [ ] Play Vitals: crash-free users, ANR, startup quality
  - [ ] Revenue baseline: purchase, restore, renewal event counts
  - [ ] Ads baseline: rewarded impression/show/reward completion rates
- [ ] 2026-02-24: Performance measurement pass
  - [ ] Measure cold start and warm start (P95/P99) on low/mid/high device tiers
  - [ ] Record critical transition timings for top 5 screens
- [ ] 2026-02-25: Firestore rule test coverage
  - [ ] Add emulator tests for allow/deny scenarios
  - [ ] Validate owner-only reads and restricted write paths
- [ ] 2026-02-26: Subscription reliability audit
  - [ ] Verify premium-critical actions use server-authoritative checks
  - [ ] Run purchase/restore/cancel/expire scenario matrix
- [ ] 2026-02-27: Push reliability instrumentation
  - [ ] Track failed token ratio weekly
  - [ ] Validate invalid token cleanup behavior

### Phase 2: Operations and Controlled Rollout (2026-03-02 to 2026-03-08)
- [ ] 2026-03-02: Incident runbooks finalized
  - [ ] Payment/subscription outage runbook
  - [ ] Push outage runbook
  - [ ] Firestore rules rollback runbook
- [ ] 2026-03-03: Pre-rollout QA gate
  - [ ] End-to-end smoke: ads, rewarded ads, purchase, restore, webhook sync
  - [ ] Confirm no open critical security findings
- [ ] 2026-03-04: Staged rollout to 5%
  - [ ] Watch crash/ANR/revenue/reward metrics for 24h
- [ ] 2026-03-05: Increase rollout to 20% (if gates pass)
- [ ] 2026-03-06: Increase rollout to 50% (if gates pass)
- [ ] 2026-03-08: Increase rollout to 100% (if gates pass)

### Release Gates (Numeric Targets)
- [ ] Crash-free users >= 99.5%
- [ ] ANR rate <= 0.30%
- [ ] Purchase and restore success >= 98%
- [ ] Rewarded ad completion >= 95%
- [ ] No open critical security findings

## 8) Owner Split (Who Does What)
- [ ] Manual console tasks (you)
  - [ ] Play Console vitals checks and staged rollout actions
  - [ ] RevenueCat dashboard verification and webhook test send
  - [ ] AdMob dashboard checks for rewarded ad health
- [ ] Repo and backend tasks (Codex)
  - [ ] Firestore emulator rule tests and audit notes
  - [ ] Runbook templates and rollback command checks
  - [ ] Verification scripts/checklists for release gates
