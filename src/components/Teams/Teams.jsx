import React from 'react';
import { getAllUserTeams, postNewTeam, deleteUser, updateTeam } from '../../actions/allTeamsAction'
// import { defaults } from 'lodash';
import { connect } from 'react-redux'
import Loading from '../common/Loading'
import TeamTableHeader from './TeamTableHeader'
import { Container } from 'reactstrap'
import Team from './Team'
import TeamOverview from './TeamsOverview'
import TeamTableSearchPanel from './TeamTableSearchPanel'
import TeamMembersPopup from './TeamMembersPopup'
import CreateNewTeamPopup from './CreateNewTeamPopup'
import DeleteTeamPopup from './DeleteTeamPopup'
import TeamStatusPopup from './TeamStatusPopup'

class Teams extends React.PureComponent {
  filteredTeamDataCount = 0;

  constructor(props) {
    super(props);
    this.state = {
      teamNameSearchText: '',
      teamMembersPopupOpen: false,
      deleteTeamPopupOpen: false,
      createNewTeamPopupOpen: false,
      teamStatusPopupOpen: false,
      wildCardSearchText: '',
      selectedTeamId: 0,
      selectedTeam: '',
      isActive: '',
    }
  }

  componentDidMount() {
    // Initiating the teams fetch action.
    this.props.getAllUserTeams();
  }

  render() {

    let { allTeams, fetching } = this.props.state.allTeamsData;
    let teamTable = this.teamTableElements(allTeams);
    let numberOfTeams = allTeams.length;
    // let numberOfActiveTeams = allTeams.filter(team => team.isActive).length;

    return <Container fluid>
      {fetching ?
        <Loading /> :
        <React.Fragment>
          <div className='container'>
            {this.teampopupElements()}
            <TeamOverview
              numberOfTeams={numberOfTeams}
            // numberOfActiveTeams={numberOfActiveTeams}
            />
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
      let teamSearchData = this.filteredTeamList(allTeams);
      this.filteredTeamDataCount = teamSearchData.length;
      /* 
      * Builiding the table body for teams returns 
       * the rows for currently selected page . 
       * Applying the Default sort in the order of created date as well
       */
      return teamSearchData.sort((a, b) => {
        if (a.createdDatetime > b.createdDatetime) return -1;
        if (a.createdDatetime < b.createdDatetime) return 1;
        return 0;
      }).map((team, index) => {

        return (
          <Team
            key={team._id}
            index={index}
            name={team.teamName}
            teamId={team._id}
            active={team.isActive}
            onMembersClick={this.onTeamMembersPopupShow}
            onDeleteClick={this.onDeleteTeamPopupShow}
            onStatusClick={this.onTeamStatusShow}
            onClickActive={this.onClickActive}
            team={team}
          />)
      });
    }
  }

  filteredTeamList = (allTeams) => {
    let filteredList = allTeams.filter((team) => {
      //Applying the search filters before creating each team table data element
      if (team.teamName &&
        (team.teamName.toLowerCase().indexOf(this.state.teamNameSearchText.toLowerCase()) > -1
          && this.state.wildCardSearchText === '')
        //the wild card search, the search text can be match with any item
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
        selectedTeamName={this.state.selectedTeam}
        selectedTeamId={this.state.selectedTeamId}
        onDeleteClick={this.onDeleteUser}
      />

      <TeamStatusPopup
        open={this.state.teamStatusPopupOpen}
        onClose={this.onTeamStatusClose}
        selectedTeamName={this.state.selectedTeam}
        selectedTeamId={this.state.selectedTeamId}
        selectedStatus={this.state.isActive}
        onConfirmClick={this.onConfirmClick}

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
  onDeleteTeamPopupShow = (deletedname, teamId) => {
    this.setState({
      deleteTeamPopupOpen: true,
      selectedTeam: deletedname,
      selectedTeamId: teamId,
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
     * call back to show team status popup
     */
  onTeamStatusShow = (teamName, teamId, isActive) => {
    this.setState({
      teamStatusPopupOpen: true,
      selectedTeam: teamName,
      selectedTeamId: teamId,
      isActive: isActive

    })
  }
  /**
      * To hide the team status popup upon close button click
      */
  onTeamStatusClose = () => {
    this.setState({
      teamStatusPopupOpen: false
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
  /**
  * callback for adding new team
  */
  addNewTeam = (name) => {
    this.props.postNewTeam(name, true);
    alert("Team added successfully");
    this.setState({
      createNewTeamPopupOpen: false,
    })
  }
  /**
     * callback for deleting a team
     */

  onDeleteUser = (deletedId) => {
    debugger;
    this.props.deleteUser(deletedId, 'delete')
    alert("Team deleted successfully");
    this.setState({
      deleteTeamPopupOpen: false,
    })
  }
  /**
      * callback for changing the status of a team
      */
  onConfirmClick = (teamName, teamId, isActive) => {

    this.props.updateTeam(teamName, teamId, isActive)
    this.setState({
      teamStatusPopupOpen: false,
    })
  }


}
const mapStateToProps = state => { return { state } }
export default connect(mapStateToProps, { getAllUserTeams, postNewTeam, deleteUser, updateTeam })(Teams)
