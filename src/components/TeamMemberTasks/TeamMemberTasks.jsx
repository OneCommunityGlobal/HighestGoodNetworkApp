// TeamMemberTasks.jsx
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

  // Keep width reactive without putting window.innerWidth in deps (which never triggers)
  useEffect(() => {
    const handleResize = () => setInnerWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllTimeOffRequests());
    dispatch(fetchAllFollowUps());
  }, [dispatch]);

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
      const newTask = { updatedTask, taskId };
      submitTasks(newTask);

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

      dispatch(fetchTeamMembersTaskSuccess({ usersWithTasks: newUsersWithTasks }));
    },
    [dispatch, usersWithTasks],
  );

  const updateTaskStatus = useCallback(
    async (taskId, updatedTask) => {
      const newTask = { updatedTask, taskId };
      const url = ENDPOINTS.TASK_UPDATE_STATUS(newTask.taskId);

      try {
        await axios.put(url, newTask.updatedTask);
      } catch (error) {
        toast.error('Failed to update task');
      }

      const newUsersWithTasks = usersWithTasks.map(userWithTasks => {
        const hasTask = userWithTasks.tasks.some(task => task._id === taskId);
        if (!hasTask) return userWithTasks;

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

      dispatch(fetchTeamMembersTaskSuccess({ usersWithTasks: newUsersWithTasks }));
    },
    [dispatch, usersWithTasks],
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
    if (currentUserId === authUser.userid) {
      dispatch(deleteTaskNotification(userId, taskId, taskNotificationId));
    }
    handleOpenTaskNotificationModal();
  };

  const getTimeEntriesForPeriod = async selectedPeriodFunc => {
    const base = moment().tz('America/Los_Angeles');

    const oneDayAgo = base
      .clone()
      .subtract(1, 'days')
      .format('YYYY-MM-DD');
    const twoDaysAgo = base
      .clone()
      .subtract(2, 'days')
      .format('YYYY-MM-DD');
    const threeDaysAgo = base
      .clone()
      .subtract(3, 'days')
      .format('YYYY-MM-DD');
    const fourDaysAgo = base
      .clone()
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
    renderTeamsList(
      filteredUserTeamIds && filteredUserTeamIds.length > 0 ? filteredUserTeamIds : null,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredUserTeamIds]);

  const renderTeamsList = async team => {
    if (!team) {
      if (usersWithTasks.length > 0) {
        const sorted = [...usersWithTasks].sort((a, b) =>
          a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1,
        );

        const currentUserIndex = sorted.findIndex(user => user.personId === displayUser._id);

        if (sorted[currentUserIndex]?.tasks?.length) {
          sorted.unshift(...sorted.splice(currentUserIndex, 1));
        }
        setTeamList(sorted);
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
            if (!roles[role]) roles[role] = [];
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
          if (teamGroup[name]) teamGroup[name].push(user.personId);
          else teamGroup[name] = [user.personId];

          if (['Manager', 'Assistant Manager', 'Mentor'].includes(role)) {
            if (!rolesGroup[name]) rolesGroup[name] = {};
            rolesGroup[name][role] = { id: user.personId, name: user.name };
          }
        });

        if (teamCodeGroup[code]) teamCodeGroup[code].push(user.personId);
        else teamCodeGroup[code] = [user.personId];

        if (colorGroup[color]) colorGroup[color].push(user.personId);
        else colorGroup[color] = [user.personId];
      });

      Object.keys(teamGroup)
        .sort((a, b) => a.localeCompare(b))
        .forEach(name => {
          teamOptions.push({ value: name, label: `${name}` });
        });

      Object.keys(teamCodeGroup)
        .sort((a, b) => a.localeCompare(b))
        .forEach(code => {
          if (code !== 'noCodeLabel') teamCodeOptions.push({ value: code, label: `${code}` });
        });

      Object.keys(colorGroup)
        .sort((a, b) => a.localeCompare(b))
        .forEach(color => {
          if (color !== 'noColorLabel') colorOptions.push({ value: color, label: `${color}` });
        });

      setTeamNames(teamOptions);
      setTeamCodes(teamCodeOptions);
      setColors(colorOptions);
      setTeamRoles(rolesGroup);
    }
  };

  useEffect(() => {
    const initialFetching = async () => {
      await dispatch(fetchTeamMembersTask(displayUser._id));
    };
    initialFetching();
  }, [dispatch, displayUser]);

  useEffect(() => {
    if (clickedToShowModal) setMarkAsDoneModal(true);
  }, [clickedToShowModal]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usersWithTasks]);

  useEffect(() => {
    getTimeEntriesForPeriod(selectedPeriod);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod, usersWithTimeEntries]);

  const handleshowWhoHasTimeOff = () => {
    setShowWhoHasTimeOff(prev => !prev);
  };

  const handleSelectTeamNames = event => {
    filteredUserTeamIds?.length > 0 && setTeamList(usersWithTasks);
    setSelectedTeamNames(event);
  };

  const handleSelectCodeChange = event => {
    filteredUserTeamIds?.length > 0 && setTeamList(usersWithTasks);
    setSelectedCodes(event);
  };

  const handleSelectColorChange = event => {
    filteredUserTeamIds?.length > 0 && setTeamList(usersWithTasks);
    setSelectedColors(event);
  };

  const filterByTeamName = name => selectedTeamNames.some(option => option.value === name);

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

  const canSeeFilters = ['Administrator', 'Owner', 'Manager', 'Mentor'].some(
    role => role === displayUser.role,
  );

  return (
    <div
      data-testid="team-member-tasks-container"
      className={[
        styles.container,
        styles.p0,
        styles['team-member-tasks'],
        darkMode ? styles.darkContainer : '',
      ].join(' ')}
    >
      <header className={styles['header-box']}>
        <section className={[styles.dFlex, styles.flexColumn].join(' ')}>
          <h1 className={darkMode ? styles.textLight : ''}>Team Member Tasks</h1>
        </section>

        {finishLoading ? (
          <section
            className={[styles['hours-btn-container'], styles.flexWrap, styles.ml2].join(' ')}
          >
            <div className={styles['hours-btn-div']}>
              <button
                type="button"
                data-testid="show-time-off-btn"
                className={[
                  styles.m1,
                  styles['show-time-off-btn'],
                  darkMode ? styles.boxShadowDark : '',
                ].join(' ')}
                style={{ backgroundColor: showWhoHasTimeOff ? '#17a2b8' : 'white' }}
                onClick={handleshowWhoHasTimeOff}
                aria-label="Toggle time off view"
              >
                <FaCalendarAlt
                  data-testid="time-off-calendar-icon"
                  className={styles['show-time-off-calender-svg']}
                  fill={showWhoHasTimeOff ? 'white' : '#17a2b8'}
                  size="20px"
                />
                <FaClock
                  size="12px"
                  fill={showWhoHasTimeOff ? 'white' : '#17a2b8'}
                  className={styles['show-time-off-icon']}
                  data-testid="show-time-off-icon"
                />
              </button>

              {Object.entries(hrsFilterBtnColorMap).map(([days, color]) => (
                <button
                  key={days}
                  type="button"
                  className={[
                    styles.m1,
                    styles.responsiveBtnSize,
                    styles['circle-border'],
                    darkMode ? styles.boxShadowDark : styles.boxShadowLight,
                  ].join(' ')}
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

      {canSeeFilters && (
        <Row className={styles.filtersRow}>
          <Col lg={{ size: 4 }} xs={{ size: 12 }} className={styles.filtersCol}>
            <span
              className={darkMode ? [styles.textLight, styles.responsiveFontSize].join(' ') : ''}
            >
              Select Team
            </span>
            <MultiSelect
              className={[
                styles.multiSelectFilter,
                styles.responsiveFontSize,
                darkMode ? styles.multiSelectDark : '',
              ].join(' ')}
              options={teamNames}
              value={selectedTeamNames}
              onChange={handleSelectTeamNames}
            />
          </Col>

          <Col lg={{ size: 4 }} xs={{ size: 12 }} className={styles.filtersCol}>
            <span
              className={darkMode ? [styles.textLight, styles.responsiveFontSize].join(' ') : ''}
            >
              Select Team Code
            </span>
            <MultiSelect
              className={[
                styles.multiSelectFilter,
                styles.responsiveFontSize,
                darkMode ? styles.multiSelectDark : '',
              ].join(' ')}
              options={teamCodes}
              value={selectedCodes}
              onChange={handleSelectCodeChange}
            />
          </Col>

          <Col lg={{ size: 4 }} xs={{ size: 12 }} className={styles.filtersCol}>
            <span
              className={darkMode ? [styles.textLight, styles.responsiveFontSize].join(' ') : ''}
            >
              Select Color
            </span>
            <MultiSelect
              className={[
                styles.multiSelectFilter,
                styles.responsiveFontSize,
                darkMode ? styles.multiSelectDark : '',
              ].join(' ')}
              options={colors}
              value={selectedColors}
              onChange={handleSelectColorChange}
            />
          </Col>
        </Row>
      )}

      <div className={styles['task_table-container']}>
        <Table
          className={[
            styles['task-table'],
            darkMode ? styles['dark-teammember-row'] : styles['light-teammember-row'],
          ].join(' ')}
        >
          <thead
            className={[styles['pc-component'], darkMode ? styles.darkStickyHeader : ''].join(' ')}
            style={{ position: 'sticky', top: 0 }}
          >
            <tr>
              <th
                colSpan={3}
                className={[
                  styles['team-member-tasks-headers'],
                  darkMode ? styles.darkStickyHeader : '',
                ].join(' ')}
              >
                <Table
                  borderless
                  data-testid="team-member-tasks-subtable"
                  className={[
                    styles['team-member-tasks-subtable'],
                    darkMode ? styles.textLight : '',
                  ].join(' ')}
                >
                  <thead className={darkMode ? styles.darkStickyHeader : ''}>
                    <tr>
                      <th className={darkMode ? styles.darkStickyHeader : ''}>User Status</th>
                      <th
                        className={[
                          styles['team-member-tasks-headers'],
                          styles['team-member-tasks-user-name'],
                          darkMode ? styles.darkStickyHeader : '',
                        ].join(' ')}
                      >
                        Team Member
                      </th>
                      <th
                        className={[
                          styles['team-member-tasks-headers'],
                          styles['team-clocks'],
                          styles['team-clocks-header'],
                          darkMode ? styles.darkStickyHeader : '',
                        ].join(' ')}
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
                className={[
                  styles['team-member-tasks-headers'],
                  darkMode ? styles.darkStickyHeader : '',
                ].join(' ')}
              >
                <Table
                  borderless
                  className={[
                    styles['team-member-tasks-subtable'],
                    darkMode ? styles.textLight : '',
                  ].join(' ')}
                >
                  <thead className={darkMode ? styles.darkStickyHeader : ''}>
                    <tr>
                      <th className={darkMode ? styles.darkStickyHeader : ''}>Tasks(s)</th>
                      <th
                        className={[
                          styles['team-task-progress'],
                          darkMode ? styles.darkStickyHeader : '',
                        ].join(' ')}
                      >
                        Progress
                      </th>
                      {displayUser.role === 'Administrator' ? (
                        <th className={darkMode ? styles.darkStickyHeader : ''}>Status</th>
                      ) : null}
                    </tr>
                  </thead>
                </Table>
              </th>
            </tr>
          </thead>

          <tbody className={darkMode ? styles.darkTbody : ''}>
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
                        key={user.personId}
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
                            <tr
                              className={styles['table-row']}
                              data-testid="table-row"
                              key={timeEntry._id}
                            >
                              <td colSpan={6} className={styles.p0}>
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
