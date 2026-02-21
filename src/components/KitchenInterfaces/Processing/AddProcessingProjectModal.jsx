import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import styles from './ProcessingLandingPage.module.css';

const AddProcessingProjectModal = ({ isOpen, onClose, targetSection, onSave }) => {
  const darkMode = useSelector(state => state.theme.darkMode);

  const [formData, setFormData] = useState({
    projectName: '',
    type: targetSection || 'canning',
    priority: 'Low',
    quantity: '',
    trays: '',
    batches: '',
    storage: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (targetSection) {
      setFormData(prev => ({ ...prev, type: targetSection }));
    }
  }, [targetSection]);

  if (!isOpen) return null;

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    // Map frontend field names to backend schema
    const payload = {
      item_name: formData.projectName,
      process_name: formData.type,
      quantity: Number(formData.quantity) || 0,
      unit: formData.unit || 'lbs',
      batches: Number(formData.batches) || 0,
      priority: formData.priority,
      scheduled_date: formData.date,
      supplies_quantity: Number(formData.trays || formData.storage) || 0,
      supplies_type: formData.type === 'cellarStorage' ? 'bins' : 'trays',
    };
    onSave(payload);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modalContent} ${darkMode ? styles.darkModeModal : ''}`}>
        <div className={styles.modalHeader}>
          <h2>Schedule New Project</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label htmlFor="projectName">Project Name</label>
            <input
              id="projectName"
              type="text"
              name="projectName"
              value={formData.projectName}
              onChange={handleChange}
              required
              placeholder="e.g. Tomato Sauce Batch A"
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="type">Processing Method</label>
              <select id="type" name="type" value={formData.type} onChange={handleChange}>
                <option value="canning">Canning</option>
                <option value="dehydration">Dehydration</option>
                <option value="freezeDrying">Freeze Drying</option>
                <option value="cellarStorage">Cellar Storage</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="quantity">Quantity</label>
              <input
                id="quantity"
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="0"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="unit">Unit</label>
              <select id="unit" name="unit" value={formData.unit || 'lbs'} onChange={handleChange}>
                <option value="lbs">lbs</option>
                <option value="ears">ears</option>
                <option value="units">units</option>
                <option value="oz">oz</option>
                <option value="gallons">gallons</option>
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="batches">Batches</label>
              <input
                id="batches"
                type="number"
                name="batches"
                value={formData.batches}
                onChange={handleChange}
                placeholder="0"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="date">Scheduled Date</label>
              <input
                id="date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {(formData.type === 'dehydration' || formData.type === 'freezeDrying') && (
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="trays">Trays Needed</label>
                <input
                  id="trays"
                  type="number"
                  name="trays"
                  value={formData.trays}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="batchesExtra">Batches</label>
                <input
                  id="batchesExtra"
                  type="number"
                  name="batches"
                  value={formData.batches}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {formData.type === 'cellarStorage' && (
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="storage">Storage Bins Needed</label>
                <input
                  id="storage"
                  type="number"
                  name="storage"
                  value={formData.storage}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
            </div>
          )}

          <div className={styles.modalActions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn}>
              Schedule Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProcessingProjectModal;
