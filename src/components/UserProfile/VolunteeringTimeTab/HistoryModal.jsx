import { useSelector } from 'react-redux';
import { Modal, ModalBody, ModalHeader, ModalFooter, Button, Table } from 'reactstrap';

function HistoryModal({ isOpen, toggle, userName, userHistory }) {
  const darkMode = useSelector(state => state.theme.darkMode);

  return (
    <div>
      <Modal isOpen={isOpen} toggle={toggle} className={darkMode ? 'text-light dark-mode' : ''}>
        <ModalHeader toggle={toggle} className={darkMode ? 'bg-space-cadet' : ''}>
          Past Promised Hours
        </ModalHeader>
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
          {!userHistory || userHistory?.length <= 1 ? (
            <p>{userName} has never made any changes to the promised hours.</p>
          ) : (
            <Table striped>
              <thead>
                <tr>
                  <th>Promised Hours</th>
                  <th>Starting Date (from most recent)</th>
                </tr>
              </thead>
              <tbody>
                {userHistory?.length
                  ? [...userHistory].reverse().map(item => (
                      <tr key={item._id}>
                        <td style={{ textAlign: 'center' }}>{item.hours}</td>
                        <td style={{ textAlign: 'center' }}>
                          {new Date(item.dateChanged).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  : null}
              </tbody>
            </Table>
          )}
        </ModalBody>
        <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
          <Button onClick={toggle} color="secondary" className="float-left">
            {' '}
            Ok{' '}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default HistoryModal;
