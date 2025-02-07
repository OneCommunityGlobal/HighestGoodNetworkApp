import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faCircle,
  faCheck,
  faTimes,
  faExpandArrowsAlt,
  faCompressArrowsAlt,
} from '@fortawesome/free-solid-svg-icons';
import CopyToClipboard from 'components/common/Clipboard/CopyToClipboard';
import { Table, Progress } from 'reactstrap';

import { Link } from 'react-router-dom';
import hasPermission from 'utils/permissions';
import './style.css';

import Warning from 'components/Warnings/Warnings';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment-timezone';

import ReviewButton from './ReviewButton';
import { getProgressColor, getProgressValue } from '../../utils/effortColors';
import TeamMemberTaskIconsInfo from './TeamMemberTaskIconsInfo';
import { showTimeOffRequestModal } from '../../actions/timeOffRequestAction';
import GoogleDocIcon from '../common/GoogleDocIcon';
import FollowupCheckButton from './FollowupCheckButton';
import FollowUpInfoModal from './FollowUpInfoModal';
import * as messages from '../../constants/followUpConstants';

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
    showWhoHasTimeOff,
    onTimeOff,
    goingOnTimeOff,
    displayUser,
  }) => {
    const darkMode = useSelector(state => state.theme.darkMode);
    const taskCounts = useSelector(state => state.dashboard?.taskCounts ?? {});
    // console.log('Task counts:', taskCounts);
    // console.log('Task IDs:', Object.keys(taskCounts));
    const ref = useRef(null);
    const currentDate = moment.tz('America/Los_Angeles').startOf('day');
    const dispatch = useDispatch();
    const canSeeFollowUpCheckButton = userRole !== 'Volunteer';

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
    const [isTimeOffContentOpen, setIsTimeOffContentOpen] = useState(
      showWhoHasTimeOff && (onTimeOff || goingOnTimeOff),
    );

    const thisWeekHours = user.totaltangibletime_hrs;

    // these need to be changed to actual permissions...
    const rolesAllowedToResolveTasks = ['Administrator', 'Owner'];
    const rolesAllowedToSeeDeadlineCount = ['Manager', 'Mentor', 'Administrator', 'Owner'];
    const isAllowedToResolveTasks =
      rolesAllowedToResolveTasks.includes(userRole) || dispatch(hasPermission('resolveTask'));
    const isAllowedToSeeDeadlineCount = rolesAllowedToSeeDeadlineCount.includes(userRole);
    // ^^^

    const canGetWeeklySummaries = dispatch(hasPermission('getWeeklySummaries'));
    const canUpdateTask = dispatch(hasPermission('updateTask'));
    const canRemoveUserFromTask = dispatch(hasPermission('removeUserFromTask'));
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
        targetLink = currentElement.Link;
      }
      return targetLink;
    }, undefined);

    const followUpMouseoverText = task => {
      const progressPersantage = ((task.hoursLogged / task.estimatedHours) * 100).toFixed(2) || 0;
      if (progressPersantage < 50) {
        return messages.MOUSE_OVER_TEXT_UNDER_50;
      } else if (progressPersantage >= 50 && progressPersantage < 75) {
        return messages.MOUSE_OVER_TEXT_BETWEEN_50_75;
      } else if (progressPersantage >= 75 && progressPersantage < 90) {
        return messages.MOUSE_OVER_TEXT_BETWEEN_75_90;
      } else if (progressPersantage >= 90) {
        return messages.MOUSE_OVER_TEXT_OVER_90;
      }
    };

    return (
      <tr ref={ref} className={`table-row ${darkMode ? 'bg-yinmn-blue' : ''}`} key={user.personId}>
        <td className="remove-padding" colSpan={6}>
          <div className="row-content">
            {isTimeOffContentOpen && (
              <div className="taking-time-off-content-div">
                <div>
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
                <button
                  className="compress-time-off-detail-button"
                  onClick={() => {
                    setIsTimeOffContentOpen(false);
                  }}
                >
                  <FontAwesomeIcon icon={faCompressArrowsAlt} data-testid="icon" />
                </button>
              </div>
            )}
            <Table className="no-bottom-margin">
              <tr className="remove-child-borders">
                {/* green if member has met committed hours for the week, red if not */}
                <td colSpan={1} className={`${darkMode ? 'bg-yinmn-blue' : ''}`}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="committed-hours-circle">
                      <FontAwesomeIcon
                        style={{
                          color:
                            user.totaltangibletime_hrs >= user.weeklycommittedHours
                              ? 'green'
                              : 'red',
                        }}
                        icon={faCircle}
                        data-testid="icon"
                      />
                    </div>
                    <Link to={`/timelog/${user.personId}`}>
                      <i
                        className="fa fa-clock-o"
                        aria-hidden="true"
                        style={{
                          fontSize: 24,
                          cursor: 'pointer',
                          color: darkMode ? 'lightgray' : 'black',
                        }}
                        title="Click to see user's timelog"
                      />
                    </Link>
                  </div>
                </td>
                <td colSpan={2} className={`${darkMode ? 'bg-yinmn-blue' : ''}`}>
                  <Table borderless className="team-member-tasks-subtable">
                    <tbody>
                      <tr>
                        <td className="team-member-tasks-user-name">
                          <Link
                            className="team-member-tasks-user-name-link"
                            to={`/userprofile/${user.personId}`}
                            style={{
                              color:
                                currentDate.isSameOrAfter(
                                  moment(user.timeOffFrom, 'YYYY-MM-DDTHH:mm:ss.SSSZ'),
                                ) &&
                                currentDate.isBefore(
                                  moment(user.timeOffTill, 'YYYY-MM-DDTHH:mm:ss.SSSZ'),
                                )
                                  ? 'rgba(128, 128, 128, 0.5)'
                                  : darkMode
                                  ? '#339CFF'
                                  : undefined,
                              fontSize: '20px',
                            }}
                          >{`${user.name}`}</Link>

                          {user.role !== 'Volunteer' && (
                            <div
                              className="user-role"
                              style={{ fontSize: '14px', color: darkMode ? 'lightgray' : 'gray' }}
                            >
                              {user.role}
                            </div>
                          )}

                          {canGetWeeklySummaries && <GoogleDocIcon link={userGoogleDocLink} />}

                          <Warning
                            username={user.name}
                            userName={user}
                            userId={userId}
                            user={user}
                            userRole={userRole}
                            personId={user.personId}
                            displayUser={displayUser}
                          />
                        </td>
                        <td
                          data-label="Time"
                          className={`team-clocks ${darkMode ? 'text-light' : ''}`}
                        >
                          <u className={darkMode ? 'dashboard-team-clocks' : ''}>
                            {user.weeklycommittedHours ? user.weeklycommittedHours : 0}
                          </u>{' '}
                          /
                          <font color="green"> {thisWeekHours ? thisWeekHours.toFixed(1) : 0}</font>{' '}
                          /<font color="red"> {totalHoursRemaining.toFixed(1)}</font>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </td>
                <td colSpan={3} className={`${darkMode ? 'bg-yinmn-blue' : ''}`}>
                  <div className="grid-container">
                    <Table borderless className="team-member-tasks-subtable">
                      <tbody>
                        {user.tasks &&
                          activeTasks.slice(0, numTasksToShow).map((task, index) => {
                            return (
                              <tr
                                key={`${task._id}${index}`}
                                className={`task-break ${darkMode ? 'bg-yinmn-blue' : ''}`}
                              >
                                <td
                                  data-label="Task(s)"
                                  className={`task-align  ${
                                    darkMode ? 'bg-yinmn-blue text-light' : ''
                                  }`}
                                >
                                  <div className="team-member-tasks-content">
                                    <Link
                                      className="team-member-tasks-content-link"
                                      to={task.projectId ? `/wbs/tasks/${task._id}` : '/'}
                                      data-testid={`${task.taskName}`}
                                      style={{ color: darkMode ? '#339CFF' : undefined }}
                                    >
                                      <span>{`${task.num} ${task.taskName}`} </span>
                                    </Link>
                                    <CopyToClipboard
                                      writeText={task.taskName}
                                      message="Task Copied!"
                                    />
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
                                    {(canUpdateTask || canRemoveUserFromTask) && (
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
                                    />
                                  </div>
                                </td>
                                {task.hoursLogged != null && task.estimatedHours != null && (
                                  <td
                                    data-label="Progress"
                                    className={`team-task-progress  ${
                                      darkMode ? 'bg-yinmn-blue text-light' : ''
                                    }`}
                                  >
                                    {isAllowedToSeeDeadlineCount && (
                                      <span
                                        className="deadlineCount"
                                        title="Deadline Follow-up Count"
                                        data-testid={`deadline-${task.taskName}`}
                                      >
                                        {taskCounts[task._id] !== undefined
                                          ? taskCounts[task._id]
                                          : task.deadlineCount === undefined
                                          ? 0
                                          : task.deadlineCount}
                                      </span>
                                    )}
                                    <div className="team-task-progress-container">
                                      <span
                                        data-testid={`times-${task.taskName}`}
                                        className={`${darkMode ? 'text-light ' : ''} ${
                                          canSeeFollowUpCheckButton
                                            ? 'team-task-progress-time'
                                            : 'team-task-progress-time-volunteers'
                                        }`}
                                      >
                                        {`${parseFloat(
                                          task.hoursLogged.toFixed(2),
                                        )} of ${parseFloat(task.estimatedHours.toFixed(2))}`}
                                      </span>
                                      {canSeeFollowUpCheckButton && (
                                        <>
                                          <FollowupCheckButton
                                            moseoverText={followUpMouseoverText(task)}
                                            user={user}
                                            task={task}
                                          />
                                          <FollowUpInfoModal />
                                        </>
                                      )}
                                      <Progress
                                        color={getProgressColor(
                                          task.hoursLogged,
                                          task.estimatedHours,
                                          true,
                                        )}
                                        value={getProgressValue(
                                          task.hoursLogged,
                                          task.estimatedHours,
                                        )}
                                        className="team-task-progress-bar"
                                      />
                                    </div>
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                        {canTruncate && (
                          <tr key="truncate-button-row" className="task-break">
                            <td className={`task-align`}>
                              <button
                                type="button"
                                onClick={handleTruncateTasksButtonClick}
                                className={darkMode ? 'text-light' : ''}
                              >
                                {isTruncated
                                  ? `Show All (${activeTasks.length}) Tasks`
                                  : 'Truncate Tasks'}
                              </button>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                    {showWhoHasTimeOff && (onTimeOff || goingOnTimeOff) && (
                      <button
                        type="button"
                        className={`expand-time-off-detail-button ${
                          isTimeOffContentOpen ? 'hidden' : ''
                        }`}
                        onClick={() => setIsTimeOffContentOpen(true)}
                      >
                        <FontAwesomeIcon icon={faExpandArrowsAlt} data-testid="icon" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            </Table>
          </div>
        </td>
      </tr>
    );
  },
);

export default TeamMemberTask;
