import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import classnames from 'classnames';
import {
  buildInventoryItemBasePayload,
  getTodayDateValue,
  toNumber,
  validateInventoryItemForm,
} from '../KIInventoryFormUtils';
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

function buildPayload(formData, categoryValue) {
  const payload = buildInventoryItemBasePayload(formData, categoryValue);

  if (formData.nextHarvestQuantity !== '') {
    payload.nextHarvestQuantity = toNumber(formData.nextHarvestQuantity);
  }

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
  const modalRef = useRef(null);
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
    const handleBackdropMouseDown = event => {
      if (event.target === modalRef.current) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleBackdropMouseDown);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleBackdropMouseDown);
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

    const nextErrors = validateInventoryItemForm(formData);
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
    <dialog
      ref={modalRef}
      open
      className={styles.addItemModalBackdrop}
      aria-modal="true"
      aria-labelledby="ki-add-item-modal-title"
    >
      <section className={modalClassName}>
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
    </dialog>
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
