import { faClock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { Table } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fetchTeamMembersTask, deleteTaskNotification } from 'actions/task';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector, connect } from 'react-redux';
import Loading from '../common/Loading';
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

const TeamMemberTasks = props => {
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

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchTeamMembersTask());
  }, []);

  useEffect(() => {
    if (clickedToShowModal) {
      setMarkAsDoneModal(true);
    }
  }, [currentUserId]);

  useEffect(() => {
    renderTeamsList();
  }, []);

  useEffect(() => {
    submitTasks();
    dispatch(fetchTeamMembersTask());
  }, [updatedTasks]);

  const userRole = props.auth.user.role;
  const userId = props.auth.asUser;

  const closeMarkAsDone = () => {
    setMarkAsDoneModal(false);
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
    setUpdatedTasks(tasks => [...tasks, newTask]);
  };

  const submitTasks = async () => {
    for (let i = 0; i < updatedTasks.length; i += 1) {
      const updatedTask = updatedTasks[i];
      const url = ENDPOINTS.TASK_UPDATE(updatedTask.taskId);
      axios.put(url, updatedTask.updatedTask).catch(err => console.log(err));
    }
  };

  const handleOpenTaskNotificationModal = (userId, task, taskNotifications = []) => {
    setCurrentUserId(userId);
    setCurrentTask(task);
    setCurrentTaskNotifications(taskNotifications);
    setTaskNotificationModal(!showTaskNotificationModal);
  };

  const handleMarkAsDoneModal = (userId, task) => {
    setCurrentUserId(userId);
    setCurrentTask(task);
    setClickedToShowModal(true);
  };

  const handleTaskNotificationRead = (userId, taskId, taskNotificationId) => {
    dispatch(deleteTaskNotification(userId, taskId, taskNotificationId));
    handleOpenTaskNotificationModal();
  };

  const getTimeEntriesForPeriod = async teamList => {
    let newList = [];
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

    const requests = teamList.map(async user => {
      const url = ENDPOINTS.TIME_ENTRIES_PERIOD(user.personId, fromDate, toDate);
      return axios.get(url);
    });
    const responses = await Promise.all(requests);
    for (const response of responses) {
      if (response.data.length > 0) newList.push(...response.data);
    }

    //2. Generate array of past 24/48 hrs timelogs
    newList.map(entry => {
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
    setSeventyTwoHoursTimeEntries([...newList]);
    setFortyEightHoursTimeEntries([...fortyEightList]);
    setTwentyFourHoursTimeEntries([...twentyFourList]);

    if (newList && twentyFourList && fortyEightList) {
      setFinishLoading(true);
    }
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

  const renderTeamsList = () => {
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
                color: selectedPeriod === 24 && isTimeLogActive ? 'white' : '#DC143C',
                backgroundColor: selectedPeriod === 24 && isTimeLogActive ? '#DC143C' : 'white',
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
                color: selectedPeriod === 48 && isTimeLogActive ? 'white' : '#6495ED',
                backgroundColor: selectedPeriod === 48 && isTimeLogActive ? '#6495ED' : 'white',
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
          <Loading />
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
        />
      )}
      <div className="table-container">
        <Table>
          <thead className="pc-component">
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
              <Loading />
            ) : (
              teamList.map(user => {
                if (!isTimeLogActive) {
                  return (
                    <>
                      <TeamMemberTask
                        user={user}
                        key={user.personId}
                        handleOpenTaskNotificationModal={handleOpenTaskNotificationModal}
                        handleMarkAsDoneModal={handleMarkAsDoneModal}
                        userRole={userRole}
                      />
                    </>
                  );
                } else {
                  return (
                    <>
                      <TeamMemberTask
                        user={user}
                        key={user.personId}
                        handleOpenTaskNotificationModal={handleOpenTaskNotificationModal}
                        handleMarkAsDoneModal={handleMarkAsDoneModal}
                        userRole={userRole}
                      />
                      {timeEntriesList.length > 0 &&
                        timeEntriesList
                          .filter(timeEntry => timeEntry.personId === user.personId)
                          .map(timeEntry => (
                            <tr className="table-row">
                              <td colSpan={3} style={{ padding: 0 }}>
                                <FilteredTimeEntries data={timeEntry} key={timeEntry._id} />
                              </td>
                            </tr>
                          ))}
                    </>
                  );
                }
              })
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

const mapStateToProps = state => ({
  auth: state.auth,
  userId: state.userProfile.id,
  managingTeams: state.userProfile.teams,
  teamsInfo: state.managingTeams,
});

export default connect(mapStateToProps, {
  getUserProfile,
  fetchAllManagingTeams,
})(TeamMemberTasks);
