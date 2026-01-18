import './ActivityAgenda.css';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { ENDPOINTS } from '../../../utils/URL';
import ActivityImg from '../../../assets/images/yoga-img.png';

// Helper function to format time string
const formatTime = timeString => {
  if (!timeString) return 'TBD';
  try {
    const date = new Date(timeString);
    if (Number.isNaN(date.getTime())) {
      return timeString;
    }
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return timeString;
  }
};

// Helper function to format date string
const formatDate = dateString => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return null;
  }
};

// Helper function to check if error is a network error
const isNetworkError = error => {
  return error.code === 'ECONNREFUSED' || error.message.includes('Network Error');
};

// Helper function to fetch event by ID
const fetchEventById = async activityid => {
  try {
    const response = await axios.get(ENDPOINTS.EVENT_BY_ID(activityid));
    return response.data || null;
  } catch (idError) {
    if (idError.response?.status === 404) {
      return null;
    }
    if (isNetworkError(idError)) {
      throw new Error('Unable to connect to server. Please check your internet connection.');
    }
    return null;
  }
};

// Helper function to fetch event from events list
const fetchEventFromList = async activityid => {
  try {
    const response = await axios.get(ENDPOINTS.EVENTS);
    const events = response.data?.events || [];
    return events.find(
      e => e._id === activityid || e.id === activityid || String(e._id) === String(activityid),
    );
  } catch (fallbackError) {
    if (isNetworkError(fallbackError)) {
      throw new Error('Unable to connect to server. Please check your internet connection.');
    }
    throw new Error('Failed to fetch events. Please try again later.');
  }
};

// Helper function to build schedule from event data
const buildSchedule = (event, formatTimeFn) => {
  if (event.resources && Array.isArray(event.resources) && event.resources.length > 0) {
    return event.resources
      .filter(resource => resource != null)
      .map((resource, index) => ({
        time:
          event.startTime && event.endTime
            ? `${formatTimeFn(event.startTime)} to ${formatTimeFn(event.endTime)}`
            : `Session ${index + 1}`,
        activity: resource?.name || 'Activity',
        resourceLocation: resource?.location || event.location || 'Not specified',
      }));
  }
  if (event.startTime && event.endTime) {
    return [
      {
        time: `${formatTimeFn(event.startTime)} to ${formatTimeFn(event.endTime)}`,
        activity: event.type || 'Event',
        resourceLocation: event.location || 'Not specified',
      },
    ];
  }
  return [];
};

// Helper function to transform event data
const transformEventData = (event, schedule, ActivityImg) => {
  return {
    activityName: event.title || 'Untitled Event',
    description: event.description || 'No description available.',
    schedule: Array.isArray(schedule) ? schedule : [],
    image: event.coverImage || ActivityImg,
    date: formatDate(event.date),
    location: event.location || 'Not specified',
    type: event.type || 'Event',
    status: event.status || 'New',
    maxAttendees: typeof event.maxAttendees === 'number' ? event.maxAttendees : 0,
    currentAttendees: typeof event.currentAttendees === 'number' ? event.currentAttendees : 0,
  };
};

// Helper function to get error message from error object
const getErrorMessage = (err, activityid) => {
  if (err.message) {
    return err.message;
  }
  if (err.response) {
    if (err.response.status === 404) {
      return `Event with ID "${activityid}" not found.`;
    }
    if (err.response.status >= 500) {
      return 'Server error. Please try again later.';
    }
    if (err.response.status === 401 || err.response.status === 403) {
      return 'You do not have permission to view this event.';
    }
    return `Error ${err.response.status}: ${err.response.statusText || 'Request failed'}`;
  }
  if (err.request) {
    return 'No response from server. Please check your connection.';
  }
  return 'Failed to fetch event data';
};

