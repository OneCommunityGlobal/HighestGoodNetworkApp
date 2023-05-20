import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCircle, faCheck } from '@fortawesome/free-solid-svg-icons';
import TaskButton from './TaskButton';
import CopyToClipboard from 'components/common/Clipboard/CopyToClipboard';
import { Table, Progress } from 'reactstrap';
import { Link } from 'react-router-dom';
import { getProgressColor, getProgressValue } from '../../utils/effortColors';
import './style.css';

const TeamMemberTask = ({
  user,
  handleMarkAsDoneModal,
  handleOpenTaskNotificationModal,
  userRole,
}) => {
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
                          <p>
                            <Link to={task.projectId ? `/wbs/tasks/${task._id}` : '/'}>
                              <span>{`${task.num} ${task.taskName}`} </span>
                            </Link>
                            <CopyToClipboard 
                              writeText={task.taskName} 
                              message="Task Copied!"
                            />
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
                            {isAllowedToResolveTasks && (
                              <FontAwesomeIcon
                                className="team-member-tasks-done"
                                icon={faCheck}
                                title="Mark as Done"
                                onClick={() => {
                                  handleMarkAsDoneModal(user.personId, task);
                                }}
                              />
                            )}
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
                            <TaskButton task={task} key={task._id}></TaskButton>
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
    </>
  );
};

export default TeamMemberTask;
