import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import DOMPurify from 'dompurify';
import { fetchEmails, resendEmail } from '../../../actions/emailOutboxActions';
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
  Alert,
  Input,
  FormGroup,
  Label,
  Tooltip,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
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
  FaSync,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPaperPlane,
  FaEllipsisV,
  FaCog,
} from 'react-icons/fa';
import './EmailOutbox.css';
import './ButtonStyles.css';
import '../EmailManagementShared.css';
import ResendEmailModal from './ResendEmailModal';

const EmailOutbox = () => {
  const dispatch = useDispatch();

  // Redux state - updated to use emailOutbox
  const { emails, loading, error } = useSelector(state => state.emailOutbox);
  const currentUser = useSelector(state => state.auth?.user);

  // Local state
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showEmailDetails, setShowEmailDetails] = useState(false);
  const [emailBatches, setEmailBatches] = useState([]); // Child EmailBatch items
  const [loadingItems, setLoadingItems] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [previewBatch, setPreviewBatch] = useState(null);
  const [showResendModal, setShowResendModal] = useState(false);
  const [emailToResend, setEmailToResend] = useState(null);
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);
  const [processingPending, setProcessingPending] = useState(false);
  const [statusFilter, setStatusFilter] = useState(null); // null means show all

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
          // eslint-disable-next-line no-console
          console.warn('Failed to fetch emails:', emailsResult.reason);
          if (!isBackground) {
            toast.error('Failed to fetch emails');
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
        // eslint-disable-next-line no-console
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

  // Process pending and stuck emails - IMPROVED VERSION
  const handleProcessPendingEmails = useCallback(async () => {
    if (processingPending) {
      toast.info('Processing already in progress');
      return;
    }

    // Only count PENDING emails (stuck ones), NOT failed
    const pendingCount = emails?.filter(e => e.status === 'PENDING').length || 0;

    // If no pending emails, show info message and return
    if (pendingCount === 0) {
      toast.info('There are no pending or stuck emails to process.');
      return;
    }

    try {
      setProcessingPending(true);
      toast.info(
        `Processing ${pendingCount} pending/stuck email${pendingCount > 1 ? 's' : ''}...`,
        {
          autoClose: 2000,
        },
      );

      const response = await httpService.post('/api/process-pending-and-stuck-emails', {
        requestor: {
          requestorId: currentUser?.userid,
          role: currentUser?.role,
        },
      });

      if (response.data.success) {
        // Check if any emails were actually processed
        const processedCount = response.data.processedCount || pendingCount;

        if (processedCount > 0) {
          toast.success(
            `Successfully triggered processing of ${processedCount} pending/stuck email${
              processedCount > 1 ? 's' : ''
            }!`,
          );
        } else {
          toast.info('No emails needed processing.');
        }

        // Refresh the email list after processing
        await fetchData(false);
      } else {
        toast.error(response.data.message || 'Failed to process emails');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error processing pending emails:', error);
      toast.error(
        error.response?.data?.message || 'Failed to trigger email processing. Please try again.',
      );
    } finally {
      setProcessingPending(false);
    }
  }, [processingPending, currentUser, fetchData, emails]);

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

  // HOTFIX: Force loading to complete if we have emails
  // This is a temporary fix until the Redux reducer is fixed
  const [localLoading, setLocalLoading] = React.useState(true);

  useEffect(() => {
    if (emails && emails.length >= 0) {
      setLocalLoading(false);
    }
  }, [emails]);

  // Auto-refresh setup
  useEffect(() => {
    if (refreshState.autoRefresh) {
      startBackgroundSync();
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [refreshState.autoRefresh, startBackgroundSync]);

  // Countdown timer for next refresh
  useEffect(() => {
    if (refreshState.autoRefresh && refreshState.lastRefresh) {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }

      countdownIntervalRef.current = setInterval(() => {
        setRefreshState(prev => {
          const timeElapsed = Math.floor((new Date() - prev.lastRefresh) / 1000);
          const countdown = Math.max(0, Math.floor(prev.refreshInterval / 1000) - timeElapsed);
          return { ...prev, countdown };
        });
      }, 1000);
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [refreshState.autoRefresh, refreshState.lastRefresh, refreshState.refreshInterval]);

  const toggleAutoRefresh = useCallback(() => {
    setRefreshState(prev => ({
      ...prev,
      autoRefresh: !prev.autoRefresh,
      countdown: !prev.autoRefresh ? Math.floor(prev.refreshInterval / 1000) : prev.countdown,
    }));
  }, []);

  // Filter emails based on selected status
  const filteredEmails = statusFilter
    ? emails?.filter(email => email.status === statusFilter)
    : emails;

  // Handle stat card click to filter emails
  const handleFilterClick = status => {
    // If clicking the same filter, clear it (show all)
    setStatusFilter(prevFilter => (prevFilter === status ? null : status));
  };

  const formatDate = date => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  const getUserDisplayName = email => {
    // Schema uses 'createdBy' (camelCase), try that first, then created_by as fallback
    const createdBy = email?.createdBy || email?.created_by;

    if (!createdBy) {
      return 'Unknown';
    }

    // If it's an object with user details, extract the name
    if (typeof createdBy === 'object' && createdBy !== null && !createdBy._bsontype) {
      const firstName = createdBy.firstName || '';
      const lastName = createdBy.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim();

      if (fullName) {
        return fullName;
      }

      // Fallback to email if name is not available
      if (createdBy.email) {
        return createdBy.email;
      }
    }

    // If it's a string (ObjectId), it means populate didn't work
    // Return 'Unknown' instead of showing the ID
    if (typeof createdBy === 'string') {
      return 'Unknown';
    }

    return 'Unknown';
  };

  const getStatusBadge = status => {
    const statusMap = {
      SENT: 'success',
      PENDING: 'warning',
      FAILED: 'danger',
      PROCESSING: 'info',
    };
    return statusMap[status] || 'secondary';
  };

  const getStatusIcon = status => {
    const iconMap = {
      SENT: <FaCheckCircle className="text-success" />,
      PENDING: <FaClock className="text-warning" />,
      FAILED: <FaExclamationTriangle className="text-danger" />,
      PROCESSING: <FaSync className="fa-spin text-info" />,
    };
    return iconMap[status] || <FaClock className="text-muted" />;
  };

  const handleViewDetails = async email => {
    setSelectedEmail(email);
    setShowEmailDetails(true);
    setLoadingItems(true);

    try {
      // Fetch child EmailBatch items
      const response = await httpService.get(`/api/emails/${email._id}/batches`);
      if (response.data.success) {
        setEmailBatches(response.data.emailBatches || []);
      } else {
        toast.error('Failed to fetch email batches');
        setEmailBatches([]);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching email batches:', error);
      toast.error('Failed to fetch email batches');
      setEmailBatches([]);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleViewRecipients = recipients => {
    if (!recipients || recipients.length === 0) {
      toast.info('No recipients found');
      return;
    }

    const recipientList = recipients.join('\n');
    // eslint-disable-next-line no-alert
    alert(`Recipients:\n\n${recipientList}`);
  };

  const handlePreviewEmail = batch => {
    setPreviewBatch(batch);
    setShowEmailPreview(true);
  };

  const handleResendClick = email => {
    setEmailToResend(email);
    setShowResendModal(true);
  };

  const handleResendEmail = async resendData => {
    try {
      await dispatch(resendEmail(emailToResend._id, resendData));
      toast.success('Email resend initiated successfully!');
      setShowResendModal(false);
      setEmailToResend(null);
      // Refresh the list
      await fetchData(false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error resending email:', error);
      toast.error(error.response?.data?.message || 'Failed to resend email. Please try again.');
    }
  };

  const handleCloseResendModal = () => {
    setShowResendModal(false);
    setEmailToResend(null);
  };

  return (
    <>
      <div className="email-outbox-header d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Email Outbox</h3>
        <div className="d-flex align-items-center" style={{ gap: '12px' }}>
          {/* Auto-refresh indicator */}
          {refreshState.autoRefresh && (
            <div className="auto-refresh-indicator d-flex align-items-center px-2 py-1 bg-light rounded">
              <FaSync
                className={refreshState.backgroundSync ? 'fa-spin text-info' : 'text-muted'}
                size={14}
              />
              <small className="ms-2 text-muted" style={{ whiteSpace: 'nowrap' }}>
                Next refresh in {refreshState.countdown}s
              </small>
            </div>
          )}

          {/* Manual Refresh Button */}
          <Button
            color="primary"
            size="sm"
            onClick={handleManualRefresh}
            disabled={refreshState.isRefreshing}
            title="Refresh email list"
            className="d-flex align-items-center"
          >
            <FaRedo className={refreshState.isRefreshing ? 'fa-spin' : ''} size={14} />
            <span className="ms-2 d-none d-md-inline">
              {refreshState.isRefreshing ? 'Refreshing...' : 'Refresh'}
            </span>
          </Button>

          {/* Settings Dropdown */}
          <Dropdown
            isOpen={settingsDropdownOpen}
            toggle={() => setSettingsDropdownOpen(!settingsDropdownOpen)}
          >
            <DropdownToggle color="secondary" size="sm" caret className="d-flex align-items-center">
              <FaCog size={14} />
              <span className="ms-2 d-none d-md-inline">Settings</span>
            </DropdownToggle>
            <DropdownMenu end>
              <DropdownItem header>Refresh Settings</DropdownItem>
              <DropdownItem onClick={toggleAutoRefresh}>
                <div className="d-flex justify-content-between align-items-center">
                  <span>Auto-Refresh</span>
                  <Badge color={refreshState.autoRefresh ? 'success' : 'secondary'}>
                    {refreshState.autoRefresh ? 'ON' : 'OFF'}
                  </Badge>
                </div>
              </DropdownItem>
              <DropdownItem divider />
              <DropdownItem header>Actions</DropdownItem>
              <DropdownItem onClick={handleProcessPendingEmails} disabled={processingPending}>
                <FaPaperPlane className="me-2" />
                {processingPending ? 'Processing...' : 'Process Pending & Stuck'}
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      {/* Sync Error Alert */}
      {refreshState.syncError && (
        <Alert color="warning" className="mb-3">
          <FaExclamationTriangle className="me-2" />
          Background sync failed: {refreshState.syncError}
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert color="danger" className="mb-3">
          <FaExclamationTriangle className="me-2" />
          {typeof error === 'string' ? error : error.message || 'An error occurred'}
        </Alert>
      )}

      {/* Loading State */}
      {localLoading && !refreshState.backgroundSync ? (
        <div className="text-center py-5">
          <Spinner color="primary" />
          <p className="mt-3">Loading emails...</p>
        </div>
      ) : (
        <>
          {/* Email Stats - FIXED ALIGNMENT */}
          <Row className="mb-3">
            <Col md={3}>
              <Card
                className="stat-card"
                style={{
                  cursor: 'pointer',
                  border: statusFilter === null ? '2px solid #007bff' : '1px solid #e9ecef',
                  backgroundColor: statusFilter === null ? '#f8f9fa' : 'white',
                }}
                onClick={() => handleFilterClick(null)}
              >
                <CardBody style={{ padding: '1.25rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      minHeight: '48px',
                    }}
                  >
                    <div
                      style={{
                        flexShrink: 0,
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <FaEnvelope size={32} className="text-primary" style={{ display: 'block' }} />
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          fontSize: '1.75rem',
                          fontWeight: '700',
                          lineHeight: '1.2',
                          marginBottom: '2px',
                          marginTop: 0,
                        }}
                      >
                        {emails?.length || 0}
                      </div>
                      <div
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          lineHeight: '1.2',
                          color: '#6c757d',
                          marginTop: 0,
                          marginBottom: 0,
                        }}
                      >
                        Total Emails
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col md={3}>
              <Card
                className="stat-card"
                style={{
                  cursor: 'pointer',
                  border: statusFilter === 'SENT' ? '2px solid #28a745' : '1px solid #e9ecef',
                  backgroundColor: statusFilter === 'SENT' ? '#f8f9fa' : 'white',
                }}
                onClick={() => handleFilterClick('SENT')}
              >
                <CardBody style={{ padding: '1.25rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      minHeight: '48px',
                    }}
                  >
                    <div
                      style={{
                        flexShrink: 0,
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <FaCheckCircle
                        size={32}
                        className="text-success"
                        style={{ display: 'block' }}
                      />
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          fontSize: '1.75rem',
                          fontWeight: '700',
                          lineHeight: '1.2',
                          marginBottom: '2px',
                          marginTop: 0,
                        }}
                      >
                        {emails?.filter(e => e.status === 'SENT').length || 0}
                      </div>
                      <div
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          lineHeight: '1.2',
                          color: '#6c757d',
                          marginTop: 0,
                          marginBottom: 0,
                        }}
                      >
                        Sent
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col md={3}>
              <Card
                className="stat-card"
                style={{
                  cursor: 'pointer',
                  border: statusFilter === 'PENDING' ? '2px solid #ffc107' : '1px solid #e9ecef',
                  backgroundColor: statusFilter === 'PENDING' ? '#f8f9fa' : 'white',
                }}
                onClick={() => handleFilterClick('PENDING')}
              >
                <CardBody style={{ padding: '1.25rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      minHeight: '48px',
                    }}
                  >
                    <div
                      style={{
                        flexShrink: 0,
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <FaClock size={32} className="text-warning" style={{ display: 'block' }} />
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          fontSize: '1.75rem',
                          fontWeight: '700',
                          lineHeight: '1.2',
                          marginBottom: '2px',
                          marginTop: 0,
                        }}
                      >
                        {emails?.filter(e => e.status === 'PENDING').length || 0}
                      </div>
                      <div
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          lineHeight: '1.2',
                          color: '#6c757d',
                          marginTop: 0,
                          marginBottom: 0,
                        }}
                      >
                        Pending
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col md={3}>
              <Card
                className="stat-card"
                style={{
                  cursor: 'pointer',
                  border: statusFilter === 'FAILED' ? '2px solid #dc3545' : '1px solid #e9ecef',
                  backgroundColor: statusFilter === 'FAILED' ? '#f8f9fa' : 'white',
                }}
                onClick={() => handleFilterClick('FAILED')}
              >
                <CardBody style={{ padding: '1.25rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      minHeight: '48px',
                    }}
                  >
                    <div
                      style={{
                        flexShrink: 0,
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <FaExclamationTriangle
                        size={32}
                        className="text-danger"
                        style={{ display: 'block' }}
                      />
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          fontSize: '1.75rem',
                          fontWeight: '700',
                          lineHeight: '1.2',
                          marginBottom: '2px',
                          marginTop: 0,
                        }}
                      >
                        {emails?.filter(e => e.status === 'FAILED').length || 0}
                      </div>
                      <div
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          lineHeight: '1.2',
                          color: '#6c757d',
                          marginTop: 0,
                          marginBottom: 0,
                        }}
                      >
                        Failed
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Emails Table */}
          <Card>
            <CardHeader className="bg-light">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 d-flex align-items-center" style={{ gap: '8px' }}>
                  <span>Email List</span>
                  {statusFilter && (
                    <Badge
                      color="info"
                      style={{
                        fontSize: '0.75rem',
                        padding: '4px 8px',
                        fontWeight: '500',
                      }}
                    >
                      Filtered by: {statusFilter}
                    </Badge>
                  )}
                </h5>
                {statusFilter && (
                  <Button
                    size="sm"
                    color="link"
                    onClick={() => setStatusFilter(null)}
                    style={{
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                    }}
                  >
                    Clear Filter
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardBody className="p-0">
              {filteredEmails && filteredEmails.length > 0 ? (
                <div className="table-responsive">
                  <Table striped hover className="mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th className="border-0 py-3 px-3">Email Info</th>
                        <th className="border-0 py-3 px-3">Status</th>
                        <th className="border-0 py-3 px-3 d-none d-md-table-cell">Recipients</th>
                        <th className="border-0 py-3 px-3 d-none d-lg-table-cell">Timing</th>
                        <th className="border-0 py-3 px-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmails.map((email, index) => (
                        <tr key={email._id || index}>
                          <td className="py-3 px-3">
                            <div>
                              <strong className="text-primary d-block">{email.subject}</strong>
                              <small className="text-muted d-block">
                                <FaUser size={12} className="me-1" />
                                {getUserDisplayName(email)}
                              </small>
                              <div className="d-md-none mt-1">
                                <small className="text-muted">
                                  Recipients: {email.totalEmails || 0} ({email.sentEmails || 0}{' '}
                                  sent, {email.failedEmails || 0} failed)
                                </small>
                              </div>
                              <div className="d-lg-none mt-1">
                                <small className="text-muted">
                                  <FaCalendar size={10} className="me-1" />
                                  {formatDate(email.createdAt)}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="d-flex align-items-center">
                              {getStatusIcon(email.status)}
                              <Badge color={getStatusBadge(email.status)} className="ms-2">
                                {email.status}
                              </Badge>
                            </div>
                          </td>
                          <td className="py-3 px-3 d-none d-md-table-cell">
                            <div className="d-flex flex-column gap-1">
                              <span className="badge bg-primary">
                                {email.totalEmails || 0} total
                              </span>
                              <small className="text-success">
                                <FaCheck size={10} className="me-1" />
                                {email.sentEmails || 0} sent
                              </small>
                              <small className="text-danger">
                                <FaTimes size={10} className="me-1" />
                                {email.failedEmails || 0} failed
                              </small>
                            </div>
                          </td>
                          <td className="py-3 px-3 d-none d-lg-table-cell">
                            <div className="d-flex flex-column gap-1">
                              <small className="text-muted">
                                <FaCalendar size={10} className="me-1" />
                                Created: {formatDate(email.createdAt)}
                              </small>
                              <small className="text-muted">
                                Updated: {formatDate(email.updatedAt)}
                              </small>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="d-flex flex-column gap-2">
                              <div className="d-flex gap-1 flex-wrap">
                                <Button
                                  size="sm"
                                  color="outline-primary"
                                  onClick={() => handleViewDetails(email)}
                                  className="d-flex align-items-center"
                                  title="View email details and batches"
                                >
                                  <FaEye size={12} className="me-1" />
                                  <span className="d-none d-sm-inline">Details</span>
                                </Button>
                                {email.status === 'FAILED' && (
                                  <Button
                                    size="sm"
                                    color="outline-warning"
                                    onClick={() => handleResendClick(email)}
                                    className="d-flex align-items-center"
                                    title="Resend failed email"
                                  >
                                    <FaRedo size={12} className="me-1" />
                                    <span className="d-none d-sm-inline">Resend</span>
                                  </Button>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '16px',
                    }}
                  >
                    <FaEnvelope size={48} className="text-muted" style={{ opacity: 0.5 }} />
                    <p className="text-muted mb-0" style={{ fontSize: '1rem' }}>
                      {statusFilter
                        ? `No ${statusFilter.toLowerCase()} emails found.`
                        : 'No emails found in the outbox.'}
                    </p>
                    {statusFilter && (
                      <Button
                        size="sm"
                        color="primary"
                        onClick={() => setStatusFilter(null)}
                        style={{ marginTop: '8px' }}
                      >
                        Clear Filter
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </>
      )}

      {/* Email Details Modal */}
      {showEmailDetails && selectedEmail && (
        <Modal
          isOpen={showEmailDetails}
          toggle={() => setShowEmailDetails(false)}
          size="xl"
          centered
          className="modal-responsive"
        >
          <ModalHeader toggle={() => setShowEmailDetails(false)}>
            Email Details: {selectedEmail.subject}
          </ModalHeader>
          <ModalBody className="p-4">
            <Card className="mb-3">
              <CardHeader className="bg-light">
                <h6 className="mb-0">Email Information</h6>
              </CardHeader>
              <CardBody>
                <div className="row g-3">
                  <div className="col-md-12">
                    <div>
                      <strong>Subject:</strong>
                      <div className="text-muted mt-1">{selectedEmail.subject}</div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div>
                      <strong>Status:</strong>
                      <div className="mt-1">
                        <Badge color={getStatusBadge(selectedEmail.status)}>
                          {selectedEmail.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div>
                      <strong>Created By:</strong>
                      <div className="text-muted mt-1">{getUserDisplayName(selectedEmail)}</div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div>
                      <strong>Created At:</strong>
                      <div className="text-muted mt-1">{formatDate(selectedEmail.createdAt)}</div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div>
                      <strong>Updated At:</strong>
                      <div className="text-muted mt-1">{formatDate(selectedEmail.updatedAt)}</div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div>
                      <strong>Batches:</strong>
                      <div className="text-primary fw-bold mt-1">{emailBatches.length}</div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div>
                      <strong>Total Recipients:</strong>
                      <div className="text-primary fw-bold mt-1">
                        {selectedEmail.totalEmails || 0}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div>
                      <strong>Sent Recipients:</strong>
                      <div className="text-success fw-bold mt-1">
                        {selectedEmail.sentEmails || 0}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div>
                      <strong>Failed Recipients:</strong>
                      <div className="text-danger fw-bold mt-1">
                        {selectedEmail.failedEmails || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <hr />

            <Card className="mt-3">
              <CardHeader className="bg-light">
                <h6 className="mb-0">Email Batches ({emailBatches.length})</h6>
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
                                </div>
                                {item.lastError && item.status === 'FAILED' && (
                                  <small className="text-danger" title={item.lastError}>
                                    {item.lastError.length > 50
                                      ? `${item.lastError.substring(0, 50)}...`
                                      : item.lastError}
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

      {/* Email Preview Modal - FIXED XSS VULNERABILITY */}
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
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(previewBatch.htmlContent || 'No content'),
                }}
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

export default EmailOutbox;
