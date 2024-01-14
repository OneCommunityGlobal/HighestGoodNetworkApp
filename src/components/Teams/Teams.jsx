import React from 'react';
import { connect } from 'react-redux';
import { Container } from 'reactstrap';
import {
  getAllUserTeams,
  postNewTeam,
  deleteTeam,
  updateTeam,
  getTeamMembers,
  deleteTeamMember,
  addTeamMember,
} from '../../actions/allTeamsAction';
import { getAllUserProfile } from '../../actions/userManagement';
import Loading from '../common/Loading';
import TeamTableHeader from './TeamTableHeader';
import Team from './Team';
import TeamOverview from './TeamsOverview';
import TeamTableSearchPanel from './TeamTableSearchPanel';
import TeamMembersPopup from './TeamMembersPopup';
import CreateNewTeamPopup from './CreateNewTeamPopup';
import DeleteTeamPopup from './DeleteTeamPopup';
import TeamStatusPopup from './TeamStatusPopup';
import { toast } from 'react-toastify';
import { searchWithAccent } from 'utils/search';

class Teams extends React.PureComponent {
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
      selectedTeamCode: '',
      teams: [],
      sortedTeams: [],
      teamsTable: [],
      sortTeamNameState: 'none', // 'none', 'ascending', 'descending'
      sortTeamActiveState: 'none', // 'none', 'ascending', 'descending'
    };
  }

  componentDidMount() {
    // Initiating the teams fetch action.
    this.props.getAllUserTeams();
    this.props.getAllUserProfile();
    this.sortTeamsByModifiedDate();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.sortedTeams !== this.state.sortedTeams) {
      // This will run whenever sortedTeams changes
      const teamsTable = this.state.sortedTeams.map(team => {
        return team;
      });
  
      this.setState({ teamsTable });
    }
  
    if (prevProps.state.allTeamsData.allTeams !== this.props.state.allTeamsData.allTeams) {
      // Teams have changed, update or re-fetch them
      this.props.getAllUserTeams();
      this.props.getAllUserProfile();
    }
  }

  render() {
    // debugger;
    const { allTeams, fetching } = this.props.state.allTeamsData;

    this.state.teams = this.teamTableElements(allTeams);
    const numberOfTeams = allTeams.length;
    const numberOfActiveTeams = numberOfTeams ? allTeams.filter(team => team.isActive).length : 0;

    return (
      <Container fluid>
        {fetching ? (
          <Loading />
        ) : (
          <React.Fragment>
            <div className="container mt-3">
              {this.teampopupElements()}
              <TeamOverview
                numberOfTeams={numberOfTeams}
                numberOfActiveTeams={numberOfActiveTeams}
              />
              <TeamTableSearchPanel
                onSearch={this.onWildCardSearch}
                onCreateNewTeamClick={this.onCreateNewTeamShow}
              />
              <table className="table table-bordered table-responsive-sm">
                <thead>
                  <TeamTableHeader 
                    onTeamNameSort={this.toggleTeamNameSort} 
                    onTeamActiveSort={this.toggleTeamActiveSort} 
                    sortTeamNameState={this.state.sortTeamNameState}
                    sortTeamActiveState={this.state.sortTeamActiveState} 
                    />
                </thead>
                {
                  this.state.teamNameSearchText === '' && this.state.wildCardSearchText === '' ? (
                    <tbody>{this.state.teamsTable}</tbody>
                  ) : (
                    <tbody>{this.state.teams}</tbody>
                  )
                }
              </table>
            </div>
          </React.Fragment>
        )}
      </Container>
    );
  }

  /**
   * Creates the table body elements after applying the search filter and return it.
   */
  teamTableElements = allTeams => {
    if (allTeams && allTeams.length > 0) {
      const teamSearchData = this.filteredTeamList(allTeams);
      /*
       * Builiding the table body for teams returns
       * the rows for currently selected page .
       * Applying the Default sort in the order of created date as well
       */
      return teamSearchData
        .sort((a, b) => {
          if (a.modifiedDatetime > b.modifiedDatetime) return -1;
          if (a.modifiedDatetime < b.modifiedDatetime) return 1;
          return 0;
        })
        .map((team, index) => (
          <Team
            key={team._id}
            index={index}
            name={team.teamName}
            teamId={team._id}
            active={team.isActive}
            teamCode={team.teamCode}
            onMembersClick={this.onTeamMembersPopupShow}
            onDeleteClick={this.onDeleteTeamPopupShow}
            onStatusClick={this.onTeamStatusShow}
            onEditTeam={this.onEidtTeam}
            onClickActive={this.onClickActive}
            team={team}
          />
        ));
    }
  };

  filteredTeamList = allTeams => {
    const filteredList = allTeams.filter(team => {
      // Applying the search filters before creating each team table data element
      if (
        (team.teamName &&
           searchWithAccent(team.teamName,this.state.teamNameSearchText) &&
          this.state.wildCardSearchText === '') ||
        // the wild card search, the search text can be match with any item
        (this.state.wildCardSearchText !== '' &&
        searchWithAccent(team.teamName,this.state.wildCardSearchText))
      ) {
        return team;
      }
      return false;
    });

    return filteredList;
  };
  /**
   * Returns the differenet popup components to render
   * 1. Popup to show the team members
   * 2. Popup to show the team creation (new team)
   * 3. Popup to display delete confirmation of the team upon clicking delete button.
   */

  teampopupElements = () => {
    const members = this.props.state ? this.props.state.teamsTeamMembers : [];
    return (
      <React.Fragment>
        <TeamMembersPopup
          open={this.state.teamMembersPopupOpen}
          onClose={this.onTeamMembersPopupClose}
          members={members}
          onDeleteClick={this.onDeleteTeamMember}
          usersdata={this.props.state ? this.props.state.allUserProfiles : []}
          onAddUser={this.onAddUser}
          selectedTeamName={this.state.selectedTeam}
        />
        <CreateNewTeamPopup
          open={this.state.createNewTeamPopupOpen}
          onClose={this.onCreateNewTeamClose}
          onOkClick={this.addNewTeam}
          teamName={this.state.selectedTeam}
          teamId={this.state.selectedTeamId}
          isActive={this.state.isActive}
          isEdit={this.state.isEdit}
        />

        <DeleteTeamPopup
          open={this.state.deleteTeamPopupOpen}
          onClose={this.onDeleteTeamPopupClose}
          selectedTeamName={this.state.selectedTeam}
          selectedTeamId={this.state.selectedTeamId}
          selectedStatus={this.state.isActive}
          onDeleteClick={this.onDeleteUser}
          onSetInactiveClick={this.onConfirmClick}
          selectedTeamCode={this.state.selectedTeamCode}
        />

        <TeamStatusPopup
          open={this.state.teamStatusPopupOpen}
          onClose={this.onTeamStatusClose}
          selectedTeamName={this.state.selectedTeam}
          selectedTeamId={this.state.selectedTeamId}
          selectedStatus={this.state.isActive}
          onConfirmClick={this.onConfirmClick}
          selectedTeamCode={this.state.selectedTeamCode}
        />
      </React.Fragment>
    );
  };

  onAddUser = user => {
    this.props.addTeamMember(this.state.selectedTeamId, user._id, user.firstName, user.lastName, user.role, Date.now());
  };

  /**
   * call back to show team members popup
   */
  onTeamMembersPopupShow = (teamId, teamName, teamCode) => {
    this.props.getTeamMembers(teamId);
    this.setState({
      teamMembersPopupOpen: true,
      selectedTeamId: teamId,
      selectedTeam: teamName,
      selectedTeamCode: teamCode,
    });
  };

  /**
   * To hide the team members popup upon close button click
   */
  onTeamMembersPopupClose = () => {
    this.setState({
      selectedTeamId: undefined,
      selectedTeam: '',
      teamMembersPopupOpen: false,
    });
  };

  /**
   * call back to show delete team popup
   */
  onDeleteTeamPopupShow = (deletedname, teamId, status, teamCode) => {
    this.setState({
      deleteTeamPopupOpen: true,
      selectedTeam: deletedname,
      selectedTeamId: teamId,
      isActive: status,
      selectedTeamCode: teamCode,
    });
  };

  /**
   * To hide the delete team popup upon close button click
   */
  onDeleteTeamPopupClose = () => {
    this.setState({
      selectedTeamId: undefined,
      selectedTeam: '',
      deleteTeamPopupOpen: false,
    });
  };

  /**
   * call back to show create new team popup
   */
  onCreateNewTeamShow = () => {
    this.setState({
      createNewTeamPopupOpen: true,
      selectedTeam: '',
    });
  };

  /**
   * To hide the create new team popup upon close button click
   */
  onCreateNewTeamClose = () => {
    this.setState({
      selectedTeamId: undefined,
      selectedTeam: '',
      createNewTeamPopupOpen: false,
      isEdit: false,
    });
  };

  onEidtTeam = (teamName, teamId, status, teamCode) => {
    this.setState({
      isEdit: true,
      createNewTeamPopupOpen: true,
      selectedTeam: teamName,
      selectedTeamId: teamId,
      selectedTeamCode: teamCode,
      isActive: status,
    });
  };

  /**
   * call back to show team status popup
   */
  onTeamStatusShow = (teamName, teamId, isActive, teamCode) => {
    this.setState({
      teamStatusPopupOpen: true,
      selectedTeam: teamName,
      selectedTeamId: teamId,
      selectedTeamCode: teamCode,
      isActive,
    });
  };

  /**
   * To hide the team status popup upon close button click
   */
  onTeamStatusClose = () => {
    this.setState({
      selectedTeamId: undefined,
      selectedTeam: '',
      isEdit: false,
      teamStatusPopupOpen: false,
    });
  };

  /**
   * callback for search
   */
  onWildCardSearch = searchText => {
    this.setState({
      wildCardSearchText: searchText,
    });
  };

  /**
   * callback for adding new team
   */
  addNewTeam = async (name, isEdit) => {
    if (isEdit) {
      const updateTeamResponse = await this.props.updateTeam(name, this.state.selectedTeamId, this.state.isActive, this.state.selectedTeamCode);
      if (updateTeamResponse.status === 200) {
        toast.success('Team updated successfully')
      } else {
        toast.error(updateTeamResponse)
      }
    } else {
      const postResponse = await this.props.postNewTeam(name, true);
      if (postResponse.status === 200) {
        toast.success('Team added successfully');
      } else {
        toast.error(postResponse);
      }
    }
    this.setState({
      selectedTeamId: undefined,
      selectedTeam: '',
      isEdit: false,
      createNewTeamPopupOpen: false,
    });
  };
  /**
   * callback for deleting a team
   */

  onDeleteUser = async deletedId => {
    const deleteResponse = await this.props.deleteTeam(deletedId, 'delete');
    if (deleteResponse.status === 200) {
      toast.success('Team successfully deleted and user profiles updated');
    } else {
      toast.error(deleteResponse);
    }
    this.setState({
      deleteTeamPopupOpen: false,
    });
  };

  /**
   * callback for changing the status of a team
   */
  onConfirmClick = async (teamName, teamId, isActive, teamCode) => {
    const updateTeamResponse = await this.props.updateTeam(teamName, teamId, isActive, teamCode);
    if (updateTeamResponse.status === 200) {
      toast.success('Status Updated Successfully')
    } else {
      toast.error(updateTeamResponse)
    }
    this.setState({
      teamStatusPopupOpen: false,
      deleteTeamPopupOpen: false,
    });
  };

  /**
   * callback for deleting a member in a team
   */
  onDeleteTeamMember = deletedUserId => {
    this.props.deleteTeamMember(this.state.selectedTeamId, deletedUserId);
    alert(
      'Team member successfully deleted! Ryunosuke Satoro famously said, “Individually we are one drop, together we are an ocean.” Through the action you just took, this ocean is now one drop smaller.',
    );
  };

  sortTeamsByModifiedDate = () => {
    const { teams } = this.state;

    const sortedTeams = [...teams].sort((a, b) => {
      let dateA = new Date(a.props.team.modifiedDatetime);
      let dateB = new Date(b.props.team.modifiedDatetime);

      if (dateA < dateB) {
        return 1;
      } else if (dateA > dateB) {
        return -1;
      }
      return 0; // Sort in descending order
    });

    this.setState({ sortedTeams: sortedTeams });
  };

  toggleTeamNameSort = () => {
    const { teams, sortTeamNameState } = this.state;
  
    let sortedTeams;
    let newSortState;
  
    switch (sortTeamNameState) {
      case 'none':
        sortedTeams = [...teams].sort((a, b) => a.props.name.localeCompare(b.props.name));
        newSortState = 'ascending';
        break;
      case 'ascending':
        sortedTeams = [...teams].sort((a, b) => b.props.name.localeCompare(a.props.name));
        newSortState = 'descending';
        break;
      default:
        sortedTeams = [...teams].sort((a, b) => {
          let dateA = new Date(a.props.team.modifiedDatetime);
          let dateB = new Date(b.props.team.modifiedDatetime);
          return dateB - dateA;
        });
        newSortState = 'none';
        break;
    }

    if (sortedTeams) {
      sortedTeams = sortedTeams.map((team, index) => ({...team, props: {...team.props, index}}));
    }
  
    this.setState({ sortedTeams, sortTeamNameState: newSortState, sortTeamActiveState: 'none' });
  };  

  toggleTeamActiveSort = () => {
    const { teams, sortTeamActiveState } = this.state;
  
    let sortedTeams;
    let newSortState;
  
    switch (sortTeamActiveState) {
      case 'none':
        sortedTeams = [...teams].sort((a, b) => a.props.active - b.props.active);
        newSortState = 'ascending';
        break;
      case 'ascending':
        sortedTeams = [...teams].sort((a, b) => b.props.active - a.props.active);
        newSortState = 'descending';
        break;
      default:
        sortedTeams = [...teams].sort((a, b) => {
          let dateA = new Date(a.props.team.modifiedDatetime);
          let dateB = new Date(b.props.team.modifiedDatetime);
          return dateB - dateA;
        });
        newSortState = 'none';
        break;
    }
  
    if (sortedTeams) {
      sortedTeams = sortedTeams.map((team, index) => ({...team, props: {...team.props, index}}));
    }
  
    this.setState({ sortedTeams, sortTeamActiveState: newSortState, sortTeamNameState: 'none' });
  };  
}
const mapStateToProps = state => ({ state });
export default connect(mapStateToProps, {
  getAllUserProfile,
  getAllUserTeams,
  postNewTeam,
  deleteTeam,
  updateTeam,
  getTeamMembers,
  deleteTeamMember,
  addTeamMember,
})(Teams);
