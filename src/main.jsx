import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n' // i18next initialization
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { storageService } from './services/storageService'
import { STORAGE_KEYS } from './constants'

// Tema ayarını uygula
const savedTheme = storageService.getString(STORAGE_KEYS.THEME);
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const theme = savedTheme || (prefersDark ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', theme);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f3d2e', color: '#a3b18a' }}>Yükleniyor...</div>}>
        <App />
      </Suspense>
    </ErrorBoundary>
  </StrictMode>,
)


