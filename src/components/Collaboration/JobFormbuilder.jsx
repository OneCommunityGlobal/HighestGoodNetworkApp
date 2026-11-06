/* eslint-disable no-console */
import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { Prompt } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './JobFormBuilder.module.css';
import { ENDPOINTS } from '~/utils/URL';
import hasPermission from '~/utils/permissions';
import OneCommunityImage from './One-Community-Horizontal-Homepage-Header-980x140px-2.png';
import FormPreviewModal from './FormPreviewModal';
import JobFormDialog from './JobFormDialog';
import JobFormBuilderWorkspace from './JobFormBuilderWorkspace';
import useJobFormDialog from './useJobFormDialog';
import {
  DEFAULT_FIXED_FIELDS,
  normalizeFixedFields,
  getVisibleStandardApplicantFields,
  buildJobFormRequestor,
  isFieldRequired,
  normalizeQuestionForApi,
  normalizeLoadedQuestions,
  findDuplicateQuestions,
  applyDuplicateDecision,
  isDuplicateQuestion,
  stripLeadingQuestionNumber,
  isApplicantFacingJobForm,
  getApplicantVisibleQuestions,
} from './jobFormQuestionUtils';
import { hasUnsavedJobFormChanges } from './jobFormDirtyState';

import { permissions } from '../../utils/constants';

function JobFormBuilderAccessDenied() {
  return (
    <div className={styles.customForm}>
      <div className="alert alert-warning" role="alert">
        <h4 className="alert-heading">Access restricted</h4>
        <p>
          You do not have permission to manage job application forms. An Owner can grant
          &quot;Manage Job Forms&quot; or related job form permissions in Permissions Management.
        </p>
      </div>
    </div>
  );
}

