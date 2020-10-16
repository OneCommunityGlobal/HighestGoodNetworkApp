import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Table, Progress } from 'reactstrap'
import moment from 'moment'
import _ from 'lodash'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faCircle, faBell } from '@fortawesome/free-solid-svg-icons'
// import { farClock } from '@fortawesome/free-regular-svg-icons'

import httpService from '../../services/httpService'
import { ENDPOINTS } from '../../utils/URL'
import { fetchAllManagingTeams } from '../../actions/team'
import { getUserProfile } from '../../actions/userProfile'
import Loading from '../common/Loading'

class TeamMemberTasks extends Component {
  constructor(props) {
    super(props)
    this.state = {
      fetched: false,
      teams: [],
    }
  }

  async componentDidMount() {
    const userId = this.props.auth.user.userid
    await this.props.getUserProfile(userId)

    const { leaderBoardData } = this.props
    const { managingTeams } = this.props
    let allMembers = []
    const teamMembersPromises = []
    const memberTimeEntriesPromises = []
    const teamMemberTasksPromises = []
    const userProfilePromises = []
    const wbsProjectPromises = []
    const fetchedProjects = []
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
          httpService.get(ENDPOINTS.TIME_ENTRIES_PERIOD(member._id, fromDate, toDate)),
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
          teamMemberTasksPromises.push(httpService.get(ENDPOINTS.TASKS_BY_USERID(member._id)))
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
            userProfilePromises.push(httpService.get(ENDPOINTS.USER_PROFILE(member._id)))
          })
          Promise.all(userProfilePromises).then(async data => {
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
            const WBSRes = await httpService.get(ENDPOINTS.WBS_ALL)
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
                const project = allWBS.find(wbs => wbs._id == wbsId)
                finalData[i].tasks[j] = {
                  ...finalData[i].tasks[j],
                  projectId: project ? project.projectId : '',
                }
              }
            }

            const uniqueMemberIds = []
            uniqueMembers.forEach(member => {
              uniqueMemberIds.push(member._id)
            })

            uniqueMemberIds.forEach(memberId => {
              taskNotificationPromises.push(
                httpService.get(ENDPOINTS.USER_UNREAD_TASK_NOTIFICATIONS(memberId)),
              )
            })
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

              console.log('userNotifications ', userNotifications)
              console.log('final data ', finalData)

              this.setState({ fetched: true, teams: finalData })
            })

            // // sort each members' tasks by last modified time
            // finalData.forEach(user => {
            //   user.tasks.sort((task1, task2) => {
            //     const date1 = new Date(task1.modifiedDatetime).valueOf()
            //     const date2 = new Date(task2.modifiedDatetime).valueOf()
            //     const timeDifference = date1 - date2
            //     return timeDifference
            //   })
            // })
          })
        })
      })
    })
  }

  render() {
    const { teams, fetching, fetched } = this.state

    // console.log('teams: ', teams)
    // console.log('leaderboardData: ', this.props.leaderboardData);

    let teamsList = []
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
          {/* if user has any task notifications, display bell */}
          <td>
            {member.taskNotifications.length > 0 ? (
              <FontAwesomeIcon style={{ color: 'red' }} icon={faBell} />
            ) : null}
          </td>
          <td>{`${member.weeklyCommittedHours} / ${member.hoursCurrentWeek}`}</td>
          <td>
            {member.tasks &&
              member.tasks.map((task, index) => (
                <Link
                  key={index}
                  to={task.projectId ? `/wbs/tasks/${task.wbsId}/${task.projectId}` : '/'}
                >
                  <p>{`${task.num} ${task.taskName}`}</p>
                </Link>
              ))}
          </td>
          <td>tempprogress</td>
        </tr>
      ))
    }

    return (
      <React.Fragment>
        <div className="container">
          {fetching || !fetched ? <Loading /> : null}
          <h1>Team Member Tasks</h1>
          <Table>
            <thead>
              <tr>
                {/* Empty column header for hours completed icon */}
                <th />
                <th>Team Member</th>
                {/* Empty column header for notification icon */}
                <th />
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
