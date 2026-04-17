import { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment-timezone';
import { createEvent } from '../../../../actions/communityPortal/eventActions';
import styles from './CreateEventModal.module.css';

function CreateEventModal({ isOpen, toggle }) {
  const dispatch = useDispatch();
  const darkMode = useSelector((state) => state.theme.darkMode);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    title: '',
    type: 'Workshop',
    location: 'Virtual',
    startTime: moment().tz('America/Los_Angeles').format('HH:mm'),
    endTime: moment().tz('America/Los_Angeles').add(1, 'hour').format('HH:mm'),
    date: moment().tz('America/Los_Angeles').format('YYYY-MM-DD'),
    description: '',
    maxAttendees: 10,
    coverImage: '',
  });

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'Workshop',
      location: 'Virtual',
      startTime: moment().tz('America/Los_Angeles').format('HH:mm'),
      endTime: moment().tz('America/Los_Angeles').add(1, 'hour').format('HH:mm'),
      date: moment().tz('America/Los_Angeles').format('YYYY-MM-DD'),
      description: '',
      maxAttendees: 10,
      coverImage: '',
    });
    setErrors({});
    setLoading(false);
  };

  const handleToggle = () => {
    if (!loading) {
      toggle();
      if (!isOpen) {
        resetForm();
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (formData.maxAttendees < 1) {
      newErrors.maxAttendees = 'Max attendees must be at least 1';
    }

    // Validate that end time is after start time
    if (formData.startTime && formData.endTime) {
      const start = moment(`${formData.date} ${formData.startTime}`, 'YYYY-MM-DD HH:mm');
      const end = moment(`${formData.date} ${formData.endTime}`, 'YYYY-MM-DD HH:mm');
      if (end.isSameOrBefore(start)) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // Format the event data according to the Event model
    const eventData = {
      title: formData.title.trim(),
      type: formData.type,
      location: formData.location,
      startTime: moment(`${formData.date} ${formData.startTime}`, 'YYYY-MM-DD HH:mm')
        .tz('America/Los_Angeles')
        .format(),
      endTime: moment(`${formData.date} ${formData.endTime}`, 'YYYY-MM-DD HH:mm')
        .tz('America/Los_Angeles')
        .format(),
      date: moment(formData.date).tz('America/Los_Angeles').toDate(),
      description: formData.description.trim(),
      maxAttendees: parseInt(formData.maxAttendees, 10),
      status: 'New',
      isActive: true,
    };

    if (formData.coverImage.trim()) {
      eventData.coverImage = formData.coverImage.trim();
    }

    try {
      const result = await dispatch(createEvent(eventData));
      if (result?.success) {
        handleToggle();
        // The events list will be refreshed when the component re-renders
      }
    } catch (error) {
      // Error handling is done in the action
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={handleToggle}
      className={`${styles.modalDialog} ${darkMode ? styles.modalDialogDark : ''}`}
    >
      <ModalHeader
        toggle={handleToggle}
        className={`${styles.modalHeader} ${darkMode ? styles.modalHeaderDark : ''}`}
        cssModule={{ 'modal-title': styles.modalTitle }}
      >
        Create New Event
      </ModalHeader>
      <ModalBody className={`${styles.modalBody} ${darkMode ? styles.modalBodyDark : ''}`}>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label
              htmlFor="title"
              className={`${styles.label} ${darkMode ? styles.labelDark : ''}`}
            >
              Event Title
            </label>
            <span className={styles.redAsterisk}>* </span>
            <input
              type="text"
              className={`${styles.input} ${darkMode ? styles.inputDark : ''} ${errors.title ? styles.inputInvalid : ''}`}
              id="title"
              name="title"
              placeholder="Enter event title"
              value={formData.title}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.title && <div className={styles.errorText}>{errors.title}</div>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="type" className={`${styles.label} ${darkMode ? styles.labelDark : ''}`}>
              Event Type
            </label>
            <span className={styles.redAsterisk}>* </span>
            <select
              className={`${styles.select} ${darkMode ? styles.selectDark : ''}`}
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="Workshop">Workshop</option>
              <option value="Meeting">Meeting</option>
              <option value="Webinar">Webinar</option>
              <option value="Social Gathering">Social Gathering</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label
              htmlFor="location"
              className={`${styles.label} ${darkMode ? styles.labelDark : ''}`}
            >
              Location
            </label>
            <span className={styles.redAsterisk}>* </span>
            <select
              className={`${styles.select} ${darkMode ? styles.selectDark : ''}`}
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="Virtual">Virtual</option>
              <option value="In person">In person</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="date" className={`${styles.label} ${darkMode ? styles.labelDark : ''}`}>
              Event Date
            </label>
            <span className={styles.redAsterisk}>* </span>
            <input
              type="date"
              className={`${styles.input} ${darkMode ? styles.inputDark : ''} ${errors.date ? styles.inputInvalid : ''}`}
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.date && <div className={styles.errorText}>{errors.date}</div>}
          </div>

          <div className={styles.formRow}>
            <div className={`${styles.formGroup} ${styles.formCol}`}>
              <label
                htmlFor="startTime"
                className={`${styles.label} ${darkMode ? styles.labelDark : ''}`}
              >
                Start Time
              </label>
              <span className={styles.redAsterisk}>* </span>
              <input
                type="time"
                className={`${styles.input} ${darkMode ? styles.inputDark : ''} ${errors.startTime ? styles.inputInvalid : ''}`}
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.startTime && <div className={styles.errorText}>{errors.startTime}</div>}
            </div>

            <div className={`${styles.formGroup} ${styles.formCol}`}>
              <label
                htmlFor="endTime"
                className={`${styles.label} ${darkMode ? styles.labelDark : ''}`}
              >
                End Time
              </label>
              <span className={styles.redAsterisk}>* </span>
              <input
                type="time"
                className={`${styles.input} ${darkMode ? styles.inputDark : ''} ${errors.endTime ? styles.inputInvalid : ''}`}
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.endTime && <div className={styles.errorText}>{errors.endTime}</div>}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label
              htmlFor="description"
              className={`${styles.label} ${darkMode ? styles.labelDark : ''}`}
            >
              Description
            </label>
            <span className={styles.redAsterisk}>* </span>
            <textarea
              className={`${styles.textarea} ${darkMode ? styles.textareaDark : ''} ${errors.description ? styles.inputInvalid : ''}`}
              id="description"
              name="description"
              rows="4"
              placeholder="Enter event description"
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.description && <div className={styles.errorText}>{errors.description}</div>}
          </div>

          <div className={styles.formGroup}>
            <label
              htmlFor="maxAttendees"
              className={`${styles.label} ${darkMode ? styles.labelDark : ''}`}
            >
              Max Attendees
            </label>
            <span className={styles.redAsterisk}>* </span>
            <input
              type="number"
              className={`${styles.input} ${darkMode ? styles.inputDark : ''} ${errors.maxAttendees ? styles.inputInvalid : ''}`}
              id="maxAttendees"
              name="maxAttendees"
              min="1"
              placeholder="Enter maximum number of attendees"
              value={formData.maxAttendees}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.maxAttendees && <div className={styles.errorText}>{errors.maxAttendees}</div>}
          </div>

          <div className={styles.formGroup}>
            <label
              htmlFor="coverImage"
              className={`${styles.label} ${darkMode ? styles.labelDark : ''}`}
            >
              Cover Image URL (Optional)
            </label>
            <input
              type="url"
              className={`${styles.input} ${darkMode ? styles.inputDark : ''}`}
              id="coverImage"
              name="coverImage"
              placeholder="Enter cover image URL"
              value={formData.coverImage}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </form>
      </ModalBody>
      <ModalFooter className={`${styles.modalFooter} ${darkMode ? styles.modalFooterDark : ''}`}>
        <Button
          color="secondary"
          onClick={handleToggle}
          disabled={loading}
          className={`${styles.button} ${styles.buttonSecondary}`}
        >
          Cancel
        </Button>
        <Button
          color="primary"
          onClick={handleSubmit}
          disabled={loading}
          className={`${styles.button} ${styles.buttonPrimary}`}
        >
          {loading ? 'Creating...' : 'Create Event'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default CreateEventModal;
