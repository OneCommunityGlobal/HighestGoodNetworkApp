/* eslint-disable no-alert */
/* eslint-disable no-console */
import { useState, useEffect, useLayoutEffect, useMemo } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { Prompt } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import styles from './JobFormBuilder.module.css';
import { ENDPOINTS } from '~/utils/URL';
import hasPermission from '~/utils/permissions';
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
  const [formFields, setFormFields] = useState([]);
  const [initialFormFields, setInitialFormFields] = useState([]);
  const [templateName, setTemplateName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [currentFormId, setCurrentFormId] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [newField, setNewField] = useState({
    questionText: '',
    questionType: 'textbox',
    options: [],
    visible: true,
    isRequired: false,
    required: false,
  });

  const initialNewField = {
    questionText: '',
    questionType: 'textbox',
    options: [],
    visible: true,
    isRequired: false,
    required: false,
  };

  const [jobTitle, setJobTitle] = useState('Please Choose an option');
  const [initialJobTitle, setInitialJobTitle] = useState('Please Choose an option');
  const jobPositions = JOB_FORM_POSITION_OPTIONS;

  const [newOption, setNewOption] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isLoadingForm, setIsLoadingForm] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [hasModalChanges, setHasModalChanges] = useState(false);

  const hasUnsavedChanges = hasUnsavedJobFormChanges({
    formFields,
    initialFormFields,
    newField,
    initialNewField,
    templateName,
    jobTitle,
    initialJobTitle,
    newOption,
    hasModalChanges,
  });

  const markAsSaved = (fields, savedJobTitle) => {
    setInitialFormFields(structuredClone(fields));
    if (savedJobTitle !== undefined) setInitialJobTitle(savedJobTitle);
  };

  // Back/Forward can leave the document entirely, bypassing React Router's Prompt.
  useLayoutEffect(() => {
    if (!hasUnsavedChanges) return undefined;
    const handler = event => {
      event.preventDefault();
      // Keep a nonempty value for browsers that still use the legacy signal.
      // The browser supplies its own text for the native confirmation dialog.
      event.returnValue = 'You have unsaved changes.';
      return event.returnValue;
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);

  // Auto-load existing form on component mount
  useEffect(() => {
    const loadFirstAvailableForm = async () => {
      try {
        const response = await axios.get(ENDPOINTS.GET_ALL_JOB_FORMS);
        const forms = response.data?.forms ?? (Array.isArray(response.data) ? response.data : []);

        if (forms.length > 0) {
          const firstForm = forms[0];
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
        setSaveError('Unable to load the form. Please refresh before editing.');
      } finally {
        setIsLoadingForm(false);
      }
    };

    loadFirstAvailableForm().catch(error => {
      console.error('Unexpected error auto-loading form:', error);
    });
  }, []);

  // Keep question changes local until Save Form succeeds.
  const moveField = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formFields.length) return;
    const newFields = [...formFields];
    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
    setFormFields(newFields);
  };

  const deleteField = index => {
    setFormFields(fields => fields.filter((field, fieldIndex) => fieldIndex !== index));
  };

  const editField = (field, index) => {
    // Transform the field structure to match what QuestionEditModal expects
    const questionForEdit = {
      label: stripLeadingQuestionNumber(field.questionText),
      type: field.questionType,
      options: field.options,
      required: isFieldRequired(field),
      placeholder: field.placeholder || '',
    };

    setEditingQuestion(questionForEdit);
    setEditingIndex(index);
    setEditModalOpen(true);
  };

  const handleSaveEditedQuestion = editedQuestion => {
    const isRequired = Boolean(editedQuestion.required || editedQuestion.isRequired);
    const updatedField = normalizeQuestionForApi({
      ...formFields[editingIndex],
      questionText: editedQuestion.label,
      questionType: editedQuestion.type,
      options: editedQuestion.options || [],
      isRequired,
      required: isRequired,
      placeholder: editedQuestion.placeholder,
    });

    const updatedFields = [...formFields];
    updatedFields[editingIndex] = updatedField;
    setFormFields(updatedFields);

    setHasModalChanges(false);
    // Close the modal
    setEditModalOpen(false);
    setEditingQuestion(null);
    setEditingIndex(null);
  };

  const handleCancelEdit = () => {
    setHasModalChanges(false);
    setEditModalOpen(false);
    setEditingQuestion(null);
    setEditingIndex(null);
  };

  // Import questions from template
  const importQuestions = questions => {
    setFormFields(normalizeLoadedQuestions(questions));
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

  const handleAddField = () => {
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
    setFormFields([...formFields, fieldToAdd]);

    setNewField({
      questionText: '',
      questionType: 'textbox',
      options: [],
      visible: true,
      isRequired: false,
      required: false,
    });
  };

  const changeVisiblity = (event, field) => {
    const updatedFields = formFields.map(item =>
      item.questionText === field.questionText && item.questionType === field.questionType
        ? { ...item, visible: event.target.checked }
        : item,
    );
    setFormFields(updatedFields);
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!currentFormId) {
      alert('No form loaded to save. Please refresh or select a job position.');
      return;
    }

    setIsSaving(true);
    setSaveError('');
    try {
      await axios.put(ENDPOINTS.UPDATE_JOB_FORM, {
        formId: currentFormId,
        title: jobTitle,
        questions: formFields.map(normalizeQuestionForApi),
        description: '',
        requestor: getRequestor(),
      });

      markAsSaved(formFields, jobTitle);
      console.log('Form updated successfully');
      alert('Form saved successfully!');
    } catch (error) {
      console.error('Error updating form:', error);
      const message =
        error.response?.data?.message ||
        error.response?.data?.error?.message ||
        'Failed to save form. Please try again.';
      setSaveError(message);
      alert(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`${styles.pageWrapper} ${darkMode ? styles.darkMode : ''}`}>
      <Prompt
        when={hasUnsavedChanges}
        message="You have unsaved changes. Are you sure you want to leave this page?"
      />
      <fieldset className={styles.formBuilderContainer} disabled={isLoadingForm || isSaving}>
        {isLoadingForm && <p role="status">Loading form…</p>}
        {saveError && <p role="alert">{saveError}</p>}
        <img
          src={OneCommunityImage}
          alt="One Community Logo"
          id="onecommunity-image"
          className={styles.oneCommunityGlobalImg}
        />
        <div className={styles.jobformNavbar}>
          <div>
            <input
              placeholder="Enter Job Title"
              className={styles.jobformInput}
              value={jobTitle === 'Please Choose an option' ? '' : jobTitle}
              onChange={event => setJobTitle(event.target.value)}
            />
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
              {jobTitle &&
                jobTitle !== 'Please Choose an option' &&
                !jobPositions.includes(jobTitle) && <option value={jobTitle}>{jobTitle}</option>}
              {jobPositions.map(e => (
                <option key={uuidv4()} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
        </div>
        <h1 className={styles.jobformTitle}>Job Question Set Builder</h1>
        {hasUnsavedChanges && (
          <p role="status">Unsaved changes — click Save Form to keep your changes.</p>
        )}
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
              onImportQuestions={importQuestions}
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
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className={styles.addOptionButton}
                  >
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

              <div>
                <label className={styles.jbformLabel}>
                  <input
                    type="checkbox"
                    checked={Boolean(newField.isRequired || newField.required)}
                    onChange={e =>
                      setNewField(prev => ({
                        ...prev,
                        isRequired: e.target.checked,
                        required: e.target.checked,
                      }))
                    }
                  />{' '}
                  Required field
                </label>
              </div>

              <button type="button" onClick={handleAddField} className={styles.addFieldButton}>
                Add Field
              </button>
            </div>

            <div className={styles.previewSection}>
              <button
                type="button"
                className={styles.previewTextButton}
                onClick={() => setShowPreviewModal(true)}
              >
                Preview Form
              </button>
            </div>

            <div className={styles.saveSection}>
              <button type="button" className={styles.jobSubmitButton} onClick={handleSubmit}>
                Save Form
              </button>
            </div>

            {editModalOpen && editingQuestion && (
              <QuestionEditModal
                onDirtyChange={setHasModalChanges}
                question={editingQuestion}
                onSave={handleSaveEditedQuestion}
                onCancel={handleCancelEdit}
                darkMode={darkMode}
              />
            )}
          </div>
        ) : (
          <div className={styles.customForm}>
            <div className="alert alert-warning" role="alert">
              <h4 className="alert-heading">Access restricted</h4>
              <p>
                You do not have permission to manage job application forms. An Owner can grant
                &quot;Manage Job Forms&quot; or related job form permissions in Permissions
                Management.
              </p>
            </div>
          </div>
        )}
        <FormPreviewModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          formFields={formFields}
          jobTitle={jobTitle}
          darkMode={darkMode}
        />
      </fieldset>
    </div>
  );
}

export default JobFormBuilder;
