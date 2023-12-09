import React, { useState } from 'react';
import { addTitle } from '../../../actions/title';
import PropTypes from 'prop-types';
import AddTeamsAutoComplete from '../TeamsAndProjects/AddTeamsAutoComplete';
import AddProjectsAutoComplete from '../TeamsAndProjects/AddProjectsAutoComplete';
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


const AddNewTitle = props => {
const { isOpen, toggle, setIsOpen, onAddTitle, setSubmit, submittoggler, teamsData, projectsData } = props;
const [titleData, setTitleData] = useState({titleName: '', mediaFolder: '', teamCode: '', projectAssigned: '', teamAssiged: ''})
const [selectedTeam, onSelectTeam] = useState(undefined);

const [selectedProject, onSelectProject] = useState(undefined);
const [isValidProject, onValidation] = useState(false);

const selectProject = project => {
  onSelectProject(project);
  setTitleData(prev => ({...prev, projectAssigned: { projectName: project.projectName, _id: project._id, category: project.category }}))
  onValidation(true);
};

const selectTeam = team => {
  onSelectTeam(team);
  setTitleData(prev => ({...prev, teamAssiged: {
    teamName: team.teamName, _id: team._id}}))
  onValidation(true);
};

const confirmOnClick = () => {
  addTitle(titleData);
  setIsOpen(false);
  submittoggler ? setSubmit(false) : setSubmit(true);
}
return (
<React.Fragment>
<Modal isOpen={isOpen} toggle={() => setIsOpen(false)}>
  <ModalHeader toggle={() => setIsOpen(false)}>Add A New Title</ModalHeader>
  <ModalBody>
    <Form>
      <FormGroup>
      <Label>Title Name: </Label>
        <Input
          type="text"
          name="text"
          id="mediafolder"
          onChange= {e => {e.persist();
            setTitleData(prev => ({...prev, titleName: e.target.value}))}

          }
        >
        </Input>

        <Label>Media Folder: </Label>
        <Input
          type="text"
          name="text"
          id="mediafolder"
          onChange= {(e) => {e.persist();
            setTitleData(prev => ({...prev, mediaFolder: e.target.value}))}}

        >
        </Input>
        <Label>Team Code:</Label>
        <Input
          type="text"
          placeholder="X-XXX"
          onChange= {(e) => {e.persist();setTitleData(prev => ({...prev, teamCode: e.target.value}))}}

        >
        </Input>
        <Label>
          Project Assignment:
        </Label>
        <AddProjectsAutoComplete
            projectsData={projectsData}
            onDropDownSelect={selectProject}
            selectedProject={selectedProject}
          />
        <Label>
          Team Assignment:
        </Label>
        <AddTeamsAutoComplete
            teamsData={teamsData}
            onDropDownSelect={selectTeam}
            selectedTeam={selectedTeam}
          />

      </FormGroup>
    </Form>
    </ModalBody>
    <ModalFooter>

      <Button color="primary" onClick={() => confirmOnClick()}>
        Confirm
      </Button>

      <Button color="secondary" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
    </ModalFooter>
  </Modal>
  </React.Fragment>
  )
}

export default AddNewTitle;