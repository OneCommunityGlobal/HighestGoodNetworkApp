/* eslint-disable no-alert */
/* eslint-disable no-console */
// eslint-disable-next-line no-alert
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { Prompt } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import styles from './JobFormBuilder.module.css';
import { ENDPOINTS } from '~/utils/URL';
import OneCommunityImage from './One-Community-Horizontal-Homepage-Header-980x140px-2.png';
import QuestionSetManager from './QuestionSetManager';
import QuestionFieldActions from './QuestionFieldActions';
import QuestionEditModal from './QuestionEditModal';
import FormPreviewModal from './FormPreviewModal';
import { JOB_FORM_POSITION_OPTIONS } from '../JobFormManagement/jobFormPositions';
import {
  normalizeQuestionType,
  resolveInputType,
  STANDARD_APPLICANT_FIELDS,
  buildJobFormRequestor,
  isFieldRequired,
  normalizeQuestionForApi,
  normalizeLoadedQuestions,
  isDuplicateQuestion,
  numberedQuestionLabel,
  stripLeadingQuestionNumber,
} from './jobFormQuestionUtils';
import { hasUnsavedJobFormChanges } from './jobFormDirtyState';
import generateReferralLink from './ReferralLinkGenerator';
import { permissions } from '../../utils/constants';
function JobFormBuilder() {
  const dispatch = useDispatch();
  const { auth } = useSelector(state => state);
  const frontPermissions = auth?.user?.permissions?.frontPermissions;
  const rolePermissions = useSelector(state => state.role?.roles);
  const darkMode = useSelector(state => state.theme.darkMode);

  const canManageJobForms = useMemo(() => dispatch(hasPermission(permissions.manageJobForms)), [
    dispatch,
    frontPermissions,
    rolePermissions,
  ]);

  const getRequestor = () => buildJobFormRequestor(auth?.user);
  const { role } = useSelector(state => state.auth.user);
  const [formFields, setFormFields] = useState([]);
  const [newField, setNewField] = useState({
    questionText: '',
    questionType: 'textbox',
    options: [], // For checkbox, radio, and dropdown input types
    visible: true,
  });

  // Dynamic Form ID Management
  const [currentFormId, setCurrentFormId] = useState(null);

  const [jobTitle, setJobTitle] = useState('Please Choose an option');
  const [initialJobTitle, setInitialJobTitle] = useState('Please Choose an option');
  const [referralSource, setReferralSource] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const referralInputRef = useRef(null);
  const jobPositions = [
    'APPLIED THROUGH SITE - SEEKING SOFTWARE POSITION',
    'APPLIED THROUGH SITE - GENERAL',
    'APPLIED THROUGH SITE - ADMINISTRATIVE ASSISTANT',
    'APPLIED THROUGH SITE - GRAPHIC DESIGNER',
    'SEEKING SOFTWARE POSITION',
    'SEEKING ADMINISTRATIVE ASSISTANT',
    'EARTHBAG 4-DOME CLUSTER PLUMBING DESIGNS',
    'PLUMBING ENGINEER/MEP FOR EARTHBAG VILLAGE',
    'CIVIL ENGINEER FOR COST ANALYSIS OF FOOD PRODUCTION STRUCTURES',
    'CIVIL ENGINEER TO FINALIZE TEST MATERIALS AND EQUIPMENT FOR FOOD PRODUCTION STRUCTURES',
    'MECHANICAL ENGINEER FOR HVAC FOR FOOD PRODUCTION STRUCTURES',
    'CITY CENTER PLUMBING DESIGNS',
    'ELECTRICAL DESIGNER FOR EARTHBAG VILLAGE',
    'ELECTRICAL DESIGNER FOR STRAW BALE CLASSROOM',
    'ELECTRICAL ENGINEER/DESIGNER FOR DUPLICABLE CITY CENTER',
    'CITY CENTER GEODESIC DOME AUTODESK INVENTOR SIMULATIONS',
    '4-DOME CLUSTER ELECTRICAL DESIGN',
    'PHOTOSHOP/GRAPHIC DESIGNER',
    'PASSIVE GREENHOUSE DESIGN',
    'LANDSCAPE ARCHITECT FOR AQUAPINI/WALIPINI STRUCTURES',
    'SEEKING VIRTUAL ASSISTANT',
    'FUNDRAISING HELP',
    'STRAW BALE CLASSROOM STRUCTURAL',
    'PERMACULTURALIST FOR SOIL AMENDMENT',
    'NUTRITIONIST FOR NUTRITION CALCULATIONS AND MENU PLANNING',
    'CHEF OR CULINARY PROFESSIONAL FOR MENU IMPLEMENTATION TUTORIALS',
    'CHEF OR CULINARY PROFESSIONAL TO HELP WITH REMOTE/DISASTER KITCHEN SUPPLY AND STORAGE PLAN',
    'LUMION 2024.1.1 OR HIGHER FOR CITY CENTER',
    'GENERAL',
    'VERMICULTURE',
    'MASTER CARPENTER',
    'FINAL CUT PRO VIDEO EDITOR',
    'INDUSTRIAL DESIGNER FOR DORMER',
    'LANDSCAPE ARCHITECT FOR SKETCHUP AND LUMION RENDER HELP',
    'T.A.S.T. - NEED RESUME & WORK SAMPLES',
    'T.A.S.T. - ENGINEER/ARCHITECT OFFERING POSITION',
    'T.A.S.T. - HGN',
    'ADMIN OF PR REVIEW TEAM AND FRONTEND TESTER',
    'ADMIN OF PR REVIEW TEAM AND FRONTEND TESTER - APPLIED THROUGH SITE',
    'DATA ANALYST APPLICATION',
  ];

  // Update referral link when jobTitle or referralSource changes
  useEffect(() => {
    if (jobTitle && jobTitle !== 'Please Choose an option') {
      setReferralLink(generateReferralLink(jobTitle, referralSource));
    } else {
      setReferralLink('');
    }
  }, [jobTitle, referralSource]);

  const handleCopyReferralLink = async () => {
    if (referralInputRef.current) {
      try {
        await navigator.clipboard.writeText(referralInputRef.current.value);
        toast.success('Referral link copied!');
        console.log('Referral link copied!');
      } catch (err) {
        toast.error('Failed to copy referral link.');
        console.error('Failed to copy referral link:', err);
      }
    }
  };

  const [newOption, setNewOption] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const markAsSaved = (fields, savedJobTitle) => {
    setInitialFormFields(structuredClone(fields));
    if (savedJobTitle !== undefined) setInitialJobTitle(savedJobTitle);
    setHasUnsavedChanges(false);
  };

  // Prevent refresh while unsaved changes exist
  useEffect(() => {
    const handler = event => {
      if (hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue = '';
      }
    };

    globalThis.addEventListener('beforeunload', handler);
    return () => globalThis.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);

  // Reset builder after template is saved
  const resetBuilderState = () => {
    setFormFields([]);
    setNewField({
      questionText: '',
      questionType: 'textbox',
      options: [],
      visible: true,
      isRequired: false,
      required: false,
    });
    setNewOption('');
  };

  // Auto-load existing form on component mount
  useEffect(() => {
    const loadFirstAvailableForm = async () => {
      try {
        const response = await axios.get(ENDPOINTS.GET_ALL_JOB_FORMS);

        if (response.data && response.data.length > 0) {
          const firstForm = response.data[0];
          const formId = firstForm._id || firstForm.id;

          setCurrentFormId(formId);
          const loadedQuestions = normalizeLoadedQuestions(firstForm.questions || []);
          const loadedTitle = firstForm.title || 'Please Choose an option';

          setFormFields(loadedQuestions);
          setJobTitle(loadedTitle);
          markAsSaved(loadedQuestions, loadedTitle);
          setNewField(initialNewField);

          console.log('Auto-loaded form:', formId);
        }
      } catch (error) {
        console.error('Error auto-loading form:', error);
      }
    };

    loadFirstAvailableForm().catch(error => {
      console.error('Unexpected error auto-loading form:', error);
    });
  }, []);

  // Detect unsaved changes
  useEffect(() => {
    const changed = hasUnsavedJobFormChanges({
      formFields,
      initialFormFields,
      newField,
      initialNewField,
      templateName,
      jobTitle,
      initialJobTitle,
    });

    setHasUnsavedChanges(changed);
  }, [formFields, initialFormFields, newField, templateName, jobTitle, initialJobTitle]);

  // CRUD Functions with Dynamic Form ID
  const cloneField = async (field, index) => {
    const clonedField = JSON.parse(JSON.stringify(field));

    // Update local state immediately
    const newFields = [
      ...formFields.slice(0, index + 1),
      clonedField,
      ...formFields.slice(index + 1),
    ];
    setFormFields(newFields);

    // Sync with backend if form exists
    if (currentFormId) {
      try {
        await axios.post(ENDPOINTS.ADD_QUESTION(currentFormId), {
          question: clonedField,
          position: index + 1,
        });
      } catch (error) {
        console.error('Error cloning question on server:', error);
      }
    }
  };

  const moveField = async (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (
      (direction === 'up' && index > 0) ||
      (direction === 'down' && index < formFields.length - 1)
    ) {
      // Update local state immediately
      const newFields = [...formFields];
      [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
      setFormFields(newFields);

      // Sync with backend if form exists
      if (currentFormId) {
        try {
          await axios.put(ENDPOINTS.REORDER_QUESTIONS(currentFormId), {
            fromIndex: index,
            toIndex: newIndex,
          });
        } catch (error) {
          console.error('Error reordering questions on server:', error);
        }
      }
    }
  };

  const deleteField = async index => {
    // Update local state immediately
    const newFields = [...formFields];
    newFields.splice(index, 1);
    setFormFields(newFields);

    // Sync with backend if form exists
    if (currentFormId) {
      try {
        await axios.delete(ENDPOINTS.DELETE_QUESTION(currentFormId, index));
        console.log('Question deleted successfully');
      } catch (error) {
        console.error('Error deleting question on server:', error);
      }
    }
  };

  const editField = (field, index) => {
    // Transform the field structure to match what QuestionEditModal expects
    const questionForEdit = {
      label: stripLeadingQuestionNumber(field.questionText),
      type: field.questionType,
      options: field.options,
      required: field.required || false,
      placeholder: field.placeholder || '',
    };

    setEditingQuestion(questionForEdit);
    setEditingIndex(index);
    setEditModalOpen(true);
  };

  const handleSaveEditedQuestion = async editedQuestion => {
    const updatedField = {
      ...formFields[editingIndex],
      questionText: editedQuestion.label,
      questionType: editedQuestion.type,
      options: editedQuestion.options || [],
      required: editedQuestion.required,
      placeholder: editedQuestion.placeholder,
    };

    // Update local state immediately
    const updatedFields = [...formFields];
    updatedFields[editingIndex] = updatedField;
    setFormFields(updatedFields);

    // Sync with backend if form exists
    if (currentFormId) {
      try {
        await axios.put(ENDPOINTS.UPDATE_QUESTION(currentFormId, editingIndex), updatedField);
        console.log('Question updated successfully');
      } catch (error) {
        console.error('Error updating question on server:', error);
      }
    }

    // Close the modal
    setEditModalOpen(false);
    setEditingQuestion(null);
    setEditingIndex(null);
  };

  const handleCancelEdit = () => {
    setEditModalOpen(false);
    setEditingQuestion(null);
    setEditingIndex(null);
  };

  // Import questions from template
  const importQuestions = questions => {
    setFormFields(questions);
  };

  const handleAddOption = () => {
    if (newOption.trim() === '') {
      alert('Option cannot be empty!');
      return;
    }
    setNewField(prev => ({
      ...prev,
      options: [...prev.options, newOption],
    }));
    setNewOption('');
  };

  const handleAddField = async () => {
    if (newField.questionText.trim() === '') {
      alert('Field label is required!');
      return;
    }

    if (
      ['checkbox', 'radio', 'dropdown'].includes(newField.questionType) &&
      newField.options.length === 0
    ) {
      alert('You must add at least one option for this field!');
      return;
    }

    const fieldToAdd = normalizeQuestionForApi(newField);

    if (isDuplicateQuestion(fieldToAdd, formFields)) {
      const confirmAdd = window.confirm('You already have a similar question. Add Anyway?');
      if (!confirmAdd) return;
    }
    const updatedFields = [...formFields, fieldToAdd];
    setFormFields(updatedFields);

    // Sync with backend if form exists
    if (currentFormId) {
      try {
        await axios.post(ENDPOINTS.ADD_QUESTION(currentFormId), {
          question: newField,
          position: formFields.length,
        });
      } catch (error) {
        console.error('Error adding question to server:', error);
      }
    }

    setNewField({ questionText: '', questionType: 'textbox', options: [], visible: true });
  };

  const changeVisiblity = (event, field) => {
    const updatedFields = formFields.map(
      item =>
        item.questionText === field.questionText && item.questionType === field.questionType
          ? { ...item, visible: event.target.checked } // Return the updated item
          : item, // Return the unchanged item
    );
    setFormFields(updatedFields);
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const formIdToUse = currentFormId || '6753982566fcf3275f129eb4';

    try {
      await axios.put(ENDPOINTS.UPDATE_JOB_FORM, {
        formId: formIdToUse,
        title: jobTitle,
        questions: formFields,
        description: '',
      });

      markAsSaved(formFields, jobTitle);
      console.log('Form updated successfully');
      alert('Form saved successfully!');
    } catch (error) {
      console.error('Error updating form:', error);
      alert('Failed to save form. Please try again.');
    }
  };

  const darkMode = useSelector(state => state.theme?.darkMode);

  return (
    <div className={`${styles.pageWrapper} ${darkMode ? styles.darkMode : ''}`}>
      <Prompt
        when={hasUnsavedChanges}
        message="You have unsaved changes. Are you sure you want to leave this page?"
      />
      <div className={styles.formBuilderContainer}>
        <img
          src={OneCommunityImage}
          alt="One Community Logo"
          id="onecommunity-image"
          className={styles.oneCommunityGlobalImg}
        />
        <div className={styles.jobformNavbar}>
          <div>
            <input placeholder="Enter Job Title" className={styles.jobformInput} />
            <button type="button" className={styles.goButton}>
              Go
            </button>
          </div>
          <div>
            <select
              value={jobTitle}
              onChange={q => setJobTitle(q.target.value)}
              className={styles.jobformSelect}
            >
              <option value="Please Choose an option">Please Choose an Option</option>
              {jobPositions.map(e => (
                <option key={uuidv4()} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
        </div>
        <h1 className={styles.jobformTitle}>Job Question Set Builder</h1>
        {canManageJobForms ? (
          <div className={styles.customForm}>
            <p className={styles.jobformDesc}>
              Use this page to create or edit question templates for job postings. Default questions
              are preselected automatically, and you can customize the form by adding, removing, or
              rearranging fields.
            </p>
            <QuestionSetManager
              formFields={formFields}
              setFormFields={setFormFields}
              onImportQuestions={fields => {
                importQuestions(fields);
                markAsSaved(fields);
              }}
              onTemplateSaved={() => {
                markAsSaved(formFields);
                resetBuilderState();
              }}
              darkMode={darkMode}
              templateName={templateName}
              setTemplateName={setTemplateName}
              selectedTemplate={selectedTemplate}
              setSelectedTemplate={setSelectedTemplate}
            />
            <div className={styles.standardApplicantSection}>
              <p className={styles.standardApplicantNote}>
                These profile fields always appear on the application form (including required
                email).
              </p>
              <div className={styles.standardApplicantGrid}>
                {STANDARD_APPLICANT_FIELDS.map(field => (
                  <div key={field.label} className={styles.standardApplicantField}>
                    <label className={`${styles.fieldLabel} ${styles.jbformLabel}`}>
                      {field.label}
                      {field.required && (
                        <span className={styles.requiredMark} aria-hidden="true">
                          {' '}
                          *
                        </span>
                      )}
                    </label>
                    <input
                      type={field.inputType}
                      readOnly
                      tabIndex={-1}
                      placeholder={
                        field.inputType === 'email'
                          ? 'Applicant enters email here'
                          : `Applicant enters ${field.label.toLowerCase()}`
                      }
                      className={`${styles.jobformInput} ${styles.standardApplicantInput}`}
                      aria-label={`${field.label} preview`}
                    />
                  </div>
                ))}
              </div>
            </div>
            <form>
              {formFields.map((field, index) => {
                const questionType = normalizeQuestionType(field);

                return (
                  <div className={styles.formDiv} key={`${index}-${field.questionText}`}>
                    <QuestionFieldActions
                      field={field}
                      index={index}
                      totalFields={formFields.length}
                      onMove={moveField}
                      onDelete={deleteField}
                      onEdit={editField}
                      visible={field.visible}
                      onVisibilityChange={event => changeVisiblity(event, field)}
                      darkMode={darkMode}
                    />
                    <div className={styles.formField}>
                      <label className={`${styles.fieldLabel} ${styles.jbformLabel}`}>
                        {numberedQuestionLabel(field.questionText, index)}
                        {isFieldRequired(field) && (
                          <span className={styles.requiredMark} aria-hidden="true">
                            {' '}
                            *
                          </span>
                        )}
                      </label>
                      <div className={styles.fieldOptions}>
                        {questionType === 'textbox' && (
                          <input
                            type={resolveInputType(field)}
                            placeholder={
                              resolveInputType(field) === 'email'
                                ? 'Enter email address'
                                : 'Enter text here'
                            }
                            className={styles.jobformInput}
                          />
                        )}
                        {questionType === 'date' && (
                          <input
                            type="date"
                            placeholder="Enter date"
                            className={styles.jobformInput}
                          />
                        )}
                        {questionType === 'textarea' && (
                          <textarea
                            className={styles.jobformTextarea}
                            placeholder="Enter long-form response here"
                            rows={4}
                          />
                        )}
                        {questionType === 'file' && (
                          <input type="file" disabled className={styles.jobformInput} />
                        )}
                        {['checkbox', 'radio'].includes(questionType) &&
                          field.options.map(option => (
                            <div key={`${index}-${option}`} className={styles.optionItem}>
                              <input
                                type={questionType}
                                name={`field-${index}`}
                                className={styles.jobformInput}
                              />
                              <label className={styles.jbformLabel}>{option}</label>
                            </div>
                          ))}
                        {questionType === 'dropdown' && (
                          <select className={styles.jobformSelect}>
                            {field.options.map(option => (
                              <option key={`${index}-${option}`} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </form>

            <div className={styles.newFieldSection}>
              <div>
                <label className={styles.jbformLabel}>
                  Field Label:
                  <input
                    type="text"
                    value={newField.questionText}
                    onChange={e => {
                      e.persist();
                      setNewField(prev => ({ ...prev, questionText: e.target.value }));
                    }}
                    placeholder="Enter Field Label"
                    className={styles.jobformInput}
                  />
                </label>
              </div>
              <div>
                <label className={styles.jbformLabel}>
                  Input Type:
                  <select
                    value={newField.questionType}
                    className={styles.jobformSelect}
                    onChange={e => {
                      e.persist();
                      setNewField(prev => ({
                        ...prev,
                        questionType: e.target.value,
                        options: [],
                      }));
                    }}
                  >
                    <option value="textbox">Text Box</option>
                    <option value="email">Email</option>
                    <option value="textarea">Text Area</option>
                    <option value="checkbox">Check Box</option>
                    <option value="radio">Radio</option>
                    <option value="dropdown">Dropdown</option>
                    <option value="date">Date</option>
                  </select>
                </label>
              </div>

            {/* Options Section */}
            {['checkbox', 'radio', 'dropdown'].includes(newField.questionType) && (
              <div className={styles.optionsSection}>
                <label className={styles.jbformLabel}>
                  Add Option:
                  <input
                    type="text"
                    value={newOption}
                    onChange={e => setNewOption(e.target.value)}
                    className={styles.jobformInput}
                    placeholder="Enter an option"
                  />
                </label>
                <button type="button" onClick={handleAddOption} className={styles.addOptionButton}>
                  Add Option
                </button>
                <div className={styles.optionsList}>
                  <h4>Options:</h4>
                  {newField.options.map(option => (
                    <div key={uuidv4()} className={styles.optionItem}>
                      {option}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button type="button" onClick={handleAddField} className={styles.addFieldButton}>
              Add Field
            </button>
          </div>
          <button type="submit" className={styles.jobSubmitButton} onClick={handleSubmit}>
            Proceed to Submit with Details
          </button>
          {editModalOpen && editingQuestion && (
            <QuestionEditModal
              question={editingQuestion}
              onSave={handleSaveEditedQuestion}
              onCancel={handleCancelEdit}
              darkMode={darkMode}
            />
          )}
        </div>
      ) : null}
    </div>
  );
}

export default JobFormBuilder;
