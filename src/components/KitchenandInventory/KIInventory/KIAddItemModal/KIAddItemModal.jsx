import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import classnames from 'classnames';
import styles from './KIAddItem.module.css';

const getInitialFormData = () => ({
  name: '',
  type: '',
  unit: '',
  location: '',
  presentQuantity: '',
  storedQuantity: '',
  reorderAt: '',
  monthlyUsage: '',
  onsite: false,
  expiryDate: '',
  lastHarvestDate: '',
  nextHarvestDate: '',
  nextHarvestQuantity: '',
});

const requiredTextFields = ['name', 'type', 'unit', 'location'];
const requiredNumericFields = ['presentQuantity', 'storedQuantity', 'reorderAt', 'monthlyUsage'];
const optionalNumericFields = ['nextHarvestQuantity'];
const requiredDateFields = ['expiryDate'];

const fieldLabels = {
  name: 'Item name',
  type: 'Type',
  unit: 'Unit',
  location: 'Location',
  presentQuantity: 'Current stock',
  storedQuantity: 'Stored quantity',
  reorderAt: 'Reorder threshold',
  monthlyUsage: 'Monthly usage',
  nextHarvestQuantity: 'Next harvest quantity',
  expiryDate: 'Expiry date',
  lastHarvestDate: 'Last harvest date',
  nextHarvestDate: 'Next harvest date',
};

const toNumber = value => Number(value);

const getTodayDateValue = () => {
  const today = new Date();
  const timezoneOffset = today.getTimezoneOffset() * 60000;
  return new Date(today.getTime() - timezoneOffset).toISOString().slice(0, 10);
};

function validateForm(formData) {
  const errors = {};
  const todayDateValue = getTodayDateValue();

  requiredTextFields.forEach(field => {
    if (!formData[field].trim()) {
      errors[field] = `${fieldLabels[field]} is required.`;
    }
  });

  requiredNumericFields.forEach(field => {
    const numericValue = toNumber(formData[field]);
    if (formData[field] === '' || !Number.isFinite(numericValue) || numericValue < 0) {
      errors[field] = `${fieldLabels[field]} must be a non-negative number.`;
    }
  });

  optionalNumericFields.forEach(field => {
    if (formData[field] === '') {
      return;
    }

    const numericValue = toNumber(formData[field]);
    if (!Number.isFinite(numericValue) || numericValue < 0) {
      errors[field] = `${fieldLabels[field]} must be a non-negative number.`;
    }
  });

  requiredDateFields.forEach(field => {
    if (!formData[field]) {
      errors[field] = `${fieldLabels[field]} is required.`;
    }
  });

  if (formData.expiryDate && formData.expiryDate < todayDateValue) {
    errors.expiryDate = 'Expiry date must be today or a future date.';
  }

  if (formData.lastHarvestDate && formData.lastHarvestDate > todayDateValue) {
    errors.lastHarvestDate = 'Last harvest date cannot be in the future.';
  }

  if (formData.nextHarvestDate && formData.nextHarvestDate < todayDateValue) {
    errors.nextHarvestDate = 'Next harvest date must be today or a future date.';
  }

  const presentQuantity = toNumber(formData.presentQuantity);
  const storedQuantity = toNumber(formData.storedQuantity);
  if (!errors.presentQuantity && !errors.storedQuantity && storedQuantity < presentQuantity) {
    errors.storedQuantity = 'Stored quantity must be greater than or equal to current stock.';
  }

  return errors;
}

function buildPayload(formData, categoryValue) {
  const payload = {
    name: formData.name.trim(),
    type: formData.type.trim(),
    unit: formData.unit.trim(),
    location: formData.location.trim(),
    category: categoryValue,
    onsite: formData.onsite,
    presentQuantity: toNumber(formData.presentQuantity),
    storedQuantity: toNumber(formData.storedQuantity),
    reorderAt: toNumber(formData.reorderAt),
    monthlyUsage: toNumber(formData.monthlyUsage),
  };

  optionalNumericFields.forEach(field => {
    if (formData[field] !== '') {
      payload[field] = toNumber(formData[field]);
    }
  });

  ['expiryDate', 'lastHarvestDate', 'nextHarvestDate'].forEach(field => {
    if (formData[field]) {
      payload[field] = formData[field];
    }
  });

  return payload;
}

