import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

const ProfilePictureModal = ({ isOpen, toggle, error }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Profile Picture Error</ModalHeader>
      <ModalBody>{error.message}</ModalBody>
      <ModalFooter className="justify-content-start">
        {error.type === 'size' && (
          <Button
            color="info"
            onClick={() => {
              window.open('https://picresize.com/');
            }}
          >
            Resize
          </Button>
        )}
        <Button color="primary" onClick={toggle} >
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ProfilePictureModal;
