import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table } from 'reactstrap';

export default function RecordsModal({ modal, setModal, record, setRecord, recordType }) {
  if (record) {
    const toggle = () => {
      setModal(false);
      setRecord(null);
    };

    return (
      <Modal isOpen={modal} style={{ width: '60%' }}>
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
            <th>Qty</th>
            <th>Logged by</th>
          </tr>
        </thead>
        <tbody>
          {record.map((entry, i) => (
            <tr key={i}>
              <td>{entry.date}</td>
              <td>{entry.quantityUsed}</td>
              <td>{entry.createdBy}</td>
            </tr>
          ))}
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
            <th>Qty</th>
            <th>Action</th>
            <th>Cause</th>
            <th>Description</th>
            <th>Logged by</th>
          </tr>
        </thead>
        <tbody>
          {record.map((entry, i) => (
            <tr key={i}>
              <td>{entry.date}</td>
              <td>{entry.quantity}</td>
              <td>{entry.action}</td>
              <td>{entry.cause}</td>
              <td>{entry.description}</td>
              <td>{entry.createdBy}</td>
            </tr>
          ))}
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
            <th>Qty</th>
            <th>Subtotal</th>
            <th>Taxes</th>
            <th>Shipping</th>
            <th>Created by</th>
          </tr>
        </thead>
        <tbody>
          {record.map((entry, i) => (
            <tr key={i}>
              <td>{entry.date}</td>
              <td>{entry.poId}</td>
              <td>{entry.sellerId}</td>
              <td>{entry.quantity}</td>
              <td>{entry.subtotal}</td>
              <td>{entry.tax}</td>
              <td>{entry.shipping}</td>
              <td>{entry.createdBy}</td>
            </tr>
          ))}
        </tbody>
      </>
    );
  }

  return null;
}
