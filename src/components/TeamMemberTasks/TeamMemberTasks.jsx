import { faBell, faCircle, faClock, faCheck } from '@fortawesome/free-solid-svg-icons';
import { Table, Progress } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fetchTeamMembersTask, deleteTaskNotification } from 'actions/task';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector, connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Loading from '../common/Loading';
import { TaskDifferenceModal } from './components/TaskDifferenceModal';
import { getTeamMemberTasksData } from './selectors';
import { getUserProfile } from '../../actions/userProfile';
import './style.css';
import { getProgressColor, getProgressValue } from '../../utils/effortColors';
import { fetchAllManagingTeams } from '../../actions/team';
import EffortBar from 'components/Timelog/EffortBar';
import TimeEntry from 'components/Timelog/TimeEntry';
import { updateTask } from 'actions/task';
import { getAllUserProfile } from 'actions/userManagement';
import TaskCompletedModal from './components/TaskCompletedModal';
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';
import { fetchAllTasks } from 'actions/task';
import { deleteSelectedTask } from './reducer';
import { rest } from 'lodash';

const TeamMemberTasks = props => {
  const [isTimeLogActive, setIsTimeLogActive] = useState(0);
  const [timeLogOpen, setTimeLogOpen] = useState(false);
  const [showTaskNotificationModal, setTaskNotificationModal] = useState(false);
  const [currentTaskNotifications, setCurrentTaskNotifications] = useState([]);
  const [currentTask, setCurrentTask] = useState();
  const [currentUserId, setCurrentUserId] = useState('');
  const { isLoading, usersWithTasks } = useSelector(getTeamMemberTasksData);
  const [tasks, setTasks] = useState();
  const [updatedTasks, setUpdatedTasks] = useState([]);
  const [showMarkAsDoneModal, setMarkAsDoneModal] = useState(false);
  const [clickedToShowModal, setClickedToShowModal] = useState(false);
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
    //Passed the userid as argument to fetchTeamMembersTask
    //the fetchTeamMembersTask has a function inside id that gets the userId from the store, like the last part of the userId variable in this file
    //so, before it gets from the store, it'll see if the userId is provided.
    //It works because the userId first looks for the url param. If it gets the param, it will provide it to the userId
    //after that, fetchTeamMembersTask will look for the team member's tasks of the provided userId
    //fetch current user's role, so it can be displayed. It will only happen if the current user's id is different of the auth user id
    //if it's not differente, it'll attribute the current authenticated user's role.
    //also, the userId is different from the authenticated user, it will call the fetchTeamMmbersTask with the currently authenticated user id
    if (userId !== props.auth.user.userid) {
      dispatch(fetchTeamMembersTask(userId, props.auth.user.userid));
      const currentUserRole = getUserRole(userId)
        .then(resp => resp)
        .then(user => {
          setUserRole(user.data.role);
        });
    } else {
      dispatch(fetchTeamMembersTask(userId, null));
      setUserRole(props.auth.user.role);
    }
  }, []);

  useEffect(() => {
    if (clickedToShowModal) {
      setMarkAsDoneModal(true);
    }
  }, [currentUserId]);

  useEffect(() => {
    submitTasks();
    if (userId !== props.auth.user.userid) {
      dispatch(fetchTeamMembersTask(userId, props.auth.user.userid));
      const currentUserRole = getUserRole(userId)
        .then(resp => resp)
        .then(user => {
          setUserRole(user.data.role);
        });
    } else {
      dispatch(fetchTeamMembersTask(userId, null));
      setUserRole(props.auth.user.role);
    }
  }, [updatedTasks]);

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

  const renderTeamsList = () => {
    let teamsList = [];
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

      teamsList = filteredMembers.map((user, index) => {
        let totalHoursLogged = 0;
        let totalHoursRemaining = 0;
        const thisWeekHours = user.totaltangibletime_hrs;
        if (user.tasks) {
          user.tasks = user.tasks.map(task => {
            task.hoursLogged = task.hoursLogged ? task.hoursLogged : 0;
            task.estimatedHours = task.estimatedHours ? task.estimatedHours : 0;
            return task;
          });
          totalHoursLogged = user.tasks
            .map(task => task.hoursLogged)
            .reduce((previousValue, currentValue) => previousValue + currentValue, 0);
          if (
            user.tasks.length === 1 &&
            (user.tasks[0].estimatedHours === 0 ||
              (user.tasks[0].resources && user.tasks[0].resources[0].completedTask))
          ) {
            totalHoursRemaining = 0;
          } else {
            for (const task of user.tasks) {
              if (task.status !== 'Complete' && task.isAssigned !== 'false') {
                totalHoursRemaining =
                  totalHoursRemaining + (task.estimatedHours - task.hoursLogged);
              }
            }
          }
        }

        const TaskButton = task => {
          if (task.task.status !== 'Complete') {
            return (
              <td>
                <h3
                  onClick={() => markAsDone(task)}
                  style={{ color: 'red' }}
                  data-toggle="tooltip"
                  data-placement="top"
                  title="MARK AS DONE. MARKING THIS AS DONE WOULD REMOVE THE TASK PERMANENTLY."
                  className="markAsDoneButton"
                >
                  X
                </h3>
              </td>
            );
          } else {
            return <td></td>;
          }
        };

        const markAsDone = async task => {
          task.task.status = 'Complete';
          const updatedTask = {
            taskName: task.task.taskName,
            priority: task.task.priority,
            resources: task.task.resources,
            isAssigned: task.task.isAssigned,
            status: task.task.status,
            hoursBest: parseFloat(task.task.hoursBest),
            hoursWorst: parseFloat(task.task.hoursWorst),
            hoursMost: parseFloat(task.task.hoursMost),
            estimatedHours: parseFloat(task.task.hoursEstimate),
            startedDatetime: task.task.startedDate,
            dueDatetime: task.task.dueDate,
            links: task.task.links,
            whyInfo: task.task.whyInfo,
            intentInfo: task.task.intentInfo,
            endstateInfo: task.task.endstateInfo,
            classification: task.task.classification,
          };
          await updateTask(String(task.task._id), updatedTask);
          await deleteSelectedTask(task.task._id, task.task.mother);
          await dispatch(getAllUserProfile());
          await fetchAllTasks();
        };

        return (
          <tr className="table-row" key={user.personId}>
            {/* green if member has met committed hours for the week, red if not */}
            <td>
              <div className="committed-hours-circle">
                <FontAwesomeIcon
                  style={{
                    color:
                      user.totaltangibletime_hrs >= user.weeklycommittedHours ? 'green' : 'red',
                  }}
                  icon={faCircle}
                />
              </div>
            </td>
            <td>
              <Table borderless className="team-member-tasks-subtable">
                <tbody>
                  <tr>
                    <td className="team-member-tasks-user-name">
                      <Link to={`/userprofile/${user.personId}`}>{`${user.name}`}</Link>
                    </td>
                    <td data-label="Time" className="team-clocks">
                      <u>{user.weeklycommittedHours ? user.weeklycommittedHours : 0}</u> /
                      <font color="green"> {thisWeekHours ? thisWeekHours.toFixed(1) : 0}</font> /
                      <font color="red">
                        {' '}
                        {totalHoursRemaining ? totalHoursRemaining.toFixed(1) : 0}
                      </font>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2}>
                      {timeLogOpen && (
                        <div>
                          <EffortBar activeTab={0} projectsSelected={['all']} />
                          <TimeEntry data={1} displayYear={0} userProfile={0} />
                        </div>
                      )}
                    </td>
                  </tr>
                </tbody>
              </Table>
            </td>
            <td>
              <Table borderless className="team-member-tasks-subtable">
                <tbody>
                  {user.tasks &&
                    user.tasks.map((task, index) => {
                      let isActiveTaskForUser = true;
                      if (task?.resources) {
                        isActiveTaskForUser = !task.resources?.find(
                          resource => resource.userID === user.personId,
                        ).completedTask;
                      }
                      if (task.wbsId && task.projectId && isActiveTaskForUser) {
                        return (
                          <tr key={`${task._id}${index}`} className="task-break">
                            <td data-label="Task(s)" className="task-align">
                              <p>
                                <Link to={task.projectId ? `/wbs/tasks/${task._id}` : '/'}>
                                  <span>{`${task.num} ${task.taskName}`} </span>
                                </Link>
                                {task.taskNotifications.length > 0 && (
                                  <FontAwesomeIcon
                                    className="team-member-tasks-bell"
                                    icon={faBell}
                                    onClick={() => {
                                      handleOpenTaskNotificationModal(
                                        user.personId,
                                        task,
                                        task.taskNotifications,
                                      );
                                    }}
                                  />
                                )}
                                <FontAwesomeIcon
                                  className="team-member-tasks-done"
                                  icon={faCheck}
                                  title="Mark as Done"
                                  onClick={() => {
                                    handleMarkAsDoneModal(user.personId, task);
                                  }}
                                />
                              </p>
                            </td>
                            {task.hoursLogged != null && task.estimatedHours != null && (
                              <td data-label="Progress" className="team-task-progress">
                                <div>
                                  <span>
                                    {`${parseFloat(task.hoursLogged.toFixed(2))}
                                  of 
                                ${parseFloat(task.estimatedHours.toFixed(2))}`}
                                  </span>
                                  <Progress
                                    color={getProgressColor(
                                      task.hoursLogged,
                                      task.estimatedHours,
                                      true,
                                    )}
                                    value={getProgressValue(task.hoursLogged, task.estimatedHours)}
                                  />
                                </div>
                              </td>
                            )}
                            {userRole === 'Administrator' ? (
                              <td data-label="Status">
                                <TaskButton task={task}></TaskButton>
                              </td>
                            ) : null}
                          </tr>
                        );
                      }
                    })}
                </tbody>
              </Table>
            </td>
          </tr>
        );
      });
    }

    return teamsList;
  };

  return (
    <div className="container team-member-tasks">
      <header className="header-box">
        <h1>Team Member Tasks</h1>
        <div className="hours-btn-container">
          <button
            type="button"
            className="circle-border"
            title="Timelogs submitted in the past 24 hours"
            style={
              isTimeLogActive === 0 || isTimeLogActive === 1
                ? { backgroundColor: '#ffebcd' }
                : { backgroundColor: 'white' }
            }
            onClick={() => {
              setTimeLogOpen(!timeLogOpen);
              if (isTimeLogActive === 1) {
                setIsTimeLogActive(0);
              } else {
                setIsTimeLogActive(1);
              }
            }}
          >
            24h
          </button>
          <button
            type="button"
            className="circle-border"
            title="Timelogs submitted in the past 48 hours"
            style={
              isTimeLogActive === 0 || isTimeLogActive === 2
                ? { backgroundColor: '#f0ffff' }
                : { backgroundColor: 'white' }
            }
            onClick={() => {
              setTimeLogOpen(!timeLogOpen);
              if (isTimeLogActive === 2) {
                setIsTimeLogActive(0);
              } else {
                setIsTimeLogActive(2);
              }
            }}
          >
            48h
          </button>
          <button
            type="button"
            className="circle-border"
            title="Timelogs submitted in the past 72 hours"
            style={
              isTimeLogActive === 0 || isTimeLogActive === 3
                ? { backgroundColor: 'lightgray' }
                : { backgroundColor: 'white' }
            }
            onClick={() => {
              setTimeLogOpen(!timeLogOpen);
              if (isTimeLogActive === 3) {
                setIsTimeLogActive(0);
              } else {
                setIsTimeLogActive(3);
              }
            }}
          >
            72h
          </button>
        </div>
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
          deleteSelectedTask={deleteSelectedTask}
          userId={currentUserId}
          task={currentTask}
          setCurrentUserId={setCurrentUserId}
          setClickedToShowModal={setClickedToShowModal}
        />
      )}
      <div className='table-container'>
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

        <tbody>{isLoading ? <Loading /> : renderTeamsList()}</tbody>
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
