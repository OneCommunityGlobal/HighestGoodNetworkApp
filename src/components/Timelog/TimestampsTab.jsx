import React, { useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import moment from 'moment-timezone';
import PropTypes from 'prop-types';
import { Table, Spinner, Alert } from 'reactstrap';
import useWebSocket from 'react-use-websocket';
import { getTimelogTracking, addTimelogEvent } from '../../actions/timelogTracking';
import { ENDPOINTS } from '../../utils/URL';

const TimestampsTab = ({ userId, getTimelogTracking, addTimelogEvent }) => {
  const { trackingEvents, loading, error } = useSelector(state => state.timelogTracking);
  const darkMode = useSelector(state => state.theme.darkMode);

  // WebSocket for real-time updates
  useWebSocket(ENDPOINTS.TIMER_SERVICE, {
    protocols: localStorage.getItem('token'),
    onMessage: (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'TIMELOG_EVENT' && message.data.userId === userId) {
          const newEvent = {
            _id: `realtime-${Date.now()}`,
            eventType: message.data.eventType,
            timestamp: message.data.timestamp,
            userId: message.data.userId
          };
          addTimelogEvent(newEvent);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    },
    shouldReconnect: () => true,
  });

  useEffect(() => {
    if (userId) {
      getTimelogTracking(userId);
    }
  }, [userId, getTimelogTracking]);

  const formatTimestamp = (timestamp) => {
    // Convert UTC timestamp to current user's browser timezone
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return moment.utc(timestamp).tz(userTimezone).format('YYYY-MM-DD HH:mm:ss z');
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center p-4">
        <Spinner color="primary" />
        <span className="ml-2">Loading timestamps...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert color="danger" className="m-3">
        Error loading timelog tracking events: {error.message}
      </Alert>
    );
  }

  return (
    <div className="timestamps-tab-container">
      <div className="mb-3">
        <p className={darkMode ? 'text-white-50' : 'text-muted'}>
          This table shows a chronological log of timelog events including when the timer was started, paused, stopped, or automatically paused.
        </p>
      </div>

      {trackingEvents.length === 0 ? (
        <div className="text-center p-4">
          <p className={darkMode ? 'text-white-50' : 'text-muted'}>No timelog tracking events found.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <Table
            className={`table ${darkMode ? 'table-dark' : ''}`}
            striped
            hover
          >
            <thead className={darkMode ? 'table-dark' : 'table-light'}>
              <tr className={darkMode ? 'text-light' : 'text-dark'}>
                <th style={{ width: '40%' }}>Event</th>
                <th style={{ width: '60%' }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {trackingEvents.map((event, index) => (
                <tr key={`${event._id}-${index}`}>
                  <td className={darkMode ? 'text-light' : ''}>
                    {event.eventType}
                  </td>
                  <td className={darkMode ? 'text-light' : ''}>
                    {formatTimestamp(event.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
};

TimestampsTab.propTypes = {
  userId: PropTypes.string.isRequired,
  getTimelogTracking: PropTypes.func.isRequired,
  addTimelogEvent: PropTypes.func.isRequired,
};

const mapDispatchToProps = {
  getTimelogTracking,
  addTimelogEvent,
};

export default connect(null, mapDispatchToProps)(TimestampsTab);
