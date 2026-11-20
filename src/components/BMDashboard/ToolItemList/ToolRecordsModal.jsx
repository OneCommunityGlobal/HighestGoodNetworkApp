import { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table, Spinner } from 'reactstrap';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';

import { approveToolPurchase, rejectToolPurchase } from '../../../actions/bmdashboard/toolActions';
import styles from './ToolRecordsModal.module.css';

const ALLOWED_ROLES = ['Owner', 'Administrator'];

export default function RecordsModal({ modal, setModal, record, setRecord, recordType }) {
  const darkMode = useSelector(state => state.theme.darkMode);

  if (record) {
    const toggle = () => {
      setModal(false);
      setRecord(null);
    };

    return (
      <Modal isOpen={modal} size="xl" className={darkMode ? styles.modalDark : ''}>
        <ModalHeader className={darkMode ? styles.modalHeaderDark : ''}>
          {recordType} Record
        </ModalHeader>
        <ModalBody className={darkMode ? styles.modalBodyDark : ''}>
          <div className={styles.recordsModalTableContainer}>
            <Table className={darkMode ? styles.tableDark : ''}>
              <Record record={record} setRecord={setRecord} recordType={recordType} />
            </Table>
          </div>
        </ModalBody>
        <ModalFooter className={darkMode ? styles.modalBodyDark : ''}>
          <Button onClick={toggle}>Close</Button>
        </ModalFooter>
      </Modal>
    );
  }
  return null;
}

export function Record({ record, setRecord, recordType }) {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(state => state.auth?.isAuthenticated);
  const userRole = useSelector(state => state.auth?.user?.role);
  const [loadingId, setLoadingId] = useState(null);
  const canApproveReject = Boolean(isAuthenticated) && ALLOWED_ROLES.includes(userRole);

  const updatePurchaseStatus = (purchaseId, status) => {
    const updatedRecord = record.map(purchase =>
      purchase._id === purchaseId ? { ...purchase, status } : purchase,
    );
    setRecord(updatedRecord);
  };

  const handleApprove = async (purchaseId, quantity) => {
    setLoadingId(purchaseId);
    try {
      const response = await dispatch(approveToolPurchase(purchaseId, quantity));
      if (response?.status === 200) {
        updatePurchaseStatus(purchaseId, 'Approved');
      }
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async purchaseId => {
    setLoadingId(purchaseId);
    try {
      const response = await dispatch(rejectToolPurchase(purchaseId));
      if (response?.status === 200) {
        updatePurchaseStatus(purchaseId, 'Rejected');
      }
    } finally {
      setLoadingId(null);
    }
  };

  if (recordType === 'Update') {
    return (
      <>
        <thead>
          <tr>
            <th>Date</th>
            <th>Condition</th>
            <th>Creator</th>
          </tr>
        </thead>
        <tbody>
          {record.updateRecord.map((data, index) => {
            return (
              // eslint-disable-next-line react/no-array-index-key
              <tr key={index}>
                <td>{moment.utc(data.date).format('LL')}</td>
                <td>{data.condition}</td>
                <td>
                  <a href={`/userprofile/${data.createdBy._id}`}>
                    {`${data.createdBy?.firstName || 'Unknown'} 
                    ${data.createdBy?.lastName || 'Unknown'}`}
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </>
    );
  }
  if (recordType === 'Purchase') {
    return (
      <>
        <thead>
          <tr>
            <th>Priority</th>
            <th>Brand</th>
            <th>Quantity</th>
            <th>Requested By</th>
            <th>Date</th>
            <th>Status</th>
            <th>Description</th>
            {canApproveReject && <th className={styles.purchaseRecordActionColumn}>Action</th>}
          </tr>
        </thead>
        <tbody>
          {record.map(
            ({ _id, date, status, makeModelPref, priority, quantity, requestedBy, usageDesc }) => {
              const isActionComplete = status === 'Approved' || status === 'Rejected';
              const isLoading = loadingId === _id;

              return (
                <tr key={_id}>
                  <td>{priority}</td>
                  <td>{makeModelPref}</td>
                  <td>{quantity || '-'}</td>
                  <td>
                    <a href={`/userprofile/${requestedBy?._id}`}>
                      {`${requestedBy?.firstName || 'Unknown'} ${requestedBy?.lastName || 'User'}`}
                    </a>
                  </td>
                  <td>{moment(date).format('MM/DD/YY')}</td>
                  <td>
                    <span
                      className={
                        status === 'Approved'
                          ? styles.statusApproved
                          : status === 'Rejected'
                          ? styles.statusRejected
                          : styles.statusPending
                      }
                    >
                      {status}
                    </span>
                  </td>
                  <td>{usageDesc}</td>
                  {canApproveReject && (
                    <td className={styles.purchaseRecordActionColumn}>
                      {isLoading ? (
                        <Spinner size="sm" />
                      ) : (
                        <>
                          <Button
                            type="button"
                            onClick={() => handleApprove(_id, quantity)}
                            className={styles.approveButton}
                            disabled={isActionComplete || loadingId !== null}
                          >
                            Approve
                          </Button>
                          <Button
                            type="button"
                            onClick={() => handleReject(_id)}
                            className={styles.rejectButton}
                            disabled={isActionComplete || loadingId !== null}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </td>
                  )}
                </tr>
              );
            },
          )}
        </tbody>
      </>
    );
  }

  return null;
}
