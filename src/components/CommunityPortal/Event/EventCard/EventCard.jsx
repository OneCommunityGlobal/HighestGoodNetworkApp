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
import './EventCard.css';

function EventCard({ event }) {
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

  const formatDateTime = dateString => {
    try {
      return format(new Date(dateString), 'h:mm a');
    } catch (error) {
      return 'Time not set';
    }
  };

  const handleConfirmation = async () => {
    // TODO: Replace with actual registration endpoint once available
    // Will use: POST /api/register/create
    console.log('Attendance confirmation clicked - awaiting registration endpoint');
    alert('Registration functionality coming soon');
  };

  return (
    <Card className="event-card">
      <div className="cover-section">
        <img src={event.coverImage} alt={event.title} className="event-cover-image" />
      </div>

      <div className="p-3">
        {/* Title and Status */}
        <div className="d-flex justify-content-between align-items-start">
          <div className="d-flex flex-column">
            <div className="d-flex align-items-center gap-2">
              <h2 className="h4 mb-0">{title}</h2>
              <span className={`badge status-badge ${getStatusClass(status)}`}>{status}</span>
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="event-details mt-3">
          <div className="d-flex align-items-center mb-2">
            <FontAwesomeIcon icon={faTag} className="me-2 text-muted" />
            <span className="text-muted">Type:</span>
            <span className="ms-2">{type}</span>
          </div>
          <div className="d-flex align-items-center mb-2">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2 text-muted" />
            <span className="text-muted">Location:</span>
            <span className={`ms-2 attendee-tag ${getLocationTag(location)}`}>{location}</span>
          </div>
          <div className="event-description mb-2">
            <span className="text-muted">Description:</span>
            <p className="mt-1 mb-0">{description}</p>
          </div>
        </div>

        {/* Date and Time */}
        <div className="mb-4">
          <div className="d-flex align-items-center mb-2">
            <FontAwesomeIcon icon={faCalendar} className="me-2" />
            <span>{format(new Date(date), 'MMM dd, yyyy')}</span>
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
          <div className="attendance-progress">
            <div className="attendance-bar" style={{ width: `${attendanceRate}%` }} />
          </div>
        </div>

        {/* Attendees List */}
        <div className="attendees-section">
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
                <div className="avatar-placeholder me-2" />
                <span>{resource.name}</span>
              </div>
              <span className={`attendee-tag ${getLocationTag(resource.location)}`}>
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
                className={`me-1 ${expanded ? 'expanded' : ''}`}
              />
              {expanded ? 'Show less' : `Show ${resources.length - 3} more`}
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-3">
          <button
            type="button"
            className="action-button primary-button"
            onClick={handleConfirmation}
          >
            Confirm attendance
          </button>
          <button type="button" className="action-button secondary-button">
            Log activity
          </button>
          <button type="button" className="action-button secondary-button">
            Report
          </button>
        </div>
      </div>
    </Card>
  );
}

export default EventCard;
