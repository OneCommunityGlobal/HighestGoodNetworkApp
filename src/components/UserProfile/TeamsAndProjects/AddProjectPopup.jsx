import React, { useState, useEffect } from 'react';
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Alert,
} from 'reactstrap';
import AddProjectsAutoComplete from './AddProjectsAutoComplete';

const AddProjectPopup = React.memo((props) => {
  const closePopup = () => { props.onClose(); };

  const [selectedProject, onSelectProject] = useState(undefined);
  const [isValidProject, onValidation] = useState(true);

  const onAssignProject = () => {
    if (selectedProject && !props.userProjectsById.some((x) => x._id === selectedProject._id)) {
      props.onSelectAssignProject(selectedProject)
    } else {
      onValidation(false);
    }
  };
  const selectProject = (project) => {
    onSelectProject(project);
    onValidation(true);
  };

  useEffect(() => {
    onValidation(true);
  }, [props.open]);

  return (
    <Modal isOpen={props.open} toggle={closePopup}>
      <ModalHeader toggle={closePopup}>Add Project </ModalHeader>
      <ModalBody style={{ textAlign: 'center' }}>
        <div className="input-group-prepend" style={{ marginBottom: '10px' }}>
          <AddProjectsAutoComplete
            projectsData={props.projects}
            onDropDownSelect={selectProject} />
          <Button color='primary' style={{ marginLeft: '5px' }} onClick={onAssignProject} >Confirm</Button>
        </div>
        <div>
          {(isValidProject === false) ? (<Alert color="danger">Please choose a valid project which is not already added.</Alert>) : <></>}
        </div>

      </ModalBody>
      <ModalFooter>

        <Button color="secondary" onClick={closePopup}>Close</Button>
      </ModalFooter>
    </Modal>
  );
});
export default AddProjectPopup;
