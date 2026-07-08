import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import classnames from 'classnames';
import styles from './KIUpdateItem.module.css';

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

const toDateInputValue = value => {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return value.slice(0, 10);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
};

const toTextValue = value => {
  if (value === undefined || value === null) {
    return '';
  }

  return String(value);
};

const getInitialFormData = item => ({
  name: toTextValue(item?.name),
  type: toTextValue(item?.type),
  unit: toTextValue(item?.unit),
  location: toTextValue(item?.location),
  presentQuantity: toTextValue(item?.presentQuantity),
  storedQuantity: toTextValue(item?.storedQuantity),
  reorderAt: toTextValue(item?.reorderAt),
  monthlyUsage: toTextValue(item?.monthlyUsage),
  onsite: Boolean(item?.onsite),
  expiryDate: toDateInputValue(item?.expiryDate),
  lastHarvestDate: toDateInputValue(item?.lastHarvestDate),
  nextHarvestDate: toDateInputValue(item?.nextHarvestDate),
  nextHarvestQuantity: toTextValue(item?.nextHarvestQuantity),
});

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
    expiryDate: formData.expiryDate,
    lastHarvestDate: formData.lastHarvestDate || null,
    nextHarvestDate: formData.nextHarvestDate || null,
    nextHarvestQuantity:
      formData.nextHarvestQuantity === '' ? null : toNumber(formData.nextHarvestQuantity),
  };

  return payload;
}

