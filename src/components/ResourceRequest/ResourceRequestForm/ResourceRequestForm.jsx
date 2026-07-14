import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useHistory } from 'react-router-dom';
import { createMockRequest } from '../../../__mocks__/resourceRequestMockData';
import styles from './ResourceRequestForm.module.css';

const ResourceRequestForm = ({ onClose }) => {
  const darkMode = useSelector(state => state.theme?.darkMode || false);
  const history = useHistory();
  const [formData, setFormData] = useState({
    title: '',
    details: '',
    priority: 'medium',
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const theme = darkMode ? styles.dark : '';

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      createMockRequest(formData.title, formData.details, formData.priority);
      setMessage({
        type: 'success',
        text: 'Your resource request has been submitted successfully!',
      });

      setFormData({ title: '', details: '', priority: 'medium' });

      setTimeout(() => {
        if (onClose) {
          onClose();
        } else {
          history.push('/educator/requests');
        }
      }, 2000);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message || 'An error occurred while submitting your request.',
      });
    }
    setLoading(false);
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      history.push('/educator/requests');
    }
  };

  return (
    <div className={onClose ? theme : `${styles.page} ${theme}`}>
      <div className={styles.formWrapper}>
        <div className={styles.formHeader}>
          <h1>Submit a Resource Request</h1>
          <p>Tell us what resources you need for your educational programs</p>
        </div>

        {message.text && (
          <div className={message.type === 'success' ? styles.successAlert : styles.errorAlert}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="title">
              Request Title <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Math Learning Materials"
              className={styles.input}
              required
              maxLength="100"
            />
            <small className={styles.help}>Maximum 100 characters</small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="details">
              Request Details <span className={styles.required}>*</span>
            </label>
            <textarea
              id="details"
              name="details"
              value={formData.details}
              onChange={handleInputChange}
              placeholder="Provide detailed information about what resources you need and why..."
              className={styles.textarea}
              required
              rows="6"
              maxLength="1000"
            />
            <small className={styles.help}>{formData.details.length}/1000 characters</small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="priority">
              Priority Level <span className={styles.required}>*</span>
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className={styles.select}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <small className={styles.help}>Select the priority level for this request</small>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className={styles.cancelButton}
            >
              <FontAwesomeIcon icon={faArrowLeft} /> Cancel
            </button>
            <button type="submit" disabled={loading} className={styles.submitButton}>
              <FontAwesomeIcon icon={faPaperPlane} /> {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResourceRequestForm;
