import { useState, useEffect } from 'react';
import { useState, useEffect } from 'react';
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
import { useSelector } from 'react-redux';
import { useSelector } from 'react-redux';
import { addTitle, editTitle } from '../../../actions/title';
import AssignProjectField from './AssignProjectField';
import AssignTeamField from './AssignTeamField';
import AssignTeamCodeField from './AssignTeamCodeField';
import '../../Header/DarkMode.css';
import '../../Header/DarkMode.css';

function AddNewTitleModal({
  isOpen,
  setIsOpen,
  refreshModalTitles,
  teamsData,
  projectsData,
  setWarningMessage,
  setShowMessage,
  editMode,
  title,
}) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const teamCodes = useSelector(state => state.teamCodes.teamCodes || []);

  const [titleData, setTitleData] = useState(() => {
    if (editMode && Object.keys(title).length !== 0) {
      return {
        id: title._id,
        id: title._id,
        titleName: title.titleName,
        titleCode: title.titleCode,
        mediaFolder: title.mediaFolder,
        teamCode: title.teamCode,
        projectAssigned: title.projectAssigned,
        teamAssiged: title.teamAssiged == undefined ? { teamName: '', _id: '' } : title.teamAssiged,
      };
    }
    return {
      titleName: '',
      titleCode: '',
      mediaFolder: '',
      teamCode: '',
      projectAssigned: '',
      teamAssiged: {},
    };
      teamAssiged: {},
    };
  });

  const [isValidTeamCode, setIsValidTeamCode] = useState(true);

  useEffect(() => {
    if (editMode && Object.keys(title).length !== 0) {
      setTitleData({
        id: title._id,
        id: title._id,
        titleName: title.titleName,
        titleCode: title.titleCode || title.titleName.slice(0, 5),
        mediaFolder: title.mediaFolder,
        teamCode: title.teamCode,
        projectAssigned: title.projectAssigned,
        teamAssiged: title.teamAssiged,
      });
    } else
      setTitleData({
        titleName: '',
        mediaFolder: '',
        teamCode: '',
        projectAssigned: '',
        teamAssiged: {},
      });
  }, [title]);

  useEffect(() => {
    setIsValidTeamCode(
      titleData.teamCode === '' || teamCodes.some(code => code.value === titleData.teamCode),
    );
  }, [titleData.teamCode, teamCodes]);

  let existTeamName = new Set();

  if (teamsData?.allTeams) {
    const codes = teamsData.allTeams.map(team => team.teamCode);
    const names = teamsData.allTeams.map(team => team.teamName);
    // Use allTeamCode rather than allTeams since team code is not related to records in the Team table.
    // It is all distinct team codes from the UserProfile teamCode field.
    // existTeamCodes = new Set(teamsData?.allTeamCode?.distinctTeamCodes);
    existTeamName = new Set(names);
  }

  const [selectedTeam, onSelectTeam] = useState(undefined);
  const [selectedProject, onSelectProject] = useState(undefined);
  const [selectedTeamCode, onSelectTeamCode] = useState(undefined);
  const [isValidProject, onValidation] = useState(false);
  const [searchText, setSearchText] = useState(''); // For addTeamAutoComplete

  const selectProject = project => {
    onSelectProject(project);
    setTitleData({
    setTitleData({
      ...titleData,
      projectAssigned: {
        projectName: project.projectName,
        _id: project._id,
        category: project.category,
      },
    });
    });
    onValidation(true);
  };

  const selectTeamCode = teamCode => {
    onSelectTeamCode(teamCode);
    setTitleData({
    setTitleData({
      ...titleData,
      teamCode,
    });
  };
      teamCode,
    });
  };

  const cleanProjectAssign = () => {
    setTitleData({
    setTitleData({
      ...titleData,
      projectAssigned: '',
    });
      projectAssigned: '',
    });
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

  const cleanTeamCodeAssign = () => {
    setTitleData({
    setTitleData({
      ...titleData,
      teamCode: '',
    });
      teamCode: '',
    });
  };

  const cleanTeamAssigned = () => {
    // if clean all input field -> no team selected
    const updatedTitleData = { ...titleData };
    delete updatedTitleData.teamAssiged;
    setTitleData(updatedTitleData);
  };

  const undoTeamAssigned = () => {
    setTitleData({
    setTitleData({
      ...titleData,
      teamAssiged: {
        teamName: searchText,
        _id: 'N/A',
        _id: 'N/A',
      },
    });
    });
  };

  // confirm and save
  const confirmOnClick = () => {
  const confirmOnClick = () => {
    const isValidTeamName = onTeamNameValidation(titleData.teamAssiged);

    if (!isValidTeamName) {
      return;
      return;
    }
    if (editMode) {
      editTitle(titleData)
        .then(resp => {
          if (resp.status !== 200) {
            setWarningMessage({ title: 'Error', content: resp.message });
            setShowMessage(true);
          } else {
            setIsOpen(false);
            refreshModalTitles();
          }
        })
        .catch(e => {
          console.log(e);
        });
    } else {
        .then(resp => {
          if (resp.status !== 200) {
            setWarningMessage({ title: 'Error', content: resp.message });
            setShowMessage(true);
          } else {
            setIsOpen(false);
            refreshModalTitles();
          }
        })
        .catch(e => {
          console.log(e);
        });
    } else {
      addTitle(titleData)
        .then(resp => {
          if (resp.status !== 200) {
            setWarningMessage({ title: 'Error', content: resp.message });
            setShowMessage(true);
          } else {
            setIsOpen(false);
            refreshModalTitles();
          }
        })
        .catch(e => {
          console.log(e);
        });
        .then(resp => {
          if (resp.status !== 200) {
            setWarningMessage({ title: 'Error', content: resp.message });
            setShowMessage(true);
          } else {
            setIsOpen(false);
            refreshModalTitles();
          }
        })
        .catch(e => {
          console.log(e);
        });
    }
  };

  const onTeamNameValidation = teamName => {
    if (teamName && teamName !== '') {
      if (!existTeamName.has(teamName.teamName)) {
        setWarningMessage({ title: 'Error', content: 'Team Name Not Exists' });
        setWarningMessage({ title: 'Error', content: 'Team Name Not Exists' });
        setShowMessage(true);
        return false;
      }
    }
    setShowMessage(false);
    return true;
  };
  };

  const fontColor = darkMode ? 'text-light' : '';

  return (
    <Modal
      isOpen={isOpen}
      toggle={() => setIsOpen(false)}
      className={darkMode ? 'text-light dark-mode' : ''}
    >
      {editMode ? (
        <ModalHeader toggle={() => setIsOpen(false)} className={darkMode ? 'bg-space-cadet' : ''}>
          Edit Title
        </ModalHeader>
      ) : (
        <ModalHeader toggle={() => setIsOpen(false)} className={darkMode ? 'bg-space-cadet' : ''}>
          Add A New Title
        </ModalHeader>
      )}
    <Modal
      isOpen={isOpen}
      toggle={() => setIsOpen(false)}
      className={darkMode ? 'text-light dark-mode' : ''}
    >
      {editMode ? (
        <ModalHeader toggle={() => setIsOpen(false)} className={darkMode ? 'bg-space-cadet' : ''}>
          Edit Title
        </ModalHeader>
      ) : (
        <ModalHeader toggle={() => setIsOpen(false)} className={darkMode ? 'bg-space-cadet' : ''}>
          Add A New Title
        </ModalHeader>
      )}
      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Form>
          <FormGroup>
            <Label className={fontColor}>
              Title Name<span className="qsm-modal-required">*</span>:{' '}
            </Label>
            <Label className={fontColor}>
              Title Name<span className="qsm-modal-required">*</span>:{' '}
            </Label>
            <Input
              type="text"
              name="text"
              id="mediafolder"
              value={titleData.titleName}
              onChange={e => {
                e.persist();
                setTitleData({ ...titleData, titleName: e.target.value });
              }}
            />

            <Label className={fontColor}>
              Media Folder<span className="qsm-modal-required">*</span>:{' '}
            </Label>
            <Label className={fontColor}>
              Media Folder<span className="qsm-modal-required">*</span>:{' '}
            </Label>
            <Input
              type="text"
              name="text"
              id="mediafolder"
              value={titleData.mediaFolder}
              onChange={e => {
                e.persist();
                setTitleData({ ...titleData, mediaFolder: e.target.value });
              }}
            />
            <Label className={fontColor}>
              Team Code<span className="qsm-modal-required">*</span>:
            </Label>
            {/* <Input
              type="text"
              placeholder="X-XXX OR XXXXX"
              onChange={e => {
                e.persist();
                setTitleData(prev => ({ ...prev, teamCode: e.target.value }));
              }}
              onBlur={(e) => onTeamCodeValidation(e.target.value)}
            /> */}

            <AssignTeamCodeField
              teamCodeData={teamCodes}
              onDropDownSelect={selectTeamCode}
              selectedTeamCode={selectedTeamCode}
              cleanTeamCodeAssign={cleanTeamCodeAssign}
              onSelectTeamCode={onSelectTeamCode}
              editMode={editMode}
              value={titleData.teamCode}
              isError={!isValidTeamCode}
            />

            <Label className={fontColor}>
              Project Assignment<span className="qsm-modal-required">*</span>:
            </Label>
            <Label className={fontColor}>
              Project Assignment<span className="qsm-modal-required">*</span>:
            </Label>
            <AssignProjectField
              projectsData={projectsData}
              onDropDownSelect={selectProject}
              selectedProject={selectedProject}
              cleanProjectAssign={cleanProjectAssign}
              onSelectProject={onSelectProject}
              editMode={editMode}
              value={titleData.projectAssigned}
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
              editMode={editMode}
              value={titleData.teamAssiged}
            />
          </FormGroup>
        </Form>
      </ModalBody>

      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Button 
          color="primary" 
          onClick={() => confirmOnClick()}
          disabled={!/^(https?:\/\/[^\s]+)$/.test(titleData.mediaFolder) || titleData.mediaFolder === ''}
        >
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

