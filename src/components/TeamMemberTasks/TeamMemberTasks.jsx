/* eslint-disable max-len */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-plusplus */
/* eslint-disable indent */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Table, Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import moment from 'moment';
import _ from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faCircle, faBell } from '@fortawesome/free-solid-svg-icons';

import './style.css';
import httpService from '../../services/httpService';
import { ENDPOINTS } from '../../utils/URL';
import { fetchAllManagingTeams } from '../../actions/team';
import { getUserProfile } from '../../actions/userProfile';
import Loading from '../common/Loading';
import DiffedText from './DiffedText';
import EditTaskModal from 'components/Projects/WBS/WBSDetail/EditTask/EditTaskModal';
import { getTeamMemberTasksData } from './selectors';

const TeamMemberTasks = props => {
  const [fetched, setFetched] = useState(false);
  const [teams, setTeams] = useState([]);
  const [taskNotificationModal, setTaskNotificationModal] = useState(false);
  const [currentTaskNotifications, setCurrentTaskNotifications] = useState([]);

  const { tasks } = useSelector(getTeamMemberTasksData);

  const dispatch = useDispatch();

  const setTaskNotifications = taskNotifications => {
    setCurrentTaskNotifications(taskNotifications);
  };

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
      setTaskNotifications([]);
      toggleTaskNotificationModal();
    });
  };

  const toggleTaskNotificationModal = () => {
    setTaskNotificationModal(!taskNotificationModal);
  };

  const handleOpenTaskNotificationModal = taskNotifications => {
    setCurrentTaskNotifications(taskNotifications);
    toggleTaskNotificationModal();
  };

  useEffect(() => {dispatch(fetchTeamMembersTask), []});

  // console.log('teams: ', teams);

  let teamsList = [];
  if (teams && teams.length > 0) {
    teamsList = teams.map((member, index) => (
      <tr key={index}>
        {/* green if member has met committed hours for the week, red if not */}
        <td>
          {/* console.log('member ', member) */}
          {member.hoursCurrentWeek >= member.weeklyComittedHours ? (
            <FontAwesomeIcon style={{ color: 'green' }} icon={faCircle} />
          ) : (
            <FontAwesomeIcon style={{ color: 'red' }} icon={faCircle} />
          )}
        </td>
        <td>
          <Link to={`/userprofile/${member._id}`}>{`${member.firstName} ${member.lastName}`}</Link>
        </td>
        <td>{`${member.weeklyCommittedHours} / ${member.hoursCurrentWeek}`}</td>
        <td>
          {member.tasks &&
            member.tasks.map((task, index) => (
              <>
                <p key={`${task._id}${index}`}>
                  <Link
                    key={index}
                    to={task.projectId ? `/wbs/tasks/${task.wbsId}/${task.projectId}` : '/'}
                  >
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
                <FontAwesomeIcon 
                  style={{ color: 'red' }} icon={faBell} 
                  onClick={() => handleOpenTaskNotificationModal()}
                  />
              </>
            ))}
        </td>
        <td>tempprogress</td>
      </tr>
    ));
  }

  return (
    <React.Fragment>
      <div className="container team-member-tasks">
        {!fetched ? <Loading /> : null}
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
          <tbody>{teamsList}</tbody>
        </Table>
      </div>
    </React.Fragment>
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