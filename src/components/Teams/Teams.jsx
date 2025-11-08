/* eslint-disable import/no-named-as-default */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/sort-comp */
import React from 'react';
import { connect } from 'react-redux';
import { Container } from 'reactstrap';
import { toast } from 'react-toastify';
import { searchWithAccent } from '../../utils/search';
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
import { getCachedTeamMembers } from './teamMembersCache';

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
      teams: null, // null = loading, [] = empty, [...Team rows] = ready
      sortedTeams: [],
      sortTeamNameState: 'none',
      sortTeamActiveState: 'none',
      selectedFilter: 'all',

      initialMembersForPopup: [], // snapshot we can show instantly
      membersFetching: false,
    };
  }

  componentDidMount() {
    this.props.getAllUserTeams('all');
    this.props.getAllUserProfile();
  }

  async componentDidUpdate(prevProps, prevState) {
    const prevAllTeams = prevProps.state.allTeamsData.allTeams;
    const currAllTeams = this.props.state.allTeamsData.allTeams;
    const fetching = this.props.state.allTeamsData.fetching;

    if (
      !lo.isEqual(prevAllTeams, currAllTeams) ||
      prevState.teamNameSearchText !== this.state.teamNameSearchText ||
      prevState.wildCardSearchText !== this.state.wildCardSearchText ||
      prevState.selectedFilter !== this.state.selectedFilter
    ) {
      this.setState({
        teams: fetching ? null : this.teamTableElements(currAllTeams),
      });
    }

    if (
      prevState.teams !== this.state.teams ||
      prevState.sortTeamNameState !== this.state.sortTeamNameState ||
      prevState.sortTeamActiveState !== this.state.sortTeamActiveState
    ) {
      this.sortTeams();
    }

    // Keep your existing metadata refresh behavior
    if (prevAllTeams.length !== currAllTeams.length) {
      this.props.getAllUserTeams();
      this.props.getAllUserProfile();
    } else {
      const teamsChanged = prevAllTeams.some((prevTeam, index) => {
        const currentTeam = currAllTeams[index];
        return prevTeam?.someProperty !== currentTeam?.someProperty;
      });
      if (teamsChanged) {
        this.props.getAllUserTeams();
        this.props.getAllUserProfile();
      }
    }
  }

  onFilterClick = filter => this.setState({ selectedFilter: filter });

  render() {
    const { allTeams, fetching } = this.props.state.allTeamsData;
    const { darkMode } = this.props.state.theme;

    const numberOfTeams = allTeams.length || 0;
    const numberOfActiveTeams = allTeams.filter(t => t.isActive === true).length;
    const numberOfInActiveTeams = allTeams.filter(t => t.isActive === false).length;

    return (
      <Container
        fluid
        className={`teams-container ${darkMode ? 'bg-oxford-blue text-light' : ''}`}
        style={{ minHeight: '100%' }}
      >
        {fetching ? (
          <Loading />
        ) : (
          <>
            <div className="container mt-3">
              {this.teampopupElements(allTeams)}
              <TeamOverview
                numberOfTeams={numberOfTeams}
                numberOfActiveTeams={numberOfActiveTeams}
                numberOfInActiveTeams={numberOfInActiveTeams}
                onAllClick={() => this.onFilterClick('all')}
                onActiveClick={() => this.onFilterClick('active')}
                onInactiveClick={() => this.onFilterClick('inactive')}
                selectedFilter={this.state.selectedFilter}
              />
              <TeamTableSearchPanel
                onSearch={this.onWildCardSearch}
                onCreateNewTeamClick={this.onCreateNewTeamShow}
                darkMode={darkMode}
              />

              {this.state.teams === null ? (
                <div
                  className={`d-flex justify-content-center align-items-center py-5 ${
                    darkMode ? 'dark-mode' : ''
                  }`}
                >
                  <h1 className="warning-text">
                    <strong>Loading . . .</strong>
                  </h1>
                </div>
              ) : this.state.teams.length === 0 ? (
                <div
                  className={`d-flex justify-content-center align-items-center py-5 ${
                    darkMode ? 'dark-mode' : ''
                  }`}
                >
                  <h1 className="warning-text">
                    <strong>Team Not Found</strong>
                  </h1>
                </div>
              ) : (
                <div className="table-responsive">
                  <table
                    className={`table teams-table table-bordered table-responsive-sm ${
                      darkMode ? 'dark-mode bg-yinmn-blue text-light' : ''
                    }`}
                  >
                    <thead>
                      <TeamTableHeader
                        onTeamNameSort={this.toggleTeamNameSort}
                        onTeamActiveSort={this.toggleTeamActiveSort}
                        sortTeamNameState={this.state.sortTeamNameState}
                        sortTeamActiveState={this.state.sortTeamActiveState}
                        darkMode={darkMode}
                      />
                    </thead>
                    <tbody className={darkMode ? 'dark-mode' : ''}>{this.state.sortedTeams}</tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </Container>
    );
  }

  teamTableElements = allTeams => {
    if (!Array.isArray(allTeams) || allTeams.length === 0) return [];
    let teamSearchData = this.filteredTeamList(allTeams);

    if (this.state.selectedFilter === 'active') {
      teamSearchData = teamSearchData.filter(team => team.isActive === true);
    } else if (this.state.selectedFilter === 'inactive') {
      teamSearchData = teamSearchData.filter(team => team.isActive === false);
    }

    return teamSearchData
      .sort((a, b) =>
        a.modifiedDatetime > b.modifiedDatetime
          ? -1
          : a.modifiedDatetime < b.modifiedDatetime
          ? 1
          : 0,
      )
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
          team={team}
        />
      ));
  };

  filteredTeamList = allTeams =>
    allTeams.filter(team => {
      if (
        (team.teamName &&
          searchWithAccent(team.teamName, this.state.teamNameSearchText) &&
          this.state.wildCardSearchText === '') ||
        (this.state.wildCardSearchText !== '' &&
          searchWithAccent(team.teamName, this.state.wildCardSearchText))
      ) {
        return true;
      }
      return false;
    });

  teampopupElements = allTeams => {
    const { selectedTeamId, initialMembersForPopup, membersFetching } = this.state;

    const cachedNow = getCachedTeamMembers(String(selectedTeamId));
    const sliceMembers = this.props.state ? this.props.state.teamsTeamMembers : [];
    const members =
      (Array.isArray(cachedNow) && cachedNow) ||
      (Array.isArray(initialMembersForPopup) && initialMembersForPopup) ||
      (Array.isArray(sliceMembers) && sliceMembers) ||
      [];

    const selectedTeamData = allTeams
      ? allTeams.filter(team => team.teamName === this.state.selectedTeam)
      : [];

    return (
      <>
        <TeamMembersPopup
          open={this.state.teamMembersPopupOpen}
          onClose={this.onTeamMembersPopupClose}
          members={members}
          ffetching={membersFetching}
          onDeleteClick={this.onDeleteTeamMember}
          usersdata={this.props.state ? this.props.state.allUserProfiles : []}
          onAddUser={this.onAddUser}
          teamData={selectedTeamData}
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

  onAddUser = user => {
    this.props.addTeamMember(
      this.state.selectedTeamId,
      user._id,
      user.firstName,
      user.lastName,
      user.role,
      Date.now(),
    );
  };

  onUpdateTeamMemberVisibility = (userid, visibility) => {
    this.props.updateTeamMemeberVisibility(this.state.selectedTeamId, userid, visibility);
  };

  onTeamMembersPopupShow = (teamId, teamName, teamCode, initialSnapshot = []) => {
    this.setState({
      teamMembersPopupOpen: true,
      selectedTeamId: teamId,
      selectedTeam: teamName,
      selectedTeamCode: teamCode,
      initialMembersForPopup: Array.isArray(initialSnapshot) ? initialSnapshot : [],
    });
    this.props.getTeamMembers(teamId);
  };

  onTeamMembersPopupClose = () => {
    this.setState({
      selectedTeamId: undefined,
      selectedTeam: '',
      teamMembersPopupOpen: false,
    });
  };

  onDeleteTeamPopupShow = (deletedname, teamId, status, teamCode) => {
    this.setState({
      deleteTeamPopupOpen: true,
      selectedTeam: deletedname,
      selectedTeamId: teamId,
      isActive: status,
      selectedTeamCode: teamCode,
    });
  };

  onDeleteTeamPopupClose = () => {
    this.setState({
      selectedTeamId: undefined,
      selectedTeam: '',
      deleteTeamPopupOpen: false,
    });
  };

  onCreateNewTeamShow = () => {
    this.setState({ createNewTeamPopupOpen: true, selectedTeam: '' });
  };

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

  onTeamStatusShow = (teamName, teamId, isActive, teamCode) => {
    this.setState({
      teamStatusPopupOpen: true,
      selectedTeam: teamName,
      selectedTeamId: teamId,
      selectedTeamCode: teamCode,
      isActive,
    });
  };

  onTeamStatusClose = () => {
    this.setState({
      selectedTeamId: undefined,
      selectedTeam: '',
      isEdit: false,
      teamStatusPopupOpen: false,
    });
  };

  onWildCardSearch = searchText => this.setState({ wildCardSearchText: searchText });

  addNewTeam = async (name, isEdit) => {
    if (isEdit) {
      const res = await this.props.updateTeam(
        name,
        this.state.selectedTeamId,
        this.state.isActive,
        this.state.selectedTeamCode,
      );
      res.status === 200 ? toast.success('Team updated successfully') : toast.error(res);
    } else {
      const res = await this.props.postNewTeam(name, true);
      res.status === 200 ? toast.success('Team added successfully') : toast.error(res);
    }
    this.setState({
      selectedTeamId: undefined,
      selectedTeam: '',
      isEdit: false,
      createNewTeamPopupOpen: false,
    });
  };

  onDeleteUser = async deletedId => {
    const res = await this.props.deleteTeam(deletedId, 'delete');
    res.status === 200
      ? toast.success('Team successfully deleted and user profiles updated')
      : toast.error(res);
    this.setState({ deleteTeamPopupOpen: false });
  };

  onConfirmClick = async (teamName, teamId, isActive, teamCode) => {
    const res = await this.props.updateTeam(teamName, teamId, isActive, teamCode);
    res.status === 200 ? toast.success('Status Updated Successfully') : toast.error(res);
    this.setState({ teamStatusPopupOpen: false, deleteTeamPopupOpen: false });
  };

  onDeleteTeamMember = deletedUserId => {
    this.props.deleteTeamMember(this.state.selectedTeamId, deletedUserId);
  };

  sortTeams = () => {
    const { teams, sortTeamNameState, sortTeamActiveState } = this.state;
    if (!Array.isArray(teams)) return;

    const sortedTeams = [...teams]
      .sort((a, b) => {
        const dateA = new Date(a.props.team.modifiedDatetime);
        const dateB = new Date(b.props.team.modifiedDatetime);
        const nameA = a.props.name;
        const nameB = b.props.name;
        const activeA = a.props.active;
        const activeB = b.props.active;

        if (sortTeamNameState === 'ascending') return nameA.localeCompare(nameB);
        if (sortTeamNameState === 'descending') return nameB.localeCompare(nameA);
        if (sortTeamActiveState === 'ascending') return activeA - activeB;
        if (sortTeamActiveState === 'descending') return activeB - activeA;
        return dateB - dateA;
      })
      .map((team, index) => ({ ...team, props: { ...team.props, index } }));

    this.setState({ sortedTeams });
  };

  // SONAR: use functional setState because we depend on previous state
  toggleTeamNameSort = () => {
    this.setState(prev => {
      const next =
        prev.sortTeamNameState === 'none'
          ? 'ascending'
          : prev.sortTeamNameState === 'ascending'
          ? 'descending'
          : 'none';
      return { sortTeamNameState: next, sortTeamActiveState: 'none' };
    });
  };

  // SONAR: use functional setState because we depend on previous state
  toggleTeamActiveSort = () => {
    this.setState(prev => {
      const next =
        prev.sortTeamActiveState === 'none'
          ? 'ascending'
          : prev.sortTeamActiveState === 'ascending'
          ? 'descending'
          : 'none';
      return { sortTeamActiveState: next, sortTeamNameState: 'none' };
    });
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
