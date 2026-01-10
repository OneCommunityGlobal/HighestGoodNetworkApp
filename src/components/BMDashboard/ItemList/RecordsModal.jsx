import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table } from 'reactstrap';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';

import styles from './recordsModal.module.css';
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
          <div className={styles.records_modal_table_container}>
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
  const darkMode = useSelector(state => state.theme.darkMode);

  const handleApprove = async (purchaseId, quantity) => {
    try {
      const response = await dispatch(approvePurchase(purchaseId, quantity));
      if (response && response.status === 200) {
        const updatedPurchases = record.purchaseRecord.map(purchase =>
          purchase._id === purchaseId ? { ...purchase, status: 'Approved' } : purchase,
        );

        setRecord({
          ...record,
          purchaseRecord: updatedPurchases,
        });
      }
    } catch (error) {}
  };

  const handleReject = async purchaseId => {
    try {
      const response = await dispatch(rejectPurchase(purchaseId));
      if (response && response.status === 200) {
        const updatedPurchases = record.purchaseRecord.map(purchase =>
          purchase._id === purchaseId ? { ...purchase, status: 'Rejected' } : purchase,
        );

        setRecord({
          ...record,
          purchaseRecord: updatedPurchases,
        });
      }
    } catch (error) {}
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
                <td>{moment.utc(data.date).format('LL')}</td>
                <td>{`${data.quantityUsed} ${record.itemType?.unit}` || '-'}</td>
                <td>{`${data.quantityWasted} ${record.itemType?.unit}` || '-'}</td>
                <td>
                  <a
                    href={`/userprofile/${data.createdBy._id}`}
                    className={darkMode ? styles.blue_link : ''}
                  >
                    {`${data.createdBy.firstName} ${data.createdBy.lastName}`}
                  </a>
                </td>
                <td>{data?.createdBy?.email}</td>
              </tr>
            ))
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
            <th>Priority</th>
            <th>Brand</th>
            <th>Quantity</th>
            <th>Requested By</th>
            <th>Email</th>
            <th>Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody className={darkMode ? 'dark-tbody bg-yinmn-blue text-light' : ''}>
          {record?.purchaseRecord?.length ? (
            record.purchaseRecord.map(
              ({ _id, date, status, brandPref, priority, quantity, requestedBy }) => (
                <tr key={_id} className={darkMode ? 'dark-row text-white bg-yinmn-blue' : ''}>
                  <td>{priority}</td>
                  <td>{brandPref}</td>
                  <td>{quantity || '-'}</td>
                  <td>
                    <a
                      href={`/userprofile/${requestedBy._id}`}
                      className={darkMode ? styles.blue_link : ''}
                    >
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
                      className={styles.approve_button}
                      disabled={status === 'Approved' || status === 'Rejected'}
                    >
                      Approve
                    </Button>

                    <Button
                      type="button"
                      onClick={() => handleReject(_id)}
                      className={styles.reject_button}
                      disabled={status === 'Approved' || status === 'Rejected'}
                    >
                      Reject
                    </Button>
                  </td>
                </tr>
              ),
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
