import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table } from 'reactstrap';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import styles from './RecordsModal.module.css';
import { approvePurchase, rejectPurchase } from '../../../actions/bmdashboard/materialsActions';

export default function RecordsModal({ modal, setModal, record, setRecord, recordType }) {
  const darkMode = useSelector(state => state.theme.darkMode);

  if (record) {
    const toggle = () => {
      setModal(false);
      setRecord(null);
    };

    return (
      <Modal isOpen={modal} size="xl" className={darkMode ? 'text-light' : ''}>
        <ModalHeader className={darkMode ? 'bg-space-cadet' : ''}>{recordType} Record</ModalHeader>
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
          <div className={`${styles.recordsModalTableContainer}`}>
            <Table>
              <Record record={record} recordType={recordType} setRecord={setRecord} />
            </Table>
          </div>
        </ModalBody>
        <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
          <Button onClick={toggle}>Close</Button>
        </ModalFooter>
      </Modal>
    );
  }
  return null;
}

export function Record({ record, recordType, setRecord }) {
  const handleUndefined = value => {
    return value !== undefined && value !== null ? value : 'N/A';
  };

  const dispatch = useDispatch();
  // const handleApprove = async (purchaseId, quantity) => {
  //   await dispatch(approvePurchase(purchaseId, quantity));
  // };

  // const handleReject = async purchaseId => {
  //   await dispatch(rejectPurchase(purchaseId));
  // };
  const handleApprove = async (purchaseId, quantity) => {
    try {
      const response = await dispatch(approvePurchase(purchaseId, quantity));
      // Only update the state if the purchase was successfully approved
      if (response && response.status === 200) {
        const updatedPurchases = record.purchaseRecord.map(purchase => {
          if (purchase._id === purchaseId) {
            return {
              ...purchase,
              status: 'Approved',
            };
          }
          return purchase;
        });
        setRecord({
          ...record,
          purchaseRecord: updatedPurchases,
        });
      }
    } catch (error) {
      // Optionally, you can handle UI feedback for the error
    }
  };
  const handleReject = async purchaseId => {
    try {
      const response = await dispatch(rejectPurchase(purchaseId));
      // Only update the state if the purchase was successfully rejected
      if (response && response.status === 200) {
        const updatedPurchases = record.purchaseRecord.map(purchase => {
          if (purchase._id === purchaseId) {
            return {
              ...purchase,
              status: 'Rejected',
            };
          }
          return purchase;
        });
        setRecord({
          ...record,
          purchaseRecord: updatedPurchases,
        });
      }
    } catch (error) {
      // Optionally, you can handle UI feedback for the error
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
          </tr>
        </thead>
        <tbody>
          {record?.purchaseRecord && record?.purchaseRecord.length ? (
            record.purchaseRecord.map(
              ({ _id, date, status, brandPref, priority, quantity, requestedBy }) => {
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
                    <td>{status}</td>
                    <td>
                      <Button
                        type="button"
                        onClick={() => handleApprove(_id, quantity)}
                        className={`${styles.approveButton}`}
                        disabled={status === 'Approved' || status === 'Rejected'}
                      >
                        Approve
                      </Button>
                      <Button
                        type="button"
                        onClick={() => handleReject(_id)}
                        className={`${styles.rejectButton}`}
                        disabled={status === 'Approved' || status === 'Rejected'}
                      >
                        Reject
                      </Button>
                    </td>
                  </tr>
                );
              },
            )
          ) : (
            <tr>
              <td colSpan={6} style={{ fontWeight: 'bold' }}>
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
