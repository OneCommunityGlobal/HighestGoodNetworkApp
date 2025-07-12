import { useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import styles from './JobFormBuilder.module.css';
import { ENDPOINTS } from '~/utils/URL';
import OneCommunityImage from './One-Community-Horizontal-Homepage-Header-980x140px-2.png';

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
      <h1 className={styles.jobformTitle}>FORM CREATION</h1>

      {role === 'Owner' ? (
        <div className={styles.customForm}>
          <p className={styles.jobformDesc}>
            Fill the form with questions about a specific position you want to create an ad for. The
            default questions will automatically appear and are alredy selected. You can pick and
            choose them with the checkbox.
          </p>
          <form>
            {formFields.map((field, index) => (
              <div
                className={styles.formDiv}
                /* eslint-disable-next-line react/no-array-index-key */
                key={index + 1}
              >
                <input
                  type="checkbox"
                  id="form-div-checkbox"
                  className={styles.formDivCheckbox}
                  checked={field.visible}
                  onChange={event => changeVisiblity(event, field)}
                />
                <div
                  /* eslint-disable-next-line react/no-array-index-key */
                  key={index + 1}
                  className={styles.formField}
                >
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
                      field.options.map((option, idx) => (
                        <div
                          /* eslint-disable-next-line react/no-array-index-key */
                          key={idx + 1}
                          className={styles.optionItem}
                        >
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
                  {newField.options.map((option, index) => (
                    <div
                      /* eslint-disable-next-line react/no-array-index-key */
                      key={index + 1}
                      className={styles.optionItem}
                    >
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
        </div>
      ) : null}
    </div>
  );
}

export default JobFormBuilder;
