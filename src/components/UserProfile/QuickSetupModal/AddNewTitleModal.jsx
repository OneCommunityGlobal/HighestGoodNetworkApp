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
import { toast } from 'react-toastify';
import { addTitle, editTitle } from '../../../actions/title';
import AssignProjectField from './AssignProjectField';
import AssignTeamField from './AssignTeamField';
import AssignTeamCodeField from './AssignTeamCodeField';
import '../../Header/index.css';

// ---- helpers ---------------------------------------------------------------

const normalizeTeam = (value, teams = []) => {
  if (!value) return null;

  // already object
  if (typeof value === 'object') {
    const found = teams.find(t => t?._id === value._id) || null;
    return found ? { _id: found._id, teamName: found.teamName || '' } : null;
  }
  // id string
  if (typeof value === 'string') {
    const found = teams.find(t => t?._id === value) || null;
    return found ? { _id: found._id, teamName: found.teamName || '' } : null;
  }
  return null;
};

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
  QSTTeamCodes,
}) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const teamCodes = useSelector(state => state.teamCodes?.teamCodes || []);

  // ------------------------- state -----------------------------------------

  const [titleData, setTitleData] = useState(() => {
    if (editMode && title && Object.keys(title).length !== 0) {
      return {
        id: title._id,
        titleName: title.titleName || '',
        titleCode: title.titleCode || ((title.titleName || '').slice(0, 7)),
        mediaFolder: title.mediaFolder || '',
        teamCode: title.teamCode || '',
        projectAssigned: title.projectAssigned || '',
        // safe default even if server had null
        teamAssiged: title.teamAssiged || { _id: '', teamName: '' },
      };
    }
    // non-edit defaults
    return {
      titleName: '',
      titleCode: '',
      mediaFolder: '',
      teamCode: '',
      projectAssigned: '',
      teamAssiged: { _id: '', teamName: '' },
    };
  });

  const [isValidTeamCode, setIsValidTeamCode] = useState(true);

  // keep titleData in sync when props change
  useEffect(() => {
    if (editMode && title && Object.keys(title).length !== 0) {
      setTitleData({
        id: title._id,
        titleName: title.titleName || '',
        titleCode: title.titleCode || ((title.titleName || '').slice(0, 7)),
        mediaFolder: title.mediaFolder || '',
        teamCode: title.teamCode || '',
        projectAssigned: title.projectAssigned || '',
        teamAssiged: title.teamAssiged || { _id: '', teamName: '' },
      });
    } else {
      setTitleData({
        titleName: '',
        titleCode: '',
        mediaFolder: '',
        teamCode: '',
        projectAssigned: '',
        teamAssiged: { _id: '', teamName: '' },
      });
    }
  }, [editMode, title]);

  // auto-fill titleCode from titleName
  useEffect(() => {
    const base = titleData?.titleName || '';
    const code = titleData?.titleCode ? titleData.titleCode : base.slice(0, 7);
    setTitleData(prev => ({ ...prev, titleCode: code }));
  }, [titleData.titleName]);

  // live teamCode validity (using QSTTeamCodes list)
  useEffect(() => {
    setIsValidTeamCode(
      titleData.teamCode === '' ||
        (Array.isArray(QSTTeamCodes) &&
          QSTTeamCodes.some(code => code?.value === titleData.teamCode))
    );
  }, [titleData.teamCode, QSTTeamCodes]);

  // ----------------- canonical lists for validation ------------------------

  // Accept both shapes for teamsData: array OR { allTeams, allTeamCode }
  const allTeamsArray = Array.isArray(teamsData)
    ? teamsData
    : (teamsData && Array.isArray(teamsData.allTeams) ? teamsData.allTeams : []);

  let existTeamCodes = new Set(
    (Array.isArray(teamsData?.allTeamCode?.distinctTeamCodes)
      ? teamsData.allTeamCode.distinctTeamCodes
      : [])
  );

  const existTeamName = new Set(
    allTeamsArray.map(t => t?.teamName).filter(Boolean)
  );

  // ------------------- local UI state (selectors) --------------------------

  const [selectedTeam, onSelectTeam] = useState(undefined);
  const [selectedProject, onSelectProject] = useState(undefined);
  const [selectedTeamCode, onSelectTeamCode] = useState(undefined);
  const [isValidProject, onValidation] = useState(false);
  const [searchText, setSearchText] = useState(''); // For addTeamAutoComplete

  // ------------------- field handlers --------------------------------------

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

  const selectTeamCode = teamCode => {
    onSelectTeamCode(teamCode);
    setTitleData(prev => ({ ...prev, teamCode }));
  };

  const cleanProjectAssign = () => {
    setTitleData(prev => ({ ...prev, projectAssigned: '' }));
  };

  const selectTeam = team => {
    onSelectTeam(team);
    setTitleData(prev => ({
      ...prev,
      teamAssiged: { teamName: team.teamName, _id: team._id },
    }));
    onValidation(true);
  };

  const cleanTeamCodeAssign = () => {
    setTitleData(prev => ({ ...prev, teamCode: '' }));
  };

  const cleanTeamAssigned = () => {
    const updated = { ...titleData };
    delete updated.teamAssiged;
    setTitleData(updated);
  };

  const undoTeamAssigned = () => {
    setTitleData(prev => ({
      ...prev,
      teamAssiged: { teamName: searchText, _id: 'N/A' },
    }));
  };

  // ------------------- validations -----------------------------------------

  const onTeamCodeValidation = teamCode => {
    const format1 = /^[A-Za-z]-[A-Za-z]{3}$/;
    const format2 = /^[A-Z]{5}$/;
    const isValidFormat = format1.test(teamCode) || format2.test(teamCode);
    if (!isValidFormat) {
      setWarningMessage({ title: 'Error', content: 'Invalid Team Code Format' });
      setShowMessage(true);
      setTitleData(prev => ({ ...prev, teamCode: '' }));
      return;
    }
    if (!existTeamCodes.has(teamCode)) {
      setWarningMessage({ title: 'Error', content: 'Team Code Not Exists' });
      setShowMessage(true);
      setTitleData(prev => ({ ...prev, teamCode: '' }));
      return;
    }
    setShowMessage(false);
  };

  // Treat empty selection as OK (make it required here if your business rule requires it)
  const onTeamNameValidation = teamObj => {
    const name = teamObj && typeof teamObj === 'object'
      ? (teamObj.teamName || '').trim()
      : '';

    if (name === '') {
      setShowMessage(false);
      return true; // optional
    }

    if (!existTeamName.has(name)) {
      setWarningMessage({ title: 'Error', content: 'Team Name Not Exists' });
      setShowMessage(true);
      return false;
    }
    setShowMessage(false);
    return true;
  };

  // ------------------- submit ----------------------------------------------

  const confirmOnClick = () => {
    // validate team name (no-op if empty/optional)
    if (!onTeamNameValidation(titleData.teamAssiged)) return;

    // normalize team and build payload
    const safeTeams = allTeamsArray;
    const team = normalizeTeam(titleData.teamAssiged, safeTeams);

    const payload = {
      id: titleData.id,
      titleName: titleData.titleName?.trim() || '',
      titleCode: titleData.titleCode?.trim() || '',
      mediaFolder: titleData.mediaFolder?.trim() || '',
      teamCode: titleData.teamCode?.trim() || '',
      projectAssigned: titleData.projectAssigned || '',
    };

    if (team && team._id) {
      payload.teamAssiged = team;        // {_id, teamName}
      payload.teamName = team.teamName;  // some endpoints check this flat prop
    }

    const run = editMode ? editTitle : addTitle;

    run(payload)
      .then(resp => {
        if (resp.status !== 200) {
          setWarningMessage({ title: 'Error', content: resp.message });
          setShowMessage(true);
        } else {
          setIsOpen(false);
          refreshModalTitles();
          toast.success(editMode ? 'Title updated successfully' : 'Title added successfully');
        }
      })
      .catch(e => {
        // eslint-disable-next-line no-console
        console.log(e);
        setWarningMessage({ title: 'Error', content: 'Unexpected error' });
        setShowMessage(true);
      });
  };

  // ------------------- render ----------------------------------------------

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
              id="titleName"
              value={titleData.titleName}
              onChange={e => setTitleData(prev => ({ ...prev, titleName: e.target.value }))}
            />

            <Label className={fontColor}>
              Title Code<span className="qsm-modal-required">*</span>:{' '}
            </Label>
            <Input
              type="text"
              id="titleCode"
              value={titleData.titleCode}
              onChange={e => setTitleData(prev => ({ ...prev, titleCode: e.target.value }))}
              maxLength={7}
            />

            <Label className={fontColor}>
              Media Folder<span className="qsm-modal-required">*</span>:{' '}
            </Label>
            <Input
              type="text"
              id="mediafolder"
              value={titleData.mediaFolder}
              onChange={e => setTitleData(prev => ({ ...prev, mediaFolder: e.target.value }))}
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
  teamsData={allTeamsArray || []}
  value={titleData?.teamAssiged || { _id: '', teamName: '' }}
  onChange={(team) => setTitleData((p) => ({ ...p, teamAssiged: team }))}
  placeholder=""
/>

          </FormGroup>
        </Form>
      </ModalBody>

      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Button
          color="primary"
          onClick={confirmOnClick}
          disabled={
            !/^(https?:\/\/[^\s]+)$/.test(titleData.mediaFolder.trim()) ||
            titleData.mediaFolder === ''
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
