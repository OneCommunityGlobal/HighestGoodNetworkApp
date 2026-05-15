import { useState, useEffect } from 'react';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  Spinner,
  Alert,
} from 'reactstrap';
import moment from 'moment-timezone';
import axios from 'axios';
import { boxStyleDark, boxStyle } from '../../../styles';
import { ENDPOINTS } from '../../../utils/URL';
import '../../Header/index.css';

function TaskChangeLogModal({ isOpen, toggle, task, darkMode }) {
  const [changeLogs, setChangeLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const fetchChangeLogs = async (page = 1) => {
    if (!task?._id) return;

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(ENDPOINTS.TASK_CHANGE_LOGS(task._id), {
        params: {
          page,
          limit: 10,
        },
      });

      setChangeLogs(response.data.changeLogs || []);
      setPagination(response.data.pagination || {});
    } catch (err) {
      // console.error('Failed to fetch change logs:', err);

      // Check if it's a 404 (endpoint not found)
      if (err.response?.status === 404) {
        setError(
          'Backend API not yet implemented. Individual change tracking requires backend deployment.',
        );
      } else if (err.response?.status === 401) {
        setError('Authentication required. Please log in again.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view change history.');
      } else {
        setError(
          `Failed to load change history. Error: ${err.response?.status || 'Unknown'} - ${err
            .response?.data?.message || err.message}`,
        );
      }
      setChangeLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch change logs from backend API
  useEffect(() => {
    if (isOpen && task?._id) {
      fetchChangeLogs(currentPage);
    }
  }, [isOpen, task, currentPage]);

  // Reset page when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
    }
  }, [isOpen]);

  const formatTimestamp = timestamp => {
    return moment(timestamp)
      .tz('America/Los_Angeles')
      .format('MMM DD, YYYY h:mm A');
  };

  const getChangeTypeColor = changeType => {
    switch (changeType) {
      case 'deadline_change':
        return '#ff6b6b';
      case 'assignment_change':
        return '#4ecdc4';
      case 'status_change':
        return '#45b7d1';
      case 'priority_change':
        return '#f9ca24';
      case 'task_created':
        return '#6c5ce7';
      case 'hours_change':
        return '#ff9f43';
      case 'field_change':
      default:
        return '#a8a8a8';
    }
  };

  const getChangeTypeLabel = changeType => {
    switch (changeType) {
      case 'deadline_change':
        return 'Deadline Changed';
      case 'assignment_change':
        return 'Assignment Changed';
      case 'status_change':
        return 'Status Changed';
      case 'priority_change':
        return 'Priority Changed';
      case 'task_created':
        return 'Task Created';
      case 'hours_change':
        return 'Hours Changed';
      case 'field_change':
        return 'Field Updated';
      default:
        return 'Task Updated';
    }
  };

  const handlePageChange = newPage => {
    setCurrentPage(newPage);
  };

  const getUserDisplayName = log => {
    if (log.userName) {
      return log.userName;
    }
    if (log.userId?.firstName && log.userId?.lastName) {
      return `${log.userId.firstName} ${log.userId.lastName}`;
    }
    return 'Unknown User';
  };

  return (
    <Modal
      className={darkMode ? 'text-light dark-mode' : ''}
      size="xl"
      isOpen={isOpen}
      toggle={toggle}
    >
      <ModalHeader className={darkMode ? 'bg-space-cadet' : ''} toggle={toggle}>
        Task Change History - {task?.taskName}
      </ModalHeader>

      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
        {loading && (
          <div className="text-center p-4">
            <Spinner color="primary" />
            <p className="mt-2">Loading change history...</p>
          </div>
        )}

        {!loading && error && (
          <Alert color={error.includes('not yet implemented') ? 'warning' : 'danger'}>
            {error}
            {!error.includes('not yet implemented') && (
              <Button
                color="link"
                size="sm"
                onClick={() => fetchChangeLogs(currentPage)}
                className="ml-2"
              >
                Retry
              </Button>
            )}
            {error.includes('not yet implemented') && (
              <div className="mt-3">
                <p>
                  <strong>Preview with mock data:</strong>
                </p>
                <Button
                  color="info"
                  size="sm"
                  onClick={() => {
                    // Show mock data for demo purposes
                    setChangeLogs([
                      {
                        _id: 'mock-1',
                        timestamp: new Date().toISOString(),
                        changeType: 'assignment_change',
                        userName: 'Current User',
                        userId: {
                          firstName: 'Current',
                          lastName: 'User',
                          email: 'user@example.com',
                        },
                        changeDescription: 'Added user to task',
                        oldValueFormatted: 'None assigned',
                        newValueFormatted: 'Current User',
                        field: 'resources',
                      },
                      {
                        _id: 'mock-2',
                        timestamp: new Date(Date.now() - 300000).toISOString(),
                        changeType: 'priority_change',
                        userName: 'Current User',
                        userId: {
                          firstName: 'Current',
                          lastName: 'User',
                          email: 'user@example.com',
                        },
                        changeDescription: 'Changed task priority',
                        oldValueFormatted: 'Primary',
                        newValueFormatted: 'Tertiary',
                        field: 'priority',
                      },
                      {
                        _id: 'mock-3',
                        timestamp: new Date(Date.now() - 600000).toISOString(),
                        changeType: 'task_created',
                        userName: 'Task Creator',
                        userId: {
                          firstName: 'Task',
                          lastName: 'Creator',
                          email: 'creator@example.com',
                        },
                        changeDescription: 'Task was created',
                        field: 'created',
                      },
                    ]);
                    setPagination({ page: 1, pages: 1, total: 3 });
                    setError(null);
                  }}
                >
                  Show Preview with Mock Data
                </Button>
              </div>
            )}
          </Alert>
        )}

        {!loading && !error && changeLogs.length === 0 && (
          <div className="text-center p-4">
            <p>No change history available for this task.</p>
          </div>
        )}

        {!loading && !error && changeLogs.length > 0 && (
          <>
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <small className={darkMode ? 'text-light' : 'text-muted'}>
                  Showing {changeLogs.length} of {pagination.total} changes
                  {task?.deadlineCount ? ` • ${task.deadlineCount} deadline follow-ups` : ''}
                </small>
                <small className={darkMode ? 'text-light' : 'text-muted'}>
                  Page {pagination.page} of {pagination.pages}
                </small>
              </div>
            </div>

            <Table className={`table-bordered ${darkMode ? 'text-light' : ''}`} size="sm">
              <thead className={darkMode ? 'bg-space-cadet' : 'bg-light'}>
                <tr>
                  <th style={{ width: '140px' }}>Date & Time</th>
                  <th style={{ width: '120px' }}>User</th>
                  <th style={{ width: '120px' }}>Change Type</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {changeLogs.map(log => (
                  <tr key={log._id}>
                    <td>
                      <small>{formatTimestamp(log.timestamp)}</small>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        {log.userId?.profilePic && (
                          <img
                            src={log.userId.profilePic}
                            alt=""
                            className="rounded-circle mr-2"
                            style={{ width: '24px', height: '24px' }}
                          />
                        )}
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: '500' }}>
                            {getUserDisplayName(log)}
                          </div>
                          {log.userId?.email && (
                            <div style={{ fontSize: '10px', opacity: 0.7 }}>{log.userId.email}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: getChangeTypeColor(log.changeType),
                          color: 'white',
                          fontSize: '10px',
                        }}
                      >
                        {getChangeTypeLabel(log.changeType)}
                      </span>
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                          {log.changeDescription || `Updated ${log.field}`}
                        </div>
                        {log.oldValueFormatted && log.newValueFormatted && (
                          <div style={{ fontSize: '12px' }}>
                            <span className="text-danger">From: {log.oldValueFormatted}</span>
                            <br />
                            <span className="text-success">To: {log.newValueFormatted}</span>
                          </div>
                        )}
                        {log.metadata?.reason && (
                          <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>
                            <em>Reason: {log.metadata.reason}</em>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="d-flex justify-content-center mt-3">
                <nav>
                  <ul className="pagination pagination-sm">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        type="button"
                        className="page-link"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                    </li>

                    {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                      const startPage = Math.max(1, currentPage - 2);
                      const page = startPage + i;
                      if (page <= pagination.pages) {
                        return (
                          <li
                            key={page}
                            className={`page-item ${currentPage === page ? 'active' : ''}`}
                          >
                            <button
                              type="button"
                              className="page-link"
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          </li>
                        );
                      }
                      return null;
                    })}

                    <li
                      className={`page-item ${currentPage === pagination.pages ? 'disabled' : ''}`}
                    >
                      <button
                        type="button"
                        className="page-link"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === pagination.pages}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </>
        )}
      </ModalBody>

      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Button color="secondary" onClick={toggle} style={darkMode ? boxStyleDark : boxStyle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default TaskChangeLogModal;
