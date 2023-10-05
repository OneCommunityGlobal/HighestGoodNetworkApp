import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table } from 'reactstrap';
import moment from 'moment';

export default function RecordsModal({ modal, setModal, record, setRecord, recordType }) {
  if (record) {
    const toggle = () => {
      setModal(false);
      setRecord(null);
    };

    return (
      <Modal isOpen={modal} size="lg">
        <ModalHeader>{recordType} Record</ModalHeader>
        <ModalBody>
          <Table>
            <Record record={record} recordType={recordType} />
          </Table>
        </ModalBody>
        <ModalFooter>
          <Button onClick={toggle}>Close</Button>
        </ModalFooter>
      </Modal>
    );
  }
  return null;
}

export function Record({ record, recordType }) {
  if (recordType === 'Usage') {
    return (
      <>
        <thead>
          <tr>
            <th>Date</th>
            <th>Quantity</th>
            <th>Created by</th>
          </tr>
        </thead>
        <tbody>
          {record.map(({ date, quantityUsed, createdBy }, i) => {
            return (
              <tr key={i}>
                <td>{moment(date).format('MM/DD/YY')}</td>
                <td>{quantityUsed}</td>
                <td>
                  <a href={`/userprofile/${createdBy._id}`}>
                    {createdBy.firstName + ' ' + createdBy.lastName}
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </>
    );
  }
  if (recordType === 'Update') {
    return (
      <>
        <thead>
          <tr>
            <th>Date</th>
            <th>Quantity</th>
            <th>Action</th>
            <th>Cause</th>
            <th>Description</th>
            <th>Created by</th>
          </tr>
        </thead>
        <tbody>
          {record.map(({ date, quantity, action, cause, description, createdBy }, i) => {
            return (
              <tr key={i}>
                <td>{moment(date).format('MM/DD/YY')}</td>
                <td>{quantity}</td>
                <td>{action}</td>
                <td>{cause}</td>
                <td>{description}</td>
                <td>
                  <a href={`/userprofile/${createdBy._id}`}>
                    {createdBy.firstName + ' ' + createdBy.lastName}
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
            <th>Date</th>
            <th>PO</th>
            <th>Seller ID</th>
            <th>Quantity</th>
            <th>Subtotal</th>
            <th>Taxes</th>
            <th>Shipping</th>
            <th>Created by</th>
          </tr>
        </thead>
        <tbody>
          {record.map(
            ({ date, poId, sellerId, quantity, subtotal, tax, shipping, createdBy }, i) => {
              return (
                <tr key={i}>
                  <td>{moment(date).format('MM/DD/YY')}</td>
                  <td>{poId}</td>
                  <td>{sellerId}</td>
                  <td>{quantity}</td>
                  <td>{subtotal}</td>
                  <td>{tax}</td>
                  <td>{shipping}</td>
                  <td>
                    <a href={`/userprofile/${createdBy._id}`}>
                      {createdBy.firstName + ' ' + createdBy.lastName}
                    </a>
                  </td>
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
