import React, { useState, useEffect } from 'react';
import { Container, Button, Alert, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faXmark, faSync, faFilter, faEye } from '@fortawesome/free-solid-svg-icons';
import styles from './ResourceManagementDashboard.module.css';

const ResourceManagementDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [filterStatus]);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');

    try {
      const url =
        filterStatus === 'all'
          ? '/pm/resource-requests'
          : `/pm/resource-requests?status=${filterStatus}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          throw new Error(
            'Backend endpoint not found. Please ensure the API server is running and the endpoint is configured.',
          );
        }
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        const contentType = response.headers.get('content-type') || 'unknown format';
        throw new Error(
          `Invalid response format from server. Expected JSON but received: ${contentType}`,
        );
      }
      setRequests(data || []);
    } catch (err) {
      setError(err.message || 'An error occurred while fetching requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async requestId => {
    setActionLoading(true);
    try {
      const response = await fetch(`/pm/resource-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'approved' }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve request');
      }

      setError('');
      fetchRequests();
      setShowModal(false);
      setSelectedRequest(null);
    } catch (err) {
      setError(err.message || 'An error occurred while approving the request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeny = async requestId => {
    setActionLoading(true);
    try {
      const response = await fetch(`/pm/resource-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'denied' }),
      });

      if (!response.ok) {
        throw new Error('Failed to deny request');
      }

      setError('');
      fetchRequests();
      setShowModal(false);
      setSelectedRequest(null);
    } catch (err) {
      setError(err.message || 'An error occurred while denying the request.');
    } finally {
      setActionLoading(false);
    }
  };

  const openRequestDetail = request => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const getStatusColor = status => {
    const colors = {
      pending: '#ffc107',
      approved: '#28a745',
      denied: '#dc3545',
    };
    return colors[status] || '#6c757d';
  };

  const getPriorityColor = priority => {
    const colors = {
      low: '#17a2b8',
      medium: '#007bff',
      high: '#fd7e14',
      urgent: '#dc3545',
    };
    return colors[priority] || '#6c757d';
  };

  const filteredRequests =
    filterStatus === 'all' ? requests : requests.filter(req => req.status === filterStatus);

  if (loading) {
    return (
      <Container className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p>Loading resource requests...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTitle}>
            <h1>Resource Request Management</h1>
            <p>Review and respond to educator resource requests</p>
          </div>
        </div>
      </div>

      {/* Summary Stats - Top Section */}
      {filteredRequests.length > 0 && (
        <div className={styles.summaryStatsTop}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{requests.length}</div>
            <div className={styles.statLabel}>Total Requests</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue} style={{ color: '#ffc107' }}>
              {requests.filter(r => r.status === 'pending').length}
            </div>
            <div className={styles.statLabel}>Pending</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue} style={{ color: '#28a745' }}>
              {requests.filter(r => r.status === 'approved').length}
            </div>
            <div className={styles.statLabel}>Approved</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue} style={{ color: '#dc3545' }}>
              {requests.filter(r => r.status === 'denied').length}
            </div>
            <div className={styles.statLabel}>Denied</div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <Alert color="danger" className={styles.errorAlert}>
          {error}
        </Alert>
      )}

      {/* Filter & Controls Bar */}
      <div className={styles.controlsBar}>
        <div className={styles.filterSection}>
          <FontAwesomeIcon icon={faFilter} className={styles.filterIcon} />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="denied">Denied</option>
          </select>
        </div>
        <Button
          color="secondary"
          size="sm"
          onClick={fetchRequests}
          disabled={loading}
          className={styles.refreshBtn}
          outline
        >
          <FontAwesomeIcon icon={faSync} className={loading ? styles.spinning : ''} />
          <span className={styles.refreshText}>Refresh</span>
        </Button>
      </div>

      {/* Requests Table / Cards */}
      {filteredRequests.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📬</div>
          <h3>No requests found</h3>
          <p>
            {filterStatus === 'all'
              ? 'There are no resource requests at this time.'
              : `There are no ${filterStatus} requests.`}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className={styles.tableWrapper}>
            <table className={styles.requestsTable}>
              <thead>
                <tr>
                  <th>Educator</th>
                  <th>Request Title</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Submitted Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map(request => (
                  <tr key={request.id} className={styles.tableRow}>
                    <td className={styles.nameCell}>
                      {request.educatorName || 'Unknown Educator'}
                    </td>
                    <td className={styles.titleCell}>{request.title}</td>
                    <td>
                      <span
                        className={styles.priorityBadge}
                        style={{ backgroundColor: getPriorityColor(request.priority) }}
                      >
                        {request.priority?.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span
                        className={styles.statusBadge}
                        style={{ backgroundColor: getStatusColor(request.status) }}
                      >
                        {request.status?.charAt(0).toUpperCase() + request.status?.slice(1)}
                      </span>
                    </td>
                    <td className={styles.dateCell}>
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className={styles.actionCell}>
                      <Button
                        color="info"
                        size="sm"
                        onClick={() => openRequestDetail(request)}
                        className={styles.viewBtn}
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </Button>
                      {request.status === 'pending' && (
                        <>
                          <Button
                            color="success"
                            size="sm"
                            onClick={() => handleApprove(request.id)}
                            disabled={actionLoading}
                            className={styles.actionBtn}
                          >
                            <FontAwesomeIcon icon={faCheck} />
                          </Button>
                          <Button
                            color="danger"
                            size="sm"
                            onClick={() => handleDeny(request.id)}
                            disabled={actionLoading}
                            className={styles.actionBtn}
                          >
                            <FontAwesomeIcon icon={faXmark} />
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className={styles.mobileCards}>
            {filteredRequests.map(request => (
              <div key={request.id} className={styles.requestCard}>
                <div className={styles.cardHeader}>
                  <h4 className={styles.cardTitle}>{request.title}</h4>
                  <span
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(request.status) }}
                  >
                    {request.status?.charAt(0).toUpperCase() + request.status?.slice(1)}
                  </span>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardMeta}>
                    <div className={styles.metaItem}>
                      <strong>Educator:</strong>
                      {request.educatorName || 'Unknown'}
                    </div>
                    <div className={styles.metaItem}>
                      <strong>Priority:</strong>
                      <span
                        className={styles.priorityBadge}
                        style={{ backgroundColor: getPriorityColor(request.priority) }}
                      >
                        {request.priority?.toUpperCase()}
                      </span>
                    </div>
                    <div className={styles.metaItem}>
                      <strong>Submitted:</strong>
                      {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className={styles.cardActions}>
                  <Button
                    color="info"
                    size="sm"
                    onClick={() => openRequestDetail(request)}
                    className={styles.fullWidthBtn}
                  >
                    <FontAwesomeIcon icon={faEye} className="me-2" />
                    View Details
                  </Button>
                  {request.status === 'pending' && (
                    <>
                      <Button
                        color="success"
                        size="sm"
                        onClick={() => handleApprove(request.id)}
                        disabled={actionLoading}
                        className={styles.fullWidthBtn}
                      >
                        <FontAwesomeIcon icon={faCheck} className="me-2" />
                        Approve
                      </Button>
                      <Button
                        color="danger"
                        size="sm"
                        onClick={() => handleDeny(request.id)}
                        disabled={actionLoading}
                        className={styles.fullWidthBtn}
                      >
                        <FontAwesomeIcon icon={faXmark} className="me-2" />
                        Deny
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Request Detail Modal */}
      <Modal isOpen={showModal} toggle={() => setShowModal(false)} size="lg">
        <ModalHeader toggle={() => setShowModal(false)}>Request Details</ModalHeader>
        <ModalBody>
          {selectedRequest && (
            <div className={styles.modalContent}>
              <div className={styles.detailGroup}>
                <label htmlFor="educatorName">Educator Name</label>
                <p id="educatorName">{selectedRequest.educatorName || 'Unknown'}</p>
              </div>

              <div className={styles.detailGroup}>
                <label htmlFor="requestTitle">Request Title</label>
                <p id="requestTitle">{selectedRequest.title}</p>
              </div>

              <div className={styles.detailGroup}>
                <label htmlFor="requestDetails">Details</label>
                <p id="requestDetails">{selectedRequest.details}</p>
              </div>

              <div className={styles.detailsRow}>
                <div className={styles.detailGroup}>
                  <label htmlFor="priorityDisplay">Priority</label>
                  <p id="priorityDisplay">
                    <span
                      className={styles.priorityBadge}
                      style={{ backgroundColor: getPriorityColor(selectedRequest.priority) }}
                    >
                      {selectedRequest.priority?.toUpperCase()}
                    </span>
                  </p>
                </div>

                <div className={styles.detailGroup}>
                  <label htmlFor="statusDisplay">Status</label>
                  <p id="statusDisplay">
                    <span
                      className={styles.statusBadge}
                      style={{ backgroundColor: getStatusColor(selectedRequest.status) }}
                    >
                      {selectedRequest.status?.charAt(0).toUpperCase() +
                        selectedRequest.status?.slice(1)}
                    </span>
                  </p>
                </div>
              </div>

              <div className={styles.detailsRow}>
                <div className={styles.detailGroup}>
                  <label htmlFor="submittedDate">Submitted Date</label>
                  <p id="submittedDate">
                    {new Date(selectedRequest.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className={styles.detailGroup}>
                  <label htmlFor="updatedDate">Updated Date</label>
                  <p id="updatedDate">{new Date(selectedRequest.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          {selectedRequest?.status === 'pending' && (
            <>
              <Button
                color="success"
                onClick={() => handleApprove(selectedRequest.id)}
                disabled={actionLoading}
              >
                <FontAwesomeIcon icon={faCheck} className="me-2" />
                Approve
              </Button>
              <Button
                color="danger"
                onClick={() => handleDeny(selectedRequest.id)}
                disabled={actionLoading}
              >
                <FontAwesomeIcon icon={faXmark} className="me-2" />
                Deny
              </Button>
            </>
          )}
          <Button color="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Summary Stats */}
      {filteredRequests.length > 0 && (
        <div className={styles.summaryStats}>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>{requests.length}</div>
            <div className={styles.statLabel}>Total Requests</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>
              {requests.filter(r => r.status === 'pending').length}
            </div>
            <div className={styles.statLabel}>Pending</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>
              {requests.filter(r => r.status === 'approved').length}
            </div>
            <div className={styles.statLabel}>Approved</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>
              {requests.filter(r => r.status === 'denied').length}
            </div>
            <div className={styles.statLabel}>Denied</div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default ResourceManagementDashboard;
