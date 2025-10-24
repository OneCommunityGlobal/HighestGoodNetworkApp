import React from "react";
import { Modal, ModalHeader, ModalBody, Button } from "reactstrap";

const ConfirmRemoveModal = ({ isOpen, toggleModal, confirmRemove }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggleModal}>
      <ModalHeader toggle={toggleModal}>Remove Profile Image</ModalHeader>
      <ModalBody>
        <p>Are you sure you want to remove the selected profile image?</p>
        <div className="button-group">
          <Button color="secondary" onClick={toggleModal} className="modal-button">
            Cancel
          </Button>
          <Button
            color="danger"
            onClick={confirmRemove}
            className="modal-button"
            style={{ marginLeft: '10px' }}
          >
            Confirm
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default ConfirmRemoveModal;
