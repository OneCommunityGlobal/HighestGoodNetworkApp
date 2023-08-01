/* eslint-disable */
import React from 'react';
import { Modal, ModalBody, ModalHeader, ModalFooter, Button } from 'reactstrap';

const InfoModal = ({ isOpen, toggle }) => (
  <div>
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>User Profile Info</ModalHeader>
      <ModalBody>
        <p>
          This is your One Community Profile Page! It is used to share your information relevant to
          your manager and fellow team members. Please add your picture and be sure the the “Links”
          and “Basic Information” sections are correct for you.
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
