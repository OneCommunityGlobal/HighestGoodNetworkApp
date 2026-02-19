import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardHeader, CardBody, Table } from 'reactstrap';
import moment from 'moment';
import { getAllProjectTimeLogs } from '../../../actions/bmdashboard/timeLoggerActions';
import styles from './BMTimeLogCard.module.css';

function BMTimeLogSummary({ projectId }) {
  const dispatch = useDispatch();
  const allProjectTimeLogs = useSelector(
    state => state.bmTimeLogger?.allProjectTimeLogs?.[projectId] || [],
  );
  // Listen to stop actions to trigger refresh
  const stopTimeLogHistory = useSelector(state => state.bmTimeLogger?.bmTimeLogHistory || []);

  useEffect(() => {
    if (projectId) {
      dispatch(getAllProjectTimeLogs(projectId));
    }
  }, [projectId, dispatch]);

  // Refresh time logs when a stop action occurs (detected by history length change)
  useEffect(() => {
    if (projectId && stopTimeLogHistory.length > 0) {
      // Small delay to ensure backend has processed the stop
      const timer = setTimeout(() => {
        dispatch(getAllProjectTimeLogs(projectId));
      }, 800); // Increased delay to ensure backend has saved the completed log
      return () => clearTimeout(timer);
    }
  }, [stopTimeLogHistory.length, projectId, dispatch]);

  // Format duration from milliseconds to readable format
  const formatDuration = milliseconds => {
    if (!milliseconds || milliseconds === 0) return '0:00:00';
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Get start time from intervals or createdAt
  const getStartTime = timeLog => {
    if (timeLog.intervals && timeLog.intervals.length > 0) {
      return moment(timeLog.intervals[0].startTime).format('MM/DD/YY hh:mm:ss A');
    }
    return moment(timeLog.createdAt).format('MM/DD/YY hh:mm:ss A');
  };

  // Get stop time from intervals
  const getStopTime = timeLog => {
    if (timeLog.intervals && timeLog.intervals.length > 0) {
      const lastInterval = timeLog.intervals[timeLog.intervals.length - 1];
      if (lastInterval.endTime) {
        return moment(lastInterval.endTime).format('MM/DD/YY hh:mm:ss A');
      }
    }
    if (timeLog.status === 'completed' && timeLog.updatedAt) {
      return moment(timeLog.updatedAt).format('MM/DD/YY hh:mm:ss A');
    }
    return 'N/A';
  };

  // Filter only completed time logs for the summary and sort by most recent first
  const completedTimeLogs = allProjectTimeLogs
    .filter(log => log.status === 'completed')
    .sort((a, b) => {
      // Sort by updatedAt (when it was stopped) descending, or createdAt if updatedAt is not available
      const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(a.createdAt);
      const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(b.createdAt);
      return dateB - dateA; // Most recent first
    });

  if (completedTimeLogs.length === 0) {
    return (
      <Card className="my-4">
        <CardHeader className="bg-primary text-white">
          <h5 className="mb-0">Time Log Summary</h5>
        </CardHeader>
        <CardBody>
          <p className="text-muted mb-0">
            No completed time logs yet. Start and stop timers to see entries here.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="my-4">
      <CardHeader className="bg-primary text-white">
        <h5 className="mb-0">Time Log Summary</h5>
      </CardHeader>
      <CardBody>
        <div className="table-responsive">
          <Table striped hover>
            <thead>
              <tr>
                <th>Member</th>
                <th>Role</th>
                <th>Start Time</th>
                <th>Stop Time</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {completedTimeLogs.map(timeLog => (
                <tr key={timeLog._id}>
                  <td>
                    {timeLog.member?.firstName} {timeLog.member?.lastName}
                  </td>
                  <td>
                    <span className="badge bg-secondary">{timeLog.member?.role || 'N/A'}</span>
                  </td>
                  <td>{getStartTime(timeLog)}</td>
                  <td>{getStopTime(timeLog)}</td>
                  <td>
                    <strong>{formatDuration(timeLog.totalElapsedTime)}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </CardBody>
    </Card>
  );
}

export default BMTimeLogSummary;
