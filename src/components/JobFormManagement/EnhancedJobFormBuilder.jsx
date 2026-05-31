import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '~/utils/URL';
import { hasPermissionSimple } from '~/utils/permissions';
import QuestionSetManager from './QuestionSetManager';
import QuestionSetEditor from './QuestionSetEditor';
import { JOB_FORM_POSITION_OPTIONS } from './jobFormPositions';
import jb from '../Collaboration/JobFormBuilder.module.css';
import styles from './EnhancedJobFormBuilder.module.css';
import OneCommunityImage from '../Collaboration/One-Community-Horizontal-Homepage-Header-980x140px-2.png';

const QUESTION_TYPES = [
  { value: 'textbox', label: 'Short text' },
  { value: 'textarea', label: 'Long text' },
  { value: 'checkbox', label: 'Checkboxes' },
  { value: 'radio', label: 'Multiple choice' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'date', label: 'Date' },
];

const RESPONSE_PLACEHOLDER = 'type your response here';

const CATEGORIES = [
  'General',
  'Engineering',
  'Marketing',
  'Design',
  'Management',
  'Data Analysis',
  'Content Creation',
  'Business Development',
  'Other',
];

const INITIAL_FORM_DATA = {
  title: '',
  description: '',
  category: 'General',
  fixedFields: {
    includePersonalInfo: true,
    includeBasicInfo: true,
    includeExperience: true,
    includeAvailability: true,
  },
  jobLinks: {
    specificJobLink: '',
    generalLinks: [],
  },
  questions: [],
  questionSets: [],
  settings: {
    allowDuplicateSubmissions: false,
    requireLogin: false,
    autoSaveProgress: true,
    showProgressBar: true,
  },
};

function formatFormData(form) {
  return {
    title: form.title || '',
    description: form.description || '',
    category: form.category || 'General',
    fixedFields: form.fixedFields || {
      includePersonalInfo: true,
      includeBasicInfo: true,
      includeExperience: true,
      includeAvailability: true,
    },
    jobLinks: form.jobLinks || { specificJobLink: '', generalLinks: [] },
    questions: (form.questions || []).map(q => ({
      ...q,
      visible: q.visible !== false,
      placeholder: q.placeholder || RESPONSE_PLACEHOLDER,
    })),
    questionSets: form.questionSets || [],
    settings: form.settings || {
      allowDuplicateSubmissions: false,
      requireLogin: false,
      autoSaveProgress: true,
      showProgressBar: true,
    },
  };
}

function getImportQuestionSetsTitle(currentFormId) {
  return currentFormId ? '' : 'Save the form first to import question sets';
}

function generalLinkKey(link) {
  return `${link.title}::${link.url}`;
}

function reportFormError(message, error) {
  console.error(message, error);
  toast.error(message);
}

