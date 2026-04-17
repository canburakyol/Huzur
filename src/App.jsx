import ErrorBoundary from './components/ErrorBoundary';
import AppChrome from './components/app-shell/AppChrome';
import AppFeatureOverlay from './components/app-shell/AppFeatureOverlay';
import { useAppShellController } from './hooks/app-shell/useAppShellController';
import './components/Navigation.css';

function App() {
  const controller = useAppShellController();
  const { navigation, location, hasBlockingOverlay } = controller;

  if (navigation.activeFeature && !hasBlockingOverlay) {
    return (
      <AppFeatureOverlay
        activeFeature={navigation.activeFeature}
        setActiveFeature={navigation.setActiveFeature}
        locationName={location.locationName}
      />
    );
  }

  return (
    <ErrorBoundary>
      <div data-i18n-autolocalize="true">
        <AppChrome controller={controller} />
      </div>
    </ErrorBoundary>
  );
}

export default App;
