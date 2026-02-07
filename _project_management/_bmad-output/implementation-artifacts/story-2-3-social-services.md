# Story: Implement Social Service Layer
**Status:** In Progress
**Epic:** Social Retention (Package C)
**Priority:** High

## Description
Implement the backend service layer to support "Package C" social features. This includes a new `duaService.js` for managing prayer requests and updates to `hatimService.js` to support group cüz tracking.

## Acceptance Criteria
- [ ] **Dua Service (`src/services/duaService.js`) created:**
    - [ ] `createDua(text, isAnonymous)` method implemented.
    - [ ] `getRecentDuas(limit)` method implemented.
    - [ ] `prayForDua(duaId)` method (increment counter) implemented.
- [ ] **Hatim Service Updates (`src/services/hatimService.js`):**
    - [ ] `createGroupHatim(name, description)` method.
    - [ ] `joinGroupHatim(code)` functionality verified/implemented.
    - [ ] `takeJuz(hatimId, juzNumber)` method ensuring real-time sync.
- [ ] **Firestore Indexes:**
    - [ ] Update `firestore.indexes.json` if composite indexes are needed for queries (e.g., sorting Duas by date).

## Tasks
- [x] Create `src/services/duaService.js`
- [x] Refactor `hatimService.js` to support shared groups explicitly
- [x] Unit/Manual Test of service methods

## Dev Agent Record
- **Date:** 2026-02-02
- **Agent:** Antigravity
- **Notes:** Focusing on service layer first. UI will follow in next story.
