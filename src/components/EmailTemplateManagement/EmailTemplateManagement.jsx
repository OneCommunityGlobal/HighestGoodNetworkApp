import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import EmailTemplateList from './EmailTemplateList';
import EmailTemplateEditor from './EmailTemplateEditor';
import IntegratedEmailSender from './IntegratedEmailSender';
import './EmailTemplateManagement.css';

const EmailTemplateManagement = () => {
  const darkMode = useSelector(state => state.theme.darkMode);
  const history = useHistory();
  const location = useLocation();

  // Error state for handling navigation errors
  const [navigationError, setNavigationError] = useState(null);

  // Get current view from URL query params, default to 'list'
  const getCurrentViewFromURL = useCallback(() => {
    const urlParams = new URLSearchParams(location.search);
    const view = urlParams.get('view');
    const templateId = urlParams.get('templateId');

    if (view === 'create') return 'create';
    if (view === 'edit' && templateId) return 'edit';
    return 'list';
  }, [location.search]);

  const [currentView, setCurrentView] = useState(() => getCurrentViewFromURL());
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editingTemplateId, setEditingTemplateId] = useState(null);

  // Update URL when currentView changes
  const updateURL = useCallback(
    (view, templateId = null) => {
      try {
        const urlParams = new URLSearchParams(location.search);

        // Clear all template management and email sender parameters
        urlParams.delete('view');
        urlParams.delete('templateId');
        urlParams.delete('mode');

        if (view !== 'list') {
          urlParams.set('view', view);
          if (templateId) {
            urlParams.set('templateId', templateId);
          }
        }

        const newSearch = urlParams.toString();
        const newURL = `${location.pathname}${newSearch ? `?${newSearch}` : ''}`;
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

  // Update currentView when URL changes (e.g., browser back/forward)
  useEffect(() => {
    const newView = getCurrentViewFromURL();
    if (newView !== currentView) {
      // Clear everything when switching away from template editor
      if (currentView === 'create' || currentView === 'edit') {
        setSelectedTemplate(null);
        setEditingTemplateId(null);
      }
      setCurrentView(newView);
    }
  }, [getCurrentViewFromURL, currentView]);

  // Cleanup effect to reset states when component unmounts
  useEffect(() => {
    return () => {
      setSelectedTemplate(null);
      setEditingTemplateId(null);
    };
  }, []);

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
      // Template saved successfully, go back to list
      setCurrentView('list');
      setSelectedTemplate(null);
      setEditingTemplateId(null);
      updateURL('list');
    },
    [updateURL],
  );

  const renderCurrentView = useMemo(() => {
    switch (currentView) {
      case 'create':
        return (
          <EmailTemplateEditor
            key="create"
            onClose={handleBackToList}
            onSave={handleSaveTemplate}
          />
        );

      case 'edit':
        return (
          <EmailTemplateEditor
            key={`edit-${editingTemplateId}`}
            templateId={editingTemplateId}
            onClose={handleBackToList}
            onSave={handleSaveTemplate}
          />
        );

      default:
        return (
          <EmailTemplateList
            key="list"
            onCreateTemplate={handleCreateTemplate}
            onEditTemplate={handleEditTemplate}
          />
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

  return (
    <div className={`email-template-management ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      {navigationError && <ErrorDisplay error={navigationError} />}
      {renderCurrentView}
    </div>
  );
};

export default EmailTemplateManagement;
