import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import AddMaterialForm from './AddMaterial';

export default function AddMaterialModal({ isAMOpen, toggle }) {
  return (
    <Modal isOpen={isAMOpen} toggle={toggle} size="md">
      <ModalHeader toggle={toggle}>Add Material</ModalHeader>

      <ModalBody>
        <AddMaterialForm />
      </ModalBody>

      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}
