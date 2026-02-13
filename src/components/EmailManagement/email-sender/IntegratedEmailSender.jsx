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

const LazyEditor = lazy(() =>
  import('@tinymce/tinymce-react').then(module => ({ default: module.Editor })),
);

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
    }, [youtubeId, qualityIndex, qualities.length, onImageLoadStatusChange, variable.name]);

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
                      <Alert color="danger" className="mb-0">
                        <div className="d-flex align-items-start">
                          <FaExclamationTriangle className="me-2 mt-1" />
                          <div>
                            <strong>Invalid Image/Video URL</strong>
                            <div className="mt-1" style={{ fontSize: '0.875rem' }}>
                              {youtubeId
                                ? `The YouTube video "${youtubeId}" could not be loaded. Please verify the video exists and is publicly accessible.`
                                : 'The provided URL is not a valid image or YouTube video. Please provide a direct image URL (.jpg, .png, .gif) or a valid YouTube link.'}
                            </div>
                          </div>
                        </div>
                      </Alert>
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
  showDraftNotification: false,
  draftAge: null,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  showOfflineWarning: false,
};

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

  const getCurrentModeFromURL = useCallback(() => {
    const urlParams = new URLSearchParams(location.search);
    const mode = urlParams.get('mode');
    if (mode === EMAIL_MODES.CUSTOM) return EMAIL_MODES.CUSTOM;
    if (mode === EMAIL_MODES.WEEKLY_UPDATE) return EMAIL_MODES.WEEKLY_UPDATE;
    return EMAIL_MODES.TEMPLATES;
  }, [location.search]);

  const [emailMode, setEmailMode] = useState(() => {
    const urlParams = new URLSearchParams(location.search);
    const mode = urlParams.get('mode');
    if (mode === EMAIL_MODES.CUSTOM) return EMAIL_MODES.CUSTOM;
    if (mode === EMAIL_MODES.WEEKLY_UPDATE) return EMAIL_MODES.WEEKLY_UPDATE;
    return EMAIL_MODES.TEMPLATES;
  });

  const [state, dispatch] = useReducer(emailReducer, initialEmailState);

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

  const abortControllerRef = useRef(null);
  const timeoutRefs = useRef([]);
  const progressIntervalRef = useRef(null);
  const editorLoadTimeoutRef = useRef(null);

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

  const updateModeURL = useCallback(
    mode => {
      const urlParams = new URLSearchParams(location.search);
      urlParams.delete('view');
      urlParams.delete('templateId');

      if (mode === EMAIL_MODES.TEMPLATES) {
        urlParams.delete('mode');
      } else {
        urlParams.set('mode', mode);
      }

      const newSearch = urlParams.toString();
      const newURL = `${location.pathname}${newSearch ? `?${newSearch}` : ''}`;
      history.replace(newURL);
    },
    [location.search, location.pathname, history],
  );

  const handleModeChange = useCallback(
    mode => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

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

      setEmailMode(mode);
      updateModeURL(mode);
    },
    [updateModeURL],
  );

  const resetAllStates = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

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

  useEffect(() => {
    const newMode = getCurrentModeFromURL();
    if (newMode !== emailMode) {
      resetAllStates();
      setEmailMode(newMode);
    }
  }, [location.search, emailMode, resetAllStates, getCurrentModeFromURL]);

  useEffect(() => {
    abortControllerRef.current = new AbortController();

    const fetchTemplatesWithProgress = async () => {
      try {
        dispatch({ type: 'SET_LOADING_PROGRESS', payload: 0 });
        dispatch({ type: 'SET_API_ERROR', payload: null });
        dispatch({ type: 'SET_SHOW_RETRY_OPTIONS', payload: false });

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
          sortBy: 'updated_at',
          sortOrder: 'desc',
          includeEmailContent: false,
        });

        dispatch({ type: 'SET_LOADING_PROGRESS', payload: 100 });
        dispatch({ type: 'SET_LAST_SUCCESSFUL_LOAD', payload: new Date() });
        clearInterval(progressInterval);

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

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [fetchEmailTemplates]);

  useEffect(() => {
    if (preSelectedTemplate && templates && templates.length > 0) {
      dispatch({ type: 'SET_SELECTED_TEMPLATE', payload: preSelectedTemplate });
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

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
      timeoutRefs.current = [];
      resetAllStates();
    };
  }, [resetAllStates]);

  useEffect(() => {
    if (hasDraft()) {
      const age = getDraftAge();
      dispatch({ type: 'SET_DRAFT_AGE', payload: age });
      dispatch({ type: 'SET_SHOW_DRAFT_NOTIFICATION', payload: true });
    }
  }, []);

  useEffect(() => {
    let offlineToastId = null;

    const handleOnline = () => {
      if (offlineToastId !== null) {
        toast.dismiss(offlineToastId);
        offlineToastId = null;
      }
      dispatch({ type: 'SET_IS_ONLINE', payload: true });
      dispatch({ type: 'SET_SHOW_OFFLINE_WARNING', payload: false });
      toast.success('Connection restored!', { autoClose: 2000 });
    };

    const handleOffline = () => {
      dispatch({ type: 'SET_IS_ONLINE', payload: false });
      dispatch({ type: 'SET_SHOW_OFFLINE_WARNING', payload: true });
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
      if (offlineToastId !== null) {
        toast.dismiss(offlineToastId);
      }
    };
  }, []);

  useEffect(() => {
    if (
      !selectedTemplate &&
      !customContent.trim() &&
      !customSubject.trim() &&
      !recipients.trim() &&
      Object.keys(variableValues).length === 0
    ) {
      return;
    }

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
    }, 1000);

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

  const handleRetry = useCallback(async () => {
    if (isRetrying) return;

    dispatch({ type: 'SET_IS_RETRYING', payload: true });
    dispatch({ type: 'INCREMENT_RETRY_COUNT' });
    dispatch({ type: 'SET_API_ERROR', payload: null });
    dispatch({ type: 'SET_LOADING_PROGRESS', payload: 0 });
    dispatch({ type: 'SET_SHOW_RETRY_OPTIONS', payload: false });

    toast.info(`Retrying to load templates... (Attempt ${retryCount + 1})`, {
      autoClose: 1000,
    });

    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

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

      dispatch({ type: 'SET_RETRY_COUNT', payload: 0 });
    } catch (err) {
      if (err.name !== 'AbortError') {
        const errorMessage = `Retry failed: ${err.message || 'Unknown error'}`;
        dispatch({ type: 'SET_API_ERROR', payload: errorMessage });
        dispatch({ type: 'SET_SHOW_RETRY_OPTIONS', payload: true });
        toast.error(errorMessage, { autoClose: 5000 });
      }
    } finally {
      dispatch({ type: 'SET_IS_RETRYING', payload: false });
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }
  }, [fetchEmailTemplates, clearEmailTemplateError, isRetrying, retryCount]);

  const clearError = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    dispatch({ type: 'SET_API_ERROR', payload: null });
    dispatch({ type: 'SET_RETRY_COUNT', payload: 0 });
    dispatch({ type: 'SET_IS_RETRYING', payload: false });
    clearEmailTemplateError();
  }, [clearEmailTemplateError]);

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
      dispatch({ type: 'SET_VARIABLE_VALUES', payload: {} });
      dispatch({ type: 'SET_VALIDATION_ERRORS', payload: {} });
      dispatch({ type: 'SET_SHOW_PREVIEW_MODAL', payload: false });
      dispatch({ type: 'SET_FULL_TEMPLATE_CONTENT', payload: null });
      dispatch({ type: 'SET_API_ERROR', payload: null });

      if (!template) {
        dispatch({ type: 'SET_SELECTED_TEMPLATE', payload: null });
        return;
      }

      const hasFullData =
        Array.isArray(template.variables) && (template.html_content || template.subject);

      if (!hasFullData) {
        toast.info('Loading template details...', { autoClose: 1000 });

        try {
          const fullTemplate = await fetchFullTemplateContent(template._id);
          if (fullTemplate) {
            dispatch({ type: 'SET_SELECTED_TEMPLATE', payload: fullTemplate });
            initializeVariableValues(fullTemplate);
            dispatch({ type: 'SET_FULL_TEMPLATE_CONTENT', payload: fullTemplate });

            if (fullTemplate.variables && fullTemplate.variables.length > 0) {
              toast.success(`Template loaded with ${fullTemplate.variables.length} variable(s)`, {
                autoClose: 2000,
              });
            }
          }
        } catch (error) {
          console.error('Failed to load full template:', error);

          const errorMessage =
            error.response?.data?.message || error.message || 'Failed to load template variables';

          toast.error(
            `Failed to load template details: ${errorMessage}. Please try selecting the template again or refresh the page.`,
            { autoClose: 5000 },
          );

          dispatch({
            type: 'UPDATE_VALIDATION_ERROR',
            payload: {
              field: 'template',
              error:
                'Failed to load template variables. Please try again or select a different template.',
            },
          });

          dispatch({ type: 'SET_SELECTED_TEMPLATE', payload: null });
          return;
        }
      } else {
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
  const extractImageFromSource = useCallback(Validators.extractImageFromSource, []);

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

    if (useTemplate && selectedTemplate) {
      const varErrors = validateTemplateVariables(selectedTemplate, variableValues);
      Object.assign(errors, varErrors);
    }

    dispatch({ type: 'SET_VALIDATION_ERRORS', payload: errors });
    return Object.keys(errors).length === 0;
  }, [useTemplate, selectedTemplate, customContent, customSubject, variableValues]);

  const getPreviewContent = useCallback(() => {
    if (!useTemplate || !selectedTemplate) {
      return { subject: customSubject, content: customContent };
    }

    if (backendPreviewData) {
      return {
        subject: backendPreviewData.subject || customSubject,
        content: backendPreviewData.htmlContent || backendPreviewData.html_content || customContent,
      };
    }

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

  const handlePreview = useCallback(async () => {
    if (!validateForPreview()) {
      toast.warning('Please fix validation errors before previewing', {
        autoClose: 1000,
      });
      return;
    }

    if (!useTemplate || !selectedTemplate) {
      dispatch({ type: 'SET_SHOW_PREVIEW_MODAL', payload: true });
      return;
    }

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

  const handleSendEmail = useCallback(() => {
    if (!validateForm()) {
      return;
    }
    handlePreview();
  }, [validateForm, handlePreview]);

  const handleSendFromPreview = useCallback(async () => {
    dispatch({ type: 'SET_IS_SENDING', payload: true });

    try {
      if (useTemplate && selectedTemplate) {
        const templateData = fullTemplateContent || selectedTemplate;

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

        dispatch({ type: 'SET_IS_SENDING', payload: false });
        dispatch({ type: 'SET_SHOW_PREVIEW_MODAL', payload: false });
        dispatch({ type: 'SET_BACKEND_PREVIEW_DATA', payload: null });
        dispatch({ type: 'SET_PREVIEW_ERROR', payload: null });
        clearDraft();
        resetAllStates();
      } else {
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

        dispatch({ type: 'SET_IS_SENDING', payload: false });
        dispatch({ type: 'SET_SHOW_PREVIEW_MODAL', payload: false });
        dispatch({ type: 'SET_BACKEND_PREVIEW_DATA', payload: null });
        dispatch({ type: 'SET_PREVIEW_ERROR', payload: null });
        clearDraft();
        resetAllStates();
      }
    } catch (error) {
      dispatch({ type: 'SET_IS_SENDING', payload: false });

      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      toast.error(`Failed to send email: ${errorMessage}`);

      dispatch({
        type: 'UPDATE_VALIDATION_ERROR',
        payload: { field: 'general', error: errorMessage },
      });
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
      if (draft.emailMode && draft.emailMode !== emailMode) {
        setEmailMode(draft.emailMode);
        updateModeURL(draft.emailMode);
      }

      if (draft.emailMode === EMAIL_MODES.TEMPLATES && draft.selectedTemplateId && templates) {
        const template = templates.find(t => t._id === draft.selectedTemplateId);
        if (template) {
          await handleTemplateSelect(template);
        }
      }

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
      clearDraft();
      dispatch({ type: 'RESET_FORM' });
      dispatch({ type: 'SET_SHOW_DRAFT_NOTIFICATION', payload: false });
      dispatch({ type: 'SET_DRAFT_AGE', payload: null });
      dispatch({ type: 'SET_BACKEND_PREVIEW_DATA', payload: null });
      dispatch({ type: 'SET_FULL_TEMPLATE_CONTENT', payload: null });
      toast.success('Draft cleared successfully', { autoClose: 2000 });
    }
  }, []);

  const TINY_MCE_INIT_OPTIONS = useMemo(() => getEmailSenderConfig(darkMode), [darkMode]);

  useEffect(() => {
    dispatch({ type: 'SET_BACKEND_PREVIEW_DATA', payload: null });
    dispatch({ type: 'SET_PREVIEW_ERROR', payload: null });
  }, [variableValues, selectedTemplate?._id]);

  const previewContent = useMemo(() => getPreviewContent(), [getPreviewContent]);

  useEffect(() => {
    const handleError = error => {
      dispatch({ type: 'SET_COMPONENT_ERROR', payload: error.message });
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  useEffect(() => {
    if (componentError) {
      dispatch({ type: 'SET_COMPONENT_ERROR', payload: null });
    }
  }, [useTemplate, componentError]);

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
      {/* Page Title - DARK MODE FIXED */}
      <div className="page-title-container mb-3">
        <h2
          className="page-title"
          style={{
            fontSize: '1.75rem',
            fontWeight: 600,
            color: darkMode ? '#f8f9fa' : '#343a40',
            margin: 0,
          }}
        >
          Send Email
        </h2>
      </div>

      {/* Draft Notification */}
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

      {/* EMAIL CONTROLS ROW */}
      <div
        className="email-controls-container mb-3"
        style={{
          width: '100%',
          marginBottom: '2rem',
          paddingBottom: '1.25rem',
          borderBottom: darkMode ? '1px solid #4a5568' : '1px solid #e9ecef',
        }}
      >
        <div
          className="email-controls-row"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '2rem',
            flexWrap: 'wrap',
            padding: '0.5rem 0',
          }}
        >
          {/* Email Mode Selector */}
          <div
            className="mode-buttons"
            role="group"
            aria-label="Email composition mode"
            style={{
              display: 'flex',
              gap: '0.75rem',
              flexShrink: 0,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Button
              color={emailMode === EMAIL_MODES.TEMPLATES ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => handleModeChange(EMAIL_MODES.TEMPLATES)}
              aria-pressed={emailMode === EMAIL_MODES.TEMPLATES}
            >
              📧 Templates
            </Button>
            <Button
              color={emailMode === EMAIL_MODES.CUSTOM ? 'success' : 'outline-success'}
              size="sm"
              onClick={() => handleModeChange(EMAIL_MODES.CUSTOM)}
              aria-pressed={emailMode === EMAIL_MODES.CUSTOM}
            >
              ✏️ Custom
            </Button>
            <Button
              color={emailMode === EMAIL_MODES.WEEKLY_UPDATE ? 'info' : 'outline-info'}
              size="sm"
              onClick={() => handleModeChange(EMAIL_MODES.WEEKLY_UPDATE)}
              aria-pressed={emailMode === EMAIL_MODES.WEEKLY_UPDATE}
            >
              📰 Weekly Update
            </Button>
          </div>

          {/* Action Buttons */}
          <div
            className="action-buttons"
            style={{
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
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

      {/* General Validation Error */}
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

      {/* Form */}
      {emailMode !== EMAIL_MODES.WEEKLY_UPDATE && (
        <Form style={{ padding: 0, marginTop: '1.5rem' }}>
          {/* Template Selection - DARK MODE FIXED */}
          {useTemplate && (
            <FormGroup style={{ marginBottom: '1.75rem' }}>
              <Label
                style={{
                  fontWeight: 600,
                  color: darkMode ? '#f8f9fa' : '#343a40',
                  fontSize: '1rem',
                  marginBottom: '0.75rem',
                  display: 'block',
                }}
              >
                Select Template *
              </Label>
              {loading ? (
                <TemplateSelectLoader />
              ) : error || apiError || (templates && templates.length === 0) ? (
                <div className="template-selection-container">
                  <Input
                    type="select"
                    value=""
                    disabled
                    style={{
                      background: darkMode ? '#2d3748' : '#e9ecef',
                      borderColor: darkMode ? '#4a5568' : '#ced4da',
                      color: darkMode ? '#a0aec0' : '#6c757d',
                      opacity: 0.6,
                    }}
                  >
                    <option>Please select a template</option>
                  </Input>

                  <div className="template-error-message">
                    <FaExclamationTriangle className="error-icon" />
                    <span className="error-text">
                      {error || apiError
                        ? 'Error loading templates. Please try again.'
                        : 'No templates available. Please create a template first.'}
                    </span>
                  </div>

                  {(error || apiError) && (
                    <div className="template-retry-simple">
                      <Button
                        color="outline-primary"
                        size="sm"
                        onClick={handleRetry}
                        disabled={isRetrying}
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
                    style={{
                      background: darkMode ? '#2d3748' : 'white',
                      borderColor: darkMode ? '#4a5568' : '#ced4da',
                      color: darkMode ? '#e2e8f0' : '#495057',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.9rem',
                      borderRadius: '6px',
                    }}
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
                      <small
                        style={{
                          fontSize: '0.8rem',
                          color: darkMode ? '#a0aec0' : '#6c757d',
                          display: 'block',
                        }}
                      >
                        {templates.length} template{templates.length !== 1 ? 's' : ''} available
                        {lastSuccessfulLoad && (
                          <span className="ms-2 text-success">
                            • Last updated: {lastSuccessfulLoad.toLocaleTimeString()}
                          </span>
                        )}
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

          {/* Custom Email Fields - DARK MODE FIXED */}
          {!useTemplate && (
            <>
              <FormGroup style={{ marginBottom: '1.75rem' }}>
                <Label
                  style={{
                    fontWeight: 600,
                    color: darkMode ? '#f8f9fa' : '#343a40',
                    fontSize: '1rem',
                    marginBottom: '0.75rem',
                    display: 'block',
                  }}
                >
                  Subject *
                </Label>
                <Input
                  type="text"
                  value={customSubject}
                  onChange={e => dispatch({ type: 'SET_CUSTOM_SUBJECT', payload: e.target.value })}
                  invalid={!!validationErrors.customSubject}
                  placeholder="Enter email subject"
                  style={{
                    background: darkMode ? '#2d3748' : 'white',
                    borderColor: darkMode ? '#4a5568' : '#ced4da',
                    color: darkMode ? '#e2e8f0' : '#495057',
                    padding: '0.75rem',
                    fontSize: '0.9rem',
                    borderRadius: '6px',
                  }}
                />
                {validationErrors.customSubject && (
                  <div className="invalid-feedback d-block">{validationErrors.customSubject}</div>
                )}
              </FormGroup>

              <FormGroup style={{ marginBottom: '1.75rem' }}>
                <Label
                  style={{
                    fontWeight: 600,
                    color: darkMode ? '#f8f9fa' : '#343a40',
                    fontSize: '1rem',
                    marginBottom: '0.75rem',
                    display: 'block',
                  }}
                >
                  Content *
                </Label>
                <div className="editor-container">
                  {!isEditorLoaded && !editorError && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2rem',
                        gap: '8px',
                      }}
                    >
                      <Spinner size="sm" />
                      <span>Loading editor...</span>
                    </div>
                  )}

                  {editorError && (
                    <FallbackComponent
                      title="Editor Failed to Load"
                      message="The rich text editor couldn't load."
                      onRetry={() => {
                        dispatch({ type: 'SET_EDITOR_ERROR', payload: null });
                        dispatch({ type: 'SET_EDITOR_LOADED', payload: false });
                      }}
                      onDismiss={() => dispatch({ type: 'SET_EDITOR_ERROR', payload: null })}
                      retryCount={retryCount}
                      showRetryOptions={true}
                    />
                  )}

                  <Suspense
                    fallback={
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '2rem',
                          gap: '8px',
                        }}
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
                        init={TINY_MCE_INIT_OPTIONS}
                      />
                    )}
                  </Suspense>
                </div>

                {validationErrors.customContent && (
                  <div className="text-danger mt-1">{validationErrors.customContent}</div>
                )}
              </FormGroup>
            </>
          )}

          {/* Template Variables */}
          {useTemplate &&
            selectedTemplate &&
            selectedTemplate.variables &&
            selectedTemplate.variables.length > 0 && (
              <div
                style={{
                  marginTop: '1.5rem',
                  marginBottom: '1.5rem',
                  padding: '1.25rem',
                  background: darkMode ? '#1a202c' : '#f8f9fa',
                  borderRadius: '8px',
                  border: darkMode ? '1px solid #2d3748' : '1px solid #e9ecef',
                }}
              >
                <div
                  style={{
                    marginBottom: '1.25rem',
                    paddingBottom: '0.75rem',
                    borderBottom: darkMode ? '2px solid #4a5568' : '2px solid #dee2e6',
                  }}
                >
                  <h6
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      color: darkMode ? '#e2e8f0' : '#343a40',
                      margin: 0,
                    }}
                  >
                    Template Variables
                    <Badge color="info" className="ms-2">
                      {selectedTemplate.variables.length} variable
                      {selectedTemplate.variables.length !== 1 ? 's' : ''}
                    </Badge>
                  </h6>
                </div>

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
                                error: ok ? null : `${name} is required`,
                              },
                            });
                          }}
                        />
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            )}

          {/* Email Distribution - DARK MODE FIXED */}
          <FormGroup
            style={{
              marginTop: '2rem',
              paddingTop: '1.25rem',
              borderTop: darkMode ? '1px solid #4a5568' : '1px solid #e9ecef',
              marginBottom: '1.75rem',
            }}
          >
            <Label
              style={{
                fontWeight: 600,
                color: darkMode ? '#f8f9fa' : '#343a40',
                fontSize: '1rem',
                marginBottom: '0.75rem',
                display: 'block',
              }}
            >
              Email Distribution *
            </Label>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.85rem 1.5rem',
                  border:
                    emailDistribution === EMAIL_DISTRIBUTION.SPECIFIC
                      ? darkMode
                        ? '2px solid #63b3ed'
                        : '2px solid #007bff'
                      : darkMode
                      ? '2px solid #4a5568'
                      : '2px solid #dee2e6',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background:
                    emailDistribution === EMAIL_DISTRIBUTION.SPECIFIC
                      ? darkMode
                        ? '#2b6cb0'
                        : '#e7f3ff'
                      : darkMode
                      ? '#2d3748'
                      : 'white',
                  color:
                    emailDistribution === EMAIL_DISTRIBUTION.SPECIFIC
                      ? darkMode
                        ? '#e2e8f0'
                        : '#007bff'
                      : darkMode
                      ? '#e2e8f0'
                      : '#343a40',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                }}
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
                  style={{ marginRight: '0.5rem', width: '18px', height: '18px' }}
                />
                <span style={{ fontSize: '1.2rem', margin: '0 0.5rem' }}>✏️</span>
                Specific Recipients
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.85rem 1.5rem',
                  border:
                    emailDistribution === EMAIL_DISTRIBUTION.BROADCAST
                      ? darkMode
                        ? '2px solid #63b3ed'
                        : '2px solid #007bff'
                      : darkMode
                      ? '2px solid #4a5568'
                      : '2px solid #dee2e6',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background:
                    emailDistribution === EMAIL_DISTRIBUTION.BROADCAST
                      ? darkMode
                        ? '#2b6cb0'
                        : '#e7f3ff'
                      : darkMode
                      ? '#2d3748'
                      : 'white',
                  color:
                    emailDistribution === EMAIL_DISTRIBUTION.BROADCAST
                      ? darkMode
                        ? '#e2e8f0'
                        : '#007bff'
                      : darkMode
                      ? '#e2e8f0'
                      : '#343a40',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                }}
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
                  style={{ marginRight: '0.5rem', width: '18px', height: '18px' }}
                />
                <span style={{ fontSize: '1.2rem', margin: '0 0.5rem' }}>🚀</span>
                Broadcast to All Subscribers
              </label>
            </div>

            {/* Recipients - DARK MODE FIXED */}
            {emailDistribution === EMAIL_DISTRIBUTION.SPECIFIC && (
              <div style={{ marginTop: '1rem' }}>
                <Label
                  style={{
                    fontWeight: 600,
                    color: darkMode ? '#f8f9fa' : '#343a40',
                    fontSize: '1rem',
                    marginBottom: '0.75rem',
                    display: 'block',
                  }}
                >
                  Recipients *
                </Label>
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
                  style={{
                    background: darkMode ? '#2d3748' : 'white',
                    borderColor: darkMode ? '#4a5568' : '#ced4da',
                    color: darkMode ? '#e2e8f0' : '#495057',
                    padding: '0.75rem',
                    fontSize: '0.9rem',
                    borderRadius: '6px',
                    minHeight: '120px',
                    lineHeight: '1.6',
                  }}
                />
                {validationErrors.recipients && (
                  <div className="invalid-feedback d-block">{validationErrors.recipients}</div>
                )}
              </div>
            )}
          </FormGroup>
        </Form>
      )}

      {/* Preview Modal */}
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
      >
        <ModalHeader
          toggle={() => {
            if (!isSending) {
              dispatch({ type: 'SET_SHOW_PREVIEW_MODAL', payload: false });
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
                  </>
                )}
              </div>

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
                  </div>
                </div>
              )}

              <Alert color="warning" className="mb-0">
                <FaExclamationTriangle className="me-2" />
                <strong>Please review carefully.</strong> Once sent, this cannot be undone.
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

IntegratedEmailSender.propTypes = {
  templates: PropTypes.array,
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
