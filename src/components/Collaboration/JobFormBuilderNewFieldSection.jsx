import PropTypes from 'prop-types';
import styles from './JobFormBuilder.module.css';

const OPTION_QUESTION_TYPES = new Set(['checkbox', 'radio', 'dropdown']);

function JobFormBuilderNewFieldSection({
  newField,
  setNewField,
  newFieldErrors,
  setNewFieldErrors,
  newOption,
  setNewOption,
  onAddOption,
  onAddField,
}) {
  const showOptions = OPTION_QUESTION_TYPES.has(newField.questionType);
  const optionError = newFieldErrors.newOption || newFieldErrors.options;

  return (
    <div className={styles.newFieldSection}>
      <div>
        <label className={styles.jbformLabel} htmlFor="jfb-new-field-label">
          Field Label:
        </label>
        <input
          id="jfb-new-field-label"
          type="text"
          value={newField.questionText}
          onChange={e => {
            const { value } = e.target;
            setNewField(prev => ({ ...prev, questionText: value }));
            if (newFieldErrors.questionText) {
              setNewFieldErrors(prev => ({ ...prev, questionText: '' }));
            }
          }}
          placeholder="Enter Field Label"
          className={`${styles.jobformInput} ${
            newFieldErrors.questionText ? styles.jobformInputError : ''
          }`}
          aria-invalid={Boolean(newFieldErrors.questionText)}
          aria-describedby={newFieldErrors.questionText ? 'jfb-new-field-label-error' : undefined}
        />
        {newFieldErrors.questionText ? (
          <p id="jfb-new-field-label-error" className={styles.fieldError} role="alert">
            {newFieldErrors.questionText}
          </p>
        ) : null}
      </div>
      <div>
        <label className={styles.jbformLabel} htmlFor="jfb-new-field-type">
          Input Type:
        </label>
        <select
          id="jfb-new-field-type"
          value={newField.questionType}
          className={styles.jobformSelect}
          onChange={e => {
            const { value } = e.target;
            setNewField(prev => ({
              ...prev,
              questionType: value,
              options: [],
            }));
            setNewFieldErrors(prev => ({ ...prev, options: '', newOption: '' }));
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
      </div>

      {showOptions ? (
        <div className={styles.optionsSection}>
          <label className={styles.jbformLabel} htmlFor="jfb-new-option">
            Add Option:
          </label>
          <input
            id="jfb-new-option"
            type="text"
            value={newOption}
            onChange={e => {
              setNewOption(e.target.value);
              if (newFieldErrors.newOption) {
                setNewFieldErrors(prev => ({ ...prev, newOption: '' }));
              }
            }}
            className={`${styles.jobformInput} ${
              newFieldErrors.newOption ? styles.jobformInputError : ''
            }`}
            placeholder="Enter an option"
            aria-invalid={Boolean(newFieldErrors.newOption)}
            aria-describedby={optionError ? 'jfb-new-option-error' : undefined}
          />
          {optionError ? (
            <p id="jfb-new-option-error" className={styles.fieldError} role="alert">
              {optionError}
            </p>
          ) : null}
          <button type="button" onClick={onAddOption} className={styles.addOptionButton}>
            Add Option
          </button>
          <div className={styles.optionsList}>
            <h4>Options:</h4>
            {newField.options.map((option, optionIndex) => (
              <div key={`${option}-${optionIndex}`} className={styles.optionItem}>
                {option}
              </div>
            ))}
          </div>
        </div>
      ) : null}

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

      <button type="button" onClick={onAddField} className={styles.addFieldButton}>
        Add Field
      </button>
    </div>
  );
}

JobFormBuilderNewFieldSection.propTypes = {
  newField: PropTypes.shape({
    questionText: PropTypes.string,
    questionType: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.string),
    isRequired: PropTypes.bool,
    required: PropTypes.bool,
  }).isRequired,
  setNewField: PropTypes.func.isRequired,
  newFieldErrors: PropTypes.shape({
    questionText: PropTypes.string,
    options: PropTypes.string,
    newOption: PropTypes.string,
  }).isRequired,
  setNewFieldErrors: PropTypes.func.isRequired,
  newOption: PropTypes.string.isRequired,
  setNewOption: PropTypes.func.isRequired,
  onAddOption: PropTypes.func.isRequired,
  onAddField: PropTypes.func.isRequired,
};

export default JobFormBuilderNewFieldSection;
