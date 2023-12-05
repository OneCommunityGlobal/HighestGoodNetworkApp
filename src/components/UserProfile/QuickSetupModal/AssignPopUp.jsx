import React, { useState } from 'react';
import { deleteTitleById } from '../../../actions/title';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
} from 'reactstrap';



const AssignPopUp = props => {
  const {isOpen, toggle, setIsOpen, title} = props;
  return (
    <React.Fragment>
    <Modal isOpen={isOpen} toggle={() => setIsOpen(false)} >
      <ModalHeader toggle={() => setIsOpen(false)}>
        Assign User as "Software Engieer"
      </ModalHeader>
      <ModalBody>
      <div className="">
        <h6>Team Code: {title?.teamCode}</h6>
        <h6>Project Assignment: {title?.projectAssigned}</h6>
        <h6>Media Folder: {title?.mediaFolder}</h6>
        <h6>Team Assignment: {title?.teamAssigned}</h6>
      </div>
      </ModalBody>
      <ModalFooter>
      <div className="col text-center">
        <Button className="bg-success m-3" onClick={() => setIsOpen(false)}>Yes</Button>
        <Button className="bg-danger m-3" onClick={() => setIsOpen(false)}>No</Button>
        <Button className="bg-warning m-3" onClick={() => deleteTitleById(title._id)}>Delete</Button>
      </div>
      </ModalFooter>
    </Modal>
    </React.Fragment>

  )
}

export default AssignPopUp;