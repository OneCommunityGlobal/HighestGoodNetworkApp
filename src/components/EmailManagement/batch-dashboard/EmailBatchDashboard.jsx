import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchBatches, fetchDashboardStats } from '../../../actions/emailBatchActions';
import httpService from '../../../services/httpService';
import {
  Card,
  CardBody,
  CardHeader,
  Table,
  Button,
  Badge,
  Spinner,
  Row,
  Col,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Progress,
  Alert,
  Input,
  FormGroup,
  Label,
  Tooltip,
} from 'reactstrap';
import {
  FaRedo,
  FaEye,
  FaClock,
  FaCheck,
  FaTimes,
  FaEnvelope,
  FaUser,
  FaCalendar,
  FaFilter,
  FaSync,
  FaCheckCircle,
  FaExclamationTriangle,
} from 'react-icons/fa';
import './EmailBatchDashboard.css';

const EmailBatchDashboard = () => {
  const dispatch = useDispatch();

  // Redux state
  const { batches, dashboardStats, loading, error } = useSelector(state => state.emailBatches);

  // Local state
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showBatchDetails, setShowBatchDetails] = useState(false);
  const [batchItems, setBatchItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Dynamic refresh state
  const [refreshState, setRefreshState] = useState({
    isRefreshing: false,
    lastRefresh: null,
    autoRefresh: true,
    refreshInterval: 120000, // 2 minutes
    backgroundSync: false,
    syncError: null,
  });

  // Refs for cleanup
  const refreshIntervalRef = useRef(null);
  const backgroundSyncRef = useRef(null);
  const isRefreshingRef = useRef(false);

  // Dynamic data fetching with optimistic updates
  const fetchData = useCallback(
    async (isBackground = false) => {
      if (isBackground && isRefreshingRef.current) {
        return; // Prevent multiple simultaneous requests
      }

      try {
        isRefreshingRef.current = !isBackground;
        setRefreshState(prev => ({
          ...prev,
          isRefreshing: !isBackground,
          backgroundSync: isBackground,
          syncError: null,
        }));

        // Fetch data in parallel for better performance
        const [batchesResult, statsResult] = await Promise.allSettled([
          dispatch(fetchBatches(filters)),
          dispatch(fetchDashboardStats()),
        ]);

        // Handle partial failures gracefully
        if (batchesResult.status === 'rejected') {
          console.warn('Failed to fetch batches:', batchesResult.reason);
          if (!isBackground) {
            toast.error('Failed to fetch batches');
          }
        }

        if (statsResult.status === 'rejected') {
          console.warn('Failed to fetch dashboard stats:', statsResult.reason);
          if (!isBackground) {
            toast.error('Failed to fetch dashboard statistics');
          }
        }

        isRefreshingRef.current = false;
        setRefreshState(prev => ({
          ...prev,
          isRefreshing: false,
          backgroundSync: false,
          lastRefresh: new Date(),
          syncError: null,
        }));
      } catch (err) {
        console.error('Error fetching data:', err);
        isRefreshingRef.current = false;
        setRefreshState(prev => ({
          ...prev,
          isRefreshing: false,
          backgroundSync: false,
          syncError: err.message,
        }));

        if (!isBackground) {
          toast.error('Failed to fetch data');
        }
      }
    },
    [dispatch, filters],
  );

  // Manual refresh with user feedback
  const handleManualRefresh = useCallback(async () => {
    if (isRefreshingRef.current) {
      toast.info('Refresh already in progress');
      return;
    }

    toast.info('Refreshing data...', { autoClose: 1000 });
    await fetchData(false);
  }, [fetchData]);

  // Background sync for auto-refresh
  const startBackgroundSync = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    refreshIntervalRef.current = setInterval(() => {
      if (refreshState.autoRefresh && !isRefreshingRef.current) {
        console.log('🔄 Auto-refresh triggered at:', new Date().toLocaleTimeString());
        fetchData(true); // Background sync
      }
    }, refreshState.refreshInterval);
  }, [fetchData, refreshState.autoRefresh, refreshState.refreshInterval]);

  // Initial load
  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  // Auto-refresh setup
  useEffect(() => {
    if (refreshState.autoRefresh) {
      startBackgroundSync();
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [refreshState.autoRefresh, startBackgroundSync]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (backgroundSyncRef.current) {
        clearTimeout(backgroundSyncRef.current);
      }
    };
  }, []);

  // Handle batch details
  const handleViewDetails = async batch => {
    setSelectedBatch(batch);
    setShowBatchDetails(true);
    setLoadingItems(true);

    try {
      const response = await httpService.get(`/api/email-batches/batches/${batch.batchId}`);

      if (response.data.success) {
        console.log('📊 Batch details received:', response.data.data);
        setSelectedBatch(response.data.data.batch);
        setBatchItems(response.data.data.items || []);
      }
    } catch (error) {
      console.error('Error fetching batch details:', error);
      toast.error('Failed to fetch batch details');
    } finally {
      setLoadingItems(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Get status badge color
  const getStatusBadge = status => {
    const colors = {
      PENDING: 'warning',
      PROCESSING: 'info',
      COMPLETED: 'success',
      FAILED: 'danger',
    };
    return colors[status] || 'secondary';
  };

  // Format date
  const formatDate = dateString => {
    return new Date(dateString).toLocaleString();
  };

  // Get status icon
  const getStatusIcon = status => {
    const icons = {
      PENDING: <FaClock className="text-warning" />,
      PROCESSING: <FaClock className="text-info fa-spin" />,
      SENT: <FaCheck className="text-success" />,
      FAILED: <FaTimes className="text-danger" />,
    };
    return icons[status] || <FaEnvelope className="text-muted" />;
  };

  // Show initial loading only on first load
  if (loading.batches && !refreshState.lastRefresh) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <Spinner color="primary" />
        <span className="ms-2">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="email-batch-dashboard">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="page-title">Email Batch Dashboard</h2>
          <div className="d-flex align-items-center gap-3">
            <small className="text-muted">Track and monitor email batches</small>
            {refreshState.lastRefresh && (
              <small className="text-muted">
                Last updated: {refreshState.lastRefresh.toLocaleTimeString()}
              </small>
            )}
            {refreshState.backgroundSync && (
              <small className="text-info">
                <FaSync className="fa-spin me-1" />
                Syncing...
              </small>
            )}
            {refreshState.autoRefresh && !refreshState.backgroundSync && (
              <small className="text-muted">Auto-refresh: 2 min</small>
            )}
            {refreshState.syncError && (
              <small className="text-danger">
                <FaExclamationTriangle className="me-1" />
                Sync error
              </small>
            )}
          </div>
        </div>
        <div className="d-flex gap-2">
          <Button
            color="outline-primary"
            size="sm"
            onClick={handleManualRefresh}
            disabled={refreshState.isRefreshing}
            id="refresh-tooltip"
          >
            {refreshState.isRefreshing ? (
              <FaSync className="fa-spin me-1" />
            ) : (
              <FaRedo className="me-1" />
            )}
            {refreshState.isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button
            color={refreshState.autoRefresh ? 'success' : 'outline-secondary'}
            size="sm"
            onClick={() =>
              setRefreshState(prev => ({
                ...prev,
                autoRefresh: !prev.autoRefresh,
              }))
            }
            id="auto-refresh-tooltip"
          >
            {refreshState.autoRefresh ? (
              <FaCheckCircle className="me-1" />
            ) : (
              <FaClock className="me-1" />
            )}
            Auto Refresh
          </Button>
          <Button color="outline-secondary" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <FaFilter className="me-1" />
            Filters
          </Button>
        </div>
      </div>

      {/* Tooltips */}
      <Tooltip target="refresh-tooltip" placement="bottom">
        {refreshState.isRefreshing ? 'Refreshing data...' : 'Manually refresh data'}
      </Tooltip>
      <Tooltip target="auto-refresh-tooltip" placement="bottom">
        {refreshState.autoRefresh ? 'Auto-refresh enabled (2 min)' : 'Enable auto-refresh'}
      </Tooltip>

      {/* Filters */}
      {showFilters && (
        <Card className="mb-4">
          <CardHeader>
            <h6 className="mb-0">
              <FaFilter className="me-2" />
              Filters
            </h6>
          </CardHeader>
          <CardBody>
            <Row>
              <Col md={3}>
                <FormGroup>
                  <Label>Status</Label>
                  <Input
                    type="select"
                    value={filters.status}
                    onChange={e => handleFilterChange('status', e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="FAILED">Failed</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md={3}>
                <FormGroup>
                  <Label>Date From</Label>
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={e => handleFilterChange('dateFrom', e.target.value)}
                  />
                </FormGroup>
              </Col>
              <Col md={3}>
                <FormGroup>
                  <Label>Date To</Label>
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={e => handleFilterChange('dateTo', e.target.value)}
                  />
                </FormGroup>
              </Col>
              <Col md={3} className="d-flex align-items-end">
                <Button
                  color="outline-secondary"
                  onClick={() => setFilters({ status: '', dateFrom: '', dateTo: '' })}
                >
                  Clear Filters
                </Button>
              </Col>
            </Row>
          </CardBody>
        </Card>
      )}

      {/* Stats Cards */}
      {dashboardStats && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className={`text-center ${refreshState.backgroundSync ? 'border-info' : ''}`}>
              <CardBody>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="text-primary mb-0">
                    {dashboardStats.overview?.totalBatches || 0}
                  </h5>
                  {refreshState.backgroundSync && (
                    <FaSync className="text-info fa-spin" size={12} />
                  )}
                </div>
                <small className="text-muted">Total Batches</small>
              </CardBody>
            </Card>
          </Col>
          <Col md={3}>
            <Card className={`text-center ${refreshState.backgroundSync ? 'border-info' : ''}`}>
              <CardBody>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="text-success mb-0">
                    {dashboardStats.overview?.completedBatches || 0}
                  </h5>
                  {refreshState.backgroundSync && (
                    <FaSync className="text-info fa-spin" size={12} />
                  )}
                </div>
                <small className="text-muted">Completed</small>
              </CardBody>
            </Card>
          </Col>
          <Col md={3}>
            <Card className={`text-center ${refreshState.backgroundSync ? 'border-info' : ''}`}>
              <CardBody>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="text-info mb-0">
                    {dashboardStats.overview?.processingBatches || 0}
                  </h5>
                  {refreshState.backgroundSync && (
                    <FaSync className="text-info fa-spin" size={12} />
                  )}
                </div>
                <small className="text-muted">Processing</small>
              </CardBody>
            </Card>
          </Col>
          <Col md={3}>
            <Card className={`text-center ${refreshState.backgroundSync ? 'border-info' : ''}`}>
              <CardBody>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="text-danger mb-0">
                    {dashboardStats.overview?.failedBatches || 0}
                  </h5>
                  {refreshState.backgroundSync && (
                    <FaSync className="text-info fa-spin" size={12} />
                  )}
                </div>
                <small className="text-muted">Failed</small>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}

      {/* Email Stats */}
      {dashboardStats && (
        <Row className="mb-4">
          <Col md={4}>
            <Card className={`text-center ${refreshState.backgroundSync ? 'border-info' : ''}`}>
              <CardBody>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="text-primary mb-0">
                    {dashboardStats.emailStats?.totalEmails || 0}
                  </h5>
                  {refreshState.backgroundSync && (
                    <FaSync className="text-info fa-spin" size={12} />
                  )}
                </div>
                <small className="text-muted">Total Emails</small>
              </CardBody>
            </Card>
          </Col>
          <Col md={4}>
            <Card className={`text-center ${refreshState.backgroundSync ? 'border-info' : ''}`}>
              <CardBody>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="text-success mb-0">
                    {dashboardStats.emailStats?.sentEmails || 0}
                  </h5>
                  {refreshState.backgroundSync && (
                    <FaSync className="text-info fa-spin" size={12} />
                  )}
                </div>
                <small className="text-muted">Sent</small>
              </CardBody>
            </Card>
          </Col>
          <Col md={4}>
            <Card className={`text-center ${refreshState.backgroundSync ? 'border-info' : ''}`}>
              <CardBody>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="text-secondary mb-0">
                    {dashboardStats.emailStats?.successRate || 0}%
                  </h5>
                  {refreshState.backgroundSync && (
                    <FaSync className="text-info fa-spin" size={12} />
                  )}
                </div>
                <small className="text-muted">Success Rate</small>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}

      {/* Error Message */}
      {error.batches && (
        <Alert color="danger" className="mb-4">
          {error.batches}
        </Alert>
      )}

      {/* Batches Table */}
      <Card>
        <CardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <h5 className="mb-0 me-2">Email Batches</h5>
              {refreshState.backgroundSync && <FaSync className="text-info fa-spin" size={14} />}
            </div>
            <div className="d-flex align-items-center gap-2">
              <small className="text-muted">Showing {batches?.length || 0} batches</small>
              {refreshState.lastRefresh && (
                <small className="text-muted">
                  • Updated {refreshState.lastRefresh.toLocaleTimeString()}
                </small>
              )}
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {batches && batches.length > 0 ? (
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Batch Details</th>
                  <th>Status & Progress</th>
                  <th>Email Statistics</th>
                  <th>Timing</th>
                  <th>Created By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {batches.map(batch => (
                  <tr key={batch._id}>
                    <td>
                      <div>
                        <strong>{batch.name}</strong>
                        <br />
                        <small className="text-muted">{batch.subject}</small>
                        <br />
                        <small className="text-info">
                          <FaEnvelope className="me-1" />
                          {batch.totalEmails || 0} total emails
                        </small>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center mb-2">
                        {getStatusIcon(batch.status)}
                        <Badge color={getStatusBadge(batch.status)} className="ms-2">
                          {batch.status}
                        </Badge>
                      </div>
                      <div className="d-flex align-items-center">
                        <div className="progress me-2" style={{ width: '120px', height: '8px' }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ width: `${batch.progress || 0}%` }}
                          />
                        </div>
                        <small>{batch.progress || 0}%</small>
                      </div>
                    </td>
                    <td>
                      <div className="text-center">
                        <div className="d-flex justify-content-between">
                          <small className="text-success">
                            <FaCheck className="me-1" />
                            {batch.sentEmails || 0}
                          </small>
                          <small className="text-danger">
                            <FaTimes className="me-1" />
                            {batch.failedEmails || 0}
                          </small>
                        </div>
                        <small className="text-muted">
                          Success:{' '}
                          {batch.totalEmails > 0
                            ? Math.round((batch.sentEmails / batch.totalEmails) * 100)
                            : 0}
                          %
                        </small>
                      </div>
                    </td>
                    <td>
                      <div>
                        <small className="text-muted">
                          <FaCalendar className="me-1" />
                          Created: {formatDate(batch.createdAt)}
                        </small>
                        {batch.startedAt && (
                          <>
                            <br />
                            <small className="text-info">
                              Started: {formatDate(batch.startedAt)}
                            </small>
                          </>
                        )}
                        {batch.completedAt && (
                          <>
                            <br />
                            <small className="text-success">
                              Completed: {formatDate(batch.completedAt)}
                            </small>
                          </>
                        )}
                      </div>
                    </td>
                    <td>
                      <div>
                        <small>
                          <FaUser className="me-1" />
                          {batch.createdByName}
                        </small>
                        <br />
                        <small className="text-muted">{batch.createdByEmail}</small>
                      </div>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        color="outline-primary"
                        onClick={() => handleViewDetails(batch)}
                        className="w-100"
                      >
                        <FaEye className="me-1" />
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center py-5">
              <FaEnvelope size={48} className="text-muted mb-3" />
              <h5 className="text-muted">No Email Batches Found</h5>
              <p className="text-muted">Create your first email batch to get started.</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Batch Details Modal */}
      {showBatchDetails && selectedBatch && (
        <Modal
          isOpen={showBatchDetails}
          toggle={() => setShowBatchDetails(false)}
          size="lg"
          centered
        >
          <ModalHeader toggle={() => setShowBatchDetails(false)}>
            Batch Details: {selectedBatch.name}
          </ModalHeader>
          <ModalBody>
            <Row>
              <Col md={6}>
                <h6>Batch Information</h6>
                <p>
                  <strong>Name:</strong> {selectedBatch.name}
                </p>
                <p>
                  <strong>Status:</strong>{' '}
                  <Badge color={getStatusBadge(selectedBatch.status)}>{selectedBatch.status}</Badge>
                </p>
                <p>
                  <strong>Subject:</strong> {selectedBatch.subject}
                </p>
                <p>
                  <strong>Created:</strong> {formatDate(selectedBatch.createdAt)}
                </p>
                {selectedBatch.startedAt && (
                  <p>
                    <strong>Started:</strong> {formatDate(selectedBatch.startedAt)}
                  </p>
                )}
                {selectedBatch.completedAt && (
                  <p>
                    <strong>Completed:</strong> {formatDate(selectedBatch.completedAt)}
                  </p>
                )}
              </Col>
              <Col md={6}>
                <h6>Email Statistics</h6>
                <p>
                  <strong>Total Emails:</strong> {selectedBatch.totalEmails || 0}
                </p>
                <p>
                  <strong>Sent:</strong> {selectedBatch.sentEmails || 0}
                </p>
                <p>
                  <strong>Failed:</strong> {selectedBatch.failedEmails || 0}
                </p>
                <p>
                  <strong>Success Rate:</strong>{' '}
                  {selectedBatch.totalEmails > 0
                    ? Math.round((selectedBatch.sentEmails / selectedBatch.totalEmails) * 100)
                    : 0}
                  %
                </p>
                <div className="mt-3">
                  <Progress
                    value={selectedBatch.progress || 0}
                    color={getStatusBadge(selectedBatch.status)}
                  >
                    {selectedBatch.progress || 0}%
                  </Progress>
                </div>
              </Col>
            </Row>

            <hr />

            <h6>Email Items</h6>
            {loadingItems ? (
              <div className="text-center">
                <Spinner color="primary" />
                <p>Loading email items...</p>
              </div>
            ) : batchItems.length > 0 ? (
              <Table responsive striped size="sm">
                <thead>
                  <tr>
                    <th>Recipient</th>
                    <th>Status</th>
                    <th>Attempts</th>
                    <th>Sent At</th>
                    <th>Error</th>
                  </tr>
                </thead>
                <tbody>
                  {batchItems.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <div>
                          <strong>{item.recipientEmail}</strong>
                          {item.recipientName && (
                            <>
                              <br />
                              <small className="text-muted">{item.recipientName}</small>
                            </>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          {getStatusIcon(item.status)}
                          <Badge color={getStatusBadge(item.status)} className="ms-2">
                            {item.status}
                          </Badge>
                        </div>
                      </td>
                      <td>{item.attempts || 0}</td>
                      <td>
                        <small>{item.sentAt ? formatDate(item.sentAt) : 'N/A'}</small>
                      </td>
                      <td>{item.error && <small className="text-danger">{item.error}</small>}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted">No email items found for this batch.</p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => setShowBatchDetails(false)}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
};

export default EmailBatchDashboard;