function renderQuestionPreview(q, darkMode) {
  const darkField = darkMode ? styles.responsePlaceholderDark : '';
  const ph = q.placeholder || RESPONSE_PLACEHOLDER;
  const inputCls = `${jb.jobformInput} ${styles.responsePlaceholder} ${darkField}`.trim();

  switch (q.questionType) {
    case 'textarea':
      return (
        <textarea
          readOnly
          className={`${jb.jobformTextarea} ${styles.textareaPreview} ${darkField}`.trim()}
          placeholder={ph}
        />
      );
    case 'date':
      return <input readOnly type="date" className={inputCls} />;
    case 'dropdown':
      return (
        <select className={`${jb.jobformSelect} ${darkField}`.trim()} disabled>
          <option value="">{ph}</option>
          {(q.options || []).map(opt => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    case 'checkbox':
    case 'radio':
      return (
        <div className={jb.fieldOptions}>
          {(q.options || []).map(opt => (
            <div key={opt} className={jb.optionItem}>
              <input
                type={q.questionType}
                disabled
                className={darkMode ? styles.darkChoiceInput : undefined}
              />
              <span className={jb.jbformLabel}>{opt}</span>
            </div>
          ))}
        </div>
      );
    default:
      return <input readOnly type="text" className={inputCls} placeholder={ph} />;
  }
}

function PermissionDeniedAlert() {
  return (
    <div className={jb.customForm}>
      <div className="alert alert-warning" role="alert">
        You do not have permission to manage job forms. Ask an Owner to grant job form permissions
        in Permissions Management.
      </div>
    </div>
  );
}

const generalLinkShape = PropTypes.shape({
  title: PropTypes.string,
  url: PropTypes.string,
});

function GeneralLinkRow({ link, onRemove }) {
  const { title, url } = link;

  return (
    <div className="d-flex align-items-center gap-2 mb-1">
      <span className="small">
        {title} — {url}
      </span>
      <button
        type="button"
        className="btn btn-sm btn-outline-danger"
        onClick={() => onRemove(link)}
      >
        Remove
      </button>
    </div>
  );
}

GeneralLinkRow.propTypes = {
  link: generalLinkShape.isRequired,
  onRemove: PropTypes.func.isRequired,
};

function AdvancedFormSettings({
  description,
  category,
  specificJobLink,
  generalLinks,
  allowDuplicateSubmissions,
  requireLogin,
  autoSaveProgress,
  showProgressBar,
  darkMode,
  categories,
  newLinkTitle,
  newLinkUrl,
  setNewGeneralLink,
  onFormChange,
  onNestedFormChange,
  onAddGeneralLink,
  onRemoveGeneralLink,
}) {
  return (
    <div className={`${styles.advancedPanel} ${darkMode ? styles.darkAdvanced : ''}`}>
      <h6>Description</h6>
      <textarea
        className={jb.jobformTextarea}
        rows={2}
        value={description}
        onChange={e => onFormChange('description', e.target.value)}
        placeholder="Optional description"
      />
      <h6>Category</h6>
      <select
        className={jb.jobformSelect}
        value={category}
        onChange={e => onFormChange('category', e.target.value)}
      >
        {categories.map(c => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <h6 className="mt-3">Job ad link (optional)</h6>
      <input
        type="url"
        className={jb.jobformInput}
        value={specificJobLink}
        onChange={e => onNestedFormChange('jobLinks', 'specificJobLink', e.target.value)}
        placeholder="https://..."
      />
      <h6 className="mt-3">General links (up to 5)</h6>
      {generalLinks.map(link => (
        <GeneralLinkRow key={generalLinkKey(link)} link={link} onRemove={onRemoveGeneralLink} />
      ))}
      {generalLinks.length < 5 && (
        <div className="row g-2 mt-1">
          <div className="col-md-4">
            <input
              className={jb.jobformInput}
              placeholder="Title"
              value={newLinkTitle}
              onChange={e => setNewGeneralLink(p => ({ ...p, title: e.target.value }))}
            />
          </div>
          <div className="col-md-4">
            <input
              className={jb.jobformInput}
              placeholder="URL"
              value={newLinkUrl}
              onChange={e => setNewGeneralLink(p => ({ ...p, url: e.target.value }))}
            />
          </div>
          <div className="col-md-4">
            <button type="button" className={jb.addOptionButton} onClick={onAddGeneralLink}>
              Add link
            </button>
          </div>
        </div>
      )}
      <h6 className="mt-3">Form behavior</h6>
      <label className="d-block">
        <input
          type="checkbox"
          checked={allowDuplicateSubmissions}
          onChange={e =>
            onNestedFormChange('settings', 'allowDuplicateSubmissions', e.target.checked)
          }
        />{' '}
        Allow duplicate submissions
      </label>
      <label className="d-block">
        <input
          type="checkbox"
          checked={requireLogin}
          onChange={e => onNestedFormChange('settings', 'requireLogin', e.target.checked)}
        />{' '}
        Require login
      </label>
      <label className="d-block">
        <input
          type="checkbox"
          checked={autoSaveProgress}
          onChange={e => onNestedFormChange('settings', 'autoSaveProgress', e.target.checked)}
        />{' '}
        Auto-save progress
      </label>
      <label className="d-block">
        <input
          type="checkbox"
          checked={showProgressBar}
          onChange={e => onNestedFormChange('settings', 'showProgressBar', e.target.checked)}
        />{' '}
        Show progress bar
      </label>
    </div>
  );
}

AdvancedFormSettings.propTypes = {
  description: PropTypes.string,
  category: PropTypes.string,
  specificJobLink: PropTypes.string,
  generalLinks: PropTypes.arrayOf(generalLinkShape),
  allowDuplicateSubmissions: PropTypes.bool,
  requireLogin: PropTypes.bool,
  autoSaveProgress: PropTypes.bool,
  showProgressBar: PropTypes.bool,
  darkMode: PropTypes.bool,
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  newLinkTitle: PropTypes.string,
  newLinkUrl: PropTypes.string,
  setNewGeneralLink: PropTypes.func.isRequired,
  onFormChange: PropTypes.func.isRequired,
  onNestedFormChange: PropTypes.func.isRequired,
  onAddGeneralLink: PropTypes.func.isRequired,
  onRemoveGeneralLink: PropTypes.func.isRequired,
};

AdvancedFormSettings.defaultProps = {
  description: '',
  category: 'General',
  specificJobLink: '',
  generalLinks: [],
  allowDuplicateSubmissions: false,
  requireLogin: false,
  autoSaveProgress: true,
  showProgressBar: true,
  darkMode: false,
  newLinkTitle: '',
  newLinkUrl: '',
};

const EnhancedJobFormBuilder = () => {
  const proceedRef = useRef(null);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  const [currentFormId, setCurrentFormId] = useState(null);
  const [showQuestionSetManager, setShowQuestionSetManager] = useState(false);
  const [showQuestionSetEditor, setShowQuestionSetEditor] = useState(false);
  const [editingQuestionSet, setEditingQuestionSet] = useState(null);
  const [newGeneralLink, setNewGeneralLink] = useState({ title: '', url: '', description: '' });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [draftQuestionText, setDraftQuestionText] = useState('');
  const [draftQuestionType, setDraftQuestionType] = useState('textbox');
  const [draftOption, setDraftOption] = useState('');
  const [draftOptions, setDraftOptions] = useState([]);

  const { auth } = useSelector(state => state);
  const darkMode = useSelector(state => state.theme?.darkMode);
  const userPermissions = auth?.user?.permissions?.frontPermissions || [];
  const userRole = auth?.user?.role;

  useEffect(() => {
    loadFirstAvailableForm();
  }, []);

  const loadFormById = async formId => {
    try {
      if (!formId) return;
      const response = await axios.get(ENDPOINTS.GET_JOB_FORM(formId));
      if (response.data?.form) {
        setFormData(formatFormData(response.data.form));
      }
    } catch (error) {
      reportFormError('Failed to refresh form details', error);
    }
  };

  const loadFirstAvailableForm = async () => {
    try {
      const response = await axios.get(ENDPOINTS.GET_ALL_JOB_FORMS);
      const forms = response.data?.forms ?? (Array.isArray(response.data) ? response.data : []);
      if (forms.length > 0) {
        const firstForm = forms[0];
        setCurrentFormId(firstForm._id);
        setFormData(formatFormData(firstForm));
      }
    } catch (error) {
      reportFormError('Failed to load forms', error);
    }
  };

  const canManageForms = () =>
    hasPermissionSimple(userPermissions, 'manageJobForms') || userRole === 'Owner';

  const canCreateQuestionSets = () =>
    hasPermissionSimple(userPermissions, 'createFormQuestions') || userRole === 'Owner';

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedFormChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  };

  const addGeneralLink = () => {
    if (!newGeneralLink.title || !newGeneralLink.url) {
      toast.error('Title and URL are required for general links');
      return;
    }
    if (formData.jobLinks.generalLinks.length >= 5) {
      toast.error('Maximum 5 general links allowed');
      return;
    }
    setFormData(prev => ({
      ...prev,
      jobLinks: {
        ...prev.jobLinks,
        generalLinks: [...prev.jobLinks.generalLinks, newGeneralLink],
      },
    }));
    setNewGeneralLink({ title: '', url: '', description: '' });
    toast.success('General link added');
  };

  const removeGeneralLink = linkToRemove => {
    setFormData(prev => ({
      ...prev,
      jobLinks: {
        ...prev.jobLinks,
        generalLinks: prev.jobLinks.generalLinks.filter(
          link => generalLinkKey(link) !== generalLinkKey(linkToRemove),
        ),
      },
    }));
    toast.success('General link removed');
  };

  const handleSaveForm = async () => {
    if (!canManageForms()) {
      toast.error('You do not have permission to manage job forms');
      return;
    }
    if (!formData.title.trim()) {
      toast.error('Enter a job title or select a position');
      return;
    }
    try {
      const requestData = {
        ...formData,
        requestor: {
          requestorId: auth.user.userid,
          role: userRole,
        },
      };
      let response;
      if (currentFormId) {
        requestData.formId = currentFormId;
        response = await axios.put(ENDPOINTS.UPDATE_JOB_FORM, requestData);
      } else {
        response = await axios.post(ENDPOINTS.CREATE_JOB_FORM, requestData);
        setCurrentFormId(response.data.form._id);
      }
      toast.success('Form saved successfully');
      if (response?.data?.form?._id) {
        await loadFormById(response.data.form._id);
      }
    } catch (error) {
      reportFormError('Failed to save form', error);
    }
  };

  const handleCreateNewForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setCurrentFormId(null);
    setDraftQuestionText('');
    setDraftOptions([]);
    toast.info('New form started. Save when ready.');
  };

  const handleQuestionSetSaved = () => {
    setShowQuestionSetEditor(false);
    setEditingQuestionSet(null);
  };

  const toggleQuestionVisible = index => {
    setFormData(prev => {
      const questions = [...prev.questions];
      const q = questions[index];
      const isShown = q.visible !== false;
      questions[index] = { ...q, visible: !isShown };
      return { ...prev, questions };
    });
  };

  const removeQuestion = index => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const addDraftOption = () => {
    if (!draftOption.trim()) return;
    setDraftOptions(prev => [...prev, draftOption.trim()]);
    setDraftOption('');
  };

  const addCustomQuestion = () => {
    const text = draftQuestionText.trim() || 'Untitled Question';
    const needsOptions = ['checkbox', 'radio', 'dropdown'].includes(draftQuestionType);
    if (needsOptions && draftOptions.length === 0) {
      toast.error('Add at least one option for this question type');
      return;
    }
    setFormData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          questionText: text,
          questionType: draftQuestionType,
          visible: true,
          isRequired: false,
          options: needsOptions ? [...draftOptions] : [],
          placeholder: RESPONSE_PLACEHOLDER,
        },
      ],
    }));
    setDraftQuestionText('');
    setDraftQuestionType('textbox');
    setDraftOptions([]);
    setDraftOption('');
    toast.success('Question added');
  };

  const positionSelectValue = JOB_FORM_POSITION_OPTIONS.includes(formData.title)
    ? formData.title
    : '';

  const dm = v => (darkMode ? v : '');
  const darkField = darkMode ? styles.responsePlaceholderDark : '';

  const scrollToProceed = () => {
    proceedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  return (
    <div
      className={`${jb.pageWrapper} ${darkMode ? jb.darkMode : ''}`}
      style={darkMode ? { colorScheme: 'dark' } : undefined}
    >
      <div className={jb.formBuilderContainer}>
        <img
          src={OneCommunityImage}
          alt="One Community"
          className={jb.oneCommunityGlobalImg}
          id="onecommunity-image"
        />

        <div className={jb.jobformNavbar}>
          <div className={styles.navbarLeft}>
            <input
              type="text"
              placeholder="Enter Job Title"
              className={jb.jobformInput}
              value={formData.title}
              onChange={e => handleFormChange('title', e.target.value)}
              disabled={!canManageForms()}
            />
            <button type="button" className={styles.goButton} onClick={scrollToProceed}>
              Go
            </button>
          </div>
          <div>
            <select
              className={`${jb.jobformSelect} ${styles.selectPosition}`}
              value={positionSelectValue}
              onChange={e => {
                const v = e.target.value;
                if (v) handleFormChange('title', v);
              }}
              disabled={!canManageForms()}
            >
              <option value="">Select a Position</option>
              {JOB_FORM_POSITION_OPTIONS.map(pos => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>
        </div>

        <h1 className={jb.jobformTitle}>FORM CREATION</h1>

        {canManageForms() ? (
          <div className={jb.customForm}>
            <p className={jb.jobformDesc}>
              Fill the form with questions about a specific position you want to create an ad for.
              The default questions will automatically appear and are already selected. You can pick
              and choose them with the checkbox.
            </p>

            <div className={`${styles.toolbar} ${darkMode ? styles.darkToolbar : ''}`}>
              <button type="button" onClick={handleCreateNewForm}>
                New form
              </button>
              <button
                type="button"
                onClick={() => setShowQuestionSetManager(true)}
                disabled={!currentFormId}
                title={getImportQuestionSetsTitle(currentFormId)}
              >
                Import from question sets
              </button>
              {canCreateQuestionSets() && (
                <button type="button" onClick={() => setShowQuestionSetEditor(true)}>
                  Create question set
                </button>
              )}
              <button type="button" onClick={() => setShowAdvanced(a => !a)}>
                {showAdvanced ? 'Hide' : 'Job links, category & settings'}
              </button>
            </div>

            <div className={styles.positionField}>
              <label
                htmlFor="job-form-position-title"
                className={`${jb.jbformLabel} ${dm(styles.darkText)}`}
              >
                Position the form is for
              </label>
              <input
                id="job-form-position-title"
                type="text"
                className={jb.jobformInput}
                value={formData.title}
                onChange={e => handleFormChange('title', e.target.value)}
                placeholder="Position title"
              />
            </div>

            <div className={styles.fixedGroup}>
              <div className={styles.fixedGroupHeader}>
                <input
                  type="checkbox"
                  checked={formData.fixedFields.includePersonalInfo}
                  onChange={e =>
                    handleNestedFormChange('fixedFields', 'includePersonalInfo', e.target.checked)
                  }
                />
                <span className={dm(styles.darkText)}>Name, email & role</span>
              </div>
              {formData.fixedFields.includePersonalInfo && (
                <div className={styles.fixedGrid}>
                  <div>
                    <div className={`${styles.fixedCellLabel} ${dm(styles.darkText)}`}>name</div>
                    <div className={styles.fixedCell}>
                      <input
                        readOnly
                        tabIndex={-1}
                        className={`${jb.jobformInput} ${styles.fixedCellInput}`}
                      />
                    </div>
                  </div>
                  <div>
                    <div className={`${styles.fixedCellLabel} ${dm(styles.darkText)}`}>email</div>
                    <div className={styles.fixedCell}>
                      <input
                        readOnly
                        tabIndex={-1}
                        className={`${jb.jobformInput} ${styles.fixedCellInput}`}
                      />
                    </div>
                  </div>
                  <div>
                    <div className={`${styles.fixedCellLabel} ${dm(styles.darkText)}`}>
                      Company &amp; Position
                    </div>
                    <div className={styles.fixedCell}>
                      <input
                        readOnly
                        tabIndex={-1}
                        className={`${jb.jobformInput} ${styles.fixedCellInput}`}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.fixedGroup}>
              <div className={styles.fixedGroupHeader}>
                <input
                  type="checkbox"
                  checked={formData.fixedFields.includeBasicInfo}
                  onChange={e =>
                    handleNestedFormChange('fixedFields', 'includeBasicInfo', e.target.checked)
                  }
                />
                <span className={dm(styles.darkText)}>Location, phone &amp; web</span>
              </div>
              {formData.fixedFields.includeBasicInfo && (
                <div className={styles.fixedGrid}>
                  <div>
                    <div className={`${styles.fixedCellLabel} ${dm(styles.darkText)}`}>
                      Location &amp; Timezone
                    </div>
                    <div className={styles.fixedCell}>
                      <input
                        readOnly
                        tabIndex={-1}
                        className={`${jb.jobformInput} ${styles.fixedCellInput}`}
                      />
                    </div>
                  </div>
                  <div>
                    <div className={`${styles.fixedCellLabel} ${dm(styles.darkText)}`}>
                      Phone Number
                    </div>
                    <div className={styles.fixedCell}>
                      <input
                        readOnly
                        tabIndex={-1}
                        className={`${jb.jobformInput} ${styles.fixedCellInput}`}
                      />
                    </div>
                  </div>
                  <div>
                    <div className={`${styles.fixedCellLabel} ${dm(styles.darkText)}`}>
                      Primary Website/ Social
                    </div>
                    <div className={styles.fixedCell}>
                      <input
                        readOnly
                        tabIndex={-1}
                        className={`${jb.jobformInput} ${styles.fixedCellInput}`}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.fixedGroup}>
              <div className={styles.fixedGroupHeader}>
                <input
                  type="checkbox"
                  checked={formData.fixedFields.includeExperience}
                  onChange={e =>
                    handleNestedFormChange('fixedFields', 'includeExperience', e.target.checked)
                  }
                />
                <span className={dm(styles.darkText)}>Skills &amp; motivation (long text)</span>
              </div>
              {formData.fixedFields.includeExperience && (
                <textarea
                  readOnly
                  className={`${jb.jobformTextarea} ${styles.responsePlaceholder} ${darkField}`.trim()}
                  placeholder={RESPONSE_PLACEHOLDER}
                />
              )}
            </div>

            <div className={styles.fixedGroup}>
              <div className={styles.fixedGroupHeader}>
                <input
                  type="checkbox"
                  checked={formData.fixedFields.includeAvailability}
                  onChange={e =>
                    handleNestedFormChange('fixedFields', 'includeAvailability', e.target.checked)
                  }
                />
                <span className={dm(styles.darkText)}>Availability (hours &amp; duration)</span>
              </div>
              {formData.fixedFields.includeAvailability && (
                <div className={styles.fixedGrid}>
                  <div>
                    <div className={`${styles.fixedCellLabel} ${dm(styles.darkText)}`}>
                      Hours per week
                    </div>
                    <div className={styles.fixedCell}>
                      <input
                        readOnly
                        tabIndex={-1}
                        className={`${jb.jobformInput} ${styles.fixedCellInput}`}
                      />
                    </div>
                  </div>
                  <div>
                    <div className={`${styles.fixedCellLabel} ${dm(styles.darkText)}`}>
                      How long you wish to volunteer
                    </div>
                    <div className={styles.fixedCell}>
                      <input
                        readOnly
                        tabIndex={-1}
                        className={`${jb.jobformInput} ${styles.fixedCellInput}`}
                      />
                    </div>
                  </div>
                  <div>
                    <div className={`${styles.fixedCellLabel} ${dm(styles.darkText)}`}>
                      Desired start date
                    </div>
                    <div className={styles.fixedCell}>
                      <input
                        readOnly
                        type="date"
                        tabIndex={-1}
                        className={`${jb.jobformInput} ${styles.fixedCellInput}`}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {formData.questions.map((q, index) => (
              <div
                key={`${index}-${q.questionText}`}
                className={`${styles.questionBlock} ${darkMode ? styles.questionBlockDark : ''}`}
              >
                <input
                  type="checkbox"
                  className={styles.questionCheckbox}
                  checked={q.visible !== false}
                  onChange={() => toggleQuestionVisible(index)}
                  aria-label={`Include question: ${q.questionText}`}
                />
                <div className={styles.questionBody}>
                  <label className={`${styles.questionLabel} ${dm(styles.darkText)}`}>
                    {q.questionText}
                  </label>
                  {renderQuestionPreview(q, darkMode)}
                  <button
                    type="button"
                    className={styles.removeQuestion}
                    onClick={() => removeQuestion(index)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <div className={`${jb.newFieldSection} ${styles.addQuestionSection}`}>
              <div
                className={`${styles.addQuestionRow} ${darkMode ? styles.addQuestionRowDark : ''}`}
              >
                <input
                  type="text"
                  placeholder="Untitled Question"
                  value={draftQuestionText}
                  onChange={e => setDraftQuestionText(e.target.value)}
                />
                <select
                  value={draftQuestionType}
                  onChange={e => setDraftQuestionType(e.target.value)}
                  aria-label="Question type"
                >
                  {QUESTION_TYPES.map(t => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              {['checkbox', 'radio', 'dropdown'].includes(draftQuestionType) && (
                <>
                  <div
                    className={`${styles.optionDraftRow} ${
                      darkMode ? styles.optionDraftRowDark : ''
                    }`}
                  >
                    <input
                      type="text"
                      value={draftOption}
                      onChange={e => setDraftOption(e.target.value)}
                      placeholder="Add an option"
                    />
                    <button type="button" className={jb.addOptionButton} onClick={addDraftOption}>
                      Add option
                    </button>
                  </div>
                  {draftOptions.length > 0 && (
                    <ul className={`small mb-2 ${dm(styles.darkText)}`}>
                      {draftOptions.map(opt => (
                        <li key={opt}>{opt}</li>
                      ))}
                    </ul>
                  )}
                </>
              )}
              <div className={styles.addPlusWrap}>
                <button
                  type="button"
                  className={styles.addPlusButton}
                  onClick={addCustomQuestion}
                  aria-label="Add question"
                >
                  +
                </button>
              </div>
            </div>

            {showAdvanced && (
              <AdvancedFormSettings
                description={formData.description}
                category={formData.category}
                specificJobLink={formData.jobLinks.specificJobLink}
                generalLinks={formData.jobLinks.generalLinks}
                allowDuplicateSubmissions={formData.settings.allowDuplicateSubmissions}
                requireLogin={formData.settings.requireLogin}
                autoSaveProgress={formData.settings.autoSaveProgress}
                showProgressBar={formData.settings.showProgressBar}
                darkMode={darkMode}
                categories={CATEGORIES}
                newLinkTitle={newGeneralLink.title}
                newLinkUrl={newGeneralLink.url}
                setNewGeneralLink={setNewGeneralLink}
                onFormChange={handleFormChange}
                onNestedFormChange={handleNestedFormChange}
                onAddGeneralLink={addGeneralLink}
                onRemoveGeneralLink={removeGeneralLink}
              />
            )}

            <div ref={proceedRef} className={styles.proceedRow}>
              <button type="button" className={styles.proceedButton} onClick={handleSaveForm}>
                Proceed to submit with details
              </button>
            </div>
          </div>
        ) : (
          <PermissionDeniedAlert />
        )}
      </div>

      <QuestionSetManager
        isOpen={showQuestionSetManager}
        toggle={() => setShowQuestionSetManager(false)}
        currentFormId={currentFormId}
        onQuestionSetSelect={() => {
          if (currentFormId) loadFormById(currentFormId);
          else loadFirstAvailableForm();
        }}
        onCreateQuestionSet={() => {
          setEditingQuestionSet(null);
          setShowQuestionSetEditor(true);
        }}
        onEditQuestionSet={questionSet => {
          setEditingQuestionSet(questionSet);
          setShowQuestionSetEditor(true);
        }}
      />

      <QuestionSetEditor
        isOpen={showQuestionSetEditor}
        toggle={() => setShowQuestionSetEditor(false)}
        questionSet={editingQuestionSet}
        onSave={() => {
          handleQuestionSetSaved();
          if (currentFormId) loadFormById(currentFormId);
        }}
      />
    </div>
  );
};

export default EnhancedJobFormBuilder;
