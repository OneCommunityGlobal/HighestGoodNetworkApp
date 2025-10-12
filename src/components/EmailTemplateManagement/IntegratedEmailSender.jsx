import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardBody,
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
import {
  fetchEmailTemplates,
  sendEmailWithTemplate,
  clearEmailTemplateError,
} from '../../actions/emailTemplateActions';
import './EmailSender.css';
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

  // Skeleton loading component
  const SkeletonLoader = ({ width = '100%', height = '20px', className = '' }) => (
    <div className={`skeleton-loader ${className}`} style={{ width, height }} />
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
  }, [location.search, useTemplate]);

  useEffect(() => {
    fetchEmailTemplates('', true); // Fetch only active templates
  }, [fetchEmailTemplates]);

  // Handle preSelectedTemplate
  useEffect(() => {
    if (preSelectedTemplate && templates.length > 0) {
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
  }, []);

  const initializeVariableValues = template => {
    const initialValues = {};
    if (template.variables) {
      template.variables.forEach(variable => {
        initialValues[variable.name] = '';
      });
    }
    setVariableValues(initialValues);
  };

  const handleTemplateSelect = template => {
    // Clear all previous state first
    setVariableValues({});
    setValidationErrors({});
    setShowPreviewModal(false);

    // Then set new template data
    setSelectedTemplate(template);
    initializeVariableValues(template);
  };

  const handleVariableChange = (variableName, value) => {
    setVariableValues(prev => ({
      ...prev,
      [variableName]: value,
    }));

    if (validationErrors[variableName]) {
      setValidationErrors(prev => ({
        ...prev,
        [variableName]: null,
      }));
    }
  };

  const parseRecipients = recipientText => {
    return recipientText
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0);
  };

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
          errors[variable.name] = `${variable.label} is required`;
        }
      });
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSendEmail = async () => {
    if (!validateForm()) {
      return;
    }

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
      } catch (error) {
        // Error handled by Redux
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
        setEmailSent(true);
        setTimeout(() => setEmailSent(false), 5000);
      } catch (error) {
        // Handle error - you might want to dispatch an error action here
        // For now, we'll just log the error silently
      }
    }
  };

  const getPreviewContent = () => {
    if (useTemplate && selectedTemplate) {
      let content = selectedTemplate.html_content;
      let subject = selectedTemplate.subject;

      if (selectedTemplate.variables) {
        selectedTemplate.variables.forEach(variable => {
          // Use extracted image if available for image variables
          let value = variableValues[variable.name] || `[${variable.label}]`;
          if (variable.type === 'image' && variableValues[`${variable.name}_extracted`]) {
            value = variableValues[`${variable.name}_extracted`];
          }
          const regex = new RegExp(`{{${variable.name}}}`, 'g');
          content = content.replace(regex, value);
          subject = subject.replace(regex, value);
        });
      }

      return { subject, content };
    } else {
      return { subject: customSubject, content: customContent };
    }
  };

  // Lightweight TinyMCE configuration
  const TINY_MCE_INIT_OPTIONS = {
    license_key: 'gpl',
    height: 300,
    menubar: false,
    placeholder: '',
    plugins: ['lists', 'link', 'autolink', 'paste'],
    toolbar: [
      'undo redo | bold italic underline | alignleft aligncenter alignright | bullist numlist | link',
    ],
    branding: false,
    statusbar: false,
    resize: false,
    content_style: `body, p, div, span, * { 
      font-family: Arial, Helvetica, sans-serif; 
      font-size: 14px; 
      line-height: 0.5; 
    }`,
    setup: function(editor) {
      editor.on('init', function() {
        editor.getBody().style.fontFamily = 'Arial, Helvetica, sans-serif';
        editor.getBody().style.fontSize = '14px';
        editor.getBody().style.padding = '12px';
      });
    },
  };

  return (
    <div className="email-sender">
      <Card>
        <CardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              {/* Email Mode Selector */}
              <ButtonGroup className="me-3">
                <Button
                  color={useTemplate ? 'primary' : 'outline-primary'}
                  onClick={() => handleModeChange(true)}
                  size="sm"
                >
                  📧 Templates
                </Button>
                <Button
                  color={!useTemplate ? 'success' : 'outline-success'}
                  onClick={() => handleModeChange(false)}
                  size="sm"
                >
                  ✏️ Custom
                </Button>
              </ButtonGroup>
            </div>

            <div className="d-flex align-items-center">
              <Button
                color="outline-secondary"
                className="me-2"
                onClick={() => setShowPreviewModal(true)}
                disabled={(!useTemplate && !customContent) || (useTemplate && !selectedTemplate)}
              >
                <FaEye className="me-1" />
                Preview
              </Button>
              <Button
                color="primary"
                className="me-2"
                onClick={handleSendEmail}
                disabled={sendingEmail}
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
        </CardHeader>
        <CardBody>
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

          {/* Error Alert */}
          {error && (
            <Alert
              color="danger"
              toggle={clearEmailTemplateError}
              className="d-flex align-items-center"
            >
              <FaExclamationTriangle className="me-2" />
              <div>
                <strong>Error sending email</strong>
                <br />
                <small>{error}</small>
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
                  style={{
                    minHeight: '40px',
                    fontSize: '14px',
                    padding: '0.5rem 2.5rem 0.5rem 0.75rem',
                  }}
                >
                  <option value="">Choose a template...</option>
                  {loading ? (
                    <option disabled>Loading templates...</option>
                  ) : (
                    templates.map(template => (
                      <option
                        key={template._id}
                        value={template._id}
                        title={`${template.name} - ${template.subject}`}
                        style={{ padding: '8px', whiteSpace: 'normal' }}
                      >
                        {template.name} -{' '}
                        {template.subject.length > 50
                          ? `${template.subject.substring(0, 50)}...`
                          : template.subject}
                      </option>
                    ))
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
                <div className="template-variables-section mb-4">
                  <div className="variables-header mb-3">
                    <h6 className="mb-1">
                      Template Variables
                      <Badge color="info" className="ml-2 ms-2">
                        {selectedTemplate.variables.length} variable
                        {selectedTemplate.variables.length !== 1 ? 's' : ''}
                      </Badge>
                    </h6>
                    <small className="text-muted">
                      Fill in the values for the template variables below. Required fields are
                      marked with *
                    </small>
                  </div>

                  <div className="variables-table">
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
                                {variable.label}
                                <span className="text-danger ms-1">*</span>
                              </div>
                              <small className="text-muted">
                                <code>{`{{${variable.name}}}`}</code>
                              </small>
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
                                  rows={2}
                                  value={variableValues[variable.name] || ''}
                                  onChange={e =>
                                    handleVariableChange(variable.name, e.target.value)
                                  }
                                  placeholder={`Enter ${variable.label.toLowerCase()}`}
                                  invalid={!!validationErrors[variable.name]}
                                  className="mb-1"
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
                                    className="mb-1"
                                  />
                                  <small className="text-muted">
                                    Supports: Direct image URLs (.jpg, .png, .gif, .webp, .svg),
                                    YouTube links
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
                                                const nextQuality =
                                                  fallbackOptions[currentIndex + 1];
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
                                  onChange={e =>
                                    handleVariableChange(variable.name, e.target.value)
                                  }
                                  placeholder={
                                    variable.type === 'url'
                                      ? 'https://example.com'
                                      : variable.type === 'number'
                                      ? 'Enter number'
                                      : `Enter ${variable.label.toLowerCase()}`
                                  }
                                  invalid={!!validationErrors[variable.name]}
                                  className="mb-1"
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
                </div>
              )}

            {/* Email Distribution Selection */}
            <FormGroup>
              <Label className="form-label">
                <FaPaperPlane className="me-2" />
                Email Distribution *
              </Label>
              <div className="distribution-segmented-control">
                <div className="segmented-control-container">
                  <button
                    type="button"
                    className={`segmented-control-button ${
                      emailDistribution === 'specific' ? 'active' : ''
                    }`}
                    onClick={() => setEmailDistribution('specific')}
                  >
                    <FaEdit className="me-2" />
                    Specific Recipients
                  </button>
                  <button
                    type="button"
                    className={`segmented-control-button ${
                      emailDistribution === 'broadcast' ? 'active' : ''
                    }`}
                    onClick={() => setEmailDistribution('broadcast')}
                  >
                    <FaPaperPlane className="me-2" />
                    Broadcast to All Subscribers
                  </button>
                </div>
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
        </CardBody>
      </Card>

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
    </div>
  );
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
