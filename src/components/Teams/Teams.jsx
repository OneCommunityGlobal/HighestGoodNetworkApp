/* eslint-disable react/sort-comp */
import React from 'react';
import { connect } from 'react-redux';
import { Container } from 'reactstrap';
import { toast } from 'react-toastify';
import { searchWithAccent } from 'utils/search';
import {
  getAllUserTeams,
  postNewTeam,
  deleteTeam,
  updateTeam,
  getTeamMembers,
  deleteTeamMember,
  addTeamMember,
  updateTeamMemeberVisibility,
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
import lo from 'lodash';

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
      sortTeamNameState: 'none', // 'none', 'ascending', 'descending'
      sortTeamActiveState: 'none', // 'none', 'ascending', 'descending'
    };
  }

  componentDidMount() {
    // Initiating the teams fetch action.
    this.setState({ teams: this.teamTableElements(this.props.state.allTeamsData.allTeams)});
    this.props.getAllUserTeams();
    this.props.getAllUserProfile();
  }
  
  componentDidUpdate(prevProps, prevState) {
    if (
      !lo.isEqual(prevProps.state.allTeamsData.allTeams, this.props.state.allTeamsData.allTeams) || 
      prevState.teamNameSearchText !== this.state.teamNameSearchText || 
      prevState.wildCardSearchText !== this.state.wildCardSearchText
    ) {
      this.setState({ teams: this.teamTableElements(this.props.state.allTeamsData.allTeams) });
    } 
    
    if (
      prevState.teams !== this.state.teams || 
      prevState.sortTeamNameState !== this.state.sortTeamNameState || 
      prevState.sortTeamActiveState !== this.state.sortTeamActiveState
    ) {
      this.sortTeams();
    }

    if (
      (prevProps.state.allTeamsData.allTeams && prevProps.state.allTeamsData.allTeams.length) !== (this.props.state.allTeamsData.allTeams && this.props.state.allTeamsData.allTeams.length)
    ) {
      // Teams length has changed, update or re-fetch them
      this.props.getAllUserTeams();
      this.props.getAllUserProfile();
    } else {
      // Check if the contents of allTeams have changed
      const prevTeams = prevProps.state.allTeamsData.allTeams;
      const currentTeams = this.props.state.allTeamsData.allTeams;

      // Compare specific properties of each team object
      const teamsChanged = prevTeams.some((prevTeam, index) => {
        const currentTeam = currentTeams[index];
        // Compare relevant properties
        return prevTeam.someProperty !== currentTeam.someProperty;
      });

      if (teamsChanged) {
        // Teams have changed, update or re-fetch them
        this.props.getAllUserTeams();
        this.props.getAllUserProfile();
      }
      if (!lo.isEqual(this.props.state.teamsTeamMembers.teamMembers, prevProps.state.teamsTeamMembers.teamMembers)) {
        // Members have changed, update or re-fetch them
        this.props.getAllUserTeams();
        this.props.getAllUserProfile();
      }
    }
  }

  render() {
    const { allTeams, fetching } = this.props.state.allTeamsData;
    const { darkMode } = this.props.state.theme;
    const numberOfTeams = allTeams && allTeams.length;
    const numberOfActiveTeams = numberOfTeams ? allTeams.filter(team => team.isActive).length : 0;

    return (
      <Container fluid className={`teams-container ${darkMode ? 'bg-oxford-blue text-light' : ''}`} style={{minHeight: "100%"}}>
        {fetching ? (
          <Loading />
        ) : (
          <React.Fragment>
            <div className="container mt-3">
              {this.teampopupElements(allTeams)}
              <TeamOverview
                numberOfTeams={numberOfTeams}
                numberOfActiveTeams={numberOfActiveTeams}
              />
              <TeamTableSearchPanel
                onSearch={this.onWildCardSearch}
                onCreateNewTeamClick={this.onCreateNewTeamShow}
                darkMode={darkMode}
              />
                <div className="overflow-container">
                  <table className={`table table-bordered table-responsive-sm ${darkMode ? 'dark-mode bg-yinmn-blue text-light' : ''}`}>
                    <thead>
                      <TeamTableHeader 
                        onTeamNameSort={this.toggleTeamNameSort} 
                        onTeamActiveSort={this.toggleTeamActiveSort} 
                        sortTeamNameState={this.state.sortTeamNameState}
                        sortTeamActiveState={this.state.sortTeamActiveState} 
                        darkMode={darkMode}
                      />
                    </thead>
                    <tbody className={`fixed-scrollbar ${darkMode ? 'dark-mode' : ''}`}>
                      {this.state.sortedTeams}
                    </tbody>
                  </table>
                </div>
              </div>
          </React.Fragment>
        )}
      </Container>
    );
  }

  /**
   * Creates the table body elements after applying the search filter and return it.
   */
  teamTableElements = (allTeams, darkMode) => {
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
          searchWithAccent(team.teamName, this.state.teamNameSearchText) &&
          this.state.wildCardSearchText === '') ||
        // the wild card search, the search text can be match with any item
        (this.state.wildCardSearchText !== '' &&
          searchWithAccent(team.teamName, this.state.wildCardSearchText))
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

  teampopupElements = (allTeams) => {
    //WHERE ARE THE MEMBERS COMING
    const members = this.props.state ? this.props.state.teamsTeamMembers : [];
    const selectedTeamData= allTeams? allTeams.filter(team => team.teamName === this.state.selectedTeam) : [];
    return (
      <>
        <TeamMembersPopup
          open={this.state.teamMembersPopupOpen}
          onClose={this.onTeamMembersPopupClose}
          members={members}
          onDeleteClick={this.onDeleteTeamMember}
          usersdata={this.props.state ? this.props.state.allUserProfiles : []}
          onAddUser={this.onAddUser}
          teamData= {selectedTeamData}
          onUpdateTeamMemberVisibility={this.onUpdateTeamMemberVisibility}
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
      </>
    );
  };

  // CNOTE: ADD USER HERE
  onAddUser = async user => {
    await this.props.addTeamMember(this.state.selectedTeamId, user._id, user.firstName, user.lastName, user.role, Date.now());
    // this.props.getTeamMembers(this.state.selectedTeamId);
  };

   /** NEW CODE
   * Update Team member visibility by making a Redux action call
   */
  onUpdateTeamMemberVisibility = async (userid, visibility) => {
    await this.props.updateTeamMemeberVisibility(this.state.selectedTeamId, userid, visibility);
    // this.props.getTeamMembers(this.state.selectedTeamId);
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
      const updateTeamResponse = await this.props.updateTeam(
        name,
        this.state.selectedTeamId,
        this.state.isActive,
        this.state.selectedTeamCode,
      );
      if (updateTeamResponse && updateTeamResponse.status === 200) {
        toast.success('Team updated successfully');
      } else if(!updateTeamResponse) {
        toast.error("You are not authorized to edit team code.");
      }else{
        toast.error(updateTeamResponse);
      }
    } else {
      const postResponse = await this.props.postNewTeam(name, true);
      if (postResponse.status && postResponse.status === 200) {
        toast.success('Team added successfully');
      } else if(!postResponse) {
        toast.error("You are not authorized to add team code.");
      }else{
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
      toast.success('Status Updated Successfully');
    } else {
      toast.error(updateTeamResponse);
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
  };

  sortTeams = () => {
    const { teams, sortTeamNameState, sortTeamActiveState } = this.state;
    
    if (!Array.isArray(teams)) {
    console.error("Teams is not an array:", teams);
    return;
  }
    const sortedTeams = [...teams].sort((a, b) => {
      const dateA = new Date(a.props.team.modifiedDatetime);
      const dateB = new Date(b.props.team.modifiedDatetime);
      const nameA = a.props.name;
      const nameB = b.props.name;
      const activeA = a.props.active;
      const activeB = b.props.active;
      if (sortTeamNameState === 'ascending') {
        return nameA.localeCompare(nameB);
      } else if (sortTeamNameState === 'descending') {
        return nameB.localeCompare(nameA);
      } else if (sortTeamActiveState === 'ascending') {
        return activeA - activeB;
      } else if (sortTeamActiveState === 'descending') {
        return activeB - activeA;
      } else {
        return dateB - dateA;
      }
    })
    .map((team, index) => ({
      ...team,
      props: { ...team.props, index },
    }));
    this.setState({ sortedTeams });
  };

  toggleTeamNameSort = () => {
    let newSortState;
    switch(this.state.sortTeamNameState) {
      case 'none':
        newSortState = 'ascending';
        break;
      case 'ascending':
        newSortState = 'descending';
        break;
      case 'descending':
        newSortState = 'none';
        break;
      default:
        throw new Error('Invalid sort state');
    }
    this.setState({ sortTeamNameState: newSortState, sortTeamActiveState: 'none' });
  };

  toggleTeamActiveSort = () => {
    let newSortState;
    switch (this.state.sortTeamActiveState) {
      case 'none':
        newSortState = 'ascending';
        break;
      case 'ascending':
        newSortState = 'descending';
        break;
      case 'descending':
        newSortState = 'none';
        break;
      default:
        throw new Error('Invalid sort state');
    }
    this.setState({ sortTeamActiveState: newSortState, sortTeamNameState: 'none' });
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
  updateTeamMemeberVisibility,
})(Teams);
