# Phase 1 Context

## Overview
Phase 1 focuses primarily on "CI/CD & Sync Reliability" as defined in the Roadmap. However, the user provided crucial input that spans the entire project timeline and impacts later UI phases. 

## Deep Dive Areas

### 1. Monetization & Subscriptions
- **Current State:** RevenueCat has been manually integrated. Monthly and Yearly packages are defined.
- **Decision:** The underlying subscription logic should remain stable during the reliability updates. We must not break existing RevenueCat implementation.

### 2. Design Constraints
- **Current State:** The user is generally happy with the current theme.
- **Decision:** As we stabilize and prepare for Milestone 2 (Design updates), any styling changes must ensure that ALL categories and components transition smoothly to the new theme **EXCEPT for the 'Quran' section/components**. 
- **Quran Exemption:** The 'Quran' section must maintain its current specific styles regardless of future global theme updates. It is isolated from the "Wow factor" redesign.

## Next Steps
Proceed directly to planning Phase 1: Fixing GitHub Actions (`e2e-tests.yml`) false-positives, stabilizing Android Gradle sync, and ensuring Playwright testing is solid.
