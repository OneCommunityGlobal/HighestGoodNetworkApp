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
            <th>Condition</th>
            <th>Creator</th>
          </tr>
        </thead>
        <tbody>
          {record.updateRecord.map((data, index) => {
            return (
              // eslint-disable-next-line react/no-array-index-key
              <tr key={index}>
                <td>{moment.utc(data.date).format('LL')}</td>
                <td>{data.condition}</td>
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
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {record.map(
            ({ _id, date, status, makeModelPref, priority, quantity, requestedBy, usageDesc }) => {
              return (
                <tr key={_id}>
                  <td>{priority}</td>
                  <td>{makeModelPref}</td>
                  <td>{quantity || '-'}</td>
                  <td>
                    <a href={`/userprofile/${requestedBy?._id}`}>
                      {`${requestedBy?.firstName || 'Unknown'} ${requestedBy?.lastName || 'User'}`}
                    </a>
                  </td>
                  <td>{moment(date).format('MM/DD/YY')}</td>
                  <td>{status}</td>
                  <td>{usageDesc}</td>
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
