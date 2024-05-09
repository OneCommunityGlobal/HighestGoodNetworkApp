import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalBody, ModalFooter, Input, Alert } from 'reactstrap';
import CustomHeader from 'components/common/Modal/CustomHeader';
import AddProjectsAutoComplete from './AddProjectsAutoComplete';
import { boxStyle, boxStyleDark } from 'styles';

const AddProjectPopup = React.memo(props => {
  const {darkMode} = props;

  const closePopup = () => {
    props.onClose();
  };

  const [selectedProject, onSelectProject] = useState(undefined);
  const [isValidProject, onValidation] = useState(true);

  const onAssignProject = async () => {
    if (selectedProject && !props.userProjectsById.some(x => x._id === selectedProject._id)) {
      await props.onSelectAssignProject(selectedProject);
      onSelectProject(undefined);
    } else {
      onValidation(false);
    }
    if (props.handleSubmit !== undefined) {
      props.handleSubmit();
    }
  };

  const selectProject = project => {
    onSelectProject(project);
    onValidation(true);
  };

  useEffect(() => {
    onValidation(true);
  }, [props.open]);
  
  return (
    <Modal isOpen={props.open} toggle={closePopup} autoFocus={false} className={darkMode ? 'text-light' : ''}>
      <CustomHeader title='Add Project' toggle={() => closePopup()}/>
      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''} style={{ textAlign: 'center' }}>
        <div className="input-group-prepend" style={{ marginBottom: '10px' }}>
          <AddProjectsAutoComplete
            projectsData={props.projects}
            onDropDownSelect={selectProject}
            selectedProject={selectedProject}
          />
          <Button
            color="primary"
            style={darkMode ? {} : { ...boxStyle, marginLeft: '5px' }}
            onClick={onAssignProject}
          >
            Confirm
          </Button>
        </div>
        <div>
          {!isValidProject && selectedProject && (
            <Alert color="danger">Great idea, but they already have that one! Pick another!</Alert>
          )}
          {!isValidProject && !selectedProject && (
            <Alert color="danger">Hey, You need to pick a project first!</Alert>
          )}
        </div>
      </ModalBody>
      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Button color="secondary" onClick={closePopup} style={darkMode ? boxStyleDark : boxStyle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
});
export default AddProjectPopup;
