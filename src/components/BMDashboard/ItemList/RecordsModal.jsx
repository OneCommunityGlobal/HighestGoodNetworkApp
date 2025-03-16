import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table } from 'reactstrap';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import './RecordsModal.css';
import { approvePurchase, rejectPurchase } from '../../../actions/bmdashboard/materialsActions';

export default function RecordsModal({ modal, setModal, record, setRecord, recordType }) {
  if (record) {
    const toggle = () => {
      setModal(false);
      setRecord(null);
    };

    return (
      <Modal isOpen={modal} size="xl">
        <ModalHeader>{recordType} Record</ModalHeader>
        <ModalBody>
          <div className="records_modal_table_container">
            <Table>
              <Record record={record} recordType={recordType} setRecord={setRecord} />
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
                    <td>{moment(date).format('MM/DD/YY')}</td>
                    <td>{status}</td>
                    <td>
                      <Button
                        type="button"
                        onClick={() => handleApprove(_id, quantity)}
                        className="approve-button"
                        disabled={status === 'Approved' || status === 'Rejected'}
                      >
                        Approve
                      </Button>
                      <Button
                        type="button"
                        onClick={() => handleReject(_id)}
                        className="reject-button"
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
