import React, { useState, useEffect } from 'react';
import { Container, Button, Alert, Badge } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSync, faFilter } from '@fortawesome/free-solid-svg-icons';
import { useHistory } from 'react-router-dom';
import styles from './ResourceRequestList.module.css';

const ResourceRequestList = ({ auth }) => {
  const history = useHistory();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/educator/resource-requests', {
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

  const getStatusBadge = status => {
    const statusConfig = {
      pending: { color: 'warning', icon: '⏳' },
      approved: { color: 'success', icon: '✓' },
      denied: { color: 'danger', icon: '✕' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge color={config.color} className={styles.statusBadge}>
        {config.icon} {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </Badge>
    );
  };

  const getPriorityBadge = priority => {
    const priorityConfig = {
      low: { color: 'info', bgColor: '#d1ecf1' },
      medium: { color: 'primary', bgColor: '#cfe2ff' },
      high: { color: 'warning', bgColor: '#fff3cd' },
      urgent: { color: 'danger', bgColor: '#f8d7da' },
    };
    const config = priorityConfig[priority] || priorityConfig.medium;
    return (
      <span className={styles.priorityBadge} style={{ backgroundColor: config.bgColor }}>
        {priority?.toUpperCase()}
      </span>
    );
  };

  const filteredRequests =
    filterStatus === 'all' ? requests : requests.filter(req => req.status === filterStatus);

  const handleNewRequest = () => {
    history.push('/educator/requests/new');
  };

  if (loading) {
    return (
      <Container className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p>Loading your requests...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1>My Resource Requests</h1>
          <p>Track the status of all your resource requests to Project Managers</p>
        </div>
        <Button color="primary" onClick={handleNewRequest} className={styles.newRequestBtn}>
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          New Request
        </Button>
      </div>

      {/* Error Alert */}
      {error && <Alert color="danger">{error}</Alert>}

      {/* Filter Bar */}
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
        <Button
          color="light"
          size="sm"
          onClick={fetchRequests}
          disabled={loading}
          className={styles.refreshBtn}
        >
          <FontAwesomeIcon icon={faSync} />
        </Button>
      </div>

      {/* Requests Table / Cards */}
      {filteredRequests.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📋</div>
          <h3>No requests found</h3>
          <p>
            {filterStatus === 'all'
              ? "You haven't submitted any resource requests yet."
              : `You have no ${filterStatus} requests.`}
          </p>
          <Button color="primary" onClick={handleNewRequest}>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Submit Your First Request
          </Button>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
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
                        {request.details?.substring(0, 50)}
                        ...
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

          {/* Mobile Cards */}
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
                      <strong>Submitted:</strong>
                      {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                    <div className={styles.metaItem}>
                      <strong>Updated:</strong>
                      {new Date(request.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

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

export default ResourceRequestList;
