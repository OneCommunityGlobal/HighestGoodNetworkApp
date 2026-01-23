import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { connect, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import DOMPurify from 'dompurify';
import {
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ListGroup,
  ListGroupItem,
  Badge,
  Spinner,
} from 'reactstrap';
import {
  FaSave,
  FaTimes,
  FaPlus,
  FaTrash,
  FaEye,
  FaCode,
  FaExclamationTriangle,
  FaPencilAlt,
  FaSpinner,
  FaFileAlt,
  FaImage,
  FaHashtag,
  FaEnvelope,
  FaLink,
  FaCalendar,
  FaAlignLeft,
  FaVideo,
} from 'react-icons/fa';
import { Editor } from '@tinymce/tinymce-react';
import { getTemplateEditorConfig } from '../../shared';
import {
  createEmailTemplate,
  updateEmailTemplate,
  fetchEmailTemplate,
  clearEmailTemplateError,
  clearCurrentTemplate,
  previewEmailTemplate,
  validateEmailTemplate,
} from '../../../../actions/emailTemplateActions';
import './EmailTemplateEditor.module.css';
import '../../EmailManagementShared.module.css';

const EmailTemplateEditor = ({
  template,
  loading,
  error,
  createEmailTemplate,
  updateEmailTemplate,
  fetchEmailTemplate,
  clearEmailTemplateError,
  clearCurrentTemplate,
  previewEmailTemplate,
  validateEmailTemplate,
  onClose,
  onSave,
  templateId = null, // For editing existing templates
}) => {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    html_content: '',
    variables: [],
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showVariableModal, setShowVariableModal] = useState(false);
  const [extractedVariables, setExtractedVariables] = useState([]);
  const [variableError, setVariableError] = useState('');
  const [newVariable, setNewVariable] = useState({
    name: '',
    type: 'text',
  });
  const [showTypeSelectionModal, setShowTypeSelectionModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [editingVariableIndex, setEditingVariableIndex] = useState(null);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);

  // Helper function to get icon for variable type
  const getVariableTypeIcon = useCallback(type => {
    const iconMap = {
      text: <FaFileAlt className="me-1" size={12} />,
      textarea: <FaAlignLeft className="me-1" size={12} />,
      image: <FaImage className="me-1" size={12} />,
      number: <FaHashtag className="me-1" size={12} />,
      email: <FaEnvelope className="me-1" size={12} />,
      url: <FaLink className="me-1" size={12} />,
      date: <FaCalendar className="me-1" size={12} />,
      video: <FaVideo className="me-1" size={12} />,
    };
    return iconMap[type] || <FaFileAlt className="me-1" size={12} />;
  }, []);

  // Effect to load template data when in edit mode
  useEffect(() => {
    if (templateId) {
      // Always fetch template data for the given templateId
      clearCurrentTemplate();
      setInitialLoading(true);
      setApiError(null);
      // Don't clear form data immediately - let it be populated when template loads
      fetchEmailTemplate(templateId).catch(err => {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch template:', err);
        setApiError('Failed to load template. Please try again.');
        setInitialLoading(false);
        toast.error('Failed to load template. Please try again.');
      });
    } else {
      clearCurrentTemplate(); // Clear any previous template data when creating a new one
      setFormData({
        name: '',
        subject: '',
        html_content: '',
        variables: [],
      });
      setInitialLoading(false);
      setApiError(null);
    }
  }, [templateId, fetchEmailTemplate, clearCurrentTemplate]);

  // Effect to populate form data when template is fetched
  useEffect(() => {
    if (template && templateId) {
      try {
        setFormData({
          name: template.name || '',
          subject: template.subject || '',
          html_content: template.html_content || '',
          variables: Array.isArray(template.variables) ? template.variables : [],
        });
        setInitialLoading(false);
        setApiError(null);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error processing template data:', err);
        setApiError('Error processing template data. Please try again.');
        setInitialLoading(false);
        toast.error('Error processing template data. Please try again.');
      }
    }
  }, [template, templateId]);

  // Track unsaved changes
  useEffect(() => {
    if (templateId && template) {
      // Compare current form data with original template data
      const hasChanges =
        formData.name !== (template.name || '') ||
        formData.subject !== (template.subject || '') ||
        formData.html_content !== (template.html_content || '') ||
        JSON.stringify(formData.variables || []) !== JSON.stringify(template.variables || []);

      setHasUnsavedChanges(hasChanges);
    } else {
      // For new templates, check if any field has content
      const hasContent =
        (formData.name && formData.name.trim() !== '') ||
        (formData.subject && formData.subject.trim() !== '') ||
        (formData.html_content && formData.html_content.trim() !== '') ||
        (formData.variables && formData.variables.length > 0);

      setHasUnsavedChanges(hasContent);
    }
  }, [formData, template, templateId]);

  // Handle error state - clear initial loading if there's an error
  useEffect(() => {
    if (error && initialLoading) {
      setInitialLoading(false);
    }
  }, [error, initialLoading]);

  // Warn user before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = e => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValidationErrors(prev => ({ ...prev, [field]: '' })); // Clear error on input change
  }, []);

  const handleVariableChange = useCallback((index, field, value) => {
    setFormData(prev => {
      const newVariables = [...prev.variables];
      newVariables[index] = { ...newVariables[index], [field]: value };
      return { ...prev, variables: newVariables };
    });
    setValidationErrors(prev => ({ ...prev, [`variable_${index}_${field}`]: '' }));
  }, []);

  // Extract variables from HTML content and subject
  const extractVariables = useCallback(() => {
    const htmlContent = formData.html_content || '';
    const subject = formData.subject || '';
    const allContent = `${htmlContent} ${subject}`;
    const regex = /{{(\w+)}}/g;
    const matches = [...allContent.matchAll(regex)];
    const uniqueVariables = [...new Set(matches.map(match => match[1]))];
    return uniqueVariables.map(name => ({ name, type: 'text' }));
  }, [formData.html_content, formData.subject]);

  // Auto-populate variables from HTML content and subject
  const handleAutoPopulateVariables = () => {
    try {
      const extractedVars = extractVariables();

      if (!extractedVars || extractedVars.length === 0) {
        toast.info(
          'No variables found in the content or subject. Make sure to use {{variableName}} format.',
          {
            position: 'top-right',
            autoClose: 4000,
          },
        );
        return;
      }

      // Filter out variables that already exist
      const existingVariableNames = (formData.variables || []).map(v => v.name);
      const newVariables = extractedVars.filter(v => !existingVariableNames.includes(v.name));

      if (newVariables.length === 0) {
        toast.info('All variables from the content and subject are already defined.', {
          position: 'top-right',
          autoClose: 4000,
        });
        return;
      }

      // Set extracted variables and show type selection modal
      setExtractedVariables(newVariables);
      setShowTypeSelectionModal(true);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error extracting variables:', err);
      toast.error('Error extracting variables. Please check your content format and try again.');
    }
  };

  // Handle type selection for extracted variables
  const handleTypeSelection = (variableIndex, type) => {
    setExtractedVariables(prev =>
      prev.map((variable, index) => (index === variableIndex ? { ...variable, type } : variable)),
    );
  };

  // Confirm and add variables with selected types
  const handleConfirmTypeSelection = () => {
    // Create variables with proper structure (name as label, required as false)
    const variablesToAdd = extractedVariables.map(variable => ({
      name: variable.name,
      type: variable.type,
    }));

    setFormData(prev => ({
      ...prev,
      variables: [...prev.variables, ...variablesToAdd],
    }));

    setShowTypeSelectionModal(false);
    setExtractedVariables([]);

    toast.success(
      `Added ${extractedVariables.length} new variable(s): ${extractedVariables
        .map(v => v.name)
        .join(', ')}`,
      {
        position: 'top-right',
        autoClose: 3000,
      },
    );
  };

  // Cancel type selection
  const handleCancelTypeSelection = () => {
    setShowTypeSelectionModal(false);
    setExtractedVariables([]);
  };

  const validateForm = useCallback(() => {
    const errors = {};

    // Template name validation
    if (!formData.name.trim()) {
      errors.name = 'Template name is required';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Template name must be at least 3 characters long';
    } else if (formData.name.trim().length > 100) {
      errors.name = 'Template name must be less than 100 characters';
    }

    // Subject validation
    if (!formData.subject.trim()) {
      errors.subject = 'Subject is required';
    } else if (formData.subject.trim().length > 200) {
      errors.subject = 'Subject must be less than 200 characters';
    }

    // HTML content validation
    if (!formData.html_content.trim()) {
      errors.html_content = 'HTML content is required';
    } else if (formData.html_content.trim().length < 10) {
      errors.html_content = 'HTML content must be at least 10 characters long';
    }

    // Validate variables
    const variableNames = new Set();
    formData.variables.forEach((variable, index) => {
      if (!variable.name.trim()) {
        errors[`variable_${index}_name`] = 'Variable name is required';
      } else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(variable.name)) {
        errors[`variable_${index}_name`] =
          'Variable name must start with a letter and contain only letters, numbers, and underscores';
      } else if (variableNames.has(variable.name)) {
        errors[`variable_${index}_name`] = 'Variable name must be unique';
      } else {
        variableNames.add(variable.name);
      }
    });

    // Check if all variables used in content and subject are defined
    const allContent = `${formData.html_content || ''} ${formData.subject || ''}`;
    const usedVariables = [
      ...new Set([...allContent.matchAll(/{{(\w+)}}/g)].map(match => match[1])),
    ];
    const definedVariableNames = (formData.variables || []).map(v => v.name);
    const undefinedVariables = usedVariables.filter(v => !definedVariableNames.includes(v));
    const unusedVariables = definedVariableNames.filter(v => !usedVariables.includes(v));

    if (undefinedVariables.length > 0) {
      errors.undefined_variables = `The following variables are used but not defined: ${undefinedVariables.join(
        ', ',
      )}. Please define them or remove them from the content.`;
    }

    if (unusedVariables.length > 0) {
      errors.unused_variables = `The following variables are defined but not used: ${unusedVariables.join(
        ', ',
      )}. Consider removing them or using them in your content.`;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    // Validate template structure with backend if template is saved
    if (templateId) {
      try {
        const validation = await validateEmailTemplate(templateId);
        if (!validation.isValid && validation.errors && validation.errors.length > 0) {
          toast.warning(`Template validation warnings: ${validation.errors.join(', ')}`, {
            position: 'top-right',
            autoClose: 5000,
          });
          // Continue with save despite warnings (user can decide)
        }
      } catch (error) {
        // Validation error is not blocking, but log it
        // eslint-disable-next-line no-console
        console.warn('Template validation error:', error);
      }
    }

    setSaving(true);
    try {
      if (templateId) {
        await updateEmailTemplate(templateId, formData);
        toast.success('Template updated successfully!', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        await createEmailTemplate(formData);
        toast.success('Template created successfully!', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
      setHasUnsavedChanges(false); // Clear unsaved changes indicator
      if (onSave) {
        onSave(formData); // Pass saved data back to parent if needed
      }
    } catch (err) {
      toast.error('Failed to save template. Please try again.', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setSaving(false);
    }
  }, [
    validateForm,
    templateId,
    formData,
    validateEmailTemplate,
    updateEmailTemplate,
    createEmailTemplate,
    onSave,
  ]);

  const handleOpenVariableModal = useCallback(() => {
    setNewVariable({ name: '', type: 'text' });
    setVariableError('');
    setShowVariableModal(true);
  }, []);

  const handleEditVariable = useCallback(
    index => {
      const variable = formData.variables[index];
      setNewVariable({ ...variable });
      setEditingVariableIndex(index);
      setVariableError('');
      setShowVariableModal(true);
    },
    [formData.variables],
  );

  const handleAddVariable = useCallback(() => {
    if (!newVariable.name.trim()) {
      setVariableError('Variable name is required');
      return;
    }

    // Validate variable name format
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(newVariable.name)) {
      setVariableError(
        'Variable name must start with a letter and contain only letters, numbers, and underscores',
      );
      return;
    }

    // Check if variable name already exists (excluding current variable when editing)
    const existingVariable = formData.variables.find(
      (v, index) => v.name === newVariable.name && index !== editingVariableIndex,
    );
    if (existingVariable) {
      setVariableError('A variable with this name already exists');
      return;
    }

    // Create variable with name as label and required as false
    const variableToAdd = {
      name: newVariable.name,
      type: newVariable.type,
    };

    if (editingVariableIndex !== null) {
      // Update existing variable
      setFormData(prev => ({
        ...prev,
        variables: prev.variables.map((v, index) =>
          index === editingVariableIndex ? { ...variableToAdd } : v,
        ),
      }));
    } else {
      // Add new variable
      setFormData(prev => ({
        ...prev,
        variables: [...prev.variables, { ...variableToAdd }],
      }));
    }

    setShowVariableModal(false);
    setNewVariable({ name: '', type: 'text' });
    setEditingVariableIndex(null);
    setVariableError('');
  }, [formData.variables, newVariable, editingVariableIndex]);

  const handleDeleteVariable = useCallback(index => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index),
    }));
  }, []);

  const resetAllStates = useCallback(() => {
    setFormData({
      name: '',
      subject: '',
      html_content: '',
      variables: [],
    });
    setValidationErrors({});
    setSaving(false);
    setShowPreviewModal(false);
    setShowVariableModal(false);
    setExtractedVariables([]);
    setVariableError('');
    setNewVariable({ name: '', type: 'text' });
    setShowTypeSelectionModal(false);
  }, []);

  const clearReduxState = useCallback(() => {
    clearEmailTemplateError();
    clearCurrentTemplate();
  }, [clearEmailTemplateError, clearCurrentTemplate]);

  // Manual retry function for template loading
  const handleManualRetry = useCallback(async () => {
    if (isRetrying || !templateId) return;

    setIsRetrying(true);
    setRetryAttempts(prev => prev + 1);
    setApiError(null);

    try {
      await fetchEmailTemplate(templateId);
      setRetryAttempts(0); // Reset on success
      toast.success('Template loaded successfully');
    } catch (err) {
      setApiError('Failed to load template. Please try again.');
      toast.error(`Retry failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsRetrying(false);
    }
  }, [fetchEmailTemplate, templateId, isRetrying]);

  // Client-side preview fallback (for unsaved templates)
  const getClientSidePreview = useMemo(() => {
    if (!formData.html_content) return '';

    let content = formData.html_content;
    if (formData.variables && Array.isArray(formData.variables)) {
      formData.variables.forEach(variable => {
        if (variable && variable.name) {
          const placeholder = `[${variable.name}]`;
          const regex = new RegExp(`{{${variable.name}}}`, 'g');
          content = content.replace(regex, placeholder);
        }
      });
    }
    return content;
  }, [formData.html_content, formData.variables]);

  // Handle preview with backend API if template is saved, otherwise use client-side
  const handlePreview = useCallback(async () => {
    // If template is not saved yet, use client-side preview
    if (!templateId) {
      setPreviewData({
        subject: formData.subject || '',
        htmlContent: getClientSidePreview,
      });
      setShowPreviewModal(true);
      return;
    }

    // For saved templates, use backend API with placeholder values
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      // Build variable values object with placeholder values for preview
      const variableValues = {};
      if (formData.variables && Array.isArray(formData.variables)) {
        formData.variables.forEach(variable => {
          if (variable && variable.name) {
            // Use placeholder values based on variable type
            if (variable.type === 'image') {
              variableValues[variable.name] = 'https://example.com/placeholder-image.jpg';
            } else if (variable.type === 'video') {
              variableValues[variable.name] = 'https://example.com/placeholder-video.mp4';
            } else if (variable.type === 'number') {
              variableValues[variable.name] = '123';
            } else if (variable.type === 'email') {
              variableValues[variable.name] = 'example@email.com';
            } else {
              variableValues[variable.name] = `[${variable.name}]`;
            }
          }
        });
      }

      const preview = await previewEmailTemplate(templateId, variableValues);
      setPreviewData(preview);
      setShowPreviewModal(true);
    } catch (error) {
      // If preview fails, show error but still allow viewing client-side preview
      setPreviewError(error.message || 'Failed to preview template');
      toast.warning('Preview failed, showing basic preview', {
        position: 'top-right',
        autoClose: 3000,
      });
      // Fallback to client-side preview
      setPreviewData({
        subject: formData.subject || '',
        htmlContent: getClientSidePreview,
      });
      setShowPreviewModal(true);
    } finally {
      setPreviewLoading(false);
    }
  }, [templateId, formData, previewEmailTemplate, getClientSidePreview]);

  const tinyMCEConfig = useMemo(() => getTemplateEditorConfig(darkMode, formData), [
    darkMode,
    formData,
  ]);

  if (initialLoading && templateId) {
    return (
      <div className="email-template-editor">
        <div className="loading-state">
          <FaSpinner className="fa-spin me-2" />
          <div>Loading template...</div>
        </div>
      </div>
    );
  }

  // Show error state if template loading failed
  if (apiError && templateId) {
    return (
      <div className="email-template-editor">
        <div className="error-state">
          <div className="text-center">
            <h5 className="text-danger">Error Loading Template</h5>
            <p className="text-muted mb-3">{apiError}</p>
            {retryAttempts > 0 && (
              <small className="text-muted d-block mb-2">Retry attempt: {retryAttempts}</small>
            )}
            <Button
              color="primary"
              onClick={handleManualRetry}
              disabled={isRetrying}
              className="retry-button"
              size="sm"
            >
              {isRetrying ? (
                <>
                  <Spinner size="sm" className="me-1" />
                  Retrying...
                </>
              ) : (
                <>
                  <FaTimes className="me-1" />
                  Retry
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="email-template-editor">
      {/* Compact Header */}
      <div className="editor-header">
        <div className="header-container">
          {/* Template Name field */}
          <div className="template-name-field">
            <FormGroup className="mb-0">
              <Input
                id="template-name"
                type="text"
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
                invalid={!!validationErrors.name}
                placeholder="Template Name *"
                aria-describedby={validationErrors.name ? 'template-name-error' : undefined}
              />
              {validationErrors.name && (
                <div id="template-name-error" className="invalid-feedback d-block">
                  {validationErrors.name}
                </div>
              )}
            </FormGroup>
          </div>

          {/* Unsaved changes indicator and Action buttons */}
          <div className="action-buttons-container">
            {/* Unsaved changes indicator */}
            {hasUnsavedChanges && (
              <div className="unsaved-changes-indicator">
                <small className="text-warning d-flex align-items-center">
                  <FaExclamationTriangle className="me-1" />
                  Unsaved changes
                </small>
              </div>
            )}

            {/* Action buttons */}
            <div className="d-flex flex-wrap gap-2">
              <div className="action-buttons">
                <Button
                  size="sm"
                  color="outline-secondary"
                  onClick={handlePreview}
                  disabled={!formData.html_content || previewLoading}
                  title="Preview template"
                >
                  {previewLoading ? (
                    <>
                      <FaSpinner className="fa-spin me-0 me-sm-1" />
                      <span className="d-none d-sm-inline">Loading...</span>
                    </>
                  ) : (
                    <>
                      <FaEye className="me-0 me-sm-1" />
                      <span className="d-none d-sm-inline">Preview</span>
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  color="primary"
                  onClick={handleSave}
                  disabled={saving}
                  title="Save template"
                >
                  {saving ? (
                    <FaSpinner className="fa-spin me-0 me-sm-1" />
                  ) : (
                    <FaSave className="me-0 me-sm-1" />
                  )}
                  <span className="d-none d-sm-inline">
                    {saving ? 'Saving...' : 'Save & Continue'}
                  </span>
                  <span className="d-inline d-sm-none">{saving ? 'Saving...' : 'Save'}</span>
                </Button>
                <Button
                  size="sm"
                  color="secondary"
                  onClick={() => {
                    if (hasUnsavedChanges) {
                      // eslint-disable-next-line no-alert
                      const confirmed = window.confirm(
                        'You have unsaved changes. Are you sure you want to cancel? Your changes will be lost.',
                      );
                      if (!confirmed) return;
                    }
                    // Clear everything when exiting template editor
                    resetAllStates();
                    clearReduxState();
                    if (onClose) {
                      onClose();
                    }
                  }}
                  title="Cancel and close"
                >
                  <FaTimes className="me-0 me-sm-1" />
                  <span className="d-none d-sm-inline">Cancel</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert
          color="danger"
          toggle={clearEmailTemplateError}
          className="d-flex align-items-center"
        >
          <FaExclamationTriangle className="me-2" />
          <div>
            <strong>Error saving template</strong>
            <br />
            <small>{error}</small>
          </div>
        </Alert>
      )}

      {/* Undefined Variables - keep this error window at the top */}
      {validationErrors.undefined_variables && (
        <Alert color="danger" className="mb-3" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
          <div className="d-flex align-items-start">
            <FaExclamationTriangle className="me-2 mt-1" />
            <div>
              <strong>Undefined Variables:</strong>
              <div className="mt-1">{validationErrors.undefined_variables}</div>
            </div>
          </div>
        </Alert>
      )}

      {/* Unused Variables - keep this warning window at the top */}
      {validationErrors.unused_variables && (
        <Alert color="warning" className="mb-3" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
          <div className="d-flex align-items-start">
            <FaExclamationTriangle className="me-2 mt-1" />
            <div>
              <strong>Unused Variables:</strong>
              <div className="mt-1">{validationErrors.unused_variables}</div>
            </div>
          </div>
        </Alert>
      )}

      {/* Main Content */}
      <div className="template-editor-content">
        {/* Basic Information Section */}
        <div className="basic-info-section">
          <FormGroup>
            <Label htmlFor="template-subject">Subject *</Label>
            <Input
              id="template-subject"
              type="text"
              value={formData.subject}
              onChange={e => handleInputChange('subject', e.target.value)}
              invalid={!!validationErrors.subject}
              placeholder="Enter email subject"
              aria-describedby={validationErrors.subject ? 'template-subject-error' : undefined}
            />
            {validationErrors.subject && (
              <div id="template-subject-error" className="invalid-feedback d-block">
                {validationErrors.subject}
              </div>
            )}
          </FormGroup>
        </div>

        {/* Variables Section - Compact & Responsive */}
        <div className="variables-section">
          <div className="variables-header">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <FaCode className="me-2" />
                Template Variables
                {formData.variables.length > 0 && (
                  <Badge
                    color={darkMode ? 'dark' : 'light'}
                    className={`ms-2 template-variable-count ${
                      darkMode ? 'dark-mode' : 'light-mode'
                    }`}
                    style={{ fontSize: '0.75rem' }}
                  >
                    {formData.variables.length}
                  </Badge>
                )}
              </h5>
              <div className="d-flex gap-2">
                <Button
                  color="outline-success"
                  onClick={handleAutoPopulateVariables}
                  disabled={!formData.html_content.trim()}
                  title="Extract variables from HTML content and subject"
                  className="btn-auto-extract"
                  size="sm"
                >
                  <FaCode className="me-1" />
                  <span className="d-none d-sm-inline">Auto Extract</span>
                  <span className="d-inline d-sm-none">Auto Extract</span>
                </Button>
              </div>
            </div>
          </div>

          {formData.variables.length === 0 ? (
            <div className="empty-variables-state">
              <div className="text-center border rounded p-4">
                <p className="text-muted mb-0 small lh-base">
                  Use the <strong>&quot;Auto Extract&quot;</strong> button above to automatically
                  extract variables from your HTML content.
                </p>
              </div>
            </div>
          ) : (
            <div className="variables-chips">
              {formData.variables.map((variable, index) => (
                <div key={index} className="variable-chip">
                  <code className="variable-code">{`{{${variable.name}}}`}</code>
                  <Badge color="secondary" className="variable-type-badge" size="sm">
                    {getVariableTypeIcon(variable.type)}
                    {variable.type}
                  </Badge>
                  <Button
                    color="outline-primary"
                    size="sm"
                    onClick={() => handleEditVariable(index)}
                    title="Edit Variable"
                    className="chip-action-btn"
                  >
                    <FaPencilAlt />
                  </Button>
                  <Button
                    color="outline-danger"
                    size="sm"
                    onClick={() => handleDeleteVariable(index)}
                    title="Delete Variable"
                    className="chip-action-btn"
                  >
                    <FaTrash />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* HTML Content Section */}
        <div className="content-section">
          <FormGroup className="editor-container">
            <Label>HTML Content *</Label>
            <Editor
              key={`template-editor-${darkMode ? 'dark' : 'light'}-v2`}
              tinymceScriptSrc="/tinymce/tinymce.min.js"
              value={formData.html_content}
              onEditorChange={content => handleInputChange('html_content', content)}
              init={tinyMCEConfig}
            />
            {validationErrors.html_content && (
              <div className="text-danger mt-1">{validationErrors.html_content}</div>
            )}
          </FormGroup>
        </div>
      </div>

      {/* Preview Modal - FIXED ISSUE 3: Show variable names with icons, no labels */}
      <Modal isOpen={showPreviewModal} toggle={() => setShowPreviewModal(false)} size="lg" centered>
        <ModalHeader toggle={() => setShowPreviewModal(false)}>Email Preview</ModalHeader>
        <ModalBody>
          {previewError && (
            <Alert color="warning" className="mb-3">
              <FaExclamationTriangle className="me-2" />
              {previewError}
              {!templateId && ' (Using client-side preview for unsaved template)'}
            </Alert>
          )}
          {previewData ? (
            <div>
              <div className="mb-3">
                <strong>Subject:</strong>{' '}
                {previewData.subject || formData.subject || '(No subject)'}
              </div>
              <div className="mb-3">
                <strong>Variables:</strong> {formData.variables.length}
                {formData.variables.length > 0 && (
                  <div className="mt-2">
                    {formData.variables.map((variable, index) => (
                      <Badge
                        key={index}
                        color="secondary"
                        className="me-1 mb-1"
                        title={`Type: ${variable.type}`}
                      >
                        {getVariableTypeIcon(variable.type)}
                        {variable.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <strong>Content Preview:</strong>
                <div
                  className="mt-2 p-3 border rounded"
                  style={{ maxHeight: '400px', overflow: 'auto' }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      previewData.htmlContent || previewData.html_content || getClientSidePreview,
                    ),
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <FaSpinner className="fa-spin me-2" />
              Loading preview...
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button size="sm" color="secondary" onClick={() => setShowPreviewModal(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Add Variable Modal */}
      <Modal
        isOpen={showVariableModal}
        toggle={() => {
          setShowVariableModal(false);
          setEditingVariableIndex(null);
          setNewVariable({ name: '', type: 'text' });
          setVariableError('');
        }}
        centered
      >
        <ModalHeader
          toggle={() => {
            setShowVariableModal(false);
            setEditingVariableIndex(null);
            setNewVariable({ name: '', type: 'text' });
            setVariableError('');
          }}
        >
          {editingVariableIndex !== null ? 'Edit Variable' : 'Add New Variable'}
        </ModalHeader>
        <ModalBody>
          {variableError && <Alert color="danger">{variableError}</Alert>}
          <FormGroup>
            <Label for="variableName">Variable Name (e.g., firstName)</Label>
            <Input
              type="text"
              id="variableName"
              value={newVariable.name}
              onChange={e => setNewVariable(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter variable name (e.g., firstName)"
            />
          </FormGroup>
          <FormGroup>
            <Label for="variableType">Variable Type</Label>
            <Input
              type="select"
              id="variableType"
              value={newVariable.type}
              onChange={e => setNewVariable(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="text">Text</option>
              <option value="textarea">Textarea</option>
              <option value="number">Number</option>
              <option value="date">Date</option>
              <option value="email">Email</option>
              <option value="url">URL</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
            </Input>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button
            size="sm"
            color="secondary"
            onClick={() => {
              setShowVariableModal(false);
              setEditingVariableIndex(null);
              setNewVariable({ name: '', type: 'text' });
              setVariableError('');
            }}
          >
            Cancel
          </Button>
          <Button color="primary" size="sm" onClick={handleAddVariable}>
            {editingVariableIndex !== null ? 'Update Variable' : 'Add Variable'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Type Selection Modal for Auto-extracted Variables */}
      <Modal isOpen={showTypeSelectionModal} toggle={handleCancelTypeSelection} centered size="lg">
        <ModalHeader toggle={handleCancelTypeSelection}>Select Variable Types</ModalHeader>
        <ModalBody>
          <p>Please select a type for each new variable:</p>
          <div
            style={{
              maxHeight: '400px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              flexWrap: 'wrap',
            }}
          >
            <ListGroup>
              {extractedVariables.map((variable, index) => (
                <ListGroupItem
                  key={index}
                  className="d-flex justify-content-between align-items-center"
                >
                  <span>{variable.name}</span>
                  <Input
                    type="select"
                    value={variable.type}
                    onChange={e => handleTypeSelection(index, e.target.value)}
                    style={{ width: '150px' }}
                  >
                    <option value="text">Text</option>
                    <option value="textarea">Textarea</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="email">Email</option>
                    <option value="url">URL</option>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </Input>
                </ListGroupItem>
              ))}
            </ListGroup>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button size="sm" color="secondary" onClick={handleCancelTypeSelection}>
            Cancel
          </Button>
          <Button size="sm" color="primary" onClick={handleConfirmTypeSelection}>
            Add Selected Variables
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

const mapStateToProps = state => ({
  template: state.emailTemplates.currentTemplate,
  loading: state.emailTemplates.loading,
  error: state.emailTemplates.error,
});

const mapDispatchToProps = {
  createEmailTemplate,
  updateEmailTemplate,
  fetchEmailTemplate,
  clearEmailTemplateError,
  clearCurrentTemplate,
  previewEmailTemplate,
  validateEmailTemplate,
};

// PropTypes for type checking
EmailTemplateEditor.propTypes = {
  template: PropTypes.object,
  loading: PropTypes.bool,
  error: PropTypes.string,
  createEmailTemplate: PropTypes.func.isRequired,
  updateEmailTemplate: PropTypes.func.isRequired,
  fetchEmailTemplate: PropTypes.func.isRequired,
  clearEmailTemplateError: PropTypes.func.isRequired,
  clearCurrentTemplate: PropTypes.func.isRequired,
  previewEmailTemplate: PropTypes.func,
  validateEmailTemplate: PropTypes.func,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
  templateId: PropTypes.string,
};

// Default props
EmailTemplateEditor.defaultProps = {
  template: null,
  loading: false,
  error: null,
  onClose: null,
  onSave: null,
  templateId: null,
};

export default connect(mapStateToProps, mapDispatchToProps)(EmailTemplateEditor);
