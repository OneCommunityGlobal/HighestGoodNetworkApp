import { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table, Spinner } from 'reactstrap';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import styles from './RecordsModal.module.css';
import { approvePurchase, rejectPurchase } from '../../../actions/bmdashboard/materialsActions';
import {
  approveConsumablePurchase,
  rejectConsumablePurchase,
} from '../../../actions/bmdashboard/consumableActions';

const ALLOWED_ROLES = ['Owner', 'Administrator'];

export default function RecordsModal({ modal, setModal, record, setRecord, recordType, itemType }) {
  if (record) {
    const toggle = () => {
      setModal(false);
      setRecord(null);
    };

    return (
      <Modal isOpen={modal} size="xl">
        <ModalHeader>{recordType} Record</ModalHeader>
        <ModalBody>
          <div className={`${styles.recordsModalTableContainer}`}>
            <Table>
              <Record
                record={record}
                recordType={recordType}
                setRecord={setRecord}
                itemType={itemType}
              />
            </Table>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={toggle}>Close</Button>
        </ModalFooter>
      </Modal>
    );
  }
  return null;
}

export function Record({ record, recordType, setRecord, itemType }) {
  const handleUndefined = value => {
    return value !== undefined && value !== null ? value : 'N/A';
  };

  const dispatch = useDispatch();
  const [loadingId, setLoadingId] = useState(null);

  const userRole = useSelector(state => state.auth?.user?.role);
  const canApproveReject = ALLOWED_ROLES.includes(userRole);

  const isConsumable = itemType === 'Consumables';

  const handleApprove = async (purchaseId, quantity) => {
    setLoadingId(purchaseId);
    try {
      const action = isConsumable
        ? approveConsumablePurchase(purchaseId, quantity)
        : approvePurchase(purchaseId, quantity);
      const response = await dispatch(action);

      if (response && response.status === 200) {
        const updatedPurchases = record.purchaseRecord.map(purchase => {
          if (purchase._id === purchaseId) {
            return { ...purchase, status: 'Approved' };
          }
          return purchase;
        });
        setRecord({ ...record, purchaseRecord: updatedPurchases });
      }
    } catch {
      // Toast error is handled inside the action
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async purchaseId => {
    setLoadingId(purchaseId);
    try {
      const action = isConsumable
        ? rejectConsumablePurchase(purchaseId)
        : rejectPurchase(purchaseId);
      const response = await dispatch(action);

      if (response && response.status === 200) {
        const updatedPurchases = record.purchaseRecord.map(purchase => {
          if (purchase._id === purchaseId) {
            return { ...purchase, status: 'Rejected' };
          }
          return purchase;
        });
        setRecord({ ...record, purchaseRecord: updatedPurchases });
      }
    } catch {
      // Toast error is handled inside the action
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
            <th>Quantity Used</th>
            <th>Quantity Wasted</th>
            <th>Creator</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {record?.updateRecord && record?.updateRecord.length ? (
            record.updateRecord.map(data => {
              return (
                <tr key={data._id}>
                  <td>{moment.utc(data.date).format('LL')}</td>
                  <td>{`${handleUndefined(data.quantityUsed)} ${record.itemType?.unit || ''}`}</td>
                  <td>
                    {`${handleUndefined(data.quantityWasted)} ${record.itemType?.unit || ''}`}
                  </td>
                  <td>
                    <a href={`/userprofile/${data.createdBy._id}`}>
                      {`${data.createdBy.firstName} ${data.createdBy.lastName}`}
                    </a>
                  </td>
                  <td>{data?.createdBy?.email}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={4} style={{ fontWeight: 'bold' }}>
                There are no updates for this item.
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
        <thead>
          <tr>
            <th>Priority</th>
            <th>Brand</th>
            <th>Quantity</th>
            <th>Requested By</th>
            <th>Email</th>
            <th>Date</th>
            <th>Status</th>
            {canApproveReject && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {record?.purchaseRecord && record?.purchaseRecord.length ? (
            record.purchaseRecord.map(
              ({ _id, date, status, brandPref, priority, quantity, requestedBy }) => {
                const isActionComplete = status === 'Approved' || status === 'Rejected';
                const isLoading = loadingId === _id;

                return (
                  <tr key={_id}>
                    <td>{priority}</td>
                    <td>{brandPref}</td>
                    <td>{handleUndefined(quantity)}</td>
                    <td>
                      <a href={`/userprofile/${requestedBy._id}`}>
                        {`${requestedBy.firstName} ${requestedBy.lastName}`}
                      </a>
                    </td>
                    <td>{requestedBy.email}</td>
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
                    {canApproveReject && (
                      <td>
                        {isLoading ? (
                          <Spinner size="sm" />
                        ) : (
                          <>
                            <Button
                              type="button"
                              onClick={() => handleApprove(_id, quantity)}
                              className={`${styles.approveButton}`}
                              disabled={isActionComplete || loadingId !== null}
                            >
                              Approve
                            </Button>
                            <Button
                              type="button"
                              onClick={() => handleReject(_id)}
                              className={`${styles.rejectButton}`}
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
            )
          ) : (
            <tr>
              <td colSpan={canApproveReject ? 8 : 7} style={{ fontWeight: 'bold' }}>
                There are no purchase records.
              </td>
            </tr>
          )}
        </tbody>
      </>
    );
  }
  return null;
}
