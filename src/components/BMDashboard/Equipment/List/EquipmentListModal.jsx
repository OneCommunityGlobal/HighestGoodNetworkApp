import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table } from 'reactstrap';
import moment from 'moment';
import styles from './Equipments.module.css';

function EquipmentListModal({ modal, setModal, record, recordType }) {
  if (!record) return null;

  const toggle = () => setModal(false);

  const headerTitle =
    {
      UpdatesView: 'Update History',
      PurchasesView: 'Purchase History',
      UpdatesEdit: 'Edit Record',
    }[recordType] || '';

  return (
    <Modal isOpen={modal} size="xl" className={styles.ModalViewContainer}>
      <ModalHeader>Equipments &nbsp;{headerTitle}</ModalHeader>

      <ModalBody>
        <div>
          <Table bordered responsive hover>
            {recordType === 'UpdatesView' && (
              <>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Creator</th>
                  </tr>
                </thead>
                <tbody>
                  {(record.updateRecord || []).map(data => (
                    <tr key={data._id}>
                      <td>{moment.utc(data.date).format('LL')}</td>
                      <td>
                        {data.createdBy ? (
                          <a href={`/userprofile/${data.createdBy._id}`}>
                            {`${data.createdBy.firstName} ${data.createdBy.lastName}`}
                          </a>
                        ) : (
                          <span>-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}

            {recordType === 'PurchasesView' && (
              <>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Quantity</th>
                    <th>Creator</th>
                  </tr>
                </thead>
                <tbody>
                  {(record.purchaseRecord || []).map(data => (
                    <tr key={data._id}>
                      <td>{moment.utc(data.date).format('LL')}</td>
                      <td>{data.status || '-'}</td>
                      <td>{data.quantity || '-'}</td>
                      <td>
                        {data.requestedBy ? (
                          <a href={`/userprofile/${data.requestedBy._id}`}>
                            {`${data.requestedBy.firstName} ${data.requestedBy.lastName}`}
                          </a>
                        ) : (
                          <span>-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}
          </Table>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button onClick={toggle}>Close</Button>
      </ModalFooter>
    </Modal>
  );
}

export default EquipmentListModal;
