/* eslint-disable max-len */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-plusplus */
/* eslint-disable indent */
import { faBell, faCircle, faClock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fetchTeamMembersTask, deleteTaskNotification } from 'actions/task';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Table } from 'reactstrap';
import httpService from '../../services/httpService';
import { ENDPOINTS } from '../../utils/URL';
import Loading from '../common/Loading';
import { TaskDifferenceModal } from './components/TaskDifferenceModal';
import { getTeamMemberTasksData } from './selectors';
import './style.css';

const TeamMemberTasks = () => {
  const [showTaskNotificationModal, setTaskNotificationModal] = useState(false);
  const [currentTaskNotifications, setCurrentTaskNotifications] = useState([]);
  const [currentTask, setCurrentTask] = useState();
  const [currentUserId, setCurrentUserId] = useState();

  const { isLoading, usersWithTasks } = useSelector(getTeamMemberTasksData);

  const dispatch = useDispatch();
  useEffect(() => {dispatch(fetchTeamMembersTask())}, []);

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
    if (usersWithTasks && usersWithTasks.length > 0) {
      teamsList = usersWithTasks.map((user, index) => (
        <tr key={user.personId}>
          {/* green if member has met committed hours for the week, red if not */}
          <td>
              <FontAwesomeIcon style={{ color: user.totaltangibletime_hrs >= user.weeklyComittedHours ? 'green' : 'red' }} icon={faCircle} />
          </td>
          <td>
            <Link to={`/userprofile/${user.personId}`}>{`${user.name}`}</Link>
          </td>
          <td>{`${user.weeklyComittedHours ? user.weeklyComittedHours : 0} / ${user.totaltangibletime_hrs.toFixed(0)}`}</td>
          <td>
            {user.tasks &&
              user.tasks.map((task) => (
                task.wbsId && task.projectId &&
                  <p key={`${task._id}`}>
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
              ))}
          </td>
          <td>tempprogress</td>
        </tr>
      ));
    }
    return teamsList;
  }

  return (
    <div className="container team-member-tasks">
      <h1>Team Member Tasks</h1>
      <TaskDifferenceModal isOpen={showTaskNotificationModal} taskNotifications={currentTaskNotifications} task={currentTask} userId={currentUserId} toggle={handleOpenTaskNotificationModal} onApprove={handleTaskNotificationRead} />
      <Table>
        <thead>
          <tr>
            {/* Empty column header for hours completed icon */}
            <th />
            <th>Team Member</th>
            <th width="100px">
              <FontAwesomeIcon icon={faClock} title="Weekly Committed Hours" />
              /
              <FontAwesomeIcon
                style={{ color: 'green' }}
                icon={faClock}
                title="Weekly Completed Hours"
              />
            </th>
            <th>Tasks(s)</th>
            <th>Progress</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? <Loading /> : renderTeamsList()}
        </tbody>
      </Table>
    </div>
  );
};

export default TeamMemberTasks;
