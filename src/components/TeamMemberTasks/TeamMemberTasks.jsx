/* eslint-disable max-len */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-plusplus */
/* eslint-disable indent */
import { faClock } from '@fortawesome/free-solid-svg-icons';
import _ from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector, connect } from 'react-redux';
import Loading from '../common/Loading';
import { TaskDifferenceModal } from './components/TaskDifferenceModal';
import { fetchTeamMembersTask, deleteTaskNotification } from 'actions/task';
import { getUserProfile } from '../../actions/userProfile';
import { fetchAllManagingTeams } from '../../actions/team';
import { getTeamMemberTasksData } from './selectors';
import { getTimeEntriesForPeriod } from '../../actions/timeEntries';
import { dataLoading, finishLoading } from './actions';
import TeamMemberTimeEntry from './TeamMemberTimeEntry';
import TeamMember from './TeamMember';
import moment from 'moment';
import './style.css';
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';

const TeamMemberTasks = props => {
  const [showTaskNotificationModal, setTaskNotificationModal] = useState(false);
  const [currentTaskNotifications, setCurrentTaskNotifications] = useState([]);
  const [currentTask, setCurrentTask] = useState();
  const [currentUserId, setCurrentUserId] = useState();
  const [teamList, setTeamList] = useState([]);
  const [timeEntriesList, setTimeEntriesList] = useState([]);
  const [timeEntriesActive, setTimeEntriesActive] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState();
  const { isLoading, usersWithTasks } = useSelector(getTeamMemberTasksData);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchTeamMembersTask());
    renderTeamsList();
  }, []);

  const handleOpenTaskNotificationModal = (userId, task, taskNotifications = []) => {
    setCurrentUserId(userId);
    setCurrentTask(task);
    setCurrentTaskNotifications(taskNotifications);
    setTaskNotificationModal(!showTaskNotificationModal);
  };

  const handleTaskNotificationRead = (userId, taskId, taskNotificationId) => {
    dispatch(deleteTaskNotification(userId, taskId, taskNotificationId));
    handleOpenTaskNotificationModal();
  };

  const getTimeEntriesForPeriod = async period => {
    if (selectedPeriod === period && timeEntriesList.length > 0) {
      setTimeEntriesActive(true);
      return;
    }
    setSelectedPeriod(period);
    let newList = [];
    const fromDate = moment()
      .tz('America/Los_Angeles')
      .subtract(period, 'hours')
      .format('YYYY-MM-DD');

    const toDate = moment()
      .tz('America/Los_Angeles')
      .format('YYYY-MM-DD');

    dispatch(dataLoading());

    const requests = teamList.map(async user => {
      const url = ENDPOINTS.TIME_ENTRIES_PERIOD(user.personId, fromDate, toDate);
      return axios.get(url);
    });
    const responses = await Promise.all(requests);
    for (const response of responses) {
      if (response.data.length > 0) newList.push(...response.data);
    }

    setTimeEntriesList(newList);
    dispatch(finishLoading());
    setTimeEntriesActive(true);
  };

  const renderTeamsList = () => {
    if (usersWithTasks && usersWithTasks.length > 0) {
      const userRole = props.auth.user.role;
      const userId = props.auth.user.userid;
      // give different users different views
      let filteredMembers = usersWithTasks.filter(member => {
        if (userRole === 'Volunteer' || userRole === 'Core Team') {
          return member.role === 'Volunteer' || member.role === 'Core Team';
        } else if (userRole === 'Manager' || userRole === 'Mentor') {
          return (
            member.role === 'Volunteer' ||
            member.role === 'Core Team' ||
            member.role === 'Manager' ||
            member.role === 'Mentor'
          );
        } else {
          return member;
        }
      });

      //sort all users by their name
      filteredMembers.sort((a, b) => {
        let filteredMembersA = a.name.toLowerCase();
        let filteredMembersB = b.name.toLowerCase();

        if (filteredMembersA < filteredMembersB) return -1;
        if (filteredMembersA > filteredMembersB) return 1;
        return 0;
      });

      //find currentUser
      const currentUser = filteredMembers.find(user => user.personId === userId);
      // if current user doesn't have any task, the currentUser cannot be found

      if (currentUser) {
        //conditional variable for moving current user up front.
        let moveCurrentUserFront = false;

        //Does the user has at least one task with project Id and task id assigned. Then set the current user up front.
        for (const task of currentUser.tasks) {
          if (task.wbsId && task.projectId) {
            moveCurrentUserFront = true;
            break;
          }
        }
        //if needs to move current user up front, first remove current user from filterMembers. Then put the current user on top of the list.
        if (moveCurrentUserFront) {
          //removed currentUser
          filteredMembers = filteredMembers.filter(user => user.personId !== userId);
          //push currentUser on top of the array.
          filteredMembers.unshift(currentUser);
        }
      }
      setTeamList([...filteredMembers]);
    }
  };

  return (
    <div className="container team-member-tasks">
      <header className="header-box">
        <h1>Team Member Tasks</h1>
        <div className="header-box_btn-group">
          <button
            type="button"
            className="hours-btn btn-clear-timelogs"
            onClick={() => setTimeEntriesActive(false)}
          >
            Clear Timelogs
          </button>
          <button
            type="button"
            className="hours-btn btn-24"
            title="Timelogs submitted in the past 24 hours"
            style={{ backgroundColor: '#3498db' }}
            onClick={() => getTimeEntriesForPeriod(24)}
          >
            24h
          </button>
          <button
            type="button"
            className="hours-btn btn-48"
            title="Timelogs submitted in the past 48 hours"
            style={{ backgroundColor: '#c0392b' }}
            onClick={() => getTimeEntriesForPeriod(48)}
          >
            48h
          </button>
          <button
            type="button"
            className="hours-btn btn-72"
            title="Timelogs submitted in the past 72 hours"
            style={{ backgroundColor: '#27ae60' }}
            onClick={() => getTimeEntriesForPeriod(72)}
          >
            72h
          </button>
        </div>
      </header>
      <TaskDifferenceModal
        isOpen={showTaskNotificationModal}
        taskNotifications={currentTaskNotifications}
        task={currentTask}
        userId={currentUserId}
        toggle={handleOpenTaskNotificationModal}
        onApprove={handleTaskNotificationRead}
        loggedInUserId={props.auth.user.userid}
      />
      <div>
        <ul className="team-member-tasks-nav">
          <li>Team Member</li>
          <li className="team-clocks">
            <FontAwesomeIcon icon={faClock} title="Weekly Committed Hours" />
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
          </li>
          <li>Task(s)</li>
          <li className="team-task-progress">Progress</li>
        </ul>
        <div>
          {isLoading ? (
            <Loading className="loading-animation" />
          ) : (
            teamList.map(user => {
              if (!timeEntriesActive) {
                return <TeamMember user={user} key={user.personId} />;
              } else {
                return (
                  <>
                    <TeamMember user={user} key={user.personId} />
                    {timeEntriesList
                      .filter(timeEntry => timeEntry.personId === user.personId)
                      .map(timeEntry => (
                        <TeamMemberTimeEntry data={timeEntry} key={timeEntry._id} />
                      ))}
                  </>
                );
              }
            })
          )}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = state => ({
  // timeEntriesForPeriod: state.timeEntries.period,
  auth: state.auth,
  userId: state.userProfile._id,
  managingTeams: state.userProfile.teams,
  teamsInfo: state.managingTeams,
});

export default connect(mapStateToProps, {
  getUserProfile,
  fetchAllManagingTeams,
  getTimeEntriesForPeriod,
})(TeamMemberTasks);
