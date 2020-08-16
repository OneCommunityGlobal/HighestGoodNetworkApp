import React from 'react';
import { getAllUserTeams, postNewTeam } from '../../actions/allTeamsAction'
// import { defaults } from 'lodash';
import { connect } from 'react-redux'
import Loading from '../common/Loading'
import TeamTableHeader from './TeamTableHeader';
import { Container } from 'reactstrap'
import Team from './Team'
import TeamOverview from './TeamsOverview'
import TeamTableSearchPanel from './TeamTableSearchPanel'
import TeamMembersPopup from './TeamMembersPopup'
import CreateNewTeamPopup from './CreateNewTeamPopup';
import DeleteTeamPopup from './DeleteTeamPopup';

class Teams extends React.PureComponent {
  filteredTeamDataCount = 0;

  constructor(props) {
    super(props);
    this.state = {
      teamNameSearchText: '',
      teamMembersPopupOpen: false,
      deleteTeamPopupOpen: false,
      createNewTeamPopupOpen: false,
      selectedTeam: '',
      isACtive: '',
      wildCardSearchText: '',
    }
  }

  componentDidMount() {
    // Initiating the user teams fetch action.
    this.props.getAllUserTeams();
  }

  render() {

    let { allTeams, fetching } = this.props.state.allTeamsData;
    let teamTable = this.teamTableElements(allTeams);
    let numberOfTeams = allTeams.length;
    let numberOfActiveTeams = allTeams.filter(team => team.isActive).length;

    return <Container fluid>
      {fetching ?
        <Loading /> :
        <React.Fragment>
          <div className='container'>
            {this.teampopupElements()}
            <TeamOverview
              numberOfTeams={numberOfTeams}
              numberOfActiveTeams={numberOfActiveTeams} />
            <TeamTableSearchPanel
              onSearch={this.onWildCardSearch}
              onCreateNewTeamClick={this.onCreateNewTeamShow} />
            <table className="table table-bordered table-responsive-sm">
              <thead>
                <TeamTableHeader />
              </thead>
              <tbody>
                {teamTable}
              </tbody>
            </table>
          </div>
        </React.Fragment>
      }
    </Container>
  }


  /**
    * Creates the table body elements after applying the search filter and return it.
    */
  teamTableElements = (allTeams) => {

    if (allTeams && allTeams.length > 0) {
      let teamSearchData = this.filteredTeamsList(allTeams);
      this.filteredTeamDataCount = teamSearchData.length;
      /* 
      * Builiding the table body for users based on the page size and selected page number and returns 
       * the rows for currently selected page . 
       * Applying the Default sort in the order of created date as well
       */
      return teamSearchData.sort((a, b) => {
        if (a.createdDate > b.createdDate) return 1;
        if (a.createdDate < b.createdDate) return -1;
        return 0;
      }).map((team, index) => {
        return (
          <Team
            key={team._id}
            index={index}
            name={team.teamName}
            active={team.isActive}
            onMembersClick={this.onTeamMembersPopupShow}
            onDeleteClick={this.onDeleteTeamPopupShow}
            team={team}
          />)
      });
    }
  }

  filteredTeamsList = (allTeams) => {
    let filteredList = allTeams.filter((team) => {
      //Applying the search filters before creating each table data element
      if ((team.teamName
        && team.teamName.toLowerCase().indexOf(this.state.teamNameSearchText.toLowerCase()) > -1
        && (this.state.isActive === undefined || team.isActive === this.state.isActive)
        && this.state.wildCardSearchText === '')
        //the wild card serach, the search text can be match with any item
        || (this.state.wildCardSearchText !== '' &&
          (team.teamName.toLowerCase().indexOf(this.state.wildCardSearchText.toLowerCase()) > -1
          ))
      ) {
        return team;
      }
    })

    return filteredList;
  }
  /**
   * Returns the differenet popup components to render
   * 1. Popup to show the team members
   * 2. Popup to show the team creation (new team)
   * 3. Popup to display delete confirmation of the team upon clicking delete button.
   */

  teampopupElements = () => {
    return <React.Fragment>
      <TeamMembersPopup
        open={this.state.teamMembersPopupOpen}
        onClose={this.onTeamMembersPopupClose}
      />
      <CreateNewTeamPopup
        open={this.state.createNewTeamPopupOpen}
        onClose={this.onCreateNewTeamClose}
        onOkClick={this.addNewTeam}
      />

      <DeleteTeamPopup
        open={this.state.deleteTeamPopupOpen}
        onClose={this.onDeleteTeamPopupClose}
        data={this.state.selectedTeam}
        onDeleteClick={this.onDeleteUser}
      />

    </React.Fragment>
  }

  /**
    * call back to show team members popup
    */
  onTeamMembersPopupShow = () => {
    this.setState({
      teamMembersPopupOpen: true,

    })
  }
  /**
   * To hide the team members popup upon close button click
   */
  onTeamMembersPopupClose = () => {
    this.setState({
      teamMembersPopupOpen: false,
    })
  }
  /**
    * call back to show delete team popup
    */
  onDeleteTeamPopupShow = (deletedname) => {
    this.setState({
      deleteTeamPopupOpen: true,
      selectedTeam: deletedname
    })
  }

  /**
   * To hide the delete team popup upon close button click
   */
  onDeleteTeamPopupClose = () => {
    this.setState({
      deleteTeamPopupOpen: false,
    })
  }
  /**
    * call back to show create new team popup
    */
  onCreateNewTeamShow = () => {
    this.setState({
      createNewTeamPopupOpen: true,
    })
  }
  /**
     * To hide the create new team popup upon close button click
     */
  onCreateNewTeamClose = () => {
    this.setState({
      createNewTeamPopupOpen: false,
    })
  }

  /**
   * callback for search
   */
  onWildCardSearch = (searchText) => {
    this.setState({
      wildCardSearchText: searchText,

    })
  }
  addNewTeam = (name) => {
    this.props.postNewTeam(name, true);
    alert("Team added successfully");
    this.setState({
      createNewTeamPopupOpen: false,
    })
  }

  // onDeleteUser = (deletedId) => {
  //   this.props.deleteUser(deletedId)
  // }

}
const mapStateToProps = state => { return { state } }
export default connect(mapStateToProps, { getAllUserTeams, postNewTeam })(Teams)
