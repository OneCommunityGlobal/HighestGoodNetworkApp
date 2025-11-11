import React, { useState, useEffect, useCallback, useMemo, useRef, Suspense, lazy } from 'react';
import { connect, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
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
  Table,
  Progress,
  Card,
  CardBody,
} from 'reactstrap';
import {
  FaPaperPlane,
  FaTimes,
  FaEye,
  FaExclamationTriangle,
  FaRedo,
  FaCheckCircle,
  FaInfoCircle,
  FaSpinner,
} from 'react-icons/fa';
import { getEmailSenderConfig } from '../shared';
import { validateTemplateVariables, validateVariable, Validators } from './validation';
import {
  parseRecipients as parseRecipientsUtil,
  validateEmail as validateEmailUtil,
  buildRenderedEmailFromTemplate,
} from './utils';
import {
  fetchEmailTemplates,
  clearEmailTemplateError,
  previewEmailTemplate,
} from '../../../actions/emailTemplateActions';
import './IntegratedEmailSender.css';

// Lazy load heavy components
const LazyEditor = lazy(() =>
  import('@tinymce/tinymce-react').then(module => ({ default: module.Editor })),
);

// Memoized VariableRow component for better performance
const VariableRow = React.memo(
  ({
    variable,
    value,
    extractedValue,
    error,
    onVariableChange,
    onImageSourceChange,
    onImageLoadStatusChange,
  }) => {
    const [imgError, setImgError] = React.useState(false);
    const [qualityIndex, setQualityIndex] = React.useState(0);
    const qualities = React.useMemo(
      () => ['maxresdefault', 'hqdefault', 'mqdefault', 'default'],
      [],
    );

    React.useEffect(() => {
      setImgError(false);
      setQualityIndex(0);
    }, [value, extractedValue]);

    const youtubeId = React.useMemo(() => Validators.extractYouTubeId(value || ''), [value]);
    const computedSrc = React.useMemo(() => {
      if (youtubeId) {
        const q = qualities[Math.min(qualityIndex, qualities.length - 1)];
        return `https://img.youtube.com/vi/${youtubeId}/${q}.jpg`;
      }
      return extractedValue || value || '';
    }, [youtubeId, qualities, qualityIndex, extractedValue, value]);

    const handleImageError = useCallback(() => {
      if (youtubeId && qualityIndex < qualities.length - 1) {
        setQualityIndex(idx => idx + 1);
      } else {
        setImgError(true);
        if (onImageLoadStatusChange) {
          onImageLoadStatusChange(variable.name, false);
        }
      }
    }, [youtubeId, qualityIndex, qualities.length]);

    const handleImageLoad = useCallback(() => {
      setImgError(false);
      if (onImageLoadStatusChange) {
        onImageLoadStatusChange(variable.name, true);
      }
    }, [onImageLoadStatusChange, variable?.name]);

    return (
      <tr>
        <td>
          <div className="variable-label">
            {variable.name}
            {variable.required && <span className="text-danger ms-1">*</span>}
          </div>
        </td>
        <td>
          <Badge color="secondary" size="sm" title={`Variable type: ${variable.type}`}>
            {variable.type}
          </Badge>
        </td>
        <td>
          {variable.type === 'textarea' ? (
            <Input
              type="textarea"
              rows={3}
              value={value}
              onChange={e => onVariableChange(variable.name, e.target.value)}
              placeholder={`Enter ${variable.name.toLowerCase()}`}
              invalid={!!error}
              className="variable-input variable-textarea"
            />
          ) : variable.type === 'image' ? (
            <div>
              <Input
                type="url"
                value={value}
                onChange={e => onImageSourceChange(variable.name, e.target.value)}
                placeholder="Image URL or YouTube link"
                invalid={!!error}
                className="variable-input"
              />
              <small className="text-muted">
                Supports: Direct image URLs (.jpg, .png, .gif, .webp, .svg), YouTube links
                {extractedValue && <span className="text-success ms-1">(Auto-extracted)</span>}
              </small>
              {(value || extractedValue) && (
                <div className="mt-2">
                  <small className="text-muted d-block mb-1">Preview:</small>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {!imgError ? (
                      <img
                        key={computedSrc}
                        src={computedSrc}
                        alt="Preview"
                        style={{
                          maxWidth: '400px',
                          width: '100%',
                          height: 'auto',
                          objectFit: 'contain',
                          borderRadius: '4px',
                          border: '1px solid #dee2e6',
                        }}
                        onError={handleImageError}
                        onLoad={handleImageLoad}
                      />
                    ) : (
                      <div
                        style={{
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
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                        }}
                      >
                        <div>❌</div>
                        <div>Invalid Image</div>
                      </div>
                    )}
                    {extractedValue && (
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '2px' }}>
                          Extracted from:
                        </div>
                        <div style={{ fontSize: '11px', wordBreak: 'break-all' }}>{value}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Input
              type={variable.type === 'url' ? 'url' : variable.type}
              value={value}
              onChange={e => onVariableChange(variable.name, e.target.value)}
              placeholder={
                variable.type === 'url'
                  ? 'https://example.com'
                  : variable.type === 'number'
                  ? 'Enter number'
                  : `Enter ${variable.name.toLowerCase()}`
              }
              invalid={!!error}
              className="variable-input"
            />
          )}
          {error && <div className="invalid-feedback d-block">{error}</div>}
        </td>
      </tr>
    );
  },
);

VariableRow.displayName = 'VariableRow';

const IntegratedEmailSender = ({
  templates,
  loading,
  error,
  fetchEmailTemplates,
  clearEmailTemplateError,
  previewEmailTemplate,
  onClose,
  initialContent = '',
  initialSubject = '',
  preSelectedTemplate = null,
  initialRecipients = '',
}) => {
  const history = useHistory();
  const location = useLocation();
  const darkMode = useSelector(state => state.theme.darkMode);
  const currentUser = useSelector(state => state.auth?.user);

  // Get current mode from URL query params, default to 'template'
  const getCurrentModeFromURL = useCallback(() => {
    const urlParams = new URLSearchParams(location.search);
    const mode = urlParams.get('mode');
    return mode === 'custom' ? false : true; // Default to template mode
  }, [location.search]);

  const [useTemplate, setUseTemplate] = useState(() => {
    const urlParams = new URLSearchParams(location.search);
    const mode = urlParams.get('mode');
    return mode === 'custom' ? false : true; // Default to template mode
  });
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customContent, setCustomContent] = useState(initialContent);
  const [customSubject, setCustomSubject] = useState(initialSubject);
  const [recipients, setRecipients] = useState(initialRecipients);
  const [variableValues, setVariableValues] = useState({});
  const [emailDistribution, setEmailDistribution] = useState('specific'); // 'specific' or 'broadcast'
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [recipientList, setRecipientList] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isEditorLoaded, setIsEditorLoaded] = useState(false);
  const [editorError, setEditorError] = useState(null);
  const [showRetryOptions, setShowRetryOptions] = useState(false);
  const [lastSuccessfulLoad, setLastSuccessfulLoad] = useState(null);
  const [fullTemplateContent, setFullTemplateContent] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const [backendPreviewData, setBackendPreviewData] = useState(null);

  // Refs for performance optimization
  const abortControllerRef = useRef(null);
  const timeoutRefs = useRef([]);
  const progressIntervalRef = useRef(null);
  const editorLoadTimeoutRef = useRef(null);

  // Removed shimmer skeleton loader; using spinners/progress instead

  // Enhanced loading component with progress bar
  const EnhancedLoader = useMemo(() => {
    const LoaderComponent = ({ message = 'Loading...', progress = 0, showProgress = true }) => (
      <div className="enhanced-loader">
        <div className="d-flex align-items-center mb-3">
          <FaSpinner className="fa-spin me-2" />
          <span>{message}</span>
        </div>
        {showProgress && <Progress value={progress} className="mb-2" />}
        <small className="text-muted">Please wait while we load your content...</small>
      </div>
    );
    LoaderComponent.displayName = 'EnhancedLoader';
    return LoaderComponent;
  }, []);

  // Fallback component for failed operations
  const FallbackComponent = useMemo(() => {
    const FallbackComponentInner = ({
      title,
      message,
      onRetry,
      onDismiss,
      retryCount = 0,
      showRetryOptions = false,
    }) => (
      <Card className="fallback-card">
        <CardBody className="text-center">
          <FaExclamationTriangle className="text-warning mb-3" size={48} />
          <h5 className="text-warning">{title}</h5>
          <p className="text-muted mb-3">{message}</p>
          {retryCount > 0 && (
            <small className="text-muted d-block mb-3">Retry attempt {retryCount}</small>
          )}
          <div className="d-flex gap-2 justify-content-center">
            <Button color="primary" onClick={onRetry}>
              <FaRedo className="me-1" />
              Try Again
            </Button>
            {showRetryOptions && (
              <Button color="outline-secondary" onClick={onDismiss}>
                <FaTimes className="me-1" />
                Dismiss
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    );
    FallbackComponentInner.displayName = 'FallbackComponent';
    return FallbackComponentInner;
  }, []);

  // Simple template loading indicator (no shimmer)
  const TemplateSelectLoader = useMemo(() => {
    const TemplateLoaderComponent = () => (
      <div className="template-loading-simple d-flex align-items-center" style={{ gap: '8px' }}>
        <FaSpinner className="fa-spin" />
        <span>Loading templates...</span>
      </div>
    );
    TemplateLoaderComponent.displayName = 'TemplateSelectLoader';
    return TemplateLoaderComponent;
  }, []);

  // Removed unused VariablesLoader
  // VariablesLoader is currently unused; kept minimal UI in place if needed later

  // Memoized URL update function
  const updateModeURL = useCallback(
    isTemplateMode => {
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
    },
    [location.search, location.pathname, history],
  );

  // Handle mode change with cleanup
  const handleModeChange = useCallback(
    isTemplateMode => {
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Clear all timeouts
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
      timeoutRefs.current = [];

      // Reset all states when changing modes
      resetAllStates();
      setUseTemplate(isTemplateMode);
      updateModeURL(isTemplateMode);
    },
    [updateModeURL],
  );

  // Complete state reset function with cleanup
  const resetAllStates = useCallback(() => {
    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear all timeouts
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current = [];

    setSelectedTemplate(null);
    setFullTemplateContent(null);
    setCustomContent('');
    setCustomSubject('');
    setRecipients('');
    setVariableValues({});
    setEmailDistribution('specific');
    setShowPreviewModal(false);
    setValidationErrors({});
    setRecipientList([]);
    setApiError(null);
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  // Update useTemplate when URL changes (e.g., browser back/forward)
  useEffect(() => {
    const newMode = getCurrentModeFromURL();
    if (newMode !== useTemplate) {
      // Always reset all states when switching modes
      resetAllStates();
      setUseTemplate(newMode);
    }
  }, [location.search, useTemplate, resetAllStates]);

  // Enhanced template fetching with progress tracking
  useEffect(() => {
    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    const fetchTemplatesWithProgress = async () => {
      try {
        setLoadingProgress(0);
        setApiError(null);
        setShowRetryOptions(false);

        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setLoadingProgress(prev => {
            if (prev >= 90) return prev;
            return prev + Math.random() * 15;
          });
        }, 200);

        progressIntervalRef.current = progressInterval;

        await fetchEmailTemplates({
          search: '',
          // no pagination for dropdown; fetch all
          sortBy: 'updated_at',
          sortOrder: 'desc',
          includeEmailContent: true,
        });

        setLoadingProgress(100);
        setLastSuccessfulLoad(new Date());
        clearInterval(progressInterval);

        // Reset progress after success
        setTimeout(() => setLoadingProgress(0), 1000);
      } catch (error) {
        if (error.name !== 'AbortError') {
          // console.error('Failed to fetch templates:', error);
          setApiError('Failed to load templates. Please try again.');
          setShowRetryOptions(true);
          clearInterval(progressIntervalRef.current);
        }
      }
    };

    fetchTemplatesWithProgress();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [fetchEmailTemplates]);

  // Handle preSelectedTemplate
  useEffect(() => {
    if (preSelectedTemplate && templates && templates.length > 0) {
      setUseTemplate(true);
      setSelectedTemplate(preSelectedTemplate);
      // Initialize variable values directly to avoid dependency issues
      const initialValues = {};
      if (
        preSelectedTemplate &&
        preSelectedTemplate.variables &&
        Array.isArray(preSelectedTemplate.variables)
      ) {
        preSelectedTemplate.variables.forEach(variable => {
          if (variable && variable.name) {
            initialValues[variable.name] = '';
          }
        });
      }
      setVariableValues(initialValues);
    }
  }, [preSelectedTemplate, templates]);

  // Removed auto-clear of errors - errors should persist until manually handled
  // Email sent handling removed - emails are now sent via emailController endpoints
  // Success/error handling is done in confirmSendEmail callback

  // Cleanup effect to reset states when component unmounts
  useEffect(() => {
    return () => {
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Clear all timeouts
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
      timeoutRefs.current = [];

      // Clear everything when exiting email sender
      resetAllStates();
    };
  }, [resetAllStates]);

  // Enhanced retry mechanism with exponential backoff
  const handleRetry = useCallback(async () => {
    if (isRetrying) return; // Prevent multiple simultaneous retries

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    setApiError(null);
    setLoadingProgress(0);
    setShowRetryOptions(false);

    toast.info(`Retrying to load templates... (Attempt ${retryCount + 1})`, {
      autoClose: 3000,
    });

    try {
      // Cancel previous request if any
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      // Progress tracking for retry
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 150);

      progressIntervalRef.current = progressInterval;

      await fetchEmailTemplates({
        search: '',
        // no pagination for dropdown; fetch all
        sortBy: 'created_at',
        sortOrder: 'desc',
        includeVariables: true,
      });

      clearInterval(progressInterval);
      setLoadingProgress(100);
      setLastSuccessfulLoad(new Date());
      clearEmailTemplateError();
      setShowRetryOptions(false);

      toast.success('Templates loaded successfully!', {
        icon: <FaCheckCircle />,
        autoClose: 2000,
      });

      // Reset retry count on success
      setRetryCount(0);
    } catch (err) {
      if (err.name !== 'AbortError') {
        // console.error('Retry failed:', err);
        const errorMessage = `Retry failed: ${err.message || 'Unknown error'}`;

        setApiError(errorMessage);
        setShowRetryOptions(true);

        toast.error(errorMessage, {
          autoClose: 5000,
        });
      }
    } finally {
      setIsRetrying(false);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }
  }, [fetchEmailTemplates, clearEmailTemplateError, isRetrying, retryCount]);

  const clearError = useCallback(() => {
    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setApiError(null);
    setRetryCount(0);
    setIsRetrying(false);
    clearEmailTemplateError();
  }, [clearEmailTemplateError]);

  // Show toast notifications for errors from Redux
  useEffect(() => {
    if (error) {
      toast.error(`Error: ${error}`, {
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
    }
  }, [error]);

  const initializeVariableValues = useCallback(template => {
    const initialValues = {};
    if (template && template.variables && Array.isArray(template.variables)) {
      template.variables.forEach(variable => {
        if (variable && variable.name) {
          initialValues[variable.name] = '';
        }
      });
    }
    setVariableValues(initialValues);
  }, []);

  // Function to fetch full template content
  // Backend returns: { success: true, template: {...} }
  const fetchFullTemplateContent = useCallback(async templateId => {
    try {
      const response = await axios.get(ENDPOINTS.EMAIL_TEMPLATE_BY_ID(templateId));

      if (response.data.success && response.data.template) {
        setFullTemplateContent(response.data.template);
        return response.data.template;
      } else {
        throw new Error(response.data.message || 'Template not found');
      }
    } catch (error) {
      // console.error('Failed to fetch full template content:', error);
      setFullTemplateContent(null);
      throw error;
    }
  }, []);

  const handleTemplateSelect = useCallback(
    async template => {
      // Clear all previous state first
      setVariableValues({});
      setValidationErrors({});
      setShowPreviewModal(false);
      setFullTemplateContent(null);

      if (!template) {
        setSelectedTemplate(null);
        return;
      }

      // Check if template has full data (variables, html_content, subject)
      // This is set when includeEmailContent=true is passed to fetchEmailTemplates
      const hasFullData =
        Array.isArray(template.variables) && (template.html_content || template.subject);

      if (!hasFullData) {
        // Fallback: fetch full template data if only basic data was loaded
        try {
          const fullTemplate = await fetchFullTemplateContent(template._id);
          if (fullTemplate) {
            setSelectedTemplate(fullTemplate);
            initializeVariableValues(fullTemplate);
            setFullTemplateContent(fullTemplate);
          }
        } catch (error) {
          console.error('Failed to fetch full template data:', error);
          // Continue with the template we have
          setSelectedTemplate(template);
          initializeVariableValues(template);
        }
      } else {
        // Template already has full data, no additional API call needed
        setSelectedTemplate(template);
        initializeVariableValues(template);
        setFullTemplateContent(template);
      }
    },
    [initializeVariableValues, fetchFullTemplateContent],
  );

  const handleVariableChange = useCallback(
    (variableName, value) => {
      setVariableValues(prevValues => {
        const nextValues = { ...prevValues, [variableName]: value };

        // Live validate only the changed variable when a template is selected
        if (selectedTemplate) {
          const variableMeta = selectedTemplate.variables?.find(v => v?.name === variableName);
          if (variableMeta) {
            const errorMsg = validateVariable(variableMeta, nextValues);
            setValidationErrors(prevErrs => ({ ...prevErrs, [variableName]: errorMsg }));
          }
        }

        return nextValues;
      });
    },
    [selectedTemplate],
  );

  const parseRecipients = useCallback(recipientText => parseRecipientsUtil(recipientText), []);

  // Memoized function to extract image from various sources with proper sizing
  const extractImageFromSource = useCallback(Validators.extractImageFromSource, []);

  // Memoized handle image source change with automatic extraction
  const handleImageSourceChange = useCallback(
    (variableName, source) => {
      const extractedImage = extractImageFromSource(source);

      setVariableValues(prevValues => {
        const nextValues = {
          ...prevValues,
          [variableName]: source,
          [`${variableName}_extracted`]: extractedImage || '',
        };

        if (selectedTemplate) {
          const variableMeta = selectedTemplate.variables?.find(v => v?.name === variableName);
          if (variableMeta) {
            const errorMsg = validateVariable(variableMeta, nextValues);
            setValidationErrors(prevErrs => ({ ...prevErrs, [variableName]: errorMsg }));
          }
        }

        return nextValues;
      });
    },
    [extractImageFromSource, selectedTemplate],
  );

  // Removed unused YouTube thumbnail fallback helper

  const validateEmail = useCallback(email => validateEmailUtil(email), []);

  const validateForm = useCallback(() => {
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
        if (recipientEmails.length === 0) {
          errors.recipients = 'Please enter at least one valid email address';
        } else {
          const invalidEmails = recipientEmails.filter(email => !validateEmail(email));
          if (invalidEmails.length > 0) {
            errors.recipients = `Invalid email addresses: ${invalidEmails.join(', ')}`;
          }
          setRecipientList(recipientEmails);
        }
      }
    } else {
      setRecipientList([]);
    }

    // Validate template variables (type-aware, honors required flag)
    if (useTemplate && selectedTemplate) {
      const varErrors = validateTemplateVariables(selectedTemplate, variableValues);
      Object.assign(errors, varErrors);
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [
    useTemplate,
    selectedTemplate,
    customContent,
    customSubject,
    emailDistribution,
    recipients,
    parseRecipients,
    validateEmail,
    variableValues,
  ]);

  // Separate validation for preview (doesn't require recipients)
  const validateForPreview = useCallback(() => {
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

    // Validate variables as in submit (recipients are skipped for preview)
    if (useTemplate && selectedTemplate) {
      const varErrors = validateTemplateVariables(selectedTemplate, variableValues);
      Object.assign(errors, varErrors);
    }

    // Don't validate recipients for preview
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [useTemplate, selectedTemplate, customContent, customSubject, variableValues]);

  // Get preview content - use backend API if template is selected, otherwise client-side
  const getPreviewContent = useCallback(() => {
    // For custom emails, use client-side content
    if (!useTemplate || !selectedTemplate) {
      return { subject: customSubject, content: customContent };
    }

    // If backend preview data is available, use it
    if (backendPreviewData) {
      return {
        subject: backendPreviewData.subject || customSubject,
        content: backendPreviewData.htmlContent || backendPreviewData.html_content || customContent,
      };
    }

    // Fallback to client-side rendering if backend preview is not available
    const templateData = fullTemplateContent || selectedTemplate;
    return buildRenderedEmailFromTemplate(templateData, variableValues);
  }, [
    useTemplate,
    selectedTemplate,
    fullTemplateContent,
    variableValues,
    customSubject,
    customContent,
    backendPreviewData,
  ]);

  // Handle preview with backend API for templates
  const handlePreview = useCallback(async () => {
    if (!validateForPreview()) {
      toast.warning('Please fix validation errors before previewing', {
        autoClose: 3000,
      });
      return;
    }

    // For custom emails, just show preview modal
    if (!useTemplate || !selectedTemplate) {
      setShowPreviewModal(true);
      return;
    }

    // For templates, try to use backend API if template has an ID
    if (selectedTemplate._id) {
      setPreviewLoading(true);
      setPreviewError(null);
      setBackendPreviewData(null);

      try {
        const preview = await previewEmailTemplate(selectedTemplate._id, variableValues);
        setBackendPreviewData(preview);
        setShowPreviewModal(true);
      } catch (error) {
        // If backend preview fails, fallback to client-side preview
        setPreviewError(error.message || 'Failed to preview template');
        toast.warning('Preview failed, using basic preview', {
          position: 'top-right',
          autoClose: 3000,
        });
        // Clear backend preview data to use client-side fallback
        setBackendPreviewData(null);
        setShowPreviewModal(true);
      } finally {
        setPreviewLoading(false);
      }
    } else {
      // Template doesn't have an ID, use client-side preview
      setShowPreviewModal(true);
    }
  }, [useTemplate, selectedTemplate, variableValues, validateForPreview, previewEmailTemplate]);

  // Handle send email - opens preview modal which also allows sending
  const handleSendEmail = useCallback(() => {
    if (!validateForm()) {
      return;
    }
    // Open preview modal - user can review and send from there
    handlePreview();
  }, [validateForm, handlePreview]);

  // Send email from preview modal
  const handleSendFromPreview = useCallback(async () => {
    setIsSending(true);

    try {
      if (useTemplate && selectedTemplate) {
        // Use full template content if available for sending
        const templateData = fullTemplateContent || selectedTemplate;

        // Replace image variables with extracted images if available
        const processedVariableValues = { ...variableValues };
        if (templateData.variables && Array.isArray(templateData.variables)) {
          templateData.variables.forEach(variable => {
            if (
              variable.type === 'image' &&
              processedVariableValues[`${variable.name}_extracted`]
            ) {
              processedVariableValues[variable.name] =
                processedVariableValues[`${variable.name}_extracted`];
            }
          });
        }

        // Render template locally and send via emailController endpoints
        const rendered = getPreviewContent();
        const payload =
          emailDistribution === 'broadcast'
            ? {
                subject: rendered.subject,
                html: rendered.content,
              }
            : {
                to: recipientList,
                subject: rendered.subject,
                html: rendered.content,
              };

        // Get current user for requestor (required by backend)
        if (!currentUser || !currentUser.userid) {
          throw new Error('User authentication required to send emails');
        }

        const requestor = {
          requestorId: currentUser.userid,
          email: currentUser.email,
          role: currentUser.role,
        };

        // Add requestor to payload
        const payloadWithRequestor = {
          ...payload,
          requestor,
        };

        if (emailDistribution === 'broadcast') {
          await axios.post(ENDPOINTS.BROADCAST_EMAILS, payloadWithRequestor);
        } else {
          await axios.post(ENDPOINTS.POST_EMAILS, payloadWithRequestor);
        }
        const recipientCount =
          emailDistribution === 'broadcast'
            ? 'all subscribers'
            : `${recipientList.length} recipient(s)`;
        toast.success(`Email created successfully for ${recipientCount}. Processing started.`);
        // Close preview modal after successful send
        setShowPreviewModal(false);
        setBackendPreviewData(null);
        setPreviewError(null);
        resetAllStates();
      } else {
        // Send custom email
        // Get current user for requestor (required by backend)
        if (!currentUser || !currentUser.userid) {
          throw new Error('User authentication required to send emails');
        }

        const requestor = {
          requestorId: currentUser.userid,
          email: currentUser.email,
          role: currentUser.role,
        };

        if (emailDistribution === 'broadcast') {
          // Use existing broadcast functionality for custom emails
          await axios.post(ENDPOINTS.BROADCAST_EMAILS, {
            subject: customSubject,
            html: customContent,
            requestor,
          });
        } else {
          // Use existing send email functionality for specific recipients
          await axios.post(ENDPOINTS.POST_EMAILS, {
            to: recipientList,
            subject: customSubject,
            html: customContent,
            requestor,
          });
        }

        // Show success message
        const recipientCount =
          emailDistribution === 'broadcast'
            ? 'all subscribers'
            : `${recipientList.length} recipient(s)`;
        toast.success(`Email created successfully for ${recipientCount}. Processing started.`);
        // Close preview modal after successful send
        setShowPreviewModal(false);
        setBackendPreviewData(null);
        setPreviewError(null);
        resetAllStates();
      }
    } catch (error) {
      // console.error('Email sending failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      toast.error(`Failed to send email: ${errorMessage}`);
      setValidationErrors({ general: errorMessage });
    } finally {
      setIsSending(false);
    }
  }, [
    useTemplate,
    selectedTemplate,
    variableValues,
    fullTemplateContent,
    getPreviewContent,
    emailDistribution,
    recipientList,
    customSubject,
    customContent,
    resetAllStates,
    currentUser,
  ]);

  // Memoized TinyMCE configuration for performance
  const TINY_MCE_INIT_OPTIONS = useMemo(() => getEmailSenderConfig(darkMode), [darkMode]);

  // Clear backend preview data when variables or template change (to force fresh preview)
  useEffect(() => {
    setBackendPreviewData(null);
    setPreviewError(null);
  }, [variableValues, selectedTemplate?._id]);

  // Memoized preview content to prevent unnecessary re-renders
  const previewContent = useMemo(() => getPreviewContent(), [getPreviewContent]);

  // Enhanced error boundary for component errors
  const [componentError, setComponentError] = useState(null);

  // Error boundary effect
  useEffect(() => {
    const handleError = error => {
      // console.error('Component error:', error);
      setComponentError(error.message);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Reset component error when switching modes
  useEffect(() => {
    if (componentError) {
      setComponentError(null);
    }
  }, [useTemplate]);

  // Show error boundary if component error occurs
  if (componentError) {
    return (
      <div className={`email-sender ${darkMode ? 'dark-mode' : 'light-mode'}`}>
        <div className="page-title-container mb-3">
          <h2 className="page-title">Send Email</h2>
        </div>
        <Alert color="danger" className="d-flex align-items-center">
          <FaExclamationTriangle className="me-2" />
          <div>
            <strong>Component Error</strong>
            <br />
            <small>{componentError}</small>
            <div className="mt-2">
              <Button
                color="outline-primary"
                size="sm"
                onClick={() => {
                  setComponentError(null);
                  window.location.reload();
                }}
              >
                <FaRedo className="me-1" />
                Reload Component
              </Button>
            </div>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`email-sender ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      {/* Page Title */}
      <div className="page-title-container mb-3">
        <h2 className="page-title">Send Email</h2>
      </div>

      <div className="email-controls-container mb-3">
        <div className="email-controls-row">
          {/* Email Mode Selector */}
          <div className="mode-buttons" role="group" aria-label="Email composition mode">
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

          <div className="action-buttons">
            <Button
              color="primary"
              onClick={handleSendEmail}
              disabled={
                previewLoading ||
                isSending ||
                isRetrying ||
                (useTemplate &&
                  selectedTemplate &&
                  Object.keys(validationErrors).some(key =>
                    selectedTemplate?.variables?.some(
                      v => v?.name === key && !!validationErrors[key],
                    ),
                  )) ||
                (!useTemplate && !customContent) ||
                (useTemplate && !selectedTemplate)
              }
              aria-label="Preview and send email"
              title="Preview and send email"
            >
              {previewLoading ? (
                <>
                  <FaSpinner className="fa-spin me-1" />
                  Loading Preview...
                </>
              ) : (
                <>
                  <FaEye className="me-1" />
                  Preview & Send
                </>
              )}
            </Button>
            {onClose && (
              <Button color="secondary" onClick={onClose}>
                <FaTimes className="me-1" />
                Close
              </Button>
            )}
          </div>
        </div>
      </div>

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
            {loading ? (
              <TemplateSelectLoader />
            ) : error || apiError || (templates && templates.length === 0) ? (
              <div className="template-selection-container">
                <Input type="select" value="" disabled className="template-select-disabled">
                  <option>Please select a template</option>
                </Input>

                {/* Simple Error Message */}
                <div className="template-error-message">
                  <FaExclamationTriangle className="error-icon" />
                  <span className="error-text">
                    {error || apiError
                      ? 'Error loading templates. Please try again.'
                      : 'No templates available. Please create a template first.'}
                  </span>
                </div>

                {/* Simple Retry Option - Only show for actual errors */}
                {(error || apiError) && (
                  <div className="template-retry-simple">
                    <Button
                      color="outline-primary"
                      size="sm"
                      onClick={handleRetry}
                      disabled={isRetrying}
                      className="retry-btn-simple"
                    >
                      {isRetrying ? (
                        <>
                          <Spinner size="sm" className="me-1" />
                          Retrying...
                        </>
                      ) : (
                        <>
                          <FaRedo className="me-1" />
                          Try Again
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="template-selection-container">
                <Input
                  type="select"
                  value={selectedTemplate?._id || ''}
                  onChange={e => {
                    const template = templates.find(t => t._id === e.target.value);
                    handleTemplateSelect(template);
                  }}
                  invalid={!!validationErrors.template}
                  className="template-select"
                >
                  <option value="">Choose a template...</option>
                  {templates && templates.length > 0 ? (
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
                        {template.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>No templates available</option>
                  )}
                </Input>

                {templates && templates.length > 0 && (
                  <div className="template-info mt-2 ml-1">
                    <small className="text-muted">
                      {templates.length} template{templates.length !== 1 ? 's' : ''} available
                      {lastSuccessfulLoad && (
                        <span className="ms-2 text-success">
                          • Last updated: {lastSuccessfulLoad.toLocaleTimeString()}
                        </span>
                      )}
                      {isRetrying && <span className="ms-2 text-warning">• Retrying...</span>}
                    </small>
                  </div>
                )}
              </div>
            )}

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
              <div className="editor-container">
                {!isEditorLoaded && !editorError && (
                  <div
                    className="editor-loading d-flex align-items-center justify-content-center py-3"
                    style={{ gap: '8px' }}
                  >
                    <Spinner size="sm" />
                    <span>Loading editor...</span>
                  </div>
                )}

                {editorError && (
                  <FallbackComponent
                    title="Editor Failed to Load"
                    message="The rich text editor couldn't load. You can still use the basic text area below."
                    onRetry={() => {
                      setEditorError(null);
                      setIsEditorLoaded(false);
                      setLoadingProgress(0);
                    }}
                    onDismiss={() => setEditorError(null)}
                    retryCount={retryCount}
                    showRetryOptions={true}
                  />
                )}

                <Suspense
                  fallback={
                    <div
                      className="editor-suspense d-flex align-items-center justify-content-center py-3"
                      style={{ gap: '8px' }}
                    >
                      <Spinner size="sm" />
                      <span>Loading editor...</span>
                    </div>
                  }
                >
                  {!editorError && (
                    <LazyEditor
                      key={`custom-editor-${darkMode ? 'dark' : 'light'}`}
                      tinymceScriptSrc="/tinymce/tinymce.min.js"
                      value={customContent}
                      onEditorChange={setCustomContent}
                      init={{
                        ...TINY_MCE_INIT_OPTIONS,
                        setup: editor => {
                          // Track editor loading
                          editor.on('init', () => {
                            setIsEditorLoaded(true);
                            setLoadingProgress(100);
                          });

                          // Handle editor errors
                          editor.on('error', e => {
                            // console.error('Editor error:', e);
                            setEditorError('Editor encountered an error');
                            setIsEditorLoaded(false);
                          });

                          // Set timeout for editor loading
                          editorLoadTimeoutRef.current = setTimeout(() => {
                            if (!isEditorLoaded) {
                              setEditorError('Editor is taking too long to load');
                              setIsEditorLoaded(false);
                            }
                          }, 10000); // 10 second timeout
                        },
                      }}
                      onLoadContent={() => {
                        clearTimeout(editorLoadTimeoutRef.current);
                        setIsEditorLoaded(true);
                      }}
                    />
                  )}
                </Suspense>

                {/* Fallback textarea if editor fails */}
                {editorError && (
                  <div className="editor-fallback mt-3">
                    <Label className="text-warning">
                      <FaInfoCircle className="me-1" />
                      Using basic text editor (rich editor unavailable)
                    </Label>
                    <Input
                      type="textarea"
                      rows={10}
                      value={customContent}
                      onChange={e => setCustomContent(e.target.value)}
                      placeholder="Enter your email content here..."
                      className="mt-2"
                    />
                  </div>
                )}
              </div>

              {validationErrors.customContent && (
                <div className="text-danger mt-1">{validationErrors.customContent}</div>
              )}
            </FormGroup>
          </>
        )}

        {/* Variable Values (if using template with variables) */}
        {useTemplate && selectedTemplate && (
          <div className="template-variables">
            <div className="variables-header">
              <h6 className="mb-1">
                Template Variables
                <Badge color="info" className="ml-2 ms-2">
                  {selectedTemplate.variables ? selectedTemplate.variables.length : 0} variable
                  {selectedTemplate.variables && selectedTemplate.variables.length !== 1 ? 's' : ''}
                </Badge>
              </h6>
            </div>

            {selectedTemplate.variables && selectedTemplate.variables.length > 0 ? (
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
                    <VariableRow
                      key={variable.name}
                      variable={variable}
                      value={variableValues[variable.name] || ''}
                      extractedValue={variableValues[`${variable.name}_extracted`] || ''}
                      error={validationErrors[variable.name]}
                      onVariableChange={handleVariableChange}
                      onImageSourceChange={handleImageSourceChange}
                      onImageLoadStatusChange={(name, ok) => {
                        setValidationErrors(prev => ({
                          ...prev,
                          [name]: ok
                            ? null
                            : `${name} is required (valid image URL or YouTube link)`,
                        }));
                      }}
                    />
                  ))}
                </tbody>
              </Table>
            ) : (
              <div className="empty-variables-state text-center py-4">
                <div className="text-muted">
                  <i className="fas fa-info-circle me-2"></i>
                  No variables defined for this template.
                </div>
                <small className="text-muted d-block mt-2">
                  This template doesn&apos;t require any variable inputs.
                </small>
              </div>
            )}
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
                onChange={() => {
                  setEmailDistribution('broadcast');
                  setValidationErrors(prev => ({ ...prev, recipients: null }));
                  setRecipientList([]);
                }}
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
                onChange={e => {
                  const val = e.target.value;
                  setRecipients(val);
                  // Live validate recipients when specific distribution selected
                  if (emailDistribution === 'specific') {
                    const emails = parseRecipients(val);
                    let errorMsg = null;
                    if (!val.trim()) {
                      errorMsg = 'Please enter at least one recipient';
                    } else if (emails.length === 0) {
                      errorMsg = 'Please enter at least one valid email address';
                    } else {
                      const invalid = emails.filter(email => !validateEmail(email));
                      if (invalid.length > 0) {
                        errorMsg = `Invalid email addresses: ${invalid.join(', ')}`;
                      }
                    }
                    setValidationErrors(prev => ({ ...prev, recipients: errorMsg }));
                    setRecipientList(errorMsg ? [] : emails);
                  }
                }}
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

      {/* Preview & Send Modal - Light Mode Only */}
      <Modal
        isOpen={showPreviewModal}
        toggle={() => {
          if (!isSending) {
            setShowPreviewModal(false);
            setBackendPreviewData(null);
            setPreviewError(null);
          }
        }}
        size="lg"
        centered
        backdrop={isSending ? 'static' : true}
        keyboard={!isSending}
      >
        <ModalHeader
          toggle={() => {
            if (!isSending) {
              setShowPreviewModal(false);
              setBackendPreviewData(null);
              setPreviewError(null);
            }
          }}
        >
          {previewLoading ? (
            <>
              <FaSpinner className="fa-spin me-2" />
              Loading Preview...
            </>
          ) : isSending ? (
            <>
              <FaSpinner className="fa-spin me-2" />
              Sending Email...
            </>
          ) : (
            'Preview & Send Email'
          )}
        </ModalHeader>
        <ModalBody>
          {previewLoading ? (
            <div className="text-center">
              <FaSpinner className="fa-spin me-2" />
              <div className="mt-2">Loading email preview...</div>
            </div>
          ) : (
            <>
              {previewError && (
                <Alert color="warning" className="mb-3">
                  <FaExclamationTriangle className="me-2" />
                  {previewError}
                  {useTemplate &&
                    selectedTemplate &&
                    !selectedTemplate._id &&
                    ' (Using client-side preview)'}
                </Alert>
              )}

              <div className="mb-3">
                <strong>Subject:</strong> {previewContent.subject || 'No subject'}
              </div>

              <div className="mb-3">
                <strong>Distribution:</strong>{' '}
                {emailDistribution === 'broadcast' ? (
                  <>
                    <Badge color="primary" className="me-2">
                      Broadcast
                    </Badge>
                    All subscribed users
                  </>
                ) : (
                  <>
                    <Badge color="secondary" className="me-2">
                      Specific
                    </Badge>
                    {parseRecipients(recipients).length} recipient(s)
                    {parseRecipients(recipients).length > 0 &&
                      parseRecipients(recipients).length <= 5 && (
                        <div className="mt-2">
                          <small className="text-muted d-block">Recipients:</small>
                          <small className="text-break">
                            {parseRecipients(recipients).join(', ')}
                          </small>
                        </div>
                      )}
                  </>
                )}
              </div>

              {useTemplate && selectedTemplate && backendPreviewData && (
                <div className="mb-3">
                  <Badge color="success" className="d-inline-flex align-items-center">
                    <FaCheckCircle className="me-1" />
                    Server-rendered preview
                  </Badge>
                  <small className="text-muted ms-2">
                    This preview matches exactly what will be sent
                  </small>
                </div>
              )}

              {previewContent.content ? (
                <div className="mb-3">
                  <strong>Content Preview:</strong>
                  <div
                    className="mt-2 p-3 border rounded"
                    style={{ maxHeight: '400px', overflow: 'auto' }}
                    dangerouslySetInnerHTML={{ __html: previewContent.content }}
                  />
                </div>
              ) : (
                <div className="mb-3">
                  <strong>Content Preview:</strong>
                  <div className="mt-2 p-3 border rounded text-center text-muted">
                    <FaInfoCircle className="me-2" />
                    No content available for preview.
                    {useTemplate
                      ? ' Please fill in all template variables.'
                      : ' Please add some content to your email.'}
                  </div>
                </div>
              )}

              <Alert color="warning" className="mb-0">
                <FaExclamationTriangle className="me-2" />
                <strong>Please review your email carefully.</strong> Once sent, this action cannot
                be undone. The email will be processed immediately.
              </Alert>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            color="secondary"
            onClick={() => {
              setShowPreviewModal(false);
              setBackendPreviewData(null);
              setPreviewError(null);
            }}
            disabled={isSending || previewLoading}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={handleSendFromPreview}
            disabled={isSending || previewLoading || !previewContent.content}
          >
            {isSending ? (
              <>
                <FaSpinner className="fa-spin me-2" />
                Sending...
              </>
            ) : (
              <>
                <FaPaperPlane className="me-2" />
                Send Email
              </>
            )}
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
  // sendingEmail and emailSent removed - emails are now sent via emailController endpoints
  // Redux actions
  fetchEmailTemplates: PropTypes.func.isRequired,
  // removed sendEmailWithTemplate; template emails are rendered client-side and sent via emailController
  clearEmailTemplateError: PropTypes.func.isRequired,
  previewEmailTemplate: PropTypes.func,
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
  // sendingEmail and emailSent removed - emails are now sent via emailController endpoints
});

const mapDispatchToProps = {
  fetchEmailTemplates,
  clearEmailTemplateError,
  previewEmailTemplate,
};

export default connect(mapStateToProps, mapDispatchToProps)(IntegratedEmailSender);
