import './ActivityAgenda.css';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { ENDPOINTS } from '../../../utils/URL';
import ActivityImg from '../../../assets/images/yoga-img.png';

function ActivityAgenda() {
  const { activityid } = useParams();
  const darkMode = useSelector(state => state.theme.darkMode);
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);

  // Fetch event data by ID
  useEffect(() => {
    if (!activityid) {
      setError('Activity ID is missing');
      setLoading(false);
      return;
    }
    const fetchEventData = async () => {
      setLoading(true);
      setError(null);
      setImageError(false);
      try {
        // Try to fetch event by ID first
        let event = null;
        try {
          const response = await axios.get(ENDPOINTS.EVENT_BY_ID(activityid));
          event = response.data;
        } catch (idError) {
          // If endpoint doesn't exist, fetch all events and filter by ID
          const response = await axios.get(ENDPOINTS.EVENTS);
          const events = response.data.events || [];
          event = events.find(e => e._id === activityid || e.id === activityid);
        }

        if (!event) {
          throw new Error('Event not found');
        }

        // Format date and time helper functions
        const formatTime = timeString => {
          if (!timeString) return 'TBD';
          try {
            return new Date(timeString).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            });
          } catch {
            return timeString;
          }
        };

        const formatDate = dateString => {
          if (!dateString) return 'TBD';
          try {
            return new Date(dateString).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });
          } catch {
            return dateString;
          }
        };

        // Build schedule from resources or use event time
        let schedule = [];
        if (event.resources && event.resources.length > 0) {
          schedule = event.resources.map((resource, index) => ({
            time:
              event.startTime && event.endTime
                ? `${formatTime(event.startTime)} to ${formatTime(event.endTime)}`
                : `Session ${index + 1}`,
            activity: resource.name || 'Activity',
            resourceLocation: resource.location || event.location,
          }));
        } else if (event.startTime && event.endTime) {
          schedule = [
            {
              time: `${formatTime(event.startTime)} to ${formatTime(event.endTime)}`,
              activity: event.type || 'Event',
              resourceLocation: event.location,
            },
          ];
        }

        // Transform event data to match component structure
        const transformedData = {
          activityName: event.title || 'Untitled Event',
          description: event.description || 'No description available.',
          schedule,
          image: event.coverImage || ActivityImg,
          date: formatDate(event.date),
          location: event.location || 'Not specified',
          type: event.type || 'Event',
          status: event.status || 'New',
          maxAttendees: event.maxAttendees || 0,
          currentAttendees: event.currentAttendees || 0,
        };

        setEventData(transformedData);
      } catch (err) {
        setError(err.message || 'Failed to fetch event data');
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [activityid]);

  // Validate activityid parameter
  if (!activityid) {
    return (
      <div className={`activity-agenda-page ${darkMode ? 'activity-agenda-dark-mode' : ''}`}>
        <div className="activity-agenda-container">
          <div className="activity-agenda-content">
            <h1>Error</h1>
            <p>Activity ID is missing. Please provide a valid activity ID in the URL.</p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className={`activity-agenda-page ${darkMode ? 'activity-agenda-dark-mode' : ''}`}>
        <div className="activity-agenda-container">
          <div className="activity-agenda-content">
            <h1>Loading...</h1>
            <p>Please wait while we fetch the activity details.</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`activity-agenda-page ${darkMode ? 'activity-agenda-dark-mode' : ''}`}>
        <div className="activity-agenda-container">
          <div className="activity-agenda-content">
            <h1>Error</h1>
            <p>{error}</p>
            <p>Please check the activity ID and try again.</p>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!eventData) {
    return (
      <div className={`activity-agenda-page ${darkMode ? 'activity-agenda-dark-mode' : ''}`}>
        <div className="activity-agenda-container">
          <div className="activity-agenda-content">
            <h1>No Data</h1>
            <p>No activity data found for the provided ID.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`activity-agenda-page ${darkMode ? 'activity-agenda-dark-mode' : ''}`}>
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
            {eventData.date && (
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
