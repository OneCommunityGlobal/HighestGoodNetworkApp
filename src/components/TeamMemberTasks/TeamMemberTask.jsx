import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faCircle,
  faCheckCircle,
  faTimesCircle,
  faExpandArrowsAlt,
  faCompressArrowsAlt,
} from '@fortawesome/free-solid-svg-icons';
import CopyToClipboard from '~/components/common/Clipboard/CopyToClipboard';
import { Table, Progress, Modal, ModalHeader, ModalFooter, ModalBody } from 'reactstrap';

import { Link } from 'react-router-dom';
import hasPermission from '~/utils/permissions';
import './style.css';
import { getUserProfile } from '~/actions/userProfile.js';
import { toast } from 'react-toastify';
import Warning from '~/components/Warnings/Warnings';
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
import UserStateManager from "~/components/UserState/UserStateManager";
import { updateUserStateIndicators } from "../UserState/action";
import {
  selectUserStateCatalog,
  selectUserStateForUser,
} from "../UserState/reducer";

const NUM_TASKS_SHOW_TRUNCATE = 6;

const initialCatalog = [
  { key: "closing-out", label: "❌ Closing Out", color: "red" },
  { key: "new-dev", label: "🖥️ New Developer", color: "blue" },
  { key: "pr-review-team", label: "👾 PR Review Team", color: "purple" },
  { key: "developer", label: "🖥️✅ Developer", color: "green" },
];

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

    const [isDashboardModalOpen, setIsDashboardModalOpen] = useState(false);
    const dashboardToggle = item => setIsDashboardOpen(item.personId);
    const manager = 'Manager';
    const adm = 'Administrator';
    const owner = 'Owner';

    const handleDashboardAccess = () => {
      // null checks
      if (!user || !userRole || !user.role) {
        toast.error('User information not available to determine dashboard access.');
        return;
      }

      if (userRole === manager && [adm, owner].includes(user.role)) {
        toast.error("Oops! You don't have the permission to access this user's dashboard!");
      } else if (userRole === adm && [owner].includes(user.role)) {
        toast.error("Oops! You don't have the permission to access this user's dashboard!");
      } else if (
        ![manager, adm, owner].includes(userRole) &&
        [manager, adm, owner].includes(user.role)
      ) {
        toast.error("Oops! You don't have the permission to access this user's dashboard!");
      } else {
        openDashboardModal();
      }
    };

    const openDashboardModal = () => {
      setIsDashboardModalOpen(true);
    };

    const closeDashboardModal = () => {
      setIsDashboardModalOpen(false);
    };

    const showDashboard = () => {
      dispatch(getUserProfile(user.personId)).then(user => {
        const { _id, role, firstName, lastName, profilePic, email } = user;
        const viewingUser = {
          userId: _id,
          role,
          firstName,
          lastName,
          email,
          profilePic: profilePic || '/pfp-default-header.png',
        };
        sessionStorage.setItem('viewingUser', JSON.stringify(viewingUser));
        window.dispatchEvent(new Event('storage'));
        closeDashboardModal();
      });
    };

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

    const rolesAllowedToResolveTasks = ['Administrator', 'Owner'];
    const rolesAllowedToSeeDeadlineCount = ['Manager', 'Mentor', 'Administrator', 'Owner'];
    const isAllowedToResolveTasks =
      rolesAllowedToResolveTasks.includes(userRole) || dispatch(hasPermission('resolveTask'));
    const isAllowedToSeeDeadlineCount = rolesAllowedToSeeDeadlineCount.includes(userRole);

    const canGetWeeklySummaries = dispatch(hasPermission('getWeeklySummaries'));
    const canSeeReports =
      rolesAllowedToResolveTasks.includes(userRole) || dispatch(hasPermission('getReports'));
    const canUpdateTask = dispatch(hasPermission('updateTask'));
    const canDeleteTask = dispatch(hasPermission('canDeleteTask'));
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

    /**    const handleReportClick = (event, to) => {      if (event.metaKey || event.ctrlKey || event.button === 1) {        return;      }      event.preventDefault(); // prevent full reload    };    */

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

    // user state
    const catalogFromStore = useSelector(selectUserStateCatalog);
    // const effectiveCatalog = catalogFromStore?.length ? catalogFromStore : initialCatalog;
    const selectedFromSlice = useSelector(s => selectUserStateForUser(s, user.personId));
    const initialSelected = Array.isArray(selectedFromSlice) && selectedFromSlice.length
      ? selectedFromSlice
      : (user.stateIndicators || []);
    const canEdit =
      ['Owner', 'Administrator'].includes(userRole) ||
      dispatch(hasPermission('manageUserStateIndicator'));

      const [catalogFromApi, setCatalogFromApi] = useState(null);
      React.useEffect(() => {
  let cancelled = false;
  (async () => {
    try {
      const res = await fetch('/api/user-state/catalog', { credentials: 'include' });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();              // <- { items: [...] }
      if (!cancelled) setCatalogFromApi(data.items || []);
    } catch (e) {
      console.error('fetch catalog failed', e);
    }
  })();
  return () => { cancelled = true; };
}, []);
 const effectiveCatalog =
  (catalogFromApi && catalogFromApi.length && catalogFromApi) ||
  (catalogFromStore && catalogFromStore.length && catalogFromStore) ||
  initialCatalog;

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
                          <div className="icon-row">
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={handleDashboardAccess}
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleDashboardAccess();
                              }}
                            >
                              <FontAwesomeIcon
                                style={{
                                  color:
                                    user.totaltangibletime_hrs >= user.weeklycommittedHours
                                      ? 'green'
                                      : 'red',
                                }}
                                icon={faCircle}
                                title="Click to jump to dashboard"
                                data-testid="icon"
                              />
                            </div>

                            <Link
                              to={`/timelog/${user.personId}#currentWeek`}
                              className="timelog-info"
                            >
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
                          {user.role !== 'Volunteer' && (
                            <div
                              className="user-role"
                              style={{ fontSize: '14px', color: darkMode ? 'lightgray' : 'gray' }}
                            >
                              {user.role}
                            </div>
                          )}
                        </div>
                      </div>
                      {canUpdateTask && teamRoles && (
                        <div className="name-wrapper">
                          {['Manager', 'Assistant Manager', 'Mentor'].map(role => {
                            const seenIds = new Set();
                            const uniqueRoleMembers = (teamRoles[role] || []).filter(elm => {
                              const key = `${elm.id}-${elm.name}`;
                              if (seenIds.has(key)) return false;
                              seenIds.add(key);
                              return true;
                            });

                            return uniqueRoleMembers.map(elm => {
                              const { name } = elm;
                              const initials = getInitials(name);
                              const bg = colorsObjs[role];
                              return (
                                <a
                                  key={`${role}-${elm.id}-${elm.name}`}
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
                            <div style={{ marginTop: "29px", marginLeft: "-70px" }}>
                              <UserStateManager
                                initialCatalog={effectiveCatalog}
                                initialSelected={initialSelected}
                                userId={user.personId}
                                canEdit={canEdit}
                                onChange={(nextSelected /*, nextCatalog */) => {
                                  dispatch(updateUserStateIndicators(user.personId, nextSelected));
                                }}
                              />
                            </div>
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
                                    className={`task-align  ${darkMode ? 'bg-yinmn-blue text-light' : ''
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
                                          icon={faCheckCircle}
                                          title="Mark as Done"
                                          onClick={() => {
                                            handleMarkAsDoneModal(user.personId, task);
                                            handleTaskModalOption('Checkmark');
                                          }}
                                          data-testid={`tick-${task.taskName}`}
                                        />
                                      )}
                                      {(canUpdateTask || canDeleteTask) && (
                                        <FontAwesomeIcon
                                          className="team-member-task-remove"
                                          icon={faTimesCircle}
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
                                    <div className="team-member-task-review-button">
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
                                      className={`team-task-progress  ${darkMode ? 'bg-yinmn-blue text-light' : ''
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
                                          className={`${darkMode ? 'text-light ' : ''} ${canSeeFollowUpCheckButton
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
                      <Modal
                        isOpen={isDashboardModalOpen}
                        toggle={closeDashboardModal}
                        className={darkMode ? 'text-light dark-mode' : ''}
                      >
                        <ModalHeader
                          toggle={closeDashboardModal}
                          className={darkMode ? 'bg-space-cadet' : ''}
                        >
                          Jump to personal Dashboard
                        </ModalHeader>
                        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
                          <p className="title-dashboard">
                            Are you sure you wish to view the dashboard for {user.name}?
                          </p>
                        </ModalBody>
                        <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
                          <button className="btn btn-primary" onClick={showDashboard}>
                            Ok
                          </button>
                          <button className="btn btn-danger" onClick={closeDashboardModal}>
                            Cancel
                          </button>
                        </ModalFooter>
                      </Modal>
                      {showWhoHasTimeOff && (onTimeOff || goingOnTimeOff) && (
                        <button
                          type="button"
                          className={`expand-time-off-detail-button ${isTimeOffContentOpen ? 'hidden' : ''
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

TeamMemberTask.displayName = 'TeamMemberTask';

export default TeamMemberTask;
