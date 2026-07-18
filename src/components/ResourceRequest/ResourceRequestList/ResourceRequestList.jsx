import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSync, faFilter } from '@fortawesome/free-solid-svg-icons';
import {
  getStatusColor,
  getPriorityColor,
  filterByStatus,
  getRequestStats,
} from '../utils/resourceRequestUtils';
import { getMockEducatorRequests } from '../../../__mocks__/resourceRequestMockData';
import ResourceRequestForm from '../ResourceRequestForm/ResourceRequestForm';
import styles from './ResourceRequestList.module.css';

const ResourceRequestList = () => {
  const darkMode = useSelector(state => state.theme?.darkMode || false);
  const [requests, setRequests] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);

  const theme = darkMode ? styles.dark : '';

  useEffect(() => {
    fetchRequests();
    const handleFocus = () => fetchRequests();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const data = getMockEducatorRequests();
      setRequests(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load requests');
    }
    setLoading(false);
  };

  const getStatusBadge = status => (
    <span className={styles.statusBadge} style={{ backgroundColor: getStatusColor(status) }}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );

  const getPriorityBadge = priority => (
    <span className={styles.priorityBadge} style={{ backgroundColor: getPriorityColor(priority) }}>
      {priority?.toUpperCase()}
    </span>
  );

  const filteredRequests = filterByStatus(requests, filterStatus);
  const stats = getRequestStats(requests);

  const handleNewRequest = () => {
    setShowFormModal(true);
  };

  const handleCloseFormModal = () => {
    setShowFormModal(false);
    fetchRequests();
  };

  if (loading) {
    return (
      <div className={`${styles.page} ${theme}`}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p>Loading your requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.page} ${theme}`}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1>My Resource Requests</h1>
          <p>Track the status of all your resource requests to Project Managers</p>
        </div>
        <button type="button" onClick={handleNewRequest} className={styles.newRequestBtn}>
          <FontAwesomeIcon icon={faPlus} /> New Request
        </button>
      </div>

      {error && <div className={styles.errorAlert}>{error}</div>}

      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <FontAwesomeIcon icon={faFilter} className={styles.filterIcon} />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
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
          <FontAwesomeIcon icon={faSync} />
        </button>
      </div>

      {filteredRequests.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📋</div>
          <h3>No requests found</h3>
          <p>
            {filterStatus === 'all'
              ? "You haven't submitted any resource requests yet."
              : `You have no ${filterStatus} requests.`}
          </p>
          <button type="button" onClick={handleNewRequest} className={styles.submitFirstBtn}>
            <FontAwesomeIcon icon={faPlus} /> Submit Your First Request
          </button>
        </div>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.requestsTable}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map(request => (
                  <tr key={request.id} className={styles.tableRow}>
                    <td className={styles.titleCell}>
                      <div className={styles.titleText}>{request.title}</div>
                      <small className={styles.details}>
                        {request.details?.substring(0, 50)}...
                      </small>
                    </td>
                    <td>{getPriorityBadge(request.priority)}</td>
                    <td>{getStatusBadge(request.status)}</td>
                    <td className={styles.dateCell}>
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className={styles.dateCell}>
                      {new Date(request.updatedAt).toLocaleDateString()}
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
                  {getStatusBadge(request.status)}
                </div>
                <div className={styles.cardBody}>
                  <p className={styles.cardDetails}>{request.details}</p>
                  <div className={styles.cardMeta}>
                    <div className={styles.metaItem}>
                      <strong>Priority:</strong> {getPriorityBadge(request.priority)}
                    </div>
                    <div className={styles.metaItem}>
                      <strong>Submitted:</strong> {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                    <div className={styles.metaItem}>
                      <strong>Updated:</strong> {new Date(request.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {filteredRequests.length > 0 && (
        <div className={styles.summaryStats}>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>{stats.total}</div>
            <div className={styles.statLabel}>Total</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>{stats.pending}</div>
            <div className={styles.statLabel}>Pending</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>{stats.approved}</div>
            <div className={styles.statLabel}>Approved</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>{stats.denied}</div>
            <div className={styles.statLabel}>Denied</div>
          </div>
        </div>
      )}
      {showFormModal && (
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
        <div className={styles.modalOverlay} onClick={handleCloseFormModal}>
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
          <div className={styles.modalPopup} onClick={e => e.stopPropagation()}>
            <ResourceRequestForm onClose={handleCloseFormModal} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceRequestList;
