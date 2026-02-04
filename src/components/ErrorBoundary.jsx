import React from 'react'
import crashlyticsReporter from '../utils/crashlyticsReporter'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log to Crashlytics for production observability
    try {
      crashlyticsReporter?.logException?.(error || new Error('Unknown error'));
    } catch (e) {
      // ignore logging failures to avoid breaking UI
    }
    // Fallback console error for local debugging
    console.error('Unhandled error captured by ErrorBoundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div style={{ padding: 20, textAlign: 'center' }}>
          <h2>Bir hata oluştu</h2>
          <p>Uygulamanın bazı bölümleri düzgün çalışmıyor. Lütfen sayfayı tekrar yükleyin veya uygulamayı yeniden başlatın.</p>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
