import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/noto-naskh-arabic/400.css'
import './index.css'
import './i18n'
import { storageService } from './services/storageService'
import { STORAGE_KEYS } from './constants'
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
    pre.style.background = 'var(--surface-dim)'
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

const savedTheme = storageService.getString(STORAGE_KEYS.THEME);
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const theme = savedTheme || (prefersDark ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', theme);

try {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'linear-gradient(135deg, var(--primary-container), var(--surface-page))', color: 'var(--on-tertiary-container)', fontWeight: 700 }}>Yukleniyor...</div>}>
        <AppProviders />
      </Suspense>
    </StrictMode>,
  )
} catch (e) {
  if (isDev) {
    mountStartupDebugOverlay('root.render', e)
  }
}
