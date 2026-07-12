import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faXmark,
  faSync,
  faFilter,
  faEye,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import {
  getStatusColor,
  getPriorityColor,
  filterByStatus,
  getRequestStats,
} from '../utils/resourceRequestUtils';
import {
  getMockPMRequests,
  updateMockRequestStatus,
} from '../../../__mocks__/resourceRequestMockData';
import styles from './ResourceManagementDashboard.module.css';

const ResourceManagementDashboard = () => {
  const darkMode = useSelector(state => state.theme?.darkMode || false);
  const [requests, setRequests] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const theme = darkMode ? styles.dark : '';

  useEffect(() => {
    fetchRequests();
  }, [filterStatus]);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const data = getMockPMRequests(filterStatus === 'all' ? null : filterStatus);
      setRequests(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load requests');
    }
    setLoading(false);
  };

  const handleApprove = async requestId => {
    setActionLoading(true);
    try {
      updateMockRequestStatus(requestId, 'approved');
      fetchRequests();
      setShowModal(false);
      setSelectedRequest(null);
    } catch (err) {
      setError(err.message || 'Failed to approve request');
    }
    setActionLoading(false);
  };

  const handleDeny = async requestId => {
    setActionLoading(true);
    try {
      updateMockRequestStatus(requestId, 'denied');
      fetchRequests();
      setShowModal(false);
      setSelectedRequest(null);
    } catch (err) {
      setError(err.message || 'Failed to deny request');
    }
    setActionLoading(false);
  };

  const openRequestDetail = request => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const filteredRequests = filterByStatus(requests, filterStatus);
  const stats = getRequestStats(requests);

  if (loading) {
    return (
      <div className={`${styles.page} ${theme}`}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p>Loading resource requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.page} ${theme}`}>
      <div className={styles.header}>
        <h1>Resource Request Management</h1>
        <p>Review and respond to educator resource requests</p>
      </div>

      {filteredRequests.length > 0 && (
        <div className={styles.summaryStatsTop}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.total}</div>
            <div className={styles.statLabel}>Total Requests</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue} style={{ color: getStatusColor('pending') }}>
              {stats.pending}
            </div>
            <div className={styles.statLabel}>Pending</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue} style={{ color: getStatusColor('approved') }}>
              {stats.approved}
            </div>
            <div className={styles.statLabel}>Approved</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue} style={{ color: getStatusColor('denied') }}>
              {stats.denied}
            </div>
            <div className={styles.statLabel}>Denied</div>
          </div>
        </div>
      )}

      {error && <div className={styles.errorAlert}>{error}</div>}

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
        <button
          type="button"
          onClick={fetchRequests}
          disabled={loading}
          className={styles.refreshBtn}
        >
          <FontAwesomeIcon icon={faSync} className={loading ? styles.spinning : ''} />
          <span className={styles.refreshText}>Refresh</span>
        </button>
      </div>

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
                    <td>{request.educatorName || 'Unknown Educator'}</td>
                    <td>{request.title}</td>
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
                      <button
                        type="button"
                        onClick={() => openRequestDetail(request)}
                        className={styles.viewBtn}
                      >
                        <FontAwesomeIcon icon={faEye} /> View
                      </button>
                      {request.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApprove(request.id)}
                            disabled={actionLoading}
                            className={styles.approveBtn}
                          >
                            <FontAwesomeIcon icon={faCheck} /> Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeny(request.id)}
                            disabled={actionLoading}
                            className={styles.denyBtn}
                          >
                            <FontAwesomeIcon icon={faXmark} /> Deny
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
                      <strong>Educator:</strong> {request.educatorName || 'Unknown'}
                    </div>
                    <div className={styles.metaItem}>
                      <strong>Priority:</strong>{' '}
                      <span
                        className={styles.priorityBadge}
                        style={{ backgroundColor: getPriorityColor(request.priority) }}
                      >
                        {request.priority?.toUpperCase()}
                      </span>
                    </div>
                    <div className={styles.metaItem}>
                      <strong>Submitted:</strong> {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className={styles.cardActions}>
                  <button
                    type="button"
                    onClick={() => openRequestDetail(request)}
                    className={styles.fullWidthBtn}
                  >
                    <FontAwesomeIcon icon={faEye} /> View Details
                  </button>
                  {request.status === 'pending' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleApprove(request.id)}
                        disabled={actionLoading}
                        className={styles.approveBtnFull}
                      >
                        <FontAwesomeIcon icon={faCheck} /> Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeny(request.id)}
                        disabled={actionLoading}
                        className={styles.denyBtnFull}
                      >
                        <FontAwesomeIcon icon={faXmark} /> Deny
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showModal && (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
          <div className={styles.modalPopup} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Request Details</h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className={styles.modalClose}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className={styles.modalBody}>
              {selectedRequest && (
                <>
                  <div className={styles.detailGroup}>
                    <span className={styles.detailLabel}>Educator Name</span>
                    <p>{selectedRequest.educatorName || 'Unknown'}</p>
                  </div>
                  <div className={styles.detailGroup}>
                    <span className={styles.detailLabel}>Request Title</span>
                    <p>{selectedRequest.title}</p>
                  </div>
                  <div className={styles.detailGroup}>
                    <span className={styles.detailLabel}>Details</span>
                    <p>{selectedRequest.details}</p>
                  </div>
                  <div className={styles.detailsRow}>
                    <div className={styles.detailGroup}>
                      <span className={styles.detailLabel}>Priority</span>
                      <p>
                        <span
                          className={styles.priorityBadge}
                          style={{ backgroundColor: getPriorityColor(selectedRequest.priority) }}
                        >
                          {selectedRequest.priority?.toUpperCase()}
                        </span>
                      </p>
                    </div>
                    <div className={styles.detailGroup}>
                      <span className={styles.detailLabel}>Status</span>
                      <p>
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
                      <span className={styles.detailLabel}>Submitted Date</span>
                      <p>{new Date(selectedRequest.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className={styles.detailGroup}>
                      <span className={styles.detailLabel}>Updated Date</span>
                      <p>{new Date(selectedRequest.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className={styles.modalFooter}>
              {selectedRequest?.status === 'pending' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleApprove(selectedRequest.id)}
                    disabled={actionLoading}
                    className={styles.approveBtnFull}
                  >
                    <FontAwesomeIcon icon={faCheck} /> Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeny(selectedRequest.id)}
                    disabled={actionLoading}
                    className={styles.denyBtnFull}
                  >
                    <FontAwesomeIcon icon={faXmark} /> Deny
                  </button>
                </>
              )}
              <button type="button" onClick={() => setShowModal(false)} className={styles.closeBtn}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceManagementDashboard;
