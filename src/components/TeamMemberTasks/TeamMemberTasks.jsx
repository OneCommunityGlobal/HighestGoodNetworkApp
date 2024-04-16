import { Fragment } from 'react';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import { Table } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fetchTeamMembersTask, deleteTaskNotification } from 'actions/task';
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector, connect } from 'react-redux';
import SkeletonLoading from '../common/SkeletonLoading';
import { TaskDifferenceModal } from './components/TaskDifferenceModal';
import './style.css';
import TaskCompletedModal from './components/TaskCompletedModal';
import EditableInfoModal from 'components/UserProfile/EditableModal/EditableInfoModal';
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';
import moment from 'moment';
import TeamMemberTask from './TeamMemberTask';
import TimeEntry from '../Timelog/TimeEntry';
import { hrsFilterBtnColorMap } from 'constants/colors';
import { toast } from 'react-toastify';
// import InfiniteScroll from 'react-infinite-scroller';
import { getAllTimeOffRequests } from '../../actions/timeOffRequestAction';

const TeamMemberTasks = React.memo(props => {
  const darkMode = useSelector(state => state.theme.darkMode);
  // props from redux store
  const { authUser, displayUser, isLoading, usersWithTasks, usersWithTimeEntries } = props;

  const [showTaskNotificationModal, setTaskNotificationModal] = useState(false);
  const [currentTaskNotifications, setCurrentTaskNotifications] = useState([]);
  const [currentTask, setCurrentTask] = useState();
  const [currentUserId, setCurrentUserId] = useState('');
  const [tasks, setTasks] = useState();
  const [updatedTasks, setUpdatedTasks] = useState([]);
  const [showMarkAsDoneModal, setMarkAsDoneModal] = useState(false);
  const [clickedToShowModal, setClickedToShowModal] = useState(false);
  const [teamList, setTeamList] = useState([]);
  const [timeEntriesList, setTimeEntriesList] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [isTimeFilterActive, setIsTimeFilterActive] = useState(false);
  const [finishLoading, setFinishLoading] = useState(false);
  const [taskModalOption, setTaskModalOption] = useState('');
  const [showWhoHasTimeOff, setShowWhoHasTimeOff] = useState(true);
  const userOnTimeOff = useSelector(state => state.timeOffRequests.onTimeOff);
  const userGoingOnTimeOff = useSelector(state => state.timeOffRequests.goingOnTimeOff);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllTimeOffRequests());
  }, []);

  const closeMarkAsDone = () => {
    setClickedToShowModal(false);
    setMarkAsDoneModal(false);
    setCurrentUserId('');
  };

  const onUpdateTask = useCallback((taskId, updatedTask) => {
    const newTask = {
      updatedTask,
      taskId,
    };
    submitTasks(newTask);
    dispatch(fetchTeamMembersTask(displayUser._id));
  }, []);

  const submitTasks = async updatedTasks => {
    const url = ENDPOINTS.TASK_UPDATE(updatedTasks.taskId);
    try {
      await axios.put(url, updatedTasks.updatedTask);
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const updateTaskStatus = useCallback(async (taskId, updatedTask) => {
    const newTask = {
      updatedTask,
      taskId,
    };
    const url = ENDPOINTS.TASK_UPDATE_STATUS(newTask.taskId);
    try {
      await axios.put(url, newTask.updatedTask);
    } catch (error) {
      toast.error('Failed to update task');
    }
    dispatch(fetchTeamMembersTask(displayUser._id));
  }, []);

  const handleOpenTaskNotificationModal = useCallback((userId, task, taskNotifications = []) => {
    setCurrentUserId(userId);
    setCurrentTask(task);
    setCurrentTaskNotifications(taskNotifications);
    setTaskNotificationModal(prev => !prev);
  }, []);

  const handleMarkAsDoneModal = useCallback((userId, task) => {
    setCurrentUserId(userId);
    setCurrentTask(task);
    setClickedToShowModal(true);
  }, []);

  const handleRemoveFromTaskModal = useCallback((userId, task) => {
    setCurrentUserId(userId);
    setCurrentTask(task);
    setClickedToShowModal(true);
  }, []);

  const handleTaskModalOption = useCallback(option => {
    setTaskModalOption(option);
  }, []);

  const handleTaskNotificationRead = (userId, taskId, taskNotificationId) => {
    //if the authentitated user is seeing it's own notification
    if (currentUserId === authUser.userid) {
      dispatch(deleteTaskNotification(userId, taskId, taskNotificationId));
    }
    handleOpenTaskNotificationModal();
  };

  const getTimeEntriesForPeriod = async (selectedPeriod) => {
    const oneDayAgo = moment()
      .tz('America/Los_Angeles')
      .subtract(1, 'days')
      .format('YYYY-MM-DD');

    const twoDaysAgo = moment()
      .tz('America/Los_Angeles')
      .subtract(2, 'days')
      .format('YYYY-MM-DD');
    
    const threeDaysAgo = moment()
      .tz('America/Los_Angeles')
      .subtract(3, 'days')
      .format('YYYY-MM-DD');

    const fourDaysAgo = moment()
      .tz('America/Los_Angeles')
      .subtract(4, 'days')
      .format('YYYY-MM-DD');

    switch (selectedPeriod) {
      case '1':
        const oneDaysList = usersWithTimeEntries.filter(entry => moment(entry.dateOfWork).isAfter(oneDayAgo));
        setTimeEntriesList(oneDaysList);
        break;
      case '2':
        const twoDaysList = usersWithTimeEntries.filter(entry => moment(entry.dateOfWork).isAfter(twoDaysAgo));
        setTimeEntriesList(twoDaysList);
        break;
      case '3':
        const threeDaysList = usersWithTimeEntries.filter(entry => moment(entry.dateOfWork).isAfter(threeDaysAgo));
        setTimeEntriesList(threeDaysList);
        break;
      case '4':
        const fourDaysList = usersWithTimeEntries.filter(entry => moment(entry.dateOfWork).isAfter(fourDaysAgo));
        setTimeEntriesList(fourDaysList);
        break;
      case '7':
        setTimeEntriesList(usersWithTimeEntries);
        break;
      default:
        setTimeEntriesList([]);
    }

    setFinishLoading(true);
  };

  //Display timelogs based on selected period
  const selectPeriod = period => {
    if (period === selectedPeriod) {
      setIsTimeFilterActive(false);
      setSelectedPeriod(null);
    } else {
      setIsTimeFilterActive(true);
      setSelectedPeriod(period);
    }
  };

  const renderTeamsList = async () => {
    if (usersWithTasks.length > 0) {
      //sort all users by their name
      usersWithTasks.sort((a, b) => (a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1));
      //find currentUser
      const currentUserIndex = usersWithTasks.findIndex(user => user.personId === displayUser._id);
      // if current user doesn't have any task, the currentUser cannot be found
      if (usersWithTasks[currentUserIndex]?.tasks.length) {
        //conditional variable for moving current user up front.
        usersWithTasks.unshift(...usersWithTasks.splice(currentUserIndex, 1));
      }
      setTeamList([...usersWithTasks]);
    }
  };

  useEffect(() => {
    // TeamMemberTasks is only imported in TimeLog component, in which userId is already definitive
    const initialFetching = async () => {
      await dispatch(fetchTeamMembersTask(displayUser._id));
    };
    initialFetching();
  }, []);

  useEffect(() => {
    if (clickedToShowModal) {
      setMarkAsDoneModal(true);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (!isLoading) {
      renderTeamsList();
      closeMarkAsDone();
    }
  }, [usersWithTasks]);

  useEffect(() => {
    getTimeEntriesForPeriod(selectedPeriod);
  }, [selectedPeriod, usersWithTimeEntries]);

  const handleshowWhoHasTimeOff = () => {
    setShowWhoHasTimeOff(prev => !prev);
  };

  return (
    <div className={"container " + (darkMode ? "team-member-tasks bg-oxford-blue" : "team-member-tasks")}>
      <header className="header-box">
        <h1 className={darkMode ? "text-light" : ""}>Team Member Tasks</h1>

        {finishLoading ? (
          <div className="hours-btn-container">
            <button
              type="button"
              className={`show-time-off-btn ${
                showWhoHasTimeOff ? 'show-time-off-btn-selected ' : ''
              }` + (darkMode ? " box-shadow-dark" : "")}
              onClick={handleshowWhoHasTimeOff}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="19"
                viewBox="0 0 448 512"
                className={`show-time-off-calender-svg ${
                  showWhoHasTimeOff ? 'show-time-off-calender-svg-selected' : ''
                }`}
              >
                <path d="M128 0c17.7 0 32 14.3 32 32V64H288V32c0-17.7 14.3-32 32-32s32 14.3 32 32V64h48c26.5 0 48 21.5 48 48v48H0V112C0 85.5 21.5 64 48 64H96V32c0-17.7 14.3-32 32-32zM0 192H448V464c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V192zm64 80v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16zm128 0v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H208c-8.8 0-16 7.2-16 16zm144-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H336zM64 400v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16zm144-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H208zm112 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H336c-8.8 0-16 7.2-16 16z" />
              </svg>
              <i
                className={`show-time-off-icon ${
                  showWhoHasTimeOff ? 'show-time-off-icon-selected' : ''
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 512 512"
                  className="show-time-off-icon-svg"
                >
                  <path d="M464 256A208 208 0 1 1 48 256a208 208 0 1 1 416 0zM0 256a256 256 0 1 0 512 0A256 256 0 1 0 0 256zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z" />
                </svg>
              </i>
            </button>
            {Object.entries(hrsFilterBtnColorMap).map(([days, color], idx) => (
              <button
                key={idx}
                type="button"
                className={`circle-border ${days} days ` + (darkMode ? "box-shadow-dark" : "")}
                title={`Timelogs submitted in the past ${days} days`}
                style={{
                  color: selectedPeriod === days && isTimeFilterActive ? 'white' : color,
                  backgroundColor: selectedPeriod === days && isTimeFilterActive ? color : 'white',
                  border: `1px solid ${color}`,
                }}
                onClick={() => selectPeriod(days)}
              >
                {days} days
              </button>
            ))}
            <EditableInfoModal
              areaName="TeamMemberTasksTimeFilterInfoPoint"
              areaTitle="Team Member Task Time Filter"
              fontSize={22}
              isPermissionPage={true}
              role={authUser.role} 
            />
          </div>
        ) : (
          <SkeletonLoading template="TimelogFilter" />
        )}
      </header>
      <TaskDifferenceModal
        isOpen={showTaskNotificationModal}
        taskNotifications={currentTaskNotifications}
        task={currentTask}
        userId={currentUserId}
        toggle={handleOpenTaskNotificationModal}
        onApprove={handleTaskNotificationRead}
        loggedInUserId={authUser.userid}
      />
      {currentUserId != '' && (
        <TaskCompletedModal
          isOpen={showMarkAsDoneModal}
          updatedTasks={updatedTasks}
          setUpdatedTasks={setUpdatedTasks}
          setTasks={setTasks}
          tasks={tasks}
          submitTasks={submitTasks}
          popupClose={closeMarkAsDone}
          updateTask={onUpdateTask}
          userId={currentUserId}
          task={currentTask}
          setCurrentUserId={setCurrentUserId}
          setClickedToShowModal={setClickedToShowModal}
          taskModalOption={taskModalOption}
        />
      )}
      <div className="task_table-container">
        <Table>
          <thead className="pc-component" style={{ position: 'sticky', top: 0 }}>
            <tr>
              {/* Empty column header for hours completed icon */}
              <th colSpan={1}/>
              <th colSpan={2} className="team-member-tasks-headers">
                <Table borderless className={"team-member-tasks-subtable " + (darkMode ? "text-light" : "")}>
                  <thead>
                    <tr>
                      <th className="team-member-tasks-headers team-member-tasks-user-name">
                        Team Member
                      </th>
                      <th className="team-member-tasks-headers team-clocks team-clocks-header">
                        <FontAwesomeIcon 
                          style={{color: darkMode ? 'grey' : ''}} 
                          icon={faClock} 
                          title="Weekly Committed Hours" />
                        /
                        <FontAwesomeIcon
                          style={{ color: 'green' }}
                          icon={faClock}
                          title="Total Hours Completed this Week"
                        />
                        /
                        <FontAwesomeIcon
                          style={{ color: 'red' }}
                          icon={faClock}
                          title="Total Remaining Hours"
                        />
                      </th>
                    </tr>
                  </thead>
                </Table>
              </th>
              <th colSpan={3} className="team-member-tasks-headers">
                <Table borderless className={"team-member-tasks-subtable " + (darkMode ? "text-light" : "")}>
                  <thead>
                    <tr>
                      <th>Tasks(s)</th>
                      <th className="team-task-progress">Progress</th>
                      {displayUser.role === 'Administrator' ? <th>Status</th> : null}
                    </tr>
                  </thead>
                </Table>
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <SkeletonLoading template="TeamMemberTasks" />
            ) : (
              teamList.map(user => {
                if (!isTimeFilterActive) {
                  return (
                    <TeamMemberTask
                      user={user}
                      userPermission={props?.auth?.user?.permissions?.frontPermissions?.includes(
                        'putReviewStatus',
                      )}
                      key={user.personId}
                      handleOpenTaskNotificationModal={handleOpenTaskNotificationModal}
                      handleMarkAsDoneModal={handleMarkAsDoneModal}
                      handleRemoveFromTaskModal={handleRemoveFromTaskModal}
                      handleTaskModalOption={handleTaskModalOption}
                      userRole={displayUser.role}
                      updateTaskStatus={updateTaskStatus}
                      userId={displayUser._id}
                      showWhoHasTimeOff={showWhoHasTimeOff}
                      onTimeOff={userOnTimeOff[user.personId]}
                      goingOnTimeOff={userGoingOnTimeOff[user.personId]}
                    />
                  );
                } else {
                  return (
                    <Fragment key={user.personId}>
                      <TeamMemberTask
                        user={user}
                        key={user.personId}
                        handleOpenTaskNotificationModal={handleOpenTaskNotificationModal}
                        handleMarkAsDoneModal={handleMarkAsDoneModal}
                        handleRemoveFromTaskModal={handleRemoveFromTaskModal}
                        handleTaskModalOption={handleTaskModalOption}
                        userRole={displayUser.role}
                        updateTaskStatus={updateTaskStatus}
                        userId={displayUser._id}
                        showWhoHasTimeOff={showWhoHasTimeOff}
                        onTimeOff={userOnTimeOff[user.personId]}
                        goingOnTimeOff={userGoingOnTimeOff[user.personId]}
                      />
                      {timeEntriesList.length > 0 &&
                        timeEntriesList
                          .filter(timeEntry => timeEntry.personId === user.personId)
                          .map(timeEntry => (
                            <tr className="table-row" key={timeEntry._id}>
                              <td colSpan={6} style={{ padding: 0 }}>
                                <TimeEntry
                                  from="TaskTab"
                                  data={timeEntry}
                                  displayYear
                                  key={timeEntry._id}
                                  timeEntryUserProfile={timeEntry.userProfile}
                                />
                              </td>
                            </tr>
                          ))}
                    </Fragment>
                  );
                }
              })
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
});

const mapStateToProps = state => ({
  authUser: state.auth.user,
  displayUser: state.userProfile,
  isLoading: state.teamMemberTasks.isLoading,
  usersWithTasks: state.teamMemberTasks.usersWithTasks,
  usersWithTimeEntries: state.teamMemberTasks.usersWithTimeEntries,
});

export default connect(mapStateToProps, null)(TeamMemberTasks);
