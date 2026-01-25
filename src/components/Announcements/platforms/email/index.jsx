import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { Button, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import { FaPaperPlane, FaCog, FaInbox } from 'react-icons/fa';
import {
  EmailTemplateManager,
  IntegratedEmailSender,
  ErrorBoundary,
  EmailOutbox,
} from '../../../EmailManagement';
import './EmailPanel.module.css';

export default function EmailPanel({ title, initialEmail }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const history = useHistory();
  const location = useLocation();

  const getViewFromPath = useCallback(() => {
    const path = location.pathname;

    // Check for templates route
    if (path.includes('/templates')) {
      return { view: 'templates', tab: null };
    }

    // Check for email routes with tabs (more specific routes first!)
    if (path.includes('/email/send')) {
      return { view: 'email', tab: 'send' };
    }
    if (path.includes('/email/outbox')) {
      return { view: 'email', tab: 'outbox' };
    }

    // ISSUE 1 FIX: Exact match for dashboard (/announcements/email)
    if (path === '/announcements/email') {
      return { view: 'dashboard', tab: null };
    }

    // Fallback for any other /email path
    if (path.includes('/email')) {
      return { view: 'email', tab: 'send' };
    }

    // Default to dashboard
    return { view: 'dashboard', tab: null };
  }, [location.pathname]);

  const { view: initialView, tab: initialTab } = getViewFromPath();
  const [currentView, setCurrentView] = useState(initialView);
  const [activeEmailTab, setActiveEmailTab] = useState(initialTab || 'send');

  // Sync state with URL changes (browser back/forward)
  useEffect(() => {
    const { view, tab } = getViewFromPath();
    setCurrentView(view);
    if (tab) {
      setActiveEmailTab(tab);
    }
  }, [location.pathname, getViewFromPath]);

  // Handle view change - updates both state and URL
  const handleViewChange = useCallback(
    (view, tab = null) => {
      setCurrentView(view);

      // Update URL based on view
      if (view === 'dashboard') {
        history.push('/announcements/email');
      } else if (view === 'templates') {
        history.push('/announcements/email/templates');
      } else if (view === 'email') {
        const emailTab = tab || 'send';
        setActiveEmailTab(emailTab);
        history.push(`/announcements/email/${emailTab}`);
      }
    },
    [history],
  );

  // Handle email tab change - updates both state and URL
  const handleEmailTabChange = useCallback(
    tab => {
      setActiveEmailTab(tab);
      history.push(`/announcements/email/${tab}`);
    },
    [history],
  );

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
            {/* Email Card (Combined Send & Outbox) */}
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
              onClick={() => handleViewChange('email', 'send')}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#007bff';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = darkMode ? '#2b3b50' : '#ddd';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <FaPaperPlane style={{ fontSize: '3rem', color: '#007bff', marginBottom: '1rem' }} />
              <h3 style={{ color: darkMode ? '#fff' : '#000', marginBottom: '1rem' }}>Email</h3>
              <p style={{ color: darkMode ? '#ccc' : '#666', marginBottom: '0.5rem' }}>
                Send, Outbox
              </p>
              <p style={{ color: darkMode ? '#aaa' : '#888', fontSize: '0.9rem' }}>
                Compose and send emails, monitor outbox
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
                e.currentTarget.style.borderColor = '#28a745';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = darkMode ? '#2b3b50' : '#ddd';
                e.currentTarget.style.transform = 'translateY(0)';
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
          </div>
        </div>
      );
    }

    // Show nothing for other views
    return null;
  }, [currentView, handleViewChange, darkMode]);

  // Dashboard view - show platform selection cards
  if (currentView === 'dashboard') {
    return (
      <div className={`email-update-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
        {renderViewSelector}
      </div>
    );
  }

  if (currentView === 'templates') {
    return (
      <div className={`email-update-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
        <div className="mb-3">
          <button
            onClick={() => handleViewChange('dashboard')}
            style={{
              background: 'none',
              border: 'none',
              color: darkMode ? '#60a5fa' : '#007bff',
              cursor: 'pointer',
              padding: '0.5rem 0',
              fontSize: '1rem',
              textDecoration: 'none',
            }}
          >
            ← Back to Dashboard
          </button>
        </div>
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

  // Email view with tabs (Send and Outbox)
  if (currentView === 'email') {
    return (
      <div className={`email-update-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
        <div className="mb-3">
          <button
            onClick={() => handleViewChange('dashboard')}
            style={{
              background: 'none',
              border: 'none',
              color: darkMode ? '#60a5fa' : '#007bff',
              cursor: 'pointer',
              padding: '0.5rem 0',
              fontSize: '1rem',
              textDecoration: 'none',
            }}
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="email-tabs-container">
          {/* Tab Navigation */}
          <Nav tabs className="mb-3">
            <NavItem>
              <NavLink
                className={activeEmailTab === 'send' ? 'active' : ''}
                onClick={() => handleEmailTabChange('send')}
                style={{
                  cursor: 'pointer',
                  backgroundColor:
                    activeEmailTab === 'send' ? (darkMode ? '#2b3b50' : '#007bff') : 'transparent',
                  color: activeEmailTab === 'send' ? '#fff' : darkMode ? '#ccc' : '#495057',
                  border: `1px solid ${darkMode ? '#2b3b50' : '#dee2e6'}`,
                  borderBottom:
                    activeEmailTab === 'send'
                      ? 'none'
                      : `1px solid ${darkMode ? '#2b3b50' : '#dee2e6'}`,
                }}
              >
                <FaPaperPlane className="me-2" />
                Send
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={activeEmailTab === 'outbox' ? 'active' : ''}
                onClick={() => handleEmailTabChange('outbox')}
                style={{
                  cursor: 'pointer',
                  backgroundColor:
                    activeEmailTab === 'outbox'
                      ? darkMode
                        ? '#2b3b50'
                        : '#007bff'
                      : 'transparent',
                  color: activeEmailTab === 'outbox' ? '#fff' : darkMode ? '#ccc' : '#495057',
                  border: `1px solid ${darkMode ? '#2b3b50' : '#dee2e6'}`,
                  borderBottom:
                    activeEmailTab === 'outbox'
                      ? 'none'
                      : `1px solid ${darkMode ? '#2b3b50' : '#dee2e6'}`,
                }}
              >
                <FaInbox className="me-2" />
                Outbox
              </NavLink>
            </NavItem>
          </Nav>

          {/* Tab Content */}
          <TabContent activeTab={activeEmailTab}>
            <TabPane tabId="send">
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
            </TabPane>

            <TabPane tabId="outbox">
              <div
                className="email-content-area"
                role="tabpanel"
                aria-labelledby="email-outbox-tab"
                id="email-outbox-panel"
                aria-live="polite"
              >
                <ErrorBoundary>
                  <EmailOutbox key="outbox" isActive={activeEmailTab === 'outbox'} />
                </ErrorBoundary>
              </div>
            </TabPane>
          </TabContent>
        </div>
      </div>
    );
  }

  // Default fallback - should never reach here
  return (
    <div className={`email-update-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
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
