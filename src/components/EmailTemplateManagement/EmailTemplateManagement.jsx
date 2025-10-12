import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import EmailTemplateList from './EmailTemplateList';
import EmailTemplateEditor from './EmailTemplateEditor';
import IntegratedEmailSender from './IntegratedEmailSender';
import './EmailTemplateManagement.css';

const EmailTemplateManagement = () => {
  const history = useHistory();
  const location = useLocation();

  // Get current view from URL query params, default to 'list'
  const getCurrentViewFromURL = () => {
    const urlParams = new URLSearchParams(location.search);
    const view = urlParams.get('view');
    const templateId = urlParams.get('templateId');

    if (view === 'create') return 'create';
    if (view === 'edit' && templateId) return 'edit';
    return 'list';
  };

  const [currentView, setCurrentView] = useState(getCurrentViewFromURL());
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editingTemplateId, setEditingTemplateId] = useState(null);

  // Update URL when currentView changes
  const updateURL = (view, templateId = null) => {
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
  };

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
  }, [location.search, currentView]);

  // Cleanup effect to reset states when component unmounts
  useEffect(() => {
    return () => {
      setSelectedTemplate(null);
      setEditingTemplateId(null);
    };
  }, []);

  const handleCreateTemplate = () => {
    // Force complete state reset
    setSelectedTemplate(null);
    setEditingTemplateId(null);
    setCurrentView('create');
    updateURL('create');
  };

  const handleEditTemplate = template => {
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
  };

  const handleBackToList = () => {
    // Force complete state reset when exiting template editor
    setCurrentView('list');
    setSelectedTemplate(null);
    setEditingTemplateId(null);
    updateURL('list');
  };

  const handleSaveTemplate = savedTemplate => {
    // Template saved successfully, go back to list
    setCurrentView('list');
    setSelectedTemplate(null);
    setEditingTemplateId(null);
    updateURL('list');
  };

  const renderCurrentView = () => {
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
  };

  return <div className="email-template-management">{renderCurrentView()}</div>;
};

export default EmailTemplateManagement;
