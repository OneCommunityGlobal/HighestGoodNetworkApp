import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button, ButtonGroup } from 'reactstrap';
import { useHistory, useLocation } from 'react-router-dom';
import { FaPaperPlane, FaCog, FaEnvelope } from 'react-icons/fa';
import {
  EmailTemplateManagement,
  IntegratedEmailSender,
  ErrorBoundary,
} from '../../../EmailTemplateManagement';
import './EmailPanel.css';

export default function EmailPanel({ title, initialEmail, templateData = {} }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const history = useHistory();
  const location = useLocation();

  // Get current view from URL query params, default to 'sender'
  const getCurrentViewFromURL = () => {
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get('tab');
    return tab === 'templates' ? 'templates' : 'sender';
  };

  const [currentView, setCurrentView] = useState(getCurrentViewFromURL());

  // Update URL when currentView changes
  const updateURL = view => {
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
  };

  // Handle view change
  const handleViewChange = view => {
    setCurrentView(view);
    updateURL(view);
  };

  // Update currentView when URL changes (e.g., browser back/forward)
  useEffect(() => {
    const newView = getCurrentViewFromURL();
    if (newView !== currentView) {
      setCurrentView(newView);
    }
  }, [location.search, currentView]);

  // Cleanup effect to reset states when component unmounts
  useEffect(() => {
    return () => {
      // Clear everything when exiting email platform
      setCurrentView('sender'); // Reset to default view
    };
  }, []);

  const renderViewSelector = () => (
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
          title="Send Email"
        >
          <FaPaperPlane className="me-2" />
          Send Email
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
          title="Manage Templates"
        >
          <FaCog className="me-2" />
          Manage Templates
        </Button>
      </div>
    </div>
  );

  if (currentView === 'templates') {
    return (
      <div className="email-update-container">
        {renderViewSelector()}
        <div
          className="email-content-area"
          role="tabpanel"
          aria-labelledby="email-templates-tab"
          id="email-templates-panel"
          aria-live="polite"
        >
          <EmailTemplateManagement key="templates" />
        </div>
      </div>
    );
  }

  return (
    <div className="email-update-container">
      {renderViewSelector()}
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
