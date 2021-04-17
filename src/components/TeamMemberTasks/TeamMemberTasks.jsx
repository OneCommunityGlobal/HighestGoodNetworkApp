import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Table, 
         Progress, 
         Collapse, 
         Button, 
         Modal, 
         ModalHeader, 
         ModalBody, 
         ModalFooter,
         Tooltip } from 'reactstrap'
import moment from 'moment'
import _ from 'lodash'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, 
         faCircle, 
         faBell, 
         faAngleDown, 
         faAngleRight, 
         faEye } from '@fortawesome/free-solid-svg-icons'
import { faCaretSquareRight, 
         faCaretSquareDown } from '@fortawesome/free-regular-svg-icons'         
import './style.css'
import httpService from '../../services/httpService'
import { ENDPOINTS } from '../../utils/URL'
import { fetchAllManagingTeams } from '../../actions/team'
import { getUserProfile } from '../../actions/userProfile'
import Loading from '../common/Loading'
import DiffedText from './DiffedText'

import {getcolor, getprogress} from '../../utils/effortColors'

class TeamMemberTasks extends Component {
  constructor(props) {
    super(props)
    this.state = {
      fetched: false,
      teams: [],
      taskNotificationModal: false,
      currentTaskNotifications: [],
      collapse: NaN,
      currentUserRole: '',
      collapseAll: false,
      tooltipExpandAll: false,
      tooltipTeamMember: false,
      tooltipBlackClockIcon: false,
      tooltipGreenClockIcon: false,
      tooltipTasks: false,
      tooltipProgress: false,
    }
    this.toggleCollapse = this.toggleCollapse.bind(this);
    this.toggleCollapseAll = this.toggleCollapseAll.bind(this);
    
    this.tooltipExpandAllOpen = this.tooltipExpandAllOpen.bind(this);
    this.tooltipTeamMemberOpen = this.tooltipTeamMemberOpen.bind(this);
    this.tooltipBlackClockIconOpen = this.tooltipBlackClockIconOpen.bind(this);
    this.tooltipGreenClockIconOpen = this.tooltipGreenClockIconOpen.bind(this);
    this.tooltipTasksOpen = this.tooltipTasksOpen.bind(this);
    this.tooltipProgressOpen = this.tooltipProgressOpen.bind(this);
  }

  // Expand icons

  toggleCollapse(e) {
    let event = e.target.dataset.event;
    this.setState({ collapse: this.state.collapse === Number(event) ? NaN : Number(event) });
  }

  toggleCollapseAll() {
    this.setState({ collapseAll: !this.state.collapseAll});
    this.setState({ collapse: NaN})
    console.log(this.state.collapseAll)
    console.log(this.state.collapse)
  }

  // Tooltips Section

  tooltipExpandAllOpen(e) {
    this.setState({ tooltipExpandAll: !this.state.tooltipExpandAll });
  }

  tooltipTeamMemberOpen(e) {
    this.setState({ tooltipTeamMember: !this.state.tooltipTeamMember });
  }

  tooltipBlackClockIconOpen(e) {
    this.setState({ tooltipBlackClockIcon: !this.state.tooltipBlackClockIcon });
  }

  tooltipGreenClockIconOpen(e) {
    this.setState({ tooltipGreenClockIcon: !this.state.tooltipGreenClockIcon });
  }

  tooltipTasksOpen(e) {
    this.setState({ tooltipTasks: !this.state.tooltipTasks });
  }

  tooltipProgressOpen(e) {
    this.setState({ tooltipProgress: !this.state.tooltipProgress });
  }

  setCurrentTaskNotifications = taskNotifications => {
    this.setState({
      ...this.state,
      currentTaskNotifications: taskNotifications,
    })
  }

  handleTaskNotificationRead = () => {
    const taskReadPromises = []
    const userId = this.state.currentTaskNotifications[0].recipient
    this.state.currentTaskNotifications.forEach(notification => {
      taskReadPromises.push(
        httpService.post(ENDPOINTS.MARK_TASK_NOTIFICATION_READ(notification._id)),
      )
    })

    Promise.all(taskReadPromises).then(data => {
      const newTeamsState = []
      this.state.teams.forEach(member => {
        if (member._id === userId) {
          newTeamsState.push({ ...member, taskNotifications: [] })
        } else {
          newTeamsState.push(member)
        }
      })
      this.setState({
        ...this.state,
        teams: newTeamsState,
      })
      this.setCurrentTaskNotifications([])
      this.toggleTaskNotificationModal()
    })
  }

