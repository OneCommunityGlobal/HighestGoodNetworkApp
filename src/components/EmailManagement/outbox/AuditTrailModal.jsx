import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchEmailAuditTrail,
  fetchEmailBatchAuditTrail,
} from '../../../actions/emailOutboxActions';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  Button,
  Spinner,
  Alert,
} from 'reactstrap';
import {
  FaHistory,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaInfoCircle,
  FaSync,
} from 'react-icons/fa';
import './AuditTrailModal.css';

const AuditTrailModal = ({ isOpen, toggle, emailId, emailBatchId, type = 'email' }) => {
  const dispatch = useDispatch();
  const { emailAuditTrail, emailBatchAuditTrail, loading, error } = useSelector(
    state => state.emailOutbox,
  );

  const [refreshing, setRefreshing] = useState(false);

  const auditData = type === 'email' ? emailAuditTrail : emailBatchAuditTrail;
  const loadingState = type === 'email' ? loading.emailAudit : loading.emailBatchAudit;
  const errorState = type === 'email' ? error.emailAudit : error.emailBatchAudit;

  useEffect(() => {
    if (isOpen && (emailId || emailBatchId)) {
      loadAuditTrail();
    }
  }, [isOpen, emailId, emailBatchId]);

  const loadAuditTrail = async () => {
    try {
      if (type === 'email' && emailId) {
        await dispatch(fetchEmailAuditTrail(emailId));
      } else if (type === 'emailBatch' && emailBatchId) {
        await dispatch(fetchEmailBatchAuditTrail(emailBatchId));
      }
    } catch (error) {
      console.error('Error loading audit trail:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAuditTrail();
    setRefreshing(false);
  };

  const getActionIcon = action => {
    switch (action) {
      case 'EMAIL_CREATED':
      case 'EMAIL_SENT':
      case 'EMAIL_BATCH_SENT':
        return <FaCheckCircle className="text-success" />;
      case 'EMAIL_SENDING':
      case 'EMAIL_BATCH_PENDING':
        return <FaClock className="text-info" />;
      case 'EMAIL_PROCESSED':
        return <FaCheckCircle className="text-success" />;
      case 'EMAIL_FAILED':
      case 'EMAIL_BATCH_FAILED':
        return <FaTimesCircle className="text-danger" />;
      default:
        return <FaInfoCircle className="text-secondary" />;
    }
  };

  const getActionBadgeColor = action => {
    switch (action) {
      case 'EMAIL_CREATED':
      case 'EMAIL_SENT':
      case 'EMAIL_BATCH_SENT':
      case 'EMAIL_PROCESSED':
        return 'success';
      case 'EMAIL_SENDING':
      case 'EMAIL_BATCH_PENDING':
        return 'info';
      case 'EMAIL_FAILED':
      case 'EMAIL_BATCH_FAILED':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  // No separate status column; showing action only as requested

  const formatTimestamp = timestamp => {
    return new Date(timestamp).toLocaleString();
  };

  const renderAuditEntry = (entry, index) => (
    <tr key={entry._id || index}>
      <td className="compact-row w-100">
        <div className="d-flex align-items-start w-100">
          <div className="mr-3 mt-1">{getActionIcon(entry.action)}</div>
          <div className="flex-grow-1 w-100">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div className="font-weight-medium text-dark">{entry.action.replace(/_/g, ' ')}</div>
              <div className="text-muted small">{formatTimestamp(entry.timestamp)}</div>
            </div>

            {entry.details && <div className="text-secondary small mb-2">{entry.details}</div>}

            {entry.error && (
              <div className="text-danger small mb-2 d-flex align-items-center">
                <FaExclamationTriangle className="mr-1" size={12} />
                <span>{entry.error}</span>
                {entry.errorCode && (
                  <span className="ml-2 text-muted">[Code: {entry.errorCode}]</span>
                )}
              </div>
            )}

            {entry.triggeredBy && (
              <div className="text-muted small mb-2 d-flex align-items-center">
                <FaInfoCircle className="mr-1" size={10} />
                <span>
                  Triggered by: {entry.triggeredBy.firstName} {entry.triggeredBy.lastName} (
                  {entry.triggeredBy.email})
                </span>
              </div>
            )}

            {entry.metadata && Object.keys(entry.metadata).length > 0 && (
              <details className="mt-2">
                <summary
                  className="text-info small cursor-pointer d-inline-flex align-items-center"
                  style={{ cursor: 'pointer' }}
                >
                  <FaInfoCircle className="mr-1" size={10} />
                  View Metadata ({Object.keys(entry.metadata).length} fields)
                </summary>
                <div
                  className="mt-2 p-2 bg-light rounded border"
                  style={{ maxHeight: '200px', overflow: 'auto' }}
                >
                  <pre
                    className="small mb-0"
                    style={{ fontSize: '0.75rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                  >
                    {JSON.stringify(entry.metadata, null, 2)}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>
      </td>
    </tr>
  );

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="xl" className="audit-trail-modal">
      <ModalHeader toggle={toggle}>
        <FaHistory className="mr-2" />
        Audit Trail - {type === 'email' ? 'Email' : 'Email Batch'} History
      </ModalHeader>

      <ModalBody>
        {/* Simple toolbar */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="text-muted small">
            {auditData?.length > 0 && `${auditData.length} entries`}
          </div>
          <Button color="link" onClick={handleRefresh} disabled={refreshing} size="sm">
            {refreshing ? <Spinner size="sm" /> : <FaSync />}
          </Button>
        </div>

        {/* Error Display */}
        {errorState && (
          <Alert color="danger">
            <FaExclamationTriangle className="mr-2" />
            {errorState}
          </Alert>
        )}

        {/* Loading State */}
        {loadingState && (
          <div className="text-center py-4">
            <Spinner size="lg" />
            <div className="mt-2">Loading audit trail...</div>
          </div>
        )}

        {/* Audit Trail Log */}
        {!loadingState && auditData && auditData.length > 0 && (
          <div className="audit-log">
            <Table responsive borderless hover size="sm">
              <tbody>{auditData.map((entry, index) => renderAuditEntry(entry, index))}</tbody>
            </Table>
          </div>
        )}

        {/* Empty State - Audit logging was removed from backend */}
        {!loadingState && (!auditData || !auditData.length || auditData.length === 0) && (
          <div className="text-center py-5">
            <FaHistory size={48} className="text-muted mb-3" />
            <h5 className="text-muted">Audit Logging Removed</h5>
            <Alert color="info" className="mt-3">
              <FaInfoCircle className="me-2" />
              <div>
                <strong>Audit logging has been removed from the backend.</strong>
                <p className="mb-0 mt-2">
                  Error details are now captured directly in EmailBatch records. You can view error
                  information (lastError, errorCode, lastErrorAt) in the email batch details.
                </p>
              </div>
            </Alert>
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AuditTrailModal;
