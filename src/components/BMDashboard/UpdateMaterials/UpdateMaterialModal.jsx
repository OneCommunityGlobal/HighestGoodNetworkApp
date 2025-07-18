/* eslint-disable import/namespace */
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
// eslint-disable-next-line import/default, import/no-named-as-default, import/no-named-as-default-member
import UpdateMaterial from './UpdateMaterial';
import styles from './UpdateMaterial.module.css';

function UpdateMaterialModal({ modal, setModal, record }) {
  if (record) {
    const toggle = () => {
      setModal(false);
    };

    return (
      <Modal isOpen={modal} size="md">
        <ModalHeader>Update Material Form</ModalHeader>
        <ModalBody>
          <div className={`${styles.updateModalContainer}`}>
            <UpdateMaterial setModal={setModal} record={record} />
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

export default UpdateMaterialModal;
