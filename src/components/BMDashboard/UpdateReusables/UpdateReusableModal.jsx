import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import './UpdateReusable.css';
import UpdateReusable from './UpdateReusable';

function UpdateReusbableModal({ modal, setModal, record }) {
  const toggle = () => {
    setModal(false);
  };
  if (record) {
    return (
      <Modal isOpen={modal} size="md">
        <ModalHeader>Update Reusable Form</ModalHeader>
        <ModalBody>
          <div className="updateModalContainer">
            <UpdateReusable />
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

export default UpdateReusbableModal;
