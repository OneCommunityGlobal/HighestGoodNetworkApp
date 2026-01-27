import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import AddConsumable from './AddConsumable';

export default function AddConsumableModal({ isACOpen, toggle }) {
  return (
    <Modal isOpen={isACOpen} toggle={toggle} size="md">
      <ModalHeader toggle={toggle}>Add Consumable</ModalHeader>
      <ModalBody>
        <AddConsumable toggle={toggle} />
      </ModalBody>
      <ModalFooter>
        <Button onClick={toggle}>Close</Button>
      </ModalFooter>
    </Modal>
  );
}
