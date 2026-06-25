import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table } from 'reactstrap';
import { useSelector } from 'react-redux';
import moment from 'moment';

import styles from './ToolRecordsModal.module.css';

/* Dark-mode styling for the (portal-rendered) modal. Neutralizes the global
   theme's "body.bm-dashboard-dark .modal-title { filter: invert(1) }" and gives
   the table light cell text (bootstrap's --bs-table-color otherwise forces dark). */
const DARK_MODAL_STYLE = `
  .dark-oxford-modal { background-color: #1b2a41 !important; color: #ffffff !important; }
  .dark-oxford-modal .modal-header,
  .dark-oxford-modal .modal-body,
  .dark-oxford-modal .modal-footer { background-color: #1b2a41 !important; color: #ffffff !important; border-color: rgba(255,255,255,0.08) !important; }
  .dark-oxford-modal .modal-title { color: #ffffff !important; filter: none !important; }
  .dark-oxford-modal table { --bs-table-color: #e8edf4; --bs-table-bg: transparent; }
  .dark-oxford-modal thead th { background-color: #24344d !important; color: #ffffff !important; border-color: #334155 !important; }
  .dark-oxford-modal tbody td, .dark-oxford-modal tbody th { color: #e8edf4 !important; border-color: #334155 !important; }
  .dark-oxford-modal a:not(.btn) { color: #74b6ff !important; }
`;

export default function RecordsModal({ modal, setModal, record, setRecord, recordType }) {
  const darkMode = useSelector(state => state.theme.darkMode);

  if (record) {
    const toggle = () => {
      setModal(false);
      setRecord(null);
    };

    return (
      <>
        {darkMode && <style>{DARK_MODAL_STYLE}</style>}
        <Modal isOpen={modal} size="xl" contentClassName={darkMode ? 'dark-oxford-modal' : ''}>
          <ModalHeader>{recordType} Record</ModalHeader>
          <ModalBody>
            <div className={`${styles.recordsModalTableContainer}`}>
              <Table>
                <Record record={record} recordType={recordType} />
              </Table>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button onClick={toggle}>Close</Button>
          </ModalFooter>
        </Modal>
      </>
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
