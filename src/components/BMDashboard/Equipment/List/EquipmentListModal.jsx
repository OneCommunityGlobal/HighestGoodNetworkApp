import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table } from 'reactstrap';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment';
import styles from './Equipments.module.css';

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

function EquipmentListModal({ modal, setModal, record, recordType }) {
  const darkMode = useSelector(state => state.theme.darkMode);

  if (!record) return null;

  const toggle = () => setModal(false);

  const headerTitle =
    {
      UpdatesView: 'Update History',
      PurchasesView: 'Purchase History',
      UpdatesEdit: 'Edit Record',
    }[recordType] || '';

  return (
    <Modal
      isOpen={modal}
      size="xl"
      className={styles.ModalViewContainer}
      contentClassName={darkMode ? 'dark-oxford-modal' : ''}
    >
      {darkMode && <style>{DARK_MODAL_STYLE}</style>}
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
                  {Array.isArray(record.updateRecord) &&
                    record.updateRecord.map(data => (
                      <tr key={data._id}>
                        <td>{data.date ? moment.utc(data.date).format('LL') : '-'}</td>
                        <td>
                          {data.createdBy ? (
                            <a href={`/userprofile/${data.createdBy._id}`}>
                              {`${data.createdBy.firstName || ''} ${data.createdBy.lastName || ''}`}
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
                  {Array.isArray(record.purchaseRecord) &&
                    record.purchaseRecord.map(data => (
                      <tr key={data._id}>
                        <td>{data.date ? moment.utc(data.date).format('LL') : '-'}</td>
                        <td>{data.status || '-'}</td>
                        <td>{data.quantity != null ? data.quantity : '-'}</td>
                        <td>
                          {data.requestedBy ? (
                            <a href={`/userprofile/${data.requestedBy._id}`}>
                              {`${data.requestedBy.firstName || ''} ${data.requestedBy.lastName ||
                                ''}`}
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

EquipmentListModal.propTypes = {
  modal: PropTypes.bool.isRequired,
  setModal: PropTypes.func.isRequired,
  record: PropTypes.shape({
    updateRecord: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string,
        date: PropTypes.string,
        createdBy: PropTypes.shape({
          _id: PropTypes.string,
          firstName: PropTypes.string,
          lastName: PropTypes.string,
        }),
      }),
    ),
    purchaseRecord: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string,
        date: PropTypes.string,
        status: PropTypes.string,
        quantity: PropTypes.number,
        requestedBy: PropTypes.shape({
          _id: PropTypes.string,
          firstName: PropTypes.string,
          lastName: PropTypes.string,
        }),
      }),
    ),
  }),
  recordType: PropTypes.oneOf(['UpdatesView', 'PurchasesView', 'UpdatesEdit']),
};

EquipmentListModal.defaultProps = {
  record: null,
  recordType: '',
};

export default EquipmentListModal;
