import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import App from './App.jsx';
import { TimeProvider } from './context/TimeContext';
import { FocusProvider } from './context/FocusContext';
import { ToastProvider } from './context/ToastContext';
import { logger } from './utils/logger';

// ─── Deferred Heavy Providers ────────────────────────────────────
// GamificationProvider: 3× sync localStorage reads (15-30ms TTI penalty)
// FamilyProvider: triggers Firestore calls on mount (200-500ms network)
// Both are lazy-loaded so they don't block first paint.
const GamificationProvider = lazy(() =>
  import('./context/GamificationProvider').then(m => ({ default: m.GamificationProvider }))
);
const FamilyProvider = lazy(() =>
  import('./context/FamilyProvider.jsx').then(m => ({ default: m.FamilyProvider }))
);

// ─── In-App Update Check ─────────────────────────────────────────
const InAppUpdateCheck = () => {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let cancelled = false;

    const checkForUpdate = async () => {
      try {
        const { AppUpdate, AppUpdateAvailability } = await import('@capawesome/capacitor-app-update');

        const result = await AppUpdate.getAppUpdateInfo();

        if (cancelled) return;

        if (result.updateAvailability === AppUpdateAvailability.UPDATE_AVAILABLE) {
          if (result.immediateUpdateAllowed) {
            logger.log('[InAppUpdate] Performing immediate update');
            await AppUpdate.performImmediateUpdate();
          } else if (result.flexibleUpdateAllowed) {
            logger.log('[InAppUpdate] Flexible update available, downloading in background');
            await AppUpdate.startFlexibleUpdate();
          }
        }
      } catch (error) {
        if (!cancelled && error.message && !error.message.includes('APP_UPDATE_NOT_AVAILABLE')) {
          logger.warn('[InAppUpdate] Update check failed:', error);
        }
      }
    };

    void checkForUpdate();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
};

function AppProviders() {
  return (
    <ErrorBoundary>
      <InAppUpdateCheck />
      <ToastProvider>
        <TimeProvider>
          <FocusProvider>
            <Suspense fallback={null}>
              <GamificationProvider>
                <Suspense fallback={null}>
                  <FamilyProvider>
                    <BrowserRouter>
                      <App />
                    </BrowserRouter>
                  </FamilyProvider>
                </Suspense>
              </GamificationProvider>
            </Suspense>
          </FocusProvider>
        </TimeProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default AppProviders;