  toggleTaskNotificationModal = () => {
    this.setState({
      ...this.state,
      taskNotificationModal: !this.state.taskNotificationModal,
    })
  }

  handleOpenTaskNotificationModal = taskNotifications => {
    this.setState(
      {
        ...this.state,
        currentTaskNotifications: taskNotifications,
      },
      () => {
        this.toggleTaskNotificationModal()
      },
    )
  }

  async componentDidMount() {
    const userId = this.props.asUser ? this.props.asUser : this.props.auth.user.userid
    await this.props.getUserProfile(userId)

    //const { leaderBoardData } = this.props
    const { managingTeams } = this.props
    let allMembers = []
    const teamMembersPromises = []
    const memberTimeEntriesPromises = []
    const teamMemberTasksPromises = []
    const userProfilePromises = []
    //const wbsProjectPromises = []
    //const fetchedProjects = []
    const finalData = []
    const userNotifications = []
    const taskNotificationPromises = []
    const allManagingTeams = []

    // fetch all team members for each time
    managingTeams.forEach(team => {
      teamMembersPromises.push(httpService.get(ENDPOINTS.TEAM_MEMBERS(team._id)))
    })
    Promise.all(teamMembersPromises).then(data => {
      for (let i = 0; i < managingTeams.length; i++) {
        allManagingTeams[i] = {
          ...managingTeams[i],
          members: data[i].data,
        }
        allMembers = allMembers.concat(data[i].data)
      }

      // fetch all time entries for current week for all members
      const uniqueMembers = _.uniqBy(allMembers, '_id')
      uniqueMembers.forEach(member => {
        const fromDate = moment()
          .startOf('week')
          .subtract(0, 'weeks')
        const toDate = moment()
          .endOf('week')
          .subtract(0, 'weeks')
        memberTimeEntriesPromises.push(
          httpService.get(ENDPOINTS.TIME_ENTRIES_PERIOD(member._id, fromDate, toDate)).catch(err => { }),
        )
      })
      Promise.all(memberTimeEntriesPromises).then(data => {
        // merge time entries into each user obj
        for (let i = 0; i < uniqueMembers.length; i++) {
          uniqueMembers[i] = {
            ...uniqueMembers[i],
            timeEntries: data[i].data,
          }
        }

        // fetch all tasks for each member
        uniqueMembers.forEach(member => {
          teamMemberTasksPromises.push(httpService.get(ENDPOINTS.TASKS_BY_USERID(member._id)).catch(err => { if (err.status !== 401) { console.log(err) } }))
        })
        Promise.all(teamMemberTasksPromises).then(data => {
          // merge assigned tasks into each user obj
          for (let i = 0; i < uniqueMembers.length; i++) {
            uniqueMembers[i] = {
              ...uniqueMembers[i],
              tasks: data[i].data,
            }
          }

          // fetch full user profile for each team member
          uniqueMembers.forEach(member => {
            userProfilePromises.push(httpService.get(ENDPOINTS.USER_PROFILE(member._id)).catch(err => { }))
          })
          Promise.all(userProfilePromises).then(async data => {
            try {


              for (let i = 0; i < uniqueMembers.length; i++) {
                const user = uniqueMembers[i]
                const userLeaderBoardData = data.find(member => member.data._id === user._id)
                let userWeeklyCommittedHours = 0
                if (userLeaderBoardData) {
                  userWeeklyCommittedHours = userLeaderBoardData.data.weeklyComittedHours
                }
                uniqueMembers[i] = {
                  ...uniqueMembers[i],
                  weeklyCommittedHours: userWeeklyCommittedHours,
                }
              }

              // for each task, must fetch the projectId of its wbs in order to generate appropriate link
              // currently fetches all projects, should consider refactoring if number of projects increases
              const WBSRes = await httpService.get(ENDPOINTS.WBS_ALL).catch(err => { if (err.status === 401) { loggedOut = true } })
              const allWBS = WBSRes.data

              // calculate hours done in current week and add to user obj for ease of access
              for (let i = 0; i < uniqueMembers.length; i++) {
                let hoursCurrentWeek = 0
                if (uniqueMembers[i].timeEntries.length > 0) {
                  hoursCurrentWeek = uniqueMembers[i].timeEntries.reduce(
                    (acc, current) => Number(current.hours) + acc,
                    0,
                  )
                }

                finalData[i] = {
                  ...uniqueMembers[i],
                  hoursCurrentWeek,
                }
              }

              // attach projectId of each task onto final user objects
              for (let i = 0; i < uniqueMembers.length; i++) {
                for (let j = 0; j < uniqueMembers[i].tasks.length; j++) {
                  const { wbsId } = uniqueMembers[i].tasks[j]
                  const project = allWBS.find(wbs => wbs._id === wbsId)
                  finalData[i].tasks[j] = {
                    ...finalData[i].tasks[j],
                    projectId: project ? project.projectId : '',
                  }
                }
              }

              // create array of just user ids to use for querying user tasks notifications
              const uniqueMemberIds = []
              uniqueMembers.forEach(member => {
                uniqueMemberIds.push(member._id)
              })
              let loggedOut = false;
              uniqueMemberIds.forEach(memberId => {
                taskNotificationPromises.push(
                  httpService.get(ENDPOINTS.USER_UNREAD_TASK_NOTIFICATIONS(memberId)).catch((err) => { if (err.status === 401) { loggedOut = true } }),
                )
              })

              // check the current user role
              const currentUserData = data.find(member => member.data._id === this.props.asUser)
              this.setState({ currentUserRole: currentUserData.data.role })

              if (!loggedOut) {
                Promise.all(taskNotificationPromises).then(data => {
                  for (let i = 0; i < uniqueMemberIds.length; i++) {
                    userNotifications.push({
                      userId: uniqueMemberIds[i],
                      taskNotifications: data[i].data,
                    })
                    finalData[i] = {
                      ...finalData[i],
                      taskNotifications: data[i].data,
                    }
                  }
                  // sort each members' tasks by last modified time
                  finalData.forEach(user => {
                    user.tasks.sort((task1, task2) => {
                      const date1 = new Date(task1.modifiedDatetime).valueOf()
                      const date2 = new Date(task2.modifiedDatetime).valueOf()
                      const timeDifference = date2 - date1
                      return timeDifference
                    })
                  })

                  //console.log('final data ', finalData)

                  this.setState({ fetched: true, teams: finalData })
                })
              }


            } catch (err) {
              //catch error on logout
              console.log(err);
            }
          })
        })
      })
    })
  }

