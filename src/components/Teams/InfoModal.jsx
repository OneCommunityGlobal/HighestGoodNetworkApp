import React from 'react';
import { Modal, ModalBody, ModalHeader, ModalFooter, Button } from 'reactstrap';

const InfoModal = ({ isOpen, toggle }) => (
  <div>
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>See All functionality </ModalHeader>
      <ModalBody>
        <p>
          
        </p>
      </ModalBody>
      <ModalFooter>
        <Button onClick={toggle} color="secondary" className="float-left">
          {' '}
          Ok{' '}
        </Button>
      </ModalFooter>
    </Modal>
  </div>
);

export default InfoModal;
