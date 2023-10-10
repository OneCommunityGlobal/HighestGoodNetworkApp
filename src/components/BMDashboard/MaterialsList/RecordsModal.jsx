/* eslint-disable react/no-array-index-key */
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table } from 'reactstrap';
import moment from 'moment';

import './RecordsModal.css';

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
  if (recordType === 'Usage') {
    return (
      <>
        <thead>
          <tr>
            <th>Date</th>
            <th>Qty</th>
            <th>Creator</th>
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
                    {`${createdBy.firstName} ${createdBy.lastName}`}
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
            <th>Qty</th>
            <th>Action</th>
            <th>Cause</th>
            <th>Desc</th>
            <th>Creator</th>
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
                    {`${createdBy.firstName} ${createdBy.lastName}`}
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
            <th>Seller</th>
            <th>Qty</th>
            <th>Subtotal</th>
            <th>Taxes</th>
            <th>Shipping</th>
            <th>Creator</th>
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
                      {`${createdBy.firstName} ${createdBy.lastName}`}
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
