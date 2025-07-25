import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import UpdateConsumable from './UpdateConsumable';
import styles from './UpdateConsumable.module.css';

function UpdateConsumableModal({ modal, setModal, record }) {
  if (record) {
    const toggle = () => {
      setModal(false);
    };

    return (
      <Modal isOpen={modal} size="md">
        <ModalHeader>Update Consumable Form</ModalHeader>
        <ModalBody>
          <div className={`${styles.updateModalContainer}`}>
            <UpdateConsumable record={record} setModal={setModal} />
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

export default UpdateConsumableModal;
