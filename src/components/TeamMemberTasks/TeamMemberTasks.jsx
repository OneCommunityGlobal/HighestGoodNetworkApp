import { Fragment } from 'react';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import { Table } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fetchTeamMembersTask, deleteTaskNotification } from 'actions/task';
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector, connect } from 'react-redux';
import SkeletonLoading from '../common/SkeletonLoading';
import { TaskDifferenceModal } from './components/TaskDifferenceModal';
import { getTeamMemberTasksData } from './selectors';
import { getUserProfile } from '../../actions/userProfile';
import './style.css';
import { fetchAllManagingTeams } from '../../actions/team';
import TaskCompletedModal from './components/TaskCompletedModal';
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';
import moment from 'moment';
import TeamMemberTask from './TeamMemberTask';
import FilteredTimeEntries from './FilteredTimeEntries';
import { hrsFilterBtnRed, hrsFilterBtnBlue } from 'constants/colors';
import { toast } from 'react-toastify';
// import InfiniteScroll from 'react-infinite-scroller';
import { getAllTimeOffRequests } from '../../actions/timeOffRequestAction';

const TeamMemberTasks = React.memo(props => {
  const [showTaskNotificationModal, setTaskNotificationModal] = useState(false);
  const [currentTaskNotifications, setCurrentTaskNotifications] = useState([]);
  const [currentTask, setCurrentTask] = useState();
  const [currentUserId, setCurrentUserId] = useState('');
  const { isLoading, usersWithTasks } = useSelector(getTeamMemberTasksData);
  const [tasks, setTasks] = useState();
  const [updatedTasks, setUpdatedTasks] = useState([]);
  const [showMarkAsDoneModal, setMarkAsDoneModal] = useState(false);
  const [clickedToShowModal, setClickedToShowModal] = useState(false);
  const [teamList, setTeamList] = useState([]);
  const [timeEntriesList, setTimeEntriesList] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState();
  const [isTimeLogActive, setIsTimeLogActive] = useState(false);
  const [twentyFourHoursTimeEntries, setTwentyFourHoursTimeEntries] = useState([]);
  const [fortyEightHoursTimeEntries, setFortyEightHoursTimeEntries] = useState([]);
  const [seventyTwoHoursTimeEntries, setSeventyTwoHoursTimeEntries] = useState([]);
  const [finishLoading, setFinishLoading] = useState(false);
  const [taskModalOption, setTaskModalOption] = useState('');
  // const [displayData, setDisplayData] = useState([]);
  // const [hasMore, setHasMore] = useState(true);
  const [showWhoHasTimeOff, setShowWhoHasTimeOff] = useState(true);
  const userOnTimeOff = useSelector(state => state.timeOffRequests.onTimeOff);
  const userGoingOnTimeOff = useSelector(state => state.timeOffRequests.goingOnTimeOff);

  //added it to keep track if the renderTeamsList should run
  const [shouldRun, setShouldRun] = useState(false);

  //role state so it's more easily changed, the initial value is empty, so it'll be determinated on the first useEffect
  const [userRole, setUserRole] = useState('');

  //function to get user's role if the current user's id is different from the authenticated user
  function getUserRole(userId) {
    const fetchedUser = axios.get(ENDPOINTS.USER_PROFILE(userId));
    return fetchedUser;
  }

  //moved the userId variable to before the first useEffect so the dispatch function can access it
  //Make so the userId gets the url param. If the url param is not available, it'll get the asUser passed as a props
  //If the asUser is not defined, it'll be equal the auth.user.userid from the store
  const userId = props?.match?.params?.userId || props.asUser || props.auth.user.userid;

  const dispatch = useDispatch();

  useEffect(() => {
    const initialFetching = async () => {
      //Passed the userid as argument to fetchTeamMembersTask
      //the fetchTeamMembersTask has a function inside id that gets the userId from the store, like the last part of the userId variable in this file
      //so, before it gets from the store, it'll see if the userId is provided.
      //It works because the userId first looks for the url param. If it gets the param, it will provide it to the userId
      //after that, fetchTeamMembersTask will look for the team member's tasks of the provided userId
      //fetch current user's role, so it can be displayed. It will only happen if the current user's id is different of the auth user id
      //if it's not differente, it'll attribute the current authenticated user's role.
      //also, the userId is different from the authenticated user, it will call the fetchTeamMmbersTask with the currently authenticated user id
      if (userId !== props.auth.user.userid) {
        await dispatch(fetchTeamMembersTask(userId, props.auth.user.userid));
        const currentUserRole = getUserRole(userId)
          .then(resp => resp)
          .then(user => {
            setUserRole(user.data.role);
          });
      } else {
        await dispatch(fetchTeamMembersTask(userId, null));
        setUserRole(props.auth.user.role);
      }
      setShouldRun(true);
    };
    initialFetching();
  }, []);

  useEffect(() => {
    if (clickedToShowModal) {
      setMarkAsDoneModal(true);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (isLoading === false && shouldRun) {
      renderTeamsList();
      closeMarkAsDone();
    }
  }, [usersWithTasks, shouldRun]);

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
    dispatch(fetchTeamMembersTask(userId, props.auth.user.userid, true));
    props.handleUpdateTask();
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
    dispatch(fetchTeamMembersTask(userId, props.auth.user.userid, true));
    props.handleUpdateTask();
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
    if (currentUserId === props.auth.user.userid) {
      dispatch(deleteTaskNotification(userId, taskId, taskNotificationId));
    }
    handleOpenTaskNotificationModal();
  };

  const getTimeEntriesForPeriod = async teamList => {
    let twentyFourList = [];
    let fortyEightList = [];

    //1, fetch data of past 72hrs timelogs
    const fromDate = moment()
      .tz('America/Los_Angeles')
      .subtract(72, 'hours')
      .format('YYYY-MM-DD');
    const toDate = moment()
      .tz('America/Los_Angeles')
      .format('YYYY-MM-DD');

    const userIds = teamList.map(user => user.personId);

    const userListTasksRequest = async userList => {
      const url = ENDPOINTS.TIME_ENTRIES_USER_LIST;
      return axios.post(url, { users: userList, fromDate, toDate });
    };

    const taskResponse = await userListTasksRequest(userIds);
    const usersListTasks = taskResponse.data;

    //2. Generate array of past 24/48 hrs timelogs
    usersListTasks.map(entry => {
      const threeDaysAgo = moment()
        .tz('America/Los_Angeles')
        .subtract(72, 'hours')
        .format('YYYY-MM-DD');

      const twoDaysAgo = moment()
        .tz('America/Los_Angeles')
        .subtract(48, 'hours')
        .format('YYYY-MM-DD');

      setSeventyTwoHoursTimeEntries([...seventyTwoHoursTimeEntries, entry]);
      const isFortyEight = moment(entry.dateOfWork).isAfter(threeDaysAgo);
      if (isFortyEight) fortyEightList.push(entry);
      const isTwentyFour = moment(entry.dateOfWork).isAfter(twoDaysAgo);
      if (isTwentyFour) twentyFourList.push(entry);
    });

    //3. set three array of time logs
    setSeventyTwoHoursTimeEntries([...usersListTasks]);
    setFortyEightHoursTimeEntries([...fortyEightList]);
    setTwentyFourHoursTimeEntries([...twentyFourList]);

    setFinishLoading(true);
  };

  //Display timelogs based on selected period
  const selectPeriod = period => {
    if (period === selectedPeriod) {
      setIsTimeLogActive(!isTimeLogActive);
    } else {
      setIsTimeLogActive(true);
    }
    setSelectedPeriod(period);
    if (period === 24) {
      setTimeEntriesList([...twentyFourHoursTimeEntries]);
    } else if (period === 48) {
      setTimeEntriesList([...fortyEightHoursTimeEntries]);
    } else {
      setTimeEntriesList([...seventyTwoHoursTimeEntries]);
    }
  };

  const renderTeamsList = async () => {
    if (usersWithTasks && usersWithTasks.length > 0) {
      // give different users different views
      let filteredMembers = usersWithTasks.filter(member => {
        if (userRole === 'Volunteer' || userRole === 'Core Team') {
          return member.role === 'Volunteer' || member.role === 'Core Team';
        } else if (userRole === 'Manager' || userRole === 'Mentor') {
          return (
            member.role === 'Volunteer' ||
            member.role === 'Core Team' ||
            member.role === 'Manager' ||
            member.role === 'Mentor'
          );
        } else {
          return member;
        }
      });

      //sort all users by their name
      filteredMembers.sort((a, b) => {
        let filteredMembersA = a.name.toLowerCase();
        let filteredMembersB = b.name.toLowerCase();

        if (filteredMembersA < filteredMembersB) {
          return -1;
        }
        if (filteredMembersA > filteredMembersB) {
          return 1;
        }
        return 0;
      });

      //find currentUser
      const currentUser = filteredMembers.find(user => user.personId === userId);
      // if current user doesn't have any task, the currentUser cannot be found

      if (currentUser) {
        //conditional variable for moving current user up front.
        let moveCurrentUserFront = false;

        //Does the user has at least one task with project Id and task id assigned. Then set the current user up front.
        for (const task of currentUser.tasks) {
          if (task.wbsId && task.projectId) {
            moveCurrentUserFront = true;
            break;
          }
        }
        //if needs to move current user up front, first remove current user from filterMembers. Then put the current user on top of the list.
        if (moveCurrentUserFront) {
          //removed currentUser
          filteredMembers = filteredMembers.filter(user => user.personId !== userId);
          //push currentUser on top of the array.
          filteredMembers.unshift(currentUser);
        }
      }

      getTimeEntriesForPeriod(filteredMembers);
      setTeamList([...filteredMembers]);
    }
  };

  // const loadFunc = useCallback(pageNum => {
  //   if (teamList.length <= displayData.length) {
  //     setHasMore(false);
  //     return;
  //   }

  //   const start = pageNum * 10;
  //   setDisplayData([...displayData, ...teamList.slice(start, start + 10)]);
  //   setHasMore(true);
  // });

  // useEffect(() => {
  //   loadFunc();
  // }, [teamList]);

  const handleshowWhoHasTimeOff = () => {
    setShowWhoHasTimeOff(prev => !prev);
  };

  return (
    <div className="container team-member-tasks">
      <header className="header-box">
        <h1>Team Member Tasks</h1>

        {finishLoading ? (
          <div className="hours-btn-container">
            <button
              type="button"
              className={`show-time-off-btn ${
                showWhoHasTimeOff ? 'show-time-off-btn-selected' : ''
              }`}
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
            <button
              type="button"
              className="circle-border 24h"
              title="Timelogs submitted in the past 24 hours"
              style={{
                color: selectedPeriod === 24 && isTimeLogActive ? 'white' : hrsFilterBtnRed,
                backgroundColor:
                  selectedPeriod === 24 && isTimeLogActive ? hrsFilterBtnRed : 'white',
                border: '1px solid #DC143C',
              }}
              onClick={() => selectPeriod(24)}
            >
              24h
            </button>
            <button
              type="button"
              className="circle-border 48h"
              title="Timelogs submitted in the past 48 hours"
              style={{
                color: selectedPeriod === 48 && isTimeLogActive ? 'white' : hrsFilterBtnBlue,
                backgroundColor:
                  selectedPeriod === 48 && isTimeLogActive ? hrsFilterBtnBlue : 'white',
                border: '1px solid #6495ED',
              }}
              onClick={() => selectPeriod(48)}
            >
              48h
            </button>
            <button
              type="button"
              className="circle-border 72h"
              title="Timelogs submitted in the past 72 hours"
              style={{
                color: selectedPeriod === 72 && isTimeLogActive ? 'white' : '#228B22',
                backgroundColor: selectedPeriod === 72 && isTimeLogActive ? '#228B22' : 'white',
                border: '1px solid #228B22',
              }}
              onClick={() => selectPeriod(72)}
            >
              72h
            </button>
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
        loggedInUserId={props.auth.user.userid}
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
      <div className="table-container">
        <Table>
          <thead className="pc-component" style={{ position: 'sticky', top: 0 }}>
            <tr>
              {/* Empty column header for hours completed icon */}
              <th />
              <th className="team-member-tasks-headers">
                <Table borderless className="team-member-tasks-subtable">
                  <thead>
                    <tr>
                      <th className="team-member-tasks-headers team-member-tasks-user-name">
                        Team Member
                      </th>
                      <th className="team-member-tasks-headers team-clocks team-clocks-header">
                        <FontAwesomeIcon icon={faClock} title="Weekly Committed Hours" />
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
              <th className="team-member-tasks-headers">
                <Table borderless className="team-member-tasks-subtable">
                  <thead>
                    <tr>
                      <th>Tasks(s)</th>
                      <th className="team-task-progress">Progress</th>
                      {userRole === 'Administrator' ? <th>Status</th> : null}
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
                if (!isTimeLogActive) {
                  return (
                    <TeamMemberTask
                      user={user}
                      key={user.personId}
                      handleOpenTaskNotificationModal={handleOpenTaskNotificationModal}
                      handleMarkAsDoneModal={handleMarkAsDoneModal}
                      handleRemoveFromTaskModal={handleRemoveFromTaskModal}
                      handleTaskModalOption={handleTaskModalOption}
                      userRole={userRole}
                      updateTaskStatus={updateTaskStatus}
                      roles={props.roles}
                      userPermissions={props.userPermissions}
                      userId={userId}
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
                        userRole={userRole}
                        updateTaskStatus={updateTaskStatus}
                        roles={props.roles}
                        userPermissions={props.userPermissions}
                        userId={userId}
                        showWhoHasTimeOff={showWhoHasTimeOff}
                        onTimeOff={userOnTimeOff[user.personId]}
                        goingOnTimeOff={userGoingOnTimeOff[user.personId]}
                      />
                      {timeEntriesList.length > 0 &&
                        timeEntriesList
                          .filter(timeEntry => timeEntry.personId === user.personId)
                          .map(timeEntry => (
                            <tr className="table-row" key={timeEntry._id}>
                              <td colSpan={3} style={{ padding: 0 }}>
                                <FilteredTimeEntries data={timeEntry} key={timeEntry._id} />
                              </td>
                            </tr>
                          ))}
                    </ Fragment>
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
  auth: state.auth,
  userId: state.userProfile.id,
  managingTeams: state.userProfile.teams,
  teamsInfo: state.managingTeams,
  roles: state.role.roles,
  userPermissions: state.auth?.permissions?.frontPermissions,
});

export default connect(mapStateToProps, {
  getUserProfile,
  fetchAllManagingTeams,
})(TeamMemberTasks);
