import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table } from 'reactstrap';
import moment from 'moment';

import './ToolRecordsModal.css';

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

export function Record({ record, recordType }) {
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
          {record.updateRecord.map(data => {
            return (
              <tr key={data._id}>
                <td>{moment.utc(data.date).format('LL')}</td>
                <td>{`${data.quantityUsed} ${record.itemType?.unit || 'Unit'}` || '-'}</td>
                <td>{`${data.quantityWasted} ${record.itemType?.unit || 'Unit'}` || '-'}</td>
                <td>
                  <a href={`/userprofile/${data.createdBy._id}`}>
                    {`${data.createdBy?.firstName || 'Unknown'} 
                    ${data.createdBy?.lastName || 'Unknown'}`}
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
            <th>Priority</th>
            <th>Brand</th>
            <th>Quantity</th>
            <th>Requested By</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {record.map(({ _id, date, status, brandPref, priority, quantity, requestedBy }) => {
            return (
              <tr key={_id}>
                <td>{priority}</td>
                <td>{brandPref}</td>
                <td>{quantity || '-'}</td>
                <td>
                  <a href={`/userprofile/${requestedBy?._id}`}>
                    {`${requestedBy?.firstName || 'Unknown'} ${requestedBy?.lastName || 'User'}`}
                  </a>
                </td>
                <td>{moment(date).format('MM/DD/YY')}</td>
                <td>{status}</td>
              </tr>
            );
          })}
        </tbody>
      </>
    );
  }

  return null;
}
