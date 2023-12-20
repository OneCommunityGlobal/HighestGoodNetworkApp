import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

export default function AddEquipmentModal({ modal, toggle }) {
  return (
    <Modal isOpen={modal}>
      <ModalHeader>Add Equipment Type</ModalHeader>
      <ModalBody>Form goes here</ModalBody>
      <ModalFooter>
        <Button size="lg" onClick={toggle}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}
