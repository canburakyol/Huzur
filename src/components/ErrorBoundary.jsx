import { Component } from 'react';
import { withTranslation } from 'react-i18next';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('App Error:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    render() {
        const { t } = this.props;
        
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    padding: '20px',
                    background: 'linear-gradient(135deg, #D4A574 0%, #F5E6D3 100%)',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '64px', marginBottom: '20px' }}>🕌</div>
                    <h1 style={{ color: '#5D4E37', marginBottom: '10px' }}>{t('error.title')}</h1>
                    <p style={{ color: '#7A6B5A', marginBottom: '20px', maxWidth: '300px' }}>
                        {t('error.description')}
                    </p>
                    <button
                        onClick={this.handleRetry}
                        style={{
                            background: '#D4A574',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            fontSize: '16px',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                        }}
                    >
                        {t('common.retry')}
                    </button>
                    <p style={{
                        color: '#999',
                        fontSize: '12px',
                        marginTop: '30px',
                        maxWidth: '280px'
                    }}>
                        {t('error.persistentIssue')}
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}

const ErrorBoundaryWithTranslation = withTranslation()(ErrorBoundary);
export default ErrorBoundaryWithTranslation;
