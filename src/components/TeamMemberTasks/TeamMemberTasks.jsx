import React, { Fragment, useEffect, useState, useCallback } from 'react';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import { Table, Row, Col } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fetchTeamMembersTask, deleteTaskNotification } from '~/actions/task';
import { useDispatch, useSelector, connect } from 'react-redux';
import { MultiSelect } from 'react-multi-select-component';
import SkeletonLoading from '../common/SkeletonLoading';
import { TaskDifferenceModal } from './components/TaskDifferenceModal';
import styles from './style.module.css';
import TaskCompletedModal from './components/TaskCompletedModal';
import EditableInfoModal from '~/components/UserProfile/EditableModal/EditableInfoModal';
import axios from 'axios';
import moment from 'moment';
import TeamMemberTask from './TeamMemberTask';
import TimeEntry from '../Timelog/TimeEntry';
import { hrsFilterBtnColorMap } from '~/constants/colors';
import { toast } from 'react-toastify';
import { getAllTimeOffRequests } from '../../actions/timeOffRequestAction';
import { fetchAllFollowUps } from '../../actions/followUpActions';
import { fetchTeamMembersTaskSuccess } from './actions';

import { ENDPOINTS } from '~/utils/URL';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';

const TeamMemberTasks = React.memo(props => {
  // props from redux store
  const {
    authUser,
    displayUser,
    isLoading,
    usersWithTasks,
    usersWithTimeEntries,
    darkMode,
    filteredUserTeamIds,
  } = props;

  const [showTaskNotificationModal, setTaskNotificationModal] = useState(false);
  const [currentTaskNotifications, setCurrentTaskNotifications] = useState([]);
  const [finishLoading, setFinishLoading] = useState(false);
  const [clickedToShowModal, setClickedToShowModal] = useState(false);
  const [currentTask, setCurrentTask] = useState();
  const [currentUserId, setCurrentUserId] = useState('');
  const [tasks, setTasks] = useState();
  const [updatedTasks, setUpdatedTasks] = useState([]);
  const [showMarkAsDoneModal, setMarkAsDoneModal] = useState(false);
  const [teamList, setTeamList] = useState([]);
  const [timeEntriesList, setTimeEntriesList] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [isTimeFilterActive, setIsTimeFilterActive] = useState(false);
  const [taskModalOption, setTaskModalOption] = useState('');
  const [showWhoHasTimeOff, setShowWhoHasTimeOff] = useState(true);
  const userOnTimeOff = useSelector(state => state.timeOffRequests.onTimeOff);
  const userGoingOnTimeOff = useSelector(state => state.timeOffRequests.goingOnTimeOff);
  const [teamNames, setTeamNames] = useState([]);
  const [teamCodes, setTeamCodes] = useState([]);
  const [colors, setColors] = useState([]);
  const [selectedTeamNames, setSelectedTeamNames] = useState([]);
  const [selectedCodes, setSelectedCodes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);

  const [teamRoles, setTeamRoles] = useState();
  const [usersSelectedTeam] = useState([]);
  const [, setInnerWidth] = useState();
  const [controlUseEfffect] = useState(false);

  useEffect(() => {
    setInnerWidth(window.innerWidth);
  }, [window.innerWidth]);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllTimeOffRequests());
    dispatch(fetchAllFollowUps());
  }, []);

  const closeMarkAsDone = () => {
    setClickedToShowModal(false);
    setMarkAsDoneModal(false);
    setCurrentUserId('');
  };

  const submitTasks = async taskInfo => {
    const url = ENDPOINTS.TASK_UPDATE(taskInfo.taskId);
    try {
      await axios.put(url, taskInfo.updatedTask);
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const onUpdateTask = useCallback(
    (taskId, updatedTask) => {
      const newTask = {
        updatedTask,
        taskId,
      };
      submitTasks(newTask);

      // optimistic update while waiting for data being updated
      const newUsersWithTasks = usersWithTasks.map(userWithTasks => {
        if (userWithTasks.tasks.some(task => task._id === taskId)) {
          const hasResource = updatedTask.resources.some(
            resource => resource.userID === userWithTasks.personId,
          );

          if (hasResource) {
            return {
              ...userWithTasks,
              tasks: userWithTasks.tasks.map(task => (task._id === taskId ? updatedTask : task)),
            };
          }
          return {
            ...userWithTasks,
            tasks: userWithTasks.tasks.filter(task => task._id !== taskId),
          };
        }

        return userWithTasks;
      });
      dispatch(
        fetchTeamMembersTaskSuccess({
          usersWithTasks: newUsersWithTasks,
        }),
      );
    },
    [usersWithTasks],
  );

  const updateTaskStatus = useCallback(
    async (taskId, updatedTask) => {
      const newTask = {
        updatedTask,
        taskId,
      };
      const url = ENDPOINTS.TASK_UPDATE_STATUS(newTask.taskId);
      try {
        await axios.put(url, newTask.updatedTask);
      } catch (error) {
        toast.error('Failed to update task');
      }

      // optimistic update while waiting for data being updated
      const newUsersWithTasks = usersWithTasks.map(userWithTasks => {
        const hasTask = userWithTasks.tasks.some(task => task._id === taskId);

        if (!hasTask) {
          return userWithTasks;
        }

        const hasResource = updatedTask.resources.some(
          resource => resource.userID === userWithTasks.personId,
        );

        return {
          ...userWithTasks,
          tasks: hasResource
            ? userWithTasks.tasks.map(task => (task._id === taskId ? updatedTask : task))
            : userWithTasks.tasks.filter(task => task._id !== taskId),
        };
      });

      dispatch(
        fetchTeamMembersTaskSuccess({
          usersWithTasks: newUsersWithTasks,
        }),
      );
    },
    [usersWithTasks],
  );

  const handleOpenTaskNotificationModal = useCallback((userId, task, taskNotifications = []) => {
    setCurrentUserId(userId);
    setCurrentTask(task);
    setCurrentTaskNotifications(taskNotifications);
    setTaskNotificationModal(prev => !prev);
  }, []);

  const handleMarkAsDoneModal = useCallback((userId, task) => {
    setCurrentUserId(userId);
    setCurrentTask(task);
    setClickedToShowModal(true);
  }, []);

  const handleRemoveFromTaskModal = useCallback((userId, task) => {
    setCurrentUserId(userId);
    setCurrentTask(task);
    setClickedToShowModal(true);
  }, []);

  const handleTaskModalOption = useCallback(option => {
    setTaskModalOption(option);
  }, []);

  const handleTaskNotificationRead = (userId, taskId, taskNotificationId) => {
    // if the authentitated user is seeing it's own notification
    if (currentUserId === authUser.userid) {
      dispatch(deleteTaskNotification(userId, taskId, taskNotificationId));
    }
    handleOpenTaskNotificationModal();
  };

  const getTimeEntriesForPeriod = async selectedPeriodFunc => {
    const oneDayAgo = moment()
      .tz('America/Los_Angeles')
      .subtract(1, 'days')
      .format('YYYY-MM-DD');

    const twoDaysAgo = moment()
      .tz('America/Los_Angeles')
      .subtract(2, 'days')
      .format('YYYY-MM-DD');

    const threeDaysAgo = moment()
      .tz('America/Los_Angeles')
      .subtract(3, 'days')
      .format('YYYY-MM-DD');

    const fourDaysAgo = moment()
      .tz('America/Los_Angeles')
      .subtract(4, 'days')
      .format('YYYY-MM-DD');

    switch (selectedPeriodFunc) {
      case '1': {
        const oneDaysList = usersWithTimeEntries.filter(entry =>
          moment(entry.dateOfWork).isAfter(oneDayAgo),
        );
        setTimeEntriesList(oneDaysList);
        break;
      }
      case '2': {
        const twoDaysList = usersWithTimeEntries.filter(entry =>
          moment(entry.dateOfWork).isAfter(twoDaysAgo),
        );
        setTimeEntriesList(twoDaysList);
        break;
      }
      case '3': {
        const threeDaysList = usersWithTimeEntries.filter(entry =>
          moment(entry.dateOfWork).isAfter(threeDaysAgo),
        );
        setTimeEntriesList(threeDaysList);
        break;
      }
      case '4': {
        const fourDaysList = usersWithTimeEntries.filter(entry =>
          moment(entry.dateOfWork).isAfter(fourDaysAgo),
        );
        setTimeEntriesList(fourDaysList);
        break;
      }
      case '7':
        setTimeEntriesList(usersWithTimeEntries);
        break;
      default:
        setTimeEntriesList([]);
    }

    setFinishLoading(true);
  };

  // Display timelogs based on selected period
  const selectPeriod = period => {
    if (period === selectedPeriod) {
      setIsTimeFilterActive(false);
      setSelectedPeriod(null);
    } else {
      setIsTimeFilterActive(true);
      setSelectedPeriod(period);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line
    renderTeamsList(
      filteredUserTeamIds && filteredUserTeamIds.length > 0 ? filteredUserTeamIds : null,
    );
  }, [filteredUserTeamIds]);

  const renderTeamsList = async team => {
    if (!team) {
      if (usersWithTasks.length > 0) {
        // sort all users by their name

        usersWithTasks.sort((a, b) => (a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1));
        // find currentUser
        const currentUserIndex = usersWithTasks.findIndex(
          user => user.personId === displayUser._id,
        );
        // if current user doesn't have any task, the currentUser cannot be found
        if (usersWithTasks[currentUserIndex]?.tasks.length) {
          // conditional variable for moving current user up front.
          usersWithTasks.unshift(...usersWithTasks.splice(currentUserIndex, 1));
        }
        setTeamList([...usersWithTasks]);
      }
    } else {
      if (selectedTeamNames.length > 0 || selectedCodes.length > 0 || selectedColors.length > 0) {
        setSelectedTeamNames([]);
        setSelectedCodes([]);
        setSelectedColors([]);
      }
      const usersTask = usersWithTasks.filter(item => filteredUserTeamIds.includes(item.personId));
      setTeamList(usersTask);
    }
  };

  const filteredTeamRoles = teams => {
    const roles = {};

    if (teamRoles) {
      teams.forEach(team => {
        if (teamRoles[team.teamName]) {
          Object.entries(teamRoles[team.teamName]).forEach(([role, { id, name }]) => {
            if (!roles[role]) {
              roles[role] = [];
            }
            roles[role].push({ id, name });
          });
        }
      });
    }

    return Object.keys(roles).length === 0 ? '' : roles;
  };

  const renderFilters = () => {
    const teamGroup = {};
    const teamCodeGroup = {};
    const colorGroup = {};
    const teamOptions = [];
    const teamCodeOptions = [];
    const colorOptions = [];
    const rolesGroup = {};

    if (usersWithTasks.length > 0) {
      usersWithTasks.forEach(user => {
        const teamNamesInTasks =
          user.teams !== undefined ? user.teams.map(team => team.teamName) : [];
        const code = user.teamCode || 'noCodeLabel';
        const color = user.weeklySummaryOption || 'noColorLabel';
        const { role } = user;

        teamNamesInTasks.forEach(name => {
          if (teamGroup[name]) {
            teamGroup[name].push(user.personId);
          } else {
            teamGroup[name] = [user.personId];
          }
          if (['Manager', 'Assistant Manager', 'Mentor'].includes(role)) {
            if (!rolesGroup[name]) {
              rolesGroup[name] = {};
            }
            rolesGroup[name][role] = {
              id: user.personId,
              name: user.name,
            };
          }
        });

        if (teamCodeGroup[code]) {
          teamCodeGroup[code].push(user.personId);
        } else {
          teamCodeGroup[code] = [user.personId];
        }

        if (colorGroup[color]) {
          colorGroup[color].push(user.personId);
        } else {
          colorGroup[color] = [user.personId];
        }
      });

      Object.keys(teamGroup)
        .sort((a, b) => a.localeCompare(b))
        .forEach(name => {
          teamOptions.push({
            value: name,
            label: `${name}`,
          });
        });

      Object.keys(teamCodeGroup)
        .sort((a, b) => a.localeCompare(b))
        .forEach(code => {
          if (code !== 'noCodeLabel') {
            teamCodeOptions.push({
              value: code,
              label: `${code}`,
            });
          }
        });

      Object.keys(colorGroup)
        .sort((a, b) => a.localeCompare(b))
        .forEach(color => {
          if (color !== 'noColorLabel') {
            colorOptions.push({
              value: color,
              label: `${color}`,
            });
          }
        });

      setTeamNames(teamOptions);
      setTeamCodes(teamCodeOptions);
      setColors(colorOptions);
      setTeamRoles(rolesGroup);
    }
  };

  useEffect(() => {
    // TeamMemberTasks is only imported in TimeLog component, in which userId is already definitive
    const initialFetching = async () => {
      await dispatch(fetchTeamMembersTask(displayUser._id));
    };
    initialFetching();
  }, [displayUser]);

  useEffect(() => {
    if (clickedToShowModal) {
      setMarkAsDoneModal(true);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (usersWithTasks.length > 0) {
      renderTeamsList(
        !controlUseEfffect || usersSelectedTeam.length === 0 ? null : usersSelectedTeam,
      );
      closeMarkAsDone();
      if (['Administrator', 'Owner', 'Manager', 'Mentor'].some(role => role === displayUser.role)) {
        renderFilters();
      }
    }
  }, [usersWithTasks]);

  useEffect(() => {
    getTimeEntriesForPeriod(selectedPeriod);
  }, [selectedPeriod, usersWithTimeEntries]);

  const handleshowWhoHasTimeOff = () => {
    setShowWhoHasTimeOff(prev => !prev);
  };

  const handleSelectTeamNames = event => {
    // eslint-disable-next-line
    filteredUserTeamIds.length > 0 && setTeamList(usersWithTasks);
    setSelectedTeamNames(event);
  };

  const handleSelectCodeChange = event => {
    // eslint-disable-next-line
    filteredUserTeamIds.length > 0 && setTeamList(usersWithTasks);
    setSelectedCodes(event);
  };

  const handleSelectColorChange = event => {
    // eslint-disable-next-line
    filteredUserTeamIds.length > 0 && setTeamList(usersWithTasks);
    setSelectedColors(event);
  };
  const filterByTeamName = name => {
    return selectedTeamNames.some(option => option.value === name);
  };

  const filterByTeams = teams => {
    if (selectedTeamNames.length === 0) return true;
    let match = false;
    teams.forEach(team => {
      match = match || filterByTeamName(team.teamName);
    });
    return match;
  };

  const filterByColors = color => {
    if (selectedColors.length === 0) return true;
    return selectedColors.some(option => option.value === color);
  };

  const filterByTeamCodes = code => {
    if (selectedCodes.length === 0) return true;
    return selectedCodes.some(option => option.value === code);
  };

  const filterByUserFeatures = user => {
    if (selectedTeamNames.length === 0 && selectedCodes.length === 0 && selectedColors.length === 0)
      return true;

    return (
      filterByTeamCodes(user.teamCode) &&
      filterByColors(user.weeklySummaryOption) &&
      filterByTeams(user.teams)
    );
  };
  return (
    <div
      data-testid="team-member-tasks-container"
      className={`container p-0 ${styles['team-member-tasks']} ${
        darkMode ? ' bg-space-cadet border-left border-right border-secondary' : ''
      }`}
    >
      <header className={styles['header-box']}>
        <section className="d-flex flex-column">
          <h1 className={darkMode ? 'text-light' : ''}>Team Member Tasks</h1>

          {/* Dropdown for selecting a team */}
        </section>
        {finishLoading ? (
          <section className=" hours-btn-container flex-wrap ml-2">
            <div className={styles['hours-btn-div']}>
              <button
                type="button"
                data-testid="show-time-off-btn"
                className={`m-1 ${styles['show-time-off-btn']} ${
                  darkMode ? 'box-shadow-dark' : ''
                }`}
                style={{
                  backgroundColor: showWhoHasTimeOff ? '#17a2b8' : 'white',
                }}
                onClick={handleshowWhoHasTimeOff}
                aria-label="Toggle time off view"
              >
                <FaCalendarAlt
                  data-testid="time-off-calendar-icon"
                  className="show-time-off-calender-svg"
                  fill={showWhoHasTimeOff ? 'white' : '#17a2b8'}
                  size="20px"
                />
                <FaClock
                  size="12px"
                  fill={showWhoHasTimeOff ? 'white' : '#17a2b8'}
                  className="show-time-off-icon"
                  data-testid="show-time-off-icon"
                />
              </button>

              {Object.entries(hrsFilterBtnColorMap).map(([days, color]) => (
                <button
                  key={days}
                  type="button"
                  className={`m-1 responsive-btn-size ${styles['circle-border']} ${
                    darkMode ? 'box-shadow-dark' : 'box-shadow-light'
                  }`}
                  title={`Timelogs submitted in the past ${days} days`}
                  style={{
                    color:
                      selectedPeriod === days && isTimeFilterActive
                        ? `${darkMode ? color : 'white'}`
                        : `${darkMode ? 'white' : color}`,
                    backgroundColor:
                      selectedPeriod === days && isTimeFilterActive
                        ? `${darkMode ? 'white' : color}`
                        : `${darkMode ? color : 'white'}`,
                    border: `1px solid ${color}`,
                  }}
                  onClick={() => selectPeriod(days)}
                >
                  {days}
                  <br />
                  {days === '1' ? 'day' : 'days'}
                </button>
              ))}
              <EditableInfoModal
                areaName="TeamMemberTasksTimeFilterInfoPoint"
                areaTitle="Team Member Task Time Filter"
                fontSize={22}
                isPermissionPage
                role={authUser.role}
                darkMode={darkMode}
              />
            </div>
          </section>
        ) : (
          <SkeletonLoading
            template="TimelogFilter"
            data-testid="skeleton-loading-team-member-tasks-header"
          />
        )}
      </header>
      <TaskDifferenceModal
        isOpen={showTaskNotificationModal}
        taskNotifications={currentTaskNotifications}
        task={currentTask}
        userId={currentUserId}
        toggle={handleOpenTaskNotificationModal}
        onApprove={handleTaskNotificationRead}
        loggedInUserId={authUser.userid}
        darkMode={darkMode}
      />
      {currentUserId !== '' && (
        <TaskCompletedModal
          isOpen={showMarkAsDoneModal}
          updatedTasks={updatedTasks}
          setUpdatedTasks={setUpdatedTasks}
          setTasks={setTasks}
          tasks={tasks}
          submitTasks={submitTasks}
          popupClose={closeMarkAsDone}
          updateTask={onUpdateTask}
          userId={currentUserId}
          task={currentTask}
          setCurrentUserId={setCurrentUserId}
          setClickedToShowModal={setClickedToShowModal}
          taskModalOption={taskModalOption}
          darkMode={darkMode}
        />
      )}
      {['Administrator', 'Owner', 'Manager', 'Mentor'].some(role => role === displayUser.role) && (
        <Row style={{ marginBottom: '10px' }}>
          <Col lg={{ size: 4 }} xs={{ size: 12 }} className="ml-3">
            <span className={darkMode ? 'text-light responsive-font-size' : ''}>Select Team</span>
            <MultiSelect
              className={`multi-select-filter responsive-font-size ${darkMode ? 'dark-mode' : ''}`}
              options={teamNames}
              value={selectedTeamNames}
              onChange={e => {
                handleSelectTeamNames(e);
              }}
            />
          </Col>
          <Col lg={{ size: 4 }} xs={{ size: 12 }} className="ml-3">
            <span className={darkMode ? 'text-light responsive-font-size' : ''}>
              Select Team Code
            </span>
            <MultiSelect
              className={`multi-select-filter responsive-font-size ${darkMode ? 'dark-mode' : ''}`}
              options={teamCodes}
              value={selectedCodes}
              onChange={e => {
                handleSelectCodeChange(e);
              }}
            />
          </Col>
          <Col lg={{ size: 4 }} xs={{ size: 12 }} className="ml-3">
            <span className={darkMode ? 'text-light responsive-font-size' : ''}>Select Color</span>
            <MultiSelect
              className={`multi-select-filter responsive-font-size ${darkMode ? 'dark-mode' : ''}`}
              options={colors}
              value={selectedColors}
              onChange={e => {
                handleSelectColorChange(e);
              }}
            />
          </Col>
        </Row>
      )}
      <div className={styles['task_table-container']}>
        <Table
          className={`${styles['task-table']} ${
            darkMode ? styles['dark-teammember-row'] : styles['light-teammember-row']
          }`}
        >
          <thead
            className={`${styles['pc-component']} ${darkMode ? 'bg-space-cadet' : ''}`}
            style={{ position: 'sticky', top: 0 }}
          >
            <tr>
              <th
                colSpan={3}
                className={`${styles['team-member-tasks-headers']} ${
                  darkMode ? 'bg-space-cadet' : ''
                }`}
              >
                <Table
                  borderless
                  data-testid="team-member-tasks-subtable"
                  className={`${styles['team-member-tasks-subtable']} ${
                    darkMode ? 'text-light' : ''
                  }`}
                >
                  <thead className={darkMode ? 'bg-space-cadet' : ''}>
                    <tr>
                      <th className={darkMode ? 'bg-space-cadet' : ''}>User Status</th>
                      <th
                        className={`${styles['team-member-tasks-headers']} ${
                          styles['team-member-tasks-user-name']
                        } ${darkMode ? 'bg-space-cadet' : ''}`}
                      >
                        Team Member
                      </th>
                      <th
                        className={`${styles['team-member-tasks-headers']} team-clocks ${
                          styles['team-clocks-header']
                        } ${darkMode ? 'bg-space-cadet' : ''}`}
                      >
                        <FontAwesomeIcon
                          style={{ color: darkMode ? 'lightgray' : '' }}
                          icon={faClock}
                          title="Weekly Committed Hours"
                        />
                        /
                        <FontAwesomeIcon
                          style={{ color: 'green' }}
                          icon={faClock}
                          title="Total Hours Completed this Week"
                        />
                        /
                        <FontAwesomeIcon
                          style={{ color: 'red' }}
                          icon={faClock}
                          title="Total Remaining Hours"
                        />
                      </th>
                    </tr>
                  </thead>
                </Table>
              </th>
              <th
                colSpan={3}
                className={`team-member-tasks-headers ${darkMode ? 'bg-space-cadet' : ''}`}
              >
                <Table
                  borderless
                  className={`team-member-tasks-subtable ${darkMode ? 'text-light' : ''}`}
                >
                  <thead className={darkMode ? 'bg-space-cadet' : ''}>
                    <tr>
                      <th className={darkMode ? 'bg-space-cadet' : ''}>Tasks(s)</th>
                      <th
                        className={`${styles['team-task-progress']} ${
                          darkMode ? 'bg-space-cadet' : ''
                        }`}
                      >
                        Progress
                      </th>
                      {displayUser.role === 'Administrator' ? (
                        <th className={darkMode ? 'bg-space-cadet' : ''}>Status</th>
                      ) : null}
                    </tr>
                  </thead>
                </Table>
              </th>
            </tr>
          </thead>
          <tbody className={darkMode ? 'bg-yinmn-blue dark-mode' : ''}>
            {teamList.length === 0 ? (
              <SkeletonLoading
                template="TeamMemberTasks"
                data-testid="skeleton-loading-team-member-tasks-row"
              />
            ) : (
              teamList
                .filter(user => filterByUserFeatures(user))
                .map(user => {
                  if (!isTimeFilterActive) {
                    return (
                      <TeamMemberTask
                        user={user}
                        userPermission={props?.auth?.user?.permissions?.frontPermissions?.includes(
                          'putReviewStatus',
                        )}
                        teamRoles={
                          user.teams !== undefined && user.teams.length > 0
                            ? filteredTeamRoles(user.teams)
                            : ''
                        }
                        key={user.personId}
                        handleOpenTaskNotificationModal={handleOpenTaskNotificationModal}
                        handleMarkAsDoneModal={handleMarkAsDoneModal}
                        handleRemoveFromTaskModal={handleRemoveFromTaskModal}
                        handleTaskModalOption={handleTaskModalOption}
                        userRole={displayUser.role}
                        updateTaskStatus={updateTaskStatus}
                        userId={displayUser._id}
                        showWhoHasTimeOff={showWhoHasTimeOff}
                        onTimeOff={userOnTimeOff[user.personId]}
                        goingOnTimeOff={userGoingOnTimeOff[user.personId]}
                        displayUser={displayUser}
                      />
                    );
                  }
                  return (
                    <Fragment key={user.personId}>
                      <TeamMemberTask
                        user={user}
                        userPermission={props?.auth?.user?.permissions?.frontPermissions?.includes(
                          'putReviewStatus',
                        )}
                        teamRoles={
                          user.teams !== undefined && user.teams.length > 0
                            ? filteredTeamRoles(user.teams)
                            : ''
                        }
                        handleOpenTaskNotificationModal={handleOpenTaskNotificationModal}
                        handleMarkAsDoneModal={handleMarkAsDoneModal}
                        handleRemoveFromTaskModal={handleRemoveFromTaskModal}
                        handleTaskModalOption={handleTaskModalOption}
                        userRole={displayUser.role}
                        updateTaskStatus={updateTaskStatus}
                        userId={displayUser._id}
                        showWhoHasTimeOff={showWhoHasTimeOff}
                        onTimeOff={userOnTimeOff[user.personId]}
                        goingOnTimeOff={userGoingOnTimeOff[user.personId]}
                      />
                      {timeEntriesList.length > 0 &&
                        timeEntriesList
                          .filter(timeEntry => timeEntry.personId === user.personId)
                          .map(timeEntry => (
                            <tr className="table-row" data-testid="table-row" key={timeEntry._id}>
                              <td colSpan={6} style={{ padding: 0 }}>
                                <TimeEntry
                                  from="TaskTab"
                                  data={timeEntry}
                                  displayYear
                                  key={timeEntry._id}
                                  timeEntryUserProfile={timeEntry.userProfile}
                                />
                              </td>
                            </tr>
                          ))}
                    </Fragment>
                  );
                })
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
});

const mapStateToProps = state => ({
  authUser: state.auth.user,
  displayUser: state.userProfile,
  isLoading: state.teamMemberTasks.isLoading,
  usersWithTasks: state.teamMemberTasks.usersWithTasks,
  usersWithTimeEntries: state.teamMemberTasks.usersWithTimeEntries,
  darkMode: state.theme.darkMode,
});

TeamMemberTasks.displayName = 'TeamMemberTasks';

export default connect(mapStateToProps, null)(TeamMemberTasks);
