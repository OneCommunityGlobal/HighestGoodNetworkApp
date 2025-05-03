import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
// import UpdateMaterial from './UpdateMaterial';
import './UpdateTool.css';

function UpdateToolModal({ modal, setModal, record }) {
  if (record) {
    const toggle = () => {
      setModal(false);
    };

    return (
      <Modal isOpen={modal} size="md">
        <ModalHeader>Update Tool Form</ModalHeader>
        <ModalBody>
          <div className="updateModalContainer">Under Construction</div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={toggle}>Close</Button>
        </ModalFooter>
      </Modal>
    );
  }
  return null;
}

export default UpdateToolModal;
