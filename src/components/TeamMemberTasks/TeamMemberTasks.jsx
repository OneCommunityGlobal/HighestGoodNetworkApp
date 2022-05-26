/* eslint-disable max-len */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-plusplus */
/* eslint-disable indent */
import { faBell, faCircle, faClock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fetchTeamMembersTask } from 'actions/task';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Table } from 'reactstrap';
import httpService from '../../services/httpService';
import { ENDPOINTS } from '../../utils/URL';
import Loading from '../common/Loading';
import { getTeamMemberTasksData } from './selectors';
import './style.css';


const TeamMemberTasks = () => {
  const [taskNotificationModal, setTaskNotificationModal] = useState(false);
  const [currentTaskNotifications, setCurrentTaskNotifications] = useState([]);

  const { isLoading, usersWithTasks } = useSelector(getTeamMemberTasksData);
  // console.log(teams);

  const dispatch = useDispatch();

  const handleTaskNotificationRead = () => {
    const taskReadPromises = [];
    const userId = currentTaskNotifications[0].recipient;
    currentTaskNotifications.forEach(notification => {
      taskReadPromises.push(
        httpService.post(ENDPOINTS.MARK_TASK_NOTIFICATION_READ(notification._id)),
      );
    });

    Promise.all(taskReadPromises).then(data => {
      console.log('read tasks');
      const newTeamsState = [];
      teams.forEach(member => {
        if (member._id === userId) {
          newTeamsState.push({ ...member, taskNotifications: [] });
        } else {
          newTeamsState.push(member);
        }
      });
      setTeams(newTeamsState);
      setCurrentTaskNotifications([]);
      setTaskNotificationModal(!taskNotificationModal);
    });
  };

  const handleOpenTaskNotificationModal = taskNotifications => {
    setCurrentTaskNotifications(taskNotifications);
    setTaskNotificationModal(!taskNotificationModal);
  };

  useEffect(() => {dispatch(fetchTeamMembersTask())}, []);

  let teamsList = [];
  if (usersWithTasks && usersWithTasks.length > 0) {
    teamsList = usersWithTasks.map((user, index) => (
      <tr key={user._id}>
        {/* green if member has met committed hours for the week, red if not */}
        <td>
          {/* console.log('member ', member) */}
            <FontAwesomeIcon style={{ color: user.hoursCurrentWeek >= user.weeklyComittedHours ? 'green' : 'red' }} icon={faCircle} />
        </td>
        <td>
          <Link to={`/userprofile/${user._id}`}>{`${user.firstName} ${user.lastName}`}</Link>
        </td>
        <td>{`${user.weeklyComittedHours} / ${user.hoursCurrentWeek}`}</td>
        <td>
          {user.tasks &&
            user.tasks.map((task, index) => (
              <>
                <p key={`${task._id}${index}`}>
                  <Link key={index} to={task.projectId ? `/wbs/tasks/${task.wbsId}/${task.projectId}` : '/'}>
                    <span>{`${task.num} ${task.taskName}`} </span>
                  </Link>
                  
                  {/* <span>
                      {member.taskNotifications.find(notification => {
                        return notification.taskId === task._id
                      }) ? (
                        <FontAwesomeIcon
                          style={{ color: 'red' }}
                          icon={faBell}
                          onClick={() => {
                            handleOpenTaskNotificationModal(member.taskNotifications);
                          }}
                        />
                      ) : null}
                    </span> */}
                </p>
                <FontAwesomeIcon style={{ color: 'red' }} icon={faBell} onClick={handleOpenTaskNotificationModal}/>
              </>
            ))}
        </td>
        <td>tempprogress</td>
      </tr>
  ));
  }

  return (
      <div className="container team-member-tasks">
        <h1>Team Member Tasks</h1>
        <div className="row">
          {/* <EditTaskModal
            key={`editTask_${task._id}`}
            parentNum={task.num}
            taskId={task._id}
            wbsId={task.wbsId}
            parentId1={task.parentId1}
            parentId2={task.parentId2}
            parentId3={task.parentId3}
            mother={task.mother}
            level={task.level}
          /> */}
          {/* <Modal isOpen={taskNotificationModal} toggle={handleOpenTaskNotificationModal} size="xl">
            <ModalHeader toggle={handleOpenTaskNotificationModal}>Task Info Changes</ModalHeader>
            <ModalBody>
              {currentTaskNotifications.length > 0
                ? currentTaskNotifications.map((notification, index) => (
                    <React.Fragment key={notification.id}>
                      <h4>{`${notification.taskNum} ${notification.taskName}`}</h4>
                      <Table striped>
                        <thead>
                          <tr>
                            <th></th>
                            <th>Previous</th>
                            <th>New</th>
                            <th>Difference</th>
                          </tr>
                        </thead>
                        <tbody>
                          {notification.oldTaskInfos.oldWhyInfo !==
                          notification.newTaskInfos.newWhyInfo ? (
                            <tr>
                              <th>Why Task is Important</th>
                              <td>{notification.oldTaskInfos.oldWhyInfo}</td>
                              <td>{notification.newTaskInfos.newWhyInfo}</td>
                              <td>
                                <DiffedText
                                  oldText={notification.oldTaskInfos.oldWhyInfo}
                                  newText={notification.newTaskInfos.newWhyInfo}
                                />
                              </td>
                            </tr>
                          ) : null}
                          {notification.oldTaskInfos.oldIntentInfo !==
                          notification.newTaskInfos.newIntentInfo ? (
                            <tr>
                              <th>Intent of Task</th>
                              <td>{notification.oldTaskInfos.oldIntentInfo}</td>
                              <td>{notification.newTaskInfos.newIntentInfo}</td>
                              <td>
                                <DiffedText
                                  oldText={notification.oldTaskInfos.oldIntentInfo}
                                  newText={notification.newTaskInfos.newIntentInfo}
                                />
                              </td>
                            </tr>
                          ) : null}
                          {notification.oldTaskInfos.oldEndstateInfo !==
                          notification.newTaskInfos.newEndstateInfo ? (
                            <tr>
                              <th>Task Endstate</th>
                              <td>{notification.oldTaskInfos.oldEndstateInfo}</td>
                              <td>{notification.newTaskInfos.newEndstateInfo}</td>
                              <td>
                                <DiffedText
                                  oldText={notification.oldTaskInfos.oldEndstateInfo}
                                  newText={notification.newTaskInfos.newEndstateInfo}
                                />
                              </td>
                            </tr>
                          ) : null}
                        </tbody>
                      </Table>
                    </React.Fragment>
                  ))
                : null}
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onClick={handleTaskNotificationRead}>
                Okay
              </Button>
            </ModalFooter>
          </Modal> */}
        </div>
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
          <tbody>{isLoading ? <Loading /> : teamsList}</tbody>
        </Table>
      </div>
  );
};

export default TeamMemberTasks;
