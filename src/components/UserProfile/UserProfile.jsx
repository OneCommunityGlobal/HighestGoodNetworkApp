import React, { useState, useEffect, useRef, useId } from 'react';
import {
  Row,
  Input,
  Col,
  Container,
  TabContent,
  TabPane,
  List,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Nav,
  NavItem,
  NavLink,
  Button,
} from 'reactstrap';
import Select from 'react-select';
import Image from 'react-bootstrap/Image';
import { Link } from 'react-router-dom';
import classnames from 'classnames';
import moment from 'moment';
import Alert from 'reactstrap/lib/Alert';
import axios from 'axios';
import hasPermission, {
  cantDeactivateOwner,
  cantUpdateDevAdminDetails,
} from '../../utils/permissions';
import ActiveCell from '../UserManagement/ActiveCell';
import { ENDPOINTS } from '../../utils/URL';
import SkeletonLoading from '../common/SkeletonLoading';
import UserProfileModal from './UserProfileModal';
import './UserProfile.scss';
import TeamsTab from './TeamsAndProjects/TeamsTab';
import ProjectsTab from './TeamsAndProjects/ProjectsTab';
import BasicInformationTab from './BasicInformationTab/BasicInformationTab';
import VolunteeringTimeTab from './VolunteeringTimeTab/VolunteeringTimeTab';
import SaveButton from './UserProfileEdit/SaveButton';
import UserLinkLayout from './UserLinkLayout';
import TabToolTips from './ToolTips/TabToolTips';
import BasicToolTips from './ToolTips/BasicTabTips';
import ResetPasswordButton from '../UserManagement/ResetPasswordButton';
import Badges from './Badges';
import TimeEntryEditHistory from './TimeEntryEditHistory';
import ActiveInactiveConfirmationPopup from '../UserManagement/ActiveInactiveConfirmationPopup';
import { updateUserStatus } from '../../actions/userManagement';
import { UserStatus } from '../../utils/enums';
import BlueSquareLayout from './BlueSquareLayout';
import TeamWeeklySummaries from './TeamWeeklySummaries/TeamWeeklySummaries';
import { boxStyle } from 'styles';
import { connect, useDispatch } from 'react-redux';
import { formatDate } from 'utils/formatDate';
import EditableInfoModal from './EditableModal/EditableInfoModal';
import { fetchAllProjects } from '../../actions/projects';
import { getAllUserTeams } from '../../actions/allTeamsAction';
import { toast } from 'react-toastify';
import { setCurrentUser } from '../../actions/authActions';

