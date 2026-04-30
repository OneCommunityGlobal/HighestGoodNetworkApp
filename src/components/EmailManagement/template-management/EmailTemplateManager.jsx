import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Alert, Button } from 'reactstrap';
import { FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { EmailTemplateList, EmailTemplateEditor } from './templates';
import '../EmailManagement.module.css';

const EmailTemplateManager = () => {
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
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

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
      if (!template || !template._id) {
        toast.error('Invalid template selected for editing');
        return;
      }

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
      // User can continue editing or manually navigate
      if (savedTemplate && savedTemplate._id) {
        setEditingTemplateId(savedTemplate._id);
        setSelectedTemplate(savedTemplate);
      }
    },
    [updateURL],
  );

  // Manual retry function for error recovery
  const handleManualRetry = useCallback(async () => {
    if (isRetrying) return;

    setIsRetrying(true);
    setRetryAttempts(prev => prev + 1);

    try {
      // Reset error states
      setHasError(false);
      setErrorInfo(null);
      setNavigationError(null);

      // Force a page reload to reset all states
      window.location.reload();
    } catch (err) {
      toast.error(`Retry failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsRetrying(false);
    }
  }, [isRetrying]);

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
            <div className="template-list-container">
              {(() => {
                try {
                  return (
                    <EmailTemplateList
                      key="list"
                      onCreateTemplate={handleCreateTemplate}
                      onEditTemplate={handleEditTemplate}
                    />
                  );
                } catch (error) {
                  // Only catch critical component errors, not API errors
                  if (
                    error.name === 'ChunkLoadError' ||
                    error.message.includes('Loading chunk') ||
                    error.stack?.includes('webpack')
                  ) {
                    return (
                      <div className="error-state">
                        <div className="text-center">
                          <h5 className="text-danger">Component Loading Error</h5>
                          <p className="text-muted mb-3">{error.message}</p>
                          <Button
                            color="primary"
                            onClick={() => window.location.reload()}
                            className="retry-button"
                          >
                            Reload Page
                          </Button>
                        </div>
                      </div>
                    );
                  }
                  // Re-throw API errors so they can be handled by EmailTemplateList
                  throw error;
                }
              })()}
            </div>
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
          {retryAttempts > 0 && (
            <small className="text-muted d-block mt-1">Retry attempt: {retryAttempts}</small>
          )}
        </div>
        <div className="d-flex gap-2">
          <Button
            color="outline-primary"
            size="sm"
            onClick={handleManualRetry}
            disabled={isRetrying}
            className="retry-button"
          >
            {isRetrying ? (
              <>
                <FaSpinner className="fa-spin me-1" />
                Retrying...
              </>
            ) : (
              'Retry'
            )}
          </Button>
          <Button color="outline-secondary" size="sm" onClick={resetErrorState}>
            Dismiss
          </Button>
        </div>
      </div>
    </Alert>
  );

  // Error boundary effect - only catch critical errors, not API errors
  useEffect(() => {
    const handleError = (error, errorInfo) => {
      // Only catch critical JavaScript errors, not API errors
      if (
        error.name === 'ChunkLoadError' ||
        error.message.includes('Loading chunk') ||
        error.message.includes('Loading CSS chunk') ||
        error.stack?.includes('webpack') ||
        errorInfo?.componentStack?.includes('ErrorBoundary')
      ) {
        // eslint-disable-next-line no-console
        console.error('EmailTemplateManager Critical Error:', error, errorInfo);
        setHasError(true);
        setErrorInfo(error.message || 'An unexpected error occurred');
      }
      // Let API errors (like AxiosError) be handled by individual components
    };

    const handleUnhandledRejection = event => {
      // Only catch critical promise rejections, not API errors
      if (
        event.reason?.name === 'ChunkLoadError' ||
        event.reason?.message?.includes('Loading chunk')
      ) {
        const err = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
        handleError(err, { componentStack: 'Promise rejection' });
      }
      // Let API promise rejections be handled by individual components
    };

    const windowErrorListener = e => {
      const err = e.error instanceof Error ? e.error : new Error(e.message || 'Error');
      handleError(err, { componentStack: 'window.onerror' });
    };

    window.addEventListener('error', windowErrorListener);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', windowErrorListener);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // If there's a critical error, show error boundary
  if (hasError) {
    return (
      <div className={`email-template-management ${darkMode ? 'dark-mode' : 'light-mode'}`}>
        <ErrorDisplay error={errorInfo} type="application" />
        <div className="text-center mt-4">
          <Button
            color="primary"
            onClick={handleManualRetry}
            disabled={isRetrying}
            className="retry-button"
            size="sm"
          >
            {isRetrying ? (
              <>
                <FaSpinner className="fa-spin me-1" />
                Retrying...
              </>
            ) : (
              'Reload Application'
            )}
          </Button>
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
            <Button
              color="primary"
              onClick={handleManualRetry}
              disabled={isRetrying}
              className="retry-button"
              size="sm"
            >
              {isRetrying ? (
                <>
                  <FaSpinner className="fa-spin me-1" />
                  Retrying...
                </>
              ) : (
                'Try Again'
              )}
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
      <ErrorBoundaryWrapper>
        {(() => {
          try {
            return renderCurrentView;
          } catch (error) {
            // Only catch critical component errors, not API errors
            if (
              error.name === 'ChunkLoadError' ||
              error.message.includes('Loading chunk') ||
              error.stack?.includes('webpack')
            ) {
              setHasError(true);
              setErrorInfo(error.message || 'Component loading error');
              return null;
            }
            // Re-throw API errors so they can be handled by individual components
            throw error;
          }
        })()}
      </ErrorBoundaryWrapper>
    </div>
  );
};

// PropTypes for type checking
EmailTemplateManager.propTypes = {};

export default EmailTemplateManager;
