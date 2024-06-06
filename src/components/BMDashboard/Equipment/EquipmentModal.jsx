import { useSelector } from 'react-redux';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

function EquipmentModal({ modal, toggle, title, value }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  return (
    <Modal isOpen={modal} toggle={toggle} className={darkMode ? 'dark-mode text-light' : ''}>
      <ModalHeader toggle={toggle} className={darkMode ? 'bg-space-cadet' : ''}>
        {title}
      </ModalHeader>
      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>{value}</ModalBody>
      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Button color="secondary" onClick={toggle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default EquipmentModal;
