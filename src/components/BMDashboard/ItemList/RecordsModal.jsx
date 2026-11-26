import { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table, Spinner } from 'reactstrap';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import styles from './RecordsModal.module.css';
import {
  approvePurchase,
  rejectPurchase,
  markPurchaseReceived,
} from '../../../actions/bmdashboard/materialsActions';
import consumableActions from '../../../actions/bmdashboard/consumableActions';

const ALLOWED_ROLES = ['Owner', 'Administrator'];

export default function RecordsModal({ modal, setModal, record, setRecord, recordType, itemType }) {
  const darkMode = useSelector(state => state.theme.darkMode);

  if (!record) {
    return null;
  }

  const toggle = () => {
    setModal(false);
    setRecord(null);
  };

  return (
    <>
      {darkMode && (
        <style>
          {`
            .dark-oxford-modal {
              background-color: #1B2A41 !important;
              color: #ffffff !important;
            }
            .dark-oxford-modal .modal-header,
            .dark-oxford-modal .modal-body,
            .dark-oxford-modal .modal-footer {
              background-color: #1B2A41 !important;
              color: #ffffff !important;
              border-color: rgba(255,255,255,0.08) !important;
            }
          `}
        </style>
      )}
      <Modal
        isOpen={modal}
        size="xl"
        className={`${recordType === 'Purchase' ? styles.widePurchaseModal : ''} ${
          darkMode ? 'dark-modal full-dark bg-yinmn-blue text-light' : ''
        }`}
        contentClassName={darkMode ? 'dark-oxford-modal' : ''}
      >
        <ModalHeader className={darkMode ? 'dark-modal-header bg-space-cadet text-white' : ''}>
          {recordType} Record
        </ModalHeader>

        <ModalBody
          className={`${darkMode ? 'dark-modal-body bg-yinmn-blue text-light' : ''} ${
            recordType === 'Purchase' ? styles.purchaseRecordModalBody : ''
          }`}
        >
          <div
            className={`${styles.records_modal_table_container} ${
              recordType === 'Purchase' ? styles.purchaseRecordTableContainer : ''
            }`}
          >
            <Table className={darkMode ? 'dark-table bg-yinmn-blue text-white' : ''}>
              <Record
                record={record}
                recordType={recordType}
                setRecord={setRecord}
                itemType={itemType}
              />
            </Table>
          </div>
        </ModalBody>

        <ModalFooter className={darkMode ? 'dark-modal-footer bg-space-cadet text-white' : ''}>
          <Button onClick={toggle}>Close</Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

export function Record({ record, recordType, setRecord, itemType }) {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);
  const userRole = useSelector(state => state.auth?.user?.role);
  const [loadingId, setLoadingId] = useState(null);
  const [receivingPurchaseId, setReceivingPurchaseId] = useState(null);
  const [actualDeliveryDate, setActualDeliveryDate] = useState('');
  const canApproveReject = ALLOWED_ROLES.includes(userRole);
  const isConsumable = itemType === 'Consumables';

  const formatQuantity = (value, unit) => {
    if (value == null) return '-';
    return unit ? `${value} ${unit}` : `${value}`;
  };

  const renderUser = user => {
    if (!user) {
      return <span>-</span>;
    }

    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Unknown User';

    if (!user._id) {
      return <span>{fullName}</span>;
    }

    return (
      <a href={`/userprofile/${user._id}`} className={darkMode ? styles.blue_link : ''}>
        {fullName}
      </a>
    );
  };

  const handleApprove = async (purchaseId, quantity) => {
    setLoadingId(purchaseId);
    try {
      const action = isConsumable
        ? consumableActions.approveConsumablePurchase(purchaseId, quantity)
        : approvePurchase(purchaseId, quantity);
      const response = await dispatch(action);

      if (response && response.status === 200) {
        const updatedPurchases = record.purchaseRecord.map(purchase =>
          purchase._id === purchaseId ? { ...purchase, status: 'Approved' } : purchase,
        );
        setRecord({ ...record, purchaseRecord: updatedPurchases });
      }
    } catch {
      // Toast error is handled inside the action.
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async purchaseId => {
    setLoadingId(purchaseId);
    try {
      const action = isConsumable
        ? consumableActions.rejectConsumablePurchase(purchaseId)
        : rejectPurchase(purchaseId);
      const response = await dispatch(action);

      if (response && response.status === 200) {
        const updatedPurchases = record.purchaseRecord.map(purchase =>
          purchase._id === purchaseId ? { ...purchase, status: 'Rejected' } : purchase,
        );
        setRecord({ ...record, purchaseRecord: updatedPurchases });
      }
    } catch {
      // Toast error is handled inside the action.
    } finally {
      setLoadingId(null);
    }
  };
  const handleMarkReceived = async purchaseId => {
    if (!actualDeliveryDate) {
      return;
    }

    setLoadingId(purchaseId);

    try {
      const response = await dispatch(markPurchaseReceived(purchaseId, actualDeliveryDate));

      if (response?.status === 200) {
        const updatedPurchases = record.purchaseRecord.map(purchase =>
          purchase._id === purchaseId
            ? { ...purchase, status: 'Received', actualDeliveryDate }
            : purchase,
        );

        setRecord({ ...record, purchaseRecord: updatedPurchases });
        setReceivingPurchaseId(null);
        setActualDeliveryDate('');
      }
    } finally {
      setLoadingId(null);
    }
  };

  if (recordType === 'Update') {
    return (
      <>
        <thead className={darkMode ? 'dark-thead bg-space-cadet text-white' : ''}>
          <tr className={darkMode ? 'dark-row text-white bg-yinmn-blue' : ''}>
            <th>Date</th>
            <th>Quantity Used</th>
            <th>Quantity Wasted</th>
            <th>Creator</th>
            <th>Email</th>
          </tr>
        </thead>

        <tbody className={darkMode ? 'dark-tbody bg-yinmn-blue text-light' : ''}>
          {record?.updateRecord?.length ? (
            record.updateRecord.map(data => (
              <tr key={data._id} className={darkMode ? 'dark-row text-white bg-yinmn-blue' : ''}>
                <td>{data.date ? moment.utc(data.date).format('LL') : '-'}</td>
                <td>{formatQuantity(data.quantityUsed, record.itemType?.unit)}</td>
                <td>{formatQuantity(data.quantityWasted, record.itemType?.unit)}</td>
                <td>{renderUser(data.createdBy)}</td>
                <td>{data?.createdBy?.email || '-'}</td>
              </tr>
            ))
          ) : (
            <tr className={darkMode ? 'text-light bg-space-cadet' : ''}>
              <td colSpan={5} style={{ fontWeight: 'bold' }}>
                There are no updates for this item.
              </td>
            </tr>
          )}
        </tbody>
      </>
    );
  }
  if (recordType === 'UsageRecord') {
    return (
      <>
        <thead className={darkMode ? 'dark-thead bg-space-cadet text-white' : ''}>
          <tr className={darkMode ? 'dark-row text-white bg-yinmn-blue' : ''}>
            <th>Date</th>
            <th>Quantity Used</th>
            <th>Logged By</th>
            <th>Email</th>
          </tr>
        </thead>

        <tbody className={darkMode ? 'dark-tbody bg-yinmn-blue text-light' : ''}>
          {record?.usageRecord?.length ? (
            record.usageRecord.map(data => (
              <tr key={data._id} className={darkMode ? 'dark-row text-white bg-yinmn-blue' : ''}>
                <td>{data.date ? moment.utc(data.date).format('LL') : '-'}</td>
                <td>{formatQuantity(data.quantityUsed, record.itemType?.unit)}</td>
                <td>{renderUser(data.createdBy)}</td>
                <td>{data?.createdBy?.email || '-'}</td>
              </tr>
            ))
          ) : (
            <tr className={darkMode ? 'text-light bg-space-cadet' : ''}>
              <td colSpan={4} style={{ fontWeight: 'bold' }}>
                There are no usage records for this item.
              </td>
            </tr>
          )}
        </tbody>
      </>
    );
  }
  if (recordType === 'Purchase') {
    return (
      <>
        <thead className={darkMode ? 'dark-thead bg-space-cadet text-white' : ''}>
          <tr className={darkMode ? 'dark-row text-white bg-yinmn-blue' : ''}>
            <th>Priority</th>
            <th>Brand</th>
            {!isConsumable && <th>Supplier</th>}
            <th>Quantity</th>
            <th>Requested By</th>
            <th>Email</th>
            <th>Date</th>
            {!isConsumable && <th>Expected Delivery</th>}
            {!isConsumable && <th>Actual Delivery</th>}
            <th>Status</th>
            {canApproveReject && <th className={styles.purchaseRecordActionColumn}>Action</th>}
          </tr>
        </thead>

        <tbody className={darkMode ? 'dark-tbody bg-yinmn-blue text-light' : ''}>
          {record?.purchaseRecord?.length ? (
            record.purchaseRecord.map(
              ({
                _id,
                date,
                status,
                brandPref,
                priority,
                quantity,
                requestedBy,
                supplier,
                expectedDeliveryDate,
                actualDeliveryDate: recordedDeliveryDate,
              }) => {
                const isLoading = loadingId === _id;

                return (
                  <tr key={_id} className={darkMode ? 'dark-row text-white bg-yinmn-blue' : ''}>
                    <td>{priority || '-'}</td>
                    <td>{brandPref || '-'}</td>
                    {!isConsumable && <td>{supplier?.name || '-'}</td>}
                    <td>{quantity ?? '-'}</td>
                    <td>{renderUser(requestedBy)}</td>
                    <td>{requestedBy?.email || '-'}</td>
                    <td>{date ? moment(date).format('MM/DD/YY') : '-'}</td>
                    {!isConsumable && (
                      <td>
                        {expectedDeliveryDate
                          ? moment.utc(expectedDeliveryDate).format('MM/DD/YY')
                          : '-'}
                      </td>
                    )}
                    {!isConsumable && (
                      <td>
                        {recordedDeliveryDate
                          ? moment.utc(recordedDeliveryDate).format('MM/DD/YY')
                          : '-'}
                      </td>
                    )}
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
                        {status || '-'}
                      </span>
                    </td>
                    {canApproveReject && (
                      <td className={styles.purchaseRecordActionColumn}>
                        {isLoading ? (
                          <Spinner size="sm" />
                        ) : (
                          <>
                            {status === 'Pending' && (
                              <>
                                <Button
                                  type="button"
                                  onClick={() => handleApprove(_id, quantity)}
                                  className={styles.approveButton}
                                  disabled={loadingId !== null}
                                >
                                  Approve
                                </Button>
                                <Button
                                  type="button"
                                  onClick={() => handleReject(_id)}
                                  className={styles.rejectButton}
                                  disabled={loadingId !== null}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            {!isConsumable && status === 'Approved' && (
                              <Button
                                type="button"
                                color="primary"
                                onClick={() => {
                                  setReceivingPurchaseId(_id);
                                  setActualDeliveryDate('');
                                }}
                                disabled={loadingId !== null}
                              >
                                Mark as Received
                              </Button>
                            )}
                            {(status === 'Received' ||
                              status === 'Rejected' ||
                              (isConsumable && status === 'Approved')) &&
                              '-'}
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                );
              },
            )
          ) : (
            <tr className={darkMode ? 'text-light bg-space-cadet' : ''}>
              <td colSpan={canApproveReject ? 8 : 7} style={{ fontWeight: 'bold' }}>
                There are no purchase records.
              </td>
            </tr>
          )}
          {!isConsumable && receivingPurchaseId && (
            <tr>
              <td colSpan={canApproveReject ? 11 : 10}>
                <div className={styles.deliveryForm}>
                  <div>
                    <label htmlFor="actual-delivery-date">Actual Delivery Date</label>
                    <input
                      id="actual-delivery-date"
                      type="date"
                      value={actualDeliveryDate}
                      onChange={e => setActualDeliveryDate(e.target.value)}
                      className="form-control"
                      disabled={loadingId !== null}
                    />
                  </div>

                  <Button
                    type="button"
                    color="success"
                    onClick={() => handleMarkReceived(receivingPurchaseId)}
                    disabled={!actualDeliveryDate || loadingId !== null}
                  >
                    Confirm Received
                  </Button>

                  <Button
                    type="button"
                    color="secondary"
                    onClick={() => {
                      setReceivingPurchaseId(null);
                      setActualDeliveryDate('');
                    }}
                    disabled={loadingId !== null}
                  >
                    Cancel
                  </Button>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </>
    );
  }

  return null;
}
