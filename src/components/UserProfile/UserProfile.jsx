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
import { Link, useHistory } from 'react-router-dom';
import classnames from 'classnames';
import moment from 'moment';
import Alert from 'reactstrap/lib/Alert';
import axios from 'axios';
import { boxStyle, boxStyleDark } from '~/styles';
import { v4 as uuidv4 } from 'uuid';
import hasPermission, {
  cantDeactivateOwner,
  cantUpdateDevAdminDetails,
} from '../../utils/permissions';
import ActiveCell from '../UserManagement/ActiveCell';
import { ENDPOINTS } from '~/utils/URL';
import SkeletonLoading from '../common/SkeletonLoading';
import UserProfileModal from './UserProfileModal';
import './UserProfile.scss';
import teamStyles from '../TeamMemberTasks/style.module.css';
import TeamsTab from './TeamsAndProjects/TeamsTab';
import ProjectsTab from './TeamsAndProjects/ProjectsTab';
import BasicInformationTab from './BasicInformationTab/BasicInformationTab';
import VolunteeringTimeTab from './VolunteeringTimeTab/VolunteeringTimeTab';
import SaveButton from './UserProfileEdit/SaveButton';
import UserLinkLayout from './UserLinkLayout';
import TabToolTips from './ToolTips/TabToolTips';
import BasicToolTips from './ToolTips/BasicTabTips';
import TeamsTabTips from './ToolTips/TeamsTabTips';
import ResetPasswordButton from '../UserManagement/ResetPasswordButton';
import Badges from './Badges';
import { getAllTeamCode , getAllUserTeams } from '../../actions/allTeamsAction';
import TimeEntryEditHistory from './TimeEntryEditHistory';
import ActiveInactiveConfirmationPopup from '../UserManagement/ActiveInactiveConfirmationPopup';
import { updateRehireableStatus, toggleVisibility } from '../../actions/userManagement';
import { updateUserProfile } from "../../actions/userProfile";
import BlueSquareLayout from './BlueSquareLayout';
import TeamWeeklySummaries from './TeamWeeklySummaries/TeamWeeklySummaries';
import { connect, useDispatch, useSelector } from 'react-redux';
import { formatDateCompany } from '~/utils/formatDate';
import EditableInfoModal from './EditableModal/EditableInfoModal';
import { fetchAllProjects } from '../../actions/projects';

import { toast } from 'react-toastify';
import { setCurrentUser } from '../../actions/authActions';
import { getAllTimeOffRequests } from '../../actions/timeOffRequestAction';
import QuickSetupModal from './QuickSetupModal/QuickSetupModal';
import {
  DEV_ADMIN_ACCOUNT_EMAIL_DEV_ENV_ONLY,
  DEV_ADMIN_ACCOUNT_CUSTOM_WARNING_MESSAGE_DEV_ENV_ONLY,
  PROTECTED_ACCOUNT_MODIFICATION_WARNING_MESSAGE,
} from '~/utils/constants';

