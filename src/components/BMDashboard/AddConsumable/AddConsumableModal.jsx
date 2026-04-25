import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import AddConsumable from './AddConsumable';
import PropTypes from 'prop-types';

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
AddConsumableModal.propTypes = {
  toggle: PropTypes.func.isRequired,
  isACOpen: PropTypes.any,
};
