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
import './StatsChips.css';
import './ButtonStyles.css';

const EmailBatchDashboard = () => {
  const dispatch = useDispatch();

  // Redux state
  const { batches, dashboardStats, loading, error } = useSelector(state => state.emailBatches);

  // Local state
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showBatchDetails, setShowBatchDetails] = useState(false);
  const [batchItems, setBatchItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [previewBatch, setPreviewBatch] = useState(null);
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
    refreshInterval: 60000, // 1 minutes
    backgroundSync: false,
    syncError: null,
    countdown: 60, // 1 minutes in seconds
  });

  // Refs for cleanup
  const refreshIntervalRef = useRef(null);
  const backgroundSyncRef = useRef(null);
  const isRefreshingRef = useRef(false);
  const countdownIntervalRef = useRef(null);

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

  // Countdown timer for auto-refresh
  useEffect(() => {
    if (refreshState.autoRefresh) {
      // Start countdown timer
      countdownIntervalRef.current = setInterval(() => {
        setRefreshState(prev => ({
          ...prev,
          countdown: prev.countdown > 0 ? prev.countdown - 1 : 60,
        }));
      }, 1000);
    } else {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [refreshState.autoRefresh]);

  // Reset countdown when refresh happens
  useEffect(() => {
    if (refreshState.lastRefresh) {
      setRefreshState(prev => ({
        ...prev,
        countdown: 60,
      }));
    }
  }, [refreshState.lastRefresh]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (backgroundSyncRef.current) {
        clearTimeout(backgroundSyncRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
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

  // Apply filters
  const handleApplyFilters = () => {
    // Close the filters modal
    setShowFilters(false);
    // Trigger data refresh with filters
    fetchData(false);
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilters({ status: '', dateFrom: '', dateTo: '' });
    setShowFilters(false);
    // Trigger data refresh without filters
    fetchData(false);
  };

  // Handle retry batch item
  const handleRetryBatchItem = async itemId => {
    try {
      const response = await httpService.post(`/api/email-batches/retry-item/${itemId}`);
      if (response.data.success) {
        toast.success('Batch item retry initiated');
        // Refresh the batch details
        if (selectedBatch) {
          handleViewDetails(selectedBatch);
        }
      }
    } catch (error) {
      console.error('Error retrying batch item:', error);
      toast.error('Failed to retry batch item');
    }
  };

  // Handle view recipients
  const handleViewRecipients = recipients => {
    // Show recipients in a modal or alert
    const recipientList = recipients.map(r => r.email).join(', ');
    alert(`Recipients (${recipients.length}):\n${recipientList}`);
  };

  // Handle preview email
  const handlePreviewEmail = batch => {
    setPreviewBatch(batch);
    setShowEmailPreview(true);
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
    <>
      {/* Header */}
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center mb-4">
        <div className="flex-grow-1 mb-3 mb-lg-0">
          <h2 className="page-title mb-2">Email Batch Dashboard</h2>
          <div className="d-flex flex-column gap-1">
            {refreshState.lastRefresh && (
              <small className="text-muted d-flex align-items-center">
                <FaClock className="mr-1" size={12} />
                Last updated: {refreshState.lastRefresh.toLocaleTimeString()}
              </small>
            )}
            {refreshState.backgroundSync && (
              <small className="text-info d-flex align-items-center">
                <FaSync className="fa-spin mr-1" size={12} />
                Syncing...
              </small>
            )}
            {refreshState.autoRefresh && !refreshState.backgroundSync && (
              <small className="text-muted d-flex align-items-center">
                <FaCheckCircle className="mr-1" size={12} />
                Auto-refreshes in {Math.floor(refreshState.countdown / 60)}:
                {(refreshState.countdown % 60).toString().padStart(2, '0')}
              </small>
            )}
            {refreshState.syncError && (
              <small className="text-danger d-flex align-items-center">
                <FaExclamationTriangle className="mr-1" size={12} />
                Sync error
              </small>
            )}
          </div>
        </div>
        <div className="action-buttons">
          <Button
            color="outline-primary"
            size="sm"
            onClick={handleManualRefresh}
            disabled={refreshState.isRefreshing}
            className="action-btn refresh-btn"
            id="refresh-tooltip"
          >
            {refreshState.isRefreshing ? (
              <FaSync className="fa-spin me-1" />
            ) : (
              <FaRedo className="me-1" />
            )}
            <span className="d-none d-sm-inline">
              {refreshState.isRefreshing ? 'Refreshing...' : 'Refresh'}
            </span>
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
            className="action-btn auto-refresh-btn"
            id="auto-refresh-tooltip"
          >
            {refreshState.autoRefresh ? (
              <FaCheckCircle className="me-1" />
            ) : (
              <FaClock className="me-1" />
            )}
            <span className="d-none d-sm-inline">Auto Refresh</span>
          </Button>
          <Button
            color="outline-secondary"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="action-btn filter-btn"
          >
            <FaFilter className="me-1" />
            <span className="d-none d-sm-inline">Filters</span>
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

      {/* Inline Filters Modal */}
      {showFilters && (
        <div className="position-relative">
          <div className="inline-filters-modal">
            <Card className="shadow-lg border-0" style={{ maxWidth: '350px' }}>
              <CardHeader className="bg-primary text-white py-2">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">
                    <FaFilter className="me-2" />
                    Filters
                  </h6>
                  <Button
                    color="link"
                    className="text-white p-0"
                    onClick={() => setShowFilters(false)}
                    style={{ fontSize: '1.2rem', lineHeight: 1 }}
                  >
                    <FaTimes />
                  </Button>
                </div>
              </CardHeader>
              <CardBody className="p-3">
                <div className="d-flex flex-column gap-3">
                  <FormGroup>
                    <Label className="form-label-sm">Status</Label>
                    <Input
                      type="select"
                      size="sm"
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

                  <FormGroup>
                    <Label className="form-label-sm">Date From</Label>
                    <Input
                      type="date"
                      size="sm"
                      value={filters.dateFrom}
                      onChange={e => handleFilterChange('dateFrom', e.target.value)}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label className="form-label-sm">Date To</Label>
                    <Input
                      type="date"
                      size="sm"
                      value={filters.dateTo}
                      onChange={e => handleFilterChange('dateTo', e.target.value)}
                    />
                  </FormGroup>

                  <div className="d-flex gap-2 pt-2">
                    <Button
                      color="primary"
                      size="sm"
                      onClick={handleApplyFilters}
                      className="flex-fill"
                    >
                      Apply
                    </Button>
                    <Button
                      color="outline-secondary"
                      size="sm"
                      onClick={handleClearFilters}
                      className="flex-fill"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* Stats Chips */}
      <div className="mb-3">
        <div className="stats-chips">
          <div className={`stat-chip ${refreshState.backgroundSync ? 'border-info' : ''}`}>
            <FaEnvelope className="stat-icon text-primary" size={14} />
            <span className="stat-number text-primary">
              {dashboardStats?.overview?.totalBatches || 0}
            </span>
            <span className="stat-label">Total</span>
            {refreshState.backgroundSync && <FaSync className="text-info fa-spin ms-2" size={10} />}
          </div>
          <div className={`stat-chip ${refreshState.backgroundSync ? 'border-info' : ''}`}>
            <FaCheck className="stat-icon text-success" size={14} />
            <span className="stat-number text-success">
              {dashboardStats?.overview?.completedBatches || 0}
            </span>
            <span className="stat-label">Completed</span>
            {refreshState.backgroundSync && <FaSync className="text-info fa-spin ms-2" size={10} />}
          </div>
          <div className={`stat-chip ${refreshState.backgroundSync ? 'border-info' : ''}`}>
            <FaSync className="stat-icon text-info" size={14} />
            <span className="stat-number text-info">
              {dashboardStats?.overview?.processingBatches || 0}
            </span>
            <span className="stat-label">Processing</span>
            {refreshState.backgroundSync && <FaSync className="text-info fa-spin ms-2" size={10} />}
          </div>
          <div className={`stat-chip ${refreshState.backgroundSync ? 'border-info' : ''}`}>
            <FaTimes className="stat-icon text-danger" size={14} />
            <span className="stat-number text-danger">
              {dashboardStats?.overview?.failedBatches || 0}
            </span>
            <span className="stat-label">Failed</span>
            {refreshState.backgroundSync && <FaSync className="text-info fa-spin ms-2" size={10} />}
          </div>
        </div>
      </div>

      {/* Email Stats Chips */}
      <div className="mb-4">
        <div className="stats-chips">
          <div className={`stat-chip ${refreshState.backgroundSync ? 'border-info' : ''}`}>
            <FaEnvelope className="stat-icon text-primary" size={14} />
            <span className="stat-number text-primary">
              {dashboardStats?.emailStats?.totalEmails || 0}
            </span>
            <span className="stat-label">Emails</span>
            {refreshState.backgroundSync && <FaSync className="text-info fa-spin ms-2" size={10} />}
          </div>
          <div className={`stat-chip ${refreshState.backgroundSync ? 'border-info' : ''}`}>
            <FaCheck className="stat-icon text-success" size={14} />
            <span className="stat-number text-success">
              {dashboardStats?.emailStats?.sentEmails || 0}
            </span>
            <span className="stat-label">Sent</span>
            {refreshState.backgroundSync && <FaSync className="text-info fa-spin ms-2" size={10} />}
          </div>
          <div className={`stat-chip ${refreshState.backgroundSync ? 'border-info' : ''}`}>
            <FaUser className="stat-icon text-secondary" size={14} />
            <span className="stat-number text-secondary">
              {dashboardStats?.emailStats?.successRate || 0}%
            </span>
            <span className="stat-label">Success</span>
            {refreshState.backgroundSync && <FaSync className="text-info fa-spin ms-2" size={10} />}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error.batches && (
        <Alert color="danger" className="mb-3">
          {error.batches}
        </Alert>
      )}

      {/* Batches Table */}
      <Card className="shadow-sm mb-4">
        <CardBody className="p-0">
          {batches && batches.length > 0 ? (
            <div className="table-responsive">
              <Table striped hover className="mb-0">
                <thead className="table-dark">
                  <tr>
                    <th className="border-0 py-2 px-3">Email</th>
                    <th className="border-0 py-2 px-3">Status</th>
                    <th className="border-0 py-2 px-3 d-none d-lg-table-cell">Statistics</th>
                    <th className="border-0 py-2 px-3 d-none d-md-table-cell">Timing</th>
                    <th className="border-0 py-2 px-3 d-none d-xl-table-cell">Created By</th>
                    <th className="border-0 py-2 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map(batch => (
                    <tr key={batch._id} className="align-middle">
                      <td className="py-2 px-3">
                        <div className="d-flex flex-column gap-1">
                          <strong className="text-primary">{batch.subject || 'Email Batch'}</strong>
                          <Button
                            size="sm"
                            color="outline-info"
                            onClick={() => handlePreviewEmail(batch)}
                            className="d-flex align-items-center p-1 align-self-start"
                            title="Preview Email"
                          >
                            <FaEye size={12} />
                          </Button>
                          <div className="d-lg-none mt-2">
                            <div className="d-flex flex-column gap-1">
                              <small className="text-primary">
                                <FaEnvelope className="me-1" size={12} />
                                {batch.totalEmails || 0} total
                              </small>
                              <div className="d-flex justify-content-between">
                                <small className="text-success">
                                  <FaCheck className="me-1" size={12} />
                                  {batch.sentEmails || 0} sent
                                </small>
                                <small className="text-danger">
                                  <FaTimes className="me-1" size={12} />
                                  {batch.failedEmails || 0} failed
                                </small>
                              </div>
                              {batch.pendingEmails > 0 && (
                                <small className="text-warning">
                                  <FaClock className="me-1" size={12} />
                                  {batch.pendingEmails} pending
                                </small>
                              )}
                            </div>
                          </div>
                          <div className="d-md-none mt-1">
                            <small className="text-muted">
                              <FaCalendar className="me-1" size={12} />
                              Created: {formatDate(batch.createdAt)}
                            </small>
                          </div>
                          <div className="d-xl-none mt-1">
                            <small className="text-muted">
                              <FaUser className="me-1" size={12} />
                              {batch.createdBy?.firstName && batch.createdBy?.lastName
                                ? `${batch.createdBy.firstName} ${batch.createdBy.lastName}`
                                : batch.createdBy?.firstName || 'System'}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="d-flex align-items-center mb-2">
                          <Badge color={getStatusBadge(batch.status)}>{batch.status}</Badge>
                        </div>
                      </td>
                      <td className="py-2 px-3 d-none d-lg-table-cell">
                        <div className="text-center">
                          <div className="d-flex flex-column gap-1">
                            <small className="text-primary">
                              <FaEnvelope className="me-1" size={12} />
                              {batch.totalEmails || 0} total
                            </small>
                            <small className="text-success">
                              <FaCheck className="me-1" size={12} />
                              {batch.sentEmails || 0} sent
                            </small>
                            <small className="text-danger">
                              <FaTimes className="me-1" size={12} />
                              {batch.failedEmails || 0} failed
                            </small>
                            {batch.pendingEmails > 0 && (
                              <small className="text-warning">
                                <FaClock className="me-1" size={12} />
                                {batch.pendingEmails} pending
                              </small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-3 d-none d-md-table-cell">
                        <div>
                          <small className="text-muted d-block">
                            Created: {formatDate(batch.createdAt)}
                          </small>
                          {batch.startedAt && (
                            <small className="text-info d-block">
                              Started: {formatDate(batch.startedAt)}
                            </small>
                          )}
                          {batch.completedAt && (
                            <small className="text-success d-block">
                              Completed: {formatDate(batch.completedAt)}
                            </small>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-3 d-none d-xl-table-cell">
                        <div>
                          <small className="d-block">
                            {batch.createdBy?.firstName && batch.createdBy?.lastName
                              ? `${batch.createdBy.firstName} ${batch.createdBy.lastName}`
                              : batch.createdBy?.firstName || 'System'}
                          </small>
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <Button
                          size="sm"
                          color="outline-primary"
                          onClick={() => handleViewDetails(batch)}
                          className="d-flex align-items-center"
                        >
                          <FaEye className="me-1" size={12} />
                          <span className="d-none d-sm-inline">View Details</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
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
          className="modal-responsive"
        >
          <ModalHeader toggle={() => setShowBatchDetails(false)}>
            Batch Details: {selectedBatch.name}
          </ModalHeader>
          <ModalBody className="p-4">
            <div className="d-flex flex-column flex-md-row gap-5">
              <div className="flex-fill">
                <Card className="h-100">
                  <CardHeader className="bg-light">
                    <h6 className="mb-0">Batch Information</h6>
                  </CardHeader>
                  <CardBody className="p-3">
                    <div className="d-flex flex-column gap-2">
                      <div>
                        <strong>Batch ID:</strong>
                        <div className="text-primary font-monospace small">
                          {selectedBatch.batchId}
                        </div>
                      </div>
                      <div>
                        <strong>Status:</strong>
                        <div>
                          <Badge color={getStatusBadge(selectedBatch.status)} className="ms-2">
                            {selectedBatch.status}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <strong>Created By:</strong>
                        <div className="text-muted">
                          {selectedBatch.createdBy?.firstName && selectedBatch.createdBy?.lastName
                            ? `${selectedBatch.createdBy.firstName} ${selectedBatch.createdName}`
                            : selectedBatch.createdBy?.firstName || 'System'}
                        </div>
                      </div>
                      <div>
                        <strong>Created:</strong>
                        <div className="text-muted">{formatDate(selectedBatch.createdAt)}</div>
                      </div>
                      {selectedBatch.startedAt && (
                        <div>
                          <strong>Started:</strong>
                          <div className="text-info">{formatDate(selectedBatch.startedAt)}</div>
                        </div>
                      )}
                      {selectedBatch.completedAt && (
                        <div>
                          <strong>Completed:</strong>
                          <div className="text-success">
                            {formatDate(selectedBatch.completedAt)}
                          </div>
                        </div>
                      )}
                      <div>
                        <strong>Last Updated:</strong>
                        <div className="text-muted">{formatDate(selectedBatch.updatedAt)}</div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
              <div className="flex-fill">
                <Card className="h-100">
                  <CardHeader className="bg-light">
                    <h6 className="mb-0">Email Statistics</h6>
                  </CardHeader>
                  <CardBody className="p-3">
                    <div className="d-flex flex-column gap-2">
                      <div className="d-flex justify-content-between">
                        <span>
                          <strong>Total Emails:</strong>
                        </span>
                        <span className="text-primary fw-bold">
                          {selectedBatch.totalEmails || 0}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>
                          <strong>Sent:</strong>
                        </span>
                        <span className="text-success fw-bold">
                          {selectedBatch.sentEmails || 0}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>
                          <strong>Failed:</strong>
                        </span>
                        <span className="text-danger fw-bold">
                          {selectedBatch.failedEmails || 0}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>
                          <strong>Success Rate:</strong>
                        </span>
                        <span className="text-secondary fw-bold">
                          {selectedBatch.totalEmails > 0
                            ? Math.round(
                                (selectedBatch.sentEmails / selectedBatch.totalEmails) * 100,
                              )
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="mt-3">
                        <div className="d-flex justify-content-between mb-1">
                          <small>Progress</small>
                          <small>{selectedBatch.progress || 0}%</small>
                        </div>
                        <Progress
                          value={selectedBatch.progress || 0}
                          color={getStatusBadge(selectedBatch.status)}
                          style={{ height: '8px' }}
                        />
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>

            <hr />

            <Card className="mt-3">
              <CardHeader className="bg-light">
                <h6 className="mb-0">
                  Batch Items ({batchItems.length}) - Up to 50 recipients per item
                </h6>
              </CardHeader>
              <CardBody className="p-0">
                {loadingItems ? (
                  <div className="text-center py-4">
                    <Spinner color="primary" />
                    <p className="mt-2">Loading email items...</p>
                  </div>
                ) : batchItems.length > 0 ? (
                  <div className="table-responsive">
                    <Table striped hover className="mb-0">
                      <thead className="table-dark">
                        <tr>
                          <th className="border-0 py-2 px-3">Batch Item</th>
                          <th className="border-0 py-2 px-3">Status</th>
                          <th className="border-0 py-2 px-3 d-none d-sm-table-cell">Attempts</th>
                          <th className="border-0 py-2 px-3 d-none d-md-table-cell">Timing</th>
                          <th className="border-0 py-2 px-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {batchItems.map((item, index) => (
                          <tr key={index}>
                            <td className="py-2 px-3">
                              <div>
                                <strong className="text-primary d-block">
                                  Batch Item #{index + 1}
                                </strong>
                                <small className="text-muted">
                                  {item.recipients?.length || 0} recipients
                                </small>
                                <div className="d-sm-none mt-1">
                                  <small className="text-muted">
                                    Attempts: {item.attempts || 0}
                                    {item.lastAttemptedAt && (
                                      <span className="ms-2">
                                        Last: {formatDate(item.lastAttemptedAt)}
                                      </span>
                                    )}
                                  </small>
                                </div>
                                <div className="d-md-none mt-1">
                                  <small className="text-muted">
                                    {item.sentAt ? formatDate(item.sentAt) : 'N/A'}
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td className="py-2 px-3">
                              <div className="d-flex align-items-center">
                                {getStatusIcon(item.status)}
                                <Badge color={getStatusBadge(item.status)} className="ms-2">
                                  {item.status}
                                </Badge>
                              </div>
                            </td>
                            <td className="py-2 px-3 d-none d-sm-table-cell">
                              <div className="d-flex flex-column gap-1">
                                <span className="badge bg-info">{item.attempts || 0} attempts</span>
                                {item.lastAttemptedAt && (
                                  <small className="text-muted">
                                    Last: {formatDate(item.lastAttemptedAt)}
                                  </small>
                                )}
                              </div>
                            </td>
                            <td className="py-2 px-3 d-none d-md-table-cell">
                              <div className="d-flex flex-column gap-1">
                                {item.sentAt && (
                                  <small className="text-success">
                                    <FaCheck className="me-1" size={10} />
                                    Sent: {formatDate(item.sentAt)}
                                  </small>
                                )}
                                {item.failedAt && (
                                  <small className="text-danger">
                                    <FaTimes className="me-1" size={10} />
                                    Failed: {formatDate(item.failedAt)}
                                  </small>
                                )}
                                <small className="text-muted">
                                  Created: {formatDate(item.createdAt)}
                                </small>
                              </div>
                            </td>
                            <td className="py-2 px-3">
                              <div className="d-flex flex-column gap-2">
                                <div className="d-flex gap-1">
                                  {(item.status === 'FAILED' || item.status === 'PENDING') && (
                                    <Button
                                      size="sm"
                                      color="warning"
                                      onClick={() => handleRetryBatchItem(item._id)}
                                      className="d-flex align-items-center"
                                    >
                                      <FaRedo size={12} className="me-1" />
                                      <span className="d-none d-sm-inline">Retry</span>
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    color="outline-info"
                                    onClick={() => handleViewRecipients(item.recipients)}
                                    className="d-flex align-items-center"
                                  >
                                    <FaEye size={12} className="me-1" />
                                    <span className="d-none d-sm-inline">View</span>
                                  </Button>
                                </div>
                                {item.error &&
                                  (item.status === 'FAILED' || item.status === 'PENDING') && (
                                    <small className="text-danger" title={item.error}>
                                      {item.error.length > 50
                                        ? `${item.error.substring(0, 50)}...`
                                        : item.error}
                                    </small>
                                  )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <FaEnvelope size={32} className="text-muted mb-2" />
                    <p className="text-muted">No email items found for this batch.</p>
                  </div>
                )}
              </CardBody>
            </Card>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => setShowBatchDetails(false)}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {/* Email Preview Modal */}
      {showEmailPreview && previewBatch && (
        <Modal
          isOpen={showEmailPreview}
          toggle={() => setShowEmailPreview(false)}
          size="lg"
          centered
          className="modal-responsive"
        >
          <ModalHeader toggle={() => setShowEmailPreview(false)}>
            Email Preview: {previewBatch.subject || 'Email Batch'}
          </ModalHeader>
          <ModalBody className="p-4">
            <div className="mb-3">
              <strong>Subject:</strong>
              <div className="text-muted">{previewBatch.subject || 'No subject'}</div>
            </div>
            <div>
              <strong>Email Content:</strong>
              <div
                className="border rounded p-3 bg-light mt-2"
                style={{ maxHeight: '400px', overflow: 'auto' }}
                dangerouslySetInnerHTML={{ __html: previewBatch.htmlContent || 'No content' }}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => setShowEmailPreview(false)}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </>
  );
};

export default EmailBatchDashboard;
