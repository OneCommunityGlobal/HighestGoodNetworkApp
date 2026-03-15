import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Prompt } from 'react-router-dom';
import styles from './JobFormBuilder.module.css';
import { ENDPOINTS } from '~/utils/URL';
import OneCommunityImage from './One-Community-Horizontal-Homepage-Header-980x140px-2.png';
import QuestionSetManager from './QuestionSetManager';
import QuestionFieldActions from './QuestionFieldActions';
import QuestionEditModal from './QuestionEditModal';

const safeAlert = msg => globalThis.alert(msg);
const safeConfirm = msg => globalThis.confirm(msg);

function JobFormBuilder() {
  const { role } = useSelector(state => state.auth.user);
  const darkMode = useSelector(state => state.theme.darkMode);

  const [formFields, setFormFields] = useState([]);
  const [initialFormFields, setInitialFormFields] = useState([]);

  const [templateName, setTemplateName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const [currentFormId, setCurrentFormId] = useState(null);

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

  const [newOption, setNewOption] = useState('');

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const jobPositions = ['Software Developer', 'Project Manager', 'Analyst'];

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

  // Load form initially
  useEffect(() => {
    const loadForm = async () => {
      try {
        const response = await axios.get(ENDPOINTS.GET_ALL_JOB_FORMS);

        if (response.data?.length > 0) {
          const form = response.data[0];
          const id = form._id || form.id;

          setCurrentFormId(id);
          setFormFields(form.questions || []);
          setInitialFormFields(form.questions || []);

          setNewField(initialNewField);
          setHasUnsavedChanges(false);
        }
      } catch (error) {
        // still allowed logging
        console.error(error);
      }
    };

    loadForm();
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

  // Clone field
  const cloneField = async (field, index) => {
    const clone = structuredClone(field);

    const updated = [...formFields.slice(0, index + 1), clone, ...formFields.slice(index + 1)];
    setFormFields(updated);

    if (currentFormId) {
      try {
        await axios.post(ENDPOINTS.ADD_QUESTION(currentFormId), {
          question: clone,
          position: index + 1,
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  // Move field
  const moveField = async (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formFields.length) return;

    const updated = [...formFields];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setFormFields(updated);

    if (currentFormId) {
      try {
        await axios.put(ENDPOINTS.REORDER_QUESTIONS(currentFormId), {
          fromIndex: index,
          toIndex: newIndex,
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  // Delete field
  const deleteField = async index => {
    const updated = [...formFields];
    updated.splice(index, 1);
    setFormFields(updated);

    if (currentFormId) {
      try {
        await axios.delete(ENDPOINTS.DELETE_QUESTION(currentFormId, index));
      } catch (error) {
        console.error(error);
      }
    }
  };

  // Edit field
  const editField = (field, index) => {
    setEditingQuestion({
      label: field.questionText,
      type: field.questionType,
      options: field.options,
      required: field.required || false,
      placeholder: field.placeholder || '',
    });

    setEditingIndex(index);
    setEditModalOpen(true);
  };

  const handleSaveEditedQuestion = async edited => {
    const updated = [...formFields];

    updated[editingIndex] = {
      ...updated[editingIndex],
      questionText: edited.label,
      questionType: edited.type,
      options: edited.options || [],
      required: edited.required,
      placeholder: edited.placeholder,
    };

    setFormFields(updated);

    if (currentFormId) {
      try {
        await axios.put(
          ENDPOINTS.UPDATE_QUESTION(currentFormId, editingIndex),
          updated[editingIndex],
        );
      } catch (error) {
        console.error(error);
      }
    }

    setEditModalOpen(false);
    setEditingQuestion(null);
    setEditingIndex(null);
  };

  // Add option
  const handleAddOption = () => {
    if (!newOption.trim()) {
      safeAlert('Option cannot be empty');
      return;
    }

    setNewField(prev => ({
      ...prev,
      options: [...prev.options, newOption],
    }));

    setNewOption('');
  };

  // Add field
  const handleAddField = async () => {
    if (!newField.questionText.trim()) {
      safeAlert('Field label is required');
      return;
    }

    if (
      ['checkbox', 'radio', 'dropdown'].includes(newField.questionType) &&
      newField.options.length === 0
    ) {
      safeAlert('Please add at least one option');
      return;
    }

    const updated = [...formFields, newField];
    setFormFields(updated);

    if (currentFormId) {
      try {
        await axios.post(ENDPOINTS.ADD_QUESTION(currentFormId), {
          question: newField,
          position: formFields.length,
        });
      } catch (error) {
        console.error(error);
      }
    }

    setNewField(initialNewField);
  };

  const changeVisibility = (event, field) => {
    const updated = formFields.map(item =>
      item.questionText === field.questionText && item.questionType === field.questionType
        ? { ...item, visible: event.target.checked }
        : item,
    );

    setFormFields(updated);
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
            <select className={styles.jobformSelect}>
              <option value="Please Choose an option">Please Choose an option</option>
              {jobPositions.map((pos, index) => (
                <option key={`pos-${index}`} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>
        </div>

        <h1 className={styles.jobformTitle}>FORM CREATION</h1>

        {(role === 'Owner' || role === 'Administrator') && (
          <div className={styles.customForm}>
            <p className={styles.jobformDesc}>
              Fill the form with questions about a specific position you want to create an ad for.
              The default questions will automatically appear and are already selected. You can pick
              and choose them with the checkbox.
            </p>

            <QuestionSetManager
              formFields={formFields}
              setFormFields={setFormFields}
              onImportQuestions={setFormFields}
              darkMode={darkMode}
              templateName={templateName}
              setTemplateName={setTemplateName}
              selectedTemplate={selectedTemplate}
              setSelectedTemplate={setSelectedTemplate}
            />

            <form>
              {formFields.map((field, index) => (
                <div className={styles.formDiv} key={field._id || `${field.questionText}-${index}`}>
                  <QuestionFieldActions
                    field={field}
                    index={index}
                    totalFields={formFields.length}
                    onClone={cloneField}
                    onMove={moveField}
                    onDelete={deleteField}
                    onEdit={editField}
                    visible={field.visible}
                    onVisibilityChange={e => changeVisibility(e, field)}
                  />

                  <div className={styles.formField}>
                    <label className={`${styles.fieldLabel} ${styles.jbformLabel}`}>
                      {field.questionText}
                    </label>

                    <div className={styles.fieldOptions}>
                      {field.questionType === 'textbox' && (
                        <input type="text" className={styles.jobformInput} />
                      )}

                      {field.questionType === 'date' && (
                        <input type="date" className={styles.jobformInput} />
                      )}

                      {field.questionType === 'textarea' && (
                        <textarea className={styles.jobformTextarea} />
                      )}

                      {['checkbox', 'radio'].includes(field.questionType) &&
                        field.options.map((opt, i) => (
                          <div
                            key={`${field._id || field.questionText}-opt-${i}`}
                            className={styles.optionItem}
                          >
                            <input type={field.questionType} name={`field-${index}`} />
                            <label className={styles.jbformLabel}>{opt}</label>
                          </div>
                        ))}

                      {field.questionType === 'dropdown' && (
                        <select className={styles.jobformSelect}>
                          {field.options.map((opt, i) => (
                            <option key={`${field._id || field.questionText}-drop-${i}`}>
                              {opt}
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
                    onChange={e =>
                      setNewField(prev => ({
                        ...prev,
                        questionText: e.target.value,
                      }))
                    }
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
                    onChange={e =>
                      setNewField(prev => ({
                        ...prev,
                        questionType: e.target.value,
                        options: [],
                      }))
                    }
                    className={styles.jobformSelect}
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
                    {newField.options.map((opt, i) => (
                      <div key={`new-opt-${i}`} className={styles.optionItem}>
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button type="button" onClick={handleAddField} className={styles.addFieldButton}>
                Add Field
              </button>
            </div>

            {editModalOpen && editingQuestion && (
              <QuestionEditModal
                question={editingQuestion}
                onSave={handleSaveEditedQuestion}
                onCancel={() => {
                  setEditModalOpen(false);
                  setEditingQuestion(null);
                  setEditingIndex(null);
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default JobFormBuilder;
