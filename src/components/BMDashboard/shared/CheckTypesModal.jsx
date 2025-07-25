import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import CheckTypes from './CheckTypes';
import styles from '../ToolItemList/ToolRecordsModal.module.css';

function CheckTypesModal({ modal, setModal, type }) {
  const toggle = () => {
    setModal(false);
  };
  return (
    <Modal isOpen={modal} size="xl">
      <ModalHeader>
        {type === 'Equipments' ? 'Equipment' : type}
        <br />
        <i style={{ fontSize: '11px' }}>
          <span className="text-secondary">
            This page displays the existing {type === 'Equipments' ? 'Equipment' : type} in the
            inventory.{' '}
          </span>
        </i>
      </ModalHeader>
      <ModalBody>
        <div className={`${styles.recordsModalTableContainer}`}>
          <CheckTypes type={type} />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button onClick={toggle}>Close</Button>
      </ModalFooter>
    </Modal>
  );
}

export default CheckTypesModal;
