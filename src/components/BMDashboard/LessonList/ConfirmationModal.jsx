import { Modal, ModalBody, ModalFooter } from 'reactstrap';
import { Button } from 'react-bootstrap';
import styles from './ConfirmationModal.module.css';

function ConfirmationModal({ showConfirmModal, handleDeleteTags, setConfirmModal, darkMode }) {
  return (
    <Modal
      isOpen={showConfirmModal}
      toggle={() => setConfirmModal(false)}
      contentClassName={darkMode ? styles.darkContent : ''}
    >
      <ModalBody className={darkMode ? styles.darkBody : ''}>
        <p>
          Are you sure you want to delete the selected tags? This action cannot be undone and will
          remove the tags from every lesson that uses them.
        </p>
      </ModalBody>
      <ModalFooter className={darkMode ? styles.darkFooter : ''}>
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
