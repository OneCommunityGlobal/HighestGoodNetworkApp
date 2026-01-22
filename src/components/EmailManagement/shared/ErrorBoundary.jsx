import React from 'react';
import { Alert } from 'reactstrap';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromProps(props, state) {
    // Reset error state when key prop changes
    if (props.resetKey && props.resetKey !== state.lastResetKey) {
      return { hasError: false, error: null, lastResetKey: props.resetKey };
    }
    return null;
  }

  static getDerivedStateFromError(error) {
    // Only catch critical JavaScript errors, not API errors
    if (
      error.name === 'ChunkLoadError' ||
      error.message.includes('Loading chunk') ||
      error.message.includes('Loading CSS chunk') ||
      error.stack?.includes('webpack')
    ) {
      return { hasError: true, error };
    }
    // Don't catch API errors like AxiosError
    return null;
  }

  componentDidCatch(error, errorInfo) {
    // Only log critical errors
    if (
      error.name === 'ChunkLoadError' ||
      error.message.includes('Loading chunk') ||
      error.message.includes('Loading CSS chunk') ||
      error.stack?.includes('webpack') ||
      errorInfo?.componentStack?.includes('ErrorBoundary')
    ) {
      // console.error('EmailManagement Critical Error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4">
          <Alert color="danger">
            <h4>Something went wrong!</h4>
            <p>
              There was an error loading the email template system. Please refresh the page or
              contact support.
            </p>
            <details className="mt-2">
              <summary>Error Details</summary>
              <pre className="mt-2 small">{this.state.error?.toString()}</pre>
            </details>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
