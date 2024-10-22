import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  CardTitle,
  CardSubtitle,
  CardHeader,
  CardBody,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import './Timelog.css';
import classnames from 'classnames';
import { connect, useSelector } from 'react-redux';
import moment from 'moment';
import ReactTooltip from 'react-tooltip';
import ActiveCell from 'components/UserManagement/ActiveCell';
import { ProfileNavDot } from 'components/UserManagement/ProfileNavDot';
import TeamMemberTasks from 'components/TeamMemberTasks';
import { getTimeEntriesForWeek, getTimeEntriesForPeriod } from '../../actions/timeEntries';
import { getUserProfile, updateUserProfile, getUserTasks } from '../../actions/userProfile';
import { getUserProjects } from '../../actions/userProjects';
import { getAllRoles } from '../../actions/role';
import { getBadgeCount, resetBadgeCount } from '../../actions/badgeManagement';
import TimeEntryForm from './TimeEntryForm';
import TimeEntry from './TimeEntry';
import EffortBar from './EffortBar';
import SummaryBar from '../SummaryBar/SummaryBar';
import WeeklySummary from '../WeeklySummary/WeeklySummary';
import LoadingSkeleton from '../common/SkeletonLoading';
import hasPermission from '../../utils/permissions';
import WeeklySummaries from './WeeklySummaries';
import { boxStyle, boxStyleDark } from 'styles';
import { formatDate } from 'utils/formatDate';
import EditableInfoModal from 'components/UserProfile/EditableModal/EditableInfoModal';
import { cantUpdateDevAdminDetails } from 'utils/permissions';
import axios from 'axios';
import {
  DEV_ADMIN_ACCOUNT_EMAIL_DEV_ENV_ONLY,
  DEV_ADMIN_ACCOUNT_CUSTOM_WARNING_MESSAGE_DEV_ENV_ONLY,
  PROTECTED_ACCOUNT_MODIFICATION_WARNING_MESSAGE,
} from 'utils/constants';
import PropTypes from 'prop-types';
import Badge from '../Badge';
import { ENDPOINTS } from '../../utils/URL';

const doesUserHaveTaskWithWBS = userHaveTask => {
  return userHaveTask.reduce((acc, item) => {
    const hasIncompleteTask = item.resources.some(val => val.completedTask === false);
    if (hasIncompleteTask) acc.push(item);
    return acc;
  }, []);
};

// startOfWeek returns the date of the start of the week based on offset. Offset is the number of weeks before.
// For example, if offset is 0, returns the start of this week. If offset is 1, returns the start of last week.
const startOfWeek = offset => {
  return moment()
    .tz('America/Los_Angeles')
    .startOf('week')
    .subtract(offset, 'weeks')
    .format('YYYY-MM-DD');
};

// endOfWeek returns the date of the end of the week based on offset. Offset is the number of weeks before.
// For example, if offset is 0, returns the end of this week. If offset is 1, returns the end of last week.
const endOfWeek = offset => {
  return moment()
    .tz('America/Los_Angeles')
    .endOf('week')
    .subtract(offset, 'weeks')
    .format('YYYY-MM-DD');
};

