import { Suspense, lazy } from 'react';
import { BrowserRouter } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import App from './App.jsx';
import { TimeProvider } from './context/TimeContext';
import { FocusProvider } from './context/FocusContext';
import { ToastProvider } from './context/ToastContext';

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

function AppProviders() {
  return (
    <ErrorBoundary>
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
