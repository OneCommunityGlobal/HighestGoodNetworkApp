import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Table, Progress } from 'reactstrap'
import moment from 'moment'
import _ from 'lodash'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faCircle } from '@fortawesome/free-solid-svg-icons'
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

    const leaderBoardData = this.props.leaderboardData
    const allManagingTeams = []
    let allMembers = []
    const teamMembersPromises = []
    const memberTimeEntriesPromises = []
    const teamMemberTasksPromises = []
    const userProfilePromises = []
    const finalData = []

    const { managingTeams } = this.props

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
          Promise.all(userProfilePromises).then(data => {
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
            console.log('final data ', finalData)

            this.setState({ fetched: true, teams: finalData })
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
    console.log('teams: ', teams)
    if (teams && teams.length > 0) {
      teamsList = teams.map((member, index) => (
        <tr>
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
            {member.tasks && member.tasks.map(task => <p>{`${task.num} ${task.taskName}`}</p>)}
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
              <th />
              <th>Team Member</th>
              <th>
                <FontAwesomeIcon icon={faClock} /> /{' '}
                <FontAwesomeIcon style={{ color: 'green' }} icon={faClock} />
              </th>
              <th>Tasks(s)</th>
              <th>Progress</th>
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
