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
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';
import moment from 'moment';
import TeamMemberTask from './TeamMemberTask';
import TimeEntry from '../Timelog/TimeEntry';
import FilteredTimeEntries from './FilteredTimeEntries';
import { hrsFilterBtnRed, hrsFilterBtnBlue } from 'constants/colors';
import { toast } from 'react-toastify';
// import InfiniteScroll from 'react-infinite-scroller';

const TeamMemberTasks = React.memo(props => {
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

  const dispatch = useDispatch();
  
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
    dispatch(fetchTeamMembersTask(displayUser._id));
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
    if (currentUserId === authUser.userid) {
      dispatch(deleteTaskNotification(userId, taskId, taskNotificationId));
    }
    handleOpenTaskNotificationModal();
  };

  const getTimeEntriesForPeriod = async (selectedPeriod) => {
    const threeDaysAgo = moment()
        .tz('America/Los_Angeles')
        .subtract(72, 'hours')
        .format('YYYY-MM-DD');

    const twoDaysAgo = moment()
      .tz('America/Los_Angeles')
      .subtract(48, 'hours')
      .format('YYYY-MM-DD');

    switch (selectedPeriod) {
      case 24:
        const twentyFourList = usersWithTimeEntries.filter(entry => moment(entry.dateOfWork).isAfter(twoDaysAgo));
        setTimeEntriesList(twentyFourList);
        break;
      case 48:
        const fortyEightList = usersWithTimeEntries.filter(entry => moment(entry.dateOfWork).isAfter(threeDaysAgo));
        setTimeEntriesList(fortyEightList);
        break;
      case 72:
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
    if (usersWithTasks && usersWithTasks.length > 0) {
      //sort all users by their name
      usersWithTasks.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1);

      //find currentUser
      const currentUserIndex = usersWithTasks.findIndex(user => user.personId === displayUser._id);

      // if current user doesn't have any task, the currentUser cannot be found
      if (usersWithTasks[currentUserIndex].tasks.length) {
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

  

  return (
    <div className="container team-member-tasks">
      <header className="header-box">
        <h1>Team Member Tasks</h1>
        {finishLoading ? (
          <div className="hours-btn-container">
            <button
              type="button"
              className="circle-border 24h"
              title="Timelogs submitted in the past 24 hours"
              style={{
                color: selectedPeriod === 24 && isTimeFilterActive ? 'white' : hrsFilterBtnRed,
                backgroundColor:
                  selectedPeriod === 24 && isTimeFilterActive ? hrsFilterBtnRed : 'white',
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
                color: selectedPeriod === 48 && isTimeFilterActive ? 'white' : hrsFilterBtnBlue,
                backgroundColor:
                  selectedPeriod === 48 && isTimeFilterActive ? hrsFilterBtnBlue : 'white',
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
                color: selectedPeriod === 72 && isTimeFilterActive ? 'white' : '#228B22',
                backgroundColor: selectedPeriod === 72 && isTimeFilterActive ? '#228B22' : 'white',
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
                      key={user.personId}
                      handleOpenTaskNotificationModal={handleOpenTaskNotificationModal}
                      handleMarkAsDoneModal={handleMarkAsDoneModal}
                      handleRemoveFromTaskModal={handleRemoveFromTaskModal}
                      handleTaskModalOption={handleTaskModalOption}
                      userRole={displayUser.role}
                      updateTaskStatus={updateTaskStatus}
                      userId={displayUser._id}
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
                      />
                      {timeEntriesList.length > 0 &&
                        timeEntriesList
                          .filter(timeEntry => timeEntry.personId === user.personId)
                          .map(timeEntry => (
                            <tr className="table-row" key={timeEntry._id}>
                              <td colSpan={3} style={{ padding: 0 }}>
                                <TimeEntry 
                                  fromTaskTab
                                  data={timeEntry}
                                  key={timeEntry._id}
                                  timeEntryUserProfile={timeEntry.userProfile}
                                />
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
  authUser: state.auth.user.userid,
  displayUser: state.userProfile,
  isLoading: state.teamMemberTasks.isLoading,
  usersWithTasks: state.teamMemberTasks.usersWithTasks,
  usersWithTimeEntries: state.teamMemberTasks.usersWithTimeEntries,
});

export default connect(mapStateToProps, null)(TeamMemberTasks);
