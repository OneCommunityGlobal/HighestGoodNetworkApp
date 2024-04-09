import React, { useState } from 'react';
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
import { addTitle } from '../../../actions/title';
import AddTeamsAutoComplete from '../TeamsAndProjects/AddTeamsAutoComplete';
import AddProjectsAutoComplete from '../TeamsAndProjects/AddProjectsAutoComplete';

function AddNewTitleModal({ isOpen, setIsOpen, refreshModalTitles, teamsData, projectsData,setWarningMessage, setShowMessage }) {
  const [titleData, setTitleData] = useState({
    titleName: '',
    mediaFolder: '',
    teamCode: '',
    projectAssigned: '',
    teamAssiged: '',
  });
  const [selectedTeam, onSelectTeam] = useState(undefined);
  const [selectedProject, onSelectProject] = useState(undefined);
  const [isValidProject, onValidation] = useState(false);
  const [searchText, setSearchText] = useState(''); // For addTeamAutoComplete

  const selectProject = project => {
    onSelectProject(project);
    setTitleData(prev => ({
      ...prev,
      projectAssigned: {
        projectName: project.projectName,
        _id: project._id,
        category: project.category,
      },
    }));
    onValidation(true);
  };

  const selectTeam = team => {
    onSelectTeam(team);
    setTitleData(prev => ({
      ...prev,
      teamAssiged: {
        teamName: team.teamName,
        _id: team._id,
      },
    }));
    onValidation(true);
  };

  // confirm and save
  const confirmOnClick = () => {
    addTitle(titleData)
      .then((resp) => {
        if (resp.status !== 200){
          setWarningMessage({title:"Error", content:resp.message});
          setShowMessage(true);
        }else{
          setIsOpen(false);
          refreshModalTitles();
        };
      })
      .catch(e => {
        console.log(e);
      });
  };

  return (
    <Modal isOpen={isOpen} toggle={() => setIsOpen(false)}>
      <ModalHeader toggle={() => setIsOpen(false)}>Add A New Title</ModalHeader>
      <ModalBody>
        <Form>
          <FormGroup>
            <Label>Title Name<span className='qsm-modal-required'>*</span>: </Label>
            <Input
              type="text"
              name="text"
              id="mediafolder"
              onChange={e => {
                e.persist();
                setTitleData(prev => ({ ...prev, titleName: e.target.value }));
              }}
            />

            <Label>Media Folder<span className='qsm-modal-required'>*</span>: </Label>
            <Input
              type="text"
              name="text"
              id="mediafolder"
              onChange={e => {
                e.persist();
                setTitleData(prev => ({ ...prev, mediaFolder: e.target.value }));
              }}
            />
            <Label>Team Code<span className='qsm-modal-required'>*</span>:</Label>
            <Input
              type="text"
              placeholder="X-XXX"
              onChange={e => {
                e.persist();
                setTitleData(prev => ({ ...prev, teamCode: e.target.value }));
              }}
            />
            <Label>Project Assignment<span className='qsm-modal-required'>*</span>:</Label>
            <AddProjectsAutoComplete
              projectsData={projectsData}
              onDropDownSelect={selectProject}
              selectedProject={selectedProject}
            />
            <Label>Team Assignment:</Label>
            <AddTeamsAutoComplete
              teamsData={teamsData}
              onDropDownSelect={selectTeam}
              selectedTeam={selectedTeam}
              setSearchText={setSearchText}
              searchText={searchText}
              setNewTeamName={() => console.log('test')}
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
  );
}

export default AddNewTitleModal;
