import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Label, Input } from 'reactstrap';

const RequirementModal = ({ isOpen, toggle, handleCheckbox, isChecked }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Requirements</ModalHeader>
      <ModalBody>
        Please only choose this option if you were born and lived for a fair amount of time (10+
        years) in the country you are stating you represent.
      </ModalBody>
      <ModalFooter className="justify-content-start">
        <Input
          type="checkbox"
          id="requirement-checkbox"
          checked={isChecked}
          onChange={() => handleCheckbox()}
        />
        <Label>I acknowledge and agree with the specified requirements</Label>
      </ModalFooter>
    </Modal>
  );
};

export default RequirementModal;