function ActivityAgenda() {
  const { activityid } = useParams();
  const darkMode = useSelector(state => state.theme.darkMode);
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);

  // Fetch event data by ID
  useEffect(() => {
    if (!activityid || activityid.trim() === '') {
      setError('Activity ID is missing');
      setLoading(false);
      return;
    }

    const fetchEventData = async () => {
      setLoading(true);
      setError(null);
      setImageError(false);
      try {
        let event = await fetchEventById(activityid);
        if (!event) {
          event = await fetchEventFromList(activityid);
        }

        if (!event || typeof event !== 'object') {
          throw new Error(
            `Event with ID "${activityid}" not found. Please verify the activity ID.`,
          );
        }

        const schedule = buildSchedule(event, formatTime);
        const transformedData = transformEventData(event, schedule, ActivityImg);
        setEventData(transformedData);
      } catch (err) {
        const errorMessage = getErrorMessage(err, activityid);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [activityid]);

  // Helper function to get page class name
  const getPageClassName = () => {
    return `activity-agenda-page ${darkMode ? 'activity-agenda-dark-mode' : ''}`;
  };

  // Render error state for missing activity ID
  const renderMissingIdError = () => (
    <div className={getPageClassName()}>
      <div className="activity-agenda-container">
        <div className="activity-agenda-content">
          <h1>Error</h1>
          <p>Activity ID is missing. Please provide a valid activity ID in the URL.</p>
        </div>
      </div>
    </div>
  );

  // Render loading state
  const renderLoading = () => (
    <div className={getPageClassName()}>
      <div className="activity-agenda-container">
        <div className="activity-agenda-content">
          <h1>Loading...</h1>
          <p>Please wait while we fetch the activity details.</p>
        </div>
      </div>
    </div>
  );

  // Render error state
  const renderError = () => (
    <div className={getPageClassName()}>
      <div className="activity-agenda-container">
        <div className="activity-agenda-content">
          <h1>Error</h1>
          <p>{error}</p>
          <p>Please check the activity ID and try again.</p>
        </div>
      </div>
    </div>
  );

  // Render no data state
  const renderNoData = () => (
    <div className={getPageClassName()}>
      <div className="activity-agenda-container">
        <div className="activity-agenda-content">
          <h1>No Data</h1>
          <p>No activity data found for the provided ID.</p>
        </div>
      </div>
    </div>
  );

  // Early returns for different states
  if (!activityid) {
    return renderMissingIdError();
  }
  if (loading) {
    return renderLoading();
  }
  if (error) {
    return renderError();
  }
  if (!eventData) {
    return renderNoData();
  }

  return (
    <div className={getPageClassName()}>
      <div className="activity-agenda-container">
        <div className="activity-agenda-image">
          <img
            src={imageError ? ActivityImg : eventData.image}
            alt={eventData.activityName}
            onError={() => setImageError(true)}
          />
        </div>
        <div className="activity-agenda-content">
          <h1>{eventData.activityName}</h1>

          {/* Event Metadata */}
          <div
            className="activity-metadata"
            style={{
              marginBottom: '20px',
              paddingBottom: '15px',
              borderBottom: darkMode ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid #e0e0e0',
            }}
          >
            {eventData.date && eventData.date !== 'TBD' && (
              <p style={{ marginBottom: '8px' }}>
                <strong>Date:</strong> {eventData.date}
              </p>
            )}
            <p style={{ marginBottom: '8px' }}>
              <strong>Type:</strong> {eventData.type}
            </p>
            <p style={{ marginBottom: '8px' }}>
              <strong>Location:</strong> {eventData.location}
            </p>
            <p style={{ marginBottom: '8px' }}>
              <strong>Status:</strong> {eventData.status}
            </p>
            {eventData.maxAttendees > 0 && (
              <p style={{ marginBottom: '8px' }}>
                <strong>Attendance:</strong> {eventData.currentAttendees} / {eventData.maxAttendees}
              </p>
            )}
          </div>

          {/* Description */}
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Description</h2>
            <p style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>{eventData.description}</p>
          </div>

          {/* Schedule */}
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Schedule of the day</h2>
            {eventData.schedule && eventData.schedule.length > 0 ? (
              <div>
                {eventData.schedule.map((item, index) => (
                  <div
                    key={`${item.time}-${item.activity}-${index}`}
                    style={{
                      marginBottom: '12px',
                      padding: '10px',
                      backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5',
                      borderRadius: '5px',
                    }}
                  >
                    <p style={{ marginBottom: '5px', fontWeight: 'bold' }}>{item.time}</p>
                    <p style={{ marginBottom: '5px' }}>
                      <strong>Activity:</strong> {item.activity}
                    </p>
                    {item.resourceLocation && (
                      <p style={{ marginBottom: '0', fontSize: '0.9rem', opacity: 0.8 }}>
                        <strong>Location:</strong> {item.resourceLocation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>No schedule available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActivityAgenda;
