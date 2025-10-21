import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Alert, Button } from 'reactstrap';
import { toast } from 'react-toastify';
import { EmailTemplateList, EmailTemplateEditor } from './template-management/templates';
import { IntegratedEmailSender } from './email-sender';
import { ErrorBoundary } from './shared';
import './EmailManagement.css';

const EmailManagement = () => {
  const darkMode = useSelector(state => state.theme.darkMode);
  const history = useHistory();
  const location = useLocation();

  // Error state for handling navigation errors
  const [navigationError, setNavigationError] = useState(null);

  // Error boundary state
  const [hasError, setHasError] = useState(false);
  const [errorInfo, setErrorInfo] = useState(null);

  // Get current view from URL path, default to 'list'
  const getCurrentViewFromURL = useCallback(() => {
    const path = location.pathname;

    if (path.includes('/create')) return 'create';
    if (path.includes('/templates/') && !path.endsWith('/templates')) {
      // Extract templateId from path like /announcements/email/templates/123
      const pathParts = path.split('/');
      const templateId = pathParts[pathParts.length - 1];
      if (templateId && templateId !== 'templates') {
        return 'edit';
      }
    }
    return 'list';
  }, [location.pathname]);

  // Extract templateId from URL on initial load
  const getTemplateIdFromURL = useCallback(() => {
    const path = location.pathname;
    if (path.includes('/templates/') && !path.endsWith('/templates')) {
      const pathParts = path.split('/');
      const templateId = pathParts[pathParts.length - 1];
      if (templateId && templateId !== 'templates') {
        return templateId;
      }
    }
    return null;
  }, [location.pathname]);

  const [currentView, setCurrentView] = useState(() => getCurrentViewFromURL());
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editingTemplateId, setEditingTemplateId] = useState(() => getTemplateIdFromURL());

  // Update URL when currentView changes
  const updateURL = useCallback(
    (view, templateId = null) => {
      try {
        if (view === 'create') {
          history.push('/announcements/email/templates/create');
        } else if (view === 'edit' && templateId) {
          history.push(`/announcements/email/templates/${templateId}`);
        } else {
          history.push('/announcements/email/templates');
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

  // Update currentView when URL changes (e.g., browser back/forward)
  useEffect(() => {
    const newView = getCurrentViewFromURL();
    if (newView !== currentView) {
      // Clear everything when switching away from template editor
      if (currentView === 'create' || currentView === 'edit') {
        setSelectedTemplate(null);
        setEditingTemplateId(null);
      }

      // Extract templateId from URL if in edit mode
      if (newView === 'edit') {
        const pathParts = location.pathname.split('/');
        const templateId = pathParts[pathParts.length - 1];
        if (templateId && templateId !== 'templates') {
          setEditingTemplateId(templateId);
        } else {
          setEditingTemplateId(null);
        }
      } else if (newView === 'create') {
        setEditingTemplateId(null);
      } else {
        setEditingTemplateId(null);
      }

      setCurrentView(newView);
    }
  }, [location.pathname, currentView, getCurrentViewFromURL]);

  // Cleanup effect to reset states when component unmounts
  useEffect(() => {
    return () => {
      setSelectedTemplate(null);
      setEditingTemplateId(null);
    };
  }, []);

  // Error recovery functions
  const resetErrorState = useCallback(() => {
    setHasError(false);
    setErrorInfo(null);
    setNavigationError(null);
  }, []);

  // Show toast notifications for navigation errors
  useEffect(() => {
    if (navigationError) {
      toast.error(`Navigation Error: ${navigationError}`);
    }
  }, [navigationError]);

  // Show toast notifications for application errors
  useEffect(() => {
    if (errorInfo) {
      toast.error(`Application Error: ${errorInfo}`);
    }
  }, [errorInfo]);

  const handleCreateTemplate = useCallback(() => {
    // Force complete state reset
    setSelectedTemplate(null);
    setEditingTemplateId(null);
    setCurrentView('create');
    updateURL('create');
  }, [updateURL]);

  const handleEditTemplate = useCallback(
    template => {
      // Force complete state reset before editing
      setSelectedTemplate(null);
      setEditingTemplateId(null);
      setCurrentView('list'); // Temporarily go to list to force cleanup

      // Small delay to ensure state is reset before setting new values
      setTimeout(() => {
        setSelectedTemplate(template);
        setEditingTemplateId(template._id);
        setCurrentView('edit');
        updateURL('edit', template._id);
      }, 50); // Increased delay to ensure cleanup
    },
    [updateURL],
  );

  const handleBackToList = useCallback(() => {
    // Force complete state reset when exiting template editor
    setCurrentView('list');
    setSelectedTemplate(null);
    setEditingTemplateId(null);
    updateURL('list');
  }, [updateURL]);

  const handleSaveTemplate = useCallback(
    savedTemplate => {
      // Template saved successfully, stay in current view
      // Don't redirect to list - let user continue editing or manually navigate
      // setCurrentView('list');
      // setSelectedTemplate(null);
      // setEditingTemplateId(null);
      // updateURL('list');
    },
    [updateURL],
  );

  const renderCurrentView = useMemo(() => {
    switch (currentView) {
      case 'create':
        return (
          <div>
            {/* Page Title */}
            <div className="page-title-container mb-3">
              <h2 className="page-title">Create Email Template</h2>
            </div>
            <EmailTemplateEditor
              key="create"
              onClose={handleBackToList}
              onSave={handleSaveTemplate}
            />
          </div>
        );

      case 'edit':
        return (
          <div>
            {/* Page Title */}
            <div className="page-title-container mb-3">
              <h2 className="page-title">Edit Email Template</h2>
            </div>
            <EmailTemplateEditor
              key={`edit-${editingTemplateId}`}
              templateId={editingTemplateId}
              onClose={handleBackToList}
              onSave={handleSaveTemplate}
            />
          </div>
        );

      default:
        return (
          <div>
            {/* Page Title */}
            <div className="page-title-container mb-3">
              <h2 className="page-title">Email Templates</h2>
            </div>
            <EmailTemplateList
              key="list"
              onCreateTemplate={handleCreateTemplate}
              onEditTemplate={handleEditTemplate}
            />
          </div>
        );
    }
  }, [
    currentView,
    editingTemplateId,
    handleBackToList,
    handleSaveTemplate,
    handleCreateTemplate,
    handleEditTemplate,
  ]);

  // Enhanced error display component
  const ErrorDisplay = ({ error, type = 'navigation' }) => (
    <Alert color="danger" className="mb-3">
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <strong>{type === 'navigation' ? 'Navigation Error:' : 'Application Error:'}</strong>
          <div className="mt-1">{error}</div>
        </div>
        <div className="d-flex gap-2">
          <Button color="outline-secondary" size="sm" onClick={resetErrorState}>
            Dismiss
          </Button>
        </div>
      </div>
    </Alert>
  );

  // Error boundary effect
  useEffect(() => {
    const handleError = (error, errorInfo) => {
      // Log error for debugging (can be removed in production)
      // eslint-disable-next-line no-console
      console.error('EmailManagement Error:', error, errorInfo);
      setHasError(true);
      setErrorInfo(error.message || 'An unexpected error occurred');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', event => {
      handleError(new Error(event.reason), { componentStack: 'Promise rejection' });
    });

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  // If there's a critical error, show error boundary
  if (hasError) {
    return (
      <div className={`email-template-management ${darkMode ? 'dark-mode' : 'light-mode'}`}>
        <ErrorDisplay error={errorInfo} type="application" />
        <div className="text-center mt-4">
          <button
            className="btn btn-primary"
            onClick={() => {
              setHasError(false);
              setErrorInfo(null);
              window.location.reload();
            }}
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }

  // Error boundary wrapper
  const ErrorBoundaryWrapper = ({ children }) => {
    if (hasError) {
      return (
        <div className="error-boundary-container">
          <ErrorDisplay error={errorInfo} type="application" />
          <div className="text-center">
            <Button color="primary" onClick={resetErrorState}>
              Try Again
            </Button>
          </div>
        </div>
      );
    }
    return children;
  };

  return (
    <div className={`email-template-management ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      {navigationError && <ErrorDisplay error={navigationError} type="navigation" />}
      <ErrorBoundaryWrapper>{renderCurrentView}</ErrorBoundaryWrapper>
    </div>
  );
};

// PropTypes for type checking
EmailManagement.propTypes = {
  // No props expected for this component
};

export default EmailManagement;