function KIUpdateItemModal({
  isOpen,
  item,
  onClose,
  onSubmit,
  onDelete,
  categoryLabel,
  categoryValue,
  isSubmitting,
  isDeleting,
  submitError,
  deleteError,
  darkMode,
}) {
  const [formData, setFormData] = useState(() => getInitialFormData(item));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData(item));
      setErrors({});
      setFormError('');
      setShowDeleteConfirm(false);
    }
  }, [isOpen, item]);

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

  if (!isOpen || !item) {
    return null;
  }

  const itemId = item._id || item.id;
  const isBusy = isSubmitting || isDeleting;
  const modalClassName = classnames(styles.updateItemModal, darkMode ? 'text-light dark-mode' : '');
  const modalPanelClassName = classnames(
    darkMode ? 'bg-yinmn-blue' : '',
    styles.updateItemModalPanel,
  );
  const todayDateValue = getTodayDateValue();

  const handleTextChange = event => {
    const { name, value } = event.target;
    setFormData(prevFormData => ({ ...prevFormData, [name]: value }));
    setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
    setFormError('');
  };

  const handleCheckboxChange = event => {
    const { name, checked } = event.target;
    setFormData(prevFormData => ({ ...prevFormData, [name]: checked }));
    setFormError('');
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
      await onSubmit(itemId, buildPayload(formData, categoryValue));
      onClose();
    } catch (err) {
      setFormError(err.message || 'Failed to update inventory item.');
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      setFormError('');
      return;
    }

    try {
      await onDelete(itemId);
      onClose();
    } catch (err) {
      setFormError(err.message || 'Failed to delete inventory item.');
    }
  };

  return (
    <div
      className={styles.updateItemModalBackdrop}
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
        aria-labelledby="ki-update-item-modal-title"
      >
        <div className={classnames(styles.updateItemModalHeader, darkMode ? 'bg-space-cadet' : '')}>
          <h5 id="ki-update-item-modal-title">Update Inventory Item</h5>
          <button
            type="button"
            className={styles.updateItemModalClose}
            onClick={onClose}
            aria-label="Close update item modal"
          >
            x
          </button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className={classnames(styles.updateItemModalBody, modalPanelClassName)}>
            <div className={styles.updateItemCategory}>
              <span>Category</span>
              <strong>{categoryLabel}</strong>
            </div>

            {(formError || submitError || deleteError) && (
              <div className={styles.updateItemError} role="alert">
                {formError || submitError || deleteError}
              </div>
            )}

            <div className={styles.updateItemFormGrid}>
              <div className={styles.updateItemFormGroup}>
                <label htmlFor="ki-update-item-name">Item name</label>
                <input
                  id="ki-update-item-name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleTextChange}
                  aria-invalid={Boolean(errors.name)}
                />
                {errors.name && <span className={styles.updateItemFieldError}>{errors.name}</span>}
              </div>

              <div className={styles.updateItemFormGroup}>
                <label htmlFor="ki-update-item-type">Type</label>
                <input
                  id="ki-update-item-type"
                  name="type"
                  type="text"
                  value={formData.type}
                  onChange={handleTextChange}
                  aria-invalid={Boolean(errors.type)}
                />
                {errors.type && <span className={styles.updateItemFieldError}>{errors.type}</span>}
              </div>

              <div className={styles.updateItemFormGroup}>
                <label htmlFor="ki-update-item-unit">Unit</label>
                <input
                  id="ki-update-item-unit"
                  name="unit"
                  type="text"
                  value={formData.unit}
                  onChange={handleTextChange}
                  aria-invalid={Boolean(errors.unit)}
                />
                {errors.unit && <span className={styles.updateItemFieldError}>{errors.unit}</span>}
              </div>

              <div className={styles.updateItemFormGroup}>
                <label htmlFor="ki-update-item-location">Location</label>
                <input
                  id="ki-update-item-location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleTextChange}
                  aria-invalid={Boolean(errors.location)}
                />
                {errors.location && (
                  <span className={styles.updateItemFieldError}>{errors.location}</span>
                )}
              </div>

              <div className={styles.updateItemFormGroup}>
                <label htmlFor="ki-update-item-present-quantity">Current stock</label>
                <input
                  id="ki-update-item-present-quantity"
                  name="presentQuantity"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.presentQuantity}
                  onChange={handleTextChange}
                  aria-invalid={Boolean(errors.presentQuantity)}
                />
                {errors.presentQuantity && (
                  <span className={styles.updateItemFieldError}>{errors.presentQuantity}</span>
                )}
              </div>

              <div className={styles.updateItemFormGroup}>
                <label htmlFor="ki-update-item-stored-quantity">Stored quantity</label>
                <input
                  id="ki-update-item-stored-quantity"
                  name="storedQuantity"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.storedQuantity}
                  onChange={handleTextChange}
                  aria-invalid={Boolean(errors.storedQuantity)}
                />
                {errors.storedQuantity && (
                  <span className={styles.updateItemFieldError}>{errors.storedQuantity}</span>
                )}
              </div>

              <div className={styles.updateItemFormGroup}>
                <label htmlFor="ki-update-item-reorder-at">Reorder threshold</label>
                <input
                  id="ki-update-item-reorder-at"
                  name="reorderAt"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.reorderAt}
                  onChange={handleTextChange}
                  aria-invalid={Boolean(errors.reorderAt)}
                />
                {errors.reorderAt && (
                  <span className={styles.updateItemFieldError}>{errors.reorderAt}</span>
                )}
              </div>

              <div className={styles.updateItemFormGroup}>
                <label htmlFor="ki-update-item-monthly-usage">Monthly usage</label>
                <input
                  id="ki-update-item-monthly-usage"
                  name="monthlyUsage"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.monthlyUsage}
                  onChange={handleTextChange}
                  aria-invalid={Boolean(errors.monthlyUsage)}
                />
                {errors.monthlyUsage && (
                  <span className={styles.updateItemFieldError}>{errors.monthlyUsage}</span>
                )}
              </div>

              <div className={styles.updateItemFormGroup}>
                <label htmlFor="ki-update-item-expiry-date">Expiry date</label>
                <input
                  id="ki-update-item-expiry-date"
                  name="expiryDate"
                  type="date"
                  min={todayDateValue}
                  value={formData.expiryDate}
                  onChange={handleTextChange}
                  aria-invalid={Boolean(errors.expiryDate)}
                />
                {errors.expiryDate && (
                  <span className={styles.updateItemFieldError}>{errors.expiryDate}</span>
                )}
              </div>

              <div className={styles.updateItemFormGroup}>
                <label htmlFor="ki-update-item-last-harvest-date">Last harvest date</label>
                <input
                  id="ki-update-item-last-harvest-date"
                  name="lastHarvestDate"
                  type="date"
                  max={todayDateValue}
                  value={formData.lastHarvestDate}
                  onChange={handleTextChange}
                  aria-invalid={Boolean(errors.lastHarvestDate)}
                />
                {errors.lastHarvestDate && (
                  <span className={styles.updateItemFieldError}>{errors.lastHarvestDate}</span>
                )}
              </div>

              <div className={styles.updateItemFormGroup}>
                <label htmlFor="ki-update-item-next-harvest-date">Next harvest date</label>
                <input
                  id="ki-update-item-next-harvest-date"
                  name="nextHarvestDate"
                  type="date"
                  min={todayDateValue}
                  value={formData.nextHarvestDate}
                  onChange={handleTextChange}
                  aria-invalid={Boolean(errors.nextHarvestDate)}
                />
                {errors.nextHarvestDate && (
                  <span className={styles.updateItemFieldError}>{errors.nextHarvestDate}</span>
                )}
              </div>

              <div className={styles.updateItemFormGroup}>
                <label htmlFor="ki-update-item-next-harvest-quantity">Next harvest quantity</label>
                <input
                  id="ki-update-item-next-harvest-quantity"
                  name="nextHarvestQuantity"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.nextHarvestQuantity}
                  onChange={handleTextChange}
                  aria-invalid={Boolean(errors.nextHarvestQuantity)}
                />
                {errors.nextHarvestQuantity && (
                  <span className={styles.updateItemFieldError}>{errors.nextHarvestQuantity}</span>
                )}
              </div>
            </div>

            <label className={styles.updateItemCheckbox} htmlFor="ki-update-item-onsite">
              <input
                id="ki-update-item-onsite"
                name="onsite"
                type="checkbox"
                checked={formData.onsite}
                onChange={handleCheckboxChange}
              />
              Onsite grown
            </label>

            {showDeleteConfirm && (
              <div className={styles.updateItemDeletePrompt}>
                <p>Delete {item.name}? This cannot be undone.</p>
                <div className={styles.updateItemDeleteActions}>
                  <Button type="button" color="danger" onClick={handleDelete} disabled={isBusy}>
                    {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                  </Button>
                  <Button
                    type="button"
                    color="secondary"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isBusy}
                  >
                    Keep Item
                  </Button>
                </div>
              </div>
            )}
          </div>
          <div className={classnames(styles.updateItemModalFooter, modalPanelClassName)}>
            <Button
              type="button"
              color="danger"
              outline={!showDeleteConfirm}
              onClick={handleDelete}
              disabled={isBusy || showDeleteConfirm}
            >
              Delete Item
            </Button>
            <div className={styles.updateItemFooterActions}>
              <Button type="button" color="secondary" onClick={onClose} disabled={isBusy}>
                Cancel
              </Button>
              <Button type="submit" color="success" disabled={isBusy}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}

const itemShape = PropTypes.shape({
  _id: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
  type: PropTypes.string,
  unit: PropTypes.string,
  location: PropTypes.string,
  category: PropTypes.string,
  presentQuantity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  storedQuantity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  reorderAt: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  monthlyUsage: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onsite: PropTypes.bool,
  expiryDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  lastHarvestDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  nextHarvestDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  nextHarvestQuantity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
});

KIUpdateItemModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  item: itemShape,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  categoryLabel: PropTypes.string.isRequired,
  categoryValue: PropTypes.string.isRequired,
  isSubmitting: PropTypes.bool,
  isDeleting: PropTypes.bool,
  submitError: PropTypes.string,
  deleteError: PropTypes.string,
  darkMode: PropTypes.bool,
};

KIUpdateItemModal.defaultProps = {
  item: null,
  isSubmitting: false,
  isDeleting: false,
  submitError: '',
  deleteError: '',
  darkMode: false,
};

export default KIUpdateItemModal;
