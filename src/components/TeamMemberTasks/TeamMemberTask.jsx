import React, { useState, useMemo, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCircle, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import CopyToClipboard from 'components/common/Clipboard/CopyToClipboard';
import { Table, Progress, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { FcGoogle } from "react-icons/fc";

import { Link } from 'react-router-dom';
import hasPermission from 'utils/permissions';
import './style.css';
import { boxStyle } from 'styles';

import Warning from 'components/Warnings/Warnings';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment-timezone';

import ReviewButton from './ReviewButton';
import { getProgressColor, getProgressValue } from '../../utils/effortColors';
import TeamMemberTaskIconsInfo from './TeamMemberTaskIconsInfo';
import { showTimeOffRequestModal } from '../../actions/timeOffRequestAction';
import { toast } from 'react-toastify';

const NUM_TASKS_SHOW_TRUNCATE = 6;

const TeamMemberTask = React.memo(
  ({
    user,
    handleMarkAsDoneModal,
    handleRemoveFromTaskModal,
    handleOpenTaskNotificationModal,
    handleTaskModalOption,
    userRole,
    userId,
    updateTaskStatus,
    userPermission,
    showWhoHasTimeOff,
    onTimeOff,
    goingOnTimeOff,
  }) => {
    const ref = useRef(null);
    const currentDate = moment.tz('America/Los_Angeles').startOf('day');
    const dispatch = useDispatch();

    const totalHoursRemaining = user.tasks.reduce((total, task) => {
      task.hoursLogged = task.hoursLogged || 0;
      task.estimatedHours = task.estimatedHours || 0;
      if (task.status !== 'Complete' && task.isAssigned !== 'false') {
        return total + Math.max(0, task.estimatedHours - task.hoursLogged);
      }
      return total;
    }, 0);

    const activeTasks = user.tasks.filter(
      task =>
        !task.resources?.some(
          resource => resource.userID === user.personId && resource.completedTask,
        ),
    );

    const canTruncate = activeTasks.length > NUM_TASKS_SHOW_TRUNCATE;
    const [isTruncated, setIsTruncated] = useState(canTruncate);
    const [detailModalIsOpen, setDetailModalIsOpen] = useState(false);

    const thisWeekHours = user.totaltangibletime_hrs;

    // these need to be changed to actual permissions...
    const rolesAllowedToResolveTasks = ['Administrator', 'Owner'];
    const rolesAllowedToSeeDeadlineCount = ['Manager', 'Mentor', 'Administrator', 'Owner'];
    const isAllowedToResolveTasks = rolesAllowedToResolveTasks.includes(userRole);
    const isAllowedToSeeDeadlineCount = rolesAllowedToSeeDeadlineCount.includes(userRole);
    // ^^^

    const canGetWeeklySummaries = dispatch(hasPermission('getWeeklySummaries'));
    const canUpdateTask = dispatch(hasPermission('updateTask'));
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

    const openDetailModal = request => {
      dispatch(showTimeOffRequestModal(request));
    };

    const userGoogleDocLink = user.adminLinks?.reduce((targetLink, currentElement) => {
      if (currentElement.Name === 'Google Doc') {
        targetLink = currentElement.Link
      }
      return targetLink;
    }, undefined);


    const handleGoogleDocClick = () => {
      const toastGoogleLinkDoesNotExist = 'toast-on-click';
      if (userGoogleDocLink) {
        window.open(userGoogleDocLink);
      } else {
        toast.error(
          'Uh oh, no Google Doc is present for this user! Please contact an Admin to find out why.',
          {
            toastId: toastGoogleLinkDoesNotExist,
            pauseOnFocusLoss: false,
            autoClose: 3000,
          },
        );
      }
    };


    return (
      <>
        <tr ref={ref} className="table-row" key={user.personId}>
          {/* green if member has met committed hours for the week, red if not */}
          <td colSpan={1}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div className="committed-hours-circle">
                <FontAwesomeIcon
                  style={{
                    color:
                      user.totaltangibletime_hrs >= user.weeklycommittedHours ? 'green' : 'red',
                  }}
                  icon={faCircle}
                  data-testid="icon"
                />
              </div>
              <Link to={`/timelog/${user.personId}`}>
                <i
                  className="fa fa-clock-o"
                  aria-hidden="true"
                  style={{ fontSize: 24, cursor: 'pointer', color: 'black' }}
                  title="Click to see user's timelog"
                />
              </Link>
            </div>
          </td>
          <td colSpan={2}>
            <Table borderless className="team-member-tasks-subtable">
              <tbody>
                <tr>
                  <td className="team-member-tasks-user-name">
                    <Link
                      to={`/userprofile/${user.personId}`}
                      style={{
                        color:
                          currentDate.isSameOrAfter(
                            moment(user.timeOffFrom, 'YYYY-MM-DDTHH:mm:ss.SSSZ'),
                          ) &&
                          currentDate.isBefore(moment(user.timeOffTill, 'YYYY-MM-DDTHH:mm:ss.SSSZ'))
                            ? 'rgba(128, 128, 128, 0.5)'
                            : undefined,
                      }}
                    >{`${user.name}`}</Link>
                    {canGetWeeklySummaries && (
                      <FcGoogle
                      className={`google-doc-icon ${userGoogleDocLink ? "" : "inactive"}`}
                      onClick={handleGoogleDocClick}/>
                      )}

                    <Warning
                      username={user.name}
                      userName={user}
                      userId={userId}
                      user={user}
                      userRole={userRole}
                      personId={user.personId}
                    />
                  </td>
                  <td data-label="Time" className="team-clocks">
                    <u>{user.weeklycommittedHours ? user.weeklycommittedHours : 0}</u> /
                    <font color="green"> {thisWeekHours ? thisWeekHours.toFixed(1) : 0}</font> /
                    <font color="red"> {totalHoursRemaining.toFixed(1)}</font>
                  </td>
                </tr>
              </tbody>
            </Table>
          </td>
          <td colSpan={3}>
            <Table borderless className="team-member-tasks-subtable">
              <tbody>
                {user.tasks &&
                  activeTasks.slice(0, numTasksToShow).map((task, index) => {
                    return (
                      <tr key={`${task._id}${index}`} className="task-break">
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
                              userId={userId}
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
                            <div>
                              <span data-testid={`times-${task.taskName}`}>
                                {`${parseFloat(task.hoursLogged.toFixed(2))} of ${parseFloat(
                                  task.estimatedHours.toFixed(2),
                                )}`}
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
            {showWhoHasTimeOff && (onTimeOff || goingOnTimeOff) && (
              <div className="taking-time-off-content-div">
                <span className="taking-time-off-content-text">
                  {onTimeOff
                    ? `${user.name} Is Not Available this Week`
                    : `${user.name} Is Not Available Next Week`}
                </span>
                <button
                  type="button"
                  className="taking-time-off-content-btn"
                  onClick={() => {
                    const request = onTimeOff
                      ? { ...onTimeOff, onVacation: true, name: user.name }
                      : { ...goingOnTimeOff, onVacation: false, name: user.name };

                    openDetailModal(request);
                  }}
                >
                  Details ?
                </button>
              </div>
            )}
          </td>
        </tr>
      </>
    );
  },
);

export default TeamMemberTask;
