import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Alert,
  Container,
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  CustomInput,
  Button,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  UncontrolledDropdown,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
} from 'reactstrap';
import './WeeklySummary.css';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { Editor } from '@tinymce/tinymce-react';
import moment from 'moment';
import 'moment-timezone';
import Joi from 'joi-browser';
import { toast } from 'react-toastify';
import classnames from 'classnames';
import { getUserProfile } from '~/actions/userProfile';
import { boxStyle, boxStyleDark } from '~/styles';
import {
  DEV_ADMIN_ACCOUNT_EMAIL_DEV_ENV_ONLY,
  DEV_ADMIN_ACCOUNT_CUSTOM_WARNING_MESSAGE_DEV_ENV_ONLY,
  PROTECTED_ACCOUNT_MODIFICATION_WARNING_MESSAGE,
} from '../../utils/constants';
import { WeeklySummaryContentTooltip, MediaURLTooltip } from './WeeklySummaryTooltips';
import SkeletonLoading from '../common/SkeletonLoading';
import DueDateTime from './DueDateTime';
import {
  getWeeklySummaries as getUserWeeklySummaries,
  updateWeeklySummaries,
} from '../../actions/weeklySummaries';
import CurrentPromptModal from './CurrentPromptModal';

// Images are not allowed in weekly summary
const customImageUploadHandler = () =>
  new Promise((_, reject) => {
    reject({ message: 'Pictures are not allowed here!', remove: true });
  });

