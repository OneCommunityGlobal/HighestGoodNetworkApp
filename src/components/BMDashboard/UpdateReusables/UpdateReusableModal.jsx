import { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import UpdateReusable from './UpdateReusable';
import './UpdateReusable.css';

function UpdateReusableModal({ modal, setModal, record }) {
  const [cancelSignal, setCancelSignal] = useState(0);

  const toggle = () => {
    setModal(false);
    setCancelSignal(prev => prev + 1); // Increment to reset form
  };

  if (record) {
    return (
      <Modal isOpen={modal} size="md" toggle={toggle}>
        <ModalHeader toggle={toggle}>Update Reusable Form</ModalHeader>
        <ModalBody>
          <UpdateReusable record={record} setModal={setModal} bulk={false} cancel={cancelSignal} />
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggle}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
  return null;
}

export default UpdateReusableModal;
