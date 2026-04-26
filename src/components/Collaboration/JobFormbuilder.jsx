/* eslint-disable no-alert */
/* eslint-disable no-console */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import styles from './JobFormBuilder.module.css';
import { ENDPOINTS } from '~/utils/URL';
import { hasPermissionSimple } from '~/utils/permissions';
import OneCommunityImage from './One-Community-Horizontal-Homepage-Header-980x140px-2.png';
import QuestionSetManager from './QuestionSetManager';
import QuestionFieldActions from './QuestionFieldActions';
import QuestionEditModal from './QuestionEditModal';
import FormPreviewModal from './FormPreviewModal';
import { JOB_FORM_POSITION_OPTIONS } from '../JobFormManagement/jobFormPositions';

function JobFormBuilder() {
  const { auth } = useSelector(state => state);
  const userPermissions = auth?.user?.permissions?.frontPermissions || [];
  const userRole = auth?.user?.role;
  const darkMode = useSelector(state => state.theme.darkMode);

  const canManageJobForms = () =>
    hasPermissionSimple(userPermissions, 'manageJobForms') || userRole === 'Owner';
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
  });

  const initialNewField = {
    questionText: '',
    questionType: 'textbox',
    options: [],
    visible: true,
  };

  const [jobTitle, setJobTitle] = useState('Please Choose an option');
  const jobPositions = JOB_FORM_POSITION_OPTIONS;

  const [newOption, setNewOption] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const markAsSaved = fields => {
    setInitialFormFields(structuredClone(fields));
    setHasUnsavedChanges(false);
  };

  // Reset builder after template is saved
  const resetBuilderState = () => {
    setFormFields([]);
    setNewField({
      questionText: '',
      questionType: 'textbox',
      options: [],
      visible: true,
    });
    setNewOption('');
  };

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
          setFormFields(firstForm.questions || []);
          setJobTitle(firstForm.title || 'Please Choose an option');
          markAsSaved(firstForm.questions || []);
          setNewField(initialNewField);

          console.log('Auto-loaded form:', formId);
        }
      } catch (error) {
        console.error('Error auto-loading form:', error);
      }
    };

    loadFirstAvailableForm();
  }, []);

  // Detect unsaved changes
  useEffect(() => {
    const changed =
      JSON.stringify(formFields) !== JSON.stringify(initialFormFields) ||
      JSON.stringify(newField) !== JSON.stringify(initialNewField) ||
      templateName !== '' ||
      selectedTemplate !== '';

    setHasUnsavedChanges(changed);
  }, [formFields, newField, templateName, selectedTemplate, initialFormFields]);

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
        markAsSaved(newFields);
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
          markAsSaved(newFields);
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
        markAsSaved(newFields);
        console.log('Question deleted successfully');
      } catch (error) {
        console.error('Error deleting question on server:', error);
      }
    }
  };

  const editField = (field, index) => {
    // Transform the field structure to match what QuestionEditModal expects
    const questionForEdit = {
      label: field.questionText,
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
        markAsSaved(updatedFields);
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

    // Update local state immediately
    const updatedFields = [...formFields, newField];
    setFormFields(updatedFields);

    // Sync with backend if form exists
    if (currentFormId) {
      try {
        await axios.post(ENDPOINTS.ADD_QUESTION(currentFormId), {
          question: newField,
          position: formFields.length,
        });
        markAsSaved(updatedFields);
      } catch (error) {
        console.error('Error adding question to server:', error);
      }
    }

    setNewField({ questionText: '', questionType: 'textbox', options: [], visible: true });
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

    const formIdToUse = currentFormId || '6753982566fcf3275f129eb4';

    try {
      await axios.put(ENDPOINTS.UPDATE_JOB_FORM, {
        formId: formIdToUse,
        title: jobTitle,
        questions: formFields,
        description: '',
        requestor: {
          requestorId: auth.user.userid,
          role: userRole,
        },
      });

      console.log('Form updated successfully');
      alert('Form saved successfully!');
    } catch (error) {
      console.error('Error updating form:', error);
      alert('Failed to save form. Please try again.');
    }
  };

  return (
    <div className={`${styles.pageWrapper} ${darkMode ? styles.darkMode : ''}`}>
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
        <h1 className={styles.jobformTitle}>FORM CREATION</h1>
        {canManageJobForms() ? (
          <div className={styles.customForm}>
            <p className={styles.jobformDesc}>
              Fill the form with questions about a specific position you want to create an ad for.
              The default questions will automatically appear and are alredy selected. You can pick
              and choose them with the checkbox.
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
            <form>
              {formFields.map((field, index) => (
                <div className={styles.formDiv} key={uuidv4()}>
                  <QuestionFieldActions
                    field={field}
                    index={index}
                    className={styles.formDivCheckbox}
                    totalFields={formFields.length}
                    onMove={moveField}
                    onDelete={deleteField}
                    onEdit={editField}
                    visible={field.visible}
                    onVisibilityChange={event => changeVisiblity(event, field)}
                  />
                  <div className={styles.formField} key={uuidv4()}>
                    <label className={`${styles.fieldLabel} ${styles.jbformLabel}`}>
                      {field.questionText}
                    </label>
                    <div className={styles.fieldOptions}>
                      {field.questionType === 'textbox' && (
                        <input
                          type="text"
                          placeholder="Enter Text here"
                          className={styles.jobformInput}
                        />
                      )}
                      {field.questionType === 'date' && (
                        <input
                          type="date"
                          placeholder="Enter date"
                          className={styles.jobformInput}
                        />
                      )}
                      {field.questionType === 'textarea' && (
                        <textarea className={styles.jobformTextarea} />
                      )}
                      {['checkbox', 'radio'].includes(field.questionType) &&
                        field.options.map(option => (
                          <div key={uuidv4()} className={styles.optionItem}>
                            <input
                              type={field.questionType}
                              name={`field-${index}`}
                              className={styles.jobformInput}
                            />
                            <label className={styles.jbformLabel}>{option}</label>
                          </div>
                        ))}
                      {field.questionType === 'dropdown' && (
                        <select className={styles.jobformSelect}>
                          {field.options.map(option => (
                            <option key={uuidv4()} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
                    <option value="textbox">TextBox</option>
                    <option value="textarea">Textarea</option>
                    <option value="checkbox">Checkbox</option>
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
              <button type="submit" className={styles.jobSubmitButton} onClick={handleSubmit}>
                Save Form
              </button>
            </div>

            {editModalOpen && editingQuestion && (
              <QuestionEditModal
                question={editingQuestion}
                onSave={handleSaveEditedQuestion}
                onCancel={handleCancelEdit}
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
      </div>
    </div>
  );
}

export default JobFormBuilder;
