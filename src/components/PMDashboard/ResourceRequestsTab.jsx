import { useState, useEffect } from 'react';
import { Button, Input, Table, Badge, Spinner } from 'reactstrap';
import styles from './PMResourceDashboard.module.css';

/**
 * ResourceRequestsTab - Displays teacher resource requests with approve/deny controls
 */
function ResourceRequestsTab({ darkMode }) {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    teacherId: '',
    searchTerm: '',
  });

  // Mock data - Replace with actual API call when backend is ready
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockRequests = [
        {
          id: 'REQ001',
          teacherId: 'TCH001',
          teacherName: 'John Smith',
          resourceType: 'Laptop',
          quantity: 2,
          description: 'Needed for online teaching sessions',
          requestDate: '2025-11-15',
          status: 'pending',
          priority: 'high',
        },
        {
          id: 'REQ002',
          teacherId: 'TCH002',
          teacherName: 'Sarah Johnson',
          resourceType: 'Projector',
          quantity: 1,
          description: 'For classroom presentations',
          requestDate: '2025-11-18',
          status: 'pending',
          priority: 'medium',
        },
        {
          id: 'REQ003',
          teacherId: 'TCH001',
          teacherName: 'John Smith',
          resourceType: 'Whiteboard Markers',
          quantity: 10,
          description: 'Regular teaching supplies',
          requestDate: '2025-11-10',
          status: 'approved',
          priority: 'low',
        },
        {
          id: 'REQ004',
          teacherId: 'TCH003',
          teacherName: 'Michael Brown',
          resourceType: 'Chemistry Lab Equipment',
          quantity: 1,
          description: 'For science experiments',
          requestDate: '2025-11-12',
          status: 'denied',
          priority: 'high',
        },
        {
          id: 'REQ005',
          teacherId: 'TCH004',
          teacherName: 'Emily Davis',
          resourceType: 'Textbooks',
          quantity: 30,
          description: 'Mathematics textbooks for new semester',
          requestDate: '2025-11-20',
          status: 'pending',
          priority: 'high',
        },
      ];
      setRequests(mockRequests);
      setFilteredRequests(mockRequests);
      setLoading(false);
    }, 800);
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...requests];

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(req => req.status === filters.status);
    }

    // Filter by teacher ID
    if (filters.teacherId.trim()) {
      filtered = filtered.filter(req =>
        req.teacherId.toLowerCase().includes(filters.teacherId.toLowerCase()),
      );
    }

    // Filter by search term
    if (filters.searchTerm.trim()) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        req =>
          req.teacherName.toLowerCase().includes(searchLower) ||
          req.resourceType.toLowerCase().includes(searchLower) ||
          req.description.toLowerCase().includes(searchLower),
      );
    }

    setFilteredRequests(filtered);
  }, [filters, requests]);

  const handleApprove = requestId => {
    setRequests(prev =>
      prev.map(req => (req.id === requestId ? { ...req, status: 'approved' } : req)),
    );
  };

  const handleDeny = requestId => {
    setRequests(prev =>
      prev.map(req => (req.id === requestId ? { ...req, status: 'denied' } : req)),
    );
  };

  const getStatusBadge = status => {
    const statusColors = {
      pending: 'warning',
      approved: 'success',
      denied: 'danger',
    };
    return (
      <Badge color={statusColors[status] || 'secondary'} className={styles.statusBadge}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getPriorityBadge = priority => {
    const priorityColors = {
      high: 'danger',
      medium: 'warning',
      low: 'info',
    };
    return (
      <Badge color={priorityColors[priority] || 'secondary'} className={styles.priorityBadge}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner color="primary" />
        <p>Loading resource requests...</p>
      </div>
    );
  }

  return (
    <div className={styles.tabPanel}>
      {/* Filters */}
      <div className={styles.filtersContainer}>
        <div className={styles.filterRow}>
          <div className={styles.filterItem}>
            <label className={styles.filterLabel} htmlFor="request-status-filter">
              Status:
            </label>
            <Input
              id="request-status-filter"
              type="select"
              value={filters.status}
              onChange={e => setFilters({ ...filters, status: e.target.value })}
              className={styles.filterInput}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="denied">Denied</option>
            </Input>
          </div>

          <div className={styles.filterItem}>
            <label className={styles.filterLabel} htmlFor="request-teacher-filter">
              Teacher ID:
            </label>
            <Input
              id="request-teacher-filter"
              type="text"
              placeholder="Search by Teacher ID"
              value={filters.teacherId}
              onChange={e => setFilters({ ...filters, teacherId: e.target.value })}
              className={styles.filterInput}
            />
          </div>

          <div className={styles.filterItem}>
            <label className={styles.filterLabel} htmlFor="request-search-filter">
              Search:
            </label>
            <Input
              id="request-search-filter"
              type="text"
              placeholder="Search requests..."
              value={filters.searchTerm}
              onChange={e => setFilters({ ...filters, searchTerm: e.target.value })}
              className={styles.filterInput}
            />
          </div>

          <Button
            color="secondary"
            onClick={() => setFilters({ status: 'all', teacherId: '', searchTerm: '' })}
            className={styles.clearFiltersBtn}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className={styles.resultsInfo}>
        <p>
          Showing <strong>{filteredRequests.length}</strong> of <strong>{requests.length}</strong>{' '}
          requests
        </p>
      </div>

      {/* Requests Table */}
      <div className={styles.tableContainer}>
        <Table
          responsive
          striped
          className={`${styles.resourceTable} ${darkMode ? styles.resourceTableDark : ''}`}
        >
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Teacher ID</th>
              <th>Teacher Name</th>
              <th>Resource Type</th>
              <th>Quantity</th>
              <th>Description</th>
              <th>Request Date</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan="10" className={styles.noResults}>
                  No resource requests found matching the filters.
                </td>
              </tr>
            ) : (
              filteredRequests.map(request => (
                <tr key={request.id}>
                  <td className={styles.requestId}>{request.id}</td>
                  <td>{request.teacherId}</td>
                  <td>{request.teacherName}</td>
                  <td>{request.resourceType}</td>
                  <td>{request.quantity}</td>
                  <td className={styles.description}>{request.description}</td>
                  <td>{new Date(request.requestDate).toLocaleDateString()}</td>
                  <td>{getPriorityBadge(request.priority)}</td>
                  <td>{getStatusBadge(request.status)}</td>
                  <td className={styles.actionsCell}>
                    {request.status === 'pending' ? (
                      <div className={styles.actionButtons}>
                        <Button
                          color="success"
                          size="sm"
                          onClick={() => handleApprove(request.id)}
                          className={styles.approveBtn}
                        >
                          ✓ Approve
                        </Button>
                        <Button
                          color="danger"
                          size="sm"
                          onClick={() => handleDeny(request.id)}
                          className={styles.denyBtn}
                        >
                          ✗ Deny
                        </Button>
                      </div>
                    ) : (
                      <span className={styles.statusText}>—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

export default ResourceRequestsTab;
