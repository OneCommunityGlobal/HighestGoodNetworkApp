import { Modal, ModalBody, ModalFooter } from 'reactstrap';
import { Button } from 'react-bootstrap';

function ConfirmationModal({ showConfirmModal, handleDeleteTags, setConfirmModal }) {
  return (
    <Modal isOpen={showConfirmModal} toggle={() => setConfirmModal(false)}>
      <ModalBody>
        <p>
          Are you sure you want to delete the selected tags? This action cannot be undone and will
          remove the tags from every lesson that uses them.
        </p>
      </ModalBody>
      <ModalFooter>
        <Button
          color="danger"
          onClick={() => {
            handleDeleteTags();
            setConfirmModal(false);
          }}
        >
          Confirm
        </Button>
        <Button color="secondary" onClick={() => setConfirmModal(false)}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default ConfirmationModal;
