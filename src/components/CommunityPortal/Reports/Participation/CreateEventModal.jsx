import { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment-timezone';
import { createEvent } from '../../../../actions/communityPortal/eventActions';
import '../../../Header/DarkMode.module.css';

function CreateEventModal({ isOpen, toggle }) {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    title: '',
    type: 'Workshop',
    location: 'Virtual',
    startTime: moment()
      .tz('America/Los_Angeles')
      .format('HH:mm'),
    endTime: moment()
      .tz('America/Los_Angeles')
      .add(1, 'hour')
      .format('HH:mm'),
    date: moment()
      .tz('America/Los_Angeles')
      .format('YYYY-MM-DD'),
    description: '',
    maxAttendees: 10,
    coverImage: '',
  });

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'Workshop',
      location: 'Virtual',
      startTime: moment()
        .tz('America/Los_Angeles')
        .format('HH:mm'),
      endTime: moment()
        .tz('America/Los_Angeles')
        .add(1, 'hour')
        .format('HH:mm'),
      date: moment()
        .tz('America/Los_Angeles')
        .format('YYYY-MM-DD'),
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

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
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

  const handleSubmit = async e => {
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
      date: moment(formData.date)
        .tz('America/Los_Angeles')
        .toDate(),
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
      className={`modal-dialog modal-lg ${darkMode ? 'text-light dark-mode' : ''}`}
    >
      <ModalHeader
        toggle={handleToggle}
        className={darkMode ? 'bg-space-cadet' : ''}
        cssModule={{ 'modal-title': 'w-100 text-center my-auto pl-2' }}
      >
        Create New Event
      </ModalHeader>
      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title" className={darkMode ? 'text-light' : ''}>
              Event Title
            </label>
            <span className="red-asterisk">* </span>
            <input
              type="text"
              className={`form-control ${
                darkMode ? 'bg-darkmode-liblack border-0 text-light' : ''
              } ${errors.title ? 'is-invalid' : ''}`}
              id="title"
              name="title"
              placeholder="Enter event title"
              value={formData.title}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.title && <div className="text-danger small">{errors.title}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="type" className={darkMode ? 'text-light' : ''}>
              Event Type
            </label>
            <span className="red-asterisk">* </span>
            <select
              className={`form-control ${
                darkMode ? 'bg-darkmode-liblack border-0 text-light' : ''
              }`}
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              disabled={loading}
              style={
                darkMode
                  ? {
                      colorScheme: 'dark',
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                    }
                  : {}
              }
            >
              <option value="Workshop">Workshop</option>
              <option value="Meeting">Meeting</option>
              <option value="Webinar">Webinar</option>
              <option value="Social Gathering">Social Gathering</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="location" className={darkMode ? 'text-light' : ''}>
              Location
            </label>
            <span className="red-asterisk">* </span>
            <select
              className={`form-control ${
                darkMode ? 'bg-darkmode-liblack border-0 text-light' : ''
              }`}
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              disabled={loading}
              style={
                darkMode
                  ? {
                      colorScheme: 'dark',
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                    }
                  : {}
              }
            >
              <option value="Virtual">Virtual</option>
              <option value="In person">In person</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="date" className={darkMode ? 'text-light' : ''}>
              Event Date
            </label>
            <span className="red-asterisk">* </span>
            <input
              type="date"
              className={`form-control ${
                darkMode ? 'bg-darkmode-liblack border-0 text-light' : ''
              } ${errors.date ? 'is-invalid' : ''}`}
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              disabled={loading}
              style={darkMode ? { colorScheme: 'dark' } : {}}
            />
            {errors.date && <div className="text-danger small">{errors.date}</div>}
          </div>

          <div className="form-row">
            <div className="form-group col-md-6">
              <label htmlFor="startTime" className={darkMode ? 'text-light' : ''}>
                Start Time
              </label>
              <span className="red-asterisk">* </span>
              <input
                type="time"
                className={`form-control ${
                  darkMode ? 'bg-darkmode-liblack border-0 text-light' : ''
                } ${errors.startTime ? 'is-invalid' : ''}`}
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                disabled={loading}
                style={darkMode ? { colorScheme: 'dark' } : {}}
              />
              {errors.startTime && <div className="text-danger small">{errors.startTime}</div>}
            </div>

            <div className="form-group col-md-6">
              <label htmlFor="endTime" className={darkMode ? 'text-light' : ''}>
                End Time
              </label>
              <span className="red-asterisk">* </span>
              <input
                type="time"
                className={`form-control ${
                  darkMode ? 'bg-darkmode-liblack border-0 text-light' : ''
                } ${errors.endTime ? 'is-invalid' : ''}`}
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                disabled={loading}
                style={darkMode ? { colorScheme: 'dark' } : {}}
              />
              {errors.endTime && <div className="text-danger small">{errors.endTime}</div>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description" className={darkMode ? 'text-light' : ''}>
              Description
            </label>
            <span className="red-asterisk">* </span>
            <textarea
              className={`form-control ${
                darkMode ? 'bg-darkmode-liblack border-0 text-light' : ''
              } ${errors.description ? 'is-invalid' : ''}`}
              id="description"
              name="description"
              rows="4"
              placeholder="Enter event description"
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.description && <div className="text-danger small">{errors.description}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="maxAttendees" className={darkMode ? 'text-light' : ''}>
              Max Attendees
            </label>
            <span className="red-asterisk">* </span>
            <input
              type="number"
              className={`form-control ${
                darkMode ? 'bg-darkmode-liblack border-0 text-light' : ''
              } ${errors.maxAttendees ? 'is-invalid' : ''}`}
              id="maxAttendees"
              name="maxAttendees"
              min="1"
              placeholder="Enter maximum number of attendees"
              value={formData.maxAttendees}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.maxAttendees && <div className="text-danger small">{errors.maxAttendees}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="coverImage" className={darkMode ? 'text-light' : ''}>
              Cover Image URL (Optional)
            </label>
            <input
              type="url"
              className={`form-control ${
                darkMode ? 'bg-darkmode-liblack border-0 text-light' : ''
              }`}
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
      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Button
          color="secondary"
          onClick={handleToggle}
          disabled={loading}
          style={darkMode ? { backgroundColor: '#6c757d', borderColor: '#6c757d' } : {}}
        >
          Cancel
        </Button>
        <Button
          color="primary"
          onClick={handleSubmit}
          disabled={loading}
          style={darkMode ? { backgroundColor: '#007bff', borderColor: '#007bff' } : {}}
        >
          {loading ? 'Creating...' : 'Create Event'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default CreateEventModal;