import {
  getTimeEndDateEntriesByPeriod,
  getTimeStartDateEntriesByPeriod,
  getTimeEntriesForWeek,
} from '../../actions/timeEntries.js';
import ConfirmRemoveModal from './UserProfileModal/confirmRemoveModal';
import { formatDateYYYYMMDD, CREATED_DATE_CRITERIA } from '~/utils/formatDate.js';
import AccessManagementModal from './UserProfileModal/AccessManagementModal';
import { postWarningByUserId, getSpecialWarnings } from '../../actions/warnings';
import SetUpFinalDayPopUp from '../UserManagement/SetUpFinalDayPopUp';
import { InactiveReason } from '../../utils/enums';
import { activateUserAction, deactivateImmediatelyAction, scheduleDeactivationAction } from '../../actions/userLifecycleActions';


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
  const history = useHistory();


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
      return stringNoRepeat;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
      setIsLoading(false);
      toast.error(`It was not possible to retrieve the team codes.
      Please try again by clicking the icon inside the input auto complete.`);
    }
  };


  /* Hooks */
  const [showLoading, setShowLoading] = useState(true);
  const [isSavingImage, setIsSavingImage] = useState(false);
  const [showSelect, setShowSelect] = useState(false);
  const [summaries, setSummaries] = useState(undefined);
  const [userProfile, setUserProfile] = useState(undefined);
  const [originalUserProfile, setOriginalUserProfile] = useState(undefined);
  const [originalTasks, setOriginalTasks] = useState([]);

  const [teams, setTeams] = useState([]);
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
  const [finalDayPopupOpen, setFinalDayPopupOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [updatedTasks, setUpdatedTasks] = useState([]);
  const [summarySelected, setSummarySelected] = useState(null);
  const [summaryName, setSummaryName] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [saved, setSaved] = useState(false);
  const [summaryIntro, setSummaryIntro] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showToggleVisibilityModal, setShowToggleVisibilityModal] = useState(false);
  const [pendingRehireableStatus, setPendingRehireableStatus] = useState(null);
  const [isRehireable, setIsRehireable] = useState(null);
  const [specialWarnings, setSpecialWarnings] = useState([]);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const toggleRemoveModal = () => setIsRemoveModalOpen(!isRemoveModalOpen);
  const [loadingSummaries, setLoadingSummaries] = useState(false);
  const [showAccessManagementModal, setShowAccessManagementModal] = useState(false);
  const allRequests = useSelector(state => state.timeOffRequests?.requests);

  const updateRemovedImage = async () => {
    try {
      const response = await axios.put(ENDPOINTS.USERS_REMOVE_PROFILE_IMAGE, {
        user_id: userProfile._id,
      });
      await loadUserProfile();
      toast.success('Profile Image Removed');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
      toast.error('Failed to remove profile Image.');
    }
  };
  const confirmRemoveImage = async () => {
    updateRemovedImage();
    toggleRemoveModal(); // Close the remove confirmation modal
  };

  const userProfileRef = useRef();

  const isTasksEqual = JSON.stringify(originalTasks) === JSON.stringify(tasks);
  const isProfileEqual = JSON.stringify(userProfile) === JSON.stringify(originalUserProfile);
  const [codeValid, setCodeValid] = useState(true);

  const [userStartDate, setUserStartDate] = useState('');
  const [userEndDate, setUserEndDate] = useState('');
  const [calculatedStartDate, setCalculatedStartDate] = useState(''); 

  const [inputAutoComplete, setInputAutoComplete] = useState([]);
  const [inputAutoStatus, setInputAutoStatus] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const { userid: requestorId, role: requestorRole } = props.auth.user;

  const canEditTeamCode = props.hasPermission('editTeamCode');
  const [titleOnSet, setTitleOnSet] = useState(false); // added by development

  /* useEffect functions */ // added by luis, the below useEffect
  useEffect(() => {
    getCurretLoggedinUserEmail();
    dispatch(fetchAllProjects());
    dispatch(getAllUserTeams());
    dispatch(getAllTimeOffRequests());
    dispatch(getAllTeamCode());
    fetchSpecialWarnings();
  }, []);

 
  const updateProjectTouserProfile = () => {
    return new Promise(resolve => {
      checkIsProjectsEqual();

      setUserProfile(prevState => {
        const updatedProfile = prevState;
        if (updatedProfile) {
          updatedProfile.projects = projects || updatedProfile.projects;
        }
        return updatedProfile;
      });
      setOriginalUserProfile(prevState => {
        const updatedOriginalProfile = prevState;
        if (updatedOriginalProfile) {
          updatedOriginalProfile.projects = projects || updatedOriginalProfile.projects;
        }
        return updatedOriginalProfile;
      });
    });
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

  const buildSummaryIntroDetails = async (teamId, user) => {
    const currentManager = user;
  
    if (!teamId) {
      return `This week’s summary was managed by ${currentManager.firstName} ${currentManager.lastName} and includes .
       These people did NOT provide a summary .
       <Insert the proofread and single-paragraph summary created by ChatGPT>`;
    }
  
    try {
      const res = await axios.get(ENDPOINTS.TEAM_USERS(teamId));
      const { data } = res;
  
      const activeMembers = data.filter(
        member => member._id !== currentManager._id && member.isActive,
      );
  
      const memberSubmitted = await Promise.all(
        activeMembers
          .filter(member => member.weeklySummaries[0].summary !== '')
          .map(async member => {
            const results = await dispatch(getTimeEntriesForWeek(member._id, 0));
            const returnData = calculateTotalTime(results.data, true);
  
            return returnData < member.weeklycommittedHours
              ? `${member.firstName} ${member.lastName} hasn't completed hours`
              : `${member.firstName} ${member.lastName}`;
          }),
      );
  
      const memberNotSubmitted = activeMembers
        .filter(member => member.weeklySummaries[0].summary === '')
        .map(member =>
          getTimeOffStatus(member._id)
            ? `${member.firstName} ${member.lastName} off for the week`
            : `${member.firstName} ${member.lastName}`,
        );
  
      const memberSubmittedString =
        memberSubmitted.length !== 0
          ? memberSubmitted.join(', ')
          : '<list all team members names included in the summary>';
  
      const memberDidntSubmitString =
        memberNotSubmitted.length !== 0
          ? memberNotSubmitted.join(', ')
          : '<list all team members names NOT included in the summary>';
  
      return `This week's summary was managed by ${currentManager.firstName} ${currentManager.lastName} and includes ${memberSubmittedString}. These people did NOT provide a summary ${memberDidntSubmitString}. <Insert the proofread and single-paragraph summary created by ChatGPT>`;
    } catch (error) {
      console.error('Error fetching team users:', error);
      return '';
    }
  };
  

  const calculateTotalTime = (data, isTangible) => {
    const filteredData = data.filter(entry => entry.isTangible === isTangible);
    const reducer = (total, entry) => total + Number(entry.hours) + Number(entry.minutes) / 60;
    return filteredData.reduce(reducer, 0);
  };

  const loadUserTasks = async () => {
    const userId = props?.match?.params?.userId;
    axios
      .get(ENDPOINTS.TASKS_BY_USERID(userId))
      .then(res => {
        setTasks(res?.data || []);
        setOriginalTasks(res.data);
      })
      // eslint-disable-next-line no-console
      .catch(err => console.log(err));
  };

  const getCurretLoggedinUserEmail = async () => {
    const userId = props?.auth?.user?.userid;
    try {
      const response = await axios.get(ENDPOINTS.USER_PROFILE(userId));
      const currentUserEmail = response.data.email;
      dispatch(
        setCurrentUser({
          ...props.auth.user,
          email: currentUserEmail,
          permissions: {
            ...props.auth.user.permissions,
            frontPermissions: [
              ...(props.auth.user.permissions?.frontPermissions || []),
              ...(response.data.permissions?.frontPermissions || []),
            ],
          },
        }),
      );
    } catch (err) {
      toast.error('Error while getting current logged in user email');
    }
  };

  const fetchCalculatedStartDate = async (userId, userProfileData) => {
    if (!userProfileData?.endDate) {
      const createdDate = userProfileData?.createdDate ? userProfileData.createdDate.split('T')[0] : '';
      setCalculatedStartDate(createdDate);
      return;
    }
    try {
      const startDate = await dispatch(
        getTimeStartDateEntriesByPeriod(userId, userProfileData.createdDate, userProfileData.endDate),
      );

      if (startDate !== 'N/A') {
        const formattedStartDate = startDate.split('T')[0];
        setCalculatedStartDate(formattedStartDate);
      } else {
        // No time entries yet, use createdDate as fallback
        const createdDate = userProfile?.createdDate
          ? userProfile.createdDate.split('T')[0]
          : '';
        setCalculatedStartDate(createdDate);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching calculated start date:', error);
      // Fallback to createdDate on error
      const createdDate = userProfile?.createdDate
        ? userProfile.createdDate.split('T')[0]
        : '';
      setCalculatedStartDate(createdDate);
    }
  };

  const getTimeOffStatus = personId => {
    if (!allRequests[personId]) {
      return false;
    }
    let hasTimeOff = false;
    const sortedRequests = allRequests[personId].sort((a, b) =>
      moment(a.startingDate).diff(moment(b.startingDate)),
    );

    const mostRecentRequest =
      sortedRequests.find(request => moment().isBefore(moment(request.endingDate), 'day')) ||
      sortedRequests[0];

    const startOfWeek = moment().startOf('week');
    const endOfWeek = moment().endOf('week');

    const isCurrentlyOff =
      moment(mostRecentRequest.startingDate).isBefore(endOfWeek) &&
      moment(mostRecentRequest.endingDate).isSameOrAfter(startOfWeek);

    return isCurrentlyOff;
  };

  const loadUserProfile = async () => {
    const userId = props?.match?.params?.userId;

    if (!userId) return;

    try {
      // run requests in parallel
      const [response] = await Promise.all([axios.get(ENDPOINTS.USER_PROFILE(userId))]);

      const newUserProfile = response.data;
      // Assuming newUserProfile contains isRehireable attribute
      setIsRehireable(newUserProfile.isRehireable); // Update isRehireable based on fetched data
      newUserProfile.totalIntangibleHrs = Number(newUserProfile.totalIntangibleHrs.toFixed(2));

      // sanitize data first
      newUserProfile.teams = (newUserProfile.teams || []).filter(team => team !== null);
      newUserProfile.projects = (newUserProfile.projects || []).filter(project => project !== null);
      try {
        // Prefer a typed helper like ENDPOINTS.USER_PROJECTS(userId) if you have it.
        const { data } = await axios.get(
          ENDPOINTS.USER_PROJECTS
            ? ENDPOINTS.USER_PROJECTS(userId)
            : `${ENDPOINTS.PROJECTS}/user/${userId}`
        );
        const normalized = (data || []).map((row) => {
          // common shapes: {project: {...}}, {projectId: {...}}, or already {...}
          if (row?.project?.projectName) return row.project;
          if (row?.projectId?.projectName) return row.projectId;
          return row; // fallback if API already returns the project document
        });
        setProjects(normalized);
        setOriginalProjects(normalized);
        setResetProjects(normalized);
        // keep profile copy in sync so Save/Cancel logic works
        newUserProfile.projects = normalized;
      } catch {
        // fallback to whatever came on the profile (might be empty on your env)
        const fallback = newUserProfile.projects || [];
        setProjects(fallback);
        setOriginalProjects(fallback);
        setResetProjects(fallback);
      }

      // keep userProfile in sync for Save/Cancel logic
      // membershipProjects is not defined, so this line should be removed or replaced if needed
      // newUserProfile.projects = membershipProjects || [];
      // If you need to assign something, ensure membershipProjects is defined above
      // Otherwise, remove this line
      // Removed as it causes a reference error
      // } catch (e) {
      //   // fallback to whatever the profile returned (may be empty)
      //   setProjects(newUserProfile.projects || []);
      //   setOriginalProjects(newUserProfile.projects || []);
      //   setResetProjects(newUserProfile.projects || []);
      // }

      const profileWithFormattedDates = {
        ...newUserProfile,
        jobTitle: newUserProfile.jobTitle[0],
        phoneNumber: newUserProfile.phoneNumber[0],
        startDate: newUserProfile?.startDate ? formatDateYYYYMMDD(newUserProfile?.startDate) : '',
        createdDate: formatDateYYYYMMDD(newUserProfile?.createdDate),
        ...(newUserProfile?.endDate &&
          newUserProfile.endDate !== '' && {
            endDate: formatDateYYYYMMDD(newUserProfile.endDate),
          }),
      };

      setUserProfile(profileWithFormattedDates);
      setOriginalUserProfile(profileWithFormattedDates);
      setIsRehireable(newUserProfile.isRehireable);
      setUserStartDate(profileWithFormattedDates.startDate || '');

      // Fetch calculated start date from first time entry
      await fetchCalculatedStartDate(userId, newUserProfile);

      // Note: Removed automatic getTimeStartDateEntriesByPeriod call to prevent overwriting manual startDate changes
      // Users can now toggle between manual and calculated startDate via button

      checkIsProjectsEqual();
      setShowLoading(false);
    } catch (err) {
      setShowLoading(false);
      // eslint-disable-next-line no-console
      console.log(err);
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

    setLoadingSummaries(true);
    try {
      const response = await axios.get(ENDPOINTS.LEADER_BOARD(userId));
      const leaderBoardData = response.data;
      const allSummaries = leaderBoardData.map(item => ({
        value: [item.name, item.personId],
        label: `View ${item.name}'s summary.`,
      }));
      setSummaries(allSummaries);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('Could not load leaderBoard data.', err);
    } finally {
      setLoadingSummaries(false);
    }
  };

  const onDeleteTeam = deletedTeamId => {
    setTeams(prevTeams => prevTeams.filter(team => team._id !== deletedTeamId));
  };

  const onDeleteProject = async (deletedProjectId) => {

  const removedProject = projects.find(p => (p._id || p.projectId) === deletedProjectId);

  const updatedProjects = projects.filter(p => {
    return (p._id || p.projectId) !== deletedProjectId;
  });

  setProjects(updatedProjects);

  // Prepare backend payload
  const updatedUserProfile = {
    ...userProfileRef.current,
    projects: updatedProjects.map(p => String(p._id || p.projectId)),
  };

  try {
    await handleSubmit(updatedUserProfile);  // this already toasts success
    toast.success(`User removed from Project "${removedProject?.projectName || 'Unknown'}"`);
  } catch (e) {
    toast.error('Failed to remove project, please try again.');
    console.error(e);
  }
  return updatedProjects;
};


  const onAssignTeam = assignedTeam => {
    setTeams(prevState => [...prevState, assignedTeam]);
  };

const onAssignProject = async (assignedProject) => {
  const projectId = assignedProject._id || assignedProject.projectId;

  // Avoid duplicates
  const currentProjects = Array.isArray(projects) ? projects : [];
  if (currentProjects.some(p => (p._id || p.projectId) === projectId)) {
    toast.info(`Project "${assignedProject.projectName || 'Unknown'}" already assigned to this user`);
    return;
  }

  const updatedProjects = [...currentProjects, assignedProject];
  setProjects(updatedProjects);

  const updatedUserProfile = {
    ...userProfileRef.current,
    projects: updatedProjects.map(p => String(p._id || p.projectId)),
  };

  try {
    await handleSubmit(updatedUserProfile);  // reuses same pipeline
    toast.success(`User assigned to Project "${assignedProject.projectName || 'Unknown'}"`);
  } catch (e) {
    toast.error('Failed to assign project, please try again.');
    console.error(e);
  }
  return updatedProjects;
};

const onUpdateTask = async (taskId, updatedTask, method) => {
  
  let newTasks;

  if (method === 'remove') {
    try{
    newTasks = tasks.filter(t => t._id !== taskId);
    const res = await axios.delete(ENDPOINTS.TASK_DELETE_BY_ID(taskId, userProfile._id));
    if (res.status === 200) {
      setTasks(newTasks);
      toast.success('Task removed successfully');
    } else {
      toast.error('Failed to remove task');
    }
    return newTasks;
  } catch (e) {
    toast.error('Failed to remove task, please try again.');
    console.error(e);
    return tasks;
  }
  } else {
    // UPDATE the task normally
    newTasks = tasks.map(t =>
      t._id === taskId ? updatedTask : t
    );
  }
  setTasks(newTasks);

  const updatedUserProfile = {
  ...userProfileRef.current,
  tasks: newTasks 
};

setUpdatedTasks(prev => {
  const others = prev.filter(t => t.taskId !== taskId);
  return [...others, { taskId, updatedTask }];
});

  try {
    await handleSubmit(updatedUserProfile);
    toast.success("Task updated");
  } catch (e) {
    toast.error("Failed to update task");
    console.error(e);
  }
};

  const handleImageUpload = async evt => {
    if (evt) evt.preventDefault();
    const file = evt.target.files?.[0];
    if (!file) return;
  
    const filesizeKB = file.size / 1024;
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    const allowedTypesString = `File type not permitted. Allowed types are ${allowedTypes.join(', ')}`;
  
    // type check
    if (!allowedTypes.includes(file.type)) {
      setType('image');
      setShowModal(true);
      setModalTitle('Profile Pic Error');
      setModalMessage(allowedTypesString);
      return;
    }
    // size check
    if (filesizeKB > 50) {
      setType('image');
      setShowModal(true);
      setModalTitle('Profile Pic Error');
      setModalMessage(
        'The file you are trying to upload exceeds the maximum size of 50KB. You can either choose a different file, or use an online file compressor.'
      );
      return;
    }
  
    const fileReader = new FileReader();
  
    fileReader.onloadend = async () => {
      const base64 = fileReader.result;
  
      // optimistic preview
      const prevProfile = userProfileRef.current;
      const nextProfile = { ...prevProfile, profilePic: base64 };
      setUserProfile(nextProfile);
  
      // persist immediately
      setIsSavingImage(true);
      try {
        await props.updateUserProfile(nextProfile);
        // keep originals in sync so the Save button doesn't light up unnecessarily
        setOriginalUserProfile(nextProfile);
        toast.success('Profile photo updated');
      } catch (err) {
        // revert on failure
        setUserProfile(prevProfile);
        toast.error('Failed to save profile photo. Please try again.');
      } finally {
        setIsSavingImage(false);
      }
    };
  
    fileReader.readAsDataURL(file);
  };
  

  const handleBlueSquare = (status = true, type = 'message', blueSquareID = '') => {
    if (targetIsDevAdminUneditable) {
      if (userProfile?.email === DEV_ADMIN_ACCOUNT_EMAIL_DEV_ENV_ONLY) {
        // eslint-disable-next-line no-alert
        alert(DEV_ADMIN_ACCOUNT_CUSTOM_WARNING_MESSAGE_DEV_ENV_ONLY);
      } else {
        // eslint-disable-next-line no-alert
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
          // eslint-disable-next-line no-console
          console.log('WARNING: Future Blue Square');
          // eslint-disable-next-line no-alert
          alert('WARNING: Cannot Assign Blue Square with a Future Date');
        }
        if (dateStamp === '') {
          // eslint-disable-next-line no-console
          console.log('WARNING: Empty Date');
          // eslint-disable-next-line no-alert
          alert('WARNING: Cannot Assign Blue Square with an Empty Date');
        }
      } else {
        const newBlueSquare = {
          date: dateStamp,
          description: summary,
          // createdDate: moment
          //   .tz('America/Los_Angeles')
          //   .toISOString()
          //   .split('T')[0],
          createdDate: moment().format('YYYY-MM-DD'),
        };
        setModalTitle('Blue Square');
        axios
          .post(ENDPOINTS.ADD_BLUE_SQUARE(userProfile._id), {
            blueSquare: newBlueSquare,
          })
          .then(res => {

            const updatedInfringements = [
              ...userProfile.infringements,
              {
                _id: res.data._id,
                ...newBlueSquare,
              }
            ];

            setOriginalUserProfile(prev => ({
              ...prev,
              infringements: updatedInfringements,
            }));

            setUserProfile(prev => ({
              ...prev,
              infringements: updatedInfringements,
            }));
          })
          .catch(error => {
            // eslint-disable-next-line no-console
            console.log('error in modifying bluesquare', error);
            toast.error('Failed to add Blue Square!');
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
          // eslint-disable-next-line no-console
          console.error('Error fetching special warnings:', res.error);
          return;
        }
        setSpecialWarnings(res);
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error in fetchSpecialWarnings:', err);
    }
  };

  const getWarningMessage = (warningData, noSummary, inCompleteHours) => {
    const bothWarnings = warningData?.warningsArray;
    let allBlSq = {};
    let noneBlSq = {};
    let inCompleteHoursMixedBlSq = false;
    const inCompleteHoursMessage = '"completing most of your hours but not all"';
    const noSummaryMessage = '"not submitting a weekly summary"'
    if(warningData?.issueBlueSquare) {
      allBlSq = Object.values(warningData?.issueBlueSquare).every(blueSquare => blueSquare === true);
      noneBlSq = Object.values(warningData?.issueBlueSquare).every(blueSquare => blueSquare === false);
      inCompleteHoursMixedBlSq = warningData?.issueBlueSquare['Blu Sq Rmvd - Hrs Close Enoug'] === true;
    }
    const inCompleteHoursBlSq = warningData.description === 'Blu Sq Rmvd - Hrs Close Enoug';

    let message = null;
    if(bothWarnings) {
      if(allBlSq) {
        message = `Issued a blue square for an Admin having to remove past blue squares ${inCompleteHours.warnings.length - 1} times for ${inCompleteHoursMessage} and ${noSummary.warnings.length - 1} times for ${noSummaryMessage}.`
      } else if(noneBlSq) {
        message = '';
      } else if(inCompleteHoursMixedBlSq) {
        message = `Issued a blue square for an Admin having to remove past blue squares ${inCompleteHours.warnings.length - 1} times for ${inCompleteHoursMessage} and received a warning for removing past blue squares ${noSummary.warnings.length - 1} times for ${noSummaryMessage}.`
      } else {
        message = `Issued a blue square for an Admin having to remove past blue squares ${noSummary.warnings.length - 1} times for ${noSummaryMessage} and received a warning for removing past blue squares ${inCompleteHours.warnings.length - 1} times for ${inCompleteHoursMessage}.`
      }
    } else if(inCompleteHoursBlSq) {
        message = `Issued a blue square for an Admin having to remove past blue squares ${inCompleteHours.warnings.length - 1} times for ${inCompleteHoursMessage}.`
    } else {
      message = `Issued a blue square for an Admin having to remove past blue squares ${noSummary.warnings.length - 1} times for ${noSummaryMessage}.`
    }
    return message
  }

  const handleLogWarning = async newWarningData => {
    let warningData = {};
    let warningsArray = null;
    if (newWarningData.bothTriggered) {
      warningsArray = Object.entries(newWarningData)
        .filter(([key]) => key !== 'issueBlueSquare' && key !== 'bothTriggered')
        .map(([title, color]) => ({
          userId: props?.match?.params?.userId,
          iconId: uuidv4(),
          color: color.color,
          date: moment().format('MM/DD/YYYY'), // Use a dynamic timestamp or pass it explicitly
          description: title, // Use the title as the description
        }));
    } else {
      warningData = {
        description: newWarningData.title,
        color: newWarningData.colorAssigned,
        iconId: uuidv4(),
        date: moment().format('MM/DD/YYYY'),
      };
    }

    warningData = {
      ...warningData,
      warningsArray,
      issueBlueSquare: newWarningData.issueBlueSquare,
      userId: props?.match?.params?.userId,
      monitorData: {
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email,
        userId: props.auth.user.userid,
      },
    };
    let toastMessage = '';
    dispatch(postWarningByUserId(warningData))
      .then(response => {
        if (response.error) {
          toast.error('Warning failed to log try again');
          return;
        } else {
          const noSummary = response.find(warning => warning.title === 'Blu Sq Rmvd - For No Summary')
          const inCompleteHours = response.find(warning => warning.title === 'Blu Sq Rmvd - Hrs Close Enoug')
          setShowModal(false);
          fetchSpecialWarnings();

          if (warningData.color === 'blue') {
            toastMessage = 'Successfully logged and tracked';
          } else if (warningData.color === 'yellow') {
            toastMessage = 'Warning successfully logged';
          } else {
            const blSqMessage = getWarningMessage(warningData, noSummary, inCompleteHours)
            if(blSqMessage) {
              modifyBlueSquares('', 
                moment(warningData.date).format("YYYY-MM-DD"),
                blSqMessage, 
                'add')
                toastMessage = 'Successfully logged and Blue Square issued';
            } else {
              toastMessage = 'Warning successfully logged';
            }
          }
        }
        toast.success(toastMessage);
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.error('Error updating user profile:', err);
      });
  };

  const handleSubmit = async (updatedUserProfile) => {
  // 1) Merge with the current ref FIRST
  const merged = { ...(userProfileRef.current || {}), ...(updatedUserProfile || {}) };

  // 2) Normalize projects from the merged payload (NOT from a separate variable)
  const projectsIds = (merged.projects || [])
    .map(p => String(p?._id ?? p?.projectId ?? p))  // supports objects or plain ids
    .filter(Boolean);

  const userProfileToUpdate = {
    ...merged,
    projects: projectsIds,  // single source of truth
  };


  // update tasks (optionally await if you need sequencing)
  for (let i = 0; i < updatedTasks.length; i += 1) {
    const updatedTask = updatedTasks[i];
    const url = ENDPOINTS.TASK_UPDATE(updatedTask.taskId);
    // consider await here if order matters
    // eslint-disable-next-line no-console
    axios.put(url, updatedTask.updatedTask).catch(err => console.error(err));
  }

  try {
    const result = await props.updateUserProfile(userProfileToUpdate);
    if (userProfile._id === props.auth.user.userid && props.auth.user.role !== userProfile.role) {
      await props.refreshToken(userProfile._id);
    }
    await loadUserProfile();
    await loadUserTasks();
    setSaved(false);
  } catch (err) {
    if (err?.response?.data?.error) {
      // eslint-disable-next-line no-alert
      alert(err.response.data.error.join('\n'));
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
      // eslint-disable-next-line no-alert
      alert('An error occurred while reload user profile after badge udpate.');
    }
  };

  const toggle = modalName => setMenuModalTabletScreen(modalName);

  useEffect(() => {
    userProfileRef.current = userProfile;
  });

  useEffect(() => {
    const helper = async () => {
      try {
        await updateProjectTouserProfile();
      } catch (error) {}
    };
    helper();
  }, [projects]);

  useEffect(() => {
    setShowLoading(true);
    loadUserProfile();
    loadUserTasks();
  }, [props?.match?.params?.userId]);

  useEffect(() => {
    if (userProfile?.firstName || userProfile?.lastName) {
      document.title = `${userProfile.firstName ?? ''} ${userProfile.lastName ?? ''}`.trim();
    } else {
      document.title = 'User';
    }
  }, [userProfile]);

  useEffect(() => {
    if (!shouldRefresh) return;
    setShouldRefresh(false);
    loadUserProfile();
  }, [shouldRefresh]);

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
    setUserProfile(prevState => {
      const updatedProfile = prevState;
      updatedProfile.adminLinks = adminLinksUpdate || updatedProfile.adminLinks;
      updatedProfile.mediaUrl =
        mediaUrlUpdate !== undefined ? mediaUrlUpdate : updatedProfile.mediaUrl;
      updatedProfile.personalLinks = personalLinksUpdate || updatedProfile.personalLinks;
      return updatedProfile;
    });
  };


  const activeInactivePopupClose = () => {
    setActiveInactivePopupOpen(false);
  };
  const handleReportClick = (event, to) => {
    if (event.metaKey || event.ctrlKey || event.button === 1) {
      return;
    }

    event.preventDefault(); // prevent full reload
    history.push(`/peoplereport/${to}`);
  };

  const handleRehireableChange = () => {
    const newRehireableStatus = !isRehireable;
    setPendingRehireableStatus(newRehireableStatus);
    setShowConfirmDialog(true);
  };

  const handleConfirmChange = async () => {
    setShowConfirmDialog(false);
    const updatedUserProfile = {
      ...userProfile,
      isRehireable: pendingRehireableStatus,
    };
    try {
      await dispatch(updateRehireableStatus(updatedUserProfile, pendingRehireableStatus));
      setIsRehireable(pendingRehireableStatus);
      setUserProfile(updatedUserProfile);
      setOriginalUserProfile(updatedUserProfile);
    } catch (error) {
      toast.error('Unable change rehireable status');
    }
  };

  const handleCancelChange = () => {
    setShowConfirmDialog(false);
  };

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
    setShowToggleVisibilityModal(true);
  };

  const handleVisibilityChange = () => {
    setShowToggleVisibilityModal(false);
    const visibility = !userProfile.isVisible;
    const newUserProfile = {
      ...userProfile,
      isVisible: visibility,
    };
    toggleVisibility(newUserProfile, visibility);
    setUserProfile(newUserProfile);
    setOriginalUserProfile(newUserProfile);
  };

  const handleCloseConfirmVisibilityModal = () => {
    setShowToggleVisibilityModal(false);
  };

  if ((showLoading && !props.isAddNewUser) || userProfile === undefined) {
    return ( 
      <Container fluid className={darkMode ? 'bg-oxford-blue' : ''}>
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
  const canManageHGNAccessSetup = props.hasPermission('manageHGNAccessSetup');
  const canEditVisibility = props.hasPermission('toggleInvisibility');
  const canSeeReports = props.hasPermission('getReports');
  const { role: userRole } = userProfile;
  const canResetPassword =
    props.hasPermission('updatePassword')&& !(userProfile.role === 'Administrator' || userProfile.role === 'Owner');
  const targetIsDevAdminUneditable = cantUpdateDevAdminDetails(userProfile.email, authEmail);
  const canEditUserProfile = targetIsDevAdminUneditable
    ? false
    : userProfile.role === 'Owner' || userProfile.role === 'Administrator'
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
    // Update userProfile.startDate and set manual modification flag
    setUserProfile(prev => ({
      ...prev,
      startDate: startDate,
      isStartDateManuallyModified: true
    }));
  };

  const handleEndDate = async endDate => {
    setUserEndDate(endDate);
  };

  const hasScheduledFinalDay = userProfile.isActive && userProfile.inactiveReason === InactiveReason.ScheduledSeparation && !!userProfile.endDate;

  return (
    <div className={darkMode ? 'bg-oxford-blue' : ''} style={{ minHeight: '100%' }}>
      <ActiveInactiveConfirmationPopup
        open={activeInactivePopupOpen}
        onClose={activeInactivePopupClose}
        fullName={`${userProfile.firstName} ${userProfile.lastName}`}
        isActive={userProfile.isActive}
        endDate={userProfile.endDate}
        inactiveReason={userProfile.inactiveReason}
        onDeactivateImmediate={() => deactivateImmediatelyAction(dispatch, userProfile, loadUserProfile)}
        onScheduleFinalDay={() => {
          setFinalDayPopupOpen(true);
          setActiveInactivePopupOpen(false);
        }}
        onCancelScheduledDeactivation={() => activateUserAction(dispatch, userProfile, loadUserProfile)}
        onReactivateUser={() => activateUserAction(dispatch, userProfile, loadUserProfile)}
      />

      <SetUpFinalDayPopUp
        open={finalDayPopupOpen}
        darkMode={darkMode}
        onClose={() => setFinalDayPopupOpen(false)}
        onSave={(finalDayISO) => {
          scheduleDeactivationAction(dispatch, userProfile, finalDayISO, loadUserProfile);
          setFinalDayPopupOpen(false);
        }}
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
      <Modal isOpen={showToggleVisibilityModal} toggle={handleCloseConfirmVisibilityModal}>
        <ModalHeader toggle={handleCloseConfirmVisibilityModal}>
          Confirm Visibility Change
        </ModalHeader>
        <ModalBody>
          {`Are you sure you want to change the user visibility to ${
            userProfile.isVisible ? 'Invisible' : 'Visible'
          }?`}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleVisibilityChange}>
            Confirm
          </Button>{' '}
          <Button color="secondary" onClick={handleCloseConfirmVisibilityModal}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
      <TabToolTips />
      <BasicToolTips />

      <AccessManagementModal
        isOpen={showAccessManagementModal}
        onClose={() => setShowAccessManagementModal(false)}
        userProfile={userProfile}
        darkMode={darkMode}
      />

      <Container
        className={`py-5 ${darkMode ? 'bg-yinmn-blue text-light border-0' : ''}`}
        id="containerProfile"
      >
        {/* <div className='containerProfile' > */}

        <div className="left-top">
        <div className="profile-img" style={{ position: 'relative' }}>
            <Image
              src={profilePic && profilePic.trim().length > 0 ? profilePic : '/pfp-default.png'}
              alt="Profile Picture"
              roundedCircle
              className="profilePicture bg-white"
              style={profilePic ? {} : { width: '240px', height: '240px' }}
            />

            {canEdit ? (
              <div
                className="image-button file btn btn-lg btn-primary"
                style={darkMode ? boxStyleDark : boxStyle}
              >
                {isSavingImage ? 'Saving…' : 'Change Photo'}
                <Input
                  style={{ width: '100%', height: '100%', zIndex: '2', cursor: 'pointer' }}
                  type="file"
                  name="newProfilePic"
                  id="newProfilePic"
                  onChange={handleImageUpload}
                  accept="image/png,image/jpeg, image/jpg"
                  disabled={isSavingImage}
                />
              </div>
            ) : null}

            {isSavingImage && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0,0,0,0.25)',
                  borderRadius: '50%',
                }}
              >
                <i className="fa fa-spinner fa-spin" style={{ fontSize: 24, color: 'white' }} />
              </div>
            )}
          </div>

          <div
            style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}
          >
            {userProfile?.profilePic !== undefined ? (
              <Button color="danger" onClick={toggleRemoveModal} className="remove-button">
                Remove Image
              </Button>
            ) : (
              <></>
            )}
            {/*
              {((userProfile?.profilePic==undefined ||
                userProfile?.profilePic==null ||
                userProfile?.profilePic=="")&&
                (userProfile?.suggestedProfilePics!==undefined &&
                  userProfile?.suggestedProfilePics!==null &&
                  userProfile?.suggestedProfilePics.length!==0
                ))?
                <Button color="primary" onClick={toggleModal}>Suggested Profile Image</Button>
                :null} */}
          </div>

          {/* {userProfile!==undefined && userProfile.suggestedProfilePics!==undefined?<ProfileImageModal isOpen={isModalOpen} toggleModal={toggleModal} userProfile={userProfile}/>:<></>} */}
          <ConfirmRemoveModal
            isOpen={isRemoveModalOpen}
            toggleModal={toggleRemoveModal}
            confirmRemove={confirmRemoveImage}
          />

          <QuickSetupModal
            setSaved={setSaved}
            handleSubmit={handleSubmit}
            setUserProfile={setUserProfile}
            userProfile={userProfile}
            userTeams={teams || []}
            teamsData={props?.allTeams?.allTeamsData || []}
            projectsData={props?.allProjects?.projects || []}
            titleOnSet={titleOnSet}
            setTitleOnSet={setTitleOnSet}
            updateUserProfile={props.updateUserProfile}
            fetchTeamCodeAllUsers = {fetchTeamCodeAllUsers}
          />
        </div>

        <div className="right-column">
          {!codeValid ? (
            <Alert color="danger">
              NOT SAVED! The code must be between 5 and 7 characters long
            </Alert>
          ) : null}
          <div className="profile-head">
            <h5 className={`mr-2 ${darkMode ? 'text-light' : ''}`}>{`${firstName} ${lastName}`}</h5>
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
                deactivatedAt={userProfile.deactivatedAt}
                user={userProfile}
                endDate={userProfile.endDate}
                reactivationDate={userProfile.reactivationDate}
                canChange={canChangeUserStatus}
                onClick={() => {
                  if (cantDeactivateOwner(userProfile, requestorRole)) {
                    // Owner user cannot be deactivated by another user that is not an Owner.
                    // eslint-disable-next-line no-alert
                    alert('You are not authorized to deactivate an owner.');
                    return;
                  }
                  setActiveInactivePopupOpen(true);
                }}
              />
            </span>
            {canEdit && (
              <span className="mr-2">
              <Link
                to={`/timelog/${targetUserId}#currentWeek`}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
                    return; // Let browser handle it — new tab, etc.
                  }
            
                  e.preventDefault(); // SPA navigation
                  props.history.push(`/timelog/${targetUserId}#currentWeek`);
                  setActiveInactivePopupOpen(true);
                }}
                style={{ textDecoration: 'none' }}
                title="Click to see user's timelog"
              >
                <i
                  data-toggle="tooltip"
                  className="fa fa-clock-o"
                  aria-hidden="true"
                  style={{ fontSize: 24, cursor: 'pointer', marginTop: '6px', color: 'black' }}
                />
              </Link>
            </span>
            )}
            {canSeeReports && (
              <span className="mr-2">
                <Link
                  className={teamStyles["team-member-tasks-user-report-link"]}
                  to={`/peoplereport/${userProfile._id}`}
                  onClick={event => handleReportClick(event, userProfile._id)}
                >
                  <img
                    src="/report_icon.png"
                    alt="reportsicon"
                    className={teamStyles["team-member-tasks-user-report-link-image"]}
                  />
                </Link>
              </span>
            )}
            {(canManageHGNAccessSetup) && (
              <span className="mr-2">
                <Button
                  color="link"
                  style={{ padding: '0', border: 'none', background: 'none' }}
                  size="sm"
                  onClick={() => setShowAccessManagementModal(true)}
                  title={
                    'Click to add user access to GitHub, Dropbox, Slack, and Sentry.'
                  }
                >
                  <img
                    src='/HGN_Add_Access.png'
                    alt='Add Access'
                    style={{ width: '20px', height: '20px' }}
                  />
                </Button>
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
                // Only fetch summaries data when the user is showing them and they haven't been loaded yet
                // additional optimization, we can just not load all summaries at once and load only slected team member summary within TeamWeeklySummaries component
                if (!showSelect && summaries === undefined) {
                  getTeamMembersWeeklySummary();
                }
              }}
              color="primary"
              size="sm"
              style={darkMode ? boxStyleDark : boxStyle}
            >
              {showSelect ? 'Hide Team Weekly Summaries' : 'Show Team Weekly Summaries'}
            </Button>
            {((canGetProjectMembers && teams.length !== 0) ||
              ['Owner', 'Administrator', 'Manager'].includes(requestorRole)) && (
              <Button
                onClick={async () => {
                  const teamId = userProfile?.teams?.[0]?._id || null;
                  const intro = await buildSummaryIntroDetails(teamId, userProfile);
                  if (!intro) {
                    toast.error('Unable to generate summary intro right now.');
                    return;
                  }
                  setSummaryIntro(intro);
                  await navigator.clipboard.writeText(intro);
                  toast.success('Summary Intro Copied!');
                }}
                color="primary"
                size="sm"
                title="Generates the summary intro for your team and copies it to your clipboard for easy use."
                style={darkMode ? boxStyleDark : boxStyle}
              >
                Generate Summary Intro
              </Button>
            )}
          </div>
          <h6 className={darkMode ? 'text-light' : 'text-azure'}>{jobTitle}</h6>
          <p className={`proile-rating ${darkMode ? 'text-light' : ''}`} style={{ textAlign: 'left' }}>
            {/* use converted date without tz otherwise the record's will updated with timezoned ts for start date.  */}
            From:{' '}
            <span className={darkMode ? 'text-light' : ''}>
              {formatDateCompany(userProfile.startDate)}
            </span>
            {'   '}
            To:{' '}
            <span className={darkMode ? 'text-light' : ''}>
              {userProfile.endDate ? formatDateCompany(userProfile.endDate) : 'N/A'}
            </span>
          </p>
          {showSelect ? (
            <div>
              <Select
                className={darkMode ? 'bg-darkmode-liblack text-azure' : ''}
                options={summaries}
                styles={customStyles}
                isLoading={loadingSummaries}
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

          <div className="profile-functions-desktop">
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
                  hasFinalDay={hasScheduledFinalDay}
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
                  calculatedStartDate={calculatedStartDate}
                  darkMode={darkMode}
                />
              </TabPane>
              <TabPane tabId="3">
                <TeamsTabTips />
                <TeamsTab
                  userTeams={teams || []}
                  teamsData={props?.allTeams?.allTeamsData || []}
                  onAssignTeam={onAssignTeam}
                  onDeleteTeam={onDeleteTeam}
                  edit={canEdit && !targetIsDevAdminUneditable}
                  role={requestorRole}
                  onUserVisibilitySwitch={onUserVisibilitySwitch}
                  isVisible={userProfile.isVisible}
                  canEditVisibility={canEditVisibility}
                  handleSubmit={handleSubmit}
                  disabled={!formValid.firstName || !formValid.lastName || !formValid.email || !codeValid}
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
                  darkMode={darkMode}
                />
              </TabPane>
              <TabPane tabId="4">
                {
                  activeTab === '4' && (
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
                      // disabled={
                      //   !formValid.firstName ||
                      //   !formValid.lastName ||
                      //   !formValid.email ||
                      //   !(isProfileEqual && isTasksEqual && isProjectsEqual)
                      // }
                      disabled={false}
                      darkMode={darkMode}
                    />
                  )
                }

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
              {canResetPassword && !isUserSelf &&  (
                <ResetPasswordButton
                  className="mr-1 btn-bottom"
                  user={userProfile}
                  authEmail={authEmail}
                  canUpdatePassword={canResetPassword}
                />
              )}
              {isUserSelf && (activeTab === '1' || canPutUserProfile) && (
                <Link
                  to={targetIsDevAdminUneditable ? `#` : `/updatepassword/${userProfile._id}`}
                  onClick={() => {
                    if (targetIsDevAdminUneditable) {
                      // eslint-disable-next-line no-alert
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
              {((canEdit && activeTab) || canEditTeamCode) && activeTab !== '4' && (
                <>
                  <SaveButton
                    className="mr-1 btn-bottom"
                    handleSubmit={async () => await handleSubmit()}
                    disabled={
                      !formValid.firstName ||
                      !formValid.lastName ||
                      !formValid.email ||
                      !codeValid ||
                      (userStartDate > userEndDate && userEndDate !== '') ||
                      (isProfileEqual && isTasksEqual && isProjectsEqual)
                    }
                    userProfile={userProfile}
                    setSaved={() => setSaved(true)}
                    darkMode={darkMode}
                  />
                  {activeTab !== '3' && (
                    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
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
                      Cancel
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="profile-functions-tablet">
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
                          canUpdatePassword
                        />
                      )}
                      {isUserSelf && (activeTab == '1' || canPutUserProfile) && (
                        <Link
                          to={
                            targetIsDevAdminUneditable ? `#` : `/updatepassword/${userProfile._id}`
                          }
                          onClick={() => {
                            if (targetIsDevAdminUneditable) {
                              // eslint-disable-next-line no-alert
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
                              // titleOnSet ||
                              (isProfileEqual && isTasksEqual && isProjectsEqual)
                            }
                            userProfile={userProfile}
                            setSaved={() => setSaved(true)}
                            darkMode={darkMode}
                          />
                          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
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
                    calculatedStartDate={calculatedStartDate}
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
                              // titleOnSet ||
                              (isProfileEqual && isTasksEqual && isProjectsEqual)
                            }
                            userProfile={userProfile}
                            setSaved={() => setSaved(true)}
                            darkMode={darkMode}
                          />
                          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
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
                  <TeamsTabTips />
                  <TeamsTab
                    userTeams={userProfile?.teams || []}
                    teamsData={props?.allTeams?.allTeamsData || []}
                    onAssignTeam={onAssignTeam}
                    onDeleteTeam={onDeleteTeam}
                    edit={canEdit}
                    role={requestorRole}
                    onUserVisibilitySwitch={onUserVisibilitySwitch}
                    isVisible={userProfile.isVisible}
                    canEditVisibility={canEditVisibility}
                    handleSubmit={handleSubmit}
                    disabled={
                      !formValid.firstName ||
                      !formValid.lastName ||
                      !formValid.email ||
                      !(isProfileEqual && isTasksEqual && isProjectsEqual)
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
                              // titleOnSet ||
                              (isProfileEqual && isTasksEqual && isProjectsEqual)
                            }
                            userProfile={userProfile}
                            setSaved={() => setSaved(true)}
                            darkMode={darkMode}
                          />
                          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
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
                    // disabled={
                    //   !formValid.firstName ||
                    //   !formValid.lastName ||
                    //   !formValid.email ||
                    //   !(isProfileEqual && isTasksEqual && isProjectsEqual)
                    // }
                    disabled={false}
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
                              // titleOnSet ||
                              (isProfileEqual && isTasksEqual && isProjectsEqual)
                            }
                            userProfile={userProfile}
                            setSaved={() => setSaved(true)}
                            darkMode={darkMode}
                          />
                          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
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
                              // titleOnSet ||
                              (isProfileEqual && isTasksEqual && isProjectsEqual)
                            }
                            userProfile={userProfile}
                            setSaved={() => setSaved(true)}
                            darkMode={darkMode}
                          />
                          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
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
          </div>
        </div>

        <div className="left-bottom">
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
        </div>
        <div className="left-dummy" />

        {/* </div> */}
      </Container>
    </div>
  );
}

 const mapStateToProps = state => ({
   allProjects: state.allProjects || state.projects || {},   // <- gives you .projects array
   allTeams: state.allTeams || {},
   auth: state.auth,
   role: state.role || {},
 });

export default connect(
  mapStateToProps,
  { hasPermission, updateUserProfile, getTimeEntriesForWeek }
)(UserProfile);

