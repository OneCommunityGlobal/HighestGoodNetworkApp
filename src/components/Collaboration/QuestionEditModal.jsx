/* eslint-disable no-alert */
/* eslint-disable no-console */
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './QuestionEditModal.module.css';

let optionRowIdCounter = 0;

const createOptionId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  optionRowIdCounter += 1;
  return `opt-${optionRowIdCounter}-${Date.now()}`;
};

const toOptionRows = options =>
  (options || []).map(value => ({
    id: createOptionId(),
    value: value ?? '',
  }));

function QuestionEditModal({ question, onSave, onCancel, darkMode = false }) {
  const [editedQuestion, setEditedQuestion] = useState({
    ...question,
    required: question.required || question.isRequired || false,
    options: question.options || [],
  });
  const [optionRows, setOptionRows] = useState(() => toOptionRows(question.options));

  useEffect(() => {
    console.log('Current editedQuestion state:', editedQuestion);
  }, [editedQuestion]);

  useEffect(() => {
    // Update state when the question prop changes
    setEditedQuestion({
      ...question,
      required: question.required || question.isRequired || false,
      options: question.options || [],
    });
    setOptionRows(toOptionRows(question.options));
  }, [question]);

  const handleInputChange = e => {
    const { name, value } = e.target;

    // Special handling when changing question type
    if (name === 'type') {
      // Check if this type requires options
      const requiresOptions = ['dropdown', 'radio', 'checkbox'].includes(value);

      let newOptions = [];

      if (requiresOptions) {
        newOptions =
          editedQuestion.options && editedQuestion.options.length > 0
            ? editedQuestion.options
            : [''];
        setOptionRows(toOptionRows(newOptions));
      } else {
        setOptionRows([]);
      }

      setEditedQuestion({
        ...editedQuestion,
        [name]: value,
        options: newOptions,
      });
    } else {
      setEditedQuestion({
        ...editedQuestion,
        [name]: value,
      });
    }
  };

  const applyOptionRows = rows => {
    setOptionRows(rows);
    setEditedQuestion(prev => ({
      ...prev,
      options: rows.map(row => row.value),
    }));
  };

  const handleOptionsChange = (optionId, value) => {
    const next = optionRows.map(row => (row.id === optionId ? { ...row, value } : row));
    applyOptionRows(next);
  };

  const addOption = () => {
    applyOptionRows([...optionRows, { id: createOptionId(), value: '' }]);
  };

  const removeOption = optionId => {
    applyOptionRows(optionRows.filter(row => row.id !== optionId));
  };

  const handleSave = () => {
    // Basic validation
    if (!editedQuestion.label || editedQuestion.label.trim() === '') {
      alert('Question label is required');
      return;
    }

    if (
      ['dropdown', 'radio', 'checkbox'].includes(editedQuestion.type) &&
      (!editedQuestion.options || editedQuestion.options.length === 0)
    ) {
      alert('This question type requires at least one option');
      return;
    }

    onSave({
      ...editedQuestion,
      required: Boolean(editedQuestion.required),
      isRequired: Boolean(editedQuestion.required),
      options: optionRows.map(row => row.value),
    });
  };

  return (
    <div className={`${styles.questionEditModalOverlay} ${darkMode ? styles.darkMode : ''}`}>
      <div className={`${styles.questionEditModal} ${darkMode ? styles.darkMode : ''}`}>
        <h3>Edit Question</h3>
        <div className={`${styles.editForm}`}>
          <div className={`${styles.formGroup}`}>
            <label htmlFor="label">Question Label:</label>
            <input
              type="text"
              id="label"
              name="label"
              value={editedQuestion.label || ''}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={`${styles.formGroup}`}>
            <label htmlFor="type">Input Type:</label>
            <select
              id="type"
              name="type"
              value={editedQuestion.type || 'textbox'}
              onChange={handleInputChange}
            >
              <option value="textbox">Text</option>
              <option value="email">Email</option>
              <option value="textarea">Text Area</option>
              <option value="date">Date</option>
              <option value="dropdown">Dropdown</option>
              <option value="radio">Radio Buttons</option>
              <option value="checkbox">Checkboxes</option>
            </select>
          </div>

          <div className={`${styles.formGroup}`}>
            <label htmlFor="placeholder">Placeholder:</label>
            <input
              type="text"
              id="placeholder"
              name="placeholder"
              value={editedQuestion.placeholder || ''}
              onChange={handleInputChange}
            />
          </div>

          <div className={`${styles.formGroup}`}>
            <label>
              <input
                type="checkbox"
                name="required"
                checked={editedQuestion.required || false}
                onChange={e =>
                  setEditedQuestion({
                    ...editedQuestion,
                    required: e.target.checked,
                  })
                }
              />
              Required
            </label>
          </div>

          {/* Options for dropdown, radio, and checkbox types */}
          {['dropdown', 'radio', 'checkbox'].includes(editedQuestion.type) && (
            <div className={styles.optionsGroup}>
              <p className={styles.optionsLabel}>Options:</p>
              {optionRows.map((row, index) => (
                <div key={row.id} className={styles.optionRow}>
                  <input
                    type="text"
                    value={row.value}
                    onChange={e => handleOptionsChange(row.id, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(row.id)}
                    className={`${styles.removeOptionButton}`}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button type="button" onClick={addOption} className={`${styles.addOptionButton}`}>
                Add Option
              </button>
            </div>
          )}

          <div className={styles.modalButtons}>
            <button type="button" onClick={handleSave} className={styles.saveButton}>
              Save Changes
            </button>
            <button type="button" onClick={onCancel} className={styles.cancelButton}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

QuestionEditModal.propTypes = {
  question: PropTypes.shape({
    label: PropTypes.string,
    type: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.string),
    required: PropTypes.bool,
    placeholder: PropTypes.string,
  }).isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  darkMode: PropTypes.bool,
};

export default QuestionEditModal;
