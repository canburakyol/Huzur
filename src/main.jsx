import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { getLoadingLabel } from './utils/loadingLabel'
import '@fontsource/noto-naskh-arabic/400.css'
// Mushaf type, bundled so it renders offline: Manrope (UI), Literata (titles), Amiri (Quran).
import '@fontsource/manrope/latin-400.css'
import '@fontsource/manrope/latin-ext-400.css'
import '@fontsource/manrope/latin-500.css'
import '@fontsource/manrope/latin-ext-500.css'
import '@fontsource/manrope/latin-600.css'
import '@fontsource/manrope/latin-ext-600.css'
import '@fontsource/manrope/latin-700.css'
import '@fontsource/manrope/latin-ext-700.css'
import '@fontsource/literata/latin-600.css'
import '@fontsource/literata/latin-ext-600.css'
import '@fontsource/amiri/arabic-400.css'
import '@fontsource/amiri/latin-400.css'
import './index.css'
import './i18n'
import { initializeThemeMode } from './services/themeModeService'
import { applyFontSettings, loadFontSettings } from './services/fontSettingsService'
import { scheduleDeferredTask } from './utils/startupScheduler'
import { logger } from './utils/logger'

const AppProviders = lazy(() => import('./AppProviders.jsx'))

const isDev = import.meta.env.DEV

const applyAndroidWebViewClass = () => {
  try {
    const capacitor = window?.Capacitor;
    const platform = capacitor?.getPlatform?.();
    const isNative = capacitor?.isNativePlatform?.() ?? capacitor?.isNative ?? false;
    const isAndroidWebView = Boolean(isNative && platform === 'android');

    if (isAndroidWebView) {
      document.documentElement.classList.add('android-webview');
      document.body?.classList.add('android-webview');
    }
  } catch (error) {
    logger.error('[AppBootstrap] Failed to apply Android WebView class', error)
  }
};

applyAndroidWebViewClass();

const loadDeferredTypography = () => {
  void Promise.allSettled([
    import('@fontsource/noto-naskh-arabic/700.css'),
    import('@fontsource/scheherazade-new/400.css'),
    import('@fontsource/scheherazade-new/700.css')
  ]);
};

scheduleDeferredTask(loadDeferredTypography, 400);

const mountStartupDebugOverlay = (label, errorLike) => {
  try {
    const text = [
      `Startup Error: ${label}`,
      `Message: ${errorLike?.message || String(errorLike)}`,
      errorLike?.stack ? `Stack:\n${errorLike.stack}` : null
    ].filter(Boolean).join('\n\n')

    logger.error('[StartupFatal]', text)

    const existing = document.getElementById('startup-fatal-overlay')
    if (existing) {
      existing.textContent = text
      return
    }

    const pre = document.createElement('pre')
    pre.id = 'startup-fatal-overlay'
    pre.textContent = text
    pre.style.position = 'fixed'
    pre.style.inset = '0'
    pre.style.zIndex = '999999'
    pre.style.margin = '0'
    pre.style.padding = '16px'
    pre.style.overflow = 'auto'
    pre.style.whiteSpace = 'pre-wrap'
    pre.style.wordBreak = 'break-word'
    pre.style.background = 'var(--paper-sunken)'
    pre.style.color = 'var(--on-error-container)'
    pre.style.fontSize = '12px'
    document.body?.appendChild(pre)
  } catch (error) {
    logger.error('[AppBootstrap] Failed to mount startup debug overlay', error)
  }
}

window.addEventListener('error', (event) => {
  if (isDev) {
    mountStartupDebugOverlay('window.error', event?.error || event?.message || 'unknown')
  }
})

window.addEventListener('unhandledrejection', (event) => {
  if (isDev) {
    mountStartupDebugOverlay('unhandledrejection', event?.reason || 'unknown')
  }
})

initializeThemeMode();
applyFontSettings(loadFontSettings());

try {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'linear-gradient(135deg, var(--brand-soft), var(--paper))', color: 'var(--on-tertiary-container)', fontWeight: 700 }}>{getLoadingLabel()}</div>}>
        <AppProviders />
      </Suspense>
    </StrictMode>,
  )
} catch (e) {
  if (isDev) {
    mountStartupDebugOverlay('root.render', e)
  }
}