  render() {
    const padding_xpx = {
      paddingLeft: '3px',
      paddingRight: '3px'
    }
    const { teams, fetching, fetched, collapse, collapseAll } = this.state
    let teamsList = []
    if (teams && teams.length > 0) {
      teamsList = teams.map((member, index) => (
        <tr key={index}>
          {/* green if member has met committed hours for the week, red if not */}  
          <td onClick={this.toggleCollapse} style={{cursor: 'pointer', paddingRight: '3px'}}>
            
            {member.tasks.length > 1 ? (
                collapse === index || collapseAll === true ? (
                  <FontAwesomeIcon data-event={index} icon={faAngleDown} />
                ) : (
                  <FontAwesomeIcon data-event={index} icon={faAngleRight} />
                )
            ) : (
              <span />
            )
            }

          </td>

          <td style={padding_xpx}>
            {member.hoursCurrentWeek >= member.weeklyComittedHours ? (
              <FontAwesomeIcon style={{ color: 'green' }} icon={faCircle} />
            ) : (
              <FontAwesomeIcon style={{ color: 'red' }} icon={faCircle} />
            )}
          </td>

          <td style={{cursor: 'pointer', paddingLeft: '7px'}}>
            <FontAwesomeIcon style={{ color: '#44f801' }} icon={faEye} />
          </td>
          
          <td>
            <Link to={`/userprofile/${member._id}`}>
              {`${member.firstName} ${member.lastName}`}
            </Link>
          </td>
          
          <td>{`${member.weeklyCommittedHours} / ${member.hoursCurrentWeek}`}</td>
          
          <td 
            colSpan="2" 
            style={{
              padding: '0px',
            }}>
            <div 
                style={{
                  maxHeight:'275px', 
                  overflow: 'auto'
                }}>
              <Table
                  border={0} 
                  style={{
                    padding: '0px',
                    margin: '0px'
                  }}>
                <thead />
                <tbody>  
                { collapseAll === false && collapse !== index ? (
                  member.tasks &&
                  member.tasks.slice(0, 1).map((task, index) => (
                    <tr key={index}>  
                      <td style={{border: '0'}}>
                        <div key={`${task._id}${index}`}>
                          <Link
                            key={index}
                            to={task.projectId ? `/wbs/tasks/${task.wbsId}/${task.projectId}` : '/'}
                          >
                            <span>{`${task.num} ${task.taskName}`} </span>
                          </Link>
                          <span>
                            {member.taskNotifications.find(notification => {
                              return notification.taskId === task._id
                            }) ? (
                              <FontAwesomeIcon
                                style={{ color: 'red' }}
                                icon={faBell}
                                onClick={() => {
                                  this.handleOpenTaskNotificationModal(member.taskNotifications)
                                }}
                              />
                            ) : null}
                          </span>
                        </div>
                      </td>
                      {/*<td style={{textAlign: 'right', border: '0'}}>
                        tempprogress
                      </td>*/}
                      <td style={{width: '30%', border: '0', textAlign: 'center'}}>
                        <span>5 of 40</span>
                        <Progress
                          title='tempprogress: ... hours'
                          value={5}
                          color='danger'
                        />
                      </td>
                    </tr>
                  ))
                  ) : (
                  /*<Collapse
                      isOpen={collapse === index} 
                      style={{
                        maxHeight:'300px', 
                        overflow: 'auto'}}>*/ 
                    member.tasks &&
                    member.tasks.map((task, index) => (
                      <tr key={index}>  
                        <td  style={{borderTop: '0'}}>
                          <div key={`${task._id}${index}`}>
                            <Link
                              key={index}
                              to={task.projectId ? `/wbs/tasks/${task.wbsId}/${task.projectId}` : '/'}
                            >
                              <span>{`${task.num} ${task.taskName}`} </span>
                            </Link>
                            <span>
                              {member.taskNotifications.find(notification => {
                                return notification.taskId === task._id
                              }) ? (
                                <FontAwesomeIcon
                                  style={{ color: 'red' }}
                                  icon={faBell}
                                  onClick={() => {
                                    this.handleOpenTaskNotificationModal(member.taskNotifications)
                                  }}
                                />
                              ) : null}
                            </span>
                          </div>
                        </td>
                        {/*<td style={{textAlign: 'right', border: '0'}}>
                          tempprogress
                        </td>*/}
                        <td style={{width: '30%', borderTop: '0', textAlign: 'center'}}>
                          <span>5 of 40</span>
                          <Progress
                            title='tempprogress: ... hours'
                            value={5}
                            color='danger'
                          />
                        </td>
                      </tr>
                  ))
                 /*</Collapse>*/
                )}
                </tbody>
              </Table>
            </div>  
          </td>       
        </tr>
      ))
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
          <div className="my-custom-scrollbar table-wrapper-scroll-y">
            <Table className="team-member-tasks-tb table-fixed">
              <thead>
                <tr>
                  {/* Empty column header for hours completed icon */}
                  {this.state.currentUserRole === 'Administrator' || this.state.currentUserRole === 'Manager' ? (
                      <th onClick={this.toggleCollapseAll} style={{cursor: 'pointer', paddingRight: '3px'}}>
                          {collapseAll === true ? (
                            <span id="TooltipExpandAll">
                              <FontAwesomeIcon icon={faCaretSquareDown} />  
                            </span>
                            ) : (
                            <span id="TooltipExpandAll">
                              <FontAwesomeIcon icon={faCaretSquareRight} />
                            </span>
                            )
                          }                          
                          <Tooltip 
                              style={{ background: 'rgba(0,0,0,0.99)', 
                                       color: 'white', 
                                       padding: '5px', 
                                       paddingLeft: '6px', 
                                       paddingRight: '6px',
                                       borderRadius: '4px', 
                                       fontSize: '11px'
                                    }} 
                              placement="top" 
                              isOpen={this.state.tooltipExpandAll}
                              target="TooltipExpandAll" 
                              toggle={this.tooltipExpandAllOpen}
                            >
                            Expand All/Shrink All
                          </Tooltip>
                      </th>
                    ) : (
                      <th style={padding_xpx}/>
                    )
                  }
                  <th colSpan="2"
                      style={{
                        padding: '0px',
                      }} 
                  />
                  <th><span id="TooltipTeamMember">Team Member</span></th>
                  <Tooltip 
                      style={{ background: 'rgba(0,0,0,0.99)', 
                               color: 'white', 
                               padding: '5px', 
                               paddingLeft: '6px', 
                               paddingRight: '6px', 
                               borderRadius: '4px', 
                               fontSize: '11px'
                            }} 
                      placement="top" 
                      isOpen={this.state.tooltipTeamMember}
                      target="TooltipTeamMember" 
                      toggle={this.tooltipTeamMemberOpen}
                    >
                    You or, in the case of managers, you and everyone on your team. Click the name for the related profile
                  </Tooltip>
                  <th width="100px">
                    <FontAwesomeIcon icon={faClock} id="TooltipBlackClockIcon" title="Weekly Committed Hours" />
                    <Tooltip 
                      style={{ background: 'rgba(0,0,0,0.99)', 
                               color: 'white', 
                               padding: '5px', 
                               paddingLeft: '6px', 
                               paddingRight: '6px', 
                               borderRadius: '4px', 
                               fontSize: '11px'
                            }} 
                      placement="top" 
                      isOpen={this.state.tooltipBlackClockIcon}
                      target="TooltipBlackClockIcon" 
                      toggle={this.tooltipBlackClockIconOpen}
                    >
                    Total time logged towards this task
                  </Tooltip>
                    /
                    <FontAwesomeIcon
                      style={{ color: 'green' }}
                      icon={faClock}
                      id="TooltipGreenClockIcon"
                      title="Weekly Completed Hours"
                    />
                    <Tooltip 
                      style={{ background: 'rgba(0,0,0,0.99)', 
                               color: 'white', 
                               padding: '5px', 
                               paddingLeft: '6px', 
                               paddingRight: '6px', 
                               borderRadius: '4px', 
                               fontSize: '11px'
                            }} 
                      placement="top" 
                      isOpen={this.state.tooltipGreenClockIcon}
                      target="TooltipGreenClockIcon" 
                      toggle={this.tooltipGreenClockIconOpen}
                    >
                    Total time allotted to complete this task
                  </Tooltip>
                  </th>
                  <th><span id="TooltipTasks">Tasks(s)</span></th>
                  <Tooltip 
                      style={{ background: 'rgba(0,0,0,0.99)', 
                               color: 'white', 
                               padding: '5px', 
                               paddingLeft: '6px', 
                               paddingRight: '6px', 
                               borderRadius: '4px', 
                               fontSize: '11px'
                            }} 
                      placement="top" 
                      isOpen={this.state.tooltipTasks}
                      target="TooltipTasks" 
                      toggle={this.tooltipTasksOpen}
                    >
                    Tasks assigned to the Team Member, click a task for complete task information
                  </Tooltip>
                  <th style={{
                      textAlign: 'right',
                      paddingRight: '3.3%'  
                  }}>
                    <span id="TooltipProgress">Progress</span>
                  </th>
                  <Tooltip 
                      style={{ background: 'rgba(0,0,0,0.99)', 
                               color: 'white', 
                               padding: '5px', 
                               paddingLeft: '6px', 
                               paddingRight: '6px', 
                               borderRadius: '4px', 
                               fontSize: '11px'
                            }} 
                      placement="top" 
                      isOpen={this.state.tooltipProgress}
                      target="TooltipProgress" 
                      toggle={this.tooltipProgressOpen}
                    >
                    Total progress towards completion of each task
                  </Tooltip>
                </tr>
              </thead>
              <tbody>{teamsList}</tbody>
            </Table>
          </div>
        </div>
      </React.Fragment>
    )
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
  userId: state.userProfile.id,
  managingTeams: state.userProfile.teams,
  teamsInfo: state.managingTeams,
})

export default connect(mapStateToProps, {
  getUserProfile,
  fetchAllManagingTeams,
})(TeamMemberTasks)