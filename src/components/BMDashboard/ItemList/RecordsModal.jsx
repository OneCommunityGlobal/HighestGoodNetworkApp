import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table } from 'reactstrap';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import './RecordsModal.css';
import { approvePurchase, rejectPurchase } from '../../../actions/bmdashboard/materialsActions';

export default function RecordsModal({ modal, setModal, record, setRecord, recordType }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  if (record) {
    const toggle = () => {
      setModal(false);
      setRecord(null);
    };

    return (
      <Modal
        isOpen={modal}
        size="xl"
        className={darkMode ? 'dark-modal full-dark bg-yinmn-blue text-light' : ''}
      >
        <ModalHeader className={darkMode ? 'dark-modal-header bg-space-cadet text-white' : ''}>
          {recordType} Record
        </ModalHeader>
        <ModalBody className={darkMode ? 'dark-modal-body bg-yinmn-blue text-light' : ''}>
          <div className="records_modal_table_container">
            <Table className={darkMode ? 'dark-table bg-yinmn-blue text-white' : ''}>
              <Record record={record} recordType={recordType} setRecord={setRecord} />
            </Table>
          </div>
        </ModalBody>
        <ModalFooter className={darkMode ? 'dark-modal-footer bg-space-cadet text-white' : ''}>
          <Button onClick={toggle}>Close</Button>
        </ModalFooter>
      </Modal>
    );
  }
  return null;
}

export function Record({ record, recordType, setRecord }) {
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
  const darkMode = useSelector(state => state.theme.darkMode);

  if (recordType === 'Update') {
    return (
      <>
        <thead className={darkMode ? 'dark-thead bg-space-cadet text-white' : ''}>
          <tr className={darkMode ? 'dark-row text-white bg-yinmn-blue' : ''}>
            <th className={darkMode ? 'text-light' : ''}>Date</th>
            <th className={darkMode ? 'text-light' : ''}>Quantity Used</th>
            <th className={darkMode ? 'text-light' : ''}>Quantity Wasted</th>
            <th className={darkMode ? 'text-light' : ''}>Creator</th>
            <th className={darkMode ? 'text-light' : ''}>Email</th>
          </tr>
        </thead>
        <tbody className={darkMode ? 'dark-tbody bg-yinmn-blue text-light' : ''}>
          {record?.updateRecord && record?.updateRecord.length ? (
            record.updateRecord.map(data => {
              return (
                <tr key={data._id} className={darkMode ? 'dark-row text-white bg-yinmn-blue' : ''}>
                  <td className={darkMode ? 'text-light' : ''}>{moment.utc(data.date).format('LL')}</td>
                  <td className={darkMode ? 'text-light' : ''}>{`${data.quantityUsed} ${record.itemType?.unit}` || '-'}</td>
                  <td className={darkMode ? 'text-light' : ''}>{`${data.quantityWasted} ${record.itemType?.unit}` || '-'}</td>
                  <td className={darkMode ? 'text-light' : ''}>
                    <a href={`/userprofile/${data.createdBy._id}`}>
                      {`${data.createdBy.firstName} ${data.createdBy.lastName}`}
                    </a>
                  </td>
                  <td className={darkMode ? 'text-light' : ''}>{data?.createdBy?.email}</td>
                </tr>
              );
            })
          ) : (
            <tr className={darkMode ? 'text-light bg-space-cadet' : ''}>
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
        <thead className={darkMode ? 'dark-thead bg-space-cadet text-white' : ''}>
          <tr className={darkMode ? 'dark-row text-white bg-yinmn-blue' : ''}>
            <th className={darkMode ? 'text-light' : ''}>Priority</th>
            <th className={darkMode ? 'text-light' : ''}>Brand</th>
            <th className={darkMode ? 'text-light' : ''}>Quantity</th>
            <th className={darkMode ? 'text-light' : ''}>Requested By</th>
            <th className={darkMode ? 'text-light' : ''}>Email</th>
            <th className={darkMode ? 'text-light' : ''}>Date</th>
            <th className={darkMode ? 'text-light' : ''}>Status</th>
          </tr>
        </thead>
        <tbody className={darkMode ? 'dark-tbody bg-yinmn-blue text-light' : ''}>
          {record?.purchaseRecord && record?.purchaseRecord.length ? (
            record.purchaseRecord.map(
              ({ _id, date, status, brandPref, priority, quantity, requestedBy }) => {
                return (
                  <tr key={_id} className={darkMode ? 'dark-row text-white bg-yinmn-blue' : ''}>
                    <td className={darkMode ? 'text-light' : ''}>{priority}</td>
                    <td className={darkMode ? 'text-light' : ''}>{brandPref}</td>
                    <td className={darkMode ? 'text-light' : ''}>{quantity || '-'}</td>
                    <td className={darkMode ? 'text-light' : ''}>
                      <a href={`/userprofile/${requestedBy._id}`}>
                        {`${requestedBy.firstName} ${requestedBy.lastName}`}
                      </a>
                    </td>
                    <td className={darkMode ? 'text-light' : ''}>{requestedBy.email}</td>
                    <td className={darkMode ? 'text-light' : ''}>{moment(date).format('MM/DD/YY')}</td>
                    <td className={darkMode ? 'text-light' : ''}>{status}</td>
                    <td>
                      <Button
                        type="button"
                        onClick={() => handleApprove(_id, quantity)}
                        className={`approve-button ${darkMode ? 'dark-approve bg-space-cadet text-white' : ''}`}
                        disabled={status === 'Approved' || status === 'Rejected'}
                      >
                        Approve
                      </Button>
                      <Button
                        type="button"
                        onClick={() => handleReject(_id)}
                        className={`reject-button ${darkMode ? 'dark-reject bg-space-cadet text-white' : ''}`}
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
            <tr className={darkMode ? 'text-light bg-space-cadet' : ''}>
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
