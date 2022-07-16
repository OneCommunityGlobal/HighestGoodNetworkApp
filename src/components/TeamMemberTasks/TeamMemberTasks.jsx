/* eslint-disable max-len */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-plusplus */
/* eslint-disable indent */
import { faBell, faCircle, faClock } from '@fortawesome/free-solid-svg-icons';
import { Table, Progress, TabPane } from 'reactstrap';
import _ from 'lodash';
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
import { getcolor } from '../../utils/effortColors'
import { fetchAllManagingTeams } from '../../actions/team';
import  EffortBar  from '../../components/Timelog/EffortBar';
import TimeEntry from 'components/Timelog/TimeEntry';




const TeamMemberTasks = (props) => {
  const [timeLogOpen, setTimeLogOpen] = useState(false);
  const [showTaskNotificationModal, setTaskNotificationModal] = useState(false);
  const [currentTaskNotifications, setCurrentTaskNotifications] = useState([]);
  const [currentTask, setCurrentTask] = useState();
  const [currentUserId, setCurrentUserId] = useState();
  const { isLoading, usersWithTasks } = useSelector(getTeamMemberTasksData);
  const dispatch = useDispatch();
  useEffect(() => {dispatch(fetchTeamMembersTask())}, []);

  const userRole = props.auth.user.role;

  const handleOpenTaskNotificationModal = (userId, task, taskNotifications = []) => {
    setCurrentUserId(userId);
    setCurrentTask(task);
    setCurrentTaskNotifications(taskNotifications);
    setTaskNotificationModal(!showTaskNotificationModal);
  };
  
  const handleTaskNotificationRead = (userId, taskId, taskNotificationId) => {

    dispatch(deleteTaskNotification(userId, taskId, taskNotificationId));
    handleOpenTaskNotificationModal();

    // const taskReadPromises = [];
    // const userId = currentTaskNotifications[0].recipient;
    // currentTaskNotifications.forEach(notification => {
    //   taskReadPromises.push(
    //     httpService.post(ENDPOINTS.MARK_TASK_NOTIFICATION_READ(notification._id)),
    //   );
    // });

    // Promise.all(taskReadPromises).then(data => {
    //   console.log('read tasks');
    //   const newTeamsState = [];
    //   teams.forEach(member => {
    //     if (member._id === userId) {
    //       newTeamsState.push({ ...member, taskNotifications: [] });
    //     } else {
    //       newTeamsState.push(member);
    //     }
    //   });
    //   setTeams(newTeamsState);
    //   setCurrentTaskNotifications([]);
    //   setTaskNotificationModal(!showTaskNotificationModal);
    // });
  };

  const renderTeamsList = () => {
    let teamsList = [];

    console.log(usersWithTasks);
    if (usersWithTasks && usersWithTasks.length > 0) {
      // give different users different views
      const filteredMembers = usersWithTasks.filter(member => {
        if (userRole === "Volunteer" || userRole === "Core Team") {
          return member.role === "Volunteer" || member.role === "Core Team";
        } else if (userRole === "Manager" || userRole === "Mentor") {
          return member.role === "Volunteer" || member.role === "Core Team" || 
          member.role === "Manager" || member.role === "Mentor";
        } else {
          return member;
        }
      })

      teamsList = filteredMembers.map((user, index) => {
        let totalHoursLogged = 0;
        let totalHoursRemaining = 0;
        if (user.tasks) {
          user.tasks = user.tasks.map(task => {
            task.hoursLogged = task.hoursLogged ? task.hoursLogged : 0;
            task.estimatedHours = task.estimatedHours ? task.estimatedHours : 0;
            return task;
          });
          totalHoursLogged = user.tasks
            .map((task) => task.hoursLogged)
            .reduce((previousValue, currentValue) => previousValue + currentValue, 0);
          totalHoursRemaining = user.tasks
            .map((task) => task.estimatedHours - task.hoursLogged)
            .reduce((previousValue, currentValue) => previousValue + currentValue, 0);
        }
        return (
        <tr key={user.personId}>
          {/* green if member has met committed hours for the week, red if not */}
          <td>
              <FontAwesomeIcon style={{ color: user.totaltangibletime_hrs >= user.weeklyComittedHours ? 'green' : 'red' }} icon={faCircle} />
          </td>
          <td>
            <Link to={`/userprofile/${user.personId}`}>{`${user.name}`}</Link>
            {timeLogOpen ?
            <div>
            <EffortBar
              activeTab={0}
              projectsSelected={['all']}
            />
            <TimeEntry
              data={1}
              displayYear={0}
              userProfile={0}
               />
            </div> : ""}

          </td>
          <td className='team-clocks'>
            <u>{user.weeklyComittedHours ? user.weeklyComittedHours : 0}</u> / 
            <font color="green"> {Math.round(totalHoursLogged)}</font> / 
            <font color="red"> {Math.round(totalHoursRemaining)}</font>
          </td>
          <td>
            <Table borderless className='team-member-tasks-subtable'>
              <tbody>
                {user.tasks &&
                user.tasks.map((task, index) => (
                  task.wbsId && task.projectId &&
                  <tr key={`${task._id}${index}`} className='task-break'>
                    <td className='task-align'>
                      <p>
                        <Link to={task.projectId ? `/wbs/tasks/${task.wbsId}/${task.projectId}/${task._id}` : '/'}>
                          <span>{`${task.num} ${task.taskName}`} </span>
                        </Link>
                        {
                          task.taskNotifications.length > 0 &&
                          <FontAwesomeIcon
                            className="team-member-tasks-bell"
                            icon={faBell}
                            onClick={() => {
                              handleOpenTaskNotificationModal(user.personId, task, task.taskNotifications);
                            }}
                            />
                          }
                      </p>
                    </td>
                    {  task.hoursLogged != null && task.estimatedHours != null &&
                      <td className='team-task-hours'>  
                        <div>
                          <span>
                          {`${parseFloat(task.hoursLogged.toFixed(2))} 
                            of 
                          ${parseFloat(task.estimatedHours.toFixed(2))}`}
                          </span>
                          <Progress 
                            color={(task.hoursLogged > task.estimatedHours) ? 
                                  getcolor(0) : 
                                  getcolor(task.estimatedHours - task.hoursLogged)}

                            value={((task.hoursLogged / task.estimatedHours) * 100)}
                            />
                        </div>
                      </td>
                    }
                </tr> 
                ))}
              </tbody>
            </Table>
          </td>            
        </tr>
    )});
    }
    return teamsList;
  }

  return (
    <div className="container team-member-tasks">
      <header className='header-box'>
      <h1>Team Member Tasks</h1>
      <div>
      <button 
        type='button' 
        className="circle-border"
        title='Timelogs submitted in the past 24 hours' 
        style={{ backgroundColor: 'pink' }} 
        onClick={() => {
          setTimeLogOpen(!timeLogOpen)
        }}
        >24h
        </button>
      <button 
        type='button' 
        className='circle-border' 
        title='Timelogs submitted in the past 48 hours' 
        style={{ backgroundColor: 'lightblue' }} 
        onClick={''}
        >48h
        </button>
      <button 
        type='button' 
        className='circle-border' 
        title='Timelogs submitted in the past 72 hours' 
        style={{ backgroundColor: 'lightgray' }} 
        onClick={''}
        >72h
        </button>
      </div>
      </header>
      <TaskDifferenceModal isOpen={showTaskNotificationModal} taskNotifications={currentTaskNotifications} task={currentTask} userId={currentUserId} toggle={handleOpenTaskNotificationModal} onApprove={handleTaskNotificationRead} loggedInUserId={props.auth.user.userid} />
      <Table>
        <thead>
          <tr>
            {/* Empty column header for hours completed icon */}
            <th />
            <th className='team-member-tasks-headers'>Team Member</th>
            <th className='team-member-tasks-headers team-clocks team-clocks-header'>
              <FontAwesomeIcon icon={faClock} title="Weekly Committed Hours" />
              /
              <FontAwesomeIcon
                style={{ color: 'green' }}
                icon={faClock}
                title="Weekly Completed Hours"
              />
              /
              <FontAwesomeIcon
                style={{ color: 'red' }}
                icon={faClock}
                title="Total Remaining Hours"
              />
            </th>
            <th className='team-member-tasks-headers'>
              <Table borderless className='team-member-tasks-subtable'>
                <thead>
                  <tr>
                    <th>Tasks(s)</th>
                    <th className='team-task-hours'>Progress</th>
                  </tr>
                </thead>
              </Table>
            </th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? <Loading /> : renderTeamsList()}
        </tbody>
      </Table>
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
