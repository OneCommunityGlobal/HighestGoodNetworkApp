import React from 'react';
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter, Input,
} from 'reactstrap';
import AddProjectsAutoComplete from './AddProjectsAutoComplete';

const AddProjectPopup = React.memo((props) => {
  const closePopup = () => { props.onClose(); };

  return (
    <Modal isOpen={props.open} toggle={closePopup}>
      <ModalHeader toggle={closePopup}>Add Project </ModalHeader>
      <ModalBody style={{ textAlign: 'center', display: 'flex' }}>

        <AddProjectsAutoComplete
          projectsData={props.projectsData} />
        <Button color='primary' style={{ marginLeft: '5px' }}>Confirm</Button>

      </ModalBody>
      <ModalFooter>

        <Button color="secondary" onClick={closePopup}>Close</Button>
      </ModalFooter>
    </Modal>
  );
});
export default AddProjectPopup;
