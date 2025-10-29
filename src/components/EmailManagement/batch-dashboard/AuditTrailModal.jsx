import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchEmailAuditTrail,
  fetchEmailBatchAuditTrail,
} from '../../../actions/emailBatchActions';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  Badge,
  Button,
  Spinner,
  Alert,
  Card,
  CardBody,
  CardHeader,
  Row,
  Col,
  Input,
  FormGroup,
  Label,
} from 'reactstrap';
import {
  FaHistory,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaInfoCircle,
  FaFilter,
  FaSync,
} from 'react-icons/fa';
import './AuditTrailModal.css';

const AuditTrailModal = ({ isOpen, toggle, emailId, emailBatchId, type = 'email' }) => {
  const dispatch = useDispatch();
  const { batchAuditTrail, itemAuditTrail, loading, error } = useSelector(
    state => state.emailBatches,
  );

  const [filters, setFilters] = useState({
    action: '',
    page: 1,
    limit: 20,
  });
  const [refreshing, setRefreshing] = useState(false);

  const auditData = type === 'email' ? batchAuditTrail : itemAuditTrail;
  const loadingState = type === 'email' ? loading.batchAudit : loading.itemAudit;
  const errorState = type === 'email' ? error.batchAudit : error.itemAudit;

  useEffect(() => {
    if (isOpen && (emailId || emailBatchId)) {
      loadAuditTrail();
    }
  }, [isOpen, emailId, emailBatchId, filters]);

  const loadAuditTrail = async () => {
    try {
      if (type === 'email' && emailId) {
        await dispatch(fetchEmailAuditTrail(emailId, filters));
      } else if (type === 'emailBatch' && emailBatchId) {
        await dispatch(fetchEmailBatchAuditTrail(emailBatchId, filters));
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
      case 'BATCH_CREATED':
      case 'ITEM_SENT':
        return <FaCheckCircle className="text-success" />;
      case 'BATCH_STARTED':
      case 'ITEM_SENDING':
        return <FaClock className="text-info" />;
      case 'BATCH_SENT':
        return <FaCheckCircle className="text-success" />;
      case 'BATCH_FAILED':
      case 'ITEM_FAILED':
        return <FaTimesCircle className="text-danger" />;
      default:
        return <FaInfoCircle className="text-secondary" />;
    }
  };

  const getActionBadgeColor = action => {
    switch (action) {
      case 'BATCH_CREATED':
      case 'ITEM_SENT':
      case 'BATCH_SENT':
        return 'success';
      case 'BATCH_STARTED':
      case 'ITEM_SENDING':
        return 'info';
      case 'BATCH_FAILED':
      case 'ITEM_FAILED':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const formatTimestamp = timestamp => {
    return new Date(timestamp).toLocaleString();
  };

  const renderAuditEntry = (entry, index) => (
    <tr key={entry._id || index}>
      <td>
        <div className="d-flex align-items-center">
          {getActionIcon(entry.action)}
          <span className="ml-2">{entry.action}</span>
        </div>
      </td>
      <td>
        <Badge color={getActionBadgeColor(entry.action)}>{entry.action}</Badge>
      </td>
      <td>
        <div>
          <div>{entry.details}</div>
          {entry.triggeredBy && (
            <div className="text-muted small mt-1">
              <FaInfoCircle className="mr-1" />
              By: {entry.triggeredBy.firstName} {entry.triggeredBy.lastName} (
              {entry.triggeredBy.email})
            </div>
          )}
        </div>
      </td>
      <td>{formatTimestamp(entry.timestamp)}</td>
      <td>
        {entry.error && (
          <div className="text-danger small">
            <FaExclamationTriangle className="mr-1" />
            {entry.error}
          </div>
        )}
        {entry.errorCode && <div className="text-muted small">Code: {entry.errorCode}</div>}
      </td>
      <td>
        {entry.metadata && Object.keys(entry.metadata).length > 0 && (
          <Button
            size="sm"
            color="outline-info"
            onClick={() => {
              alert(JSON.stringify(entry.metadata, null, 2));
            }}
          >
            <FaInfoCircle />
          </Button>
        )}
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
        {/* Filters */}
        <Card className="mb-3">
          <CardHeader>
            <FaFilter className="mr-2" />
            Filters
          </CardHeader>
          <CardBody>
            <Row>
              <Col md={4}>
                <FormGroup>
                  <Label for="actionFilter">Action</Label>
                  <Input
                    type="select"
                    id="actionFilter"
                    value={filters.action}
                    onChange={e => setFilters({ ...filters, action: e.target.value })}
                  >
                    <option value="">All Actions</option>
                    <option value="BATCH_CREATED">Batch Created</option>
                    <option value="BATCH_STARTED">Batch Started</option>
                    <option value="BATCH_SENT">Batch Sent</option>
                    <option value="BATCH_FAILED">Batch Failed</option>
                    <option value="ITEM_SENDING">Item Sending</option>
                    <option value="ITEM_SENT">Item Sent</option>
                    <option value="ITEM_FAILED">Item Failed</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label for="limitFilter">Items per page</Label>
                  <Input
                    type="select"
                    id="limitFilter"
                    value={filters.limit}
                    onChange={e => setFilters({ ...filters, limit: parseInt(e.target.value) })}
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md={4} className="d-flex align-items-end">
                <Button
                  color="primary"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="w-100"
                >
                  {refreshing ? <Spinner size="sm" /> : <FaSync />}
                  {refreshing ? ' Refreshing...' : ' Refresh'}
                </Button>
              </Col>
            </Row>
          </CardBody>
        </Card>

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

        {/* Audit Trail Table */}
        {!loadingState && auditData && auditData.auditTrail && auditData.auditTrail.length > 0 && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">Found {auditData.totalCount} audit entries</h6>
              <div className="text-muted small">
                Page {auditData.page} of {auditData.totalPages}
              </div>
            </div>

            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Status</th>
                  <th>Details</th>
                  <th>Timestamp</th>
                  <th>Error</th>
                  <th>Metadata</th>
                </tr>
              </thead>
              <tbody>
                {auditData.auditTrail.map((entry, index) => renderAuditEntry(entry, index))}
              </tbody>
            </Table>

            {/* Pagination */}
            {auditData.totalPages > 1 && (
              <div className="d-flex justify-content-center mt-3">
                <Button
                  color="outline-primary"
                  size="sm"
                  disabled={filters.page <= 1}
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  className="mr-2"
                >
                  Previous
                </Button>
                <span className="mx-3 align-self-center">
                  Page {filters.page} of {auditData.totalPages}
                </span>
                <Button
                  color="outline-primary"
                  size="sm"
                  disabled={filters.page >= auditData.totalPages}
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loadingState &&
          (!auditData || !auditData.auditTrail || auditData.auditTrail.length === 0) && (
            <div className="text-center py-5">
              <FaHistory size={48} className="text-muted mb-3" />
              <h5 className="text-muted">No audit entries found</h5>
              <p className="text-muted">
                No audit trail available for this {type === 'email' ? 'email' : 'email batch'}.
              </p>
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
