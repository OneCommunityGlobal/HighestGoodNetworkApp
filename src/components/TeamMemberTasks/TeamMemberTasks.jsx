/* eslint-disable max-len */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-plusplus */
/* eslint-disable indent */
import React, { useState, useEffect } from 'react';
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

const TeamMemberTasks = (props) => {
    const [fetched, setFetched] = useState(false);
    const [teams, setTeams] = useState([]);
    const [taskNotificationModal, setTaskNotificationModal] = useState(false);
    const [currentTaskNotifications, setCurrentTaskNotifications] = useState([]);

    const setTaskNotifications = (taskNotifications) => {
        setCurrentTaskNotifications(taskNotifications);
    };

    const handleTaskNotificationRead = () => {
        const taskReadPromises = [];
        const userId = currentTaskNotifications[0].recipient;
        currentTaskNotifications.forEach((notification) => {
          taskReadPromises.push(
            httpService.post(ENDPOINTS.MARK_TASK_NOTIFICATION_READ(notification._id)),
          );
        });
    
        Promise.all(taskReadPromises).then((data) => {
          const newTeamsState = [];
          teams.forEach((member) => {
            if (member._id === userId) {
              newTeamsState.push({ ...member, taskNotifications: [] });
            } else {
              newTeamsState.push(member);
            }
          });
          setTeams(newTeamsState);
          setTaskNotifications([]);
          toggleTaskNotificationModal();
        });
    };

    const toggleTaskNotificationModal = () => {
        setTaskNotificationModal(!taskNotificationModal);
    };

    const handleOpenTaskNotificationModal = (taskNotifications) => {
        setCurrentTaskNotifications(taskNotifications);
        toggleTaskNotificationModal();
    };

    useEffect(() => {
      const fetchData = async () => {
        const userId = props.asUser ? props.asUser : props.auth.user.userid;
        await props.getUserProfile(userId);

        // const { leaderBoardData } = props
        const { managingTeams } = props;
        let allMembers = [];
        const teamMembersPromises = [];
        const memberTimeEntriesPromises = [];
        const teamMemberTasksPromises = [];
        const userProfilePromises = [];

        //to fetch users in a team
        const usersInATeamPromises = [];
        // const wbsProjectPromises = []
        // const fetchedProjects = []
        const finalData = [];
        const userNotifications = [];
        const taskNotificationPromises = [];
        const allManagingTeams = [];

        const teamMembers = [];

        // fetch all team members for each team
        managingTeams.forEach((team) => {
            teamMembersPromises.push(httpService.get(ENDPOINTS.TEAM_MEMBERS(team._id)));
        });

        Promise.all(teamMembersPromises).then((data) => {
          // console.log('team members', data);
          teamMembers.push(data[0].data);
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
            const fromDate = moment()
              .tz('America/Los_Angeles')
              .startOf('week')
              .subtract(0, 'weeks');
        
            const toDate = moment()
              .tz('America/Los_Angeles')
              .endOf('week')
              .subtract(0, 'weeks');
        
            memberTimeEntriesPromises.push(
              httpService.get(ENDPOINTS.TIME_ENTRIES_PERIOD(member._id, fromDate, toDate)).catch((err) => { }),
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
              teamMemberTasksPromises.push(httpService.get(ENDPOINTS.TASKS_BY_USERID(member._id)).catch((err) => { if (err.status !== 401) { console.log(err); } }));
            });
                        
            Promise.all(teamMemberTasksPromises).then(async (data) => {
              // merge assigned tasks into each user obj
              for (let i = 0; i < uniqueMembers.length; i++) {
                uniqueMembers[i] = {
                  ...uniqueMembers[i],
                  tasks: data[i].data,
                };
              }

              /////////////////////////////////////////////////////////////////////////////////
        
              console.log('team members: ', teamMembers[0]);

              console.log(uniqueMembers.length, teamMembers[0].length);

              try { 
                for (let i = 0; i < uniqueMembers.length; i++) {
                  const user = uniqueMembers[i];
                  const userLeaderBoardData = teamMembers[0].find(member => member._id === user._id);
                  let userWeeklyCommittedHours = 0;
                  if (userLeaderBoardData) {
                    userWeeklyCommittedHours = userLeaderBoardData.weeklyComittedHours;
                  }
                  uniqueMembers[i] = {
                    ...uniqueMembers[i],
                    weeklyCommittedHours: userWeeklyCommittedHours,
                  };
                }
      
                // for each task, must fetch the projectId of its wbs in order to generate appropriate link
                // currently fetches all projects, should consider refactoring if number of projects increases
                const WBSRes = await httpService.get(ENDPOINTS.WBS_ALL).catch((err) => { if (err.status === 401) { loggedOut = true; } });
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
                    const project = allWBS.find(wbs => wbs._id === wbsId);
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
      
                if (!loggedOut) {
                    // sort each members' tasks by last modified time
                    finalData.forEach((user) => {
                      user.tasks.sort((task1, task2) => {
                        const date1 = new Date(task1.modifiedDatetime).valueOf();
                        const date2 = new Date(task2.modifiedDatetime).valueOf();
                        const timeDifference = date2 - date1;
                        return timeDifference;
                      });
                    });
      
                    // console.log('final data ', finalData)
                    setFetched(true);
                    setTeams(finalData);
                  // });
                }
              } catch (err) {
                // catch error on logout
                console.log('err1', err);
              }

              ///////////////////////////////////////////////////

            }); 
          }); 
        }); 
      }; 
      fetchData();
    }, []);

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
                    <span>
                      {`${task.num} ${task.taskName}`} 
                    </span>
                  </Link>
                  {/* <span>
                    {member.taskNotifications.find(notification => {
                      return notification.taskId === task._id
                    }) ? (
                      <FontAwesomeIcon
                        style={{ color: 'red' }}
                        icon={faBell}
                        onClick={() => {
                          handleOpenTaskNotificationModal(member.taskNotifications);
                        }}
                      />
                    ) : null}
                  </span> */}
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
          {!fetched ? <Loading /> : null}
          <h1>Team Member Tasks</h1>
          <div className="row">
            <Modal
              isOpen={taskNotificationModal}
              toggle={handleOpenTaskNotificationModal}
              size="xl"
            >
              <ModalHeader toggle={handleOpenTaskNotificationModal}>
                Task Info Changes
              </ModalHeader>
              <ModalBody>
                {currentTaskNotifications.length > 0
                  ? currentTaskNotifications.map((notification, index) => (
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
                <Button color="primary" onClick={handleTaskNotificationRead}>
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
};

const mapStateToProps = state => ({
  auth: state.auth,
  userId: state.userProfile.id,
  managingTeams: state.userProfile.teams,
  teamsInfo: state.managingTeams,
});

export default connect(mapStateToProps, {
  getUserProfile,
  fetchAllManagingTeams,
})(TeamMemberTasks);
