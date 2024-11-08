import { useState } from 'react';
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
import AssignProjectField from './AssignProjectField';
import AssignTeamField from './AssignTeamField';
import { useSelector } from 'react-redux';
import "../../Header/DarkMode.css"

function AddNewTitleModal({ isOpen, setIsOpen, refreshModalTitles, teamsData, projectsData, setWarningMessage, setShowMessage }) {
  const darkMode = useSelector(state => state.theme.darkMode)

  const [titleData, setTitleData] = useState({
    titleName: '',
    mediaFolder: '',
    teamCode: '',
    projectAssigned: '',
    // teamAssiged: {},
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

  const cleanProjectAssign = () => {
    setTitleData(prev => ({
      ...prev,
      projectAssigned: "",
    }));
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

  const cleanTeamAssigned = () => {
    // if clean all input field -> no team selected
    const updatedTitleData = { ...titleData };
    delete updatedTitleData.teamAssiged;
    setTitleData(updatedTitleData);
  };

  const undoTeamAssigned = () => {
    setTitleData(prev => ({
      ...prev,
      teamAssiged: {
        teamName: searchText,
        _id: "N/A",
      },
    }));
  };


  // confirm and save
  const confirmOnClick = () => {
    addTitle(titleData)
      .then((resp) => {
        if (resp.status !== 200) {
          setWarningMessage({ title: "Error", content: resp.message });
          setShowMessage(true);
        } else {
          setIsOpen(false);
          refreshModalTitles();
        };
      })
      .catch(e => {
        console.log(e);
      });
  };

  const fontColor = darkMode ? 'text-light' : '';


  return (
    <Modal isOpen={isOpen} toggle={() => setIsOpen(false)} className={darkMode ? 'text-light dark-mode' : ''}>
      <ModalHeader toggle={() => setIsOpen(false)} className={darkMode ? "bg-space-cadet" : ""}>Add A New Title</ModalHeader>
      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Form>
          <FormGroup>
            <Label className={fontColor}>Title Name<span className='qsm-modal-required'>*</span>: </Label>
            <Input
              type="text"
              name="text"
              id="mediafolder"
              onChange={e => {
                e.persist();
                setTitleData(prev => ({ ...prev, titleName: e.target.value }));
              }}
            />

            <Label className={fontColor}>Media Folder<span className='qsm-modal-required'>*</span>: </Label>
            <Input
              type="text"
              name="text"
              id="mediafolder"
              onChange={e => {
                e.persist();
                setTitleData(prev => ({ ...prev, mediaFolder: e.target.value }));
              }}
            />
            <Label className={fontColor}>Team Code<span className='qsm-modal-required'>*</span>:</Label>
            <Input
              type="text"
              placeholder="X-XXX"
              onChange={e => {
                e.persist();
                setTitleData(prev => ({ ...prev, teamCode: e.target.value }));
              }}
            />
            <Label className={fontColor}>Project Assignment<span className='qsm-modal-required'>*</span>:</Label>
            <AssignProjectField
              projectsData={projectsData}
              onDropDownSelect={selectProject}
              selectedProject={selectedProject}
              cleanProjectAssign={cleanProjectAssign}
              onSelectProject={onSelectProject}
            />
            <Label className={fontColor}>Team Assignment:</Label>
            <AssignTeamField
              teamsData={teamsData}
              onDropDownSelect={selectTeam}
              selectedTeam={selectedTeam}
              setSearchText={setSearchText}
              searchText={searchText}
              cleanTeamAssigned={cleanTeamAssigned}
              onSelectTeam={onSelectTeam}
              undoTeamAssigned={undoTeamAssigned}
            />
          </FormGroup>
        </Form>
      </ModalBody>

      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
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
