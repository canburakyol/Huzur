import React from 'react'
import crashlyticsReporter from '../utils/crashlyticsReporter'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, errorInfo: null, errorMessage: '' }
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || 'Unknown runtime error'
    }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      errorInfo,
      errorMessage: error?.message || 'Unknown runtime error'
    })

    // Log to Crashlytics for production observability
    try {
      crashlyticsReporter?.logException?.(error || new Error('Unknown error'));
    } catch {
      // ignore logging failures to avoid breaking UI
    }
    // Fallback console error for local debugging
    console.error('Unhandled error captured by ErrorBoundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      const detail = [
        this.state.errorMessage ? `Message: ${this.state.errorMessage}` : null,
        this.state.errorInfo?.componentStack ? `Component Stack:${this.state.errorInfo.componentStack}` : null
      ].filter(Boolean).join('\n\n')

      // Fallback UI
      return (
        <div style={{ padding: 20, textAlign: 'center' }}>
          <h2>Bir hata oluştu</h2>
          <p>Uygulamanın bazı bölümleri düzgün çalışmıyor. Lütfen sayfayı tekrar yükleyin veya uygulamayı yeniden başlatın.</p>
          {detail ? (
            <pre style={{
              marginTop: 12,
              textAlign: 'left',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontSize: 12,
              maxHeight: '45vh',
              overflow: 'auto',
              background: '#111',
              color: '#f8f8f2',
              padding: 12,
              borderRadius: 8
            }}>
              {detail}
            </pre>
          ) : null}
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
