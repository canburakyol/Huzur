# Huzur Security Hardening Runbook

## Current posture

- Firebase JS SDK requests on native now obtain App Check tokens through the native bridge in [firebase.js](D:/Projem/src/services/firebase.js).
- Risky social writes are callable-only and protected with App Check.
- User-owned documents no longer accept direct writes to server-managed progression and social visibility fields.
- High-risk social mutations use an additional distributed daily quota in Firestore under `_security/rateLimits`.

## What to verify after release traffic

1. Firebase Console > App Check > request metrics
   - `Verified requests` should start appearing for Firestore, Auth, and Functions.
   - `Unverified: outdated client requests` should trend down after updated clients become active.
2. Cloud Logging
   - Search for `eventType` values such as `join_family_invalid_code`, `join_hatim_invalid_code`, `create_dua_duplicate_blocked`.
   - Sudden spikes indicate abuse or a broken client path.
3. Firestore usage
   - Confirm no abnormal spike in `_security/rateLimits` writes relative to DAU.

## Incident response

### App Check still not verified

1. Confirm updated Android build is in circulation.
2. Confirm native App Check is active in [MainActivity.java](D:/Projem/android/app/src/main/java/com/huzurapp/android/MainActivity.java).
3. Confirm JS App Check bridge is active in [firebase.js](D:/Projem/src/services/firebase.js).
4. Do not enable Firestore/Auth enforcement until verified traffic is visible.

### Invite code brute force or spam burst

1. Check Cloud Logging for `join_family_invalid_code` / `join_hatim_invalid_code`.
2. If one feature is under attack, temporarily lower callable limits in [functions/index.js](D:/Projem/functions/index.js).
3. Redeploy functions.

### Community spam wave

1. Check `create_dua_duplicate_blocked` and `pray_for_dua_daily_quota_exceeded`.
2. If needed, lower the relevant distributed quotas in [functions/index.js](D:/Projem/functions/index.js).
3. If abuse persists, require a signed-in non-anonymous user for the affected callable.

## Enforcement sequence

1. Keep callable-level App Check enforcement on.
2. Wait until App Check console shows meaningful verified traffic.
3. Then evaluate Firestore enforcement on the highest-risk products first.
4. Auth enforcement should be last, only after release traffic proves healthy.
