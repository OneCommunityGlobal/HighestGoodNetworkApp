import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Table } from 'reactstrap';
import { fetchAllManagingTeams } from '../../actions/team';
import { getUserProfile } from '../../actions/userProfile';
import Loading from '../common/Loading';

class Teams extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // async componentWillMount() {
  //   await this.props.getUserProfile(this.props.match.params.userId);
  // }

  componentDidMount() {
    fetchAllManagingTeams(this.props.userId, this.props.managingTeams);
  }

  render() {
    const { teams, status, fetching, fetched } = this.props.teamsInfo;

    // console.log('teams: ', teams);
    let teamsList = [];
    if (teams && teams.length > 0) {
      teamsList = teams.map((team, index) => (
        <tr key={index}>
          <td>{team.teamName}</td>
        </tr>
      ));
    }

    // console.log('teamsList: ', teamsList);

    return (
      <React.Fragment>
        <div className='container'>
          {fetching || !fetched ? <Loading /> : null}
          <h1>Teams</h1>
          <Table>
            <thead>
              <tr>
                <th>Name</th>
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
  userId: state.userProfile._id,
  managingTeams: state.userProfile.teams,
  teamsInfo: state.managingTeams,
});

export default connect(mapStateToProps, { getUserProfile, fetchAllManagingTeams })(Teams);
