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
import { Editor } from '@tinymce/tinymce-react';
import { getEmailSenderConfig } from '../shared';
import {
  fetchEmailTemplates,
  sendEmailWithTemplate,
  clearEmailTemplateError,
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
    getYouTubeThumbnailWithFallback,
  }) => {
    const handleImageError = useCallback(e => {
      // Try fallback thumbnails for YouTube videos
      const currentSrc = e.target.src;
      const youtubeMatch = currentSrc.match(/img\.youtube\.com\/vi\/([^\/]+)\/([^\/]+)\.jpg/);

      if (youtubeMatch) {
        const videoId = youtubeMatch[1];
        const currentQuality = youtubeMatch[2];

        // Try next quality level
        const fallbackOptions = ['hqdefault', 'mqdefault', 'default'];
        const currentIndex = fallbackOptions.indexOf(currentQuality);

        if (currentIndex < fallbackOptions.length - 1) {
          const nextQuality = fallbackOptions[currentIndex + 1];
          e.target.src = `https://img.youtube.com/vi/${videoId}/${nextQuality}.jpg`;
          return;
        }
      }

      // If all fallbacks fail, show error
      e.target.style.display = 'none';
      e.target.nextSibling.style.display = 'flex';
    }, []);

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
                    <img
                      src={extractedValue || value}
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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isEditorLoaded, setIsEditorLoaded] = useState(false);
  const [editorError, setEditorError] = useState(null);
  const [showRetryOptions, setShowRetryOptions] = useState(false);
  const [lastSuccessfulLoad, setLastSuccessfulLoad] = useState(null);
  const [customSendingEmail, setCustomSendingEmail] = useState(false);
  const [fullTemplateContent, setFullTemplateContent] = useState(null);

  // Refs for performance optimization
  const abortControllerRef = useRef(null);
  const timeoutRefs = useRef([]);
  const progressIntervalRef = useRef(null);
  const editorLoadTimeoutRef = useRef(null);

  // Enhanced skeleton loading component with progress
  const SkeletonLoader = useMemo(() => {
    const SkeletonComponent = ({
      width = '100%',
      height = '20px',
      className = '',
      count = 1,
      animated = true,
    }) => (
      <>
        {Array.from({ length: count }, (_, index) => (
          <div
            key={index}
            className={`skeleton-loader ${animated ? 'skeleton-animated' : ''} ${className}`}
            style={{
              width,
              height,
              marginBottom: count > 1 ? '0.5rem' : '0',
              animationDelay: `${index * 0.1}s`,
            }}
          />
        ))}
      </>
    );
    SkeletonComponent.displayName = 'SkeletonLoader';
    return SkeletonComponent;
  }, []);

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

  // Enhanced template loading with progress
  const TemplateSelectLoader = useMemo(() => {
    const TemplateLoaderComponent = () => (
      <div className="template-shimmer-container">
        <div className="shimmer-select-wrapper">
          <div className="shimmer-select shimmer-animated"></div>
        </div>
        <div className="shimmer-info">
          <div className="shimmer-line shimmer-animated"></div>
          <div className="shimmer-line shimmer-animated shimmer-short"></div>
        </div>
      </div>
    );
    TemplateLoaderComponent.displayName = 'TemplateSelectLoader';
    return TemplateLoaderComponent;
  }, []);

  // Memoized loading state for template variables
  const VariablesLoader = useMemo(() => {
    const VariablesLoaderComponent = () => (
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
    VariablesLoaderComponent.displayName = 'VariablesLoader';
    return VariablesLoaderComponent;
  }, [SkeletonLoader]);

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
    setCustomSendingEmail(false);
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
          page: 1,
          sortBy: 'created_at',
          sortOrder: 'desc',
          includeVariables: true,
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

  useEffect(() => {
    if (emailSent) {
      const timer = setTimeout(() => {
        clearEmailTemplateError();
        // Clear everything when email is sent successfully
        resetAllStates();
        if (onClose) {
          onClose();
        }
      }, 3000); // Reduced from 5000ms for better UX

      // Store timeout ref for cleanup
      timeoutRefs.current.push(timer);

      return () => clearTimeout(timer);
    }
  }, [emailSent, clearEmailTemplateError, onClose, resetAllStates]);

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
        page: 1,
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
  const fetchFullTemplateContent = useCallback(async templateId => {
    try {
      const response = await axios.get(ENDPOINTS.EMAIL_TEMPLATE_BY_ID(templateId));
      // console.log('Full template content fetched:', response.data);

      // Extract template data from the response structure
      const templateData = response.data.success ? response.data.template : response.data;
      // console.log('Extracted template data:', templateData);

      setFullTemplateContent(templateData);
      return templateData;
    } catch (error) {
      // console.error('Failed to fetch full template content:', error);
      setFullTemplateContent(null);
      return null;
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

      // Template already has full data including variables from includeVariables: true
      setSelectedTemplate(template);
      initializeVariableValues(template);

      // Fetch full template content for preview
      await fetchFullTemplateContent(template._id);
    },
    [initializeVariableValues, fetchFullTemplateContent],
  );

  const handleVariableChange = useCallback((variableName, value) => {
    // Sanitize input to prevent XSS
    const sanitizedValue = typeof value === 'string' ? value.trim() : value;

    setVariableValues(prev => ({
      ...prev,
      [variableName]: sanitizedValue,
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
    if (!recipientText || typeof recipientText !== 'string') {
      return [];
    }
    return recipientText
      .split(/[,;\n]/)
      .map(email => email.trim())
      .filter(email => email.length > 0 && email.includes('@'));
  }, []);

  // Memoized function to extract image from various sources with proper sizing
  const extractImageFromSource = useCallback(source => {
    if (!source || typeof source !== 'string') return null;

    // Check if it's already a direct image URL
    if (source.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i)) {
      return source;
    }

    // YouTube thumbnail extraction with multiple quality options
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const youtubeMatch = source.match(youtubeRegex);
    if (youtubeMatch) {
      const videoId = youtubeMatch[1];

      // Validate video ID to prevent XSS
      if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        return null;
      }

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
  }, []);

  // Memoized handle image source change with automatic extraction
  const handleImageSourceChange = useCallback(
    (variableName, source) => {
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
    },
    [extractImageFromSource, validationErrors],
  );

  // Memoized function to get YouTube thumbnail with fallback
  const getYouTubeThumbnailWithFallback = useCallback(videoId => {
    // Validate video ID to prevent XSS
    if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return [];
    }

    const thumbnailOptions = [
      `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, // 1280x720 - best quality
      `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, // 480x360 - high quality
      `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`, // 320x180 - medium quality
      `https://img.youtube.com/vi/${videoId}/default.jpg`, // 120x90 - default
    ];

    return thumbnailOptions;
  }, []);

  const validateEmail = useCallback(email => {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }, []);

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

    // Validate all variables for templates (all are required by default)
    if (useTemplate && selectedTemplate && selectedTemplate.variables) {
      selectedTemplate.variables.forEach(variable => {
        if (!variableValues[variable.name]?.trim()) {
          errors[variable.name] = `${variable.name} is required`;
        }
      });
    }

    // Don't validate recipients for preview
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [useTemplate, selectedTemplate, customContent, customSubject, variableValues]);

  const handleSendEmail = useCallback(() => {
    if (!validateForm()) {
      return;
    }
    setShowConfirmModal(true);
  }, [validateForm]);

  const confirmSendEmail = useCallback(async () => {
    setShowConfirmModal(false);

    try {
      if (useTemplate && selectedTemplate) {
        // Process variable values to use extracted images where available
        const processedVariableValues = { ...variableValues };

        // Use full template content if available for sending
        const templateData = fullTemplateContent || selectedTemplate;

        // Replace image variables with extracted images if available
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

        // Send using template
        const emailData = {
          recipients: emailDistribution === 'broadcast' ? [] : recipientList,
          variableValues: processedVariableValues,
          broadcastToAll: emailDistribution === 'broadcast',
        };

        await sendEmailWithTemplate(selectedTemplate._id, emailData);
        const recipientCount =
          emailDistribution === 'broadcast'
            ? 'all subscribers'
            : `${recipientList.length} recipient(s)`;
        toast.success(`Email sent successfully to ${recipientCount}`);
        resetAllStates();
      } else {
        // Send custom email - Set sending state for progress indicator
        setCustomSendingEmail(true);

        try {
          if (emailDistribution === 'broadcast') {
            // Use existing broadcast functionality for custom emails
            await axios.post(ENDPOINTS.BROADCAST_EMAILS, {
              subject: customSubject,
              html: customContent,
              useBatch: true, // Enable batch system
              requestor: {
                requestorId: 'current-user', // You might want to get this from auth context
                role: 'admin',
                permissions: ['sendEmailToAll'],
              },
            });
          } else {
            // Use existing send email functionality for specific recipients
            await axios.post(ENDPOINTS.POST_EMAILS, {
              to: recipientList,
              subject: customSubject,
              html: customContent,
              useBatch: true, // Enable batch system
              requestor: {
                requestorId: 'current-user', // You might want to get this from auth context
                role: 'admin',
                permissions: ['sendEmails'],
              },
            });
          }

          // Show success message
          const recipientCount =
            emailDistribution === 'broadcast'
              ? 'all subscribers'
              : `${recipientList.length} recipient(s)`;
          toast.success(`Email sent successfully to ${recipientCount}`);
          resetAllStates();
        } finally {
          setCustomSendingEmail(false);
        }
      }
    } catch (error) {
      // console.error('Email sending failed:', error);
      toast.error(`Failed to send email: ${error.message || 'Unknown error'}`);
      setValidationErrors({ general: error.message || 'Failed to send email' });
    }
  }, [
    useTemplate,
    selectedTemplate,
    variableValues,
    emailDistribution,
    recipientList,
    customSubject,
    customContent,
    sendEmailWithTemplate,
    resetAllStates,
  ]);

  const getPreviewContent = useCallback(() => {
    if (useTemplate && selectedTemplate) {
      // Use full template content if available, otherwise fall back to selected template
      const templateData = fullTemplateContent || selectedTemplate;
      let content = templateData.html_content || templateData.content || '';
      let subject = templateData.subject || '';

      // Debug logging
      // console.log('Template preview - Using full template content:', !!fullTemplateContent);
      // console.log('Template preview - Original content:', content);
      // console.log('Template preview - Original subject:', subject);
      // console.log('Template preview - Variables:', templateData.variables);
      // console.log('Template preview - Variable values:', variableValues);

      if (templateData.variables && Array.isArray(templateData.variables)) {
        templateData.variables.forEach(variable => {
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

      // console.log('Template preview - Final content:', content);
      // console.log('Template preview - Final subject:', subject);

      return { subject, content };
    } else {
      // console.log('Custom preview - Subject:', customSubject);
      // console.log('Custom preview - Content:', customContent);
      return { subject: customSubject, content: customContent };
    }
  }, [
    useTemplate,
    selectedTemplate,
    fullTemplateContent,
    variableValues,
    customSubject,
    customContent,
  ]);

  // Memoized TinyMCE configuration for performance
  const TINY_MCE_INIT_OPTIONS = useMemo(() => getEmailSenderConfig(darkMode), [darkMode]);

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
              color="outline-secondary"
              onClick={() => {
                if (validateForPreview()) {
                  setShowPreviewModal(true);
                } else {
                  toast.warning('Please fix validation errors before previewing', {
                    autoClose: 3000,
                  });
                }
              }}
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
              disabled={sendingEmail || customSendingEmail || isRetrying}
              aria-label={sendingEmail || customSendingEmail ? 'Sending email...' : 'Send email'}
              className={sendingEmail || customSendingEmail ? 'sending-email-btn' : ''}
            >
              {sendingEmail || customSendingEmail ? (
                <>
                  <Spinner size="sm" className="me-1" />
                  Sending Email...
                </>
              ) : (
                <>
                  <FaPaperPlane className="me-1" />
                  Send Email
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

      {/* Email Sending Progress */}
      {(sendingEmail || customSendingEmail) && (
        <div className="email-sending-progress">
          <div className="progress-container">
            <div className="progress-header">
              <FaPaperPlane className="me-2" />
              <span className="progress-title">Sending Email</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-sending">
                <div className="progress-bar-fill"></div>
              </div>
            </div>
            <div className="progress-text">
              <small className="text-muted">Please wait while we process your email...</small>
            </div>
          </div>
        </div>
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
                        {template.name} (created by{' '}
                        {template.created_by
                          ? `${template.created_by.firstName} ${template.created_by.lastName}`
                          : 'Unknown'}
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
                  <div className="editor-loading">
                    <EnhancedLoader
                      message="Loading rich text editor..."
                      progress={loadingProgress}
                      showProgress={true}
                    />
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
                    <div className="editor-suspense">
                      <SkeletonLoader height="300px" count={1} animated />
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
                            toast.success('Editor loaded successfully!', {
                              autoClose: 2000,
                              icon: <FaCheckCircle />,
                            });
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
                      getYouTubeThumbnailWithFallback={getYouTubeThumbnailWithFallback}
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

      {/* Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        toggle={() => setShowPreviewModal(false)}
        size="lg"
        className="email-preview-modal"
      >
        <ModalHeader toggle={() => setShowPreviewModal(false)} className="email-preview-header">
          Email Preview
        </ModalHeader>
        <ModalBody className="email-preview-body">
          <div className="preview-info">
            <div className="preview-field">
              <strong>Subject:</strong> {previewContent.subject}
            </div>
            <div className="preview-field">
              <strong>Distribution:</strong>{' '}
              {emailDistribution === 'broadcast'
                ? 'Broadcast to all subscribed users'
                : `Send to specific recipients (${parseRecipients(recipients).length} recipients)`}
            </div>
          </div>
          <div className="preview-content">
            {previewContent.content ? (
              <div dangerouslySetInnerHTML={{ __html: previewContent.content }} />
            ) : (
              <div className="empty-content-message">
                <p className="text-muted">
                  <i className="fas fa-info-circle me-2"></i>
                  No content available for preview.
                  {useTemplate
                    ? ' Please fill in all template variables.'
                    : ' Please add some content to your email.'}
                </p>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter className="email-preview-footer">
          <Button color="secondary" onClick={() => setShowPreviewModal(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        toggle={() => setShowConfirmModal(false)}
        className="email-confirm-modal"
      >
        <ModalHeader toggle={() => setShowConfirmModal(false)} className="email-confirm-header">
          Confirm Send Email
        </ModalHeader>
        <ModalBody className="email-confirm-body">
          <p>Are you sure you want to send this email?</p>
          <div className="confirm-info">
            <div className="confirm-field">
              <strong>Subject:</strong> {previewContent.subject}
            </div>
            <div className="confirm-field">
              <strong>Recipients:</strong>{' '}
              {emailDistribution === 'broadcast'
                ? 'All users'
                : `${parseRecipients(recipients).length} recipients`}
            </div>
          </div>
          <div className="alert alert-warning confirm-warning">
            <small>This action cannot be undone. The email will be sent immediately.</small>
          </div>
        </ModalBody>
        <ModalFooter className="email-confirm-footer">
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
