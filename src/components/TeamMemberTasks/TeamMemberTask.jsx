import React, { useState, useMemo, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCircle, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import CopyToClipboard from 'components/common/Clipboard/CopyToClipboard';
import { Table, Progress } from 'reactstrap';

import { Link } from 'react-router-dom';
import { getProgressColor, getProgressValue } from '../../utils/effortColors';
import hasPermission from 'utils/permissions';
import './style.css';
import { boxStyle } from 'styles';
import ReviewButton from './ReviewButton';
import { useDispatch } from 'react-redux';
import TeamMemberTaskIconsInfo from './TeamMemberTaskIconsInfo';
import moment from 'moment';
import 'moment-timezone';

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
    updateTask,
    showWhoHasTimeOff,
    timeOffRequests,
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
    const [onVacation, setOnVacation] = useState(null);
    const [goingOnVacation, setGoingOnVacation] = useState(null);
    const [detailModalIsOpen, setDetailModalIsOpen] = useState(false);

    const thisWeekHours = user.totaltangibletime_hrs;

    // these need to be changed to actual permissions...
    const rolesAllowedToResolveTasks = ['Administrator', 'Owner'];
    const rolesAllowedToSeeDeadlineCount = ['Manager', 'Mentor', 'Administrator', 'Owner'];
    const isAllowedToResolveTasks = rolesAllowedToResolveTasks.includes(userRole);
    const isAllowedToSeeDeadlineCount = rolesAllowedToSeeDeadlineCount.includes(userRole);
    //^^^

    const dispatch = useDispatch();
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

    const isTimeOffRequestIncludeCurrentWeek = request => {
      const { startingDate, endingDate } = request;

      moment.tz.setDefault('America/Los_Angeles');

      const currentDate = moment();
      const requestStartingDate = moment(startingDate);
      const requestEndingDate = moment(endingDate);

      const currentWeekStart = currentDate.clone().startOf('week');
      const currentWeekEnd = currentDate.clone().endOf('week');

      // Check if the current week falls within the date range of the request
      if (
        currentWeekStart.isSameOrAfter(requestStartingDate) &&
        currentWeekEnd.isSameOrBefore(requestEndingDate)
      ) {
        return true;
      }

      return false;
    };

    const isUserOnVacation = requests => {
      moment.tz.setDefault('America/Los_Angeles');

      for (const request of requests) {
        if (isTimeOffRequestIncludeCurrentWeek(request)) {
          return request;
        }
      }

      return null;
    };

    const isUserGoingOnVacation = requests => {
      moment.tz.setDefault('America/Los_Angeles');

      const nextWeekStart = moment()
        .add(1, 'week')
        .startOf('week');

      // Find the first request that starts on Sunday next week
      const userOnVacation = requests.find(request => {
        const startingDate = moment(request.startingDate);
        return startingDate.isSame(nextWeekStart, 'day');
      });

      return userOnVacation || null;
    };

    const detailModalClose = () => {
      setDetailModalIsOpen(prev => false);
    };

    useEffect(() => {
      if (timeOffRequests) {
        const checkOnVacation = isUserOnVacation(timeOffRequests);
        const checkGoingOnVacation = isUserGoingOnVacation(timeOffRequests);
        console.log(checkOnVacation, checkGoingOnVacation);
        setOnVacation(checkOnVacation);
        setGoingOnVacation(checkGoingOnVacation);
      }
    }, []);

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
                  activeTasks.slice(0, numTasksToShow).map((task, index) => {
                    return (
                      <tr key={`${task._id}${index}`} className="task-break">
                        <td data-label="Task(s)" className="task-align">
                          <div className="team-member-tasks-content">
                            <Link to={task.projectId ? `/wbs/tasks/${task._id}` : '/'}>
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
                            {canUpdateTask && (
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
                            <TeamMemberTaskIconsInfo />
                          </div>
                          <div>
                            <ReviewButton
                              user={user}
                              myUserId={userId}
                              myRole={userRole}
                              task={task}
                              updateTask={updateTask}
                              style={boxStyle}
                            />
                          </div>
                        </td>
                        {task.hoursLogged != null && task.estimatedHours != null && (
                          <td data-label="Progress" className="team-task-progress">
                            {isAllowedToSeeDeadlineCount && (
                              <span className="deadlineCount" title="Deadline Follow-up Count">
                                {task.deadlineCount === undefined ? 0 : task.deadlineCount}
                              </span>
                            )}
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
          {showWhoHasTimeOff && (onVacation || goingOnVacation) && (
            <td className="taking-time-off-table-column">
              <div className="taking-time-off-content-div">
                <p className="taking-time-off-content-text">
                  {onVacation
                    ? `${user.name} Is Not Available this Week`
                    : `${user.name} Is Not Available Next Week`}
                </p>
                <button
                  type="button"
                  className="taking-time-off-content-btn"
                  onClick={() => setDetailModalIsOpen(true)}
                >
                  Details ?
                </button>
              </div>
              <Modal isOpen={detailModalIsOpen} toggle={detailModalClose}>
                <ModalHeader toggle={detailModalClose}>Time Off Details</ModalHeader>
                {onVacation ? (
                  <ModalBody className="time-off-detail-modal">
                    <h4 className="time-off-detail-modal-title">{`${user.name} Is Not Available this Week`}</h4>
                    <div className="time-off-detail-modal-section">
                      <h5 className="time-off-detail-modal-sub-heading">Starting from:</h5>
                      <p className="time-off-detail-modal-sub-section">
                        {moment(onVacation.startingDate).format('YYYY-MM-DD')}
                      </p>
                    </div>
                    <div className="time-off-detail-modal-section">
                      <h5 className="time-off-detail-modal-sub-heading">Until:</h5>
                      <p className="time-off-detail-modal-sub-section">
                        {moment(onVacation.endingDate).format('YYYY-MM-DD')}
                      </p>
                    </div>
                    <div className="time-off-detail-modal-section">
                      <h5 className="time-off-detail-modal-sub-heading">
                        For The Following reason:
                      </h5>
                      <p className="time-off-detail-modal-sub-section">{onVacation.reason}</p>
                    </div>
                  </ModalBody>
                ) : (
                  <ModalBody className="time-off-detail-modal">
                    <h4 className="time-off-detail-modal-title">{`${user.name} Is Not Available Next Week`}</h4>
                    <div className="time-off-detail-modal-section">
                      <h5 className="time-off-detail-modal-sub-heading">Starting from:</h5>
                      <p className="time-off-detail-modal-sub-section">
                        {moment(goingOnVacation.startingDate).format('YYYY-MM-DD')}
                      </p>
                    </div>
                    <div className="time-off-detail-modal-section">
                      <h5 className="time-off-detail-modal-sub-heading">Until:</h5>
                      <p className="time-off-detail-modal-sub-section">
                        {moment(goingOnVacation.endingDate).format('YYYY-MM-DD')}
                      </p>
                    </div>
                    <div className="time-off-detail-modal-section">
                      <h5 className="time-off-detail-modal-sub-heading">
                        For The Following reason:
                      </h5>
                      <p className="time-off-detail-modal-sub-section">{goingOnVacation.reason}</p>
                    </div>
                  </ModalBody>
                )}
              </Modal>
            </td>
          )}
        </tr>
      </>
    );
  },
);

export default TeamMemberTask;
