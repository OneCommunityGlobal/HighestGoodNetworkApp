import { useState } from 'react';
import { Card } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faChevronDown,
  faCalendar,
  faClock,
  faMapMarkerAlt,
  faTag,
} from '@fortawesome/free-solid-svg-icons';
import { format } from 'date-fns';
import { getUserTimezone, formatDateTimeWithTimezone } from '../../../../utils/timezoneUtils';
import styles from './EventCard.module.css';

function EventCard(props) {
  const { event, darkMode } = props;
  const [expanded, setExpanded] = useState(false);
  const {
    title = '',
    description = '',
    type = '',
    location = '',
    startTime = '',
    endTime = '',
    date = '',
    status = 'New',
    resources = [],
    currentAttendees = 0,
    maxAttendees = 0,
  } = event;

  const attendanceRate = Math.round((currentAttendees / maxAttendees) * 100) || 0;

  const getStatusClass = statusValue => {
    switch (statusValue?.toLowerCase()) {
      case 'full':
        return 'status-full';
      case 'filling fast':
        return 'status-filling';
      case 'need attendees':
        return 'status-need';
      default:
        return 'status-new';
    }
  };

  const getLocationTag = locationType => {
    return (locationType?.toLowerCase() || '') === 'virtual' ? 'virtual-tag' : 'in-person-tag';
  };

  const getDisplayLocation = () => {
    if (!location || location.trim() === '') {
      return 'Location TBD';
    }
    return location;
  };

  const formatDate = dateString => {
    if (!dateString) {
      return 'Date not set';
    }
    try {
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date not set';
    }
  };

  const formatDateTime = dateString => {
    try {
      if (!dateString) {
        return 'Time not set';
      }

      // Get user's timezone
      const userTimezone = getUserTimezone();

      // Format with timezone conversion and abbreviation
      return formatDateTimeWithTimezone(dateString, userTimezone);
    } catch (error) {
      console.error('Error formatting date time:', error);
      return 'Time not set';
    }
  };

  const handleConfirmation = async () => {
    // TODO: Replace with actual registration endpoint once available
    // Will use: POST /api/register/create
  };

  return (
    <Card
      className={`${styles['event-card']} ${
        darkMode ? `${styles['bg-space-cadet']} text-light` : ''
      }`}
    >
      <div className={styles['cover-section']}>
        <img src={event.coverImage} alt={event.title} className={styles['event-cover-image']} />
      </div>

      <div className="p-3">
        {/* Title and Status */}
        <div className="d-flex justify-content-between align-items-start">
          <div className="d-flex flex-column">
            <div className={`d-flex align-items-center ${styles['gap-2']}`}>
              <h2 className={`h4 mb-0 ${darkMode ? 'text-light' : ''}`}>{title}</h2>
              <span className={`badge ${styles['status-badge']} ${styles[getStatusClass(status)]}`}>
                {status}
              </span>
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className={`${styles['event-details']} mt-3`}>
          <div className="d-flex align-items-center mb-2">
            <FontAwesomeIcon
              icon={faTag}
              className={`me-2 ${darkMode ? 'text-light' : 'text-muted'}`}
            />
            <span className="text-muted">Type:</span>
            <span className="ms-2">{type}</span>
          </div>
          <div className="d-flex align-items-center mb-2">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2 text-muted" />
            <span className="text-muted">Location:</span>
            <span
              className={`ms-2 ${styles['attendee-tag']} ${
                styles[getLocationTag(getDisplayLocation())]
              }`}
            >
              {getDisplayLocation()}
            </span>
          </div>
          <div className={`${styles['event-description']} mb-2`}>
            <span className="text-muted">Description:</span>
            <p className="mt-1 mb-0">{description}</p>
          </div>
        </div>

        {/* Date and Time */}
        <div className="mb-4">
          <div className="d-flex align-items-center mb-2">
            <FontAwesomeIcon icon={faCalendar} className="me-2" />
            <span>{formatDate(date)}</span>
          </div>
          <div className="d-flex align-items-center mb-2">
            <FontAwesomeIcon icon={faClock} className="me-2" />
            <span>
              {formatDateTime(startTime)} - {formatDateTime(endTime)}
            </span>
          </div>
        </div>

        {/* Attendance Stats */}
        <div className="mb-4">
          <h3 className="h5 mb-3">Attendance</h3>
          <p className="mb-2">Attendance rate: {attendanceRate}%</p>
          <div className={styles['attendance-progress']}>
            <div className={styles['attendance-bar']} style={{ width: `${attendanceRate}%` }} />
          </div>
        </div>

        {/* Attendees List */}
        <div className={styles['attendees-section']}>
          <div className="d-flex align-items-center mb-3">
            <FontAwesomeIcon icon={faUsers} className="me-2" />
            <span>
              Attendees ({currentAttendees}/{maxAttendees})
            </span>
          </div>

          {(resources || []).slice(0, expanded ? undefined : 3).map(resource => (
            <div
              key={`${resource.name}-${resource.location}-${resource.userID || ''}`}
              className="d-flex justify-content-between align-items-center py-2"
            >
              <div className="d-flex align-items-center">
                <div className={`${styles['avatar-placeholder']} me-2`} />
                <span>{resource.name}</span>
              </div>
              <span
                className={`${styles['attendee-tag']} ${styles[getLocationTag(resource.location)]}`}
              >
                {resource.location.toLowerCase()}
              </span>
            </div>
          ))}

          {resources.length > 3 && (
            <button
              type="button"
              className="btn btn-link d-flex align-items-center mt-2"
              onClick={() => setExpanded(!expanded)}
            >
              <FontAwesomeIcon
                icon={faChevronDown}
                className={`me-1 ${expanded ? styles['expanded'] : ''}`}
              />
              {expanded ? 'Show less' : `Show ${resources.length - 3} more`}
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-3">
          <button
            type="button"
            className={`${styles['action-button']} ${styles['primary-button']}`}
            onClick={handleConfirmation}
          >
            Confirm attendance
          </button>
          <button
            type="button"
            className={`${styles['action-button']} ${styles['secondary-button']}`}
          >
            Log activity
          </button>
          <button
            type="button"
            className={`${styles['action-button']} ${styles['secondary-button']}`}
          >
            Report
          </button>
        </div>
      </div>
    </Card>
  );
}

export default EventCard;
