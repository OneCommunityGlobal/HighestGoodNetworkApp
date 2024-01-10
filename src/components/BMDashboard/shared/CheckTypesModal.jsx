import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import CheckTypes from './CheckTypes';

function CheckTypesModal({ modal, setModal, type }) {
  const toggle = () => {
    setModal(false);
  };
  return (
    <Modal isOpen={modal} size="xl">
      <ModalHeader>{type}</ModalHeader>
      <ModalBody>
        <div className="records_modal_table_container">
          <CheckTypes type={type} />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button onClick={toggle}>Close</Button>
      </ModalFooter>
    </Modal>
  );
}

export default CheckTypesModal;
