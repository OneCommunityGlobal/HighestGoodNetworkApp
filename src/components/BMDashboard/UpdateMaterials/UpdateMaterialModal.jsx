import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import UpdateMaterial from './UpdateMaterial';
import './UpdateMaterial.css';

function UpdateMaterialModal({ modal, setModal, record }) {
  if (record) {
    const toggle = () => {
      setModal(false);
    };

    return (
      <Modal isOpen={modal} size="md">
        <ModalHeader>Update Material Form</ModalHeader>
        <ModalBody>
          <div className="updateModalContainer">
            <UpdateMaterial setModal={setModal} record={record} />
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

export default UpdateMaterialModal;
