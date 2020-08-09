import React from 'react';
import { getAllUserTeams } from '../../actions/allTeamsAction'
import { defaults } from 'lodash';
import { connect } from 'react-redux'
import Loading from '../common/Loading'
import TeamTableHeader from './TeamTableHeader';
import { Container } from 'reactstrap'
import Team from './Team'
import TeamTableSearchPanel from './TeamTableSearchPanel'

// const Teamstabledata = (props) => {
//   return (
//     <tr>
//       <td>{props.teams._id}</td>
//       <td>{props.teams.teamName}</td>
//     </tr>
//   )
// }


class Teams extends React.PureComponent {

  componentDidMount() {
    debugger;
    // Initiating the user teams fetch action.
    this.props.getAllUserTeams();
  }

  render() {

    let { allTeams, fetching } = this.props.state.allTeamsData;

    let TeamsList = [];
    if (allTeams.length > 0) {
      TeamsList = allTeams.map((team, index) =>
        <Team
          key={team._id}
          index={index}
          teamId={team._id}
          name={team.teamName}
          active={team.isActive}


        />);
    }
    // {props.teamsdata.map(
    //   team => {
    //     return <Teamtabledata teammembers={team} />
    //   }
    // )}

    return <Container fluid>
      {fetching ?
        <Loading /> :
        <React.Fragment>
          <div className='container'>
            {/* {fetching || !fetched ? <Loading /> : null} */}
            {/* <Overview numberOfProjects={numberOfProjects} numberOfActive={numberOfActive} />
          <AddProject addNewProject={this.addProject} /> */}
            <TeamTableSearchPanel />
            <table className="table table-bordered table-responsive-sm">
              <thead>
                <TeamTableHeader />
              </thead>
              <tbody>
                {TeamsList}
              </tbody>
            </table>

          </div>
        </React.Fragment>
      }
    </Container>

  }
}

const mapStateToProps = state => { return { state } }
export default connect(mapStateToProps, { getAllUserTeams })(Teams)
