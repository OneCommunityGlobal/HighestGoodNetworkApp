import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createBMProject,
  fetchBMProjects,
  updateBMProject,
} from '../../../actions/bmdashboard/projectActions';
import styles from './ProjectManagementForm.module.css';

const EMPTY_FORM = {
  name: '',
  address: '',
  city: '',
  country: '',
  latitude: '',
  longitude: '',
  status: 'active',
  startDate: '',
  endDate: '',
};

export const toDateInput = value => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
};

const projectToForm = project =>
  project
    ? {
        name: project.name || '',
        address: project.address || '',
        city: project.city || '',
        country: project.country || '',
        latitude: project.latitude ?? '',
        longitude: project.longitude ?? '',
        status: project.status || 'active',
        startDate: toDateInput(project.startDate),
        endDate: toDateInput(project.endDate),
      }
    : EMPTY_FORM;

export function validateProjectForm(form) {
  const errors = {};
  const latitude = Number(form.latitude);
  const longitude = Number(form.longitude);

  if (!form.name.trim()) errors.name = 'Project name is required.';
  if (!form.address.trim() && !form.city.trim()) errors.location = 'Enter an address or city.';
  if (!form.country.trim()) errors.country = 'Country is required.';
  if (!['active', 'delayed', 'completed'].includes(form.status)) {
    errors.status = 'Choose Active, Delayed, or Completed.';
  }
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    errors.latitude = 'Latitude must be between -90 and 90.';
  }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    errors.longitude = 'Longitude must be between -180 and 180.';
  }
  if (!form.startDate) errors.startDate = 'Start date is required.';
  if (!form.endDate) errors.endDate = 'Planned end date is required.';
  if (form.startDate && form.endDate && form.endDate < form.startDate) {
    errors.endDate = 'Planned end date cannot be before the start date.';
  }

  return errors;
}

function ProjectManagementForm({ projectToEdit, onClose }) {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme?.darkMode || false);
  const role = useSelector(state => state.auth?.user?.role);
  const canManageProjects = role === 'Owner' || role === 'Administrator';
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (projectToEdit) {
      setForm(projectToForm(projectToEdit));
      setErrors({});
      setSaveError('');
      setIsOpen(true);
    }
  }, [projectToEdit]);

  if (!canManageProjects) return null;

  const isEditing = Boolean(projectToEdit);
  const updateField = event => {
    const { name, value } = event.target;
    setForm(previous => ({ ...previous, [name]: value }));
    setErrors(previous => ({
      ...previous,
      [name]: '',
      ...(name === 'city' || name === 'address' ? { location: '' } : {}),
    }));
  };

  const closeForm = () => {
    setIsOpen(false);
    setForm(EMPTY_FORM);
    setErrors({});
    setSaveError('');
    onClose?.();
  };

  const submit = async event => {
    event.preventDefault();
    const validationErrors = validateProjectForm(form);
    setErrors(validationErrors);
    setSaveError('');
    if (Object.keys(validationErrors).length) return;

    setSaving(true);
    try {
      const payload = {
        ...form,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
      };
      if (isEditing) {
        await dispatch(updateBMProject(projectToEdit._id, payload));
      } else {
        await dispatch(createBMProject(payload));
      }
      await dispatch(fetchBMProjects());
      closeForm();
    } catch (error) {
      setSaveError(error.response?.data?.message || 'Unable to save this project.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section
      id="construction-project-management-form"
      className={`${styles.wrapper} ${darkMode ? styles.dark : ''}`}
    >
      {!isOpen && (
        <button type="button" className={styles.primaryButton} onClick={() => setIsOpen(true)}>
          Create Construction Project
        </button>
      )}

      {isOpen && (
        <form className={styles.form} onSubmit={submit} noValidate>
          <div className={styles.headingRow}>
            <h2>{isEditing ? 'Edit Construction Project' : 'Create Construction Project'}</h2>
            <button
              type="button"
              className={styles.closeButton}
              onClick={closeForm}
              aria-label="Close project form"
            >
              ×
            </button>
          </div>
          <p className={styles.helpText}>
            Enter coordinates manually; no external geocoding service is used.
          </p>

          <div className={styles.grid}>
            <label>
              Name
              <input
                name="name"
                value={form.name}
                onChange={updateField}
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name && <span className={styles.error}>{errors.name}</span>}
            </label>
            <label>
              Address
              <input
                name="address"
                value={form.address}
                onChange={updateField}
                aria-invalid={Boolean(errors.location)}
              />
            </label>
            <label>
              City
              <input
                name="city"
                value={form.city}
                onChange={updateField}
                aria-invalid={Boolean(errors.location)}
              />
              {errors.location && <span className={styles.error}>{errors.location}</span>}
            </label>
            <label>
              Country
              <input
                name="country"
                value={form.country}
                onChange={updateField}
                aria-invalid={Boolean(errors.country)}
              />
              {errors.country && <span className={styles.error}>{errors.country}</span>}
            </label>
            <label>
              Latitude
              <input
                name="latitude"
                type="number"
                step="any"
                value={form.latitude}
                onChange={updateField}
                aria-invalid={Boolean(errors.latitude)}
              />
              {errors.latitude && <span className={styles.error}>{errors.latitude}</span>}
            </label>
            <label>
              Longitude
              <input
                name="longitude"
                type="number"
                step="any"
                value={form.longitude}
                onChange={updateField}
                aria-invalid={Boolean(errors.longitude)}
              />
              {errors.longitude && <span className={styles.error}>{errors.longitude}</span>}
            </label>
            <label>
              Status
              <select name="status" value={form.status} onChange={updateField}>
                <option value="active">Active</option>
                <option value="delayed">Delayed</option>
                <option value="completed">Completed</option>
              </select>
              {errors.status && <span className={styles.error}>{errors.status}</span>}
            </label>
            <label>
              Start date
              <input
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={updateField}
                aria-invalid={Boolean(errors.startDate)}
              />
              {errors.startDate && <span className={styles.error}>{errors.startDate}</span>}
            </label>
            <label>
              Planned end date
              <input
                name="endDate"
                type="date"
                value={form.endDate}
                onChange={updateField}
                aria-invalid={Boolean(errors.endDate)}
              />
              {errors.endDate && <span className={styles.error}>{errors.endDate}</span>}
            </label>
          </div>

          {saveError && (
            <div className={styles.error} role="alert">
              {saveError}
            </div>
          )}
          <div className={styles.actions}>
            <button type="button" className={styles.secondaryButton} onClick={closeForm}>
              Cancel
            </button>
            <button type="submit" className={styles.primaryButton} disabled={saving}>
              {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Create project'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

ProjectManagementForm.defaultProps = { projectToEdit: null, onClose: undefined };

export default ProjectManagementForm;
