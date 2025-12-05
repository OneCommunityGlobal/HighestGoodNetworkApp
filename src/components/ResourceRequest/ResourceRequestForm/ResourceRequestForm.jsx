import React, { useState } from 'react';
import { Container, Button, Alert } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useHistory } from 'react-router-dom';
import styles from './ResourceRequestForm.module.css';

const ResourceRequestForm = () => {
  const history = useHistory();
  const [formData, setFormData] = useState({
    title: '',
    details: '',
    priority: 'medium',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Call the backend API
      const response = await fetch('/educator/resource-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          throw new Error(
            'Backend endpoint not found. Please ensure the API server is running and the endpoint is configured.',
          );
        }
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        const contentType = response.headers.get('content-type') || 'unknown format';
        throw new Error(
          `Invalid response format from server. Expected JSON but received: ${contentType}`,
        );
      }

      setMessage({
        type: 'success',
        text: 'Your resource request has been submitted successfully!',
      });

      // Reset form
      setFormData({
        title: '',
        details: '',
        priority: 'medium',
      });

      // Redirect to requests page after 2 seconds
      setTimeout(() => {
        history.push('/educator/requests');
      }, 2000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'An error occurred while submitting your request.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    history.push('/educator/requests');
  };

  return (
    <Container className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={styles.formHeader}>
          <h1>Submit a Resource Request</h1>
          <p>Tell us what resources you need for your educational programs</p>
        </div>

        {message.text && (
          <Alert color={message.type === 'success' ? 'success' : 'danger'}>{message.text}</Alert>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Request Title */}
          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.label}>
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

          {/* Request Details */}
          <div className={styles.formGroup}>
            <label htmlFor="details" className={styles.label}>
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

          {/* Priority Level */}
          <div className={styles.formGroup}>
            <label htmlFor="priority" className={styles.label}>
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

          {/* Form Actions */}
          <div className={styles.formActions}>
            <Button
              color="secondary"
              outline
              onClick={handleCancel}
              disabled={loading}
              className={styles.cancelButton}
            >
              <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
              Cancel
            </Button>
            <Button
              color="primary"
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </div>
    </Container>
  );
};

export default ResourceRequestForm;
