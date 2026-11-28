import { useRef, useState } from 'react';
import axios from 'axios';
import { useHistory, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styles from './InjuryEntryForm.module.css';
import { ENDPOINTS } from '../../../utils/URL';

const SEVERITIES = ['Minor', 'Major', 'Critical'];
const TEXT_NAME_PATTERN = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;
const OBJECT_ID_PATTERN = /^[a-fA-F0-9]{24}$/;

const MAX_LENGTHS = {
  injuryType: 100,
  workerCategory: 100,
  description: 500,
};

const getToday = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const isValidDate = value => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

const validateName = (value, label, maxLength) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return `${label} is required.`;
  }

  if (trimmed.length > maxLength) {
    return `${label} must be ${maxLength} characters or fewer.`;
  }

  if (!TEXT_NAME_PATTERN.test(trimmed)) {
    return `${label} must contain letters only. Spaces, hyphens, and apostrophes are allowed.`;
  }

  return '';
};

const validateDescription = value => {
  const trimmed = value.trim();

  if (!trimmed) {
    return 'Incident description is required.';
  }

  if (trimmed.length > MAX_LENGTHS.description) {
    return 'Description must be 500 characters or fewer.';
  }

  if (!/[A-Za-z]{2,}/.test(trimmed)) {
    return 'Description must contain meaningful words.';
  }

  if (trimmed.length < 10) {
    return 'Please provide at least 10 characters describing the incident.';
  }

  if (/[<>]/.test(trimmed)) {
    return 'Description cannot contain angle brackets.';
  }

  return '';
};

export const validateInjuryField = (name, value, projectId) => {
  switch (name) {
    case 'projectId':
      if (!projectId) {
        return 'A project is required.';
      }
      if (!OBJECT_ID_PATTERN.test(projectId)) {
        return 'Invalid project identifier.';
      }
      return '';

    case 'date':
      if (!value) {
        return 'Incident date is required.';
      }
      if (!isValidDate(value)) {
        return 'Enter a valid incident date.';
      }
      if (value > getToday()) {
        return 'Incident date cannot be in the future.';
      }
      return '';

    case 'severity':
      if (!SEVERITIES.includes(value)) {
        return 'Select a valid injury severity.';
      }
      return '';

    case 'injuryType':
      return validateName(value, 'Injury type', MAX_LENGTHS.injuryType);

    case 'workerCategory':
      return validateName(value, 'Worker category', MAX_LENGTHS.workerCategory);

    case 'description':
      return validateDescription(value);

    default:
      return '';
  }
};

export const validateInjuryForm = (values, projectId) => {
  const errors = {};

  ['projectId', 'date', 'severity', 'injuryType', 'workerCategory', 'description'].forEach(
    field => {
      const error = validateInjuryField(field, values[field] || '', projectId);

      if (error) {
        errors[field] = error;
      }
    },
  );

  return errors;
};

const INITIAL_TOUCHED = {
  projectId: true,
  date: true,
  severity: true,
  injuryType: true,
  workerCategory: true,
  description: true,
};

const createInitialFormData = () => ({
  date: getToday(),
  severity: '',
  injuryType: '',
  workerCategory: '',
  description: '',
});

