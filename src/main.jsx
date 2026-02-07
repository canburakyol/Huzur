import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n' // i18next initialization
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { storageService } from './services/storageService'
import { STORAGE_KEYS } from './constants'
import { TimeProvider } from './context/TimeContext'
import { FocusProvider } from './context/FocusContext'
import { GamificationProvider } from './context/GamificationProvider'
import { FamilyProvider } from './context/FamilyProvider.jsx'

// Startup crash debug overlay (Android/WebView dahil erken hataları görünür yapar)
const mountStartupDebugOverlay = (label, errorLike) => {
  try {
    const text = [
      `Startup Error: ${label}`,
      `Message: ${errorLike?.message || String(errorLike)}`,
      errorLike?.stack ? `Stack:\n${errorLike.stack}` : null
    ].filter(Boolean).join('\n\n')

    console.error('[StartupFatal]', text)

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
    pre.style.background = '#111'
    pre.style.color = '#ffb4b4'
    pre.style.fontSize = '12px'
    document.body?.appendChild(pre)
  } catch {
    // no-op
  }
}

window.addEventListener('error', (event) => {
  mountStartupDebugOverlay('window.error', event?.error || event?.message || 'unknown')
})

window.addEventListener('unhandledrejection', (event) => {
  mountStartupDebugOverlay('unhandledrejection', event?.reason || 'unknown')
})

// Tema ayarını uygula
const savedTheme = storageService.getString(STORAGE_KEYS.THEME);
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const theme = savedTheme || (prefersDark ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', theme);

try {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <ErrorBoundary>
      <TimeProvider>
        <FocusProvider>
          <GamificationProvider>
            <FamilyProvider>
              <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f3d2e', color: '#a3b18a' }}>Yükleniyor...</div>}>
                <BrowserRouter>
                  <App />
                </BrowserRouter>
              </Suspense>
            </FamilyProvider>
          </GamificationProvider>
        </FocusProvider>
      </TimeProvider>
      </ErrorBoundary>
    </StrictMode>,
  )
} catch (e) {
  mountStartupDebugOverlay('root.render', e)
}
