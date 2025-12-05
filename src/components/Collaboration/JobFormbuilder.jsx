/* eslint-disable no-alert */
/* eslint-disable no-console */
// eslint-disable-next-line no-alert
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import styles from './JobFormBuilder.module.css';
import { ENDPOINTS } from '~/utils/URL';
import OneCommunityImage from './One-Community-Horizontal-Homepage-Header-980x140px-2.png';
import QuestionSetManager from './QuestionSetManager';
import QuestionFieldActions from './QuestionFieldActions';
import QuestionEditModal from './QuestionEditModal';
import generateReferralLink from './ReferralLinkGenerator';

function JobFormBuilder() {
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
        console.log('Referral link copied!');
        // you can add a toast/snackbar UI here if needed
      } catch (err) {
        console.error('Failed to copy referral link:', err);
      }
    }
  };

  const [newOption, setNewOption] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);

  // Auto-load existing form on component mount
  useEffect(() => {
    const loadFirstAvailableForm = async () => {
      try {
        const response = await axios.get(ENDPOINTS.GET_ALL_JOB_FORMS);

        if (response.data && response.data.length > 0) {
          const firstForm = response.data[0];
          const formId = firstForm._id || firstForm.id;

          setCurrentFormId(formId);
          setFormFields(firstForm.questions || []);
          setJobTitle(firstForm.title || 'Please Choose an option');

          console.log('Auto-loaded form:', formId);
        }
      } catch (error) {
        console.error('Error auto-loading form:', error);
      }
    };

    loadFirstAvailableForm();
  }, []);

  // const ensureFormExists = async () => {
  //   if (!currentFormId) {
  //     console.warn('No form ID available for this operation');
  //     return false;
  //   }
  //   return true;
  // };

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

      console.log('Form updated successfully');
      alert('Form saved successfully!');
    } catch (error) {
      console.error('Error updating form:', error);
      alert('Failed to save form. Please try again.');
    }
  };

  const darkMode = useSelector(state => state.theme?.darkMode);

  return (
    <div
      className={`${styles.formBuilderContainer} ${darkMode ? 'bg-oxford-blue' : ''} ${
        darkMode ? styles.darkContainer : ''
      }`}
    >
      <img
        src={OneCommunityImage}
        alt="One Community Logo"
        id="onecommunity-image"
        className={styles.oneCommunityGlobalImg}
      />
      <div className={`${styles.jobformNavbar} ${darkMode ? styles.darkNavbar : ''}`}>
        {/* Job Position Selection Section */}
        <div className={styles.navbarSection}>
          <div className={styles.navbarSectionTitle}>Select Job Position</div>
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

        {/* Job Search Section */}
        <div className={styles.navbarSection}>
          <div className={styles.navbarSectionTitle}>Search Job Title</div>
          <div className={styles.buttonRow}>
            <input
              placeholder="Enter Job Title"
              className={styles.jobformInput}
              style={{ flex: 1, minWidth: '150px', padding: '8px' }}
            />
            <button type="button" className={styles.goButton}>
              Go
            </button>
          </div>
        </div>

        {/* Referral Link Generator Section */}
        <div className={styles.navbarSection}>
          <div className={styles.navbarSectionTitle}>Referral Link Generator</div>
          <div className={styles.inputGroup}>
            <div>
              <label htmlFor="referralSource" style={{ fontSize: '14px', fontWeight: 'normal' }}>
                Source Identifier (e.g., LN, FB):
              </label>
              <input
                id="referralSource"
                type="text"
                value={referralSource}
                onChange={e => setReferralSource(e.target.value)}
                className={styles.jobformInput}
                placeholder="Enter source"
                maxLength={10}
              />
            </div>

            {referralLink && (
              <div className={styles.buttonRow}>
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  ref={referralInputRef}
                  className={styles.jobformInput}
                  style={{
                    flex: '1',
                    minWidth: '150px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                  }}
                  title={referralLink}
                />
                <button type="button" onClick={handleCopyReferralLink} className={styles.goButton}>
                  Copy Link
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <h1 className={styles.jobformTitle}>FORM CREATION</h1>

      {role === 'Owner' ? (
        <div className={styles.customForm}>
          <p className={styles.jobformDesc}>
            Fill the form with questions about a specific position you want to create an ad for. The
            default questions will automatically appear and are already selected. You can pick and
            choose them with the checkbox.
          </p>
          <QuestionSetManager
            formFields={formFields}
            setFormFields={setFormFields}
            onImportQuestions={importQuestions}
            darkMode={darkMode}
          />
          <form>
            {formFields.map((field, index) => (
              <div className={styles.formDiv} key={uuidv4()}>
                <QuestionFieldActions
                  field={field}
                  index={index}
                  className={styles.formDivCheckbox}
                  totalFields={formFields.length}
                  onClone={cloneField}
                  onMove={moveField}
                  onDelete={deleteField}
                  onEdit={editField}
                  visible={field.visible}
                  onVisibilityChange={event => changeVisiblity(event, field)}
                />
                <div key={uuidv4()} className={styles.formField}>
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
                      <input type="date" placeholder="Enter date" className={styles.jobformInput} />
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
