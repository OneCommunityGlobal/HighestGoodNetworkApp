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

        // Transform event data to match component structure
        const transformedData = {
          activityName: event.title || 'Untitled Event',
          description: event.description || 'No description available.',
          schedule:
            event.resources && event.resources.length > 0
              ? event.resources.map((resource, index) => ({
                  time:
                    event.startTime && event.endTime
                      ? `${new Date(event.startTime).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })} to ${new Date(event.endTime).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}`
                      : `Session ${index + 1}`,
                  activity: resource.name || 'Activity',
                }))
              : [
                  {
                    time:
                      event.startTime && event.endTime
                        ? `${new Date(event.startTime).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })} to ${new Date(event.endTime).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}`
                        : 'TBD',
                    activity: event.type || 'Event',
                  },
                ],
          image: event.coverImage || ActivityImg,
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
          <img src={eventData.image} alt="Activity" />
        </div>
        <div className="activity-agenda-content">
          <h1>{eventData.activityName}</h1>
          <p>{eventData.description}</p>
          <h1>Schedule of the day</h1>
          {eventData.schedule && eventData.schedule.length > 0 ? (
            eventData.schedule.map((item, index) => (
              <p key={`${item.time}-${item.activity}-${index}`}>
                {item.time} - {item.activity}
              </p>
            ))
          ) : (
            <p>No schedule available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ActivityAgenda;
