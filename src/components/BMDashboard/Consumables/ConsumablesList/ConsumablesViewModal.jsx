import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table } from 'reactstrap';
import './Consumables.css';
import moment from 'moment';
import UpdateConsumable from '../../UpdateConsumable/UpdateConsumable';

function ConsumablesViewModal({ modal, setModal, record, recordType }) {
  if (record) {
    const toggle = () => {
      setModal(false);
    };

    return (
      <Modal isOpen={modal} size="xl" className="ModalViewContainer">
        <ModalHeader>
          Consumables &nbsp;
          {recordType === 'UpdatesView' && 'Update History'}
          {recordType === 'PurchasesView' && 'Purchase History'}
          {recordType === 'UpdatesEdit' && 'Edit Record'}
        </ModalHeader>
        <ModalBody>
          <div>
            <Record record={record} recordType={recordType} setModal={setModal} />
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

export default ConsumablesViewModal;

function Record({ record, recordType, setModal }) {
  if (recordType === 'UpdatesView') {
    return (
      <Table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Quantity Used</th>
            <th>Quantity Wasted</th>
            <th>Creator</th>
          </tr>
        </thead>
        <tbody>
          {record.updateRecord.map(data => {
            return (
              <tr key={data._id}>
                <td>{moment.utc(data.date).format('LL')}</td>
                <td>{`${data.quantityUsed} ${record.itemType?.unit}` || '-'}</td>
                <td>{`${data.quantityWasted} ${record.itemType?.unit}` || '-'}</td>
                <td>
                  <a href={`/userprofile/${data.createdBy._id}`}>
                    {`${data.createdBy.firstName} ${data.createdBy.lastName}`}
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    );
  }
  if (recordType === 'PurchasesView') {
    return (
      <Table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Status</th>
            <th>Quantity</th>
            <th>Creator</th>
          </tr>
        </thead>
        <tbody>
          {record.purchaseRecord.map(data => {
            return (
              <tr key={data._id}>
                <td>{moment.utc(data.date).format('LL')}</td>
                <td>{`${data.status}` || '-'}</td>
                <td>{`${data.quantity} ${record.itemType?.unit}` || '-'}</td>
                <td>
                  <a href={`/userprofile/${data.requestedBy._id}`}>
                    {`${data.requestedBy.firstName} ${data.requestedBy.lastName}`}
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    );
  }

  if (recordType === 'UpdatesEdit') {
    return <UpdateConsumable record={record} setModal={setModal} />;
  }
  return null;
}
