import { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Label, Input } from 'reactstrap';

function AssignSetUpModal({ isOpen, setIsOpen, title, userProfile, setUserProfile, setTitleOnSet }) {
  const [validation, setValid] = useState({
    volunteerAgree: false,
  });
  const [googleDoc, setGoogleDoc] = useState('')
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

  const setAssignedOnClick = () => {
    if (validation.volunteerAgree && googleDoc.length !== 0) {
      const data = {
        teams: [...userProfile.teams, title.teamAssiged],
        jobTitle: title.titleName,
        projects: [...userProfile.projects, title.projectAssigned],
        teamCode: title.teamCode,
      };
      // remove duplicate
      // eslint-disable-next-line no-unused-expressions
      userProfile.teams.includes(title?.teamAssiged) ? data.teams.pop() : '';
      // eslint-disable-next-line no-unused-expressions
      userProfile.projects.includes(title.projectAssigned) ? data.projects.pop() : '';

      setUserProfile(prev => ({ ...prev, ...data }));
      setTitleOnSet(false);
      setValid(() => ({ volunteerAgree: false }));
      setIsOpen(false);
    }
  };

  const setNoOnClick = () => {
    setUserProfile(prev => ({
      ...prev,
      teams: [...userProfile.teams],
      jobTitle: userProfile.jobTitle,
      projects: [...userProfile.projects],
      teamCode: userProfile.teamCode,
    }));
    setIsOpen(false);
  };

  return (
    <Modal isOpen={isOpen} toggle={() => setIsOpen(false)} >
      <ModalHeader toggle={() => setIsOpen(false)}>
        Assign {userProfile?.firstName} as {title?.titleName}
      </ModalHeader>
      <ModalBody>
        <div className="">
          <Label>
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
            <Label for="agreement" className="">
              Volunteer Agreement Confirmed
            </Label>
          </div>
          {validation.volunteerAgree ? '' : <p className="text-danger">{warning.checkbox}</p>}
        </div>
      </ModalBody>
      <ModalFooter>
        <div className="col text-center">
          <Button className="bg-success m-3" onClick={() => setAssignedOnClick()}>
            Yes
          </Button>
          <Button className="bg-danger m-3" onClick={() => setNoOnClick()}>
            No
          </Button>
          {/* <Button className="bg-danger m-3" onClick={() => deleteTitleById(title._id)}></Button> */}
        </div>
      </ModalFooter>
    </Modal>
  );
}

export default AssignSetUpModal;
