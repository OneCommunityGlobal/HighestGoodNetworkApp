import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  Suspense,
  lazy,
  useReducer,
} from 'react';
// import WeeklyUpdateComposer from './WeeklyUpdateComposer';
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
import './IntegratedEmailSender.module.css';
import '../EmailManagementShared.module.css';
import { saveDraft, loadDraft, clearDraft, hasDraft, getDraftAge } from './formPersistence';
import {
  EMAIL_MODES,
  EMAIL_DISTRIBUTION,
  YOUTUBE_THUMBNAIL_QUALITIES,
} from './constants/emailConstants';

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
    const qualities = React.useMemo(() => YOUTUBE_THUMBNAIL_QUALITIES, []);

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
                          maxWidth: '100%',
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
                          width: '100%',
                          maxWidth: '400px',
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
// Initial state for email sender
const initialEmailState = {
  selectedTemplate: null,
  customContent: '',
  customSubject: '',
  recipients: '',
  variableValues: {},
  emailDistribution: EMAIL_DISTRIBUTION.SPECIFIC,
  showPreviewModal: false,
  validationErrors: {},
  recipientList: [],
  isSending: false,
  apiError: null,
  retryCount: 0,
  isRetrying: false,
  loadingProgress: 0,
  isEditorLoaded: false,
  editorError: null,
  showRetryOptions: false,
  lastSuccessfulLoad: null,
  fullTemplateContent: null,
  previewLoading: false,
  previewError: null,
  backendPreviewData: null,
  componentError: null,
  // NEW PROPERTIES FOR DRAFT PERSISTENCE
  showDraftNotification: false,
  draftAge: null,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  showOfflineWarning: false,
};