const Timelog = props => {
  const darkMode = useSelector(state => state.theme.darkMode)
  const location = useLocation();

  // Main Function component
  const canPutUserProfileImportantInfo = props.hasPermission('putUserProfileImportantInfo');

  // access the store states
  const {
    authUser,
    displayUserProfile,
    timeEntries,
    roles,
    displayUserProjects,
    disPlayUserTasks,
    userId
  } = props;

  const initialState = {
    timeEntryFormModal: false,
    summary: false,
    activeTab: 0,
    projectsSelected: ['all'],
    fromDate: startOfWeek(0),
    toDate: endOfWeek(0),
    infoModal: false,
    information: '',
    currentWeekEffort: 0,
    isTimeEntriesLoading: true,
    badgeCount: 0,
  };

  const intangibletimeEntryFormData = {
    isTangible: false,
    personId: displayUserProfile._id,
  };

  const [initialTab, setInitialTab] = useState(null);
  const [projectOrTaskOptions, setProjectOrTaskOptions] = useState(null);
  const [currentWeekEntries, setCurrentWeekEntries] = useState(null);
  const [lastWeekEntries, setLastWeekEntries] = useState(null);
  const [beforeLastEntries, setBeforeLastEntries] = useState(null);
  const [periodEntries, setPeriodEntries] = useState(null);
  const [summaryBarData, setSummaryBarData] = useState(null);
  const [timeLogState, setTimeLogState] = useState(initialState);
  const isNotAllowedToEdit = cantUpdateDevAdminDetails(displayUserProfile.email, authUser.email);

  const { userId: urlId } = useParams();
  const [userprofileId, setUserProfileId] = useState(urlId || authUser.userid);

  const checkSessionStorage = () => JSON.parse(sessionStorage.getItem('viewingUser')) ?? false;
  const [viewingUser, setViewingUser] = useState(checkSessionStorage());
  const getUserId = () => {
    try {
      if (viewingUser) {
        return viewingUser.userId;
      }
      else if (userId != null) {
        return userId;
      }
      return authUser.userid;
    } catch (error) {
      return null;
    }
  }

  const [displayUserId, setDisplayUserId] = useState(
    getUserId()
  );
  const isAuthUser = authUser.userid === displayUserId;
  const fullName = `${displayUserProfile.firstName} ${displayUserProfile.lastName}`;

  useEffect(() => {
    document.title = `Timelog - ${displayUserProfile.firstName}`;
  }, [displayUserProfile.firstName]);

  const defaultTab = (data) => {
    const userHaveTask = doesUserHaveTaskWithWBS(data);
    //change default to time log tab(1) in the following cases:
    const role = authUser.role;
    let tab = 0;
    /* To set the Task tab as defatult this.userTask is being watched.
    Accounts with no tasks assigned to it return an empty array.
    Accounts assigned with tasks with no wbs return and empty array.
    Accounts assigned with tasks with wbs return an array with that wbs data.
    The problem: even after unassigning tasks the array keeps the wbs data.
    That breaks this feature. Necessary to check if this array should keep data or be reset when unassinging tasks.*/

    //if user role is volunteer or core team and they don't have tasks assigned, then default tab is timelog.
    role === 'Volunteer' && userHaveTask.length > 0
      ? (tab = 0)
      : role === 'Volunteer' && userHaveTask.length === 0
      ? (tab = 1)
      : null;
    // Sets active tab to "Current Week Timelog" when the Progress bar in Leaderboard is clicked
    if (!props.isDashboard) {
      tab = 1;
    }

    if (location.hash) {
      const redirectToTab = tabMapping[location.hash];
      if (redirectToTab !== undefined) {
        tab = redirectToTab;
      }
    }
    return tab;
  };

    const tabMapping = {
      '#tasks': 0,
      '#currentWeek': 1,
      '#lastWeek': 2,
      '#beforeLastWeek': 3,
      '#dateRange': 4,
      '#weeklySummaries': 5,
      '#badgesearned': 6,
    };

  useEffect(() => {
    const tab = tabMapping[location.hash];
    if (tab !== undefined) {
      changeTab(tab);
    }
  }, [location.hash]);  // This effect will run whenever the hash changes

  /*---------------- methods -------------- */
  const updateTimeEntryItems = () => {
    const allTimeEntryItems = generateAllTimeEntryItems();
    setCurrentWeekEntries(allTimeEntryItems[0]);
    setLastWeekEntries(allTimeEntryItems[1]);
    setBeforeLastEntries(allTimeEntryItems[2]);
    setPeriodEntries(allTimeEntryItems[3]);
  };

  const generateAllTimeEntryItems = () => {
    const currentWeekEntries = generateTimeEntries(timeEntries.weeks[0], 0);
    const lastWeekEntries = generateTimeEntries(timeEntries.weeks[1], 1);
    const beforeLastEntries = generateTimeEntries(timeEntries.weeks[2], 2);
    const periodEntries = generateTimeEntries(timeEntries.period, 3);
    return [currentWeekEntries, lastWeekEntries, beforeLastEntries, periodEntries];
  };

  const generateTimeEntries = (data, tab) => {
    if (!timeLogState.projectsSelected.includes('all')) {
      data = data.filter(
        entry =>
          timeLogState.projectsSelected.includes(entry.projectId) ||
          timeLogState.projectsSelected.includes(entry.taskId),
      );
    }
    return data.map(entry => (
      /**
       * Need to pass the projects and tasks of the display user here by props drilling,
       * because if access in TimeEntry component, if only any of two states (userProjects and userTasks)
       * changed, it will trigger a rerender of TimeEntry, then userProject and userTasks wouldn't
       * be for the same display user. But here loadAsyncData will make sure TimeLog will rerender only
       * when all states in store are updated to the same display user.
       *  */
      <TimeEntry
        from="WeeklyTab"
        data={entry}
        displayYear
        key={entry._id}
        timeEntryUserProfile={displayUserProfile}
        displayUserProjects={displayUserProjects}
        displayUserTasks={disPlayUserTasks}
        tab={tab}
      />
    ));
  };

  const loadAsyncData = async userId => {
    //load the timelog data
    setTimeLogState({ ...timeLogState, isTimeEntriesLoading: true });
    try {
      await Promise.all([
        props.getUserProfile(userId),
        props.getTimeEntriesForWeek(userId, 0),
        props.getTimeEntriesForWeek(userId, 1),
        props.getTimeEntriesForWeek(userId, 2),
        props.getTimeEntriesForPeriod(userId, timeLogState.fromDate, timeLogState.toDate),
        props.getAllRoles(),
        props.getUserProjects(userId),
        props.getUserTasks(userId),
      ]);

      const url = ENDPOINTS.TASKS_BY_USERID(userId);
      const res = await axios.get(url);

      const data = res.data.length > 0 ? res.data : [];
      const defaultTabValue = defaultTab(data);
      setTimeLogState({ ...timeLogState, isTimeEntriesLoading: false });
      setInitialTab(defaultTabValue);
    } catch (e) {
      console.log(e);
    }
  };

  const toggle = () => {
    if (isNotAllowedToEdit) {
      if (displayUserProfile?.email === DEV_ADMIN_ACCOUNT_EMAIL_DEV_ENV_ONLY) {
        alert(DEV_ADMIN_ACCOUNT_CUSTOM_WARNING_MESSAGE_DEV_ENV_ONLY);
      } else {
        alert(PROTECTED_ACCOUNT_MODIFICATION_WARNING_MESSAGE);
      }
      return;
    }
    setTimeLogState({ ...timeLogState, timeEntryFormModal: !timeLogState.timeEntryFormModal });
  };

  const showSummary = isAuthUser => {
    if (isAuthUser) {
      setTimeLogState({ ...timeLogState, summary: true });
      setTimeout(() => {
        const elem = document.getElementById('weeklySum');
        if (elem) {
          const yOffset = elem.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({ top: yOffset, behavior: 'smooth' });
        }
      }, 150);
    }
  };

  const toggleSummary = summaryState => {
    setTimeLogState({ ...timeLogState, summary: summaryState });
  };

  const openInfo = () => {
    const str = `This is the One Community time log! It is used to show a record of all the time you have volunteered with One Community, what you’ve done for each work session, etc.
    * “Add Time Entry” Button: Clicking this button will only allow you to add “Intangible” time. This is for time not related to your tasks OR for time you need a manager to change to “Tangible” for you because you were working away from your computer or made a mistake and are trying to manually log time. Intangible time will not be counted towards your committed time for the week or your tasks. “Intangible” time changed by a manager to “Tangible” time WILL be counted towards your committed time for the week and whatever task it is logged towards. For Blue Square purposes, changing Intangible Time to Tangible Time for any reason other than work away from your computer will count and be recorded in the system the same as a time edit.
    * Viewing Past Work: The current week is always shown by default but past weeks can also be viewed by clicking the tabs or selecting a date range.
    * Sorting by Project and Task: All projects and tasks are shown by default but you can also choose to sort your time log by Project or Task.
    * Notes: The “Notes” section is where you write a summary of what you did during the time you are about to log. You must write a minimum of 10 words because we want you to be specific. You must include a link to your work so others can easily confirm and review it.
    * Tangible Time: By default, the “Tangible” box is clicked. Tangible time is any time spent working on your Projects/Tasks and counts towards your committed time for the week and also the time allocated for your task.
    * Intangible Time: Clicking the Tangible box OFF will mean you are logging “Intangible Time.” This is for time not related to your tasks OR for time you need a manager to change to “Tangible” for you because you were working away from your computer or made a mistake and are trying to manually log time. Intangible time will not be counted towards your committed time for the week or your tasks. “Intangible” time changed by a manager to “Tangible” time WILL be counted towards your committed time for the week and whatever task it is logged towards. For Blue Square purposes, changing Intangible Time to Tangible Time for any reason other than work away from your computer will count and be recorded in the system the same as a time edit. `;

    setTimeLogState({
      ...timeLogState,
      infoModal: !timeLogState.infoModal,
      information: str.split('\n').map((item, i) => <p key={i}>{item}</p>),
    });
  };

  const changeTab = tab => {
    if (tab === 6) {
      props.resetBadgeCount(displayUserId);
    }

    // Clear the hash to trigger the useEffect on hash change
    if (location.hash) {
      window.location.hash='';
    }

    setTimeLogState({
      ...timeLogState,
      activeTab: tab,
    });
  };

  const handleInputChange = e => {
    setTimeLogState({ ...timeLogState, [e.target.name]: e.target.value });
  };

  const handleSearch = e => {
    //check if the toDate is before the fromDate
    if (moment(timeLogState.fromDate).isAfter(moment(timeLogState.toDate))) {
      alert('Invalid Date Range: the From Date must be before the To Date');
    }else{
      e.preventDefault();
      props.getTimeEntriesForPeriod(displayUserId, timeLogState.fromDate, timeLogState.toDate);
    }
  };

  const calculateTotalTime = (data, isTangible) => {
    const filteredData = data.filter(entry => entry.isTangible === isTangible);
    const reducer = (total, entry) => total + parseInt(entry.hours) + parseInt(entry.minutes) / 60;
    return filteredData.reduce(reducer, 0);
  };

  const renderViewingTimeEntriesFrom = () => {
    if (timeLogState.activeTab === 0 || timeLogState.activeTab === 5 || timeLogState.activeTab === 6) {
      return <></>;
    } else if (timeLogState.activeTab === 4) {
      return (
        <p className={`ml-1 responsive-font-size ${darkMode ? "text-light" : ""}`}>
          Viewing time Entries from <b>{formatDate(timeLogState.fromDate)}</b> to{' '}
          <b>{formatDate(timeLogState.toDate)}</b>
        </p>
      );
    } else {
      return (
        <p className={`ml-1 responsive-font-size ${darkMode ? "text-light" : ""}`}>
          Viewing time Entries from <b>{formatDate(startOfWeek(timeLogState.activeTab - 1))}</b> to{' '}
          <b>{formatDate(endOfWeek(timeLogState.activeTab - 1))}</b>
        </p>
      );
    }
  };

  const makeBarData = userId => {
    //pass the data to summary bar
    const weekEffort = calculateTotalTime(timeEntries.weeks[0], true);
    setTimeLogState({ ...timeLogState, currentWeekEffort: weekEffort });
    if (props.isDashboard) {
      props.passSummaryBarData({ personId: userId, tangibletime: weekEffort });
    } else {
      setSummaryBarData({ personId: userId, tangibletime: weekEffort });
    }
  };

  const buildOptions = () => {
    const projectsObject = {};
    const options = [
      <option className='responsive-font-size' value="all" key="TimeLogDefaultProjectOrTask" >
        Select Project/Task (all)
      </option>,
    ];
    displayUserProjects.forEach(project => {
      const { projectId } = project;
      project.WBSObject = {};
      projectsObject[projectId] = project;
    });
    disPlayUserTasks.forEach(task => {
      const { projectId, wbsId, _id: taskId, wbsName, projectName } = task;
      if (!projectsObject[projectId]) {
        projectsObject[projectId] = {
          projectName,
          WBSObject: {
            [wbsId]: {
              wbsName,
              taskObject: {
                [taskId]: task
              }
            }
          }
        }
      } else if (!projectsObject[projectId].WBSObject[wbsId]) {
        projectsObject[projectId].WBSObject[wbsId] = {
          wbsName,
          taskObject: {
            [taskId]: task
          }
        }
      } else {
        projectsObject[projectId].WBSObject[wbsId].taskObject[taskId] = task;
      }
    });

    for (const [projectId, project] of Object.entries(projectsObject)) {
      const { projectName, WBSObject } = project;
      options.push(
        <option className='responsive-font-size' value={projectId} key={`TimeLog_${projectId}`} >
          {projectName}
        </option>,
      );
      for (const [wbsId, WBS] of Object.entries(WBSObject)) {
        const { wbsName, taskObject } = WBS;
        options.push(
          <option value={wbsId} key={`TimeLog_${wbsId}`} disabled className={`${darkMode ? "text-white-50" : ''} responsive-font-size`}>
            {`\u2003WBS: ${wbsName}`}
          </option>
        )
        for (const [taskId, task] of Object.entries(taskObject)) {
          const { taskName } = task;
          options.push(
            <option className='responsive-font-size' value={taskId} key={`TimeLog_${taskId}`} >
              {`\u2003\u2003 ↳ ${taskName}`}
            </option>
          )
        }
      }
    }
    return options;
  };

  const generateTimeLogItems = userId => {
    //build the time log component
    const options = buildOptions();
    setProjectOrTaskOptions(options);
    updateTimeEntryItems();
    makeBarData(userId);
  };

  const handleUpdateTask = useCallback(() => {
    setShouldFetchData(true);
  }, []);

  const handleStorageEvent = () => {
    const sessionStorageData = checkSessionStorage();
    setViewingUser(sessionStorageData || false);
    if (sessionStorageData && sessionStorageData.userId != authUser.userId) {
      setDisplayUserId(sessionStorageData.userId);
    }
  }

  /*---------------- useEffects -------------- */

  // Update user ID if it changes in the URL
  useEffect(() => {
    if (urlId) {
      setUserProfileId(urlId);
    }
  }, [urlId]);

  useEffect(() => {
    if (userprofileId) {
      setDisplayUserId(userprofileId);
    }
  }, [userprofileId]);

  useEffect(() => {
    props.getBadgeCount(displayUserId);
  }, [displayUserId, props]);


  useEffect(() => {
    changeTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    // Build the time log after new data is loaded
    if (!timeLogState.isTimeEntriesLoading) {
      generateTimeLogItems(displayUserId);
    }
  }, [timeLogState.isTimeEntriesLoading, timeEntries, displayUserId]);

  useEffect(() => {
    loadAsyncData(displayUserId);
  }, [displayUserId]);

  useEffect(() => {
    // Filter the time entries
    updateTimeEntryItems();
  }, [timeLogState.projectsSelected]);

  useEffect(() => {
    // Listens to sessionStorage changes, when setting viewingUser in leaderboard, an event is dispatched called storage. This listener will catch it and update the state.
    window.addEventListener('storage', handleStorageEvent);
    return () => {
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  return (

    <div 
      className={`container-timelog-wrapper ${darkMode ? 'bg-oxford-blue' : ''}`} 
      style={darkMode ? (!props.isDashboard ? {padding: "0 15px 300px 15px"} : {}) : {}}>
    
      {!props.isDashboard ? (
        <Container fluid>
          <SummaryBar
            displayUserId={displayUserId}
            toggleSubmitForm={() => showSummary(isAuthUser)}
            role={authUser}
            summaryBarData={summaryBarData}
          />
          <br />
        </Container>
      ) : (
        <Container style={{ textAlign: 'right', minWidth: '100%' }}>
          {
            props.isDashboard ?
              <></> :
              <EditableInfoModal
                areaName="DashboardTimelog"
                areaTitle="Timelog"
                fontSize={30}
                isPermissionPage={true}
                role={authUser.role}
                darkMode={darkMode}
              />
          }
        </Container>
      )}

      {timeLogState.isTimeEntriesLoading ? (
        <LoadingSkeleton template="Timelog" />
      ) : (
        <div className={`${!props.isDashboard ? "timelogPageContainer" : "ml-3 min-width-100"}`}>
          {timeLogState.summary ? (
            <div className="my-2">
              <div id="weeklySum">
                <WeeklySummary displayUserId={displayUserId} setPopup={toggleSummary} darkMode={darkMode} />
              </div>
            </div>
          ) : null}
          <Row style={{ minWidth: "100%" }}>
            <Col md={12} className='px-0 mx-0'>
              <Card className={darkMode ? 'border-0' : ''}>
                <CardHeader className={darkMode ? 'card-header-shadow-dark bg-space-cadet text-light' : 'card-header-shadow'}>
                  <Row style={{ minWidth: "100%" }} className='px-0 mx-0'>
                    <Col style={{ minWidth: "100%" }} className='px-0 mx-0'>
                      <CardTitle tag="h4">
                        <div className="d-flex align-items-center">
                          <span className="taskboard-header-title mb-1 mr-2">Tasks and Timelogs</span>
                          <EditableInfoModal
                            areaName="TasksAndTimelogInfoPoint"
                            areaTitle="Tasks and Timelogs"
                            fontSize={24}
                            isPermissionPage={true}
                            role={authUser.role} // Pass the 'role' prop to EditableInfoModal
                            darkMode={darkMode}
                          />

                          <span className="mr-2" style={{ padding: '1px' }}>
                            <ActiveCell
                              isActive={displayUserProfile.isActive}
                              user={displayUserProfile}
                              onClick={() => {
                                props.updateUserProfile({
                                  ...displayUserProfile,
                                  isActive: !displayUserProfile.isActive,
                                  endDate:
                                    !displayUserProfile.isActive === false
                                      ? moment(new Date()).format('YYYY-MM-DD')
                                      : undefined,
                                });
                              }}
                            />
                          </span>
                          <ProfileNavDot userId={displayUserId} style={{ marginLeft: '2px', padding: '1px' }} />
                        </div>
                      </CardTitle>
                      <CardSubtitle tag="h6" className={`${darkMode ? "text-azure" : "text-muted"} responsive-font-size`}>
                        Viewing time entries logged in the last 3 weeks
                      </CardSubtitle>
                    </Col>
                    <Col className='px-0'>
                      {isAuthUser ? (
                        <div className="tasks-and-timelog-header-add-time-div mt-2">
                          <div>
                            <Button className='responsive-font-size' color="success" onClick={toggle} style={darkMode ? boxStyleDark : boxStyle}>
                              {'Add Intangible Time Entry '}
                              <i
                                className="fa fa-info-circle"
                                data-tip
                                data-for="timeEntryTip"
                                data-delay-hide="1000"
                                aria-hidden="true"
                                title=""
                              />
                            </Button>
                            <ReactTooltip
                              id="timeEntryTip"
                              place="bottom"
                              effect="solid"
                              delayShow={500}
                            >
                              Clicking this button only allows for “Intangible Time” to be added to
                              your time log.{' '}
                              <u>
                                You can manually log Intangible Time but it doesn’t <br />
                                count towards your weekly time commitment.
                              </u>
                              <br />
                              <br />
                              “Tangible Time” is the default for logging time using the timer at the
                              top of the app. It represents all work done on assigned action items{' '}
                              <br />
                              and is what counts towards a person’s weekly volunteer time
                              commitment. The only way for a volunteer to log Tangible Time is by
                              using the clock
                              <br />
                              in/out timer. <br />
                              <br />
                              Intangible Time is almost always used only by the management team. It
                              is used for weekly Monday night management team calls, monthly
                              management
                              <br />
                              team reviews and Welcome Team Calls, and non-action-item related
                              research, classes, and other learning, meetings, etc. that benefit or
                              relate to <br />
                              the project but aren’t related to a specific action item on the{' '}
                              <a href="https://www.tinyurl.com/oc-os-wbs">
                                One Community Work Breakdown Structure.
                              </a>
                              <br />
                              <br />
                              Intangible Time may also be logged by a volunteer when in the field or
                              for other reasons when the timer wasn’t able to be used. In these
                              cases, the <br />
                              volunteer will use this button to log time as “intangible time” and
                              then request that an Admin manually change the log from Intangible to
                              Tangible.
                              <br />
                              <br />
                            </ReactTooltip>
                          </div>
                        </div>
                      ) : (
                        !(viewingUser && viewingUser.role === 'Owner' && authUser.role !== 'Owner') && (canPutUserProfileImportantInfo) && (
                          <div className="tasks-and-timelog-header-add-time-div">
                            <div>
                              <Button color="warning" onClick={toggle} style={boxStyle}>
                                Add Time Entry {!isAuthUser && `for ${fullName}`}
                              </Button>
                            </div>
                          </div>
                        )
                      )}
                      <Modal
                        isOpen={timeLogState.infoModal}
                        toggle={openInfo}
                        className={darkMode ? 'text-light' : ''}
                      >
                        <ModalHeader className={darkMode ? 'bg-space-cadet' : ''}>Info</ModalHeader>
                        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
                          {timeLogState.information}
                        </ModalBody>
                        <ModalFooter className={darkMode ? 'bg-space-cadet' : ''}>
                          <Button
                            onClick={openInfo}
                            color="primary"
                            style={darkMode ? boxStyleDark : boxStyle}
                          >
                            Close
                          </Button>
                          <Button onClick={openInfo} color="secondary">
                            Edit
                          </Button>
                        </ModalFooter>
                      </Modal>
                      {/* This TimeEntryForm is for adding intangible time throught the add intangible time enty button */}
                      <TimeEntryForm
                        from="TimeLog"
                        edit={false}
                        toggle={toggle}
                        isOpen={timeLogState.timeEntryFormModal}
                        data={intangibletimeEntryFormData}
                        userProfile={displayUserProfile}
                        roles={roles}
                      />
                      <ReactTooltip id="registerTip" place="bottom" effect="solid">
                        Click this icon to learn about the timelog.
                      </ReactTooltip>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody className={darkMode ? 'card-header-shadow-dark bg-space-cadet' : 'card-header-shadow'}>
                  <Nav tabs className="task-and-timelog-card-nav mb-1 responsive-font-size">
                    <NavItem>
                      <NavLink
                        className={classnames({ active: timeLogState.activeTab === 0 })}
                        onClick={() => {
                          changeTab(0);
                        }}
                        href="#"
                        to="#"
                      >
                        Tasks
                      </NavLink>
                    </NavItem>
                    <NavLink
                      className={classnames({ active: timeLogState.activeTab === 1 })}
                      onClick={() => {
                        changeTab(1);
                      }}
                      href="#"
                      to="#"
                    >
                      Current Week Timelog
                    </NavLink>

                    <NavItem>
                      <NavLink
                        className={classnames({ active: timeLogState.activeTab === 2 })}
                        onClick={() => {
                          changeTab(2);
                        }}
                        href="#"
                        to="#"
                      >
                        Last Week
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames({ active: timeLogState.activeTab === 3 })}
                        onClick={() => {
                          changeTab(3);
                        }}
                        href="#"
                        to="#"
                      >
                        Week Before Last
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames({ active: timeLogState.activeTab === 4 })}
                        onClick={() => {
                          changeTab(4);
                        }}
                        href="#"
                        to="#"
                      >
                        Search by Date Range
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames({ active: timeLogState.activeTab === 5 })}
                        onClick={() => {
                          changeTab(5);
                        }}
                        href="#"
                        to="#"
                      >
                        Weekly Summaries
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames({ active: timeLogState.activeTab === 6 })}
                        onClick={() => {
                          changeTab(6);
                        }}
                        href="#"
                        to="#"
                      >
                        Badges<span className="badge badge-pill badge-danger ml-2">{props.badgeCount}</span>
                      </NavLink>
                    </NavItem>
                  </Nav>

                  <TabContent activeTab={timeLogState.activeTab} className={darkMode ? "bg-space-cadet" : ""}>
                    {renderViewingTimeEntriesFrom()}
                    {timeLogState.activeTab === 4 && (
                      <Form inline className="mb-2">
                        <FormGroup className="mr-2 date-selector-form">
                          <Label for="fromDate" className={`responsive-font-size mr-2 ml-1 ${darkMode ? "text-light" : ""}`}>
                            From
                          </Label>
                          <Input
                            className='responsive-font-size'
                            type="date"
                            name="fromDate"
                            id="fromDate"
                            value={timeLogState.fromDate}
                            onChange={handleInputChange}
                          />
                        </FormGroup>
                        <FormGroup>
                          <Label for="toDate" className={`responsive-font-size mr-2 ${darkMode ? "text-light" : ""}`}>
                            To
                          </Label>
                          <Input
                            className='responsive-font-size'
                            type="date"
                            name="toDate"
                            id="toDate"
                            value={timeLogState.toDate}
                            onChange={handleInputChange}
                          />
                        </FormGroup>
                        <Button
                          color="primary"
                          onClick={handleSearch}
                          className="search-time-entries-btn"
                          style={darkMode ? boxStyleDark : boxStyle}
                        >
                          Search
                        </Button>
                      </Form>
                    )}
                    {timeLogState.activeTab === 0 || timeLogState.activeTab === 5 || timeLogState.activeTab === 6 ? (
                      <></>
                    ) : (
                      <Form className="mb-2 responsive-font-size">
                        <FormGroup>
                          <Label
                            htmlFor="projectSelected"
                            className={'mr-1 ml-1 mb-1 align-top ' + (darkMode ? 'text-light' : '')}
                          >
                            Filter Entries by Project and Task:
                          </Label>
                          <Input
                            type="select"
                            name="projectSelected"
                            id="projectSelected"
                            value={timeLogState.projectsSelected}
                            title="Ctrl + Click to select multiple projects and tasks to filter."
                            onChange={e => {
                              setTimeLogState({
                                ...timeLogState,
                                projectsSelected: Array.from(
                                  e.target.selectedOptions,
                                  option => option.value,
                                ),
                              });
                            }}
                            multiple
                            className={darkMode ? 'bg-yinmn-blue text-light' : ''}
                          >
                            {projectOrTaskOptions}
                          </Input>
                        </FormGroup>
                      </Form>
                    )}

                    {timeLogState.activeTab === 0 || timeLogState.activeTab === 5 || timeLogState.activeTab === 6 ? (
                      <></>
                    ) : (
                      <EffortBar
                        activeTab={timeLogState.activeTab}
                        projectsSelected={timeLogState.projectsSelected}
                        roles={roles}
                      />
                    )}
                    <TabPane tabId={0}>
                      <TeamMemberTasks />
                    </TabPane>
                    <TabPane tabId={1}>{currentWeekEntries}</TabPane>
                    <TabPane tabId={2}>{lastWeekEntries}</TabPane>
                    <TabPane tabId={3}>{beforeLastEntries}</TabPane>
                    <TabPane tabId={4}>{periodEntries}</TabPane>
                    <TabPane tabId={5}>
                      <WeeklySummaries userProfile={displayUserProfile} />
                    </TabPane>
                    <TabPane tabId={6}>
                      <Badge userId={displayUserId} role={authUser.role} />
                    </TabPane>
                  </TabContent>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
};

Timelog.prototype = {
  userId: PropTypes.string,
};

Timelog.defaultProps = {
  userId: null,
};

const mapStateToProps = state => ({
  authUser: state.auth.user,
  displayUserProfile: state.userProfile,
  timeEntries: state.timeEntries,
  displayUserProjects: state.userProjects.projects,
  disPlayUserTasks: state.userTask,
  roles: state.role.roles,
  badgeCount: state.badge.badgeCount,
});

export default connect(mapStateToProps, {
  getTimeEntriesForWeek,
  getTimeEntriesForPeriod,
  getUserProfile,
  getUserProjects,
  getUserTasks,
  updateUserProfile,
  getAllRoles,
  hasPermission,
  getBadgeCount,
  resetBadgeCount,
})(Timelog);
