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
  // if (recordType === 'Usage') {
  //   return (
  //     <>
  //       <thead>
  //         <tr>
  //           <th>Date</th>
  //           <th>Qty</th>
  //           <th>Creator</th>
  //         </tr>
  //       </thead>
  //       <tbody>
  //         {record.map(({ date, quantityUsed, createdBy }) => {
  //           return (
  //             <tr key={date + createdBy._id}>
  //               <td>{moment(date).format('MM/DD/YY')}</td>
  //               <td>{quantityUsed}</td>
  //               <td>
  //                 <a href={`/userprofile/${createdBy._id}`}>
  //                   {`${createdBy.firstName} ${createdBy.lastName}`}
  //                 </a>
  //               </td>
  //             </tr>
  //           );
  //         })}
  //       </tbody>
  //     </>
  //   );
  // }

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
          {record.updateRecord.map((data, idx) => {
            return (
              <tr key={idx}>
                <td>{moment.utc(data.date).format('LL')}</td>
                <td>{data.quantityUsed + ' ' + record.itemType?.unit || '-'}</td>
                <td>{data.quantityWasted + ' ' + record.itemType?.unit || '-'}</td>
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
  if (recordType === 'Purchase') {
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
          {record.map(({ date, status, quantity, requestedBy }) => {
            return (
              <tr key={date + requestedBy._id}>
                <td>{moment(date).format('MM/DD/YY')}</td>
                <td>{status}</td>
                <td>{quantity || '-'}</td>
                <td>
                  <a href={`/userprofile/${requestedBy._id}`}>
                    {`${requestedBy.firstName} ${requestedBy.lastName}`}
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
