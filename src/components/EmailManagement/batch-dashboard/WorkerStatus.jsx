import React, { useState, useEffect } from 'react';
import { fetchWorkerStatus } from '../../../actions/emailBatchActions';

const WorkerStatus = () => {
  const [workerStatus, setWorkerStatus] = useState(null);

  const loadWorkerStatus = async () => {
    try {
      const status = await fetchWorkerStatus();
      setWorkerStatus(status);
    } catch (error) {
      console.error('Error loading worker status:', error);
    }
  };

  useEffect(() => {
    loadWorkerStatus();
    const interval = setInterval(loadWorkerStatus, 60000); // Refresh every 60 seconds
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!workerStatus) {
    return null;
  }

  const { running } = workerStatus;

  // Only two states: Active or Stopped
  const status = running
    ? { message: 'Worker: Running', color: '#28a745' }
    : { message: 'Worker: Stopped', color: '#dc3545' };

  return (
    <small className="text-muted d-flex align-items-center">
      <span
        className="d-inline-block rounded-circle me-1"
        style={{
          width: '12px',
          height: '12px',
          marginRight: '4px',
          backgroundColor: status.color,
          animation: running ? 'pulse 2s ease-in-out infinite' : 'none',
        }}
      />
      {status.message}
      <style>{`
        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </small>
  );
};

export default WorkerStatus;
