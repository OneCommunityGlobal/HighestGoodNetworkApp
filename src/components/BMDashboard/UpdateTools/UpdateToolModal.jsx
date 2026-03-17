import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
// import UpdateMaterial from './UpdateMaterial';
import styles from './UpdateTool.module.css';

function UpdateToolModal({ modal, setModal, record }) {
  if (record) {
    const toggle = () => {
      setModal(false);
    };

    return (
      <Modal
        isOpen={modal}
        size="lg"
        className={styles.darkBlueModal}
        contentClassName={styles.darkBlueModalContent} // Add this
        backdropClassName={styles.darkBlueBackdrop}
      >
        <ModalHeader>Update Tool Form</ModalHeader>
        <ModalBody>
          <div className={`${styles.updateModalContainer}`}>Under Construction</div>
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
