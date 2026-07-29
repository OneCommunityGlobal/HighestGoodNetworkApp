import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import classnames from 'classnames';
import { getTodayDateValue, toNumber } from '../KIInventoryFormUtils';
import { inventoryItemShape } from '../KIInventoryPropTypes';
import styles from './KIReorderItem.module.css';

const getInitialFormData = () => ({
  addedQuantity: '',
  newExpiry: '',
});

const getTomorrowDateValue = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const timezoneOffset = tomorrow.getTimezoneOffset() * 60000;
  return new Date(tomorrow.getTime() - timezoneOffset).toISOString().slice(0, 10);
};

const hasExpired = expiryDate => {
  if (!expiryDate) {
    return false;
  }

  const parsedExpiryDate = new Date(expiryDate);
  return !Number.isNaN(parsedExpiryDate.getTime()) && parsedExpiryDate < new Date();
};

export const validateReorderForm = (formData, item) => {
  const errors = {};
  const addedQuantity = toNumber(formData.addedQuantity);

  if (formData.addedQuantity === '' || !Number.isFinite(addedQuantity) || addedQuantity <= 0) {
    errors.addedQuantity = 'Order quantity must be a number greater than zero.';
  }

  if (hasExpired(item?.expiryDate) && !formData.newExpiry) {
    errors.newExpiry = 'A new expiry date is required for expired stock.';
  } else if (formData.newExpiry && formData.newExpiry <= getTodayDateValue()) {
    errors.newExpiry = 'New expiry date must be a future date.';
  }

  return errors;
};

const buildReorderPayload = formData => {
  const payload = {
    addedQuantity: toNumber(formData.addedQuantity),
  };

  if (formData.newExpiry) {
    payload.newExpiry = formData.newExpiry;
  }

  return payload;
};

function KIReorderItemModal({
  isOpen,
  item,
  onClose,
  onSubmit,
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
  }, [isOpen, item]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleEscape = event => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !item) {
    return null;
  }

  const itemId = item._id || item.id;
  const itemIsExpired = hasExpired(item.expiryDate);
  const modalClassName = classnames(
    styles.reorderItemModal,
    darkMode ? 'text-light dark-mode' : '',
  );
  const modalPanelClassName = classnames(
    darkMode ? 'bg-yinmn-blue' : '',
    styles.reorderItemModalPanel,
  );

  const handleChange = event => {
    const { name, value } = event.target;
    setFormData(previousFormData => ({ ...previousFormData, [name]: value }));
    setErrors(previousErrors => ({ ...previousErrors, [name]: '' }));
    setFormError('');
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setFormError('');

    const nextErrors = validateReorderForm(formData, item);
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    try {
      await onSubmit(itemId, buildReorderPayload(formData));
      onClose();
    } catch (error) {
      setFormError(error.message || 'Failed to reorder inventory item.');
    }
  };

  return (
    <div
      className={styles.reorderItemModalBackdrop}
      role="presentation"
      onMouseDown={event => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <section
        className={modalClassName}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ki-reorder-item-modal-title"
        data-testid="reorder-item-modal"
      >
        <div
          className={classnames(styles.reorderItemModalHeader, darkMode ? 'bg-space-cadet' : '')}
        >
          <h5 id="ki-reorder-item-modal-title">Reorder Inventory Item</h5>
          <button
            type="button"
            className={styles.reorderItemModalClose}
            onClick={onClose}
            aria-label="Close reorder item modal"
            disabled={isSubmitting}
          >
            x
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className={classnames(styles.reorderItemModalBody, modalPanelClassName)}>
            <div className={styles.reorderItemSummary}>
              <div>
                <span>Item</span>
                <strong>{item.name}</strong>
              </div>
              <div>
                <span>Current stock</span>
                <strong>
                  {item.presentQuantity} {item.unit}
                </strong>
              </div>
              <div>
                <span>Reorder threshold</span>
                <strong>
                  {item.reorderAt} {item.unit}
                </strong>
              </div>
              <div>
                <span>Location</span>
                <strong>{item.location || 'Not specified'}</strong>
              </div>
            </div>

            {(formError || submitError) && (
              <div className={styles.reorderItemError} role="alert">
                {formError || submitError}
              </div>
            )}

            <div className={styles.reorderItemFormGrid}>
              <div className={styles.reorderItemFormGroup}>
                <label htmlFor="ki-reorder-item-quantity">Order quantity ({item.unit})</label>
                <input
                  id="ki-reorder-item-quantity"
                  name="addedQuantity"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.addedQuantity}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.addedQuantity)}
                />
                {errors.addedQuantity && (
                  <span className={styles.reorderItemFieldError}>{errors.addedQuantity}</span>
                )}
              </div>

              <div className={styles.reorderItemFormGroup}>
                <label htmlFor="ki-reorder-item-expiry">
                  New expiry date{itemIsExpired ? ' (required)' : ' (optional)'}
                </label>
                <input
                  id="ki-reorder-item-expiry"
                  name="newExpiry"
                  type="date"
                  min={getTomorrowDateValue()}
                  value={formData.newExpiry}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.newExpiry)}
                />
                {errors.newExpiry && (
                  <span className={styles.reorderItemFieldError}>{errors.newExpiry}</span>
                )}
              </div>
            </div>
          </div>

          <div className={classnames(styles.reorderItemModalFooter, modalPanelClassName)}>
            <Button type="button" color="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" color="success" disabled={isSubmitting}>
              {isSubmitting ? 'Reordering...' : 'Confirm Reorder'}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

KIReorderItemModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  item: inventoryItemShape,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
  submitError: PropTypes.string,
  darkMode: PropTypes.bool,
};

KIReorderItemModal.defaultProps = {
  item: null,
  isSubmitting: false,
  submitError: '',
  darkMode: false,
};

export default KIReorderItemModal;
