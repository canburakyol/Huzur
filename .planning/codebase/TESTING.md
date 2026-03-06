# Testing Strategy - Projem

## Frameworks
- **Unit/Integration**: Vitest (used for testing logic and hooks).
- **E2E**: Playwright (used for core user flows like navigation and prayer times).

## Test Locations
- **E2E**: `e2e/tests/`
- **Unit**: Typically co-located with the source or in `__tests__` (TBD based on specific module).

## Key Test Areas
- **Navigation**: Verification of sidebar and route changes (`e2e/tests/navigation.spec.js`).
- **Prayer Times**: Accuracy of calculation logic (adhan library).
- **Hatim/Dua**: Verification of social features and state updates.

## Automation
- GitHub Actions workflow (`.github/workflows/e2e-tests.yml`) runs E2E tests on push/PR to `main` and `develop`.
