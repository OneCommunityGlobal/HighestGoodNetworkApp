import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { connect, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
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
  Badge,
  Spinner,
  ButtonGroup,
  Row,
  Col,
  Table,
} from 'reactstrap';
import {
  FaPaperPlane,
  FaTimes,
  FaEye,
  FaEdit,
  FaCheckCircle,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { Editor } from '@tinymce/tinymce-react';
import { getEmailSenderConfig } from '../shared';
import {
  fetchEmailTemplates,
  sendEmailWithTemplate,
  clearEmailTemplateError,
} from '../../../actions/emailTemplateActions';
import './IntegratedEmailSender.css';

const IntegratedEmailSender = ({
  templates,
  loading,
  error,
  sendingEmail,
  emailSent,
  fetchEmailTemplates,
  sendEmailWithTemplate,
  clearEmailTemplateError,
  onClose,
  initialContent = '',
  initialSubject = '',
  preSelectedTemplate = null,
  initialRecipients = '',
}) => {
  const history = useHistory();
  const location = useLocation();
  const darkMode = useSelector(state => state.theme.darkMode);

  // Get current mode from URL query params, default to 'template'
  const getCurrentModeFromURL = () => {
    const urlParams = new URLSearchParams(location.search);
    const mode = urlParams.get('mode');
    return mode === 'custom' ? false : true; // Default to template mode
  };

  const [useTemplate, setUseTemplate] = useState(getCurrentModeFromURL());
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customContent, setCustomContent] = useState(initialContent);
  const [customSubject, setCustomSubject] = useState(initialSubject);
  const [recipients, setRecipients] = useState(initialRecipients);
  const [variableValues, setVariableValues] = useState({});
  const [emailDistribution, setEmailDistribution] = useState('specific'); // 'specific' or 'broadcast'
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [recipientList, setRecipientList] = useState([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  // Enhanced skeleton loading component
  const SkeletonLoader = ({ width = '100%', height = '20px', className = '', count = 1 }) => (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className={`skeleton-loader ${className}`}
          style={{ width, height, marginBottom: count > 1 ? '0.5rem' : '0' }}
        />
      ))}
    </>
  );

  // Loading state for template selection
  const TemplateSelectLoader = () => (
    <FormGroup>
      <Label>Select Template *</Label>
      <SkeletonLoader height="38px" className="mb-2" />
      <SkeletonLoader width="60%" height="16px" />
    </FormGroup>
  );

  // Loading state for template variables
  const VariablesLoader = () => (
    <div className="template-variables">
      <div className="variables-header">
        <SkeletonLoader width="200px" height="24px" className="mb-2" />
        <SkeletonLoader width="300px" height="16px" />
      </div>
      <div className="mt-3">
        <SkeletonLoader height="200px" />
      </div>
    </div>
  );

  // Update URL when mode changes
  const updateModeURL = isTemplateMode => {
    const urlParams = new URLSearchParams(location.search);

    // Clear template management parameters when switching email sender modes
    urlParams.delete('view');
    urlParams.delete('templateId');

    if (isTemplateMode) {
      urlParams.delete('mode'); // Remove mode param for template (default)
    } else {
      urlParams.set('mode', 'custom'); // Set mode param for custom
    }

    const newSearch = urlParams.toString();
    const newURL = `${location.pathname}${newSearch ? `?${newSearch}` : ''}`;
    history.replace(newURL);
  };

  // Handle mode change
  const handleModeChange = isTemplateMode => {
    // Reset all states when changing modes
    resetAllStates();
    setUseTemplate(isTemplateMode);
    updateModeURL(isTemplateMode);
  };

  // Complete state reset function
  const resetAllStates = () => {
    setSelectedTemplate(null);
    setCustomContent('');
    setCustomSubject('');
    setRecipients('');
    setVariableValues({});
    setEmailDistribution('specific');
    setShowPreviewModal(false);
    setValidationErrors({});
    setRecipientList([]);
    setShowSuccessMessage(false);
  };

  // Update useTemplate when URL changes (e.g., browser back/forward)
  useEffect(() => {
    const newMode = getCurrentModeFromURL();
    if (newMode !== useTemplate) {
      // Always reset all states when switching modes
      resetAllStates();
      setUseTemplate(newMode);
    }
  }, [location.search]); // Removed useTemplate from deps to avoid infinite loop

  useEffect(() => {
    fetchEmailTemplates({
      search: '',
      page: 1,
      sortBy: 'created_at',
      sortOrder: 'desc',
      includeVariables: true, // Get full template data for sender
    });
  }, [fetchEmailTemplates]);

  // Handle preSelectedTemplate
  useEffect(() => {
    if (preSelectedTemplate && templates && templates.length > 0) {
      setUseTemplate(true);
      setSelectedTemplate(preSelectedTemplate);
      handleTemplateSelect(preSelectedTemplate);
    }
  }, [preSelectedTemplate, templates]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearEmailTemplateError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearEmailTemplateError]);

  useEffect(() => {
    if (emailSent) {
      setShowSuccessMessage(true);
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
        clearEmailTemplateError();
        // Clear everything when email is sent successfully
        resetAllStates();
        if (onClose) {
          onClose();
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [emailSent, clearEmailTemplateError, onClose]);

  // Cleanup effect to reset states when component unmounts
  useEffect(() => {
    return () => {
      // Clear everything when exiting email sender
      resetAllStates();
    };
  }, []); // Empty dependency array is correct for cleanup on unmount

  // Error handling functions
  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    setApiError(null);

    toast.info('Retrying to load templates...');

    try {
      await fetchEmailTemplates({
        search: '',
        page: 1,
        sortBy: 'created_at',
        sortOrder: 'desc',
        includeVariables: true, // Get full template data for sender
      });
      clearEmailTemplateError();
      toast.success('Templates loaded successfully');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Retry failed:', err);
      setApiError('Failed to retry. Please try again later.');
      toast.error(`Failed to load templates: ${err.message || 'Unknown error'}`);
    } finally {
      setIsRetrying(false);
    }
  }, [fetchEmailTemplates, clearEmailTemplateError]);

  const clearError = useCallback(() => {
    setApiError(null);
    setRetryCount(0);
    setIsRetrying(false);
    clearEmailTemplateError();
  }, [clearEmailTemplateError]);

  // Show toast notifications for errors from Redux
  useEffect(() => {
    if (error) {
      toast.error(`Error: ${error}`);
    }
  }, [error]);

  const initializeVariableValues = template => {
    const initialValues = {};
    if (template && template.variables && Array.isArray(template.variables)) {
      template.variables.forEach(variable => {
        if (variable && variable.name) {
          initialValues[variable.name] = '';
        }
      });
    }
    setVariableValues(initialValues);
  };

  const handleTemplateSelect = useCallback(template => {
    // Clear all previous state first
    setVariableValues({});
    setValidationErrors({});
    setShowPreviewModal(false);

    if (!template) {
      setSelectedTemplate(null);
      return;
    }

    // Template already has full data including variables from includeVariables: true
    setSelectedTemplate(template);
    initializeVariableValues(template);
  }, []);

  const handleVariableChange = useCallback((variableName, value) => {
    setVariableValues(prev => ({
      ...prev,
      [variableName]: value,
    }));

    setValidationErrors(prev => {
      if (prev[variableName]) {
        return {
          ...prev,
          [variableName]: null,
        };
      }
      return prev;
    });
  }, []);

  const parseRecipients = useCallback(recipientText => {
    return recipientText
      .split(/[,;\n]/)
      .map(email => email.trim())
      .filter(email => email.length > 0);
  }, []);

  // Function to extract image from various sources with proper sizing
  const extractImageFromSource = source => {
    if (!source) return null;

    // Check if it's already a direct image URL
    if (source.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i)) {
      return source;
    }

    // YouTube thumbnail extraction with multiple quality options
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const youtubeMatch = source.match(youtubeRegex);
    if (youtubeMatch) {
      const videoId = youtubeMatch[1];

      // Try multiple thumbnail qualities in order of preference
      const thumbnailOptions = [
        `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, // 1280x720 - best quality
        `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, // 480x360 - high quality
        `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`, // 320x180 - medium quality
        `https://img.youtube.com/vi/${videoId}/default.jpg`, // 120x90 - default
      ];

      // Return the highest quality option (maxresdefault)
      return thumbnailOptions[0];
    }

    // For other video platforms or invalid URLs, return null
    return null;
  };

  // Handle image source change with automatic extraction
  const handleImageSourceChange = (variableName, source) => {
    const extractedImage = extractImageFromSource(source);

    setVariableValues(prev => ({
      ...prev,
      [variableName]: source,
      [`${variableName}_extracted`]: extractedImage || '',
    }));

    if (validationErrors[variableName]) {
      setValidationErrors(prev => ({
        ...prev,
        [variableName]: null,
      }));
    }
  };

  // Function to get YouTube thumbnail with fallback
  const getYouTubeThumbnailWithFallback = videoId => {
    const thumbnailOptions = [
      `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, // 1280x720 - best quality
      `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, // 480x360 - high quality
      `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`, // 320x180 - medium quality
      `https://img.youtube.com/vi/${videoId}/default.jpg`, // 120x90 - default
    ];

    return thumbnailOptions;
  };

  const validateEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const errors = {};

    if (useTemplate && !selectedTemplate) {
      errors.template = 'Please select a template';
    }

    if (!useTemplate && !customContent.trim()) {
      errors.customContent = 'Please enter email content';
    }

    if (!useTemplate && !customSubject.trim()) {
      errors.customSubject = 'Please enter email subject';
    }

    if (emailDistribution === 'specific') {
      if (!recipients.trim()) {
        errors.recipients = 'Please enter at least one recipient';
      } else {
        const recipientEmails = parseRecipients(recipients);
        const invalidEmails = recipientEmails.filter(email => !validateEmail(email));
        if (invalidEmails.length > 0) {
          errors.recipients = `Invalid email addresses: ${invalidEmails.join(', ')}`;
        }
        setRecipientList(recipientEmails);
      }
    } else {
      setRecipientList([]);
    }

    // Validate all variables for templates (all are required by default)
    if (useTemplate && selectedTemplate && selectedTemplate.variables) {
      selectedTemplate.variables.forEach(variable => {
        if (!variableValues[variable.name]?.trim()) {
          errors[variable.name] = `${variable.name} is required`;
        }
      });
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSendEmail = () => {
    if (!validateForm()) {
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmSendEmail = async () => {
    setShowConfirmModal(false);

    if (useTemplate && selectedTemplate) {
      // Process variable values to use extracted images where available
      const processedVariableValues = { ...variableValues };

      // Replace image variables with extracted images if available
      selectedTemplate.variables.forEach(variable => {
        if (variable.type === 'image' && processedVariableValues[`${variable.name}_extracted`]) {
          processedVariableValues[variable.name] =
            processedVariableValues[`${variable.name}_extracted`];
        }
      });

      // Send using template
      const emailData = {
        recipients: emailDistribution === 'broadcast' ? [] : recipientList,
        variableValues: processedVariableValues,
        broadcastToAll: emailDistribution === 'broadcast',
      };

      try {
        await sendEmailWithTemplate(selectedTemplate._id, emailData);
        toast.success(`Email sent successfully using template "${selectedTemplate.name}"`);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 5000);
        resetAllStates();
      } catch (error) {
        toast.error(`Failed to send email: ${error.message || 'Unknown error'}`);
      }
    } else {
      // Send custom email
      const emailData = {
        recipients: emailDistribution === 'broadcast' ? [] : recipientList,
        subject: customSubject,
        content: customContent,
        broadcastToAll: emailDistribution === 'broadcast',
      };

      try {
        if (emailDistribution === 'broadcast') {
          // Use existing broadcast functionality for custom emails
          const response = await fetch('/api/send-emails/broadcast-emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              requestor: 'current-user', // You might want to get this from auth context
              subject: customSubject,
              html: customContent,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to send broadcast email');
          }
        } else {
          // Use existing send email functionality for specific recipients
          const response = await fetch('/api/send-emails/send-emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              requestor: 'current-user', // You might want to get this from auth context
              to: recipientList,
              subject: customSubject,
              html: customContent,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to send email');
          }
        }

        // Show success message
        toast.success(`Email sent successfully to ${recipientList.length} recipient(s)`);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 5000);
        resetAllStates();
      } catch (error) {
        toast.error(`Failed to send email: ${error.message || 'Unknown error'}`);
        setValidationErrors({ general: error.message || 'Failed to send email' });
      }
    }
  };

  const getPreviewContent = () => {
    if (useTemplate && selectedTemplate) {
      let content = selectedTemplate.html_content || selectedTemplate.content || '';
      let subject = selectedTemplate.subject || '';

      if (selectedTemplate.variables && Array.isArray(selectedTemplate.variables)) {
        selectedTemplate.variables.forEach(variable => {
          if (variable && variable.name) {
            // Use extracted image if available for image variables
            let value = variableValues[variable.name] || `[${variable.name}]`;
            if (variable.type === 'image' && variableValues[`${variable.name}_extracted`]) {
              value = variableValues[`${variable.name}_extracted`];
            }
            const regex = new RegExp(`{{${variable.name}}}`, 'g');
            content = content.replace(regex, value);
            subject = subject.replace(regex, value);
          }
        });
      }

      return { subject, content };
    } else {
      return { subject: customSubject, content: customContent };
    }
  };

  // Memoized TinyMCE configuration for performance
  const TINY_MCE_INIT_OPTIONS = useMemo(() => getEmailSenderConfig(darkMode), [darkMode]);

  return (
    <div className="email-sender">
      {/* Page Title */}
      <div className="page-title-container mb-3">
        <h2 className="page-title">Send Email</h2>
      </div>

      <div className="email-sender-content">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center">
            {/* Email Mode Selector */}
            <div className="mode-buttons me-3" role="group" aria-label="Email composition mode">
              <Button
                color={useTemplate ? 'primary' : 'outline-primary'}
                onClick={() => handleModeChange(true)}
                aria-pressed={useTemplate}
                aria-label="Use email templates"
                title="Create email using pre-made templates"
              >
                📧 Templates
              </Button>
              <Button
                color={!useTemplate ? 'success' : 'outline-success'}
                onClick={() => handleModeChange(false)}
                aria-pressed={!useTemplate}
                aria-label="Create custom email"
                title="Create email with custom content"
              >
                ✏️ Custom
              </Button>
            </div>
          </div>

          <div className="action-buttons">
            <Button
              color="outline-secondary"
              onClick={() => setShowPreviewModal(true)}
              disabled={(!useTemplate && !customContent) || (useTemplate && !selectedTemplate)}
              aria-label="Preview email content"
              title="Preview how the email will look before sending"
            >
              <FaEye className="me-1" />
              Preview
            </Button>
            <Button
              color="primary"
              onClick={handleSendEmail}
              disabled={sendingEmail}
              aria-label={sendingEmail ? 'Sending email...' : 'Send email'}
            >
              {sendingEmail ? (
                <Spinner size="sm" className="me-1" />
              ) : (
                <FaPaperPlane className="me-1" />
              )}
              {sendingEmail ? 'Sending...' : 'Send Email'}
            </Button>
            {onClose && (
              <Button color="secondary" onClick={onClose}>
                <FaTimes className="me-1" />
                Close
              </Button>
            )}
          </div>
        </div>
        {/* Success Alert */}
        {showSuccessMessage && (
          <Alert color="success" className="d-flex align-items-center">
            <FaCheckCircle className="me-2" />
            <div>
              <strong>Email sent successfully!</strong>
              <br />
              <small>
                {emailDistribution === 'broadcast'
                  ? 'Broadcasted to all subscribed users'
                  : `Sent to ${recipientList.length} recipient${
                      recipientList.length !== 1 ? 's' : ''
                    }`}
              </small>
            </div>
          </Alert>
        )}

        {/* Enhanced Error Alert */}
        {(error || apiError) && (
          <Alert color="danger" className="mb-3">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <FaExclamationTriangle className="me-2" />
                <strong>Error Loading Templates</strong>
                <div className="mt-1">{error || apiError}</div>
                {retryCount > 0 && <small className="text-muted">Retry attempt {retryCount}</small>}
              </div>
              <div className="d-flex gap-2">
                <Button
                  color="outline-primary"
                  size="sm"
                  onClick={handleRetry}
                  disabled={isRetrying || retryCount >= 3}
                >
                  {isRetrying ? (
                    <>
                      <Spinner size="sm" className="me-1" />
                      Retrying...
                    </>
                  ) : (
                    'Retry'
                  )}
                </Button>
                <Button color="outline-secondary" onClick={clearError}>
                  Dismiss
                </Button>
              </div>
            </div>
            {retryCount >= 3 && (
              <div className="mt-2">
                <small className="text-muted">
                  Multiple retry attempts failed. Please check your connection or try refreshing the
                  page.
                </small>
              </div>
            )}
          </Alert>
        )}

        {/* General Validation Error Alert */}
        {validationErrors.general && (
          <Alert
            color="danger"
            toggle={() => setValidationErrors(prev => ({ ...prev, general: null }))}
            className="d-flex align-items-center"
          >
            <FaExclamationTriangle className="me-2" />
            <div>
              <strong>Error</strong>
              <br />
              <small>{validationErrors.general}</small>
            </div>
          </Alert>
        )}

        <Form>
          {/* Template Selection (if using template) */}
          {useTemplate && (
            <FormGroup>
              <Label>Select Template *</Label>
              <Input
                type="select"
                value={selectedTemplate?._id || ''}
                onChange={e => {
                  const template = templates.find(t => t._id === e.target.value);
                  handleTemplateSelect(template);
                }}
                invalid={!!validationErrors.template}
              >
                <option value="">Choose a template...</option>
                {loading ? (
                  <option disabled>Loading templates...</option>
                ) : templates && templates.length > 0 ? (
                  templates.map(template => (
                    <option
                      key={template._id}
                      value={template._id}
                      title={`${template.name} (created by ${
                        template.created_by
                          ? `${template.created_by.firstName} ${template.created_by.lastName}`
                          : 'Unknown'
                      })`}
                      style={{ padding: '8px', whiteSpace: 'normal' }}
                    >
                      {template.name} (created by{' '}
                      {template.created_by
                        ? `${template.created_by.firstName} ${template.created_by.lastName}`
                        : 'Unknown'}
                      )
                    </option>
                  ))
                ) : (
                  <option disabled>No templates available</option>
                )}
              </Input>
              {validationErrors.template && (
                <div className="invalid-feedback d-block">{validationErrors.template}</div>
              )}
            </FormGroup>
          )}

          {/* Custom Email Fields (if not using template) */}
          {!useTemplate && (
            <>
              <FormGroup>
                <Label>Subject *</Label>
                <Input
                  type="text"
                  value={customSubject}
                  onChange={e => setCustomSubject(e.target.value)}
                  invalid={!!validationErrors.customSubject}
                  placeholder="Enter email subject"
                />
                {validationErrors.customSubject && (
                  <div className="invalid-feedback d-block">{validationErrors.customSubject}</div>
                )}
              </FormGroup>

              <FormGroup>
                <Label>Content *</Label>
                <Editor
                  key={`custom-editor-${darkMode ? 'dark' : 'light'}`}
                  tinymceScriptSrc="/tinymce/tinymce.min.js"
                  value={customContent}
                  onEditorChange={setCustomContent}
                  init={TINY_MCE_INIT_OPTIONS}
                />
                {validationErrors.customContent && (
                  <div className="text-danger mt-1">{validationErrors.customContent}</div>
                )}
              </FormGroup>
            </>
          )}

          {/* Variable Values (if using template with variables) */}
          {useTemplate &&
            selectedTemplate &&
            selectedTemplate.variables &&
            selectedTemplate.variables.length > 0 && (
              <div className="template-variables">
                <div className="variables-header">
                  <h6 className="mb-1">
                    Template Variables
                    <Badge color="info" className="ml-2 ms-2">
                      {selectedTemplate.variables.length} variable
                      {selectedTemplate.variables.length !== 1 ? 's' : ''}
                    </Badge>
                  </h6>
                </div>

                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th style={{ width: '25%' }}>Variable</th>
                      <th style={{ width: '10%' }}>Type</th>
                      <th style={{ width: '65%' }}>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTemplate.variables.map(variable => (
                      <tr key={variable.name}>
                        <td>
                          <div className="variable-label">
                            {variable.name}
                            {variable.required && <span className="text-danger ms-1">*</span>}
                          </div>
                        </td>
                        <td>
                          <Badge
                            color="secondary"
                            size="sm"
                            title={`Variable type: ${variable.type}`}
                          >
                            {variable.type}
                          </Badge>
                        </td>
                        <td>
                          {variable.type === 'textarea' ? (
                            <Input
                              type="textarea"
                              rows={3}
                              value={variableValues[variable.name] || ''}
                              onChange={e => handleVariableChange(variable.name, e.target.value)}
                              placeholder={`Enter ${variable.name.toLowerCase()}`}
                              invalid={!!validationErrors[variable.name]}
                              className="variable-input variable-textarea"
                            />
                          ) : variable.type === 'image' ? (
                            <div>
                              <Input
                                type="url"
                                value={variableValues[variable.name] || ''}
                                onChange={e =>
                                  handleImageSourceChange(variable.name, e.target.value)
                                }
                                placeholder="Image URL or YouTube link"
                                invalid={!!validationErrors[variable.name]}
                                className="variable-input"
                              />
                              <small className="text-muted">
                                Supports: Direct image URLs (.jpg, .png, .gif, .webp, .svg), YouTube
                                links
                                {variableValues[`${variable.name}_extracted`] && (
                                  <span className="text-success ms-1">(Auto-extracted)</span>
                                )}
                              </small>
                              {(variableValues[variable.name] ||
                                variableValues[`${variable.name}_extracted`]) && (
                                <div className="mt-2">
                                  <small className="text-muted d-block mb-1">Preview:</small>
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '10px',
                                    }}
                                  >
                                    <img
                                      src={
                                        variableValues[`${variable.name}_extracted`] ||
                                        variableValues[variable.name]
                                      }
                                      alt="Preview"
                                      style={{
                                        maxWidth: '400px',
                                        width: '100%',
                                        height: 'auto',
                                        objectFit: 'contain',
                                        borderRadius: '4px',
                                        border: '1px solid #dee2e6',
                                      }}
                                      onError={e => {
                                        // Try fallback thumbnails for YouTube videos
                                        const currentSrc = e.target.src;
                                        const youtubeMatch = currentSrc.match(
                                          /img\.youtube\.com\/vi\/([^\/]+)\/([^\/]+)\.jpg/,
                                        );

                                        if (youtubeMatch) {
                                          const videoId = youtubeMatch[1];
                                          const currentQuality = youtubeMatch[2];

                                          // Try next quality level
                                          const fallbackOptions = [
                                            'hqdefault',
                                            'mqdefault',
                                            'default',
                                          ];

                                          const currentIndex = fallbackOptions.indexOf(
                                            currentQuality,
                                          );
                                          if (currentIndex < fallbackOptions.length - 1) {
                                            const nextQuality = fallbackOptions[currentIndex + 1];
                                            e.target.src = `https://img.youtube.com/vi/${videoId}/${nextQuality}.jpg`;
                                            return;
                                          }
                                        }

                                        // If all fallbacks fail, show error
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                      }}
                                    />
                                    <div
                                      style={{
                                        display: 'none',
                                        width: '400px',
                                        height: 'auto',
                                        minHeight: '200px',
                                        backgroundColor: '#f8f9fa',
                                        border: '1px solid #dee2e6',
                                        borderRadius: '4px',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '12px',
                                        color: '#dc3545',
                                        flexDirection: 'column',
                                        gap: '4px',
                                      }}
                                    >
                                      <div>❌</div>
                                      <div>Invalid Image</div>
                                    </div>
                                    {variableValues[`${variable.name}_extracted`] && (
                                      <div style={{ flex: 1 }}>
                                        <div
                                          style={{
                                            fontSize: '12px',
                                            color: '#6c757d',
                                            marginBottom: '2px',
                                          }}
                                        >
                                          Extracted from:
                                        </div>
                                        <div
                                          style={{
                                            fontSize: '11px',
                                            wordBreak: 'break-all',
                                          }}
                                        >
                                          {variableValues[variable.name]}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <Input
                              type={variable.type === 'url' ? 'url' : variable.type}
                              value={variableValues[variable.name] || ''}
                              onChange={e => handleVariableChange(variable.name, e.target.value)}
                              placeholder={
                                variable.type === 'url'
                                  ? 'https://example.com'
                                  : variable.type === 'number'
                                  ? 'Enter number'
                                  : `Enter ${variable.name.toLowerCase()}`
                              }
                              invalid={!!validationErrors[variable.name]}
                              className="variable-input"
                            />
                          )}
                          {validationErrors[variable.name] && (
                            <div className="invalid-feedback d-block">
                              {validationErrors[variable.name]}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}

          {/* Email Distribution Selection */}
          <FormGroup className="mt-3">
            <Label className="form-label">
              {/* <FaPaperPlane className="me-2" /> */}
              Email Distribution *
            </Label>
            <div className="distribution-options">
              <label
                className={`distribution-option ${
                  emailDistribution === 'specific' ? 'selected' : ''
                }`}
              >
                <input
                  type="radio"
                  name="emailDistribution"
                  value="specific"
                  checked={emailDistribution === 'specific'}
                  onChange={() => setEmailDistribution('specific')}
                />
                <span className="option-icon mx-2">✏️</span>
                Specific Recipients
              </label>
              <label
                className={`distribution-option ${
                  emailDistribution === 'broadcast' ? 'selected' : ''
                }`}
              >
                <input
                  type="radio"
                  name="emailDistribution"
                  value="broadcast"
                  checked={emailDistribution === 'broadcast'}
                  onChange={() => setEmailDistribution('broadcast')}
                />
                <span className="option-icon mx-2">🚀</span>
                Broadcast to All Subscribers
              </label>
            </div>

            {/* Expanded content for specific recipients */}
            {emailDistribution === 'specific' && (
              <FormGroup className="mt-3">
                <Label>Recipients *</Label>
                <Input
                  type="textarea"
                  rows={4}
                  value={recipients}
                  onChange={e => setRecipients(e.target.value)}
                  invalid={!!validationErrors.recipients}
                  placeholder="Enter email addresses separated by commas&#10;Example: john@example.com, jane@example.com, team@company.com"
                />
                {validationErrors.recipients && (
                  <div className="invalid-feedback d-block">{validationErrors.recipients}</div>
                )}
              </FormGroup>
            )}
          </FormGroup>
        </Form>
      </div>

      {/* Preview Modal */}
      <Modal isOpen={showPreviewModal} toggle={() => setShowPreviewModal(false)} size="lg">
        <ModalHeader toggle={() => setShowPreviewModal(false)}>Email Preview</ModalHeader>
        <ModalBody>
          <div className="mb-3">
            <strong>Subject:</strong> {getPreviewContent().subject}
          </div>
          <div className="mb-3">
            <strong>Distribution:</strong>{' '}
            {emailDistribution === 'broadcast'
              ? 'Broadcast to all subscribed users'
              : `Send to specific recipients (${parseRecipients(recipients).length} recipients)`}
          </div>
          {emailDistribution === 'specific' && (
            <div className="mb-3">
              <strong>Recipients:</strong> {parseRecipients(recipients).join(', ')}
            </div>
          )}
          <div dangerouslySetInnerHTML={{ __html: getPreviewContent().content }} />
          <div className="mt-3">
            <small className="text-muted">
              This is how your email will look when sent.
              {useTemplate &&
                selectedTemplate &&
                selectedTemplate.variables &&
                selectedTemplate.variables.length > 0 &&
                ' Variables without values are shown as [Label].'}
            </small>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setShowPreviewModal(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Confirmation Modal */}
      <Modal isOpen={showConfirmModal} toggle={() => setShowConfirmModal(false)}>
        <ModalHeader toggle={() => setShowConfirmModal(false)}>Confirm Send Email</ModalHeader>
        <ModalBody>
          <p>Are you sure you want to send this email?</p>
          <div className="mb-3">
            <strong>Subject:</strong> {getPreviewContent().subject}
          </div>
          <div className="mb-3">
            <strong>Recipients:</strong>{' '}
            {emailDistribution === 'broadcast'
              ? 'All users'
              : `${parseRecipients(recipients).length} recipients`}
          </div>
          <div className="alert alert-warning">
            <small>This action cannot be undone. The email will be sent immediately.</small>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </Button>
          <Button color="primary" onClick={confirmSendEmail}>
            Send Email
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

// PropTypes for better type checking and documentation
IntegratedEmailSender.propTypes = {
  // Redux props
  templates: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      subject: PropTypes.string.isRequired,
      html_content: PropTypes.string.isRequired,
      variables: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired,
          type: PropTypes.string.isRequired,
          required: PropTypes.bool,
        }),
      ),
      is_active: PropTypes.bool,
    }),
  ),
  loading: PropTypes.bool,
  error: PropTypes.string,
  sendingEmail: PropTypes.bool,
  emailSent: PropTypes.bool,
  // Redux actions
  fetchEmailTemplates: PropTypes.func.isRequired,
  sendEmailWithTemplate: PropTypes.func.isRequired,
  clearEmailTemplateError: PropTypes.func.isRequired,
  // Component props
  onClose: PropTypes.func,
  initialContent: PropTypes.string,
  initialSubject: PropTypes.string,
  preSelectedTemplate: PropTypes.object,
  initialRecipients: PropTypes.string,
};

// Default props
IntegratedEmailSender.defaultProps = {
  templates: [],
  loading: false,
  error: null,
  sendingEmail: false,
  emailSent: false,
  onClose: null,
  initialContent: '',
  initialSubject: '',
  preSelectedTemplate: null,
  initialRecipients: '',
};

const mapStateToProps = state => ({
  templates: state.emailTemplates.templates,
  loading: state.emailTemplates.loading,
  error: state.emailTemplates.error,
  sendingEmail: state.emailTemplates.sendingEmail,
  emailSent: state.emailTemplates.emailSent,
});

const mapDispatchToProps = {
  fetchEmailTemplates,
  sendEmailWithTemplate,
  clearEmailTemplateError,
};

export default connect(mapStateToProps, mapDispatchToProps)(IntegratedEmailSender);
