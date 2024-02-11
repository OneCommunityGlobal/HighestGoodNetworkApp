import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table } from 'reactstrap';
import './Equipments.css';
import moment from 'moment';

function EquipmentsViewModal({ modal, setModal, record, recordType }) {
  if (record) {
    const toggle = () => {
      setModal(false);
    };

    return (
      <Modal isOpen={modal} size="xl" className="ModalViewContainer">
        <ModalHeader>
          Equipments &nbsp;
          {recordType === 'UpdatesView' && 'Update History'}
          {recordType === 'PurchasesView' && 'Purchase History'}
          {recordType === 'UpdatesEdit' && 'Edit Record'}
        </ModalHeader>
        <ModalBody>
          <div>
            <Table>
              <Record record={record} recordType={recordType} />
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

export default EquipmentsViewModal;

function Record({ record, recordType }) {
  if (recordType === 'UpdatesView') {
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
          {record.updateRecord.map(data => {
            return (
              <tr key={data._id}>
                <td>{moment.utc(data.date).format('LL')}</td>
                <td>{`${data.quantityUsed}` || '-'}</td>
                <td>{`${data.quantityWasted}` || '-'}</td>
                <td>
                  <a href={`/userprofile/${data.createdBy._id}`}>
                    {`${data.createdBy.firstName} ${data.createdBy.lastName}`}
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </>
    );
  }
  if (recordType === 'PurchasesView') {
    return (
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
          {record.purchaseRecord.map(data => {
            return (
              <tr key={data._id}>
                <td>{moment.utc(data.date).format('LL')}</td>
                <td>{`${data.status} ` || '-'}</td>
                <td>{`${data.quantity}` || '-'}</td>
                <td>
                  <a href={`/userprofile/${data.requestedBy._id}`}>
                    {`${data.requestedBy.firstName} ${data.requestedBy.lastName}`}
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </>
    );
  }

  return null;
}
