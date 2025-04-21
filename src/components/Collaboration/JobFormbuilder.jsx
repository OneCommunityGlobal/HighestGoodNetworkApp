import { useState } from 'react';
import './JobFormBuilder.css';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { ENDPOINTS } from '../../utils/URL';
import OneCommunityImage from './One-Community-Horizontal-Homepage-Header-980x140px-2.png';
import QuestionSetManager from './QuestionSetManager';
import QuestionFieldActions from './QuestionFieldActions';
import QuestionEditModal from './QuestionEditModal'; 
function JobFormBuilder() {
  const { role } = useSelector(state => state.auth.user);
  const [formFields, setFormFields] = useState([]);
  const [newField, setNewField] = useState({
    questionText: '',
    questionType: 'textbox',
    options: [], // For checkbox, radio, and dropdown input types
    visible: true,
  });

  // 67515a08aa726cdb94898c40
  const [jobTitle, setJobTitle] = useState('Please Choose an option');
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

  const [newOption, setNewOption] = useState('');


const [editModalOpen, setEditModalOpen] = useState(false);
const [editingQuestion, setEditingQuestion] = useState(null);
const [editingIndex, setEditingIndex] = useState(null);

  // Within your JobFormBuilder function, add these new functions:

// Clone a single question field
// const cloneField = (field, index) => {
//   const clonedField = JSON.parse(JSON.stringify(field)); // Deep clone
//   setFormFields([...formFields.slice(0, index + 1), clonedField, ...formFields.slice(index + 1)]);
// };

const cloneField = async (field, index) => {
  const clonedField = JSON.parse(JSON.stringify(field)); // Deep clone
  
  // Update local state
  const newFields = [...formFields.slice(0, index + 1), clonedField, ...formFields.slice(index + 1)];
  setFormFields(newFields);
  
  // Sync with backend
  try {
    const formId = '6753982566fcf3275f129eb4';
    await axios.post(`${ENDPOINTS.BASE_URL}/api/jobforms/${formId}/questions`, {
      question: clonedField,
      position: index + 1 // Position right after the original
    });
  } catch (error) {
    console.error('Error cloning question on server:', error);
  }
};
//pallavi

// Move a field up or down in the list
// const moveField = (index, direction) => {
//   if (direction === 'up' && index > 0) {
//     const newFields = [...formFields];
//     [newFields[index], newFields[index - 1]] = [newFields[index - 1], newFields[index]];
//     setFormFields(newFields);
//   } else if (direction === 'down' && index < formFields.length - 1) {
//     const newFields = [...formFields];
//     [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
//     setFormFields(newFields);
//   }
// };
const moveField = async (index, direction) => {
  // Calculate new index
  const newIndex = direction === 'up' ? index - 1 : index + 1;
  
  // Check if move is valid
  if ((direction === 'up' && index > 0) || 
      (direction === 'down' && index < formFields.length - 1)) {
    
    // Update local state
    const newFields = [...formFields];
    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
    setFormFields(newFields);
    
    // Sync with backend
    try {
      const formId = '6753982566fcf3275f129eb4';
      await axios.put(`${ENDPOINTS.BASE_URL}/api/jobforms/${formId}/questions/reorder`, {
        fromIndex: index,
        toIndex: newIndex
      });
    } catch (error) {
      console.error('Error reordering questions on server:', error);
    }
  }
};
//pallavi

// Delete a field
// const deleteField = (index) => {
//   const newFields = [...formFields];
//   newFields.splice(index, 1);
//   setFormFields(newFields);
// };
// Update deleteField to sync with backend
const deleteField = async (index) => {
  // Update local state
  const newFields = [...formFields];
  newFields.splice(index, 1);
  setFormFields(newFields);
  
  // Sync with backend
  try {
    const formId = '6753982566fcf3275f129eb4';
    await axios.delete(`${ENDPOINTS.BASE_URL}/api/jobforms/${formId}/questions/${index}`);
  } catch (error) {
    console.error('Error deleting question on server:', error);
  }
};
//pallavi
// Add this function for editing questions
const editField = (field, index) => {
  // Transform the field structure to match what QuestionEditModal expects
  const questionForEdit = {
    label: field.questionText,
    type: field.questionType,
    options: field.options,
    required: field.required || false,
    placeholder: field.placeholder || ''
  };
  
  setEditingQuestion(questionForEdit);
  setEditingIndex(index);
  setEditModalOpen(true);
};

//edit question functinality
const handleSaveEditedQuestion = async(editedQuestion) => {
  
  const updatedField = {
    ...formFields[editingIndex],
    questionText: editedQuestion.label,
    questionType: editedQuestion.type,
    options: editedQuestion.options || [],
    required: editedQuestion.required,
    placeholder: editedQuestion.placeholder
  };
  
  const updatedFields = [...formFields];
  updatedFields[editingIndex] = updatedField;
  setFormFields(updatedFields);


  //Pallavi
   
   try {
    
    const formId = '6753982566fcf3275f129eb4';  
  
  await axios.patch(
      `${ENDPOINTS.BASE_URL}/api/jobforms/${formId}/questions/${editingIndex}`, 
      updatedField
    );
    
    console.log('Question updated successfully on server');
  } catch (error) {

    console.error('Error updating question on server:', error);
  
  }
    //Pallavi

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
const importQuestions = (questions) => {
  setFormFields(questions);
};

  const handleAddOption = () => {
    if (newOption.trim() === '') {
      // eslint-disable-next-line no-alert
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
      // eslint-disable-next-line no-alert
      alert('Field label is required!');
      return;
    }

    if (
      ['checkbox', 'radio', 'dropdown'].includes(newField.questionType) &&
      newField.options.length === 0
    ) {
      // eslint-disable-next-line no-alert
      alert('You must add at least one option for this field!');
      return;
    }

    setFormFields([...formFields, newField]);
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

  const handleSubmit = e => {
    e.preventDefault();
    // Test function to create a form
    // axios.post(ENDPOINTS.CREATE_JOB_FORM,{title:jobTitle,questions:formFields,description:''}).then((resolve,reject)=>{
    //   console.log(resolve.data)
    // })

    // Test Funcition to read a specific form format
    // axios.get(ENDPOINTS.GET_JOB_FORM(formId)).then((resolve,reject)=>{
    //   console.log(resolve.data);
    // })

    // Test function to read all form formats
    // axios.get(ENDPOINTS.GET_ALL_JOB_FORMS).then((resolve,reject)=>{
    //   console.log(resolve.data)
    // })

    // Test function to update job forms
    axios
      .put(ENDPOINTS.UPDATE_JOB_FORM, {
        formId: '6753982566fcf3275f129eb4',
        title: jobTitle,
        questions: formFields,
        description: '',
      })
      .then(resolve => {
        // eslint-disable-next-line no-console
        console.log(resolve.data);
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.log(error);
      });
  };

  return (
    <div className="form-builder-container">
      <img src={OneCommunityImage} alt="One Community Logo" id="onecommunity-image" />
      <div className="jobform-navbar">
        <div>
          <input placeholder="Enter Job Title" />
          <button type="button" className="go-button">
            Go
          </button>
        </div>
        <div>
          <select value={jobTitle} onChange={q => setJobTitle(q.target.value)}>
            <option value="Please Choose an option">Please Choose an Option</option>
            {jobPositions.map((e, i) => (
              <option
                /* eslint-disable-next-line react/no-array-index-key */
                key={i + 1}
                value={e}
              >
                {e}
              </option>
            ))}
          </select>
        </div>
      </div>
      <h1>FORM CREATION</h1>

      {role === 'Owner' ? (
        <div className="custom-form">
          <p>
            Fill the form with questions about a specific position you want to create an ad for. The
            default questions will automatically appear and are already selected. You can pick and
            choose them with the checkbox.
          </p>
          <QuestionSetManager 
      formFields={formFields} 
      setFormFields={setFormFields} 
      onImportQuestions={importQuestions} 
    />
          <form>
            {formFields.map((field, index) => (
              <div
                className="form-div"
                /* eslint-disable-next-line react/no-array-index-key */
                key={index + 1}
              >
                {/* <input
                  type="checkbox"
                  id="form-div-checkbox"
                  checked={field.visible}
                  onChange={event => changeVisiblity(event, field)}
                /> */}
                 <QuestionFieldActions
            field={field}
            index={index}
            totalFields={formFields.length}
            onClone={cloneField}
            onMove={moveField}
            onDelete={deleteField}
            onEdit={editField}
            visible={field.visible}
            onVisibilityChange={(event) => changeVisiblity(event, field)}
          />
                <div
                  /* eslint-disable-next-line react/no-array-index-key */
                  key={index + 1}
                  className="form-field"
                >
                  <label className="field-label">{field.questionText}</label>
                  <div className="field-options">
                    {field.questionType === 'textbox' && (
                      <input type="text" placeholder="Enter Text here" />
                    )}
                    {field.questionType === 'date' && (
                      <input type="date" placeholder="Enter date" />
                    )}
                    {field.questionType === 'textarea' && <textarea />}
                    {['checkbox', 'radio'].includes(field.questionType) &&
                      field.options.map((option, idx) => (
                        <div
                          /* eslint-disable-next-line react/no-array-index-key */
                          key={idx + 1}
                          className="option-item"
                        >
                          <input type={field.questionType} name={`field-${index}`} />
                          <label>{option}</label>
                        </div>
                      ))}
                    {field.questionType === 'dropdown' && (
                      <select>
                        {field.options.map((option, idx) => (
                          <option
                            /* eslint-disable-next-line react/no-array-index-key */
                            key={idx + 1}
                            value={option}
                          >
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
          <div className="new-field-section">
            <div>
              <label>
                Field Label:
                <input
                  type="text"
                  value={newField.questionText}
                  onChange={e => {
                    e.persist();
                    setNewField(prev => ({ ...prev, questionText: e.target.value }));
                  }}
                  placeholder="Enter Field Label"
                />
              </label>
            </div>
            <div>
              <label>
                Input Type:
                <select
                  value={newField.questionType}
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
              <div className="options-section">
                <label>
                  Add Option:
                  <input
                    type="text"
                    value={newOption}
                    onChange={e => setNewOption(e.target.value)}
                    placeholder="Enter an option"
                  />
                </label>
                <button type="button" onClick={handleAddOption} className="add-option-button">
                  Add Option
                </button>
                <div className="options-list">
                  <h4>Options:</h4>
                  {newField.options.map((option, index) => (
                    <div
                      /* eslint-disable-next-line react/no-array-index-key */
                      key={index + 1}
                      className="option-item"
                    >
                      {option}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button type="button" onClick={handleAddField} className="add-field-button">
              Add Field
            </button>
          </div>
          <button type="submit" className="job-submit-button" onClick={handleSubmit}>
            Proceed to Submit with Details
          </button>
          {editModalOpen && editingQuestion && (
            <QuestionEditModal
              question={editingQuestion}
              onSave={handleSaveEditedQuestion}
              onCancel={handleCancelEdit}
            />
          )}
        </div>
      ) : null}
    </div>
  );
}

export default JobFormBuilder;
