import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Button } from 'reactstrap';
import { useHistory, useLocation } from 'react-router-dom';
import { FaPaperPlane, FaCog } from 'react-icons/fa';
import {
  EmailTemplateManagement,
  IntegratedEmailSender,
  ErrorBoundary,
} from '../../../EmailTemplateManagement';
import './EmailPanel.css';

export default function EmailPanel({ title, initialEmail }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const history = useHistory();
  const location = useLocation();

  // Error state for handling navigation errors
  const [navigationError, setNavigationError] = useState(null);

  // Get current view from URL query params, default to 'sender'
  const getCurrentViewFromURL = useCallback(() => {
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get('tab');
    return tab === 'templates' ? 'templates' : 'sender';
  }, [location.search]);

  const [currentView, setCurrentView] = useState(() => getCurrentViewFromURL());

  // Update URL when currentView changes
  const updateURL = useCallback(
    view => {
      try {
        const urlParams = new URLSearchParams(location.search);

        // Clear template management parameters when switching between email tabs
        urlParams.delete('view');
        urlParams.delete('templateId');
        urlParams.delete('mode');

        // Set the tab parameter
        urlParams.set('tab', view);

        const newSearch = urlParams.toString();
        const newURL = `${location.pathname}?${newSearch}`;
        history.replace(newURL);

        // Clear any previous navigation errors
        if (navigationError) {
          setNavigationError(null);
        }
      } catch (error) {
        setNavigationError('Failed to update navigation. Please try again.');
      }
    },
    [location.search, location.pathname, history, navigationError],
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

  const renderViewSelector = useMemo(
    () => (
      <div className="email-top-bar mb-4" role="tablist" aria-label="Email platform navigation">
        <div className="email-tab-buttons-full-width">
          <Button
            color={currentView === 'sender' ? 'primary' : 'light'}
            onClick={() => handleViewChange('sender')}
            className={`email-tab-button-full ${currentView === 'sender' ? 'active' : ''}`}
            size="lg"
            role="tab"
            aria-selected={currentView === 'sender'}
            aria-controls="email-sender-panel"
            id="email-sender-tab"
            tabIndex={currentView === 'sender' ? 0 : -1}
            title="Send Email - Compose and send emails to recipients"
            aria-describedby="email-sender-description"
          >
            <FaPaperPlane className="me-2" aria-hidden="true" />
            Send Email
            <span id="email-sender-description" className="sr-only">
              Switch to email composition and sending interface
            </span>
          </Button>
          <Button
            color={currentView === 'templates' ? 'primary' : 'light'}
            onClick={() => handleViewChange('templates')}
            className={`email-tab-button-full ${currentView === 'templates' ? 'active' : ''}`}
            size="lg"
            role="tab"
            aria-selected={currentView === 'templates'}
            aria-controls="email-templates-panel"
            id="email-templates-tab"
            tabIndex={currentView === 'templates' ? 0 : -1}
            title="Manage Templates - Create and edit email templates"
            aria-describedby="email-templates-description"
          >
            <FaCog className="me-2" aria-hidden="true" />
            Manage Templates
            <span id="email-templates-description" className="sr-only">
              Switch to email template management interface
            </span>
          </Button>
        </div>
      </div>
    ),
    [currentView, handleViewChange],
  );

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

  if (currentView === 'templates') {
    return (
      <div className={`email-update-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
        {navigationError && <ErrorDisplay error={navigationError} />}
        {renderViewSelector}
        <div
          className="email-content-area"
          role="tabpanel"
          aria-labelledby="email-templates-tab"
          id="email-templates-panel"
          aria-live="polite"
        >
          <ErrorBoundary>
            <EmailTemplateManagement key="templates" />
          </ErrorBoundary>
        </div>
      </div>
    );
  }

  return (
    <div className={`email-update-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      {navigationError && <ErrorDisplay error={navigationError} />}
      {renderViewSelector}
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
