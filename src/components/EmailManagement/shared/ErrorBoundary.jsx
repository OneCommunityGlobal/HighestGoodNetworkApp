import React from 'react';
import { Alert } from 'reactstrap';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('EmailManagement Error:', error, errorInfo);
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