function JobFormBuilder() {
  const dispatch = useDispatch();
  const { auth } = useSelector(state => state);
  const frontPermissions = auth?.user?.permissions?.frontPermissions;
  const rolePermissions = useSelector(state => state.role?.roles);
  const darkMode = useSelector(state => state.theme.darkMode);
  const { dialogProps, showAlert, showConfirm, showPrompt } = useJobFormDialog();

  const canManageJobForms = useMemo(() => dispatch(hasPermission(permissions.manageJobForms)), [
    dispatch,
    frontPermissions,
    rolePermissions,
  ]);

  const getRequestor = () => buildJobFormRequestor(auth?.user);
  const [formFields, setFormFields] = useState([]);
  const [initialFormFields, setInitialFormFields] = useState([]);
  const [jobForms, setJobForms] = useState([]);
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

  const [jobTitle, setJobTitle] = useState('');
  const [initialJobTitle, setInitialJobTitle] = useState('');
  const [fixedFields, setFixedFields] = useState(() => normalizeFixedFields(DEFAULT_FIXED_FIELDS));
  const [initialFixedFields, setInitialFixedFields] = useState(() =>
    normalizeFixedFields(DEFAULT_FIXED_FIELDS),
  );

  const [newOption, setNewOption] = useState('');
  const [newFieldErrors, setNewFieldErrors] = useState({
    questionText: '',
    options: '',
    newOption: '',
  });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const visibleStandardFields = useMemo(() => getVisibleStandardApplicantFields(fixedFields), [
    fixedFields,
  ]);

  const markAsSaved = (fields, savedJobTitle, savedFixedFields) => {
    setInitialFormFields(structuredClone(fields));
    if (savedJobTitle !== undefined) setInitialJobTitle(savedJobTitle);
    if (savedFixedFields !== undefined) {
      setInitialFixedFields(normalizeFixedFields(savedFixedFields));
    }
    setHasUnsavedChanges(false);
  };

  const refreshJobFormsList = useCallback(async () => {
    const response = await axios.get(ENDPOINTS.GET_ALL_JOB_FORMS);
    const forms = response.data?.forms ?? (Array.isArray(response.data) ? response.data : []);
    const visibleForms = forms
      .filter(isApplicantFacingJobForm)
      .slice()
      .sort((a, b) => String(a.title || '').localeCompare(String(b.title || '')));
    setJobForms(visibleForms);
    return visibleForms;
  }, []);

  const applyLoadedJobForm = useCallback(
    async (form, { promptDuplicates = true } = {}) => {
      const formId = form._id || form.id;
      const rawQuestions = normalizeLoadedQuestions(form.questions || []);
      // Match /job-application: hide profile/resume fields already collected above, dedupe repeats.
      const applicantQuestions = normalizeLoadedQuestions(
        getApplicantVisibleQuestions(rawQuestions),
      );
      const loadedTitle = form.title || '';
      const loadedFixedFields = normalizeFixedFields(form.fixedFields);
      const hiddenCount = rawQuestions.length - applicantQuestions.length;
      const duplicateQuestions = findDuplicateQuestions(applicantQuestions);

      let shouldRemoveDuplicates = false;
      if (promptDuplicates && duplicateQuestions.length > 0) {
        shouldRemoveDuplicates = await showConfirm(
          `This form has ${duplicateQuestions.length} repeated question(s). Click OK to remove the extra copies, or Cancel to keep them if they were added intentionally.`,
          { title: 'Repeated questions', confirmLabel: 'Remove copies', cancelLabel: 'Keep them' },
        );
      }

      const questionsToDisplay = applyDuplicateDecision(applicantQuestions, shouldRemoveDuplicates);

      setCurrentFormId(formId);
      setFormFields(questionsToDisplay);
      setJobTitle(loadedTitle);
      setFixedFields(loadedFixedFields);
      // Baseline is the API payload; a cleaned/deduped list counts as unsaved until Save Form.
      markAsSaved(rawQuestions, loadedTitle, loadedFixedFields);
      setNewField(initialNewField);

      if (promptDuplicates && hiddenCount > 0) {
        toast.info(
          `Loaded ${questionsToDisplay.length} applicant-visible question(s). ${hiddenCount} stored question(s) were hidden (profile/resume duplicates or repeats). Save Form to persist the cleaned list.`,
          { autoClose: 7000 },
        );
      }
    },
    [showConfirm],
  );

  const handleCreateNewForm = useCallback(async () => {
    const title = await showPrompt(
      'Enter the new job form title. Use the exact Collaboration job title so /job-application can match it.',
      {
        title: 'Create new job form',
        confirmLabel: 'Create',
        inputPlaceholder: 'Job form title',
        requireInput: true,
      },
    );
    if (title === null) return;
    const trimmed = String(title).trim();
    if (!trimmed) return;

    const defaults = normalizeFixedFields(DEFAULT_FIXED_FIELDS);
    setCurrentFormId(null);
    setFormFields([]);
    setJobTitle(trimmed);
    setFixedFields(defaults);
    markAsSaved([], trimmed, defaults);
    setNewField(initialNewField);
    setNewFieldErrors({ questionText: '', options: '', newOption: '' });
    setHasUnsavedChanges(true);
  }, [showPrompt]);

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

  // Load live job forms (Collaboration apply forms) and open the first applicant-facing one
  useEffect(() => {
    const loadJobForms = async () => {
      try {
        const visibleForms = await refreshJobFormsList();
        if (visibleForms.length > 0) {
          applyLoadedJobForm(visibleForms[0], { promptDuplicates: false });
        }
      } catch (error) {
        console.error('Error loading job forms:', error);
        toast.error('Failed to load job forms. Please refresh and try again.');
      }
    };

    loadJobForms().catch(error => {
      console.error('Unexpected error loading job forms:', error);
      toast.error('Failed to load job forms. Please refresh and try again.');
    });
  }, [applyLoadedJobForm, refreshJobFormsList]);

  // Detect unsaved changes
  useEffect(() => {
    const changed = hasUnsavedJobFormChanges({
      formFields,
      initialFormFields,
      newField,
      initialNewField,
      templateName: '',
      jobTitle,
      initialJobTitle,
      fixedFields,
      initialFixedFields,
    });

    setHasUnsavedChanges(changed);
  }, [
    formFields,
    initialFormFields,
    newField,
    jobTitle,
    initialJobTitle,
    fixedFields,
    initialFixedFields,
  ]);

  // CRUD Functions with Dynamic Form ID
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
            requestor: getRequestor(),
          });
          markAsSaved(newFields);
        } catch (error) {
          console.error('Error reordering questions on server:', error);
          toast.error(
            error.response?.data?.message ||
              error.response?.data?.error?.message ||
              'Failed to reorder questions. Please try again.',
          );
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
        await axios.delete(ENDPOINTS.DELETE_QUESTION(currentFormId, index), {
          data: { requestor: getRequestor() },
        });
        markAsSaved(newFields);
      } catch (error) {
        console.error('Error deleting question on server:', error);
        toast.error(
          error.response?.data?.message ||
            error.response?.data?.error?.message ||
            'Failed to delete question. Please try again.',
        );
      }
    }
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

  const handleSaveEditedQuestion = async editedQuestion => {
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

    // Update local state immediately
    const updatedFields = [...formFields];
    updatedFields[editingIndex] = updatedField;
    setFormFields(updatedFields);

    // Sync with backend if form exists
    if (currentFormId) {
      try {
        await axios.put(ENDPOINTS.UPDATE_QUESTION(currentFormId, editingIndex), {
          ...updatedField,
          requestor: getRequestor(),
        });
        markAsSaved(updatedFields);
      } catch (error) {
        console.error('Error updating question on server:', error);
        toast.error(
          error.response?.data?.message ||
            error.response?.data?.error?.message ||
            'Failed to update question. Please try again.',
        );
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

  const handleAddOption = () => {
    if (newOption.trim() === '') {
      setNewFieldErrors(prev => ({ ...prev, newOption: 'Option cannot be empty.' }));
      return;
    }
    setNewField(prev => ({
      ...prev,
      options: [...prev.options, newOption.trim()],
    }));
    setNewOption('');
    setNewFieldErrors(prev => ({ ...prev, newOption: '', options: '' }));
  };

  const handleAddField = async () => {
    const errors = { questionText: '', options: '', newOption: '' };
    if (newField.questionText.trim() === '') {
      errors.questionText = 'Field label is required.';
    }
    if (
      ['checkbox', 'radio', 'dropdown'].includes(newField.questionType) &&
      newField.options.length === 0
    ) {
      errors.options = 'Add at least one option for this field.';
    }

    setNewFieldErrors(errors);
    if (errors.questionText || errors.options) return;

    const fieldToAdd = normalizeQuestionForApi(newField);

    if (isDuplicateQuestion(fieldToAdd, formFields)) {
      const confirmAdd = await showConfirm('You already have a similar question. Add anyway?', {
        title: 'Similar question',
        confirmLabel: 'Add anyway',
      });
      if (!confirmAdd) return;
    }
    const updatedFields = [...formFields, fieldToAdd];
    setFormFields(updatedFields);

    // Sync with backend if form exists
    if (currentFormId) {
      try {
        await axios.post(ENDPOINTS.ADD_QUESTION(currentFormId), {
          question: fieldToAdd,
          position: formFields.length,
          requestor: getRequestor(),
        });
        markAsSaved(updatedFields);
      } catch (error) {
        console.error('Error adding question to server:', error);
        toast.error(
          error.response?.data?.message ||
            error.response?.data?.error?.message ||
            'Failed to add question. Please try again.',
        );
      }
    }

    setNewField({
      questionText: '',
      questionType: 'textbox',
      options: [],
      visible: true,
      isRequired: false,
      required: false,
    });
    setNewFieldErrors({ questionText: '', options: '', newOption: '' });
  };

  const changeVisiblity = (event, field) => {
    const updatedFields = formFields.map(item =>
      item.questionText === field.questionText && item.questionType === field.questionType
        ? { ...item, visible: event.target.checked }
        : item,
    );
    setFormFields(updatedFields);
  };

  const handleFixedFieldToggle = (key, checked) => {
    setFixedFields(prev => ({ ...prev, [key]: checked }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const trimmedTitle = String(jobTitle || '').trim();
    if (!trimmedTitle) {
      toast.error('Enter a job form title (use the exact Collaboration job title) before saving.');
      return;
    }

    const payload = {
      title: trimmedTitle,
      questions: formFields.map(normalizeQuestionForApi),
      fixedFields: normalizeFixedFields(fixedFields),
      description: '',
      requestor: getRequestor(),
    };

    try {
      if (currentFormId) {
        await axios.put(ENDPOINTS.UPDATE_JOB_FORM, {
          ...payload,
          formId: currentFormId,
        });
        markAsSaved(formFields, trimmedTitle, fixedFields);
        await refreshJobFormsList();
        toast.success('Form saved successfully!');
        return;
      }

      const response = await axios.post(ENDPOINTS.CREATE_JOB_FORM, payload);
      const created = response.data?.form;
      const createdId = created?._id || created?.id;
      if (!createdId) {
        throw new Error('Create succeeded but no form id was returned.');
      }

      setCurrentFormId(createdId);
      setJobTitle(created.title || trimmedTitle);
      setFixedFields(normalizeFixedFields(created.fixedFields || fixedFields));
      markAsSaved(formFields, created.title || trimmedTitle, created.fixedFields || fixedFields);
      await refreshJobFormsList();
      toast.success(
        'New job form created. It will appear on /job-application when an applicant selects a matching job title.',
      );
    } catch (error) {
      console.error('Error saving form:', error);
      const message =
        error.response?.data?.message ||
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to save form. Please try again.';
      toast.error(message, { autoClose: 7000 });
    }
  };

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
        <h1 className={styles.jobformTitle}>Job Question Set Builder</h1>
        {jobTitle ? (
          <p className={styles.jobformDesc}>
            Editing live form: <strong>{jobTitle}</strong>
          </p>
        ) : null}
        {canManageJobForms ? (
          <JobFormBuilderWorkspace
            jobForms={jobForms}
            currentFormId={currentFormId}
            onLoadJobForm={applyLoadedJobForm}
            onCreateNewForm={handleCreateNewForm}
            formFields={formFields}
            setFormFields={setFormFields}
            darkMode={darkMode}
            showAlert={showAlert}
            showConfirm={showConfirm}
            fixedFields={fixedFields}
            visibleStandardFields={visibleStandardFields}
            onFixedFieldToggle={handleFixedFieldToggle}
            onMoveField={moveField}
            onDeleteField={deleteField}
            onEditField={editField}
            onVisibilityChange={changeVisiblity}
            newField={newField}
            setNewField={setNewField}
            newFieldErrors={newFieldErrors}
            setNewFieldErrors={setNewFieldErrors}
            newOption={newOption}
            setNewOption={setNewOption}
            onAddOption={handleAddOption}
            onAddField={handleAddField}
            onOpenPreview={() => setShowPreviewModal(true)}
            onSubmit={handleSubmit}
            editModalOpen={editModalOpen}
            editingQuestion={editingQuestion}
            onSaveEditedQuestion={handleSaveEditedQuestion}
            onCancelEdit={handleCancelEdit}
          />
        ) : (
          <JobFormBuilderAccessDenied />
        )}
        <FormPreviewModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          formFields={formFields}
          jobTitle={jobTitle}
          fixedFields={fixedFields}
          darkMode={darkMode}
        />
        <JobFormDialog {...dialogProps} darkMode={darkMode} />
      </div>
    </div>
  );
}

export default JobFormBuilder;