function InjuryEntryForm() {
  const { projectId } = useParams();
  const history = useHistory();
  const darkMode = useSelector(state => state.theme.darkMode);

  const [formData, setFormData] = useState(createInitialFormData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [validationMessage, setValidationMessage] = useState('');
  const [validationSuccessful, setValidationSuccessful] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedInjuryId, setSavedInjuryId] = useState(null);

  // Prevent rapid double clicks before React updates the button state.
  const submissionInProgress = useRef(false);

  const isLocked = isSubmitting || Boolean(savedInjuryId);

  const handleChange = event => {
    if (isLocked) {
      return;
    }

    const { name, value } = event.target;

    setFormData(previous => ({
      ...previous,
      [name]: value,
    }));

    setValidationSuccessful(false);
    setValidationMessage('');

    if (touched[name]) {
      const error = validateInjuryField(name, value, projectId);

      setErrors(previous => ({
        ...previous,
        [name]: error,
      }));
    }
  };

  const handleBlur = event => {
    if (isLocked) {
      return;
    }

    const { name, value } = event.target;
    const error = validateInjuryField(name, value, projectId);

    setTouched(previous => ({
      ...previous,
      [name]: true,
    }));

    setErrors(previous => ({
      ...previous,
      [name]: error,
    }));
  };

  const handleSubmit = async event => {
    event.preventDefault();

    if (submissionInProgress.current || savedInjuryId) {
      return;
    }

    const validationErrors = validateInjuryForm(formData, projectId);

    setErrors(validationErrors);
    setTouched(INITIAL_TOUCHED);
    setValidationSuccessful(false);
    setValidationMessage('');

    if (Object.keys(validationErrors).length > 0) {
      setValidationMessage('Please correct the highlighted fields before proceeding.');
      return;
    }

    submissionInProgress.current = true;
    setIsSubmitting(true);

    try {
      const payload = {
        projectId,
        date: formData.date,
        severity: formData.severity,
        injuryType: formData.injuryType.trim(),
        workerCategory: formData.workerCategory.trim(),
        description: formData.description.trim(),
      };

      const response = await axios.post(ENDPOINTS.BM_INJURY_CREATE, payload);

      if (response.status !== 201 || !response.data?.injury?._id) {
        throw new Error('The server did not confirm that the injury was saved.');
      }

      setSavedInjuryId(response.data.injury._id);
      setValidationSuccessful(true);
      setValidationMessage(response.data.message || 'Injury incident saved successfully.');
    } catch (error) {
      const serverMessage = error.response?.data?.error || error.response?.data?.message;

      setValidationSuccessful(false);
      setValidationMessage(
        typeof serverMessage === 'string'
          ? serverMessage
          : error.message || 'Unable to save the injury incident.',
      );
    } finally {
      submissionInProgress.current = false;
      setIsSubmitting(false);
    }
  };

  const handleAddAnother = () => {
    if (isSubmitting) {
      return;
    }

    setFormData(createInitialFormData());
    setErrors({});
    setTouched({});
    setValidationMessage('');
    setValidationSuccessful(false);
    setSavedInjuryId(null);
  };

  const handleCancel = () => {
    history.push(projectId ? `/bmdashboard/projects/${projectId}` : '/bmdashboard/');
  };

  const renderError = (name, errorId) =>
    errors[name] ? (
      <span id={errorId} className={styles.error} role="alert">
        {errors[name]}
      </span>
    ) : null;

  return (
    <div className={`${styles.page} ${darkMode ? styles.dark : ''}`}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Injury Incident Entry</h2>
          <p>Record an injury incident for the selected project. All fields are required.</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label htmlFor="injury-project">Project</label>
            <input
              id="injury-project"
              name="projectId"
              type="text"
              value={projectId || ''}
              readOnly
              aria-invalid={Boolean(errors.projectId)}
              aria-describedby={errors.projectId ? 'injury-project-error' : undefined}
            />
            {renderError('projectId', 'injury-project-error')}
          </div>

          <div className={styles.field}>
            <label htmlFor="injury-date">Incident Date</label>
            <input
              id="injury-date"
              name="date"
              type="date"
              value={formData.date}
              max={getToday()}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLocked}
              aria-invalid={Boolean(errors.date)}
              aria-describedby={errors.date ? 'injury-date-error' : undefined}
            />
            {renderError('date', 'injury-date-error')}
          </div>

          <div className={styles.field}>
            <label htmlFor="injury-severity">Injury Severity</label>
            <select
              id="injury-severity"
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLocked}
              aria-invalid={Boolean(errors.severity)}
              aria-describedby={errors.severity ? 'injury-severity-error' : undefined}
            >
              <option value="">Select severity</option>
              {SEVERITIES.map(severity => (
                <option key={severity} value={severity}>
                  {severity}
                </option>
              ))}
            </select>
            {renderError('severity', 'injury-severity-error')}
          </div>

          <div className={styles.field}>
            <label htmlFor="injury-type">Injury Type</label>
            <input
              id="injury-type"
              name="injuryType"
              type="text"
              value={formData.injuryType}
              maxLength={MAX_LENGTHS.injuryType}
              autoComplete="off"
              placeholder="e.g., Cut, Burn, Sprain"
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLocked}
              aria-invalid={Boolean(errors.injuryType)}
              aria-describedby={errors.injuryType ? 'injury-type-error' : undefined}
            />
            {renderError('injuryType', 'injury-type-error')}
          </div>

          <div className={styles.field}>
            <label htmlFor="injury-worker-category">Worker Category</label>
            <input
              id="injury-worker-category"
              name="workerCategory"
              type="text"
              value={formData.workerCategory}
              maxLength={MAX_LENGTHS.workerCategory}
              autoComplete="off"
              placeholder="e.g., Electrical, Plumbing"
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLocked}
              aria-invalid={Boolean(errors.workerCategory)}
              aria-describedby={errors.workerCategory ? 'injury-worker-category-error' : undefined}
            />
            {renderError('workerCategory', 'injury-worker-category-error')}
          </div>

          <div className={styles.field}>
            <label htmlFor="injury-description">Incident Description</label>
            <textarea
              id="injury-description"
              name="description"
              value={formData.description}
              maxLength={MAX_LENGTHS.description}
              placeholder="Describe how the injury occurred..."
              rows={5}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLocked}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={
                errors.description ? 'injury-description-error' : 'injury-description-hint'
              }
            />
            <div className={styles.hint} id="injury-description-hint">
              Provide at least 10 characters describing the incident. {formData.description.length}/
              {MAX_LENGTHS.description}
            </div>
            {renderError('description', 'injury-description-error')}
          </div>

          {validationMessage && (
            <div
              className={validationSuccessful ? styles.successMessage : styles.errorMessage}
              role={validationSuccessful ? 'status' : 'alert'}
            >
              {validationMessage}
            </div>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              {savedInjuryId ? 'Back to Project' : 'Cancel'}
            </button>

            {savedInjuryId ? (
              <button type="button" className={styles.submitButton} onClick={handleAddAnother}>
                Add Another Incident
              </button>
            ) : (
              <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                {isSubmitting ? 'Saving Incident...' : 'Save Incident'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default InjuryEntryForm;
