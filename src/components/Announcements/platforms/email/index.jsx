import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Button } from 'reactstrap';
import { useHistory, useLocation } from 'react-router-dom';
import { FaPaperPlane, FaCog, FaChartLine } from 'react-icons/fa';
import {
  EmailTemplateManager,
  IntegratedEmailSender,
  ErrorBoundary,
  EmailOutbox,
} from '../../../EmailManagement';
import './EmailPanel.css';

export default function EmailPanel({ title, initialEmail }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const history = useHistory();
  const location = useLocation();

  // Error state for handling navigation errors
  const [navigationError, setNavigationError] = useState(null);

  // Get current view from URL path, default to 'dashboard'
  const getCurrentViewFromURL = useCallback(() => {
    const path = location.pathname;
    if (path.includes('/templates')) return 'templates';
    if (path.includes('/sender')) return 'sender';
    if (path.includes('/emails')) return 'emails';
    return 'dashboard';
  }, [location.pathname]);

  const [currentView, setCurrentView] = useState(() => getCurrentViewFromURL());

  // Update URL when currentView changes
  const updateURL = useCallback(
    view => {
      try {
        if (view === 'templates') {
          history.push('/announcements/email/templates');
        } else if (view === 'sender') {
          history.push('/announcements/email/sender');
        } else if (view === 'emails') {
          history.push('/announcements/email/emails');
        } else {
          history.push('/announcements/email');
        }

        // Clear any previous navigation errors
        if (navigationError) {
          setNavigationError(null);
        }
      } catch (error) {
        setNavigationError('Failed to update navigation. Please try again.');
      }
    },
    [history, navigationError],
  );

  // Handle view change
  const handleViewChange = useCallback(
    view => {
      if (view !== currentView) {
        setCurrentView(view);
        updateURL(view);
      }
    },
    [currentView, updateURL],
  );

  // Update currentView when URL changes (e.g., browser back/forward)
  useEffect(() => {
    const newView = getCurrentViewFromURL();
    if (newView !== currentView) {
      setCurrentView(newView);
    }
  }, [getCurrentViewFromURL, currentView]);

  // Cleanup effect to reset states when component unmounts
  useEffect(() => {
    return () => {
      // Clear everything when exiting email platform
      setCurrentView('sender'); // Reset to default view
    };
  }, []);

  const renderViewSelector = useMemo(() => {
    // Show dashboard when currentView is 'dashboard'
    if (currentView === 'dashboard') {
      return (
        <div className="email-dashboard mb-4">
          <div
            className="dashboard-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem',
            }}
          >
            {/* Email Sender Card */}
            <button
              className="platform-card"
              type="button"
              style={{
                border: `2px solid ${darkMode ? '#2b3b50' : '#ddd'}`,
                borderRadius: '8px',
                padding: '2rem',
                backgroundColor: darkMode ? '#1a2332' : '#f8f9fa',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onClick={() => handleViewChange('sender')}
              onMouseEnter={e => {
                e.target.style.borderColor = '#007bff';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.target.style.borderColor = darkMode ? '#2b3b50' : '#ddd';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <FaPaperPlane style={{ fontSize: '3rem', color: '#007bff', marginBottom: '1rem' }} />
              <h3 style={{ color: darkMode ? '#fff' : '#000', marginBottom: '1rem' }}>
                Send Email
              </h3>
              <p style={{ color: darkMode ? '#ccc' : '#666' }}>
                Compose and send emails using templates or custom content
              </p>
            </button>

            {/* Email Templates Card */}
            <button
              className="platform-card"
              type="button"
              style={{
                border: `2px solid ${darkMode ? '#2b3b50' : '#ddd'}`,
                borderRadius: '8px',
                padding: '2rem',
                backgroundColor: darkMode ? '#1a2332' : '#f8f9fa',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onClick={() => handleViewChange('templates')}
              onMouseEnter={e => {
                e.target.style.borderColor = '#28a745';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.target.style.borderColor = darkMode ? '#2b3b50' : '#ddd';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <FaCog style={{ fontSize: '3rem', color: '#28a745', marginBottom: '1rem' }} />
              <h3 style={{ color: darkMode ? '#fff' : '#000', marginBottom: '1rem' }}>
                Manage Templates
              </h3>
              <p style={{ color: darkMode ? '#ccc' : '#666' }}>
                Create, edit, and manage email templates for your communications
              </p>
            </button>

            {/* Email Outbox Card */}
            <button
              className="platform-card"
              type="button"
              style={{
                border: `2px solid ${darkMode ? '#2b3b50' : '#ddd'}`,
                borderRadius: '8px',
                padding: '2rem',
                backgroundColor: darkMode ? '#1a2332' : '#f8f9fa',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onClick={() => handleViewChange('emails')}
              onMouseEnter={e => {
                e.target.style.borderColor = '#6f42c1';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.target.style.borderColor = darkMode ? '#2b3b50' : '#ddd';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <FaChartLine style={{ fontSize: '3rem', color: '#6f42c1', marginBottom: '1rem' }} />
              <h3 style={{ color: darkMode ? '#fff' : '#000', marginBottom: '1rem' }}>
                Email Outbox
              </h3>
              <p style={{ color: darkMode ? '#ccc' : '#666' }}>
                Monitor and manage emails with real-time tracking and analytics
              </p>
            </button>
          </div>
        </div>
      );
    }

    // Show nothing for other views (sender/templates handle their own navigation)
    return null;
  }, [currentView, handleViewChange, darkMode]);

  // Error display component
  const ErrorDisplay = ({ error }) => (
    <div className="alert alert-danger" role="alert" aria-live="assertive">
      <strong>Navigation Error:</strong> {error}
      <button
        type="button"
        className="btn-close"
        aria-label="Close error message"
        onClick={() => setNavigationError(null)}
      />
    </div>
  );

  // Dashboard view - show platform selection cards
  if (currentView === 'dashboard') {
    return (
      <div className={`email-update-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
        {navigationError && <ErrorDisplay error={navigationError} />}
        {renderViewSelector}
      </div>
    );
  }

  if (currentView === 'templates') {
    return (
      <div className={`email-update-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
        {navigationError && <ErrorDisplay error={navigationError} />}
        <div
          className="email-content-area"
          role="tabpanel"
          aria-labelledby="email-templates-tab"
          id="email-templates-panel"
          aria-live="polite"
        >
          <ErrorBoundary>
            <EmailTemplateManager key="templates" />
          </ErrorBoundary>
        </div>
      </div>
    );
  }

  if (currentView === 'emails') {
    return (
      <div className={`email-update-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
        {navigationError && <ErrorDisplay error={navigationError} />}
        <div
          className="email-content-area"
          role="tabpanel"
          aria-labelledby="email-emails-tab"
          id="email-emails-panel"
          aria-live="polite"
        >
          <ErrorBoundary>
            <EmailOutbox key="emails" />
          </ErrorBoundary>
        </div>
      </div>
    );
  }

  return (
    <div className={`email-update-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      {navigationError && <ErrorDisplay error={navigationError} />}
      <div
        className="email-content-area"
        role="tabpanel"
        aria-labelledby="email-sender-tab"
        id="email-sender-panel"
        aria-live="polite"
      >
        <ErrorBoundary>
          <IntegratedEmailSender
            key="sender"
            initialContent={initialEmail || ''}
            initialSubject={title || ''}
          />
        </ErrorBoundary>
      </div>
    </div>
  );
}
