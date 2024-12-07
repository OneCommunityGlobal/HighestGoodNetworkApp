import { Modal, ModalBody, ModalFooter } from 'reactstrap';
import { Button } from 'react-bootstrap';

function ConfirmationModal({ showConfirmModal, handleDeleteTags, setConfirmModal }) {
  return (
    <Modal isOpen={showConfirmModal} toggle={() => setConfirmModal(false)}>
      <ModalBody>
        <p>
          Whoa tiger! This is a very aggressive move... please confirm you are SURE you want to do
          this. Deleting tags cannot be undone and removes them from every lesson that uses them,
          not just this one.
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
          Yep, I&apos;m sure, scratch them!
        </Button>
        <Button color="secondary" onClick={() => setConfirmModal(false)}>
          No, take me back!
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default ConfirmationModal;
