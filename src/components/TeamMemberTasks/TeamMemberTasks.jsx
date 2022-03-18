import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Table, Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import moment from 'moment';
import _ from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faCircle, faBell } from '@fortawesome/free-solid-svg-icons';

import './style.css';
import httpService from '../../services/httpService';
import { ENDPOINTS } from '../../utils/URL';
import { fetchAllManagingTeams } from '../../actions/team';
import { getUserProfile } from '../../actions/userProfile';
import Loading from '../common/Loading';
import DiffedText from './DiffedText';

class TeamMemberTasks extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fetched: false,
      teams: [],
      taskNotificationModal: false,
      currentTaskNotifications: [],
    };
  }

  setCurrentTaskNotifications = (taskNotifications) => {
    this.setState({
      ...this.state,
      currentTaskNotifications: taskNotifications,
    });
  };

  handleTaskNotificationRead = () => {
    const taskReadPromises = [];
    const userId = this.state.currentTaskNotifications[0].recipient;
    this.state.currentTaskNotifications.forEach((notification) => {
      taskReadPromises.push(
        httpService.post(ENDPOINTS.MARK_TASK_NOTIFICATION_READ(notification._id)),
      );
    });

    Promise.all(taskReadPromises).then((data) => {
      const newTeamsState = [];
      this.state.teams.forEach((member) => {
        if (member._id === userId) {
          newTeamsState.push({ ...member, taskNotifications: [] });
        } else {
          newTeamsState.push(member);
        }
      });
      this.setState({
        ...this.state,
        teams: newTeamsState,
      });
      this.setCurrentTaskNotifications([]);
      this.toggleTaskNotificationModal();
    });
  };

  toggleTaskNotificationModal = () => {
    this.setState({
      ...this.state,
      taskNotificationModal: !this.state.taskNotificationModal,
    });
  };

  handleOpenTaskNotificationModal = (taskNotifications) => {
    this.setState(
      {
        ...this.state,
        currentTaskNotifications: taskNotifications,
      },
      () => {
        this.toggleTaskNotificationModal();
      },
    );
  };

  async componentDidMount() {
    const userId = this.props.asUser ? this.props.asUser : this.props.auth.user.userid;
    await this.props.getUserProfile(userId);

    //const { leaderBoardData } = this.props
    const { managingTeams } = this.props;
    let allMembers = [];
    const teamMembersPromises = [];
    const memberTimeEntriesPromises = [];
    const teamMemberTasksPromises = [];
    const userProfilePromises = [];
    //const wbsProjectPromises = []
    //const fetchedProjects = []
    const finalData = [];
    const userNotifications = [];
    const taskNotificationPromises = [];
    const allManagingTeams = [];

    // fetch all team members for each time
    managingTeams.forEach((team) => {
      teamMembersPromises.push(httpService.get(ENDPOINTS.TEAM_MEMBERS(team._id)));
    });
    Promise.all(teamMembersPromises).then((data) => {
      for (let i = 0; i < managingTeams.length; i++) {
        allManagingTeams[i] = {
          ...managingTeams[i],
          members: data[i].data,
        };
        allMembers = allMembers.concat(data[i].data);
      }

      // fetch all time entries for current week for all members
      const uniqueMembers = _.uniqBy(allMembers, '_id');
      uniqueMembers.forEach((member) => {
        const fromDate = moment().tz('America/Los_Angeles').startOf('week').subtract(0, 'weeks');

        const toDate = moment().tz('America/Los_Angeles').endOf('week').subtract(0, 'weeks');

        memberTimeEntriesPromises.push(
          httpService
            .get(ENDPOINTS.TIME_ENTRIES_PERIOD(member._id, fromDate, toDate))
            .catch((err) => {}),
        );
      });
      Promise.all(memberTimeEntriesPromises).then((data) => {
        // merge time entries into each user obj
        for (let i = 0; i < uniqueMembers.length; i++) {
          uniqueMembers[i] = {
            ...uniqueMembers[i],
            timeEntries: data[i].data,
          };
        }

        // fetch all tasks for each member
        uniqueMembers.forEach((member) => {
          teamMemberTasksPromises.push(
            httpService.get(ENDPOINTS.TASKS_BY_USERID(member._id)).catch((err) => {
              if (err.status !== 401) {
                console.log(err);
              }
            }),
          );
        });
        Promise.all(teamMemberTasksPromises).then((data) => {
          // merge assigned tasks into each user obj
          for (let i = 0; i < uniqueMembers.length; i++) {
            uniqueMembers[i] = {
              ...uniqueMembers[i],
              tasks: data[i].data,
            };
          }

          // fetch full user profile for each team member
          uniqueMembers.forEach((member) => {
            userProfilePromises.push(
              httpService.get(ENDPOINTS.USER_PROFILE(member._id)).catch((err) => {}),
            );
          });
          Promise.all(userProfilePromises).then(async (data) => {
            try {
              for (let i = 0; i < uniqueMembers.length; i++) {
                const user = uniqueMembers[i];
                const userLeaderBoardData = data.find((member) => member.data._id === user._id);
                let userWeeklyCommittedHours = 0;
                if (userLeaderBoardData) {
                  userWeeklyCommittedHours = userLeaderBoardData.data.weeklyComittedHours;
                }
                uniqueMembers[i] = {
                  ...uniqueMembers[i],
                  weeklyCommittedHours: userWeeklyCommittedHours,
                };
              }

              // for each task, must fetch the projectId of its wbs in order to generate appropriate link
              // currently fetches all projects, should consider refactoring if number of projects increases
              const WBSRes = await httpService.get(ENDPOINTS.WBS_ALL).catch((err) => {
                if (err.status === 401) {
                  loggedOut = true;
                }
              });
              const allWBS = WBSRes.data;

              // calculate hours done in current week and add to user obj for ease of access
              for (let i = 0; i < uniqueMembers.length; i++) {
                let hoursCurrentWeek = 0;
                if (uniqueMembers[i].timeEntries.length > 0) {
                  hoursCurrentWeek = uniqueMembers[i].timeEntries.reduce(
                    (acc, current) => Number(current.hours) + acc,
                    0,
                  );
                }

                finalData[i] = {
                  ...uniqueMembers[i],
                  hoursCurrentWeek,
                };
              }

              // attach projectId of each task onto final user objects
              for (let i = 0; i < uniqueMembers.length; i++) {
                for (let j = 0; j < uniqueMembers[i].tasks.length; j++) {
                  const { wbsId } = uniqueMembers[i].tasks[j];
                  const project = allWBS.find((wbs) => wbs._id === wbsId);
                  finalData[i].tasks[j] = {
                    ...finalData[i].tasks[j],
                    projectId: project ? project.projectId : '',
                  };
                }
              }

              // create array of just user ids to use for querying user tasks notifications
              const uniqueMemberIds = [];
              uniqueMembers.forEach((member) => {
                uniqueMemberIds.push(member._id);
              });
              let loggedOut = false;
              uniqueMemberIds.forEach((memberId) => {
                taskNotificationPromises.push(
                  httpService
                    .get(ENDPOINTS.USER_UNREAD_TASK_NOTIFICATIONS(memberId))
                    .catch((err) => {
                      if (err.status === 401) {
                        loggedOut = true;
                      }
                    }),
                );
              });

              if (!loggedOut) {
                Promise.all(taskNotificationPromises).then((data) => {
                  for (let i = 0; i < uniqueMemberIds.length; i++) {
                    userNotifications.push({
                      userId: uniqueMemberIds[i],
                      taskNotifications: data[i].data,
                    });
                    finalData[i] = {
                      ...finalData[i],
                      taskNotifications: data[i].data,
                    };
                  }
                  // sort each members' tasks by last modified time
                  finalData.forEach((user) => {
                    user.tasks.sort((task1, task2) => {
                      const date1 = new Date(task1.modifiedDatetime).valueOf();
                      const date2 = new Date(task2.modifiedDatetime).valueOf();
                      const timeDifference = date2 - date1;
                      return timeDifference;
                    });
                  });

                  //console.log('final data ', finalData)

                  this.setState({ fetched: true, teams: finalData });
                });
              }
            } catch (err) {
              //catch error on logout
              console.log(err);
            }
          });
        });
      });
    });
  }

  render() {
    const { teams, fetching, fetched } = this.state;
    let teamsList = [];
    if (teams && teams.length > 0) {
      teamsList = teams.map((member, index) => (
        <tr key={index}>
          {/* green if member has met committed hours for the week, red if not */}
          <td>
            {member.hoursCurrentWeek >= member.weeklyComittedHours ? (
              <FontAwesomeIcon style={{ color: 'green' }} icon={faCircle} />
            ) : (
              <FontAwesomeIcon style={{ color: 'red' }} icon={faCircle} />
            )}
          </td>
          <td>
            <Link to={`/userprofile/${member._id}`}>
              {`${member.firstName} ${member.lastName}`}
            </Link>
          </td>
          <td>{`${member.weeklyCommittedHours} / ${member.hoursCurrentWeek}`}</td>
          <td>
            {member.tasks &&
              member.tasks.map((task, index) => (
                <p key={`${task._id}${index}`}>
                  <Link
                    key={index}
                    to={task.projectId ? `/wbs/tasks/${task.wbsId}/${task.projectId}` : '/'}
                  >
                    <span>{`${task.num} ${task.taskName}`} </span>
                  </Link>
                  <span>
                    {member.taskNotifications.find((notification) => {
                      return notification.taskId === task._id;
                    }) ? (
                      <FontAwesomeIcon
                        style={{ color: 'red' }}
                        icon={faBell}
                        onClick={() => {
                          this.handleOpenTaskNotificationModal(member.taskNotifications);
                        }}
                      />
                    ) : null}
                  </span>
                </p>
              ))}
          </td>
          <td>tempprogress</td>
        </tr>
      ));
    }

    return (
      <React.Fragment>
        <div className="container team-member-tasks">
          {fetching || !fetched ? <Loading /> : null}
          <h1>Team Member Tasks</h1>
          <div className="row">
            <Modal
              isOpen={this.state.taskNotificationModal}
              toggle={this.handleOpenTaskNotificationModal}
              size="xl"
            >
              <ModalHeader toggle={this.handleOpenTaskNotificationModal}>
                Task Info Changes
              </ModalHeader>
              <ModalBody>
                {this.state.currentTaskNotifications.length > 0
                  ? this.state.currentTaskNotifications.map((notification, index) => (
                      <React.Fragment key={notification.id}>
                        <h4>{`${notification.taskNum} ${notification.taskName}`}</h4>
                        <Table striped>
                          <thead>
                            <tr>
                              <th></th>
                              <th>Previous</th>
                              <th>New</th>
                              <th>Difference</th>
                            </tr>
                          </thead>
                          <tbody>
                            {notification.oldTaskInfos.oldWhyInfo !==
                            notification.newTaskInfos.newWhyInfo ? (
                              <tr>
                                <th>Why Task is Important</th>
                                <td>{notification.oldTaskInfos.oldWhyInfo}</td>
                                <td>{notification.newTaskInfos.newWhyInfo}</td>
                                <td>
                                  {
                                    <DiffedText
                                      oldText={notification.oldTaskInfos.oldWhyInfo}
                                      newText={notification.newTaskInfos.newWhyInfo}
                                    />
                                  }
                                </td>
                              </tr>
                            ) : null}
                            {notification.oldTaskInfos.oldIntentInfo !==
                            notification.newTaskInfos.newIntentInfo ? (
                              <tr>
                                <th>Intent of Task</th>
                                <td>{notification.oldTaskInfos.oldIntentInfo}</td>
                                <td>{notification.newTaskInfos.newIntentInfo}</td>
                                <td>
                                  {
                                    <DiffedText
                                      oldText={notification.oldTaskInfos.oldIntentInfo}
                                      newText={notification.newTaskInfos.newIntentInfo}
                                    />
                                  }
                                </td>
                              </tr>
                            ) : null}
                            {notification.oldTaskInfos.oldEndstateInfo !==
                            notification.newTaskInfos.newEndstateInfo ? (
                              <tr>
                                <th>Task Endstate</th>
                                <td>{notification.oldTaskInfos.oldEndstateInfo}</td>
                                <td>{notification.newTaskInfos.newEndstateInfo}</td>
                                <td>
                                  {
                                    <DiffedText
                                      oldText={notification.oldTaskInfos.oldEndstateInfo}
                                      newText={notification.newTaskInfos.newEndstateInfo}
                                    />
                                  }
                                </td>
                              </tr>
                            ) : null}
                          </tbody>
                        </Table>
                      </React.Fragment>
                    ))
                  : null}
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onClick={this.handleTaskNotificationRead}>
                  Okay
                </Button>
              </ModalFooter>
            </Modal>
          </div>
          <Table>
            <thead>
              <tr>
                {/* Empty column header for hours completed icon */}
                <th />
                <th>Team Member</th>
                <th width="100px">
                  <FontAwesomeIcon icon={faClock} title="Weekly Committed Hours" />
                  /
                  <FontAwesomeIcon
                    style={{ color: 'green' }}
                    icon={faClock}
                    title="Weekly Completed Hours"
                  />
                </th>
                <th>Tasks(s)</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>{teamsList}</tbody>
          </Table>
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  userId: state.userProfile.id,
  managingTeams: state.userProfile.teams,
  teamsInfo: state.managingTeams,
});

export default connect(mapStateToProps, {
  getUserProfile,
  fetchAllManagingTeams,
})(TeamMemberTasks);
