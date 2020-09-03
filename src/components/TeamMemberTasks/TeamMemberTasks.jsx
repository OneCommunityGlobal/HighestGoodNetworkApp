import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Table, Progress } from 'reactstrap'
import moment from 'moment'
import _ from 'lodash'
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
    console.log(userId)
    await this.props.getUserProfile(userId)

    // fetchAllManagingTeams(this.props.userId, this.props.managingTeams);
    const leaderBoardData = this.props.leaderboardData
    const allManagingTeams = []
    let allMembers = []
    const teamMembersPromises = []
    const memberTimeEntriesPromises = []
    const { managingTeams } = this.props
    managingTeams.forEach(team => {
      // req = await httpService.get(ENDPOINTS.TEAM_MEMBERS(team._id));
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
      // console.log('allManagingTeams:', allManagingTeams);
      const uniqueMembers = _.uniqBy(allMembers, '_id')
      uniqueMembers.forEach(async member => {
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
        // console.log('After time entries: ', data);
        // console.log('uniqueMemberTimeEntries: ', uniqueMemberTimeEntries);
        for (let i = 0; i < uniqueMembers.length; i++) {
          uniqueMembers[i] = {
            ...uniqueMembers[i],
            timeEntries: data[i].data,
          }
        }

        for (let i = 0; i < allManagingTeams.length; i++) {
          for (let j = 0; j < allManagingTeams[i].members.length; j++) {
            let memberDataWithTimeEntries = uniqueMembers.find(
              member => member._id === allManagingTeams[i].members[j]._id,
            )
            const memberLeaderboardData = leaderBoardData.find(
              member => member.personId === allManagingTeams[i].members[j]._id,
            )
            // console.log('memberDataWithTimeENtries: ', memberDataWithTimeEntries);
            // console.log('memberLeaderboardData', memberLeaderboardData);
            if (memberLeaderboardData) {
              memberDataWithTimeEntries = {
                ...memberDataWithTimeEntries,
                totaltangibletime_hrs: memberLeaderboardData.totaltangibletime_hrs,
              }
            } else {
              memberDataWithTimeEntries = {
                ...memberDataWithTimeEntries,
                totaltangibletime_hrs: 0,
              }
            }

            allManagingTeams[i].members[j] = memberDataWithTimeEntries
          }
        }

        // console.log('after processing: ', allManagingTeams);

        this.setState({ fetched: true, teams: allManagingTeams })
      })
    })
  }

  render() {
    const { teams, fetching, fetched } = this.state

    console.log('teams: ', teams)
    // console.log('leaderboardData: ', this.props.leaderboardData);

    let teamsList = []
    if (teams && teams.length > 0) {
      teamsList = teams.map((team, index) => (
        <Table key={index}>
          <thead>
            <tr>
              <th>{team.teamName}</th>
            </tr>
            <tr>
              <th>Name</th>
              <th>Weekly Progress</th>
              <th>Total Hours</th>
            </tr>
          </thead>
          <tbody>
            {team.members.map((member, index) => (
              <tr key={index}>
                <td>{`${member.firstName} ${member.lastName}`}</td>
                <td />
                <td>{member.totaltangibletime_hrs}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ))
    }

    // console.log('teamsList: ', teamsList);

    return (
      <React.Fragment>
        <div className="container">
          {fetching || !fetched ? <Loading /> : null}
          <h1>Teams</h1>
          {teamsList}
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
  leaderboardData: state.leaderBoardData,
})

export default connect(mapStateToProps, { getUserProfile, fetchAllManagingTeams })(TeamMemberTasks)
