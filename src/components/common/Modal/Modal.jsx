
import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
const ModalExample = (props) => {
    const {
      isOpen,
      closeModal,
      modalTitle,
      modalMessage
    } = props;
  
    const [modal, setModal] = useState(false);
  
    const toggle = () => setModal(!modal);
  
    return (
       
        <Modal isOpen={isOpen} toggle={closeModal}   >
          <ModalHeader toggle={closeModal}>{modalTitle}</ModalHeader>
          <ModalBody>
           {modalMessage}     </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={closeModal}>Close</Button>{' '}
          
          </ModalFooter>
        </Modal>
 
    );
  }
  
  export default ModalExample;