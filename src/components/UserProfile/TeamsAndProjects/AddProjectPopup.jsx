import React, { useState, useEffect } from 'react';
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter, Input,
} from 'reactstrap';
import AddProjectsAutoComplete from './AddProjectsAutoComplete';

const AddProjectPopup = React.memo((props) => {
  const closePopup = () => { props.onClose(); };
  const [selectedProject, onSelectProject] = useState(undefined);
  const [isValidTeam, onValidation] = useState(true);
  const onAssignTeam = () => {
    if (selectedProject && !props.projects.some((x) => x._id === selectedProject._id)) {
      props.onSelectAssignTeam(selectedProject)
    } else {
      onValidation(false);
    }
  };
  const selectProject = (team) => {
    onSelectProject(team);
    onValidation(true);
  };

  useEffect(() => {
    onValidation(true);
  }, [props.open]);

  return (
    <Modal isOpen={props.open} toggle={closePopup}>
      <ModalHeader toggle={closePopup}>Add Project </ModalHeader>
      <ModalBody style={{ textAlign: 'center', display: 'flex' }}>

        <AddProjectsAutoComplete
          projectsData={props.projects}
          onDropDownSelect={selectProject} />
        <Button color='primary' style={{ marginLeft: '5px' }} onClick={() => {
          props.onSelectAssignProject(selectedProject)
        }}>Confirm</Button>

      </ModalBody>
      <ModalFooter>

        <Button color="secondary" onClick={closePopup}>Close</Button>
      </ModalFooter>
    </Modal>
  );
});
export default AddProjectPopup;