function KIAddItemModal({
  isOpen,
  onClose,
  onSubmit,
  categoryLabel,
  categoryValue,
  isSubmitting,
  submitError,
  darkMode,
}) {
  const [formData, setFormData] = useState(getInitialFormData);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
      setErrors({});
      setFormError('');
    }
  }, [isOpen, categoryValue]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleEscape = event => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleTextChange = event => {
    const { name, value } = event.target;
    setFormData(prevFormData => ({ ...prevFormData, [name]: value }));
    setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
  };

  const handleCheckboxChange = event => {
    const { name, checked } = event.target;
    setFormData(prevFormData => ({ ...prevFormData, [name]: checked }));
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setFormError('');

    const nextErrors = validateForm(formData);
    setErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    try {
      await onSubmit(buildPayload(formData, categoryValue));
      setFormData(getInitialFormData());
      onClose();
    } catch (err) {
      setFormError(err.message || 'Failed to add inventory item.');
    }
  };

  if (!isOpen) {
    return null;
  }

  const modalClassName = classnames(styles.addItemModal, darkMode ? 'text-light dark-mode' : '');
  const modalPanelClassName = classnames(darkMode ? 'bg-yinmn-blue' : '', styles.addItemModalPanel);
  const todayDateValue = getTodayDateValue();

  return (
    <div
      className={styles.addItemModalBackdrop}
      role="presentation"
      onMouseDown={event => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className={modalClassName}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ki-add-item-modal-title"
      >
        <div className={classnames(styles.addItemModalHeader, darkMode ? 'bg-space-cadet' : '')}>
          <h5 id="ki-add-item-modal-title">Add Inventory Item</h5>
          <button
            type="button"
            className={styles.addItemModalClose}
            onClick={onClose}
            aria-label="Close add item modal"
          >
            x
          </button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className={classnames(styles.addItemModalBody, modalPanelClassName)}>
            <div className={styles.addItemCategory}>
              <span>Category</span>
              <strong>{categoryLabel}</strong>
            </div>

            {(formError || submitError) && (
              <div className={styles.addItemError} role="alert">
                {formError || submitError}
              </div>
            )}

            <div className={styles.addItemFormGrid}>
              <div className={styles.addItemFormGroup}>
                <label htmlFor="ki-add-item-name">Item name</label>
                <input
                  id="ki-add-item-name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleTextChange}
                  aria-invalid={Boolean(errors.name)}
                />
                {errors.name && <span className={styles.addItemFieldError}>{errors.name}</span>}
              </div>

              <div className={styles.addItemFormGroup}>
                <label htmlFor="ki-add-item-type">Type</label>
                <input
                  id="ki-add-item-type"
                  name="type"
                  type="text"
                  value={formData.type}
                  onChange={handleTextChange}
                  aria-invalid={Boolean(errors.type)}
                />
                {errors.type && <span className={styles.addItemFieldError}>{errors.type}</span>}
              </div>

              <div className={styles.addItemFormGroup}>
                <label htmlFor="ki-add-item-unit">Unit</label>
                <input
                  id="ki-add-item-unit"
                  name="unit"
                  type="text"
                  value={formData.unit}
                  onChange={handleTextChange}
                  aria-invalid={Boolean(errors.unit)}
                />
                {errors.unit && <span className={styles.addItemFieldError}>{errors.unit}</span>}
              </div>

              <div className={styles.addItemFormGroup}>
                <label htmlFor="ki-add-item-location">Location</label>
                <input
                  id="ki-add-item-location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleTextChange}
                  aria-invalid={Boolean(errors.location)}
                />
                {errors.location && (
                  <span className={styles.addItemFieldError}>{errors.location}</span>
                )}
              </div>

              <div className={styles.addItemFormGroup}>
                <label htmlFor="ki-add-item-present-quantity">Current stock</label>
                <input
                  id="ki-add-item-present-quantity"
                  name="presentQuantity"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.presentQuantity}
                  onChange={handleTextChange}
                  aria-invalid={Boolean(errors.presentQuantity)}
                />
                {errors.presentQuantity && (
                  <span className={styles.addItemFieldError}>{errors.presentQuantity}</span>
                )}
              </div>

              <div className={styles.addItemFormGroup}>
                <label htmlFor="ki-add-item-stored-quantity">Stored quantity</label>
                <input
                  id="ki-add-item-stored-quantity"
                  name="storedQuantity"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.storedQuantity}
                  onChange={handleTextChange}
                  aria-invalid={Boolean(errors.storedQuantity)}
                />
                {errors.storedQuantity && (
                  <span className={styles.addItemFieldError}>{errors.storedQuantity}</span>
                )}
              </div>

              <div className={styles.addItemFormGroup}>
                <label htmlFor="ki-add-item-reorder-at">Reorder threshold</label>
                <input
                  id="ki-add-item-reorder-at"
                  name="reorderAt"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.reorderAt}
                  onChange={handleTextChange}
                  aria-invalid={Boolean(errors.reorderAt)}
                />
                {errors.reorderAt && (
                  <span className={styles.addItemFieldError}>{errors.reorderAt}</span>
                )}
              </div>

              <div className={styles.addItemFormGroup}>
                <label htmlFor="ki-add-item-monthly-usage">Monthly usage</label>
                <input
                  id="ki-add-item-monthly-usage"
                  name="monthlyUsage"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.monthlyUsage}
                  onChange={handleTextChange}
                  aria-invalid={Boolean(errors.monthlyUsage)}
                />
                {errors.monthlyUsage && (
                  <span className={styles.addItemFieldError}>{errors.monthlyUsage}</span>
                )}
              </div>

              <div className={styles.addItemFormGroup}>
                <label htmlFor="ki-add-item-expiry-date">Expiry date</label>
                <input
                  id="ki-add-item-expiry-date"
                  name="expiryDate"
                  type="date"
                  min={todayDateValue}
                  value={formData.expiryDate}
                  onChange={handleTextChange}
                  aria-invalid={Boolean(errors.expiryDate)}
                />
                {errors.expiryDate && (
                  <span className={styles.addItemFieldError}>{errors.expiryDate}</span>
                )}
              </div>

              <div className={styles.addItemFormGroup}>
                <label htmlFor="ki-add-item-last-harvest-date">Last harvest date</label>
                <input
                  id="ki-add-item-last-harvest-date"
                  name="lastHarvestDate"
                  type="date"
                  max={todayDateValue}
                  value={formData.lastHarvestDate}
                  onChange={handleTextChange}
                  aria-invalid={Boolean(errors.lastHarvestDate)}
                />
                {errors.lastHarvestDate && (
                  <span className={styles.addItemFieldError}>{errors.lastHarvestDate}</span>
                )}
              </div>

              <div className={styles.addItemFormGroup}>
                <label htmlFor="ki-add-item-next-harvest-date">Next harvest date</label>
                <input
                  id="ki-add-item-next-harvest-date"
                  name="nextHarvestDate"
                  type="date"
                  min={todayDateValue}
                  value={formData.nextHarvestDate}
                  onChange={handleTextChange}
                  aria-invalid={Boolean(errors.nextHarvestDate)}
                />
                {errors.nextHarvestDate && (
                  <span className={styles.addItemFieldError}>{errors.nextHarvestDate}</span>
                )}
              </div>

              <div className={styles.addItemFormGroup}>
                <label htmlFor="ki-add-item-next-harvest-quantity">Next harvest quantity</label>
                <input
                  id="ki-add-item-next-harvest-quantity"
                  name="nextHarvestQuantity"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.nextHarvestQuantity}
                  onChange={handleTextChange}
                  aria-invalid={Boolean(errors.nextHarvestQuantity)}
                />
                {errors.nextHarvestQuantity && (
                  <span className={styles.addItemFieldError}>{errors.nextHarvestQuantity}</span>
                )}
              </div>
            </div>

            <label className={styles.addItemCheckbox} htmlFor="ki-add-item-onsite">
              <input
                id="ki-add-item-onsite"
                name="onsite"
                type="checkbox"
                checked={formData.onsite}
                onChange={handleCheckboxChange}
              />
              Onsite grown
            </label>
          </div>
          <div className={classnames(styles.addItemModalFooter, modalPanelClassName)}>
            <Button type="button" color="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" color="success" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Item'}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

KIAddItemModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  categoryLabel: PropTypes.string.isRequired,
  categoryValue: PropTypes.string.isRequired,
  isSubmitting: PropTypes.bool,
  submitError: PropTypes.string,
  darkMode: PropTypes.bool,
};

KIAddItemModal.defaultProps = {
  isSubmitting: false,
  submitError: '',
  darkMode: false,
};

export default KIAddItemModal;
