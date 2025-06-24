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
import moment from 'moment-timezone';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Progress } from 'reactstrap';

import { Link } from 'react-router-dom';
import hasPermission from '../../utils/permissions';
import CopyToClipboard from '../common/Clipboard/CopyToClipboard';
import './style.css';
import Warning from '../Warnings/Warnings';

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
    teamRoles,
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
    const ref = useRef(null);
    const currentDate = moment.tz('America/Los_Angeles').startOf('day');
    const dispatch = useDispatch();
    const canSeeFollowUpCheckButton = userRole !== 'Volunteer';

    const totalHoursRemaining = user.tasks.reduce((total, task) => {
      const userHours = task.hoursLogged || 0;
      const userEstimatedHours = task.estimatedHours || 0;
      if (task.status !== 'Complete' && task.isAssigned !== 'false') {
        return total + Math.max(0, userEstimatedHours - userHours);
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

    const completedTasks = user.tasks.filter(task =>
      task.resources?.some(resource => resource.userID === user.personId && resource.completedTask),
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
    const canSeeReports =
      rolesAllowedToResolveTasks.includes(userRole) || dispatch(hasPermission('getReports'));
    const canUpdateTask = dispatch(hasPermission('updateTask'));
    const canRemoveUserFromTask = dispatch(hasPermission('removeUserFromTask'));
    const numTasksToShow = isTruncated ? NUM_TASKS_SHOW_TRUNCATE : activeTasks.length;

    const colorsObjs = {
      'Assistant Manager': '#849ced', // blue
      Manager: '#90e766', // green
      Mentor: '#e9dd57', // yellow
    };

    function getInitials(name) {
      const initials = name
        .split(' ')
        .filter((n, index) => index === 0 || index === name.split(' ').length - 1)
        .map(n => n[0])
        .join('')
        .toUpperCase();
      return initials;
    }
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
      let target = targetLink;
      if (currentElement.Name === 'Google Doc') {
        target = currentElement.Link;
      }
      return target;
    }, undefined);

    const followUpMouseoverText = task => {
      const progressPersantage = ((task.hoursLogged / task.estimatedHours) * 100).toFixed(2) || 0;
      if (progressPersantage < 50) {
        return messages.MOUSE_OVER_TEXT_UNDER_50;
      }
      if (progressPersantage >= 50 && progressPersantage < 75) {
        return messages.MOUSE_OVER_TEXT_BETWEEN_50_75;
      }
      if (progressPersantage >= 75 && progressPersantage < 90) {
        return messages.MOUSE_OVER_TEXT_BETWEEN_75_90;
      }
      return messages.MOUSE_OVER_TEXT_OVER_90;
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
                  type="button"
                  aria-label="Compress time off detail"
                >
                  <FontAwesomeIcon icon={faCompressArrowsAlt} data-testid="icon" />
                </button>
              </div>
            )}
            <Table className="no-bottom-margin">
              <tbody>
                <tr className="remove-child-borders">
                  {/* green if member has met committed hours for the week, red if not */}
                  <td colSpan={1} className={`${darkMode ? 'bg-yinmn-blue' : ''}`}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'column' }}>
                      <div className="member-links-wrapper">
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
                        <Link to={`/timelog/${user.personId}`} className="timelog-info">
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
                      {canUpdateTask && teamRoles && (
                        <div className="name-wrapper">
                          {['Manager', 'Assistant Manager', 'Mentor'].map(role => {
                            return teamRoles[role]?.map(elm => {
                              const { name } = elm; // Getting initials and formatting them here
                              const initials = getInitials(name);
                              // Getting background color dynamically based on the role
                              const bg = colorsObjs[role];
                              return (
                                <a
                                  key={elm.id}
                                  title={`${role} : ${name}`}
                                  className="name"
                                  href={`/userprofile/${elm.id}`}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <span className="name-initial" style={{ backgroundColor: bg }}>
                                    {initials}{' '}
                                  </span>
                                </a>
                              );
                            });
                          })}
                        </div>
                      )}
                    </div>
                  </td>
                  <td colSpan={2} className={`${darkMode ? 'bg-yinmn-blue' : ''}`}>
                    <Table borderless className="team-member-tasks-subtable">
                      <tbody>
                        <tr
                          style={{
                            width: '500px',
                          }}
                        >
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
                                    : darkMode && '#339CFF',
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

                            {canSeeReports && (
                              <Link
                                className="team-member-tasks-user-report-link"
                                to={`/peoplereport/${user?.personId}`}
                              >
                                <img
                                  src="/report_icon.png"
                                  alt="reportsicon"
                                  className="team-member-tasks-user-report-link-image"
                                />
                              </Link>
                            )}
                            {canSeeReports && (
                              <Link to={`/peoplereport/${user?.personId}`}>
                                <span className="team-member-tasks-number">
                                  {completedTasks.length}
                                </span>
                              </Link>
                            )}
                            <Warning
                              username={user.name}
                              nameOfUser={user}
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
                            <font color="green">
                              {' '}
                              {thisWeekHours ? thisWeekHours.toFixed(1) : 0}
                            </font>{' '}
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
                            activeTasks.slice(0, numTasksToShow).map(task => {
                              return (
                                <tr
                                  key={`${task._id}`}
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
                                          Object.prototype.hasOwnProperty.call(
                                            notification,
                                            'userId',
                                          ) && notification.userId === user.personId,
                                      ) ? (
                                        <FontAwesomeIcon
                                          className="team-member-tasks-bell"
                                          title="Task Info Changes"
                                          icon={faBell}
                                          onClick={() => {
                                            const taskNotificationId = task.taskNotifications.filter(
                                              taskNotification =>
                                                taskNotification.userId === user.personId,
                                            );
                                            handleOpenTaskNotificationModal(
                                              user.personId,
                                              task,
                                              taskNotificationId,
                                            );
                                          }}
                                          data-taskid={`task-info-icon-${task.taskName}`}
                                        />
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
                                          {taskCounts[task._id] ?? task.deadlineCount ?? 0}
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
                              <td className="task-align">
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
                          aria-label="Expand time off detail"
                        >
                          <FontAwesomeIcon icon={faExpandArrowsAlt} data-testid="icon" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              </tbody>
            </Table>
          </div>
        </td>
      </tr>
    );
  },
);

export default TeamMemberTask;
