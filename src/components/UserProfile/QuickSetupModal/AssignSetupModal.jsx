import { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Label, Input } from 'reactstrap';
import { deleteTitleById } from 'actions/title';
import { useSelector } from 'react-redux';
import "../../Header/DarkMode.css"

function AssignSetUpModal({ isOpen, setIsOpen, title, userProfile, setUserProfile, setTitleOnSet, refreshModalTitles}) {
  const darkMode = useSelector(state => state.theme.darkMode)
  const [validation, setValid] = useState({
    volunteerAgree: false,
  });
  const [googleDoc, setGoogleDoc] = useState('');
  const [warning, setWarning] = useState({
    googleDoc: 'Linked is required',
    checkbox: 'Need to be confirmed',
  });

  const checkboxOnClick = () => {
    // eslint-disable-next-line no-unused-expressions
    validation.volunteerAgree
      ? setValid(prev => ({ ...prev, volunteerAgree: false }))
      : setValid(prev => ({ ...prev, volunteerAgree: true }));
  };

  // add QSC into user profile (and needs to save by clicking the save button)
  const setAssignedOnClick = () => {
    if (validation.volunteerAgree && googleDoc.length !== 0) {
      const originalTeamId = userProfile.teams.map(team => team._id);
      const originalProjectId = userProfile.projects.map(project => project._id);
      // If the title has team assigned, add the team to the user profile. Remove duplicate teams
      const teamsAssigned = title.teamAssiged ? originalTeamId.includes(title?.teamAssiged._id) ? userProfile.teams : [...userProfile.teams, title.teamAssiged] : userProfile.teams;
      // If the title has project assigned, add the project to the user profile. Remove duplicate projects
      const projectAssigned = title.projectAssigned ? originalProjectId.includes(title?.projectAssigned._id) ? userProfile.projects : [...userProfile.projects, title.projectAssigned] : userProfile.projects;

      const data = {
        teams: teamsAssigned,
        jobTitle: title.titleName,
        projects: projectAssigned,
        teamCode: title.teamCode,
      };
      setUserProfile(prev => ({ ...prev, ...data }));

      setTitleOnSet(false);
      setValid(() => ({ volunteerAgree: false }));
      setIsOpen(false);
    }
  };

  // close the modal
  const setNoOnClick = () => {
    setIsOpen(false);
  };

  // delete this title
  const deleteTitle = (titleId) => {
    deleteTitleById(titleId)
      .then(() => {
        refreshModalTitles();
        setIsOpen(false);
      })
      .catch(e => {
        console.log(e);
      });
  }

  const fontColor = darkMode ? 'text-light' : '';

  return (
    <Modal isOpen={isOpen} toggle={() => setIsOpen(false)} className={darkMode ? 'text-light dark-mode' : ''}>
      <ModalHeader toggle={() => setIsOpen(false)} className={darkMode ? 'bg-space-cadet' : ''}>
        Assign {userProfile?.firstName} as {title?.titleName}
      </ModalHeader>
      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
        <div className={fontColor}>
          <Label className={fontColor}>
            <h6>Google Doc: </h6>
          </Label>
          <Input type="text" onChange={e => setGoogleDoc(e.target.value)}></Input>
          {googleDoc.length !== 0 ? '' : <p className="text-danger">{warning.googleDoc}</p>}

          <h6>Team Code: {title?.teamCode}</h6>
          <h6>Project Assignment: {title?.projectAssigned?.projectName}</h6>
          <h6>Media Folder: {title?.mediaFolder}</h6>
          {title?.teamAssiged?.teamName ? <h6>Team Assignment: {title?.teamAssiged?.teamName}</h6> : '' }
          <div className="container ml-1">
            <Input
              type="checkbox"
              required
              id="agreement"
              value="true"
              onClick={() => checkboxOnClick()}
            />
            <Label for="agreement" className={fontColor}>
              Volunteer Agreement Confirmed
            </Label>
          </div>
          {validation.volunteerAgree ? '' : <p className="text-danger">{warning.checkbox}</p>}
        </div>
      </ModalBody>
      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <div className="col text-center">
          <Button className="bg-success m-3" onClick={() => setAssignedOnClick()}>
            Yes
          </Button>
          <Button className="bg-danger m-3" onClick={() => setNoOnClick()}>
            No
          </Button>
          <Button className="bg-danger m-3" onClick={() => deleteTitle(title._id)}>Delete QSC</Button>
        </div>
      </ModalFooter>
    </Modal>
  );
}

export default AssignSetUpModal;
