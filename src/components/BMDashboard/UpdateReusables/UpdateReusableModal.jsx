import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import './UpdateReusable.css';

function UpdateReusableModal({ modal, setModal, record }) {
  if (record) {
    const toggle = () => {
      setModal(false);
    };

    return (
      <Modal isOpen={modal} size="md">
        <ModalHeader>Update Reusable Form</ModalHeader>
        <ModalBody>
          <div className="updateModalContainer" />
        </ModalBody>
        <ModalFooter>
          <Button onClick={toggle}>Close</Button>
        </ModalFooter>
      </Modal>
    );
  }
  return null;
}

export default UpdateReusableModal;