// Reducer function
const emailReducer = (state, action) => {
  switch (action.type) {
    case 'SET_SELECTED_TEMPLATE':
      return { ...state, selectedTemplate: action.payload };

    case 'SET_CUSTOM_CONTENT':
      return { ...state, customContent: action.payload };

    case 'SET_CUSTOM_SUBJECT':
      return { ...state, customSubject: action.payload };

    case 'SET_RECIPIENTS':
      return { ...state, recipients: action.payload };

    case 'SET_VARIABLE_VALUES':
      return { ...state, variableValues: action.payload };

    case 'UPDATE_VARIABLE_VALUE':
      return {
        ...state,
        variableValues: {
          ...state.variableValues,
          [action.payload.name]: action.payload.value,
        },
      };

    case 'SET_EMAIL_DISTRIBUTION':
      return { ...state, emailDistribution: action.payload };

    case 'SET_SHOW_PREVIEW_MODAL':
      return { ...state, showPreviewModal: action.payload };

    case 'SET_VALIDATION_ERRORS':
      return { ...state, validationErrors: action.payload };

    case 'UPDATE_VALIDATION_ERROR':
      return {
        ...state,
        validationErrors: {
          ...state.validationErrors,
          [action.payload.field]: action.payload.error,
        },
      };

    case 'SET_RECIPIENT_LIST':
      return { ...state, recipientList: action.payload };

    case 'SET_IS_SENDING':
      return { ...state, isSending: action.payload };

    case 'SET_API_ERROR':
      return { ...state, apiError: action.payload };

    case 'SET_RETRY_COUNT':
      return { ...state, retryCount: action.payload };

    case 'INCREMENT_RETRY_COUNT':
      return { ...state, retryCount: state.retryCount + 1 };

    case 'SET_IS_RETRYING':
      return { ...state, isRetrying: action.payload };

    case 'SET_LOADING_PROGRESS':
      return { ...state, loadingProgress: action.payload };

    case 'SET_EDITOR_LOADED':
      return { ...state, isEditorLoaded: action.payload };

    case 'SET_EDITOR_ERROR':
      return { ...state, editorError: action.payload };

    case 'SET_SHOW_RETRY_OPTIONS':
      return { ...state, showRetryOptions: action.payload };

    case 'SET_LAST_SUCCESSFUL_LOAD':
      return { ...state, lastSuccessfulLoad: action.payload };

    case 'SET_FULL_TEMPLATE_CONTENT':
      return { ...state, fullTemplateContent: action.payload };

    case 'SET_PREVIEW_LOADING':
      return { ...state, previewLoading: action.payload };

    case 'SET_PREVIEW_ERROR':
      return { ...state, previewError: action.payload };

    case 'SET_BACKEND_PREVIEW_DATA':
      return { ...state, backendPreviewData: action.payload };

    case 'SET_COMPONENT_ERROR':
      return { ...state, componentError: action.payload };

    case 'RESET_FORM':
      return {
        ...initialEmailState,
        // Keep some state that shouldn't reset
        apiError: state.apiError,
        lastSuccessfulLoad: state.lastSuccessfulLoad,
      };

    case 'RESET_ERRORS':
      return {
        ...state,
        apiError: null,
        validationErrors: {},
        editorError: null,
        previewError: null,
        componentError: null,
      };

    case 'SET_SHOW_DRAFT_NOTIFICATION':
      return { ...state, showDraftNotification: action.payload };

    case 'SET_DRAFT_AGE':
      return { ...state, draftAge: action.payload };

    case 'SET_IS_ONLINE':
      return { ...state, isOnline: action.payload };

    case 'SET_SHOW_OFFLINE_WARNING':
      return { ...state, showOfflineWarning: action.payload };

    case 'RESTORE_DRAFT':
      return {
        ...state,
        ...action.payload,
        showDraftNotification: false,
      };

    default:
      return state;
  }
};
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
    if (mode === EMAIL_MODES.CUSTOM) return EMAIL_MODES.CUSTOM;
    if (mode === EMAIL_MODES.WEEKLY_UPDATE) return EMAIL_MODES.WEEKLY_UPDATE;
    return EMAIL_MODES.TEMPLATES; // Default to template mode
  }, [location.search]);

  const [emailMode, setEmailMode] = useState(() => {
    const urlParams = new URLSearchParams(location.search);
    const mode = urlParams.get('mode');
    if (mode === EMAIL_MODES.CUSTOM) return EMAIL_MODES.CUSTOM;
    if (mode === EMAIL_MODES.WEEKLY_UPDATE) return EMAIL_MODES.WEEKLY_UPDATE;
    return EMAIL_MODES.TEMPLATES; // Default to template mode
  });

  // Use reducer for email sender state
  const [state, dispatch] = useReducer(emailReducer, initialEmailState);

  // Destructure state
  const {
    selectedTemplate,
    customContent,
    customSubject,
    recipients,
    variableValues,
    emailDistribution,
    showPreviewModal,
    validationErrors,
    recipientList,
    isSending,
    apiError,
    retryCount,
    isRetrying,
    loadingProgress,
    isEditorLoaded,
    editorError,
    showRetryOptions,
    lastSuccessfulLoad,
    fullTemplateContent,
    previewLoading,
    previewError,
    backendPreviewData,
    componentError,
    showDraftNotification,
    draftAge,
    isOnline,
    showOfflineWarning,
  } = state;

  // Refs for performance optimization
  const abortControllerRef = useRef(null);
  const timeoutRefs = useRef([]);
  const progressIntervalRef = useRef(null);
  const editorLoadTimeoutRef = useRef(null);

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
            <Button color="primary" size="sm" onClick={onRetry}>
              <FaRedo className="me-1" />
              Try Again
            </Button>
            {showRetryOptions && (
              <Button color="outline-secondary" size="sm" onClick={onDismiss}>
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

  // Simple template loading indicator
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

  // Memoized URL update function
  const updateModeURL = useCallback(
    mode => {
      const urlParams = new URLSearchParams(location.search);

      // Clear template management parameters when switching email sender modes
      urlParams.delete('view');
      urlParams.delete('templateId');

      if (mode === EMAIL_MODES.TEMPLATES) {
        urlParams.delete('mode'); // Remove mode param for template (default)
      } else {
        urlParams.set('mode', mode); // Set mode param ('custom' or 'weekly')
      }

      const newSearch = urlParams.toString();
      const newURL = `${location.pathname}${newSearch ? `?${newSearch}` : ''}`;
      history.replace(newURL);
    },
    [location.search, location.pathname, history],
  );

  // Handle mode change with cleanup
  const handleModeChange = useCallback(
    mode => {
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Clear all timeouts
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
      timeoutRefs.current = [];

      // Reset all states when changing modes
      dispatch({ type: 'SET_SELECTED_TEMPLATE', payload: null });
      dispatch({ type: 'SET_FULL_TEMPLATE_CONTENT', payload: null });
      dispatch({ type: 'SET_CUSTOM_CONTENT', payload: '' });
      dispatch({ type: 'SET_CUSTOM_SUBJECT', payload: '' });
      dispatch({ type: 'SET_RECIPIENTS', payload: '' });
      dispatch({ type: 'SET_VARIABLE_VALUES', payload: {} });
      dispatch({ type: 'SET_EMAIL_DISTRIBUTION', payload: EMAIL_DISTRIBUTION.SPECIFIC });
      dispatch({ type: 'SET_SHOW_PREVIEW_MODAL', payload: false });
      dispatch({ type: 'SET_VALIDATION_ERRORS', payload: {} });
      dispatch({ type: 'SET_RECIPIENT_LIST', payload: [] });
      dispatch({ type: 'SET_API_ERROR', payload: null });
      dispatch({ type: 'SET_RETRY_COUNT', payload: 0 });
      dispatch({ type: 'SET_IS_RETRYING', payload: false });

      setEmailMode(mode);
      updateModeURL(mode);
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

    dispatch({ type: 'SET_SELECTED_TEMPLATE', payload: null });
    dispatch({ type: 'SET_FULL_TEMPLATE_CONTENT', payload: null });
    dispatch({ type: 'SET_CUSTOM_CONTENT', payload: '' });
    dispatch({ type: 'SET_CUSTOM_SUBJECT', payload: '' });
    dispatch({ type: 'SET_RECIPIENTS', payload: '' });
    dispatch({ type: 'SET_VARIABLE_VALUES', payload: {} });
    dispatch({ type: 'SET_EMAIL_DISTRIBUTION', payload: EMAIL_DISTRIBUTION.SPECIFIC });
    dispatch({ type: 'SET_SHOW_PREVIEW_MODAL', payload: false });
    dispatch({ type: 'SET_VALIDATION_ERRORS', payload: {} });
    dispatch({ type: 'SET_RECIPIENT_LIST', payload: [] });
    dispatch({ type: 'SET_API_ERROR', payload: null });
    dispatch({ type: 'SET_RETRY_COUNT', payload: 0 });
    dispatch({ type: 'SET_IS_RETRYING', payload: false });
  }, []);

  // Update useTemplate when URL changes (e.g., browser back/forward)
  useEffect(() => {
    const newMode = getCurrentModeFromURL();
    if (newMode !== emailMode) {
      // Always reset all states when switching modes
      resetAllStates();
      setEmailMode(newMode);
    }
  }, [location.search, emailMode, resetAllStates, getCurrentModeFromURL]);

  // Enhanced template fetching with progress tracking
  useEffect(() => {
    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    const fetchTemplatesWithProgress = async () => {
      try {
        dispatch({ type: 'SET_LOADING_PROGRESS', payload: 0 });
        dispatch({ type: 'SET_API_ERROR', payload: null });
        dispatch({ type: 'SET_SHOW_RETRY_OPTIONS', payload: false });

        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          dispatch({
            type: 'SET_LOADING_PROGRESS',
            payload: prev => {
              if (prev >= 90) return prev;
              return prev + Math.random() * 15;
            },
          });
        }, 200);

        progressIntervalRef.current = progressInterval;

        await fetchEmailTemplates({
          search: '',
          // no pagination for dropdown; fetch all
          sortBy: 'updated_at',
          sortOrder: 'desc',
          includeEmailContent: false,
        });

        dispatch({ type: 'SET_LOADING_PROGRESS', payload: 100 });
        dispatch({ type: 'SET_LAST_SUCCESSFUL_LOAD', payload: new Date() });
        clearInterval(progressInterval);

        // Reset progress after success
        setTimeout(() => dispatch({ type: 'SET_LOADING_PROGRESS', payload: 0 }), 1000);
      } catch (error) {
        if (error.name !== 'AbortError') {
          dispatch({
            type: 'SET_API_ERROR',
            payload: 'Failed to load templates. Please try again.',
          });
          dispatch({ type: 'SET_SHOW_RETRY_OPTIONS', payload: true });
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
      dispatch({ type: 'SET_SELECTED_TEMPLATE', payload: preSelectedTemplate });
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
      dispatch({ type: 'SET_VARIABLE_VALUES', payload: initialValues });
    }
  }, [preSelectedTemplate, templates]);

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

  // Check for existing draft on component mount
  useEffect(() => {
    if (hasDraft()) {
      const age = getDraftAge();
      dispatch({ type: 'SET_DRAFT_AGE', payload: age });
      dispatch({ type: 'SET_SHOW_DRAFT_NOTIFICATION', payload: true });
    }
  }, []);

  // Network status monitoring
  useEffect(() => {
    let offlineToastId = null; // Track the offline toast

    const handleOnline = () => {
      // Dismiss the offline toast if it exists
      if (offlineToastId !== null) {
        toast.dismiss(offlineToastId);
        offlineToastId = null;
      }

      // Force state updates with explicit boolean values
      dispatch({ type: 'SET_IS_ONLINE', payload: true });
      dispatch({ type: 'SET_SHOW_OFFLINE_WARNING', payload: false });

      // Show success toast
      toast.success('Connection restored!', { autoClose: 2000 });
    };

    const handleOffline = () => {
      // Force state updates with explicit boolean values
      dispatch({ type: 'SET_IS_ONLINE', payload: false });
      dispatch({ type: 'SET_SHOW_OFFLINE_WARNING', payload: true });

      // Store the toast ID so we can dismiss it later
      offlineToastId = toast.warning('You are offline. Your work will be saved locally.', {
        autoClose: false,
        closeButton: true,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);

      // Clean up: dismiss offline toast if component unmounts
      if (offlineToastId !== null) {
        toast.dismiss(offlineToastId);
      }
    };
  }, []);

  // Auto-save form data to localStorage
  useEffect(() => {
    // Don't save if form is completely empty
    if (
      !selectedTemplate &&
      !customContent.trim() &&
      !customSubject.trim() &&
      !recipients.trim() &&
      Object.keys(variableValues).length === 0
    ) {
      return;
    }

    // Debounce save operation
    const timeoutId = setTimeout(() => {
      const formState = {
        selectedTemplate,
        customContent,
        customSubject,
        recipients,
        variableValues,
        emailDistribution,
        emailMode,
      };

      saveDraft(formState);
    }, 1000); // Save after 1 second of inactivity

    return () => clearTimeout(timeoutId);
  }, [
    selectedTemplate,
    customContent,
    customSubject,
    recipients,
    variableValues,
    emailDistribution,
    emailMode,
  ]);

  // Enhanced retry mechanism with exponential backoff
  const handleRetry = useCallback(async () => {
    if (isRetrying) return; // Prevent multiple simultaneous retries

    dispatch({ type: 'SET_IS_RETRYING', payload: true });
    dispatch({ type: 'INCREMENT_RETRY_COUNT' });
    dispatch({ type: 'SET_API_ERROR', payload: null });
    dispatch({ type: 'SET_LOADING_PROGRESS', payload: 0 });
    dispatch({ type: 'SET_SHOW_RETRY_OPTIONS', payload: false });

    toast.info(`Retrying to load templates... (Attempt ${retryCount + 1})`, {
      autoClose: 1000,
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
        dispatch({
          type: 'SET_LOADING_PROGRESS',
          payload: prev => {
            if (prev >= 90) return prev;
            return prev + Math.random() * 10;
          },
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
      dispatch({ type: 'SET_LOADING_PROGRESS', payload: 100 });
      dispatch({ type: 'SET_LAST_SUCCESSFUL_LOAD', payload: new Date() });
      clearEmailTemplateError();
      dispatch({ type: 'SET_SHOW_RETRY_OPTIONS', payload: false });

      toast.success('Templates loaded successfully!', {
        icon: <FaCheckCircle />,
        autoClose: 1000,
      });

      // Reset retry count on success
      dispatch({ type: 'SET_RETRY_COUNT', payload: 0 });
    } catch (err) {
      if (err.name !== 'AbortError') {
        const errorMessage = `Retry failed: ${err.message || 'Unknown error'}`;

        dispatch({ type: 'SET_API_ERROR', payload: errorMessage });
        dispatch({ type: 'SET_SHOW_RETRY_OPTIONS', payload: true });

        toast.error(errorMessage, {
          autoClose: 5000,
        });
      }
    } finally {
      dispatch({ type: 'SET_IS_RETRYING', payload: false });
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

    dispatch({ type: 'SET_API_ERROR', payload: null });
    dispatch({ type: 'SET_RETRY_COUNT', payload: 0 });
    dispatch({ type: 'SET_IS_RETRYING', payload: false });
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
    dispatch({ type: 'SET_VARIABLE_VALUES', payload: initialValues });
  }, []);

  // Function to fetch full template content
  const fetchFullTemplateContent = useCallback(async templateId => {
    try {
      const response = await axios.get(ENDPOINTS.EMAIL_TEMPLATE_BY_ID(templateId));

      if (response.data.success && response.data.template) {
        dispatch({ type: 'SET_FULL_TEMPLATE_CONTENT', payload: response.data.template });
        return response.data.template;
      } else {
        throw new Error(response.data.message || 'Template not found');
      }
    } catch (error) {
      dispatch({ type: 'SET_FULL_TEMPLATE_CONTENT', payload: null });
      throw error;
    }
  }, []);

  const handleTemplateSelect = useCallback(
    async template => {
      // Clear all previous state first
      dispatch({ type: 'SET_VARIABLE_VALUES', payload: {} });
      dispatch({ type: 'SET_VALIDATION_ERRORS', payload: {} });
      dispatch({ type: 'SET_SHOW_PREVIEW_MODAL', payload: false });
      dispatch({ type: 'SET_FULL_TEMPLATE_CONTENT', payload: null });

      if (!template) {
        dispatch({ type: 'SET_SELECTED_TEMPLATE', payload: null });
        return;
      }

      // Check if template has full data
      const hasFullData =
        Array.isArray(template.variables) && (template.html_content || template.subject);

      if (!hasFullData) {
        // Fallback: fetch full template data if only basic data was loaded
        try {
          const fullTemplate = await fetchFullTemplateContent(template._id);
          if (fullTemplate) {
            dispatch({ type: 'SET_SELECTED_TEMPLATE', payload: fullTemplate });
            initializeVariableValues(fullTemplate);
            dispatch({ type: 'SET_FULL_TEMPLATE_CONTENT', payload: fullTemplate });
          }
        } catch (error) {
          // Continue with the template we have
          dispatch({ type: 'SET_SELECTED_TEMPLATE', payload: template });
          initializeVariableValues(template);
        }
      } else {
        // Template already has full data
        dispatch({ type: 'SET_SELECTED_TEMPLATE', payload: template });
        initializeVariableValues(template);
        dispatch({ type: 'SET_FULL_TEMPLATE_CONTENT', payload: template });
      }
    },
    [initializeVariableValues, fetchFullTemplateContent],
  );

  const handleVariableChange = useCallback(
    (variableName, value) => {
      const nextValues = { ...variableValues, [variableName]: value };
      dispatch({ type: 'SET_VARIABLE_VALUES', payload: nextValues });

      // Live validate only the changed variable when a template is selected
      if (selectedTemplate) {
        const variableMeta = selectedTemplate.variables?.find(v => v?.name === variableName);
        if (variableMeta) {
          const errorMsg = validateVariable(variableMeta, nextValues);
          dispatch({
            type: 'UPDATE_VALIDATION_ERROR',
            payload: { field: variableName, error: errorMsg },
          });
        }
      }
    },
    [selectedTemplate, variableValues],
  );

  const parseRecipients = useCallback(recipientText => parseRecipientsUtil(recipientText), []);

  // Memoized function to extract image from various sources
  const extractImageFromSource = useCallback(Validators.extractImageFromSource, []);

  // Memoized handle image source change with automatic extraction
  const handleImageSourceChange = useCallback(
    (variableName, source) => {
      const extractedImage = extractImageFromSource(source);

      const nextValues = {
        ...variableValues,
        [variableName]: source,
        [`${variableName}_extracted`]: extractedImage || '',
      };
      dispatch({ type: 'SET_VARIABLE_VALUES', payload: nextValues });

      if (selectedTemplate) {
        const variableMeta = selectedTemplate.variables?.find(v => v?.name === variableName);
        if (variableMeta) {
          const errorMsg = validateVariable(variableMeta, nextValues);
          dispatch({
            type: 'UPDATE_VALIDATION_ERROR',
            payload: { field: variableName, error: errorMsg },
          });
        }
      }
    },
    [extractImageFromSource, selectedTemplate, variableValues],
  );

  const validateEmail = useCallback(email => validateEmailUtil(email), []);

  const useTemplate = emailMode === EMAIL_MODES.TEMPLATES;

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

    if (emailDistribution === EMAIL_DISTRIBUTION.SPECIFIC) {
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
          dispatch({ type: 'SET_RECIPIENT_LIST', payload: recipientEmails });
        }
      }
    } else {
      dispatch({ type: 'SET_RECIPIENT_LIST', payload: [] });
    }

    // Validate template variables
    if (useTemplate && selectedTemplate) {
      const varErrors = validateTemplateVariables(selectedTemplate, variableValues);
      Object.assign(errors, varErrors);
    }

    dispatch({ type: 'SET_VALIDATION_ERRORS', payload: errors });
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

    dispatch({ type: 'SET_VALIDATION_ERRORS', payload: errors });
    return Object.keys(errors).length === 0;
  }, [useTemplate, selectedTemplate, customContent, customSubject, variableValues]);

  // Get preview content
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

    // Fallback to client-side rendering
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
        autoClose: 1000,
      });
      return;
    }

    // For custom emails, just show preview modal
    if (!useTemplate || !selectedTemplate) {
      dispatch({ type: 'SET_SHOW_PREVIEW_MODAL', payload: true });
      return;
    }

    // For templates, try to use backend API
    if (selectedTemplate._id) {
      dispatch({ type: 'SET_PREVIEW_LOADING', payload: true });
      dispatch({ type: 'SET_PREVIEW_ERROR', payload: null });
      dispatch({ type: 'SET_BACKEND_PREVIEW_DATA', payload: null });

      try {
        const preview = await previewEmailTemplate(selectedTemplate._id, variableValues);
        dispatch({ type: 'SET_BACKEND_PREVIEW_DATA', payload: preview });
        dispatch({ type: 'SET_SHOW_PREVIEW_MODAL', payload: true });
      } catch (error) {
        dispatch({
          type: 'SET_PREVIEW_ERROR',
          payload: error.message || 'Failed to preview template',
        });
        toast.warning('Preview failed, using basic preview', {
          position: 'top-right',
          autoClose: 3000,
        });
        dispatch({ type: 'SET_BACKEND_PREVIEW_DATA', payload: null });
        dispatch({ type: 'SET_SHOW_PREVIEW_MODAL', payload: true });
      } finally {
        dispatch({ type: 'SET_PREVIEW_LOADING', payload: false });
      }
    } else {
      dispatch({ type: 'SET_SHOW_PREVIEW_MODAL', payload: true });
    }
  }, [useTemplate, selectedTemplate, variableValues, validateForPreview, previewEmailTemplate]);

  // Handle send email - opens preview modal
  const handleSendEmail = useCallback(() => {
    if (!validateForm()) {
      return;
    }
    handlePreview();
  }, [validateForm, handlePreview]);

  // Send email from preview modal
  const handleSendFromPreview = useCallback(async () => {
    dispatch({ type: 'SET_IS_SENDING', payload: true });

    try {
      if (useTemplate && selectedTemplate) {
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

        const rendered = getPreviewContent();
        const payload =
          emailDistribution === EMAIL_DISTRIBUTION.BROADCAST
            ? {
                subject: rendered.subject,
                html: rendered.content,
              }
            : {
                to: recipientList,
                subject: rendered.subject,
                html: rendered.content,
              };

        if (!currentUser || !currentUser.userid) {
          throw new Error('User authentication required to send emails');
        }

        const requestor = {
          requestorId: currentUser.userid,
          email: currentUser.email,
          role: currentUser.role,
        };

        const payloadWithRequestor = {
          ...payload,
          requestor,
        };

        if (emailDistribution === EMAIL_DISTRIBUTION.BROADCAST) {
          await axios.post(ENDPOINTS.BROADCAST_EMAILS, payloadWithRequestor);
        } else {
          await axios.post(ENDPOINTS.POST_EMAILS, payloadWithRequestor);
        }

        const recipientCount =
          emailDistribution === EMAIL_DISTRIBUTION.BROADCAST
            ? 'all subscribers'
            : `${recipientList.length} recipient(s)`;
        toast.info(`Email created successfully for ${recipientCount}. Processing started.`, {
          autoClose: 3000,
        });

        dispatch({ type: 'SET_SHOW_PREVIEW_MODAL', payload: false });
        dispatch({ type: 'SET_BACKEND_PREVIEW_DATA', payload: null });
        dispatch({ type: 'SET_PREVIEW_ERROR', payload: null });
        clearDraft(); // Clear saved draft after successful send
        resetAllStates();
      } else {
        // Send custom email
        if (!currentUser || !currentUser.userid) {
          throw new Error('User authentication required to send emails');
        }

        const requestor = {
          requestorId: currentUser.userid,
          email: currentUser.email,
          role: currentUser.role,
        };

        if (emailDistribution === EMAIL_DISTRIBUTION.BROADCAST) {
          await axios.post(ENDPOINTS.BROADCAST_EMAILS, {
            subject: customSubject,
            html: customContent,
            requestor,
          });
        } else {
          await axios.post(ENDPOINTS.POST_EMAILS, {
            to: recipientList,
            subject: customSubject,
            html: customContent,
            requestor,
          });
        }

        const recipientCount =
          emailDistribution === EMAIL_DISTRIBUTION.BROADCAST
            ? 'all subscribers'
            : `${recipientList.length} recipient(s)`;
        toast.info(`Email created successfully for ${recipientCount}. Processing started.`, {
          autoClose: 3000,
        });

        dispatch({ type: 'SET_SHOW_PREVIEW_MODAL', payload: false });
        dispatch({ type: 'SET_BACKEND_PREVIEW_DATA', payload: null });
        dispatch({ type: 'SET_PREVIEW_ERROR', payload: null });
        clearDraft(); // Clear saved draft after successful send
        resetAllStates();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      toast.error(`Failed to send email: ${errorMessage}`);
      dispatch({
        type: 'UPDATE_VALIDATION_ERROR',
        payload: { field: 'general', error: errorMessage },
        autoClose: 3000,
      });
    } finally {
      dispatch({ type: 'SET_IS_SENDING', payload: false });
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
  const handleRestoreDraft = useCallback(async () => {
    const draft = loadDraft();

    if (!draft) {
      toast.error('No draft found to restore');
      dispatch({ type: 'SET_SHOW_DRAFT_NOTIFICATION', payload: false });
      return;
    }

    try {
      // Restore email mode first
      if (draft.emailMode && draft.emailMode !== emailMode) {
        setEmailMode(draft.emailMode);
        updateModeURL(draft.emailMode);
      }

      // Restore template if in template mode
      if (draft.emailMode === EMAIL_MODES.TEMPLATES && draft.selectedTemplateId && templates) {
        const template = templates.find(t => t._id === draft.selectedTemplateId);
        if (template) {
          await handleTemplateSelect(template);
        }
      }

      // Restore other form fields
      dispatch({
        type: 'RESTORE_DRAFT',
        payload: {
          customContent: draft.customContent || '',
          customSubject: draft.customSubject || '',
          recipients: draft.recipients || '',
          variableValues: draft.variableValues || {},
          emailDistribution: draft.emailDistribution || EMAIL_DISTRIBUTION.SPECIFIC,
        },
      });

      toast.success('Draft restored successfully!', {
        autoClose: 1000,
        icon: <FaCheckCircle />,
      });

      dispatch({ type: 'SET_SHOW_DRAFT_NOTIFICATION', payload: false });
    } catch (error) {
      toast.error('Failed to restore draft');
      console.error('Draft restoration error:', error);
    }
  }, [emailMode, templates, handleTemplateSelect, setEmailMode, updateModeURL]);

  const handleDismissDraft = useCallback(() => {
    clearDraft();
    dispatch({ type: 'SET_SHOW_DRAFT_NOTIFICATION', payload: false });
    toast.info('Draft dismissed', { autoClose: 2000 });
  }, []);

  const handleClearDraft = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the saved draft? This cannot be undone.')) {
      clearDraft(); // Clear from localStorage

      // Reset all form states to clear the UI
      dispatch({ type: 'SET_SELECTED_TEMPLATE', payload: null });
      dispatch({ type: 'SET_CUSTOM_CONTENT', payload: '' });
      dispatch({ type: 'SET_CUSTOM_SUBJECT', payload: '' });
      dispatch({ type: 'SET_RECIPIENTS', payload: '' });
      dispatch({ type: 'SET_VARIABLE_VALUES', payload: {} });
      dispatch({ type: 'SET_EMAIL_DISTRIBUTION', payload: EMAIL_DISTRIBUTION.SPECIFIC });
      dispatch({ type: 'SET_VALIDATION_ERRORS', payload: {} });
      dispatch({ type: 'SET_RECIPIENT_LIST', payload: [] });

      toast.info('Draft cleared', { autoClose: 2000 });
    }
  }, []);

  // Memoized TinyMCE configuration
  const TINY_MCE_INIT_OPTIONS = useMemo(() => getEmailSenderConfig(darkMode), [darkMode]);

  // Clear backend preview data when variables or template change
  useEffect(() => {
    dispatch({ type: 'SET_BACKEND_PREVIEW_DATA', payload: null });
    dispatch({ type: 'SET_PREVIEW_ERROR', payload: null });
  }, [variableValues, selectedTemplate?._id]);

  // Memoized preview content
  const previewContent = useMemo(() => getPreviewContent(), [getPreviewContent]);

  // Error boundary effect
  useEffect(() => {
    const handleError = error => {
      dispatch({ type: 'SET_COMPONENT_ERROR', payload: error.message });
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Reset component error when switching modes
  useEffect(() => {
    if (componentError) {
      dispatch({ type: 'SET_COMPONENT_ERROR', payload: null });
    }
  }, [useTemplate, componentError]);

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
                  dispatch({ type: 'SET_COMPONENT_ERROR', payload: null });
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
      {/* Draft Notification - Restore saved work */}
      {showDraftNotification && (
        <Alert
          color="info"
          className="d-flex align-items-center justify-content-between mb-3 draft-notification"
        >
          <div className="d-flex align-items-center">
            <FaInfoCircle className="me-2" />
            <div>
              <strong>Draft Available</strong>
              <br />
              <small>
                You have unsaved work from {draftAge} minute{draftAge !== 1 ? 's' : ''} ago.
              </small>
            </div>
          </div>
          <div className="d-flex gap-2">
            <Button color="primary" size="sm" onClick={handleRestoreDraft}>
              <FaRedo className="me-1" />
              Restore
            </Button>
            <Button color="outline-secondary" size="sm" onClick={handleDismissDraft}>
              <FaTimes className="me-1" />
              Dismiss
            </Button>
          </div>
        </Alert>
      )}

      {/* Offline Warning */}
      {showOfflineWarning && (
        <Alert color="warning" className="d-flex align-items-center mb-3">
          <FaExclamationTriangle className="me-2" />
          <div>
            <strong>You are offline</strong>
            <br />
            <small>
              Your work is being saved locally. You can continue editing and send when connection is
              restored.
            </small>
          </div>
        </Alert>
      )}

      <div className="email-controls-container mb-3">
        <div className="email-controls-row">
          {/* Email Mode Selector */}
          <div className="mode-buttons" role="group" aria-label="Email composition mode">
            <Button
              color={emailMode === EMAIL_MODES.TEMPLATES ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => handleModeChange(EMAIL_MODES.TEMPLATES)}
              aria-pressed={emailMode === EMAIL_MODES.TEMPLATES}
              aria-label="Use email templates"
              title="Create email using pre-made templates"
            >
              📧 Templates
            </Button>
            <Button
              color={emailMode === EMAIL_MODES.CUSTOM ? 'success' : 'outline-success'}
              size="sm"
              onClick={() => handleModeChange(EMAIL_MODES.CUSTOM)}
              aria-pressed={emailMode === EMAIL_MODES.CUSTOM}
              aria-label="Create custom email"
              title="Create email with custom content"
            >
              ✏️ Custom
            </Button>
            {/* <Button
              color={emailMode === EMAIL_MODES.WEEKLY_UPDATE ? 'info' : 'outline-info'}
              onClick={() => handleModeChange(EMAIL_MODES.WEEKLY_UPDATE)}
              aria-pressed={emailMode === EMAIL_MODES.WEEKLY_UPDATE}
              aria-label="Send weekly progress update"
              title="Send weekly progress update (simplified form)"
            >
              📰 Weekly Update
            </Button> */}
          </div>
          <div className="action-buttons">
            <Button
              color="primary"
              size="sm"
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
              <Button color="secondary" size="sm" onClick={onClose}>
                <FaTimes className="me-1" />
                Close
              </Button>
            )}
            {hasDraft() && (
              <Button
                color="outline-danger"
                size="sm"
                onClick={handleClearDraft}
                title="Clear saved draft"
              >
                <FaTimes className="me-1" />
                Clear Draft
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* General Validation Error Alert */}
      {validationErrors.general && (
        <Alert
          color="danger"
          toggle={() =>
            dispatch({
              type: 'UPDATE_VALIDATION_ERROR',
              payload: { field: 'general', error: null },
            })
          }
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

      {/* Show Form only for Template and Custom modes */}
      {emailMode !== EMAIL_MODES.WEEKLY_UPDATE && (
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

                  {/* Simple Retry Option */}
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

          {/* Custom Email Fields */}
          {!useTemplate && (
            <>
              <FormGroup>
                <Label>Subject *</Label>
                <Input
                  type="text"
                  value={customSubject}
                  onChange={e => dispatch({ type: 'SET_CUSTOM_SUBJECT', payload: e.target.value })}
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
                        dispatch({ type: 'SET_EDITOR_ERROR', payload: null });
                        dispatch({ type: 'SET_EDITOR_LOADED', payload: false });
                        dispatch({ type: 'SET_LOADING_PROGRESS', payload: 0 });
                      }}
                      onDismiss={() => dispatch({ type: 'SET_EDITOR_ERROR', payload: null })}
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
                        onEditorChange={content =>
                          dispatch({ type: 'SET_CUSTOM_CONTENT', payload: content })
                        }
                        init={{
                          ...TINY_MCE_INIT_OPTIONS,
                          setup: editor => {
                            editor.on('init', () => {
                              dispatch({ type: 'SET_EDITOR_LOADED', payload: true });
                              dispatch({ type: 'SET_LOADING_PROGRESS', payload: 100 });
                            });

                            editor.on('error', e => {
                              dispatch({
                                type: 'SET_EDITOR_ERROR',
                                payload: 'Editor encountered an error',
                              });
                              dispatch({ type: 'SET_EDITOR_LOADED', payload: false });
                            });

                            editorLoadTimeoutRef.current = setTimeout(() => {
                              if (!isEditorLoaded) {
                                dispatch({
                                  type: 'SET_EDITOR_ERROR',
                                  payload: 'Editor is taking too long to load',
                                });
                                dispatch({ type: 'SET_EDITOR_LOADED', payload: false });
                              }
                            }, 10000);
                          },
                        }}
                        onLoadContent={() => {
                          clearTimeout(editorLoadTimeoutRef.current);
                          dispatch({ type: 'SET_EDITOR_LOADED', payload: true });
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
                        onChange={e =>
                          dispatch({ type: 'SET_CUSTOM_CONTENT', payload: e.target.value })
                        }
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

          {/* Variable Values */}
          {useTemplate && selectedTemplate && (
            <div className="template-variables">
              <div className="variables-header">
                <h6 className="mb-1">
                  Template Variables
                  <Badge color="info" className="ml-2 ms-2">
                    {selectedTemplate.variables ? selectedTemplate.variables.length : 0} variable
                    {selectedTemplate.variables && selectedTemplate.variables.length !== 1
                      ? 's'
                      : ''}
                  </Badge>
                </h6>
              </div>

              {selectedTemplate.variables && selectedTemplate.variables.length > 0 ? (
                <div className="table-responsive">
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
                            dispatch({
                              type: 'UPDATE_VALIDATION_ERROR',
                              payload: {
                                field: name,
                                error: ok
                                  ? null
                                  : `${name} is required (valid image URL or YouTube link)`,
                              },
                            });
                          }}
                        />
                      ))}
                    </tbody>
                  </Table>
                </div>
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
            <Label className="form-label">Email Distribution *</Label>
            <div className="distribution-options">
              <label
                className={`distribution-option ${
                  emailDistribution === EMAIL_DISTRIBUTION.SPECIFIC ? 'selected' : ''
                }`}
              >
                <input
                  type="radio"
                  name="emailDistribution"
                  value="specific"
                  checked={emailDistribution === EMAIL_DISTRIBUTION.SPECIFIC}
                  onChange={() =>
                    dispatch({
                      type: 'SET_EMAIL_DISTRIBUTION',
                      payload: EMAIL_DISTRIBUTION.SPECIFIC,
                    })
                  }
                />
                <span className="option-icon mx-2">✏️</span>
                Specific Recipients
              </label>
              <label
                className={`distribution-option ${
                  emailDistribution === EMAIL_DISTRIBUTION.BROADCAST ? 'selected' : ''
                }`}
              >
                <input
                  type="radio"
                  name="emailDistribution"
                  value="broadcast"
                  checked={emailDistribution === EMAIL_DISTRIBUTION.BROADCAST}
                  onChange={() => {
                    dispatch({
                      type: 'SET_EMAIL_DISTRIBUTION',
                      payload: EMAIL_DISTRIBUTION.BROADCAST,
                    });
                    dispatch({
                      type: 'UPDATE_VALIDATION_ERROR',
                      payload: { field: 'recipients', error: null },
                    });
                    dispatch({ type: 'SET_RECIPIENT_LIST', payload: [] });
                  }}
                />
                <span className="option-icon mx-2">🚀</span>
                Broadcast to All Subscribers
              </label>
            </div>

            {/* Expanded content for specific recipients */}
            {emailDistribution === EMAIL_DISTRIBUTION.SPECIFIC && (
              <FormGroup className="mt-3">
                <Label>Recipients *</Label>
                <Input
                  type="textarea"
                  rows={4}
                  value={recipients}
                  onChange={e => {
                    const val = e.target.value;
                    dispatch({ type: 'SET_RECIPIENTS', payload: val });

                    if (emailDistribution === EMAIL_DISTRIBUTION.SPECIFIC) {
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
                      dispatch({
                        type: 'UPDATE_VALIDATION_ERROR',
                        payload: { field: 'recipients', error: errorMsg },
                      });
                      dispatch({ type: 'SET_RECIPIENT_LIST', payload: errorMsg ? [] : emails });
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
      )}

      {/* Weekly Update Mode */}
      {/* {emailMode === EMAIL_MODES.WEEKLY_UPDATE && <WeeklyUpdateComposer onClose={onClose} />} */}

      {/* Preview & Send Modal */}
      <Modal
        isOpen={showPreviewModal}
        toggle={() => {
          if (!isSending) {
            dispatch({ type: 'SET_SHOW_PREVIEW_MODAL', payload: false });
            dispatch({ type: 'SET_BACKEND_PREVIEW_DATA', payload: null });
            dispatch({ type: 'SET_PREVIEW_ERROR', payload: null });
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
              dispatch({ type: 'SET_SHOW_PREVIEW_MODAL', payload: false });
              dispatch({ type: 'SET_BACKEND_PREVIEW_DATA', payload: null });
              dispatch({ type: 'SET_PREVIEW_ERROR', payload: null });
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
                {emailDistribution === EMAIL_DISTRIBUTION.BROADCAST ? (
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
                    className="mt-2 p-3 border rounded email-preview-content"
                    style={{
                      maxHeight: '400px',
                      overflow: 'auto',
                    }}
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
            size="sm"
            onClick={() => {
              dispatch({ type: 'SET_SHOW_PREVIEW_MODAL', payload: false });
              dispatch({ type: 'SET_BACKEND_PREVIEW_DATA', payload: null });
              dispatch({ type: 'SET_PREVIEW_ERROR', payload: null });
            }}
            disabled={isSending || previewLoading}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            size="sm"
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

// PropTypes
IntegratedEmailSender.propTypes = {
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
  fetchEmailTemplates: PropTypes.func.isRequired,
  clearEmailTemplateError: PropTypes.func.isRequired,
  previewEmailTemplate: PropTypes.func,
  onClose: PropTypes.func,
  initialContent: PropTypes.string,
  initialSubject: PropTypes.string,
  preSelectedTemplate: PropTypes.object,
  initialRecipients: PropTypes.string,
};

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
});

const mapDispatchToProps = {
  fetchEmailTemplates,
  clearEmailTemplateError,
  previewEmailTemplate,
};

export default connect(mapStateToProps, mapDispatchToProps)(IntegratedEmailSender);