function WeeklySummary({
  isDashboard,
  isPopup,
  userRole,
  displayUserId,
  setPopup,
  displayUserEmail,
  isNotAllowedToEdit,
  darkMode,
}) {
  const dispatch = useDispatch();

  // Get state from Redux with useSelector hooks
  const currentUser = useSelector(state => state.auth.user);
  const { summaries, loading, fetchError } = useSelector(state => state.weeklySummaries);

  // Cache control with useRef
  const lastFetchTimeRef = useRef({});
  const cacheTimeout = 5 * 60 * 1000; // 5 minutes

  // Initialize date variables with useMemo to avoid recreation
  const initialDueDate = useMemo(
    () =>
      moment()
        .tz('America/Los_Angeles')
        .endOf('week')
        .toISOString(),
    [],
  );

  const initialDueDateLastWeek = useMemo(
    () =>
      moment(initialDueDate)
        .subtract(1, 'weeks')
        .toISOString(),
    [initialDueDate],
  );

  const initialDueDateBeforeLast = useMemo(
    () =>
      moment(initialDueDate)
        .subtract(2, 'weeks')
        .toISOString(),
    [initialDueDate],
  );

  const initialDueDateThreeWeeksAgo = useMemo(
    () =>
      moment(initialDueDate)
        .subtract(3, 'weeks')
        .toISOString(),
    [initialDueDate],
  );

  const initialSubmittedDate = useMemo(
    () =>
      moment()
        .tz('America/Los_Angeles')
        .toISOString(),
    [],
  );

  // Regex pattern for validation
  const regexPattern = useMemo(() => /^\s*(?:\S+(?:\s+|$)){50,}$/, []);

  // Form validation schemas with useMemo
  const fieldSchemas = useMemo(
    () => ({
      mediaUrl: Joi.string()
        .trim()
        .uri()
        .required()
        .label('Media URL'),

      summary: Joi.string()
        .allow('')
        .regex(regexPattern)
        .label('Minimum 50 words'),

      wordCount: Joi.number()
        .min(50)
        .allow(0)
        .label('word count must be greater than 50 words'),

      summaryLastWeek: Joi.string()
        .allow('')
        .regex(regexPattern)
        .label('Minimum 50 words'),

      summaryBeforeLast: Joi.string()
        .allow('')
        .regex(regexPattern)
        .label('Minimum 50 words'),

      summaryThreeWeeksAgo: Joi.string()
        .allow('')
        .regex(regexPattern)
        .label('Minimum 50 words'),

      mediaConfirm: Joi.boolean().invalid(false),
      editorConfirm: Joi.boolean().invalid(false),
      proofreadConfirm: Joi.boolean().invalid(false),
    }),
    [regexPattern],
  );

  const schema = useMemo(
    () =>
      Joi.object({
        mediaUrl: Joi.string()
          .trim()
          .uri()
          .required()
          .label('Media URL'),

        summary: Joi.string()
          .allow('')
          .regex(regexPattern)
          .label('Minimum 50 words'),

        wordCount: Joi.number()
          .min(50)
          .label('word count must be greater than 50 words'),

        summaryLastWeek: Joi.string()
          .allow('')
          .regex(regexPattern)
          .label('Minimum 50 words'),

        summaryBeforeLast: Joi.string()
          .allow('')
          .regex(regexPattern)
          .label('Minimum 50 words'),

        summaryThreeWeeksAgo: Joi.string()
          .allow('')
          .regex(regexPattern)
          .label('Minimum 50 words'),

        weeklySummariesCount: Joi.any(),

        mediaConfirm: Joi.boolean().invalid(false),
        editorConfirm: Joi.boolean().invalid(false),
        proofreadConfirm: Joi.boolean().invalid(false),
      }),
    [regexPattern],
  );

  // Component state
  const [summariesCountShowing, setSummariesCountShowing] = useState(0);
  const [originSummaries, setOriginSummaries] = useState({
    summary: '',
    summaryLastWeek: '',
    summaryBeforeLast: '',
    summaryThreeWeeksAgo: '',
  });

  const [formElements, setFormElements] = useState({
    summary: '',
    wordCount: 0,
    summaryLastWeek: '',
    summaryBeforeLast: '',
    summaryThreeWeeksAgo: '',
    mediaUrl: '',
    weeklySummariesCount: 0,
    mediaConfirm: false,
    editorConfirm: false,
    proofreadConfirm: false,
  });

  const [dueDate, setDueDate] = useState(initialDueDate);
  const [dueDateLastWeek, setDueDateLastWeek] = useState(initialDueDateLastWeek);
  const [dueDateBeforeLast, setDueDateBeforeLast] = useState(initialDueDateBeforeLast);
  const [dueDateThreeWeeksAgo, setDueDateThreeWeeksAgo] = useState(initialDueDateThreeWeeksAgo);

  const [uploadDatesElements, setUploadDatesElements] = useState({
    uploadDate: initialDueDate,
    uploadDateLastWeek: initialDueDateLastWeek,
    uploadDateBeforeLast: initialDueDateBeforeLast,
    uploadDateThreeWeeksAgo: initialDueDateThreeWeeksAgo,
  });

  const [submittedDate, setSubmittedDate] = useState(initialSubmittedDate);
  const [submittedCountInFourWeeks, setSubmittedCountInFourWeeks] = useState(0);
  const [activeTab, setActiveTab] = useState('1');
  const [errors, setErrors] = useState({});
  const [editPopup, setEditPopup] = useState(false);
  const [mediaChangeConfirm, setMediaChangeConfirm] = useState(false);
  const [mediaFirstChange, setMediaFirstChange] = useState(false);
  const [moveSelect, setMoveSelect] = useState('-1');
  const [movePopup, setMovePopup] = useState(false);
  const [moveConfirm, setMoveConfirm] = useState(false);
  const [diffInSubmittedCount, setDiffInSubmittedCount] = useState(0);

  // Fetch weekly summaries with cache control
  const fetchWeeklySummaries = useCallback(
    async userId => {
      if (!userId) return;

      const now = Date.now();
      const cacheKey = `weeklySummaries_${userId}`;
      const lastFetch = lastFetchTimeRef.current[cacheKey];

      // Only fetch if cache is expired or doesn't exist
      if (!lastFetch || now - lastFetch > cacheTimeout) {
        await dispatch(getUserWeeklySummaries(userId));
        lastFetchTimeRef.current[cacheKey] = now;
      }
    },
    [dispatch, cacheTimeout],
  );

  // Check if date belongs to a particular week
  const doesDateBelongToWeek = useCallback((dueDate, weekIndex) => {
    const pstStartOfWeek = moment()
      .tz('America/Los_Angeles')
      .startOf('week')
      .subtract(weekIndex, 'week');

    const pstEndOfWeek = moment()
      .tz('America/Los_Angeles')
      .endOf('week')
      .subtract(weekIndex, 'week');

    const fromDate = moment(pstStartOfWeek).toDate();
    const toDate = moment(pstEndOfWeek).toDate();

    return moment(dueDate).isBetween(fromDate, toDate, undefined, '[]');
  }, []);

  // Initial data loading with cache awareness
  useEffect(() => {
    const initializeData = async () => {
      const userId = displayUserId || currentUser.userid;
      await fetchWeeklySummaries(userId);

      if (summaries) {
        const { mediaUrl, weeklySummaries, weeklySummariesCount } = summaries;

        // Extract summaries
        const summary = (weeklySummaries && weeklySummaries[0] && weeklySummaries[0].summary) || '';
        const summaryLastWeek =
          (weeklySummaries && weeklySummaries[1] && weeklySummaries[1].summary) || '';
        const summaryBeforeLast =
          (weeklySummaries && weeklySummaries[2] && weeklySummaries[2].summary) || '';
        const summaryThreeWeeksAgo =
          (weeklySummaries && weeklySummaries[3] && weeklySummaries[3].summary) || '';

        // Count submissions
        let submittedCount = 0;
        if (summary) submittedCount++;
        if (summaryLastWeek) submittedCount++;
        if (summaryBeforeLast) submittedCount++;
        if (summaryThreeWeeksAgo) submittedCount++;

        // Update due dates
        const dueDateThisWeek = weeklySummaries && weeklySummaries[0] && weeklySummaries[0].dueDate;
        const updatedDueDate = moment(dueDateThisWeek).isBefore(initialDueDate)
          ? initialDueDate
          : dueDateThisWeek;

        const updatedDueDateLastWeek = moment(updatedDueDate)
          .subtract(1, 'weeks')
          .toISOString();
        const updatedDueDateBeforeLast = moment(updatedDueDate)
          .subtract(2, 'weeks')
          .toISOString();
        const updatedDueDateThreeWeeksAgo = moment(updatedDueDate)
          .subtract(3, 'weeks')
          .toISOString();

        // Get upload dates
        const getUploadDate = (index, summary, dueDatesList) => {
          return summary !== '' &&
            weeklySummaries &&
            weeklySummaries[index] &&
            weeklySummaries[index].uploadDate
            ? weeklySummaries[index].uploadDate
            : dueDatesList[index];
        };

        const summaryList = [summary, summaryLastWeek, summaryBeforeLast, summaryThreeWeeksAgo];
        const dueDatesList = [
          updatedDueDate,
          updatedDueDateLastWeek,
          updatedDueDateBeforeLast,
          updatedDueDateThreeWeeksAgo,
        ];

        const uploadDate = getUploadDate(0, summaryList[0], dueDatesList);
        const uploadDateLastWeek = getUploadDate(1, summaryList[1], dueDatesList);
        const uploadDateBeforeLast = getUploadDate(2, summaryList[2], dueDatesList);
        const uploadDateThreeWeeksAgo = getUploadDate(3, summaryList[3], dueDatesList);

        // Update state
        setOriginSummaries({
          summary,
          summaryLastWeek,
          summaryBeforeLast,
          summaryThreeWeeksAgo,
        });

        setFormElements({
          summary,
          summaryLastWeek,
          summaryBeforeLast,
          summaryThreeWeeksAgo,
          mediaUrl: mediaUrl || '',
          weeklySummariesCount: weeklySummariesCount || 0,
          wordCount: 0,
          mediaConfirm: false,
          editorConfirm: false,
          proofreadConfirm: false,
        });

        setUploadDatesElements({
          uploadDate,
          uploadDateLastWeek,
          uploadDateBeforeLast,
          uploadDateThreeWeeksAgo,
        });

        setDueDate(updatedDueDate);
        setDueDateLastWeek(updatedDueDateLastWeek);
        setDueDateBeforeLast(updatedDueDateBeforeLast);
        setDueDateThreeWeeksAgo(updatedDueDateThreeWeeksAgo);
        setSubmittedCountInFourWeeks(submittedCount);
      }
    };

    initializeData();
  }, [currentUser.userid, displayUserId, fetchWeeklySummaries, initialDueDate, summaries]);

  // Tab toggle with memoization
  const toggleTab = useCallback(
    tab => {
      if (activeTab !== tab) {
        setActiveTab(tab);
      }
    },
    [activeTab],
  );

  // Move popup toggle
  const toggleMovePopup = useCallback(() => {
    setMovePopup(prev => !prev);
  }, []);

  // Show popup toggle
  const toggleShowPopup = useCallback(() => {
    if (!mediaChangeConfirm) {
      setEditPopup(prev => !prev);
    } else {
      setEditPopup(false);
    }
  }, [mediaChangeConfirm]);

  // Handle move select
  const handleMoveSelect = useCallback(moveWeek => {
    setMoveSelect(moveWeek);
    setMovePopup(true);
  }, []);

  // Handle move operation
  const handleMove = useCallback(() => {
    if (isNotAllowedToEdit) {
      alert(PROTECTED_ACCOUNT_MODIFICATION_WARNING_MESSAGE);
      return formElements;
    }

    if (activeTab !== moveSelect) {
      const newFormElements = { ...formElements };
      let movedContent = '';

      // Extract content from active tab
      switch (activeTab) {
        case '1':
          movedContent = newFormElements.summary;
          newFormElements.summary = '';
          break;
        case '2':
          movedContent = newFormElements.summaryLastWeek;
          newFormElements.summaryLastWeek = '';
          break;
        case '3':
          movedContent = newFormElements.summaryBeforeLast;
          newFormElements.summaryBeforeLast = '';
          break;
        case '4':
          movedContent = newFormElements.summaryThreeWeeksAgo;
          newFormElements.summaryThreeWeeksAgo = '';
          break;
        default:
          break;
      }

      // Move content to target tab
      switch (moveSelect) {
        case '1':
          newFormElements.summary = movedContent;
          break;
        case '2':
          newFormElements.summaryLastWeek = movedContent;
          break;
        case '3':
          newFormElements.summaryBeforeLast = movedContent;
          break;
        case '4':
          newFormElements.summaryThreeWeeksAgo = movedContent;
          break;
        default:
          break;
      }

      return newFormElements;
    }

    return formElements;
  }, [activeTab, formElements, isNotAllowedToEdit, moveSelect]);

  // Form validation
  const validate = useCallback(() => {
    const options = { abortEarly: false };
    const { error } = schema.validate(formElements, options);

    if (!error) return {};

    return error.details.reduce((errs, { path: [key], message }) => {
      let customMessage;
      // Override for checkboxes
      if (key === 'mediaConfirm') {
        customMessage = 'Please confirm that you have provided the required media files.';
      } else if (key === 'editorConfirm') {
        customMessage = 'Please confirm that you used an AI editor to write your summary.';
      } else if (key === 'proofreadConfirm') {
        customMessage = 'Please confirm that you have proofread your summary.';
      } else {
        customMessage = message;
      }
      return { ...errs, [key]: customMessage };
    }, {});
  }, [formElements, schema]);

  // Validate individual property
  const validateProperty = useCallback(
    inputOrEvent => {
      const input = inputOrEvent.currentTarget || inputOrEvent;
      const { name, type, checked, value } = input;
      const attr = type === 'checkbox' ? checked : value;

      const rule = fieldSchemas[name];
      if (!rule) return null;

      const singleSchema = Joi.object({ [name]: rule });
      const { error } = singleSchema.validate({ [name]: attr });

      if (!error) return null;

      // Custom messages for checkboxes
      if (name === 'mediaConfirm') {
        return 'Please confirm that you have provided the required media files.';
      }
      if (name === 'editorConfirm') {
        return 'Please confirm that you used an AI editor to write your summary.';
      }
      if (name === 'proofreadConfirm') {
        return 'Please confirm that you have proofread your summary.';
      }

      return error.details[0].message;
    },
    [fieldSchemas],
  );

  // Validate editor property
  const validateEditorProperty = useCallback(
    (value, name) => {
      const rule = fieldSchemas[name];
      if (!rule) return null;

      const singleSchema = Joi.object({ [name]: rule });
      const { error } = singleSchema.validate({ [name]: value });
      return error ? error.details[0].message : null;
    },
    [fieldSchemas],
  );

  // Handle input change
  const handleInputChange = useCallback(
    event => {
      event.persist();
      const { name, value } = event.target;

      if (mediaChangeConfirm) {
        setErrors(prev => {
          const newErrors = { ...prev };
          const errorMessage = validateProperty(event.target);

          if (errorMessage) {
            newErrors[name] = errorMessage;
          } else {
            delete newErrors[name];
          }

          return newErrors;
        });

        setFormElements(prev => ({
          ...prev,
          [name]: value,
        }));
      } else {
        toggleShowPopup();
      }
    },
    [mediaChangeConfirm, validateProperty, toggleShowPopup],
  );

  // Handle media change
  const handleMediaChange = useCallback(() => {
    setMediaChangeConfirm(true);
    setMediaFirstChange(true);
    toggleShowPopup();
  }, [toggleShowPopup]);

  // Handle editor change
  const handleEditorChange = useCallback(
    (content, editor) => {
      // Filter blank paragraphs
      const filteredContent = content.replace(/<p>&nbsp;<\/p>/g, '');
      const wordCount = editor.plugins.wordcount.getCount();

      setErrors(prev => {
        const newErrors = { ...prev };
        const errorMessage = validateEditorProperty(filteredContent, editor.id);
        const errorWordCountMessage = validateEditorProperty(wordCount, 'wordCount');

        if (errorMessage) {
          newErrors[editor.id] = errorMessage;
        } else {
          delete newErrors[editor.id];
        }

        if (errorWordCountMessage) {
          newErrors.wordCount = errorWordCountMessage;
        } else {
          delete newErrors.wordCount;
        }

        return newErrors;
      });

      setFormElements(prev => ({
        ...prev,
        [editor.id]: content,
        wordCount,
      }));
    },
    [validateEditorProperty],
  );

  // Handle checkbox change
  const handleCheckboxChange = useCallback(
    event => {
      event.persist();
      const { name, checked } = event.target;

      setErrors(prev => {
        const newErrors = { ...prev };
        const errorMessage = validateProperty(event.target);

        if (errorMessage) {
          newErrors[name] = errorMessage;
        } else {
          delete newErrors[name];
        }

        return newErrors;
      });

      setFormElements(prev => ({
        ...prev,
        [name]: checked,
      }));
    },
    [validateProperty],
  );

  // Handle summary changes
  const handleChangeInSummary = useCallback(async () => {
    let newFormElements = { ...formElements };
    const newOriginSummaries = { ...originSummaries };
    const newUploadDatesElements = { ...uploadDatesElements };
    const dueDates = [dueDate, dueDateLastWeek, dueDateBeforeLast, dueDateThreeWeeksAgo];

    // Handle move if needed
    if (moveConfirm) {
      newFormElements = handleMove();
    }

    // Define arrays for easier processing
    const summaries = ['summary', 'summaryLastWeek', 'summaryBeforeLast', 'summaryThreeWeeksAgo'];
    const uploadDates = [
      'uploadDate',
      'uploadDateLastWeek',
      'uploadDateBeforeLast',
      'uploadDateThreeWeeksAgo',
    ];

    // Calculate current submitted count
    const currentSubmittedCount = summaries.reduce((count, summary) => {
      return newFormElements[summary] !== '' ? count + 1 : count;
    }, 0);

    // Calculate difference in submitted count
    const diffInSubmittedCount = currentSubmittedCount - submittedCountInFourWeeks;
    if (diffInSubmittedCount !== 0) {
      setSummariesCountShowing(newFormElements.weeklySummariesCount + diffInSubmittedCount);
    }

    // Update summaries that changed
    for (let i = 0; i < summaries.length; i++) {
      const summary = summaries[i];
      const uploadDate = uploadDates[i];

      if (newFormElements[summary] !== newOriginSummaries[summary]) {
        newOriginSummaries[summary] = newFormElements[summary];
        newUploadDatesElements[uploadDate] =
          newFormElements[summary] === '' ? dueDates[i] : submittedDate;
      }
    }

    setFormElements(newFormElements);
    setUploadDatesElements(newUploadDatesElements);
    setOriginSummaries(newOriginSummaries);

    // Construct data for API call
    const modifiedWeeklySummaries = {
      mediaUrl: newFormElements.mediaUrl.trim(),
      weeklySummaries: summaries.map((summary, i) => ({
        summary: newFormElements[summary],
        dueDate: dueDates[i],
        uploadDate: newUploadDatesElements[uploadDates[i]],
      })),
      weeklySummariesCount: newFormElements.weeklySummariesCount + diffInSubmittedCount,
    };

    // Update weekly summaries via API
    return await dispatch(
      updateWeeklySummaries(displayUserId || currentUser.userid, modifiedWeeklySummaries),
    );
  }, [
    formElements,
    originSummaries,
    uploadDatesElements,
    dueDate,
    dueDateLastWeek,
    dueDateBeforeLast,
    dueDateThreeWeeksAgo,
    moveConfirm,
    submittedDate,
    submittedCountInFourWeeks,
    handleMove,
    displayUserId,
    currentUser.userid,
    dispatch,
  ]);

  // Handler for move save
  const handleMoveSave = useCallback(
    async event => {
      if (isNotAllowedToEdit) {
        if (displayUserEmail === DEV_ADMIN_ACCOUNT_EMAIL_DEV_ENV_ONLY) {
          alert(DEV_ADMIN_ACCOUNT_CUSTOM_WARNING_MESSAGE_DEV_ENV_ONLY);
        } else {
          alert(PROTECTED_ACCOUNT_MODIFICATION_WARNING_MESSAGE);
        }
        return;
      }

      if (event) {
        event.preventDefault();
      }

      setMoveConfirm(true);

      const errors = validate();
      setErrors(errors || {});

      if (Object.keys(errors).length > 0) {
        setMoveConfirm(false);
        return;
      }

      const result = await handleChangeInSummary();

      if (result.status === 200) {
        toast.success('✔ The data was saved successfully!');

        // Refresh data
        const userId = displayUserId || currentUser.userid;
        lastFetchTimeRef.current[`weeklySummaries_${userId}`] = 0; // Force refresh
        await fetchWeeklySummaries(userId);

        toggleTab(moveSelect);
      } else {
        toast.error('✘ The data could not be saved!');
      }
    },
    [
      isNotAllowedToEdit,
      displayUserEmail,
      validate,
      handleChangeInSummary,
      moveSelect,
      toggleTab,
      displayUserId,
      currentUser.userid,
      fetchWeeklySummaries,
    ],
  );

  // Handler for save
  const handleSave = useCallback(
    async event => {
      if (isNotAllowedToEdit) {
        if (displayUserEmail === DEV_ADMIN_ACCOUNT_EMAIL_DEV_ENV_ONLY) {
          alert(DEV_ADMIN_ACCOUNT_CUSTOM_WARNING_MESSAGE_DEV_ENV_ONLY);
        } else {
          alert(PROTECTED_ACCOUNT_MODIFICATION_WARNING_MESSAGE);
        }
        return;
      }

      if (event) {
        event.preventDefault();
      }

      const errors = validate();
      setErrors(errors || {});

      if (Object.keys(errors).length > 0) {
        return;
      }

      const result = await handleChangeInSummary();

      if (result.status === 200) {
        toast.success('✔ The data was saved successfully!');

        // Refresh data
        const userId = displayUserId || currentUser.userid;
        lastFetchTimeRef.current[`weeklySummaries_${userId}`] = 0; // Force refresh
        await fetchWeeklySummaries(userId);

        if (setPopup) {
          setPopup(false);
        }
      } else {
        toast.error('✘ The data could not be saved!');
      }
    },
    [
      isNotAllowedToEdit,
      displayUserEmail,
      validate,
      handleChangeInSummary,
      displayUserId,
      currentUser.userid,
      fetchWeeklySummaries,
      setPopup,
    ],
  );

  // Handler for close
  const handleClose = useCallback(() => {
    if (setPopup) {
      setPopup(false);
    }
  }, [setPopup]);

  // Create summary labels object
  const summariesLabels = useMemo(
    () => ({
      summary: 'This Week',
      summaryLastWeek: doesDateBelongToWeek(dueDateLastWeek, 1)
        ? 'Last Week'
        : moment(dueDateLastWeek).format('YYYY-MMM-DD'),
      summaryBeforeLast: doesDateBelongToWeek(dueDateBeforeLast, 2)
        ? 'Week Before Last'
        : moment(dueDateBeforeLast).format('YYYY-MMM-DD'),
      summaryThreeWeeksAgo: doesDateBelongToWeek(dueDateThreeWeeksAgo, 3)
        ? 'Three Weeks Ago'
        : moment(dueDateThreeWeeksAgo).format('YYYY-MMM-DD'),
    }),
    [dueDateLastWeek, dueDateBeforeLast, dueDateThreeWeeksAgo, doesDateBelongToWeek],
  );

  // TinyMCE initialization options
  const TINY_MCE_INIT_OPTIONS = useMemo(
    () => ({
      license_key: 'gpl',
      menubar: false,
      placeholder: `Did you: Write it in 3rd person with a minimum of 50-words? Remember to run it through ChatGPT or other AI editor using the "Current AI Editing Prompt" from above? Remember to read and do a final edit before hitting Save?`,
      plugins: 'advlist autolink autoresize lists link charmap table help wordcount',
      toolbar:
        'bold italic underline link removeformat | bullist numlist outdent indent | styleselect fontsizeselect | table| strikethrough forecolor backcolor | subscript superscript charmap | help',
      branding: false,
      min_height: 180,
      max_height: 500,
      autoresize_bottom_margin: 1,
      content_style: 'body { font-size: 14px; }',
      images_upload_handler: customImageUploadHandler,
      skin: darkMode ? 'oxide-dark' : 'oxide',
      content_css: darkMode ? 'dark' : 'default',
    }),
    [darkMode],
  );

  // Styling variables
  const fontColor = darkMode ? 'text-light' : '';
  const headerBg = darkMode ? 'bg-space-cadet' : '';
  const bodyBg = darkMode ? 'bg-yinmn-blue' : '';
  const boxStyling = darkMode ? boxStyleDark : boxStyle;

  // Error state handler
  if (fetchError) {
    return (
      <Container>
        <Row className="align-self-center" data-testid="error">
          <Col>
            <Alert color="danger">
              Fetch error!
              {fetchError.message}
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  // Loading state handler
  if (loading) {
    return (
      <Container fluid>
        <Row className="text-center" data-testid="loading">
          <SkeletonLoading template="WeeklySummary" />
        </Row>
      </Container>
    );
  }

  // Dashboard view
  if (isDashboard) {
    return <DueDateTime isShow={isPopup} dueDate={moment(dueDate)} darkMode={darkMode} />;
  }

  // Main component render
  return (
    <Container
      fluid={!!isModal}
      style={{ minWidth: '100%' }}
      className={`py-3 mb-5 ${
        darkMode ? 'bg-space-cadet text-azure box-shadow-dark' : 'bg--white-smoke'
      }`}
    >
      <h3>Weekly Summaries</h3>
      <Row className="w-100 ml-1">
        <Col className="pl-0">
          Total submitted: {summariesCountShowing || formElements.weeklySummariesCount}
        </Col>
        <Col className="text-right">
          <Button
            className="btn--dark-sea-green responsive-font-size"
            onClick={handleClose}
            style={boxStyling}
          >
            Close this window
          </Button>
        </Col>
      </Row>
      <Form className="mt-4">
        <Nav tabs className="border-0 responsive-font-size">
          {Object.values(summariesLabels).map((weekName, i) => {
            const tId = String(i + 1);
            return (
              <NavItem key={tId}>
                <NavLink
                  className={classnames({ active: activeTab === tId })}
                  data-testid={`tab-${tId}`}
                  onClick={() => {
                    toggleTab(tId);
                  }}
                >
                  {weekName}
                </NavLink>
              </NavItem>
            );
          })}
        </Nav>
        <TabContent
          activeTab={activeTab}
          className={`p-2 weeklysummarypane ${darkMode ? ' bg-yinmn-blue border-light' : ''}`}
        >
          {Object.keys(summariesLabels).map((summaryName, i) => {
            const tId = String(i + 1);
            return (
              <TabPane tabId={tId} key={tId}>
                <Row className="w-100 ml-1">
                  <Col>
                    <FormGroup>
                      <Label for={summaryName} className="summary-instructions-row">
                        <div className={`${fontColor} responsive-font-size`}>
                          Enter your weekly summary below. (required)
                          <WeeklySummaryContentTooltip tabId={tId} />
                        </div>
                        <div className="d-flex flex-column text-right">
                          <CurrentPromptModal
                            userRole={userRole}
                            userId={displayUserId}
                            darkMode={darkMode}
                          />
                          {isNotAllowedToEdit ? null : (
                            <UncontrolledDropdown className="summary-dropdown">
                              <DropdownToggle
                                className="btn--dark-sea-green w-100 responsive-font-size"
                                caret
                                style={boxStyling}
                              >
                                Move This Summary
                              </DropdownToggle>
                              <DropdownMenu className={darkMode ? 'bg-oxford-blue' : ''}>
                                <DropdownItem
                                  disabled={activeTab === '1'}
                                  onClick={() => handleMoveSelect('1')}
                                  style={{ backgroundColor: darkMode ? '#1C2541' : '' }}
                                  className={fontColor}
                                >
                                  This Week
                                </DropdownItem>
                                <DropdownItem
                                  disabled={activeTab === '2'}
                                  onClick={() => handleMoveSelect('2')}
                                  style={{ backgroundColor: darkMode ? '#1C2541' : '' }}
                                  className={fontColor}
                                >
                                  Last Week
                                </DropdownItem>
                                <DropdownItem
                                  disabled={activeTab === '3'}
                                  onClick={() => handleMoveSelect('3')}
                                  className={fontColor}
                                  style={{ backgroundColor: darkMode ? '#1C2541' : '' }}
                                >
                                  Week Before Last
                                </DropdownItem>
                                <DropdownItem
                                  disabled={activeTab === '4'}
                                  onClick={() => handleMoveSelect('4')}
                                  className={fontColor}
                                  style={{ backgroundColor: darkMode ? '#1C2541' : '' }}
                                >
                                  Three Weeks Ago
                                </DropdownItem>
                              </DropdownMenu>
                            </UncontrolledDropdown>
                          )}
                        </div>
                      </Label>
                      <Editor
                        tinymceScriptSrc="/tinymce/tinymce.min.js"
                        init={TINY_MCE_INIT_OPTIONS}
                        id={summaryName}
                        name={summaryName}
                        value={formElements[summaryName]}
                        onEditorChange={handleEditorChange}
                      />
                    </FormGroup>
                    {(errors.summary ||
                      errors.summaryLastWeek ||
                      errors.summaryBeforeLast ||
                      errors.summaryThreeWeeksAgo ||
                      errors.wordCount) && (
                      <Alert color="danger">The summary must contain a minimum of 50 words.</Alert>
                    )}
                  </Col>
                </Row>
              </TabPane>
            );
          })}
          <Row className="w-100 ml-1">
            <Col>
              {formElements.mediaUrl && !mediaFirstChange ? (
                <FormGroup className="media-url">
                  <FontAwesomeIcon icon={faExternalLinkAlt} className=" text--silver" />
                  <Label for="mediaUrl" className="mt-1 ml-2 responsive-font-size">
                    <a href={formElements.mediaUrl} target="_blank" rel="noopener noreferrer">
                      Your DropBox Media Files Link (Share your files here)
                    </a>
                    <MediaURLTooltip />
                  </Label>
                </FormGroup>
              ) : (
                <Col>
                  <Row>
                    <Label for="mediaUrl" className={`mt-1 ${fontColor} responsive-font-size`}>
                      Dropbox link to your weekly media files. (required)
                      <MediaURLTooltip />
                    </Label>
                  </Row>
                  <Row>
                    <FormGroup>
                      <Input
                        className={`responsive-font-size ${
                          darkMode ? 'bg-darkmode-liblack border-0 text-light' : ''
                        }`}
                        type="url"
                        name="mediaUrl"
                        id="mediaUrl"
                        data-testid="media-input"
                        placeholder="Enter a link"
                        value={formElements.mediaUrl}
                        onChange={handleInputChange}
                      />
                    </FormGroup>
                    {formElements.mediaUrl && !errors.mediaUrl && (
                      <Col md={4}>
                        <FormGroup className="media-url">
                          <FontAwesomeIcon
                            icon={faExternalLinkAlt}
                            className="mx-1 text--silver responsive-font-size"
                          />
                          <a href={formElements.mediaUrl} target="_blank" rel="noopener noreferrer">
                            Open link
                          </a>
                        </FormGroup>
                      </Col>
                    )}
                  </Row>
                  <Row form>
                    <Col md={8}>
                      <Modal isOpen={editPopup} className={fontColor}>
                        <ModalHeader className={headerBg}> Warning!</ModalHeader>
                        <ModalBody className={bodyBg}>
                          Whoa Tiger! Are you sure you want to do that? This link needs to be added
                          by an Admin when you were set up as a member of the team. Only Update this
                          if you are SURE your new link is correct.
                        </ModalBody>
                        <ModalFooter className={bodyBg}>
                          <Button onClick={handleMediaChange} style={boxStyling}>
                            Confirm
                          </Button>
                          <Button onClick={toggleShowPopup} style={boxStyling}>
                            Close
                          </Button>
                        </ModalFooter>
                      </Modal>
                      {errors.mediaUrl && <Alert color="danger">{errors.mediaUrl}</Alert>}
                    </Col>
                  </Row>
                </Col>
              )}

              <Row form>
                <Modal isOpen={movePopup} toggle={toggleMovePopup} className={fontColor}>
                  <ModalHeader className={headerBg}> Warning!</ModalHeader>
                  <ModalBody className={bodyBg}>
                    Are you SURE you want to move the summary?
                  </ModalBody>
                  <ModalFooter className={bodyBg}>
                    <Button onClick={handleMoveSave} style={boxStyling}>
                      Confirm and Save
                    </Button>
                    <Button onClick={toggleMovePopup} style={boxStyling}>
                      Close
                    </Button>
                  </ModalFooter>
                </Modal>
              </Row>
              <Row>
                <Col>
                  <FormGroup
                    style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '12px' }}
                  >
                    <CustomInput
                      id="mediaConfirm"
                      data-testid="mediaConfirm"
                      name="mediaConfirm"
                      type="checkbox"
                      htmlFor="mediaConfirm"
                      checked={formElements.mediaConfirm}
                      valid={formElements.mediaConfirm}
                      onChange={handleCheckboxChange}
                    />
                    <label
                      htmlFor="mediaConfirm"
                      style={{ marginLeft: '10px', lineHeight: '1.5', cursor: 'pointer' }}
                      className={darkMode ? 'text-light' : 'text-dark'}
                    >
                      I have provided a minimum of 4 screenshots (6-10 preferred) of this
                      week&apos;s work. (required)
                    </label>
                  </FormGroup>
                  {errors.mediaConfirm && (
                    <Alert color="danger">
                      Please confirm that you have provided the required media files.
                    </Alert>
                  )}
                </Col>
              </Row>
              <Row>
                <Col>
                  <FormGroup
                    style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '12px' }}
                  >
                    <CustomInput
                      id="editorConfirm"
                      data-testid="editorConfirm"
                      name="editorConfirm"
                      type="checkbox"
                      htmlFor="editorConfirm"
                      checked={formElements.editorConfirm}
                      valid={formElements.editorConfirm}
                      onChange={handleCheckboxChange}
                    />
                    <label
                      htmlFor="editorConfirm"
                      style={{ marginLeft: '10px', lineHeight: '1.5', cursor: 'pointer' }}
                      className={darkMode ? 'text-light' : 'text-dark'}
                    >
                      I used GPT (or other AI editor) with the most current prompt.
                    </label>
                  </FormGroup>
                  {errors.editorConfirm && (
                    <Alert color="danger">
                      Please confirm that you used an AI editor to write your summary.
                    </Alert>
                  )}
                </Col>
              </Row>
              <Row>
                <Col>
                  <FormGroup
                    style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '12px' }}
                  >
                    <CustomInput
                      id="proofreadConfirm"
                      name="proofreadConfirm"
                      data-testid="proofreadConfirm"
                      type="checkbox"
                      htmlFor="proofreadConfirm"
                      checked={formElements.proofreadConfirm}
                      valid={formElements.proofreadConfirm}
                      onChange={handleCheckboxChange}
                    />
                    <label
                      htmlFor="proofreadConfirm"
                      style={{ marginLeft: '10px', lineHeight: '1.5', cursor: 'pointer' }}
                      className={darkMode ? 'text-light' : 'text-dark'}
                    >
                      I proofread my weekly summary.
                    </label>
                  </FormGroup>
                  {errors.proofreadConfirm && (
                    <Alert color="danger">
                      Please confirm that you have proofread your summary.
                    </Alert>
                  )}
                </Col>
              </Row>
              <Row className="mt-4">
                <Col>
                  <FormGroup className="mt-2">
                    <Button
                      className="px-5 btn--dark-sea-green"
                      disabled={Object.keys(validate()).length > 0}
                      onClick={handleSave}
                      style={boxStyling}
                    >
                      Save
                    </Button>
                  </FormGroup>
                </Col>
              </Row>
            </Col>
          </Row>
        </TabContent>
      </Form>
    </Container>
  );
}

export default WeeklySummary;
