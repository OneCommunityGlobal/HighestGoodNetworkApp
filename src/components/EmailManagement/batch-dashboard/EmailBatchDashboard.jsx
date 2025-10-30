import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchEmails, resendEmail } from '../../../actions/emailBatchActions';
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
  // FaFilter removed
  FaSync,
  FaCheckCircle,
  FaExclamationTriangle,
  FaHistory,
  FaPaperPlane,
} from 'react-icons/fa';
import './EmailBatchDashboard.css';
import './StatsChips.css';
import './ButtonStyles.css';
import AuditTrailModal from './AuditTrailModal';
import ResendEmailModal from './ResendEmailModal';
import WorkerStatus from './WorkerStatus';

const EmailBatchDashboard = () => {
  const dispatch = useDispatch();

  // Redux state
  const { emails, loading, error } = useSelector(state => state.emailBatches);

  // Local state
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showEmailDetails, setShowEmailDetails] = useState(false);
  const [emailBatches, setEmailBatches] = useState([]); // Child EmailBatch items
  const [loadingItems, setLoadingItems] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [previewBatch, setPreviewBatch] = useState(null);
  // Filters removed
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [auditTrailType, setAuditTrailType] = useState('batch');
  const [auditTrailId, setAuditTrailId] = useState(null);
  const [showResendModal, setShowResendModal] = useState(false);
  const [emailToResend, setEmailToResend] = useState(null);

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
        const [emailsResult] = await Promise.allSettled([dispatch(fetchEmails())]);

        // Handle partial failures gracefully
        if (emailsResult.status === 'rejected') {
          console.warn('Failed to fetch emails:', emailsResult.reason);
          if (!isBackground) {
            toast.error('Failed to fetch emails');
          }
        }

        // dashboard stats removed

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
    [dispatch],
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

  // Handle email details
  const handleViewDetails = async email => {
    setSelectedEmail(email);
    setShowEmailDetails(true);
    setLoadingItems(true);

    try {
      const response = await httpService.get(`/api/email-batches/emails/${email._id}`);

      if (response.data.success) {
        setSelectedEmail(response.data.data.email);
        setEmailBatches(response.data.data.batches || []); // Child EmailBatch items
      }
    } catch (error) {
      console.error('Error fetching email details:', error);
      toast.error('Failed to fetch email details');
    } finally {
      setLoadingItems(false);
    }
  };

  // Filter handlers removed

  // Handle retry Email - queues all failed EmailBatch items for retry
  const handleRetryEmail = async emailId => {
    try {
      const response = await httpService.post(`/api/email-batches/emails/${emailId}/retry`);
      if (response.data.success) {
        const message =
          response.data.data.failedItemsRetried > 0
            ? `Queued ${response.data.data.failedItemsRetried} failed batch items for retry. They will be processed shortly.`
            : 'No failed items to retry';
        toast.success(message);

        // Refresh the email details
        if (selectedEmail) {
          handleViewDetails(selectedEmail);
        }

        // Also refresh the main emails list to update status
        await dispatch(fetchEmails());
      }
    } catch (error) {
      console.error('Error retrying Email:', error);
      toast.error('Failed to retry Email');
    }
  };

  // Handle resend email modal
  const handleOpenResendModal = email => {
    setEmailToResend(email);
    setShowResendModal(true);
  };

  const handleCloseResendModal = () => {
    setShowResendModal(false);
    setEmailToResend(null);
  };

  const handleResendEmail = async (emailId, recipientOption, specificRecipients) => {
    try {
      await dispatch(resendEmail(emailId, recipientOption, specificRecipients));
      handleCloseResendModal();
    } catch (error) {
      console.error('Error resending email:', error);
      // Error toast is already shown by the action
    }
  };

  // Handle audit trail
  const handleViewAuditTrail = (id, type = 'email') => {
    setAuditTrailId(id);
    setAuditTrailType(type);
    setShowAuditTrail(true);
  };

  const handleCloseAuditTrail = () => {
    setShowAuditTrail(false);
    setAuditTrailId(null);
    setAuditTrailType('email');
  };

  // Handle view recipients
  const handleViewRecipients = recipients => {
    // Show recipients in a modal or alert
    const recipientList = recipients.map(r => r.email).join(', ');
    alert(`Recipients (${recipients.length}):\n${recipientList}`);
  };

  // Handle preview email
  const handlePreviewEmail = email => {
    setPreviewBatch(email);
    setShowEmailPreview(true);
  };

  // Get status badge color
  const getStatusBadge = status => {
    const colors = {
      QUEUED: 'warning',
      SENDING: 'info',
      SENT: 'success',
      PROCESSED: 'info', // Mixed results - processing finished
      FAILED: 'danger',
      CANCELLED: 'secondary',
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
      QUEUED: <FaClock className="text-warning" />,
      SENDING: <FaClock className="text-info fa-spin" />,
      SENT: <FaCheck className="text-success" />,
      PROCESSED: <FaCheck className="text-info" />, // Mixed results - processing finished
      FAILED: <FaTimes className="text-danger" />,
      CANCELLED: <FaTimes className="text-secondary" />,
    };
    return icons[status] || <FaEnvelope className="text-muted" />;
  };

  // Show initial loading only on first load
  if (loading.emails && !refreshState.lastRefresh) {
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
          <h2 className="page-title mb-2">Email Dashboard</h2>
          <div className="d-flex flex-column gap-1">
            <WorkerStatus />
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
          {/* Auto Refresh button removed */}
          {/* Filters button removed */}
        </div>
      </div>

      {/* Tooltips */}
      <Tooltip target="refresh-tooltip" placement="bottom">
        {refreshState.isRefreshing ? 'Refreshing data...' : 'Manually refresh data'}
      </Tooltip>
      {/* Auto refresh tooltip removed */}

      {/* Filters modal removed */}

      {/* Stats removed */}

      {/* Error Message */}
      {error.emails && (
        <Alert color="danger" className="mb-3">
          {error.emails}
        </Alert>
      )}

      {/* Emails Table */}
      <Card className="shadow-sm mb-4">
        <CardBody className="p-0">
          {emails && emails.length > 0 ? (
            <div className="table-responsive">
              <Table striped hover className="mb-0">
                <thead className="table-dark">
                  <tr>
                    <th className="border-0 py-2 px-3">Email</th>
                    <th className="border-0 py-2 px-3">Status</th>
                    <th className="border-0 py-2 px-3 d-none d-md-table-cell">Timing</th>
                    <th className="border-0 py-2 px-3 d-none d-lg-table-cell">Created By</th>
                    <th className="border-0 py-2 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {emails.map(email => (
                    <tr key={email._id} className="align-middle">
                      <td className="py-2 px-3">
                        <div className="d-flex flex-column gap-1">
                          <strong className="text-primary">{email.subject || 'Email'}</strong>
                          <Button
                            size="sm"
                            color="outline-info"
                            onClick={() => handlePreviewEmail(email)}
                            className="d-flex align-items-center p-1 align-self-start"
                            title="Preview Email"
                          >
                            <FaEye size={12} />
                          </Button>
                          {/* counts removed from compact view */}
                          <div className="d-md-none mt-1">
                            <small className="text-muted">
                              <FaCalendar className="me-1" size={12} />
                              Created: {formatDate(email.createdAt)}
                            </small>
                          </div>
                          <div className="d-lg-none mt-1">
                            <small className="text-muted">
                              <FaUser className="me-1" size={12} />
                              {email.createdBy?.firstName && email.createdBy?.lastName
                                ? `${email.createdBy.firstName} ${email.createdBy.lastName}`
                                : email.createdBy?.firstName || 'System'}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="d-flex align-items-center mb-2">
                          <Badge color={getStatusBadge(email.status)}>{email.status}</Badge>
                        </div>
                      </td>
                      <td className="py-2 px-3 d-none d-md-table-cell">
                        <div>
                          <small className="text-muted d-block">
                            <FaCalendar className="me-1" size={12} />
                            Created: {formatDate(email.createdAt)}
                          </small>
                          {email.startedAt && (
                            <small className="text-info d-block">
                              Started: {formatDate(email.startedAt)}
                            </small>
                          )}
                          {email.completedAt && (
                            <small className="text-success d-block">
                              Completed: {formatDate(email.completedAt)}
                            </small>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-3 d-none d-lg-table-cell">
                        <div>
                          <small className="d-block">
                            {email.createdBy?.firstName && email.createdBy?.lastName
                              ? `${email.createdBy.firstName} ${email.createdBy.lastName}`
                              : email.createdBy?.firstName || 'System'}
                          </small>
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="d-flex gap-2">
                          <Button
                            size="sm"
                            color="outline-primary"
                            onClick={() => handleViewDetails(email)}
                            className="d-flex align-items-center"
                          >
                            <FaEye className="me-1" size={12} />
                            <span className="d-none d-sm-inline">View Details</span>
                          </Button>
                          {(email.status === 'FAILED' || email.status === 'PROCESSED') && (
                            <Button
                              size="sm"
                              color="warning"
                              onClick={() => handleRetryEmail(email._id)}
                              className="d-flex align-items-center"
                              title="Queue failed EmailBatch items for retry"
                            >
                              <FaRedo className="me-1" size={12} />
                              <span className="d-none d-sm-inline">Retry</span>
                            </Button>
                          )}
                          {(email.status === 'SENT' || email.status === 'PROCESSED') && (
                            <Button
                              size="sm"
                              color="info"
                              onClick={() => handleOpenResendModal(email)}
                              className="d-flex align-items-center"
                              title="Resend email to new or same recipients"
                            >
                              <FaPaperPlane className="me-1" size={12} />
                              <span className="d-none d-sm-inline">Resend</span>
                            </Button>
                          )}
                          <Button
                            size="sm"
                            color="outline-secondary"
                            onClick={() => handleViewAuditTrail(email._id, 'email')}
                            className="d-flex align-items-center"
                          >
                            <FaHistory className="me-1" size={12} />
                            <span className="d-none d-sm-inline">Audit</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-5">
              <FaEnvelope size={48} className="text-muted mb-3" />
              <h5 className="text-muted">No Emails Found</h5>
              <p className="text-muted">Send your first email to get started.</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Email Details Modal */}
      {showEmailDetails && selectedEmail && (
        <Modal
          isOpen={showEmailDetails}
          toggle={() => setShowEmailDetails(false)}
          size="lg"
          centered
          className="modal-responsive"
        >
          <ModalHeader toggle={() => setShowEmailDetails(false)}>
            Email Details: {selectedEmail.subject}
          </ModalHeader>
          <ModalBody className="p-4">
            <div className="d-flex flex-column flex-md-row gap-5">
              <div className="flex-fill">
                <Card className="h-100">
                  <CardHeader className="bg-light">
                    <h6 className="mb-0">Email Information</h6>
                  </CardHeader>
                  <CardBody className="p-3">
                    <div className="d-flex flex-column gap-2">
                      <div>
                        <strong>Email ID:</strong>
                        <div className="text-primary font-monospace small">{selectedEmail._id}</div>
                      </div>
                      <div>
                        <strong>Status:</strong>
                        <div>
                          <Badge color={getStatusBadge(selectedEmail.status)} className="ms-2">
                            {selectedEmail.status}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <strong>Created By:</strong>
                        <div className="text-muted">
                          {selectedEmail.createdBy?.firstName && selectedEmail.createdBy?.lastName
                            ? `${selectedEmail.createdBy.firstName} ${selectedEmail.createdBy.lastName}`
                            : selectedEmail.createdBy?.firstName || 'System'}
                        </div>
                      </div>
                      <div>
                        <strong>Created:</strong>
                        <div className="text-muted">{formatDate(selectedEmail.createdAt)}</div>
                      </div>
                      {selectedEmail.startedAt && (
                        <div>
                          <strong>Started:</strong>
                          <div className="text-info">{formatDate(selectedEmail.startedAt)}</div>
                        </div>
                      )}
                      {selectedEmail.completedAt && (
                        <div>
                          <strong>Completed:</strong>
                          <div className="text-success">
                            {formatDate(selectedEmail.completedAt)}
                          </div>
                        </div>
                      )}
                      <div>
                        <strong>Last Updated:</strong>
                        <div className="text-muted">{formatDate(selectedEmail.updatedAt)}</div>
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
                          {selectedEmail.totalEmails || 0}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>
                          <strong>Sent:</strong>
                        </span>
                        <span className="text-success fw-bold">
                          {selectedEmail.sentEmails || 0}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>
                          <strong>Failed:</strong>
                        </span>
                        <span className="text-danger fw-bold">
                          {selectedEmail.failedEmails || 0}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>
                          <strong>Success Rate:</strong>
                        </span>
                        <span className="text-secondary fw-bold">
                          {selectedEmail.totalEmails > 0
                            ? Math.round(
                                (selectedEmail.sentEmails / selectedEmail.totalEmails) * 100,
                              )
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="mt-3">
                        <div className="d-flex justify-content-between mb-1">
                          <small>Progress</small>
                          <small>{selectedEmail.progress || 0}%</small>
                        </div>
                        <Progress
                          value={selectedEmail.progress || 0}
                          color={getStatusBadge(selectedEmail.status)}
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
                  Email Batches ({emailBatches.length}) - Up to 1000 recipients per batch
                </h6>
              </CardHeader>
              <CardBody className="p-0">
                {loadingItems ? (
                  <div className="text-center py-4">
                    <Spinner color="primary" />
                    <p className="mt-2">Loading email items...</p>
                  </div>
                ) : emailBatches.length > 0 ? (
                  <div className="table-responsive">
                    <Table striped hover className="mb-0">
                      <thead className="table-dark">
                        <tr>
                          <th className="border-0 py-2 px-3">Email Batch</th>
                          <th className="border-0 py-2 px-3">Status</th>
                          <th className="border-0 py-2 px-3 d-none d-sm-table-cell">Attempts</th>
                          <th className="border-0 py-2 px-3 d-none d-md-table-cell">Timing</th>
                          <th className="border-0 py-2 px-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {emailBatches.map((item, index) => (
                          <tr key={index}>
                            <td className="py-2 px-3">
                              <div>
                                <strong className="text-primary d-block">
                                  Email Batch #{index + 1}
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
                                  <Button
                                    size="sm"
                                    color="outline-info"
                                    onClick={() => handleViewRecipients(item.recipients)}
                                    className="d-flex align-items-center"
                                  >
                                    <FaEye size={12} className="me-1" />
                                    <span className="d-none d-sm-inline">View</span>
                                  </Button>
                                  <Button
                                    size="sm"
                                    color="outline-secondary"
                                    onClick={() => handleViewAuditTrail(item._id, 'emailBatch')}
                                    className="d-flex align-items-center"
                                  >
                                    <FaHistory size={12} className="me-1" />
                                    <span className="d-none d-sm-inline">Audit</span>
                                  </Button>
                                </div>
                                {item.error &&
                                  (item.status === 'FAILED' || item.status === 'QUEUED') && (
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
                    <p className="text-muted">No email batches found for this email.</p>
                  </div>
                )}
              </CardBody>
            </Card>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => setShowEmailDetails(false)}>
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
            Email Preview: {previewBatch.subject || 'Email'}
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

      {/* Audit Trail Modal */}
      <AuditTrailModal
        isOpen={showAuditTrail}
        toggle={handleCloseAuditTrail}
        emailId={auditTrailType === 'email' ? auditTrailId : null}
        emailBatchId={auditTrailType === 'emailBatch' ? auditTrailId : null}
        type={auditTrailType}
      />

      {/* Resend Email Modal */}
      <ResendEmailModal
        isOpen={showResendModal}
        toggle={handleCloseResendModal}
        email={emailToResend}
        onResend={handleResendEmail}
      />
    </>
  );
};

export default EmailBatchDashboard;
