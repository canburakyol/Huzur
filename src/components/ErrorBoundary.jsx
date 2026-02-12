import React from 'react'
import crashlyticsReporter from '../utils/crashlyticsReporter'
import i18n from '../i18n'

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
      const isDev = import.meta.env.DEV
      const detail = isDev
        ? [
            this.state.errorMessage ? `Message: ${this.state.errorMessage}` : null,
            this.state.errorInfo?.componentStack ? `Component Stack:${this.state.errorInfo.componentStack}` : null
          ].filter(Boolean).join('\n\n')
        : ''

      // Fallback UI
      return (
        <div style={{ padding: 20, textAlign: 'center' }}>
          <h2>{i18n.t('errorBoundary.title', 'An error occurred')}</h2>
          <p>{i18n.t('errorBoundary.description', 'Some parts of the application are not working correctly. Please reload the page or restart the app.')}</p>
          {isDev && detail ? (
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
