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
import { boxStyle, boxStyleDark } from 'styles';
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
import { getAllTeamCode } from '../../actions/allTeamsAction';
import TimeEntryEditHistory from './TimeEntryEditHistory';
import ActiveInactiveConfirmationPopup from '../UserManagement/ActiveInactiveConfirmationPopup';
import { updateUserStatus, updateRehireableStatus } from '../../actions/userManagement';
import { UserStatus } from '../../utils/enums';
import BlueSquareLayout from './BlueSquareLayout';
import TeamWeeklySummaries from './TeamWeeklySummaries/TeamWeeklySummaries';
import { connect, useDispatch, useSelector } from 'react-redux';
import { convertDateFormatToMMMDDYY, formatDateLocal } from 'utils/formatDate';
import EditableInfoModal from './EditableModal/EditableInfoModal';
import { fetchAllProjects } from '../../actions/projects';
import { getAllUserTeams } from '../../actions/allTeamsAction';
import { toast } from 'react-toastify';
import { GiConsoleController } from 'react-icons/gi';
import { setCurrentUser } from '../../actions/authActions';
import { getAllTimeOffRequests } from '../../actions/timeOffRequestAction';
import QuickSetupModal from './QuickSetupModal/QuickSetupModal';
import {
  DEV_ADMIN_ACCOUNT_EMAIL_DEV_ENV_ONLY,
  DEV_ADMIN_ACCOUNT_CUSTOM_WARNING_MESSAGE_DEV_ENV_ONLY,
  PROTECTED_ACCOUNT_MODIFICATION_WARNING_MESSAGE,
} from 'utils/constants';
import { getTimeEndDateEntriesByPeriod } from '../../actions/timeEntries.js';
import { formatDateYYYYMMDD, CREATED_DATE_CRITERIA } from 'utils/formatDate.js';
import { v4 as uuidv4 } from 'uuid';
import { postWarningByUserId, getSpecialWarnings } from '../../actions/warnings';
function UserProfile(props) {
  const darkMode = useSelector(state => state.theme.darkMode);

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
  const [resetProjects, setResetProjects] = useState([]);
  const [id, setId] = useState('');
  const [activeTab, setActiveTab] = useState('1');
  const [formValid, setFormValid] = useState(initialFormValid);
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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingRehireableStatus, setPendingRehireableStatus] = useState(null);
  const [isRehireable, setIsRehireable] = useState(null);
  const [specialWarnings, setSpecialWarnings] = useState([]);
  const userProfileRef = useRef();

  const isTasksEqual = JSON.stringify(originalTasks) === JSON.stringify(tasks);
  const isProfileEqual = JSON.stringify(userProfile) === JSON.stringify(originalUserProfile);
  const [codeValid, setCodeValid] = useState(true);

  const [userStartDate, setUserStartDate] = useState('');
  const [userEndDate, setUserEndDate] = useState('');

  const [inputAutoComplete, setInputAutoComplete] = useState([]);
  const [inputAutoStatus, setInputAutoStatus] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const { userid: requestorId, role: requestorRole } = props.auth.user;

  const canEditTeamCode = props.hasPermission('editTeamCode');

  /* useEffect functions */
  useEffect(() => {
    loadUserProfile();
    getCurretLoggedinUserEmail();
    dispatch(fetchAllProjects());
    dispatch(getAllUserTeams());
    dispatch(getAllTimeOffRequests());
    dispatch(getAllTeamCode());
    canEditTeamCode && fetchTeamCodeAllUsers();
  }, []);

  // TO-DO Performance Optimization: Replace fetchTeamCodeAllUsers with getAllTeamCode(), a leener version API to retrieve all team codes (reduce data payload and response time)
  //        Also, replace passing inputAutoComplete, inputAutoStatus, and isLoading to the
  //        child component with access global redux store data (complexity)
  // Explaination:
  //        fetchTeamCodeAllUsers get all weekly summaries and filter out the team codes. (~800ms - 1 sec res time)
  //        getAllTeamCode() will get all team codes from the database directly with distinct teamcode value (~15ms res time cache enabled).
  const fetchTeamCodeAllUsers = async () => {
    const url = ENDPOINTS.WEEKLY_SUMMARIES_REPORT();
    try {
      setIsLoading(true);
      const response = await axios.get(url);
      const stringWithValue = response.data.map(item => item.teamCode).filter(Boolean);
      const stringNoRepeat = stringWithValue
        .map(item => item)
        .filter((item, index, array) => array.indexOf(item) === index);
      setInputAutoComplete(stringNoRepeat);
      setInputAutoStatus(response.status);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      toast.error(`It was not possible to retrieve the team codes.
      Please try again by clicking the icon inside the input auto complete.`);
    }
  };

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
    fetchSpecialWarnings();
  }, [props?.match?.params?.userId]);

  const checkIsTeamsEqual = () => {
    setOriginalTeams(teams);
    const originalTeamProperties = [];
    originalTeams?.forEach(team => {
      if (!team) return;
      for (const [key, value] of Object.entries(team)) {
        if (key == 'teamName') {
          originalTeamProperties.push({ [key]: value });
        }
      }
    });

    const teamsProperties = [];
    teams?.forEach(team => {
      if (!team) return;
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
    try {
      const res = await axios.get(ENDPOINTS.TEAM_USERS(teamId));
      const { data } = res;

      const activeMembers = data.filter(
        member => member._id !== currentManager._id && member.isActive,
      );

      const memberSubmitted = activeMembers
        .filter(member => member.weeklySummaries[0].summary !== '')
        .map(member => `${member.firstName} ${member.lastName}`);

      const memberNotSubmitted = activeMembers
        .filter(member => member.weeklySummaries[0].summary === '')
        .map(member => `${member.firstName} ${member.lastName}`);

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
    } catch (error) {
      console.error('Error fetching team users:', error);
    }
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

  const getCurretLoggedinUserEmail = async () => {
    const userId = props?.auth?.user?.userid;
    try {
      const response = await axios.get(ENDPOINTS.USER_PROFILE(userId));
      const currentUserEmail = response.data.email;
      dispatch(setCurrentUser({ ...props.auth.user, email: currentUserEmail }));
    } catch (err) {
      toast.error('Error while getting current logged in user email');
    }
  };

  const loadUserProfile = async () => {
    const userId = props?.match?.params?.userId;

    if (!userId) return;

    try {
      const response = await axios.get(ENDPOINTS.USER_PROFILE(userId));
      const newUserProfile = response.data;
      // Assuming newUserProfile contains isRehireable attribute
      setIsRehireable(newUserProfile.isRehireable); // Update isRehireable based on fetched data

      newUserProfile.totalIntangibleHrs = Number(newUserProfile.totalIntangibleHrs.toFixed(2));

      const teamId = newUserProfile?.teams[0]?._id;
      if (teamId) {
        await loadSummaryIntroDetails(teamId, response.data);
      }

      // Validate team and project data. Remove incorrect data which may lead to page crash. E.g teams: [null]
      newUserProfile.teams = newUserProfile.teams.filter(team => team !== null);
      newUserProfile.projects = newUserProfile.projects.filter(project => project !== null);
      setTeams(newUserProfile.teams);
      setOriginalTeams(newUserProfile.teams);
      setProjects(newUserProfile.projects);
      setOriginalProjects(newUserProfile.projects);
      setResetProjects(newUserProfile.projects);
      setUserProfile({
        ...newUserProfile,
        jobTitle: newUserProfile.jobTitle[0],
        phoneNumber: newUserProfile.phoneNumber[0],
        // startDate: newUserProfile?.startDate.split('T')[0],
        startDate: newUserProfile?.startDate ? formatDateYYYYMMDD(newUserProfile?.startDate) : '',
        createdDate: formatDateYYYYMMDD(newUserProfile?.createdDate),
        ...(newUserProfile?.endDate &&
          newUserProfile.endDate !== '' && { endDate: formatDateYYYYMMDD(newUserProfile.endDate) }),
      });
      setOriginalUserProfile({
        ...newUserProfile,
        jobTitle: newUserProfile.jobTitle[0],
        phoneNumber: newUserProfile.phoneNumber[0],
        // startDate: newUserProfile?.startDate.split('T')[0],
        startDate: newUserProfile?.startDate ? formatDateYYYYMMDD(newUserProfile?.startDate) : '',
        createdDate: formatDateYYYYMMDD(newUserProfile?.createdDate),
        ...(newUserProfile?.endDate &&
          newUserProfile.endDate !== '' && { endDate: formatDateYYYYMMDD(newUserProfile.endDate) }),
      });
      setUserStartDate(newUserProfile?.startDate.split('T')[0]);
      checkIsProjectsEqual();
      // isTeamSaved(true);
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
    if (targetIsDevAdminUneditable) {
      if (userProfile?.email === DEV_ADMIN_ACCOUNT_EMAIL_DEV_ENV_ONLY) {
        alert(DEV_ADMIN_ACCOUNT_CUSTOM_WARNING_MESSAGE_DEV_ENV_ONLY);
      } else {
        alert(PROTECTED_ACCOUNT_MODIFICATION_WARNING_MESSAGE);
      }
      return;
    }
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
  const modifyBlueSquares = async (id, dateStamp, summary, operation) => {
    setShowModal(false);
    if (operation === 'add') {
      /* peizhou: check that the date of the blue square is not future or empty. */
      if (moment(dateStamp).isAfter(moment().format('YYYY-MM-DD')) || dateStamp === '') {
        if (moment(dateStamp).isAfter(moment().format('YYYY-MM-DD'))) {
          console.log('WARNING: Future Blue Square');
          alert('WARNING: Cannot Assign Blue Square with a Future Date');
        }
        if (dateStamp === '') {
          console.log('WARNING: Empty Date');
          alert('WARNING: Cannot Assign Blue Square with an Empty Date');
        }
      } else {
        const newBlueSquare = {
          date: dateStamp,
          description: summary,
          createdDate: moment
            .tz('America/Los_Angeles')
            .toISOString()
            .split('T')[0],
        };
        setModalTitle('Blue Square');
        await axios
          .post(ENDPOINTS.ADD_BLUE_SQUARE(userProfile._id), {
            blueSquare: newBlueSquare,
          })
          .catch(error => {
            toast.error('Failed to add Blue Square!');
          });
        toast.success('Blue Square Added!');
        setOriginalUserProfile({
          ...originalUserProfile,
          infringements: userProfile.infringements?.concat(newBlueSquare),
        });
        setUserProfile({
          ...userProfile,
          infringements: userProfile.infringements?.concat(newBlueSquare),
        });
      }
    } else if (operation === 'update') {
      const currentBlueSquares = [...userProfile?.infringements] || [];
      if (dateStamp != null && currentBlueSquares.length !== 0) {
        currentBlueSquares.find(blueSquare => blueSquare._id === id).date = dateStamp;
      }
      if (summary != null && currentBlueSquares.length !== 0) {
        currentBlueSquares.find(blueSquare => blueSquare._id === id).description = summary;
      }
      await axios
        .put(ENDPOINTS.MODIFY_BLUE_SQUARE(userProfile._id, id), {
          dateStamp,
          summary,
        })
        .catch(error => {
          toast.error('Failed to update Blue Square!');
        });
      toast.success('Blue Square Updated!');
      setUserProfile({ ...userProfile, infringements: currentBlueSquares });
      setOriginalUserProfile({ ...userProfile, infringements: currentBlueSquares });
    } else if (operation === 'delete') {
      let newInfringements = [...userProfile?.infringements] || [];
      if (newInfringements.length !== 0) {
        newInfringements = newInfringements.filter(infringement => infringement._id !== id);
        await axios.delete(ENDPOINTS.MODIFY_BLUE_SQUARE(userProfile._id, id)).catch(error => {
          toast.error('Failed to delete Blue Square!');
        });
        toast.success('Blue Square Deleted!');
        setUserProfile({ ...userProfile, infringements: newInfringements });
        setOriginalUserProfile({ ...userProfile, infringements: newInfringements });
      }
    }
  };

  const fetchSpecialWarnings = async () => {
    const userId = props?.match?.params?.userId;
    try {
      dispatch(getSpecialWarnings(userId)).then(res => {
        if (res.error) {
          console.log(res.error);
          return;
        }
        setSpecialWarnings(res);
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogWarning = async newWarningData => {
    const warningData = {
      userId: props?.match?.params?.userId,
      description: newWarningData.title,
      color: newWarningData.colorAssigned,
      iconId: uuidv4(),
      date: moment().format('MM/DD/YYYY'),
      monitorData: {
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email,
        userId: props.auth.user.userid,
      },
    };

    dispatch(postWarningByUserId(warningData))
      .then(response => {
        if (response.error) {
          toast.error('Warning failed to log try again');
          return;
        } else {
          setShowModal(false);
          fetchSpecialWarnings();
          toast.success('Successfully logged and tracked');
        }
      })
      .catch(err => {
        console.log(err);
      });
  };
  const handleSubmit = async () => {
    for (let i = 0; i < updatedTasks.length; i += 1) {
      const updatedTask = updatedTasks[i];
      const url = ENDPOINTS.TASK_UPDATE(updatedTask.taskId);
      axios.put(url, updatedTask.updatedTask).catch(err => console.log(err));
    }
    try {
      const result = await props.updateUserProfile(userProfileRef.current);
      if (userProfile._id === props.auth.user.userid && props.auth.user.role !== userProfile.role) {
        await props.refreshToken(userProfile._id);
      }
      await loadUserProfile();
      await loadUserTasks();
      await fetchTeamCodeAllUsers();
      setSaved(false);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        const errorMessage = err.response.data.error.join('\n');
        alert(errorMessage);
      }
      return err;
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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1025) {
        setMenuModalTabletScreen('');
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
    let endDate;

    if (!isActive) {
      endDate = dispatch(
        getTimeEndDateEntriesByPeriod(userProfile._id, userProfile.createdDate, userProfile.toDate),
      );
      if (endDate == 'N/A') {
        endDate = userProfile.createdDate;
      }
    }
    const newUserProfile = {
      ...userProfile,
      isActive: isActive,
      endDate: endDate || undefined,
    };

    try {
      props.updateUserStatus(
        newUserProfile,
        isActive ? UserStatus.Active : UserStatus.InActive,
        undefined,
      );
      setUserProfile(newUserProfile);
      setOriginalUserProfile(newUserProfile);
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
    setActiveInactivePopupOpen(false);
  };

  const activeInactivePopupClose = () => {
    setActiveInactivePopupOpen(false);
  };

  const handleRehireableChange = () => {
    const newRehireableStatus = !isRehireable;
    setPendingRehireableStatus(newRehireableStatus);
    setShowConfirmDialog(true);
  };

  const handleConfirmChange = () => {
    setShowConfirmDialog(false);
    const updatedUserProfile = {
      ...userProfile,
      isRehireable: pendingRehireableStatus,
    };
    updateRehireableStatus(updatedUserProfile, pendingRehireableStatus);
    setIsRehireable(pendingRehireableStatus);
    setUserProfile(updatedUserProfile);
    setOriginalUserProfile(updatedUserProfile);
  };

  const handleCancelChange = () => {
    setShowConfirmDialog(false);
  };

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

  /**  Login User's email */
  const authEmail = props.auth?.user?.email;
  const isUserSelf = targetUserId === requestorId;

  const canChangeUserStatus = props.hasPermission('changeUserStatus');
  const canAddDeleteEditOwners = props.hasPermission('addDeleteEditOwners');
  const canPutUserProfile = props.hasPermission('putUserProfile');
  const canUpdatePassword = props.hasPermission('updatePassword');
  const canGetProjectMembers = props.hasPermission('getProjectMembers');
  const canChangeRehireableStatus = props.hasPermission('changeUserRehireableStatus');
  const canUpdateSummaryRequirements = props.hasPermission('updateSummaryRequirements');
  const canManageAdminLinks = props.hasPermission('manageAdminLinks');
  const canSeeQSC = props.hasPermission('seeQSC');
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

  const startDateValidation = (createdDate, startDate) => {
    // console.log("userProfile:createdDate, startDate", createdDate, startDate === '' ? "EMPTY" : startDate);
    return startDate === ''
      ? false
      : createdDate < CREATED_DATE_CRITERIA || createdDate <= startDate;
  };

  const endDateValidation = (startDate, endDate) => {
    // console.log("userProfile:startDate, endDate", startDate === '' ? "EMPTY" : startDate, endDate === '' ? "EMPTY" : endDate );
    return endDate ? startDate <= endDate : true;
  };

  const isStartDateValid = startDateValidation(userProfile.createdDate, userProfile.startDate);
  const isEndDateValid = endDateValidation(userProfile.startDate, userProfile.endDate);

  return (
    <div className={darkMode ? 'bg-oxford-blue' : ''} style={{ minHeight: '100%' }}>
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
          handleLogWarning={handleLogWarning}
          specialWarnings={specialWarnings}
        />
      )}
      <TabToolTips />
      <BasicToolTips />
      <Container
        className={`py-5 ${darkMode ? 'bg-yinmn-blue text-light' : ''}`}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <Row>
          <Col md="4" id="profileContainer">
            <div className="profile-img">
              <Image
                src={profilePic || '/pfp-default.png'}
                alt="Profile Picture"
                roundedCircle
                className="profilePicture bg-white"
                // this line below should fix the image formatting issue
                style={profilePic ? {} : { width: '240px', height: '240px' }}
              />
              {canEdit ? (
                <div
                  className="image-button file btn btn-lg btn-primary"
                  style={darkMode ? boxStyleDark : boxStyle}
                >
                  Change Photo
                  <Input
                    style={{ width: '100%', height: '100%', zIndex: '2', cursor: 'pointer' }}
                    type="file"
                    name="newProfilePic"
                    id="newProfilePic"
                    onChange={handleImageUpload}
                    accept="image/png,image/jpeg, image/jpg"
                  />
                </div>
              ) : null}
            </div>
            <QuickSetupModal
              setSaved={setSaved}
              handleSubmit={handleSubmit}
              setUserProfile={setUserProfile}
              userProfile={userProfile}
              userTeams={teams || []}
              teamsData={props?.allTeams?.allTeamsData || []}
              projectsData={props?.allProjects?.projects || []}
            />
          </Col>
          <Col md="8">
            {!isProfileEqual ||
            !isTasksEqual ||
            (!isTeamsEqual && !isTeamSaved) ||
            !isProjectsEqual ? (
              <Alert color="warning">
                Please click on &quot;Save changes&quot; to save the changes you have made.{' '}
              </Alert>
            ) : null}
            {!codeValid ? (
              <Alert color="danger">
                NOT SAVED! The code must be between 5 and 7 characters long
              </Alert>
            ) : null}
            <div className="profile-head">
              <h5
                className={`mr-2 ${darkMode ? 'text-light' : ''}`}
              >{`${firstName} ${lastName}`}</h5>
              <div style={{ marginTop: '6px' }}>
                <EditableInfoModal
                  areaName="UserProfileInfoModal"
                  areaTitle="User Profile"
                  fontSize={24}
                  isPermissionPage
                  role={requestorRole} // Pass the 'role' prop to EditableInfoModal
                  darkMode={darkMode}
                />
              </div>
              <span className="mr-2">
                <ActiveCell
                  isActive={userProfile.isActive}
                  user={userProfile}
                  canChange={canChangeUserStatus}
                  onClick={() => {
                    if (cantDeactivateOwner(userProfile, requestorRole)) {
                      // Owner user cannot be deactivated by another user that is not an Owner.
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
                        setActiveInactivePopupOpen(true);
                      }
                    }}
                  />
                </span>
              )}
              {canChangeRehireableStatus && (
                <span className="mr-2">
                  <i
                    className={isRehireable ? 'fa fa-check-square-o' : 'fa fa-square-o'}
                    aria-hidden="true"
                    style={{ fontSize: 24, cursor: 'pointer', marginTop: '6px' }}
                    title="Click to change rehirable status"
                    onClick={handleRehireableChange}
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
                style={darkMode ? boxStyleDark : boxStyle}
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
                  style={darkMode ? boxStyleDark : boxStyle}
                >
                  Generate Summary Intro
                </Button>
              ) : (
                ''
              )}
            </div>
            <h6 className={darkMode ? 'text-light' : 'text-azure'}>{jobTitle}</h6>
            <p className={`proile-rating ${darkMode ? 'text-light' : ''}`}>
              {/* use converted date without tz otherwise the record's will updated with timezoned ts for start date.  */}
              From :{' '}
              <span className={darkMode ? 'text-light' : ''}>
                {formatDateLocal(userProfile.startDate)}
              </span>
              {'   '}
              To:{' '}
              <span className={darkMode ? 'text-light' : ''}>
                {userProfile.endDate ? formatDateLocal(userProfile.endDate) : 'N/A'}
              </span>
            </p>
            {showSelect && summaries === undefined ? <div>Loading</div> : <div />}
            {showSelect && summaries !== undefined ? (
              <div>
                <Select
                  className={darkMode ? 'text-azure' : ''}
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
                  <TeamWeeklySummaries
                    key={data._id}
                    i={i}
                    name={summaryName}
                    data={data}
                    darkMode={darkMode}
                  />
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
              isRecordBelongsToJaeAndUneditable={targetIsDevAdminUneditable}
              darkMode={darkMode}
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
                canEdit={canEdit || canManageAdminLinks}
                darkMode={darkMode}
              />
              <BlueSquareLayout
                userProfile={userProfile}
                handleUserProfile={handleUserProfile}
                handleSaveError={props.handleSaveError}
                handleBlueSquare={handleBlueSquare}
                user={props.auth.user}
                isUserSelf={isUserSelf}
                canEdit={canEdit}
                darkMode={darkMode}
              />
            </div>
          </Col>
          <Col md="8" className="profile-functions-desktop">
            <div className="profile-tabs">
              <Nav tabs>
                <NavItem>
                  <NavLink
                    className={classnames(
                      { active: activeTab === '1' },
                      'nav-link',
                      darkMode && activeTab === '1' ? 'bg-space-cadet' : 'text-azure',
                      darkMode ? 'text-light' : '',
                    )}
                    onClick={() => toggleTab('1')}
                    id="nabLink-basic"
                  >
                    Basic Information
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames(
                      { active: activeTab === '2' },
                      'nav-link',
                      darkMode && activeTab === '2' ? 'bg-space-cadet' : 'text-azure',
                      darkMode ? 'text-light' : '',
                    )}
                    onClick={() => toggleTab('2')}
                    id="nabLink-time"
                  >
                    Volunteering Times
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames(
                      { active: activeTab === '3' },
                      'nav-link',
                      darkMode && activeTab === '3' ? 'bg-space-cadet' : 'text-azure',
                      darkMode ? 'text-light' : '',
                    )}
                    onClick={() => toggleTab('3')}
                    id="nabLink-teams"
                  >
                    Teams
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames(
                      { active: activeTab === '4' },
                      'nav-link',
                      darkMode && activeTab === '4' ? 'bg-space-cadet' : 'text-azure',
                      darkMode ? 'text-light' : '',
                    )}
                    onClick={() => toggleTab('4')}
                    id="nabLink-projects"
                  >
                    Projects
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames(
                      { active: activeTab === '5' },
                      'nav-link',
                      darkMode && activeTab === '5' ? 'bg-space-cadet' : 'text-azure',
                      darkMode ? 'text-light' : '',
                    )}
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
              className={`tab-content profile-tab ${darkMode ? 'bg-yinmn-blue' : ''}`}
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
                  darkMode={darkMode}
                />
              </TabPane>
              <TabPane tabId="2">
                <VolunteeringTimeTab
                  userProfile={userProfile}
                  setUserProfile={setUserProfile}
                  isUserSelf={isUserSelf}
                  role={requestorRole}
                  onEndDate={handleEndDate}
                  loadUserProfile={loadUserProfile}
                  canEdit={canEditUserProfile}
                  canUpdateSummaryRequirements={canUpdateSummaryRequirements}
                  onStartDate={handleStartDate}
                  darkMode={darkMode}
                />
              </TabPane>
              <TabPane tabId="3">
                <TeamsTab
                  userTeams={teams || []}
                  teamsData={props?.allTeams?.allTeamsData || []}
                  onAssignTeam={onAssignTeam}
                  onDeleteTeam={onDeleteTeam}
                  edit={canEdit && !targetIsDevAdminUneditable}
                  role={requestorRole}
                  onUserVisibilitySwitch={onUserVisibilitySwitch}
                  isVisible={userProfile.isVisible}
                  canEditVisibility={canEdit && !['Volunteer', 'Mentor'].includes(requestorRole)}
                  handleSubmit={handleSubmit}
                  disabled={
                    !formValid.firstName ||
                    !formValid.lastName ||
                    !formValid.email ||
                    (!(isProfileEqual && isTasksEqual && isTeamsEqual && isProjectsEqual) &&
                      !isTeamSaved)
                  }
                  canEditTeamCode={canEditTeamCode}
                  setUserProfile={setUserProfile}
                  userProfile={userProfile}
                  codeValid={codeValid}
                  setCodeValid={setCodeValid}
                  saved={saved}
                  inputAutoComplete={inputAutoComplete}
                  inputAutoStatus={inputAutoStatus}
                  isLoading={isLoading}
                  fetchTeamCodeAllUsers={() => fetchTeamCodeAllUsers()}
                  isTeamSaved={isSaved => setIsTeamSaved(isSaved)}
                  darkMode={darkMode}
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
                  darkMode={darkMode}
                />
              </TabPane>
              <TabPane tabId="5">
                <TimeEntryEditHistory
                  userProfile={userProfile}
                  setUserProfile={setUserProfile}
                  role={requestorRole}
                  isRecordBelongsToJaeAndUneditable={targetIsDevAdminUneditable}
                  darkMode={darkMode}
                />
              </TabPane>
            </TabContent>
            <div className="profileEditButtonContainer">
              {canUpdatePassword && canEdit && !isUserSelf && (
                <ResetPasswordButton
                  className="mr-1 btn-bottom"
                  user={userProfile}
                  authEmail={authEmail}
                  canResetPassword={true}
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
                  <Button
                    className="mr-1 btn-bottom"
                    color="primary"
                    style={darkMode ? boxStyleDark : boxStyle}
                  >
                    {' '}
                    Update Password
                  </Button>
                </Link>
              )}
              {canEdit && activeTab && (
                <>
                  <SaveButton
                    className="mr-1 btn-bottom"
                    handleSubmit={async () => await handleSubmit()}
                    disabled={
                      !formValid.firstName ||
                      !formValid.lastName ||
                      !formValid.email ||
                      !codeValid ||
                      (isProfileEqual && isTasksEqual && isTeamsEqual && isProjectsEqual) ||
                      !(isStartDateValid && isEndDateValid) ||
                      isTeamSaved
                    }
                    userProfile={userProfile}
                    setSaved={() => setSaved(true)}
                    darkMode={darkMode}
                  />
                  {activeTab !== '3' && (
                    <span
                      onClick={() => {
                        setUserProfile(originalUserProfile);
                        setTasks(originalTasks);
                        setTeams(originalTeams);
                        setProjects(resetProjects);
                      }}
                      className={`btn mr-1 btn-bottom ${
                        darkMode ? 'btn-danger' : 'btn-outline-danger '
                      }`}
                      style={darkMode ? boxStyleDark : boxStyle}
                    >
                      Cancel
                    </span>
                  )}
                </>
              )}
            </div>
          </Col>
          <Col md="8" className="profile-functions-tablet">
            <List className="profile-functions-list">
              <Button
                className="list-button"
                onClick={() => toggle('Basic Information')}
                color="primary"
                style={darkMode ? boxStyleDark : boxStyle}
              >
                Basic Information
              </Button>
              <Modal
                isOpen={showConfirmDialog}
                toggle={handleCancelChange}
                className={darkMode ? 'text-light dark-mode' : ''}
              >
                <ModalHeader
                  toggle={handleCancelChange}
                  className={darkMode ? 'bg-space-cadet' : ''}
                >
                  Confirm Status Change
                </ModalHeader>
                <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
                  {`Are you sure you want to change the user status to ${
                    pendingRehireableStatus ? 'Rehireable' : 'Unrehireable'
                  }?`}
                </ModalBody>
                <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
                  <Button color="primary" onClick={handleConfirmChange}>
                    Confirm
                  </Button>{' '}
                  <Button color="secondary" onClick={handleCancelChange}>
                    Cancel
                  </Button>
                </ModalFooter>
              </Modal>
              <Modal
                isOpen={menuModalTabletScreen === 'Basic Information'}
                toggle={toggle}
                className={darkMode ? 'text-light dark-mode' : ''}
              >
                <ModalHeader toggle={toggle} className={darkMode ? 'bg-space-cadet' : ''}>
                  Basic Information
                </ModalHeader>
                <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
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
                    darkMode={darkMode}
                  />
                </ModalBody>
                <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
                  <Row>
                    <div className="profileEditButtonContainer">
                      {canUpdatePassword && canEdit && !isUserSelf && (
                        <ResetPasswordButton
                          className="mr-1 btn-bottom"
                          user={userProfile}
                          authEmail={authEmail}
                          canResetPassword={true}
                        />
                      )}
                      {isUserSelf && (activeTab == '1' || canPutUserProfile) && (
                        <Link
                          to={
                            targetIsDevAdminUneditable ? `#` : `/updatepassword/${userProfile._id}`
                          }
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
                          <Button
                            className="mr-1 btn-bottom"
                            color="primary"
                            style={darkMode ? boxStyleDark : boxStyle}
                          >
                            {' '}
                            Update Password
                          </Button>
                        </Link>
                      )}
                      {canEdit && (activeTab == '1' || canPutUserProfile) && (
                        <>
                          <SaveButton
                            className="mr-1 btn-bottom"
                            handleSubmit={async () => await handleSubmit()}
                            disabled={
                              !formValid.firstName ||
                              !formValid.lastName ||
                              !formValid.email ||
                              !codeValid ||
                              (isProfileEqual && isTasksEqual && isTeamsEqual && isProjectsEqual)
                            }
                            userProfile={userProfile}
                            setSaved={() => setSaved(true)}
                            darkMode={darkMode}
                          />
                          <span
                            onClick={() => {
                              setUserProfile(originalUserProfile);
                              setTasks(originalTasks);
                              setProjects(resetProjects);
                            }}
                            className={`btn mr-1 btn-bottom ${
                              darkMode ? 'btn-danger' : 'btn-outline-danger '
                            }`}
                            style={darkMode ? boxStyleDark : boxStyle}
                          >
                            X
                          </span>
                        </>
                      )}
                      <Button
                        {...(darkMode ? { outline: false } : { outline: true })}
                        onClick={() => loadUserProfile()}
                        style={darkMode ? boxStyleDark : boxStyle}
                      >
                        <i
                          className={`fa fa-refresh ${darkMode ? 'text-light' : ''}`}
                          aria-hidden="true"
                        />
                      </Button>
                    </div>
                  </Row>
                </ModalFooter>
              </Modal>
              <Button
                className="list-button"
                onClick={() => toggle('Volunteering Times')}
                color="secondary"
                style={darkMode ? boxStyleDark : boxStyle}
              >
                Volunteering Times
              </Button>
              <Modal
                isOpen={menuModalTabletScreen === 'Volunteering Times'}
                toggle={toggle}
                className={darkMode ? 'text-light dark-mode' : ''}
              >
                <ModalHeader toggle={toggle} className={darkMode ? 'bg-space-cadet' : ''}>
                  Volunteering Times
                </ModalHeader>
                <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
                  <VolunteeringTimeTab
                    userProfile={userProfile}
                    setUserProfile={setUserProfile}
                    isUserSelf={isUserSelf}
                    role={requestorRole}
                    onEndDate={handleEndDate}
                    canEdit={canEditUserProfile}
                    canUpdateSummaryRequirements={canUpdateSummaryRequirements}
                    onStartDate={handleStartDate}
                    darkMode={darkMode}
                  />
                </ModalBody>
                <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
                  <Row>
                    <div className="profileEditButtonContainer">
                      {canEdit && (activeTab == '1' || canPutUserProfile) && (
                        <>
                          <SaveButton
                            className="mr-1 btn-bottom"
                            handleSubmit={async () => await handleSubmit()}
                            disabled={
                              !formValid.firstName ||
                              !formValid.lastName ||
                              !formValid.email ||
                              !codeValid ||
                              (isProfileEqual && isTasksEqual && isTeamsEqual && isProjectsEqual) ||
                              !(isStartDateValid && isEndDateValid)
                            }
                            userProfile={userProfile}
                            setSaved={() => setSaved(true)}
                            darkMode={darkMode}
                          />
                          <span
                            onClick={() => {
                              setUserProfile(originalUserProfile);
                              setTasks(originalTasks);
                              setProjects(resetProjects);
                            }}
                            className={`btn mr-1 btn-bottom ${
                              darkMode ? 'btn-danger' : 'btn-outline-danger '
                            }`}
                            style={darkMode ? boxStyleDark : boxStyle}
                          >
                            X
                          </span>
                        </>
                      )}
                      <Button
                        {...(darkMode ? { outline: false } : { outline: true })}
                        onClick={() => loadUserProfile()}
                        style={darkMode ? boxStyleDark : boxStyle}
                      >
                        <i
                          className={`fa fa-refresh ${darkMode ? 'text-light' : ''}`}
                          aria-hidden="true"
                        />
                      </Button>
                    </div>
                  </Row>
                </ModalFooter>
              </Modal>
              <Button
                className="list-button"
                onClick={() => toggle('Teams')}
                color="secondary"
                style={darkMode ? boxStyleDark : boxStyle}
              >
                Teams
              </Button>
              <Modal
                isOpen={menuModalTabletScreen === 'Teams'}
                toggle={toggle}
                className={darkMode ? 'text-light dark-mode' : ''}
              >
                <ModalHeader toggle={toggle} className={darkMode ? 'bg-space-cadet' : ''}>
                  Teams
                </ModalHeader>
                <ModalBody className={darkMode ? 'bg-yinmn-blue text-light' : ''}>
                  <TeamsTab
                    userTeams={userProfile?.teams || []}
                    teamsData={props?.allTeams?.allTeamsData || []}
                    onAssignTeam={onAssignTeam}
                    onDeleteTeam={onDeleteTeam}
                    edit={canEdit}
                    role={requestorRole}
                    onUserVisibilitySwitch={onUserVisibilitySwitch}
                    isVisible={userProfile.isVisible}
                    canEditVisibility={canEdit && !['Volunteer', 'Mentor'].includes(requestorRole)}
                    handleSubmit={handleSubmit}
                    disabled={
                      !formValid.firstName ||
                      !formValid.lastName ||
                      !formValid.email ||
                      !(isProfileEqual && isTasksEqual && isTeamsEqual && isProjectsEqual)
                    }
                    canEditTeamCode={canEditTeamCode}
                    setUserProfile={setUserProfile}
                    userProfile={userProfile}
                    codeValid={codeValid}
                    setCodeValid={setCodeValid}
                    darkMode={darkMode}
                    inputAutoComplete={inputAutoComplete}
                    inputAutoStatus={inputAutoStatus}
                    isLoading={isLoading}
                    fetchTeamCodeAllUsers={() => fetchTeamCodeAllUsers()}
                  />
                </ModalBody>
                <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
                  <Row>
                    <div className="profileEditButtonContainer">
                      {canEdit && (activeTab == '1' || canPutUserProfile) && (
                        <>
                          <SaveButton
                            className="mr-1 btn-bottom"
                            handleSubmit={async () => await handleSubmit()}
                            disabled={
                              !formValid.firstName ||
                              !formValid.lastName ||
                              !formValid.email ||
                              !codeValid ||
                              (isProfileEqual && isTasksEqual && isTeamsEqual && isProjectsEqual)
                            }
                            userProfile={userProfile}
                            setSaved={() => setSaved(true)}
                            darkMode={darkMode}
                          />
                          <span
                            onClick={() => {
                              setUserProfile(originalUserProfile);
                              setTasks(originalTasks);
                              setProjects(resetProjects);
                            }}
                            className={`btn mr-1 btn-bottom ${
                              darkMode ? 'btn-danger' : 'btn-outline-danger '
                            }`}
                            style={darkMode ? boxStyleDark : boxStyle}
                          >
                            X
                          </span>
                        </>
                      )}
                      <Button
                        {...(darkMode ? { outline: false } : { outline: true })}
                        onClick={() => loadUserProfile()}
                        style={darkMode ? boxStyleDark : boxStyle}
                      >
                        <i
                          className={`fa fa-refresh ${darkMode ? 'text-light' : ''}`}
                          aria-hidden="true"
                        />
                      </Button>
                    </div>
                  </Row>
                </ModalFooter>
              </Modal>
              <Button
                className="list-button"
                onClick={() => toggle('Projects')}
                color="secondary"
                style={darkMode ? boxStyleDark : boxStyle}
              >
                Projects
              </Button>
              <Modal
                isOpen={menuModalTabletScreen === 'Projects'}
                toggle={toggle}
                className={darkMode ? 'text-light dark-mode' : ''}
              >
                <ModalHeader toggle={toggle} className={darkMode ? 'bg-space-cadet' : ''}>
                  Projects
                </ModalHeader>
                <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
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
                    darkMode={darkMode}
                  />
                </ModalBody>
                <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
                  <Row>
                    <div className="profileEditButtonContainer">
                      {canEdit && (activeTab == '1' || canPutUserProfile) && (
                        <>
                          <SaveButton
                            className="mr-1 btn-bottom"
                            handleSubmit={async () => await handleSubmit()}
                            disabled={
                              !formValid.firstName ||
                              !formValid.lastName ||
                              !formValid.email ||
                              !codeValid ||
                              (isProfileEqual && isTasksEqual && isTeamsEqual && isProjectsEqual)
                            }
                            userProfile={userProfile}
                            setSaved={() => setSaved(true)}
                            darkMode={darkMode}
                          />
                          <span
                            onClick={() => {
                              setUserProfile(originalUserProfile);
                              setTasks(originalTasks);
                              setProjects(resetProjects);
                            }}
                            className={`btn mr-1 btn-bottom ${
                              darkMode ? 'btn-danger' : 'btn-outline-danger '
                            }`}
                            style={darkMode ? boxStyleDark : boxStyle}
                          >
                            X
                          </span>
                        </>
                      )}
                      <Button
                        {...(darkMode ? { outline: false } : { outline: true })}
                        onClick={() => loadUserProfile()}
                        style={darkMode ? boxStyleDark : boxStyle}
                      >
                        <i
                          className={`fa fa-refresh ${darkMode ? 'text-light' : ''}`}
                          aria-hidden="true"
                        />
                      </Button>
                    </div>
                  </Row>
                </ModalFooter>
              </Modal>
              <Button
                className="list-button"
                onClick={() => toggle('Edit History')}
                color="secondary"
                style={darkMode ? boxStyleDark : boxStyle}
              >
                Edit History
              </Button>
              <Modal
                isOpen={menuModalTabletScreen === 'Edit History'}
                toggle={toggle}
                className={darkMode ? 'text-light dark-mode' : ''}
              >
                <ModalHeader toggle={toggle} className={darkMode ? 'bg-space-cadet' : ''}>
                  Edit History
                </ModalHeader>
                <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
                  <TimeEntryEditHistory
                    userProfile={userProfile}
                    setUserProfile={setUserProfile}
                    darkMode={darkMode}
                    tabletView
                  />
                </ModalBody>
                <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
                  <Row>
                    <div className="profileEditButtonContainer">
                      {canEdit && (activeTab == '1' || canPutUserProfile) && (
                        <>
                          <SaveButton
                            className="mr-1 btn-bottom"
                            handleSubmit={async () => await handleSubmit()}
                            disabled={
                              !formValid.firstName ||
                              !formValid.lastName ||
                              !formValid.email ||
                              !codeValid ||
                              (isProfileEqual && isTasksEqual && isTeamsEqual && isProjectsEqual)
                            }
                            userProfile={userProfile}
                            setSaved={() => setSaved(true)}
                            darkMode={darkMode}
                          />
                          <span
                            onClick={() => {
                              setUserProfile(originalUserProfile);
                              setTasks(originalTasks);
                              setProjects(resetProjects);
                            }}
                            className={`btn mr-1 btn-bottom ${
                              darkMode ? 'btn-danger' : 'btn-outline-danger '
                            }`}
                            style={darkMode ? boxStyleDark : boxStyle}
                          >
                            X
                          </span>
                        </>
                      )}
                      <Button
                        {...(darkMode ? { outline: false } : { outline: true })}
                        onClick={() => loadUserProfile()}
                        style={darkMode ? boxStyleDark : boxStyle}
                      >
                        <i
                          className={`fa fa-refresh ${darkMode ? 'text-light' : ''}`}
                          aria-hidden="true"
                        />
                      </Button>
                    </div>
                  </Row>
                </ModalFooter>
              </Modal>
            </List>
          </Col>
        </Row>
        <Row>
          <Col md="4" />
          {/* <Col md="8" className="desktop-panel">
          </Col> */}
        </Row>
      </Container>
    </div>
  );
}

export default connect(null, { hasPermission, updateUserStatus })(UserProfile);
