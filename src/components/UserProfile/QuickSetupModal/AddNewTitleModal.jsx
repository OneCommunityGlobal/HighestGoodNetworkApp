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
import { addTitle, editTitle } from '../../../actions/title';
import AssignProjectField from './AssignProjectField';
import AssignTeamField from './AssignTeamField';
import AssignTeamCodeField from './AssignTeamCodeField';
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
  QSTTeamCodes
}) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const teamCodes = useSelector(state => state.teamCodes?.teamCodes || []);

  const [titleData, setTitleData] = useState(() => {
    if (editMode && Object.keys(title).length !== 0) {
      return {
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
  });

  const [isValidTeamCode, setIsValidTeamCode] = useState(true);

  useEffect(() => {
    if (editMode && Object.keys(title).length !== 0) {
      setTitleData({
        id: title._id,
        titleName: title.titleName,
        titleCode: title.titleCode || title.titleName.slice(0, 7),
        mediaFolder: title.mediaFolder,
        teamCode: title.teamCode,
        projectAssigned: title.projectAssigned,
        teamAssiged: title.teamAssiged,
      });
    } else {
      setTitleData({
        titleName: '',
        titleCode: '',
        mediaFolder: '',
        teamCode: '',
        projectAssigned: '',
        teamAssiged: {},
      });
    }
  }, [editMode, title]);

  useEffect(() => {
    const titleCode = titleData?.titleCode ? titleData.titleCode : titleData.titleName.slice(0, 7);
    setTitleData(prev => ({
      ...prev,
      titleCode,
    }));
  }, [titleData.titleName]);

  useEffect(() => {
    setIsValidTeamCode(
      titleData.teamCode === '' || QSTTeamCodes.some(code => code.value === titleData.teamCode),
    );
  }, [titleData.teamCode, QSTTeamCodes]);

  let existTeamCodes = new Set();
  let existTeamName = new Set();

  if (teamsData?.allTeams) {
    const codes = teamsData.allTeams.map(team => team.teamCode);
    const names = teamsData.allTeams.map(team => team.teamName);
    // Use allTeamCode rather than allTeams since team code is not related to records in the Team table.
    // It is all distinct team codes from the UserProfile teamCode field.
    existTeamCodes = new Set(teamsData?.allTeamCode?.distinctTeamCodes);
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
      ...titleData,
      projectAssigned: {
        projectName: project.projectName,
        _id: project._id,
        category: project.category,
      },
    });
    onValidation(true);
  };

  const selectTeamCode = teamCode => {
    onSelectTeamCode(teamCode);
    setTitleData({
      ...titleData,
      teamCode,
    });
  };

  const cleanProjectAssign = () => {
    setTitleData({
      ...titleData,
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
      ...titleData,
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
      ...titleData,
      teamAssiged: {
        teamName: searchText,
        _id: 'N/A',
      },
    });
  };

  // confirm and save
  const confirmOnClick = () => {
    const isValidTeamName = onTeamNameValidation(titleData.teamAssiged);

    if (!isValidTeamName) {
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
    }
  };

  const onTeamCodeValidation = teamCode => {
    const format1 = /^[A-Za-z]-[A-Za-z]{3}$/;
    const format2 = /^[A-Z]{5}$/;
    // Check if the input value matches either of the formats
    const isValidFormat = format1.test(teamCode) || format2.test(teamCode);
    if (!isValidFormat) {
      setWarningMessage({ title: 'Error', content: 'Invalid Team Code Format' });
      setShowMessage(true);
      setTitleData({ ...titleData, teamCode: '' });
      return;
    }
    if (!existTeamCodes.has(teamCode)) {
      setWarningMessage({ title: 'Error', content: 'Team Code Not Exists' });
      setShowMessage(true);
      setTitleData({ ...titleData, teamCode: '' });
      return;
    }
    setShowMessage(false);
  };

  const onTeamNameValidation = teamName => {
    if (teamName && teamName !== '') {
      if (!existTeamName.has(teamName.teamName)) {
        setWarningMessage({ title: 'Error', content: 'Team Name Not Exists' });
        setShowMessage(true);
        return false;
      }
    }
    setShowMessage(false);
    return true;
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
      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Form>
          <FormGroup>
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
              Title Code<span className="qsm-modal-required">*</span>:{' '}
            </Label>
            <Input
              type="text"
              name="text"
              id="titleCode"
              value={titleData.titleCode}
              onChange={e => {
                e.persist();
                setTitleData({ ...titleData, titleCode: e.target.value });
              }}
              maxLength={7}
            />
            <Label className={fontColor}>
              Media Folder<span className="qsm-modal-required">*</span>:{' '}
            </Label>
            <Input
              type="text"
              name="text"
              id="mediafolder"
              value={titleData.mediaFolder}
              onChange={e => {
                const inputValue = e.target.value;
                setTitleData({ ...titleData, mediaFolder: inputValue });
              }}
              placeholder="Enter a valid URL"
            />
            {!/^(https?:\/\/[^\s]+)$/.test(titleData.mediaFolder.trim()) &&
              titleData.mediaFolder !== '' && (
                <small style={{ color: 'red', marginTop: '5px', display: 'block' }}>
                  Please enter a valid URL that starts with http:// or https://
                </small>
              )}
            <Label className={fontColor}>
              Team Code<span className="qsm-modal-required">*</span>:
            </Label>
            <AssignTeamCodeField
              teamCodeData={QSTTeamCodes}
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
          disabled={
            !/^(https?:\/\/[^\s]+)$/.test(titleData.mediaFolder.trim()) || titleData.mediaFolder === ''
          }
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
