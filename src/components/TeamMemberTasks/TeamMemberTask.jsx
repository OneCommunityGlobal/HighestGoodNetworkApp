import React, { useState, useMemo, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCircle, faCheck, faTimes, faInfo } from '@fortawesome/free-solid-svg-icons';
import TaskButton from './TaskButton';
import CopyToClipboard from 'components/common/Clipboard/CopyToClipboard';
import { Table, Progress } from 'reactstrap';

import { Link } from 'react-router-dom';
import { getProgressColor, getProgressValue } from '../../utils/effortColors';
import hasPermission from 'utils/permissions';
import { Tooltip } from 'reactstrap';
import './style.css';
import ReactTooltip from 'react-tooltip';
import { boxStyle } from 'styles';
import ReviewButton from './ReviewButton';
import { useDispatch } from 'react-redux';
import TeamMemberTaskIconsInfo from './TeamMemberTaskIconsInfo';

const NUM_TASKS_SHOW_TRUNCATE = 6;

const TeamMemberTask = React.memo(
  ({
    user,
    userIndex,
    handleMarkAsDoneModal,
    handleRemoveFromTaskModal,
    handleOpenTaskNotificationModal,
    handleFollowUp,
    handleTaskModalOption,
    userRole,
    userId,
    updateTaskStatus,
  }) => {
    const ref = useRef(null);

    const [totalHoursRemaining, activeTasks] = useMemo(() => {
      let totalHoursRemaining = 0;
      if (user.tasks) {
        totalHoursRemaining = user.tasks.reduce((total, task) => {
          task.hoursLogged = task.hoursLogged || 0;
          task.estimatedHours = task.estimatedHours || 0;

          if (task.status !== 'Complete' && task.isAssigned !== 'false') {
            return total + (task.estimatedHours - task.hoursLogged);
          }
          return total;
        }, 0);
      }

      const activeTasks = user.tasks.filter(
        task =>
          task.wbsId &&
          task.projectId &&
          !task.resources?.some(
            resource => resource.userID === user.personId && resource.completedTask,
          ),
      );

      return [totalHoursRemaining, activeTasks];
    }, [user]);

    const canTruncate = activeTasks.length > NUM_TASKS_SHOW_TRUNCATE;
    const [isTruncated, setIsTruncated] = useState(canTruncate);
    const [tooltipOpen,SetTooltipOpen] = useState(false)

    const toggleTooltip = () =>{
      SetTooltipOpen(prev=>!prev)
    }

    const thisWeekHours = user.totaltangibletime_hrs;

    // these need to be changed to actual permissions...
    const rolesAllowedToResolveTasks = ['Administrator', 'Owner'];
    const rolesAllowedToSeeDeadlineCount = ['Manager', 'Mentor', 'Administrator', 'Owner'];
    const isAllowedToResolveTasks = rolesAllowedToResolveTasks.includes(userRole);
    const isAllowedToSeeDeadlineCount = rolesAllowedToSeeDeadlineCount.includes(userRole);
    const isFollowedUpWith = [];
    const needFollowUp = [];
    //^^^

    const dispatch = useDispatch();
    const canUpdateTask = dispatch(hasPermission('updateTask'));
    const isAllowedToFollowUpWithPeople = dispatch(hasPermission('deadlineFollowUp'));
    const numTasksToShow = isTruncated ? NUM_TASKS_SHOW_TRUNCATE : activeTasks.length;

    const handleTruncateTasksButtonClick = () => {
      if (!isTruncated) {
        ref.current?.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          setIsTruncated(!isTruncated);
        }, 0);
      } else {
        setIsTruncated(!isTruncated);
      }
    };

    if (user.tasks) {
      user.tasks.forEach(task => {
        const usersWithFollowUpCheck = task.resources?.filter(
          resource => resource.userID === user.personId && resource.followedUp?.followUpCheck,
        );
        const usersNeedFollowUp = task.resources?.filter(
          resource => resource.userID === user.personId && resource.followedUp?.needFollowUp,
        );
        if (usersWithFollowUpCheck?.length > 0) {
          isFollowedUpWith.push(task._id);
        }
        if (usersNeedFollowUp?.length > 0) {
          needFollowUp.push(task._id);
        }
      });
    }

    const followUpMouseoverText = task => {
      const progressPersantage = ((task.hoursLogged / task.estimatedHours) * 100).toFixed(2) || 0;
      if (progressPersantage < 50) {
        return 'Check this box once you’ve checked in for the first time with this team member to make sure they are clear on their task.';
      } else if (progressPersantage >= 50 && progressPersantage < 75) {
        return 'Your team member’s task should be at least 50% complete. Check this box once you’ve confirmed they are on track to meet their deadline. Request additional time be added to their task if it is needed.';
      } else if (progressPersantage >= 75 && progressPersantage < 90) {
        return 'Your team member’s task should be at least 75% complete! Check this box once you’ve confirmed they are on track to meet their deadline. Request additional time be added to their task if it is needed';
      } else if (progressPersantage >= 90) {
        return 'Your team member’s task should be almost complete! Check this box once you’ve confirmed they are on track to meet their deadline. Request additional time be added to their task if it is needed';
      }
    };

    const handleCheckboxFollowUp = (taskId, userId, userIndex, taskIndex) => {
      const task = user.tasks[taskIndex];
      const followUpCheck = !isFollowedUpWith.includes(taskId);
      const followUpPercentageDeadline =
        ((task.hoursLogged / task.estimatedHours) * 100).toFixed(2) || 0;
      let data = {};
      if (followUpCheck) {
        data = {
          followUpCheck,
          followUpPercentageDeadline,
          needFollowUp: false,
        };
      } else {
        data = {
          followUpCheck,
          followUpPercentageDeadline: 0,
          needFollowUp: followUpPercentageDeadline > 50,
        };
      }
      handleFollowUp(taskId, userId, data, userIndex, taskIndex);
    };

    return (
      <>
        <tr ref={ref} className="table-row" key={user.personId}>
          {/* green if member has met committed hours for the week, red if not */}
          <td>
            <div className="committed-hours-circle">
              <FontAwesomeIcon
                style={{
                  color: user.totaltangibletime_hrs >= user.weeklycommittedHours ? 'green' : 'red',
                }}
                icon={faCircle}
                data-testid="icon"
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
                  activeTasks.slice(0, numTasksToShow).map((task, taskIndex) => {
                    return (
                      <tr key={`${task._id}${taskIndex}`} className="task-break">
                        <td data-label="Task(s)" className="task-align">
                          <div className="team-member-tasks-content">
                            <Link
                              to={task.projectId ? `/wbs/tasks/${task._id}` : '/'}
                              data-testid={`${task.taskName}`}
                            >
                              <span>{`${task.num} ${task.taskName}`} </span>
                            </Link>
                            <CopyToClipboard writeText={task.taskName} message="Task Copied!" />
                          </div>
                          <div className="team-member-tasks-icons">
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
                                  data-taskid={`task-info-icon-${task.taskName}`}
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
                                data-testid={`tick-${task.taskName}`}
                              />
                            )}
                            {canUpdateTask && (
                              <FontAwesomeIcon
                                className="team-member-task-remove"
                                icon={faTimes}
                                title="Remove User from Task"
                                onClick={() => {
                                  handleRemoveFromTaskModal(user.personId, task);
                                  handleTaskModalOption('XMark');
                                }}
                                data-testid={`Xmark-${task.taskName}`}
                              />
                            )}
                            <TeamMemberTaskIconsInfo />
                          </div>
                          <div>
                            <ReviewButton
                              user={user}
                              myUserId={userId}
                              myRole={userRole}
                              task={task}
                              updateTask={updateTaskStatus}
                              style={boxStyle}
                            />
                          </div>
                        </td>
                        {task.hoursLogged != null && task.estimatedHours != null && (
                          <td data-label="Progress" className="team-task-progress">
                            {isAllowedToSeeDeadlineCount && (
                              <span
                                className="deadlineCount"
                                title="Deadline Follow-up Count"
                                data-testid={`deadline-${task.taskName}`}
                              >
                                {task.deadlineCount === undefined ? 0 : task.deadlineCount}
                              </span>
                            )}
                            <div className="team-task-progress-container">
                              <span
                                data-testid={`times-${task.taskName}`}
                                className={`team-task-progress-time ${
                                  isAllowedToFollowUpWithPeople
                                    ? ''
                                    : 'team-task-progress-time-volunteers'
                                }`}
                              >
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
                                className="team-task-progress-bar"
                              />
                              {isAllowedToFollowUpWithPeople && (
                                <>
                                  <input
                                    type="checkbox"
                                    title={followUpMouseoverText(task)}
                                    className={`team-task-progress-follow-up ${
                                      needFollowUp.includes(task._id)
                                        ? 'team-task-progress-follow-up-red'
                                        : ''
                                    }`}
                                    data-id={task._id}
                                    checked={isFollowedUpWith.includes(task._id)}
                                    onChange={() =>
                                      handleCheckboxFollowUp(
                                        task._id,
                                        user.personId,
                                        userIndex,
                                        taskIndex,
                                      )
                                    }
                                  />
                                  {isFollowedUpWith.includes(task._id) && (
                                    <FontAwesomeIcon
                                      icon={faCheck}
                                      title="This box is used to track follow ups. Clicking it means you’ve checked in with a person that they are on track to meet their deadline"
                                      className="team-task-progress-follow-up-check"
                                      data-id={task._id}
                                      onClick={() =>
                                        handleCheckboxFollowUp(
                                          task._id,
                                          user.personId,
                                          userIndex,
                                          taskIndex,
                                        )
                                      }
                                    />
                                  )}
                                  <FontAwesomeIcon
                                    icon={faInfo}
                                    className="follow-up-button-info-icon"
                                    id="follow-up-button-tip-icon"
                                    data-tip="true"
                                    data-for="follow-up-button-tip"
                                    data-delay-hide="500"
                                    aria-hidden="true"
                                  />
                                  <Tooltip
                                    isOpen={tooltipOpen}
                                    target="follow-up-button-tip-icon"
                                    toggle={toggleTooltip}
                                    style={{ backgroundColor: 'black', color: 'white', minWidth: '500px' }}
                                  >
                                    This checkbox allows you to track follow-ups. By clicking it,
                                    you indicate that you have checked <br /> in with a person to
                                    ensure they are on track to meet their deadline.
                                    <br />
                                    <br />
                                    The checkbox is visible and accessible to all classes except
                                    volunteers. Checking the box will modify
                                    <br /> its appearance for all others who can see it.
                                    <br />
                                    <br />
                                    When a person's task is at 50%, 75%, or 90% of the deadline, the
                                    checkbox automatically clears and changes to a red outline with
                                    a <br />
                                    light pink filler. This visual cue indicates that the person
                                    requires follow-up. <br />
                                    <br />
                                    Once checked, the box reverts to a green outline with a light
                                    green filler and a check mark inside.
                                    <br />
                                    <br />
                                    If a person is followed up with when their progress is between
                                    50-75%, the checkbox will not <br /> automatically clear until
                                    the person reaches over 75% progress.
                                    <br />
                                    <br /> Similarly, If a person is followed up with when their
                                    progress is between 75-90% the checkbox remains checked <br />{' '}
                                    until the person reaches over 90% progress.
                                    <br />
                                    <br />
                                    if the checkbox is unchecked it resets to initial state.
                                    <br />
                                    (If the progress is less than 50%, the checkbox will be
                                    unchecked and shown in green.
                                    <br />
                                    If the progress is over 50%, the checkbox will be unchecked and
                                    shown in red)
                                    <br />
                                    <br />
                                  </Tooltip>
                                </>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                {canTruncate && (
                  <tr key="truncate-button-row" className="task-break">
                    <td className="task-align">
                      <button onClick={handleTruncateTasksButtonClick}>
                        {isTruncated ? `Show All (${activeTasks.length}) Tasks` : 'Truncate Tasks'}
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </td>
        </tr>
      </>
    );
  },
);

export default TeamMemberTask;
