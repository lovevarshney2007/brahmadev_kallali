import { Component } from 'react';

/**
 * ErrorBoundary - Catches unexpected runtime JavaScript errors anywhere in the child
 * component tree, logs the error, and displays a graceful temple-themed fallback UI
 * instead of crashing to a blank white screen.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-fallback" role="alert" style={{
          minHeight: '60vh',
          display: 'grid',
          placeContent: 'center',
          textAlign: 'center',
          padding: '3rem 1.5rem',
          gap: '1.25rem',
          maxWidth: '600px',
          margin: '0 auto',
        }}>
          <div style={{ fontSize: '3.5rem', lineHeight: 1 }}>🕉️</div>
          <h2 style={{ fontFamily: 'var(--display)', color: 'var(--heading)', margin: 0, fontSize: '1.8rem' }}>
            काहीतरी अडचण आली / Something went wrong
          </h2>
          <p style={{ color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            कृपया हे पृष्ठ पुन्हा उघडा किंवा मुख्य पृष्ठावर जा.
            <br />
            Please reload the page or return to the home page.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '.5rem' }}>
            <button
              type="button"
              className="btn primary"
              onClick={() => window.location.reload()}
            >
              🔄 Reload page / पुन्हा उघडा
            </button>
            <a href="/" className="btn light">
              🏠 Home / मुख्यपृष्ठ
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
