// src/components/BMDashboard/ItemList/UpdateItemModal.jsx
import { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './UpdateItemModal.module.css';

function UpdateItemModal({ isOpen, onClose, onSubmit }) {
  const [field, setField] = useState('name');
  const [id, setId] = useState('');
  const [value, setValue] = useState('');

  if (!isOpen) return null;

  const handleSubmit = event => {
    event.preventDefault();
    onSubmit({ id, field, value });
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <h2>Edit Name/Measurement</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <select id="field" value={field} onChange={event => setField(event.target.value)}>
              <option value="name">Name</option>
              <option value="measurement">Measurement unit</option>
            </select>
          </div>

          <div className={styles.formRow}>
            <label htmlFor="itemId">Item ID</label>
            <input
              id="itemId"
              type="text"
              value={id}
              onChange={event => setId(event.target.value)}
              required
            />
          </div>

          <div className={styles.formRow}>
            <label htmlFor="value">{field === 'name' ? 'New name' : 'New unit'}</label>
            <input
              id="value"
              type="text"
              value={value}
              onChange={event => setValue(event.target.value)}
              required
            />
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>
              Cancel
            </button>

            <button type="submit" className={styles.btnPrimary}>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

UpdateItemModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default UpdateItemModal;
