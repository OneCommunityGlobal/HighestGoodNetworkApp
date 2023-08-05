import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCircle, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import CopyToClipboard from 'components/common/Clipboard/CopyToClipboard';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Table, Progress } from 'reactstrap';

import { Link } from 'react-router-dom';
import { getProgressColor, getProgressValue } from '../../utils/effortColors';
import hasPermission from 'utils/permissions';
import './style.css';
import ReactTooltip from 'react-tooltip';
import { boxStyle } from 'styles';

const TeamMemberTask = React.memo(({
  user,
  handleMarkAsDoneModal,
  handleRemoveFromTaskModal,
  handleOpenTaskNotificationModal,
  handleTaskModalOption,
  userRole,
  roles,
  userPermissions,
}) => {
  const [infoTaskIconModal, setInfoTaskIconModal] = useState(false);

  const infoTaskIconContent = `Red Bell Icon: When clicked, this will show any task changes\n
  Green Checkmark Icon: When clicked, this will mark the task as completed\n
  X Mark Icon: When clicked, this will remove the user from that task`;

  let totalHoursLogged = 0;
  let totalHoursRemaining = 0;
  const thisWeekHours = user.totaltangibletime_hrs;
  const rolesAllowedToResolveTasks = ['Administrator', 'Owner'];
  const isAllowedToResolveTasks = rolesAllowedToResolveTasks.includes(userRole);

  if (user.tasks) {
    user.tasks = user.tasks.map(task => {
      task.hoursLogged = task.hoursLogged ? task.hoursLogged : 0;
      task.estimatedHours = task.estimatedHours ? task.estimatedHours : 0;
      return task;
    });
    totalHoursLogged = user.tasks
      .map(task => task.hoursLogged)
      .reduce((previousValue, currentValue) => previousValue + currentValue, 0);
    for (const task of user.tasks) {
      if (task.status !== 'Complete' && task.isAssigned !== 'false') {
        totalHoursRemaining = totalHoursRemaining + (task.estimatedHours - task.hoursLogged);
      }
    }
  }

  const toggleInfoTaskIconModal = () => {
    setInfoTaskIconModal(!infoTaskIconModal);
  };

  const handleModalOpen = () => {
    setInfoTaskIconModal(true);
  };

  const hasRemovePermission = hasPermission(userRole, 'removeUserFromTask', roles, userPermissions);

  return (
    <>
      <tr className="table-row" key={user.personId}>
        {/* green if member has met committed hours for the week, red if not */}
        <td>
          <div className="committed-hours-circle">
            <FontAwesomeIcon
              style={{
                color: user.totaltangibletime_hrs >= user.weeklycommittedHours ? 'green' : 'red',
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
                          <div>
                            <Link to={task.projectId ? `/wbs/tasks/${task._id}` : '/'}>
                              <span>{`${task.num} ${task.taskName}`} </span>
                            </Link>
                            <CopyToClipboard writeText={task.taskName} message="Task Copied!" />
                            {task.taskNotifications.length > 0 &&
                            task.taskNotifications.some(
                              notification =>
                                notification.hasOwnProperty('userId') &&
                                notification.userId === user.personId,
                            ) ? (
                              <>
                                <FontAwesomeIcon
                                  className="team-member-tasks-bell"
                                  title="Task Info Changes"
                                  icon={faBell}
                                  onClick={() => {
                                    const taskNotificationId = task.taskNotifications.filter(
                                      taskNotification => {
                                        if (taskNotification.userId === user.personId) {
                                          return taskNotification;
                                        }
                                      },
                                    );
                                    handleOpenTaskNotificationModal(
                                      user.personId,
                                      task,
                                      taskNotificationId,
                                    );
                                  }}
                                />
                              </>
                            ) : null}
                            {isAllowedToResolveTasks && (
                              <FontAwesomeIcon
                                className="team-member-tasks-done"
                                icon={faCheck}
                                title="Mark as Done"
                                onClick={() => {
                                  handleMarkAsDoneModal(user.personId, task);
                                  handleTaskModalOption('Checkmark');
                                }}
                              />
                            )}
                            {hasRemovePermission && (
                              <FontAwesomeIcon
                                className="team-member-task-remove"
                                icon={faTimes}
                                title="Remove User from Task"
                                onClick={() => {
                                  handleRemoveFromTaskModal(user.personId, task);
                                  handleTaskModalOption('XMark');
                                }}
                              />
                            )}
                            <i
                              className="fa fa-info-circle"
                              style={{ cursor: 'pointer', marginLeft: '10px' }}
                              data-tip
                              data-for="taskIconTip"
                              aria-hidden="true"
                              onClick={() => {
                                handleModalOpen();
                              }}
                            />
                            <ReactTooltip id="taskIconTip" place="bottom" effect="solid">
                              Click this icon to learn about the task icons
                            </ReactTooltip>
                            <Modal isOpen={infoTaskIconModal} toggle={toggleInfoTaskIconModal}>
                              <ModalHeader toggle={toggleInfoTaskIconModal}>
                                Task Icons Info
                              </ModalHeader>
                              <ModalBody>
                                {infoTaskIconContent.split('\n').map((item, i) => (
                                  <p key={i}>{item}</p>
                                ))}
                              </ModalBody>
                              <ModalFooter>
                                <Button
                                  onClick={toggleInfoTaskIconModal}
                                  color="secondary"
                                  className="float-left"
                                  style={boxStyle}
                                >
                                  {' '}
                                  Ok{' '}
                                </Button>
                              </ModalFooter>
                            </Modal>
                          </div>
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
                      </tr>
                    );
                  }
                })}
            </tbody>
          </Table>
        </td>
      </tr>
    </>
  );
});

export default TeamMemberTask;