function UserProfile(props) {
  /* Constant values */
  const initialFormValid = {
    firstName: true,
    lastName: true,
    email: true,
  };
  const roles = props?.role.roles;
  const dispatch = useDispatch();

  /* Hooks */
  const [showLoading, setShowLoading] = useState(true);
  const [showSelect, setShowSelect] = useState(false);
  const [summaries, setSummaries] = useState(undefined);
  const [userProfile, setUserProfile] = useState(undefined);
  const [originalUserProfile, setOriginalUserProfile] = useState(undefined);
  const [originalTasks, setOriginalTasks] = useState([]);
  const [isTeamsEqual, setIsTeamsEqual] = useState(true);
  const [teams, setTeams] = useState([]);
  const [originalTeams, setOriginalTeams] = useState([]);
  const [isProjectsEqual, setIsProjectsEqual] = useState(true);
  const [projects, setProjects] = useState([]);
  const [originalProjects, setOriginalProjects] = useState([]);
  const [id, setId] = useState('');
  const [activeTab, setActiveTab] = useState('1');
  const [formValid, setFormValid] = useState(initialFormValid);
  const [blueSquareChanged, setBlueSquareChanged] = useState(false);
  const [type, setType] = useState('');
  const [menuModalTabletScreen, setMenuModalTabletScreen] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [shouldRefresh, setShouldRefresh] = useState(false);
  const [activeInactivePopupOpen, setActiveInactivePopupOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [updatedTasks, setUpdatedTasks] = useState([]);
  const [summarySelected, setSummarySelected] = useState(null);
  const [summaryName, setSummaryName] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isTeamSaved, setIsTeamSaved] = useState(false);
  const [summaryIntro, setSummaryIntro] = useState('');

  const userProfileRef = useRef();

  const isTasksEqual = JSON.stringify(originalTasks) === JSON.stringify(tasks);
  const isProfileEqual = JSON.stringify(userProfile) === JSON.stringify(originalUserProfile);
  const [codeValid, setCodeValid] = useState(true);

  const [userStartDate, setUserStartDate] = useState('');
  const [userEndDate, setUserEndDate] = useState('');


  /* useEffect functions */
  useEffect(() => {
    loadUserProfile();
    getCurretLoggedinUserEmail();
    dispatch(fetchAllProjects());
    dispatch(getAllUserTeams());
  }, []);

  useEffect(() => {
    userProfileRef.current = userProfile;
  });

  useEffect(() => {
    checkIsTeamsEqual();
    checkIsProjectsEqual();
    setUserProfile({ ...userProfile, teams, projects });
    setOriginalUserProfile({ ...originalUserProfile, teams, projects });
  }, [teams, projects]);

  useEffect(() => {
    setShowLoading(true);
    loadUserProfile();
    loadUserTasks();
  }, [props?.match?.params?.userId]);

  useEffect(() => {
    if (!blueSquareChanged) return;
    setBlueSquareChanged(false);
    handleSubmit();
  }, [blueSquareChanged]);

  const checkIsTeamsEqual = () => {
    setOriginalTeams(teams);
    const originalTeamProperties = [];
    originalTeams?.forEach(team => {
      for (const [key, value] of Object.entries(team)) {
        if (key == 'teamName') {
          originalTeamProperties.push({ [key]: value });
        }
      }
    });

    const teamsProperties = [];
    teams?.forEach(team => {
      for (const [key, value] of Object.entries(team)) {
        if (key == 'teamName') {
          teamsProperties.push({ [key]: value });
        }
      }
    });

    const originalTeamsBeingDisplayed = teamsProperties.filter(
      item =>
        JSON.stringify(item) ===
        JSON.stringify(originalTeamProperties.filter(elem => elem.teamName === item.teamName)[0]),
    );

    const compare =
      originalTeamsBeingDisplayed?.length === originalTeams?.length &&
      originalTeamsBeingDisplayed?.length === teamsProperties?.length;
    setIsTeamsEqual(compare);
  };

  const checkIsProjectsEqual = () => {
    setOriginalProjects(projects);
    const originalProjectProperties = [];
    originalProjects?.forEach(project => {
      for (const [key, value] of Object.entries(project)) {
        if (key == 'projectName') {
          originalProjectProperties.push({ [key]: value });
        }
      }
    });

    const projectsProperties = [];
    projects?.forEach(project => {
      for (const [key, value] of Object.entries(project)) {
        if (key == 'projectName') {
          projectsProperties.push({ [key]: value });
        }
      }
    });

    const originalProjectsBeingDisplayed = projectsProperties.filter(
      item =>
        JSON.stringify(item) ===
        JSON.stringify(
          originalProjectProperties.filter(elem => elem.projectName === item.projectName)[0],
        ),
    );

    const compare =
      originalProjectsBeingDisplayed?.length === originalProjects?.length &&
      originalProjectsBeingDisplayed?.length === projectsProperties?.length;
    setIsProjectsEqual(compare);
  };

  const loadSummaryIntroDetails = async (teamId, user) => {
    const currentManager = user;

    const res = await axios.get(ENDPOINTS.TEAM_USERS(teamId));
    const { data } = res;

    const memberSubmitted = [];
    const memberNotSubmitted = [];

    data.forEach(member => {
      if (member._id !== currentManager._id) {
        if (member.weeklySummaries[0].summary !== '') {
          memberSubmitted.push(`${member.firstName} ${member.lastName}`);
        } else {
          memberNotSubmitted.push(`${member.firstName} ${member.lastName}`);
        }
      }
    });

    const memberSubmittedString =
      memberSubmitted.length !== 0
        ? memberSubmitted.join(', ')
        : '<list all team members names included in the summary>';
    const memberDidntSubmitString =
      memberNotSubmitted.length !== 0
        ? memberNotSubmitted.join(', ')
        : '<list all team members names NOT included in the summary>';

    const summaryIntroString = `This week’s summary was managed by ${currentManager.firstName} ${currentManager.lastName} and includes ${memberSubmittedString}. These people did NOT provide a summary ${memberDidntSubmitString}. <Insert the proofread and single-paragraph summary created by ChatGPT>`;

    setSummaryIntro(summaryIntroString);
  };

  const loadUserTasks = async () => {
    const userId = props?.match?.params?.userId;
    axios
      .get(ENDPOINTS.TASKS_BY_USERID(userId))
      .then(res => {
        setTasks(res?.data || []);
        setOriginalTasks(res.data);
      })
      .catch(err => console.log(err));
  };

  // const loadSummaryIntroDetails = async teamId => {
  //   const res = await axios.get(ENDPOINTS.TEAM_USERS(teamId));
  //   const { data } = res;

  //   const memberSubmitted = [];
  //   const memberNotSubmitted = [];
  //   let manager = '';

  //   data.forEach(member => {
  //     if (member.role === 'Manager') {
  //       manager = `${member.firstName} ${member.lastName}`;
  //     }
  //     member.weeklySummaries[0].summary !== ''
  //       ? memberSubmitted.push(`${member.firstName} ${member.lastName}`)
  //       : memberNotSubmitted.push(`${member.firstName} ${member.lastName}`);
  //   });

  //   manager = manager === '' ? '<Your Name>' : manager;
  //   const memberSubmittedString =
  //     memberSubmitted.length !== 0
  //       ? memberSubmitted.join(', ')
  //       : '<list all team members names included in the summary>.';
  //   const memberDidntSubmitString =
  //     memberNotSubmitted.length !== 0
  //       ? memberSubmitted.join(', ')
  //       : '<list all team members names NOT included in the summary>';

  //   const summaryIntroString = `This week’s summary was managed by ${manager} and includes ${memberSubmittedString} These people did NOT provide a summary ${memberDidntSubmitString}. <Insert the proofread and single-paragraph summary created by ChatGPT>`;

  //   setSummaryIntro(summaryIntroString);
  // };

  const getCurretLoggedinUserEmail = async () => {
    const userId = props?.auth?.user?.userid;
    try{
      const response = await axios.get(ENDPOINTS.USER_PROFILE(userId));
      const currentUserEmail = response.data.email;
      dispatch(setCurrentUser({...props.auth.user, email: currentUserEmail}));
    }catch (err) {
      toast.error('Error while getting current logged in user email');
    }
  };

  const loadUserProfile = async () => {
    const userId = props?.match?.params?.userId;

    if (!userId) return;

    try {
      const response = await axios.get(ENDPOINTS.USER_PROFILE(userId));
      const newUserProfile = response.data;

      newUserProfile.totalIntangibleHrs = Number(newUserProfile.totalIntangibleHrs.toFixed(2));

      const teamId = newUserProfile?.teams[0]?._id;
      if (teamId) {
        await loadSummaryIntroDetails(teamId, response.data);
      }

      setTeams(newUserProfile.teams);
      setOriginalTeams(newUserProfile.teams);
      setProjects(newUserProfile.projects);
      setOriginalProjects(newUserProfile.projects);
      setUserProfile({
        ...newUserProfile,
        jobTitle: newUserProfile.jobTitle[0],
        phoneNumber: newUserProfile.phoneNumber[0],
        createdDate: newUserProfile?.createdDate.split('T')[0],
      });
      setOriginalUserProfile({
        ...newUserProfile,
        jobTitle: newUserProfile.jobTitle[0],
        phoneNumber: newUserProfile.phoneNumber[0],
        createdDate: newUserProfile?.createdDate.split('T')[0],
      });
      setUserStartDate(newUserProfile?.createdDate.split('T')[0]);
      setShowLoading(false);
    } catch (err) {
      setShowLoading(false);
    }
  };

  const getWeeklySummary = async userId => {
    try {
      setSummarySelected('');
      setShowSummary(false);
      const response = await axios.get(ENDPOINTS.USER_PROFILE(userId));
      const user = response.data;
      const userSummaries = user.weeklySummaries;

      setSummarySelected(userSummaries);
      setShowSummary(true);
    } catch (err) {
      setShowLoading(false);
    }
  };

  const getTeamMembersWeeklySummary = async () => {
    const userId = props?.match?.params?.userId;

    if (!userId) return;

    try {
      const response = await axios.get(ENDPOINTS.LEADER_BOARD(userId));
      const leaderBoardData = response.data;
      const allSummaries = [];

      for (let i = 0; i < leaderBoardData.length; i++) {
        allSummaries.push({
          value: [leaderBoardData[i].name, leaderBoardData[i].personId],
          label: `View ${leaderBoardData[i].name}'s summary.`,
        });
      }
      setSummaries(allSummaries);
      return;
    } catch (err) {
      console.log('Could not load leaderBoard data.', err);
    }
  };

  const onDeleteTeam = deletedTeamId => {
    setTeams(prevTeams => prevTeams.filter(team => team._id !== deletedTeamId));
  };

  const onDeleteProject = deletedProjectId => {
    setProjects(prevProject => prevProject.filter(project => project._id !== deletedProjectId));
  };

  const onAssignTeam = assignedTeam => {
    setTeams(prevState => [...prevState, assignedTeam]);
  };

  const onAssignProject = assignedProject => {
    setProjects(prevProjects => [...prevProjects, assignedProject]);
  };

  const onUpdateTask = (taskId, updatedTask) => {
    const newTask = {
      updatedTask,
      taskId,
    };

    setTasks(tasks => {
      const tasksWithoutTheUpdated = [...tasks];
      const taskIndex = tasks.findIndex(task => task._id === taskId);
      tasksWithoutTheUpdated[taskIndex] = updatedTask;
      return tasksWithoutTheUpdated;
    });

    if (updatedTasks.findIndex(task => task.taskId === taskId) !== -1) {
      const taskIndex = updatedTasks.findIndex(task => task.taskId === taskId);
      const tasksToUpdate = updatedTasks;
      tasksToUpdate.splice(taskIndex, 1);
      tasksToUpdate.splice(taskIndex, 0, newTask);
      setUpdatedTasks(tasksToUpdate);
    } else {
      setUpdatedTasks(tasks => [...tasks, newTask]);
    }
  };

  const handleImageUpload = async evt => {
    if (evt) evt.preventDefault();
    const file = evt.target.files[0];
    if (typeof file !== 'undefined') {
      const filesizeKB = file.size / 1024;
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      const allowedTypesString = `File type not permitted. Allowed types are ${allowedTypes
        .toString()
        .replaceAll(',', ', ')}`;

      // Input validation: file type
      if (!allowedTypes.includes(file.type)) {
        setType('image');
        setShowModal(true);
        setModalTitle('Profile Pic Error');
        setModalMessage(allowedTypesString);
        return;
      }

      // Input validation: file size.
      if (filesizeKB > 50) {
        const errorMessage = `The file you are trying to upload exceeds the maximum size of 50KB. You can either
														choose a different file, or use an online file compressor.`;

        setType('image');
        setShowModal(true);
        setModalTitle('Profile Pic Error');
        setModalMessage(errorMessage);

        return;
      }

      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onloadend = () => {
        setUserProfile({ ...userProfile, profilePic: fileReader.result });
      };
    }
  };

  const handleBlueSquare = (status = true, type = 'message', blueSquareID = '') => {
    setType(type);
    setShowModal(status);

    if (type === 'addBlueSquare') {
      setModalTitle('Blue Square');
    } else if (type === 'viewBlueSquare' || type === 'modBlueSquare') {
      setModalTitle('Blue Square');
      setId(blueSquareID);
    } else if (blueSquareID === 'none') {
      setModalTitle('Save & Refresh');
      setModalMessage('');
    }
  };

  /**
   * Modifies the userProfile's infringements using a predefined operation
   * @param {String} id Id of the blue square
   * @param {String} dateStamp
   * @param {String} summary
   * @param {String} operation 'add' | 'update' | 'delete'
   */
  const modifyBlueSquares = (id, dateStamp, summary, operation) => {
    if (operation === 'add') {
      const newBlueSquare = { date: dateStamp, description: summary , createdDate: moment.tz('America/Los_Angeles').toISOString().split('T')[0]};
      setOriginalUserProfile({
        ...originalUserProfile,
        infringements: userProfile.infringements?.concat(newBlueSquare),
      });
      setUserProfile({
        ...userProfile,
        infringements: userProfile.infringements?.concat(newBlueSquare),
      });
      setModalTitle('Blue Square');
    } else if (operation === 'update') {
      const currentBlueSquares = [...userProfile?.infringements] || [];
      if (dateStamp != null && currentBlueSquares.length !== 0) {
        currentBlueSquares.find(blueSquare => blueSquare._id === id).date = dateStamp;
      }
      if (summary != null && currentBlueSquares.length !== 0) {
        currentBlueSquares.find(blueSquare => blueSquare._id === id).description = summary;
      }

      setUserProfile({ ...userProfile, infringements: currentBlueSquares });
      setOriginalUserProfile({ ...userProfile, infringements: currentBlueSquares });
    } else if (operation === 'delete') {
      let newInfringements = [...userProfile?.infringements] || [];
      if (newInfringements.length !== 0) {
        newInfringements = newInfringements.filter(infringement => infringement._id !== id);
        setUserProfile({ ...userProfile, infringements: newInfringements });
        setOriginalUserProfile({ ...userProfile, infringements: newInfringements });
      }
    }
    setShowModal(false);
    setBlueSquareChanged(true);
  };

  const handleSubmit = async () => {
    for (let i = 0; i < updatedTasks.length; i += 1) {
      const updatedTask = updatedTasks[i];
      const url = ENDPOINTS.TASK_UPDATE(updatedTask.taskId);
      axios.put(url, updatedTask.updatedTask).catch(err => console.log(err));
    }
    try {
      await props.updateUserProfile(userProfileRef.current);

      if (userProfile._id === props.auth.user.userid && props.auth.user.role !== userProfile.role) {
        await props.refreshToken(userProfile._id);
      }
      await loadUserProfile();
      await loadUserTasks();
      setSaved(false);
    } catch (err) {
      alert('An error occurred while attempting to save this profile.');
    }
  };
 
  // Changing onSubmit for Badges component from handleSubmit to handleBadgeSubmit. 
  // AssignBadgePopup already has onSubmit action to call an API to update the user badges. 
  // Using handleSubmit will trigger actopms to call the assignBadge API and updateUserProfile API, which is redundant.
  const handleBadgeSubmit = async () => {
    try {
      setSaved(false);
    } catch (err) {
      alert('An error occurred while reload user profile after badge udpate.');
    }
  };

  const toggle = modalName => setMenuModalTabletScreen(modalName);

  const toggleTab = tab => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const updateLink = (personalLinksUpdate, adminLinksUpdate, mediaUrlUpdate) => {
    setShowModal(false);
    setUserProfile({
      ...userProfile,
      mediaUrl: mediaUrlUpdate !== undefined ? mediaUrlUpdate : userProfile.mediaUrl,
      personalLinks: personalLinksUpdate,
      adminLinks: adminLinksUpdate,
    });
  };

  const setActiveInactive = isActive => {
    setActiveInactivePopupOpen(false);
    const newUserProfile = {
      ...userProfile,
      isActive: !userProfile.isActive,
      endDate: userProfile.isActive ? moment(new Date()).format('YYYY-MM-DD') : undefined,
    };
    updateUserStatus(newUserProfile, isActive ? UserStatus.Active : UserStatus.InActive, undefined);
    setUserProfile(newUserProfile);
    setOriginalUserProfile(newUserProfile);
  };

  const activeInactivePopupClose = () => {
    setActiveInactivePopupOpen(false);
  };

  /* useEffect functions */
  useEffect(() => {
    getTeamMembersWeeklySummary(); 
    loadUserProfile();
  }, []);

  useEffect(() => {
    if (!shouldRefresh) return;
    setShouldRefresh(false);
    loadUserProfile();
  }, [shouldRefresh]);

  /**
   *
   * UserProfile.jsx and its subsomponents are being refactored to avoid the use of this monolithic function.
   * Please pass userProfile and setUserProfile as props to subcomponents and modify state that way.
   * This function is being kept here until the refactoring is complete.
   */
  const handleUserProfile = event => {
    switch (event.target.id) {
      case 'emailPubliclyAccessible':
        setUserProfile({
          ...userProfile,
          privacySettings: {
            ...userProfile.privacySettings,
            email: !userProfile.privacySettings?.email,
          },
        });
        break;
      case 'emailSubscriptionConfig':
        setUserProfile({
          ...userProfile,
          emailSubscriptions: !userProfile.emailSubscriptions,
        });
        break;
      case 'phonePubliclyAccessible':
        setUserProfile({
          ...userProfile,
          privacySettings: {
            ...userProfile.privacySettings,
            phoneNumber: !userProfile.privacySettings?.phoneNumber,
          },
        });
        break;
      case 'blueSquaresPubliclyAccessible':
        setUserProfile({
          ...userProfile,
          privacySettings: {
            ...userProfile.privacySettings,
            blueSquares: !userProfile.privacySettings?.blueSquares,
          },
        });
        break;
      default:
        break;
    }
  };

  const onUserVisibilitySwitch = () => {
    setUserProfile({
      ...userProfile,
      isVisible: !userProfile.isVisible ?? true,
    });
  };

  if ((showLoading && !props.isAddNewUser) || userProfile === undefined) {
    return (
      <Container fluid>
        <Row className="text-center" data-test="loading">
          <SkeletonLoading template="UserProfile" />
        </Row>
      </Container>
    );
  }

  const { firstName, lastName, profilePic, jobTitle = '' } = userProfile;

  const { userId: targetUserId } = props.match ? props.match.params : { userId: undefined };
  const { userid: requestorId, role: requestorRole } = props.auth.user;

  /**  Login User's email */
  const authEmail = props.auth?.user?.email;
  const isUserSelf = targetUserId === requestorId;

  const canChangeUserStatus = props.hasPermission('changeUserStatus');
  const canAddDeleteEditOwners = props.hasPermission('addDeleteEditOwners');
  const canPutUserProfile = props.hasPermission('putUserProfile');
  const canUpdatePassword = props.hasPermission('updatePassword');
  const canGetProjectMembers = props.hasPermission('getProjectMembers');

  const targetIsDevAdminUneditable = cantUpdateDevAdminDetails(userProfile.email, authEmail);
 
  const canEditUserProfile = targetIsDevAdminUneditable
    ? false
    : userProfile.role === 'Owner'
    ? canAddDeleteEditOwners
    : canPutUserProfile;

  const canEdit = canEditUserProfile || isUserSelf;

  const customStyles = {
    control: (base, state) => ({
      ...base,
      border: state.isFocused ? '2px solid #333' : '2px solid #ccc',
      boxShadow: 'none',
      '&:hover': {
        border: state.isFocused ? '2px solid #333' : '2px solid #ccc',
      },
    }),
    dropdownIndicator: base => ({
      ...base,
      color: '#333',
    }),
    menu: base => ({
      ...base,
      zIndex: 9999,
    }),
  };

  const handleStartDate = async startDate => {
    setUserStartDate(startDate);
  };

  const handleEndDate = async endDate => {
    setUserEndDate(endDate);
  };

  return (
    <div>
      <ActiveInactiveConfirmationPopup
        isActive={userProfile.isActive}
        fullName={`${userProfile.firstName} ${userProfile.lastName}`}
        open={activeInactivePopupOpen}
        setActiveInactive={setActiveInactive}
        onClose={activeInactivePopupClose}
      />
      {showModal && (
        <UserProfileModal
          isOpen={showModal}
          closeModal={() => setShowModal(false)}
          modalMessage={modalMessage}
          modalTitle={modalTitle}
          type={type}
          updateLink={updateLink}
          modifyBlueSquares={modifyBlueSquares}
          userProfile={userProfile}
          id={id}
          handleLinkModel={props.handleLinkModel}
          role={requestorRole}
        />
      )}
      <TabToolTips />
      <BasicToolTips />
      <Container className="emp-profile">
        <Row>
          <Col md="4" id="profileContainer">
            <div className="profile-img">
              <Image
                src={profilePic || '/pfp-default.png'}
                alt="Profile Picture"
                roundedCircle
                className="profilePicture"
              />
              {canEdit ? (
                <div className="image-button file btn btn-lg btn-primary" style={boxStyle}>
                  Change Photo
                  <Input
                    style={{ width: '100%', height: '100%', zIndex: '2' }}
                    type="file"
                    name="newProfilePic"
                    id="newProfilePic"
                    onChange={handleImageUpload}
                    accept="image/png,image/jpeg, image/jpg"
                  />
                </div>
              ) : null}
            </div>
          </Col>
          <Col md="8">
            {!isProfileEqual || !isTasksEqual || (!isTeamsEqual && !isTeamSaved) || !isProjectsEqual ? (
              <Alert color="warning">
                Please click on &quot;Save changes&quot; to save the changes you have made.{' '}
              </Alert>
            ) : null}
            {!codeValid ? (
              <Alert color="danger">The code format should be A-AAA or AAAAA.</Alert>
            ) : null}
            <div className="profile-head">
              <h5 className="mr-2">{`${firstName} ${lastName}`}</h5>
              <div style={{marginTop: '6px'}} >
              <EditableInfoModal
                areaName="UserProfileInfoModal"
                areaTitle="User Profile"
                fontSize={24}
                isPermissionPage={true}
                role={requestorRole} // Pass the 'role' prop to EditableInfoModal
              />
              </div>
              <span className="mr-2">
              <ActiveCell
                isActive={userProfile.isActive}
                user={userProfile}
                canChange={canChangeUserStatus}
                onClick={() => {
                  if (cantDeactivateOwner(userProfile, requestorRole)) {
                    //Owner user cannot be deactivated by another user that is not an Owner.
                    alert('You are not authorized to deactivate an owner.');
                    return;
                  }
                  setActiveInactivePopupOpen(true);
                }}
              />
              </span>
              {canEdit && (
                <span className="mr-2">
                <i
                  data-toggle="tooltip"
                  className="fa fa-clock-o"
                  aria-hidden="true"
                  style={{ fontSize: 24, cursor: 'pointer', marginTop: '6px' }}
                  title="Click to see user's timelog"
                  onClick={e => {
                    if (e.metaKey || e.ctrlKey) {
                      window.open(`/timelog/${targetUserId}`, '_blank');
                    } else {
                      e.preventDefault();
                      props.history.push(`/timelog/${targetUserId}`);
                    }
                  }}
                />
                </span>
              )}
              <Button
                onClick={() => {
                  setShowSelect(!showSelect);
                  setSummarySelected(null);
                  setSummaryName(null);
                }}
                color="primary"
                size="sm"
                style={boxStyle}
              >
                {showSelect ? 'Hide Team Weekly Summaries' : 'Show Team Weekly Summaries'}
              </Button>
              {canGetProjectMembers && teams.length !== 0 ? (
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(summaryIntro);
                    toast.success('Summary Intro Copied!');
                  }}
                  color="primary"
                  size="sm"
                  title="Generates the summary intro for your team and copies it to your clipboard for easy use."
                  style={boxStyle}
                >
                  Generate Summary Intro
                </Button>
              ) : (
                ''
              )}
            </div>
            <h6 className="job-title">{jobTitle}</h6>
            <p className="proile-rating">
              From : <span>{formatDate(userProfile.createdDate)}</span>
              {'   '}
              To: <span>{userProfile.endDate ? formatDate(userProfile.endDate) : 'N/A'}</span>
            </p>
            {showSelect && summaries === undefined ? <div>Loading</div> : <div />}
            {showSelect && summaries !== undefined ? (
              <div>
                <Select
                  options={summaries}
                  styles={customStyles}
                  onChange={e => {
                    setSummaryName(e.value[0]);
                    getWeeklySummary(e.value[1]);
                  }}
                />
              </div>
            ) : (
              <div />
            )}
            {summarySelected &&
              showSelect &&
              showSummary &&
              summarySelected.map((data, i) => {
                return (
                  <TeamWeeklySummaries key={data['_id']} i={i} name={summaryName} data={data} />
                );
              })}
            <Badges
              isUserSelf={isUserSelf}
              userProfile={userProfile}
              setUserProfile={setUserProfile}
              setOriginalUserProfile={setOriginalUserProfile}
              role={requestorRole}
              canEdit={canEdit}
              handleSubmit={handleBadgeSubmit}
              isRecordBelongsToJaeAndUneditable = {targetIsDevAdminUneditable} //
            />
          </Col>
        </Row>
        <Row>
          <Col md="4">
            <div className="profile-work">
              <UserLinkLayout
                isUserSelf={isUserSelf}
                userProfile={userProfile}
                updateLink={updateLink}
                handleLinkModel={props.handleLinkModel}
                handleSubmit={handleSubmit}
                role={requestorRole}
                canEdit={canEdit}
              />
              <BlueSquareLayout
                userProfile={userProfile}
                handleUserProfile={handleUserProfile}
                handleSaveError={props.handleSaveError}
                handleBlueSquare={handleBlueSquare}
                user={props.auth.user}
                isUserSelf={isUserSelf}
                canEdit={canEdit}
              />
            </div>
          </Col>
          <Col md="8" className="profile-functions-desktop">
            <div className="profile-tabs">
              <Nav tabs>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === '1' }, 'nav-link')}
                    onClick={() => toggleTab('1')}
                    id="nabLink-basic"
                  >
                    Basic Information
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === '2' }, 'nav-link')}
                    onClick={() => toggleTab('2')}
                    id="nabLink-time"
                  >
                    Volunteering Times
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === '3' }, 'nav-link')}
                    onClick={() => toggleTab('3')}
                    id="nabLink-teams"
                  >
                    Teams
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === '4' }, 'nav-link')}
                    onClick={() => toggleTab('4')}
                    id="nabLink-projects"
                  >
                    Projects
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === '5' }, 'nav-link')}
                    onClick={e => {
                      e.preventDefault();
                      toggleTab('5');
                    }}
                    data-testid="edit-history-tab"
                  >
                    Edit History
                  </NavLink>
                </NavItem>
              </Nav>
            </div>
            <TabContent
              activeTab={activeTab}
              className="tab-content profile-tab"
              id="myTabContent"
              style={{ border: 0 }}
            >
              <TabPane tabId="1">
                <BasicInformationTab
                  role={requestorRole}
                  userProfile={userProfile}
                  setUserProfile={setUserProfile}
                  loadUserProfile={loadUserProfile}
                  handleUserProfile={handleUserProfile}
                  formValid={formValid}
                  setFormValid={setFormValid}
                  isUserSelf={isUserSelf}
                  canEdit={canEdit}
                  canEditRole={canEditUserProfile}
                  roles={roles}
                />
              </TabPane>
              <TabPane tabId="2">
                {
                  <VolunteeringTimeTab
                    userProfile={userProfile}
                    setUserProfile={setUserProfile}
                    isUserSelf={isUserSelf}
                    role={requestorRole}
                    onEndDate={handleEndDate}
                    loadUserProfile={loadUserProfile}
                    canEdit={canEditUserProfile}
                    onStartDate={handleStartDate}
                  />
                }
              </TabPane>
              <TabPane tabId="3">
                <TeamsTab
                  userTeams={teams || []}
                  teamsData={props?.allTeams?.allTeamsData || []}
                  onAssignTeam={onAssignTeam}
                  onDeleteTeam={onDeleteTeam}
                  edit={canEdit}
                  role={requestorRole}
                  onUserVisibilitySwitch={onUserVisibilitySwitch}
                  isVisible={userProfile.isVisible}
                  canEditVisibility={canEdit && userProfile.role != 'Volunteer'}
                  handleSubmit={handleSubmit}
                  disabled={
                    !formValid.firstName ||
                    !formValid.lastName ||
                    !formValid.email ||
                    !(isProfileEqual && isTasksEqual && isTeamsEqual && isProjectsEqual) &&
                    !isTeamSaved
                  }
                  canEditTeamCode={props.hasPermission('editTeamCode') || requestorRole == 'Owner' || targetIsDevAdminUneditable}
                  setUserProfile={setUserProfile}
                  userProfile={userProfile}
                  codeValid={codeValid}
                  setCodeValid={setCodeValid}
                  saved={saved}
                  isTeamSaved={(isSaved) => setIsTeamSaved(isSaved)}
                />
              </TabPane>
              <TabPane tabId="4">
                <ProjectsTab
                  userProjects={userProfile.projects || []}
                  userTasks={tasks}
                  projectsData={props?.allProjects?.projects || []}
                  onAssignProject={onAssignProject}
                  onDeleteProject={onDeleteProject}
                  edit={canEdit}
                  role={requestorRole}
                  userId={props.match.params.userId}
                  updateTask={onUpdateTask}
                  handleSubmit={handleSubmit}
                  disabled={
                    !formValid.firstName ||
                    !formValid.lastName ||
                    !formValid.email ||
                    !(isProfileEqual && isTasksEqual && isTeamsEqual && isProjectsEqual)
                  }
                />
              </TabPane>
              <TabPane tabId="5">
                <TimeEntryEditHistory
                  userProfile={userProfile}
                  setUserProfile={setUserProfile}
                  role={requestorRole}
                  isRecordBelongsToJaeAndUneditable = {targetIsDevAdminUneditable} // 
                />
              </TabPane>
            </TabContent>
          </Col>
          <Col md="8" className="profile-functions-tablet">
            <List className="profile-functions-list">
              <Button
                className="list-button"
                onClick={() => toggle('Basic Information')}
                color="primary"
                style={boxStyle}
              >
                Basic Information
              </Button>
              <Modal isOpen={menuModalTabletScreen === 'Basic Information'} toggle={toggle}>
                <ModalHeader toggle={toggle}>Basic Information</ModalHeader>
                <ModalBody>
                <BasicInformationTab
                  role={requestorRole}
                  userProfile={userProfile}
                  setUserProfile={setUserProfile}
                  loadUserProfile={loadUserProfile}
                  handleUserProfile={handleUserProfile}
                  formValid={formValid}
                  setFormValid={setFormValid}
                  isUserSelf={isUserSelf}
                  canEdit={canEdit}
                  canEditRole={canEditUserProfile}
                  roles={roles}
                />
                </ModalBody>
                <ModalFooter>
                  <Row>
                    <div className="profileEditButtonContainer">
                      {canUpdatePassword && canEdit && !isUserSelf && (
                        <ResetPasswordButton
                          className="mr-1 btn-bottom"
                          user={userProfile}
                          authEmail={authEmail}
                        />
                      )}
                      {isUserSelf && (activeTab == '1' || canPutUserProfile) && (
                        <Link
                          to={targetIsDevAdminUneditable ? `#` : `/updatepassword/${userProfile._id}`}
                          onClick={() => {
                            if (targetIsDevAdminUneditable) {
                              alert(
                                'STOP! YOU SHOULDN’T BE TRYING TO CHANGE THIS PASSWORD. ' +
                                  'You shouldn’t even be using this account except to create your own accounts to use. ' +
                                  'Please re-read the Local Setup Doc to understand why and what you should be doing instead of what you are trying to do now.',
                              );
                              return `#`;
                            }
                          }}
                        >
                          <Button className="mr-1 btn-bottom" color="primary">
                            {' '}
                            Update Password
                          </Button>
                        </Link>
                      )}
                      {canEdit && (activeTab == '1' || canPutUserProfile) && (
                        <>
                          <SaveButton
                            className="mr-1 btn-bottom"
                            handleSubmit={handleSubmit}
                            disabled={
                              !formValid.firstName ||
                              !formValid.lastName ||
                              !formValid.email ||
                              !codeValid ||
                              (isProfileEqual && isTasksEqual && isTeamsEqual && isProjectsEqual)
                            }
                            userProfile={userProfile}
                            setSaved={() => setSaved(true)}
                          />
                          <span
                            onClick={() => {
                              setUserProfile(originalUserProfile);
                              setTasks(originalTasks);
                            }}
                            className="btn btn-outline-danger mr-1 btn-bottom"
                          >
                            X
                          </span>
                        </>
                      )}
                      <Button outline onClick={() => loadUserProfile()}>
                        <i className="fa fa-refresh" aria-hidden="true"></i>
                      </Button>
                    </div>
                  </Row>
                </ModalFooter>
              </Modal>
              <Button
                className="list-button"
                onClick={() => toggle('Volunteering Times')}
                color="secondary"
                style={boxStyle}
              >
                Volunteering Times
              </Button>
              <Modal isOpen={menuModalTabletScreen === 'Volunteering Times'} toggle={toggle}>
                <ModalHeader toggle={toggle}>Volunteering Times</ModalHeader>
                <ModalBody>
                  <VolunteeringTimeTab
                    userProfile={userProfile}
                    setUserProfile={setUserProfile}
                    isUserSelf={isUserSelf}
                    role={requestorRole}
                    onEndDate={handleEndDate}
                    canEdit={canEdit}
                    onStartDate={handleStartDate}
                  />
                </ModalBody>
                <ModalFooter>
                  <Row>
                    <div className="profileEditButtonContainer">
                      {canEdit && (activeTab == '1' || canPutUserProfile) && (
                        <>
                          <SaveButton
                            className="mr-1 btn-bottom"
                            handleSubmit={handleSubmit}
                            disabled={
                              !formValid.firstName ||
                              !formValid.lastName ||
                              !formValid.email ||
                              !codeValid ||
                              (isProfileEqual && isTasksEqual && isTeamsEqual && isProjectsEqual)
                            }
                            userProfile={userProfile}
                            setSaved={() => setSaved(true)}
                          />
                          <span
                            onClick={() => {
                              setUserProfile(originalUserProfile);
                              setTasks(originalTasks);
                            }}
                            className="btn btn-outline-danger mr-1 btn-bottom"
                          >
                            X
                          </span>
                        </>
                      )}
                      <Button outline onClick={() => loadUserProfile()}>
                        <i className="fa fa-refresh" aria-hidden="true"></i>
                      </Button>
                    </div>
                  </Row>
                </ModalFooter>
              </Modal>
              <Button className="list-button" onClick={() => toggle('Teams')} color="secondary" style={boxStyle}>
                Teams
              </Button>
              <Modal isOpen={menuModalTabletScreen === 'Teams'} toggle={toggle}>
                <ModalHeader toggle={toggle}>Teams</ModalHeader>
                <ModalBody>
                  <TeamsTab
                    userTeams={userProfile?.teams || []}
                    teamsData={props?.allTeams?.allTeamsData || []}
                    onAssignTeam={onAssignTeam}
                    onDeleteTeam={onDeleteTeam}
                    edit={canEdit}
                    role={requestorRole}
                    onUserVisibilitySwitch={onUserVisibilitySwitch}
                    isVisible={userProfile.isVisible}
                    canEditVisibility={canEdit && userProfile.role != 'Volunteer'}
                    handleSubmit={handleSubmit}
                    disabled={
                      !formValid.firstName ||
                      !formValid.lastName ||
                      !formValid.email ||
                      !(isProfileEqual && isTasksEqual && isTeamsEqual && isProjectsEqual)
                    }
                    canEditTeamCode={
                      props.hasPermission('editTeamCode') || requestorRole === 'Owner' ||requestorRole === 'Administrator'
                    }
                    setUserProfile={setUserProfile}
                    userProfile={userProfile}
                    codeValid={codeValid}
                    setCodeValid={setCodeValid}
                  />
                </ModalBody>
                <ModalFooter>
                  <Row>
                    <div className="profileEditButtonContainer">
                      {canEdit && (activeTab == '1' || canPutUserProfile) && (
                        <>
                          <SaveButton
                            className="mr-1 btn-bottom"
                            handleSubmit={handleSubmit}
                            disabled={
                              !formValid.firstName ||
                              !formValid.lastName ||
                              !formValid.email ||
                              !codeValid ||
                              (isProfileEqual && isTasksEqual && isTeamsEqual && isProjectsEqual)
                            }
                            userProfile={userProfile}
                            setSaved={() => setSaved(true)}
                          />
                          <span
                            onClick={() => {
                              setUserProfile(originalUserProfile);
                              setTasks(originalTasks);
                            }}
                            className="btn btn-outline-danger mr-1 btn-bottom"
                          >
                            X
                          </span>
                        </>
                      )}
                      <Button outline onClick={() => loadUserProfile()}>
                        <i className="fa fa-refresh" aria-hidden="true"></i>
                      </Button>
                    </div>
                  </Row>
                </ModalFooter>
              </Modal>
              <Button className="list-button" onClick={() => toggle('Projects')} color="secondary" style={boxStyle}>
                Projects
              </Button>
              <Modal isOpen={menuModalTabletScreen === 'Projects'} toggle={toggle}>
                <ModalHeader toggle={toggle}>Projects</ModalHeader>
                <ModalBody>
                  <ProjectsTab
                    userProjects={userProfile.projects || []}
                    userTasks={tasks}
                    projectsData={props?.allProjects?.projects || []}
                    onAssignProject={onAssignProject}
                    onDeleteProject={onDeleteProject}
                    edit={canPutUserProfile}
                    role={requestorRole}
                    userId={props.match.params.userId}
                    updateTask={onUpdateTask}
                    handleSubmit={handleSubmit}
                    disabled={
                      !formValid.firstName ||
                      !formValid.lastName ||
                      !formValid.email ||
                      !(isProfileEqual && isTasksEqual && isTeamsEqual && isProjectsEqual)
                    }
                  />
                </ModalBody>
                <ModalFooter>
                  <Row>
                    <div className="profileEditButtonContainer">
                      {canEdit && (activeTab == '1' || canPutUserProfile) && (
                        <>
                          <SaveButton
                            className="mr-1 btn-bottom"
                            handleSubmit={handleSubmit}
                            disabled={
                              !formValid.firstName ||
                              !formValid.lastName ||
                              !formValid.email ||
                              !codeValid ||
                              (isProfileEqual && isTasksEqual && isTeamsEqual && isProjectsEqual)
                            }
                            userProfile={userProfile}
                            setSaved={() => setSaved(true)}
                          />
                          <span
                            onClick={() => {
                              setUserProfile(originalUserProfile);
                              setTasks(originalTasks);
                            }}
                            className="btn btn-outline-danger mr-1 btn-bottom"
                          >
                            X
                          </span>
                        </>
                      )}
                      <Button outline onClick={() => loadUserProfile()}>
                        <i className="fa fa-refresh" aria-hidden="true"></i>
                      </Button>
                    </div>
                  </Row>
                </ModalFooter>
              </Modal>
              <Button
                className="list-button"
                onClick={() => toggle('Edit History')}
                color="secondary"
                style={boxStyle}
              >
                Edit History
              </Button>
              <Modal isOpen={menuModalTabletScreen === 'Edit History'} toggle={toggle}>
                <ModalHeader toggle={toggle}>Edit History</ModalHeader>
                <ModalBody>
                  <TimeEntryEditHistory userProfile={userProfile} setUserProfile={setUserProfile} />
                </ModalBody>
                <ModalFooter>
                  <Row>
                    <div className="profileEditButtonContainer">
                      {canEdit && (activeTab == '1' || canPutUserProfile) && (
                        <>
                          <SaveButton
                            className="mr-1 btn-bottom"
                            handleSubmit={handleSubmit}
                            disabled={
                              !formValid.firstName ||
                              !formValid.lastName ||
                              !formValid.email ||
                              !codeValid ||
                              (isProfileEqual && isTasksEqual && isTeamsEqual && isProjectsEqual)
                            }
                            userProfile={userProfile}
                            setSaved={() => setSaved(true)}
                          />
                          <span
                            onClick={() => {
                              setUserProfile(originalUserProfile);
                              setTasks(originalTasks);
                            }}
                            className="btn btn-outline-danger mr-1 btn-bottom"
                          >
                            X
                          </span>
                        </>
                      )}
                      <Button outline onClick={() => loadUserProfile()}>
                        <i className="fa fa-refresh" aria-hidden="true"></i>
                      </Button>
                    </div>
                  </Row>
                </ModalFooter>
              </Modal>
            </List>
          </Col>
        </Row>
        <Row>
          <Col md="4"></Col>
          <Col md="8" className="desktop-panel">
            <div className="profileEditButtonContainer">
              {canUpdatePassword && canEdit && !isUserSelf && (
                <ResetPasswordButton
                  className="mr-1 btn-bottom"
                  user={userProfile}
                  authEmail={authEmail}
                />
              )}
              {isUserSelf && (activeTab === '1' || canPutUserProfile) && (
                <Link
                  to={targetIsDevAdminUneditable ? `#` : `/updatepassword/${userProfile._id}`}
                  onClick={() => {
                    if (targetIsDevAdminUneditable) {
                      alert(
                        'STOP! YOU SHOULDN’T BE TRYING TO CHANGE THIS PASSWORD. ' +
                          'You shouldn’t even be using this account except to create your own accounts to use. ' +
                          'Please re-read the Local Setup Doc to understand why and what you should be doing instead of what you are trying to do now.',
                      );
                      return `#`;
                    }
                  }}
                >
                  <Button className="mr-1 btn-bottom" color="primary" style={boxStyle}>
                    {' '}
                    Update Password
                  </Button>
                </Link>
              )}
              {canEdit && (activeTab === '1' || activeTab === '2' || activeTab === '3') && (
                <>
                  <SaveButton
                    className="mr-1 btn-bottom"
                    handleSubmit={handleSubmit}
                    disabled={
                      !formValid.firstName ||
                      !formValid.lastName ||
                      !formValid.email ||
                      !codeValid ||
                      (userStartDate > userEndDate && userEndDate !== '') ||
                      (isProfileEqual && isTasksEqual && isTeamsEqual && isProjectsEqual) ||
                      isTeamSaved
                    }
                    userProfile={userProfile}
                    setSaved={() => setSaved(true)}
                  />
                  {activeTab !== '3' && (
                    <span
                      onClick={() => {
                        setUserProfile(originalUserProfile);
                        setTasks(originalTasks);
                        setTeams(originalTeams);
                      }}
                      className="btn btn-outline-danger mr-1 btn-bottom"
                      style={boxStyle}
                    >
                      Cancel
                    </span>
                  )}
                </>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default connect(null, { hasPermission })(UserProfile);
