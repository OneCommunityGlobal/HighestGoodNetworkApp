import { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Label, Input } from 'reactstrap';
import hasPermission from '../../../utils/permissions';
import { deleteTitleById } from 'actions/title';
import { useSelector } from 'react-redux';
import '../../Header/DarkMode.css';
import { toast } from "react-toastify";

function AssignSetUpModal({ isOpen, setIsOpen, title, userProfile, setUserProfile, setTitleOnSet, refreshModalTitles, updateUserProfile}) {
  const darkMode = useSelector(state => state.theme.darkMode)
  const [validation, setValid] = useState({
    volunteerAgree: false,
  });
  const [googleDoc, setGoogleDoc] = useState('');
  const [warning, setWarning] = useState({
    googleDoc: 'Link is required',
    checkbox: 'Need to be confirmed',
  });
  const [isGoogleDocValid, setIsGoogleDocValid] = useState(true);
  const [mediaFolder, setMediaFolder] = useState("")

  const checkboxOnClick = () => {
    // eslint-disable-next-line no-unused-expressions
    validation.volunteerAgree
      ? setValid(prev => ({ ...prev, volunteerAgree: false }))
      : setValid(prev => ({ ...prev, volunteerAgree: true }));
  };

  const setAssignedOnClick = async () => {
    const googleDocRegex = /^https:\/\/docs\.google\.com\/document\/d\/.+$/;

    if (!googleDocRegex.test(googleDoc)) {
      setWarning(prev => ({ ...prev, googleDoc: 'Invalid Google Doc link' }));
      setIsGoogleDocValid(false);
      return;
    }

    if (validation.volunteerAgree && googleDoc.length !== 0) {
      const originalTeamId = userProfile.teams.map(team => team._id);
      const originalProjectId = userProfile.projects.map(project => project._id);
      // If the title has team assigned, add the team to the user profile. Remove duplicate teams
      const teamsAssigned = title.teamAssiged
        ? originalTeamId.includes(title?.teamAssiged._id)
          ? userProfile.teams
          : [...userProfile.teams, title.teamAssiged]
        : userProfile.teams;
      // If the title has project assigned, add the project to the user profile. Remove duplicate projects
      const projectAssigned = title.projectAssigned
        ? originalProjectId.includes(title?.projectAssigned._id)
          ? userProfile.projects
          : [...userProfile.projects, title.projectAssigned]
        : userProfile.projects;

      // Ensure adminLinks is not undefined or null
      const updatedAdminLinks = (userProfile.adminLinks || []).map(obj => {
        if (obj.Name === "Media Folder") obj.Link = mediaFolder || '';
        if (obj.Name === "Google Doc") obj.Link = googleDoc || '';
        return obj;
      });

      if (!updatedAdminLinks.find(obj => obj.Name === "Media Folder")) {
        updatedAdminLinks.push({ Name: "Media Folder", Link: mediaFolder || '' });
      }
      if (!updatedAdminLinks.find(obj => obj.Name === "Google Doc")) {
        updatedAdminLinks.push({ Name: "Google Doc", Link: googleDoc || '' });
      }

      const data = {
        teams: teamsAssigned,
        jobTitle: userProfile.jobTitle,
        projects: projectAssigned,
        teamCode: title.teamCode,
        adminLinks: updatedAdminLinks,
      };

      // Remove duplicates
      if (userProfile.teams.includes(title?.teamAssiged)) data.teams.pop();
      if (userProfile.projects.includes(title.projectAssigned)) data.projects.pop();

      const result = await updateUserProfile({...userProfile,...data});
      if (hasPermission("manageAdminLinks")) {
        setUserProfile(prev => ({ ...prev, ...data }));
      }

      setTitleOnSet(true); 
      setValid(() => ({ volunteerAgree: false }));
      setIsOpen(false);

      const SUCCESS_MESSAGE =
        "Success! Google Doc, Team Code, Project Assignment, " +
        "and Media Folder details are now updated for this individual.";
      toast.success(SUCCESS_MESSAGE, { autoClose: 10000 }); 
    }
  };


  // close the modal
  const setNoOnClick = () => {
    setIsOpen(false);
  };

  // delete this title
  const deleteTitle = titleId => {
    deleteTitleById(titleId)
      .then(() => {
        refreshModalTitles();
        setIsOpen(false);
      })
      .catch(e => {
        console.log(e);
      });
  };

  const isLink = str => {
    try {
      const url = new URL(str);
      return true;
    } catch (_) {
      return false;
    }
  };

    // UseEffect to get the media folder when userProfile or isOpen changes
    useEffect(() => {
      if (isOpen && userProfile) {
        getMediaFolder(userProfile);
      }
    }, [isOpen, userProfile]);

    // Gets the media Folder url from the mediaUrl
    const getMediaFolder = (userProfile) => {
      const currMediaFile = userProfile.adminLinks?.find(obj => obj.Name === "Media Folder");
      
      if (currMediaFile && currMediaFile.Link) {
        setMediaFolder(currMediaFile.Link);
      } else if (userProfile.mediaUrl) {
        setMediaFolder(userProfile.mediaUrl);
      } else if(title && title.mediaFolder) {
        setMediaFolder(title.mediaFolder);
      } else {
        // setMediaFolder("No media folder available");
        setMediaFolder(null);
      }
    };

  const fontColor = darkMode ? 'text-light' : '';

  return (
    <Modal
      isOpen={isOpen}
      toggle={() => setIsOpen(false)}
      className={darkMode ? 'text-light dark-mode' : ''}
    >
      <ModalHeader toggle={() => setIsOpen(false)} className={darkMode ? 'bg-space-cadet' : ''}>
        Assign {userProfile?.firstName} as {title?.titleName}
      </ModalHeader>
      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
        <div className={`${fontColor} modal-cont`}>
          <Label className={fontColor}>
            <h6>Google Doc: </h6>
          </Label>
          <Input type="text" onChange={e => setGoogleDoc(e.target.value)}></Input>
          {!isGoogleDocValid || googleDoc === ""?  <p className="text-danger">{warning.googleDoc}</p> : null}

          <h6>Team Code: {title?.teamCode}</h6>
          <h6>Project Assignment: {title?.projectAssigned?.projectName}</h6>
          <h6>
            Media Folder:{' '}
            {isLink(title?.mediaFolder) ? (
              <a
                href={title?.mediaFolder}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  maxWidth: '100%',
                  wordBreak: 'break-all',
                  overflowWrap: 'break-word',
                  color: darkMode ? 'white' : 'black',
                }}
              >
                {title?.mediaFolder}
              </a>
            ) : (
              <span style={{ wordBreak: 'break-all', overflowWrap: 'break-word' }}>
                {title?.mediaFolder}
              </span>
            )}
          </h6>
          {title?.teamAssiged?.teamName ? (
            <h6>Team Assignment: {title?.teamAssiged?.teamName}</h6>
          ) : (
            ''
          )}
          <div className="container ml-1 pdrl-1">
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
          <Button className="bg-danger m-3" onClick={() => deleteTitle(title._id)}>
            Delete QSC
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
}

export default AssignSetUpModal;
