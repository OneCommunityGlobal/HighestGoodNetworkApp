import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import UpdateMaterial from './UpdateMaterial';
import styles from './UpdateMaterial.module.css';
import { useSelector } from 'react-redux';

function UpdateMaterialModal({ modal, setModal, record }) {
  const darkMode = useSelector(state => state.theme.darkMode);

  if (record) {
    const toggle = () => {
      setModal(false);
    };

    return (
      <>
        {darkMode && (
          <style>
            {`
              .dark-oxford-modal {
                background-color: #1B2A41 !important; /* Muted Oxford Blue */
                color: #ffffff !important;
              }
              .dark-oxford-modal .modal-header,
              .dark-oxford-modal .modal-body,
              .dark-oxford-modal .modal-footer {
                background-color: #1B2A41 !important;
                color: #ffffff !important;
                border-color: rgba(255,255,255,0.08) !important;
              }
            `}
          </style>
        )}
        <Modal isOpen={modal} size="md" contentClassName={darkMode ? 'dark-oxford-modal' : ''}>
          <ModalHeader style={darkMode ? { backgroundColor: '#1B2A41', color: '#ffffff' } : {}}>
            Update Material Form
          </ModalHeader>
          <ModalBody style={darkMode ? { backgroundColor: '#1B2A41', color: '#ffffff' } : {}}>
            <div className={`${styles.updateModalContainer}`}>
              <UpdateMaterial setModal={setModal} record={record} />
            </div>
          </ModalBody>
          <ModalFooter style={darkMode ? { backgroundColor: '#1B2A41', color: '#ffffff' } : {}}>
            <Button onClick={toggle}>Close</Button>
          </ModalFooter>
        </Modal>
      </>
    );
  }
  return null;
}

export default UpdateMaterialModal;
