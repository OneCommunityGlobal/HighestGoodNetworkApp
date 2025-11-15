import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { useSelector } from 'react-redux';
import UpdateConsumable from './UpdateConsumable';
import styles from './UpdateConsumable.module.css';

function UpdateConsumableModal({ modal, setModal, record }) {
  const darkMode = useSelector(state => state.theme.darkMode);

  if (record) {
    const toggle = () => {
      setModal(false);
    };

    return (
      <Modal isOpen={modal} size="md" className={darkMode ? styles.updateModalBackdropDark : ''}>
        <ModalHeader className={darkMode ? 'bg-yinmn-blue text-light' : ''}>
          Update Consumable Form
        </ModalHeader>
        <ModalBody className={darkMode ? 'bg-space-cadet text-light' : ''}>
          <div className={styles.updateModalContainer}>
            <UpdateConsumable record={record} setModal={setModal} />
          </div>
        </ModalBody>
        <ModalFooter className={darkMode ? 'bg-space-cadet' : ''}>
          <Button
            onClick={toggle}
            className={darkMode ? styles.consumableButtonOutlineDark : styles.consumableButtonOutline}
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
  return null;
}

export default UpdateConsumableModal;
