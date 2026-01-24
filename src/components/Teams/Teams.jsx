/* eslint-disable import/no-named-as-default */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/sort-comp */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Container } from 'reactstrap';
import { toast } from 'react-toastify';
import isEqual from 'lodash/isEqual';
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
import DeleteTeamPopup from './DeleteTeamPopup';
import TeamStatusPopup from './TeamStatusPopup';
import AddTeamPopup from '../UserProfile/TeamsAndProjects/AddTeamPopup';
import { getCachedTeamMembers } from './teamMembersCache';

// constants
const FILTER_ALL = 'all';
const FILTER_ACTIVE = 'active';
const FILTER_INACTIVE = 'inactive';

class Teams extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      teamNameSearchText: '',
      teamMembersPopupOpen: false,
      deleteTeamPopupOpen: false,
      teamStatusPopupOpen: false,
      wildCardSearchText: '',
      selectedTeamId: 0,
      selectedTeam: '',
      isActive: '',
      selectedTeamCode: '',
      teams: null, // null = loading; [] = empty; [...rows] = ready
      sortedTeams: [],
      sortTeamNameState: 'none', // 'none' | 'ascending' | 'descending'
      sortTeamActiveState: 'none', // 'none' | 'ascending' | 'descending'
      selectedFilter: FILTER_ALL,
      
      // Features from HEAD
      addTeamPopupOpen: false,
      isEdit: false,

      initialMembersForPopup: [],
      membersFetching: false,
    };
  }

  componentDidMount() {
    this.props.getAllUserTeams(FILTER_ALL);
    this.props.getAllUserProfile();
  }

  componentDidUpdate(prevProps, prevState) {
    const prevSlice = prevProps.state?.allTeamsData;
    const currSlice = this.props.state?.allTeamsData;
    const prevTeams = prevSlice?.allTeams ?? [];
    const currTeams = currSlice?.allTeams ?? [];
    const fetching = Boolean(currSlice?.fetching);

    const filterChanged =
      prevState.teamNameSearchText !== this.state.teamNameSearchText ||
      prevState.wildCardSearchText !== this.state.wildCardSearchText ||
      prevState.selectedFilter !== this.state.selectedFilter;

    const teamsChanged = !isEqual(prevTeams, currTeams);

    if (teamsChanged || filterChanged) {
      // teams: fetching -> null, otherwise rebuild rows
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState(() => ({
        teams: fetching ? null : this.buildTeamRows(currTeams),
      }));
    }

    const sortChanged =
      prevState.teams !== this.state.teams ||
      prevState.sortTeamNameState !== this.state.sortTeamNameState ||
      prevState.sortTeamActiveState !== this.state.sortTeamActiveState;
    if (sortChanged) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState(prev => ({
        sortedTeams: this.sortRows(prev.teams, prev),
      }));
    }
  }

  // ───────────────────────── helpers ─────────────────────────

  setFilter = filter => this.setState({ selectedFilter: filter });

  filteredTeamList = allTeams => {
    const { teamNameSearchText, wildCardSearchText } = this.state;
    return allTeams.filter(team => {
      const name = team?.teamName || '';
      if (!name) return false;

      const matchByName = teamNameSearchText ? searchWithAccent(name, teamNameSearchText) : true;

      const wild = wildCardSearchText.trim();
      const matchByWild = wild ? searchWithAccent(name, wild) : true;

      return matchByName && matchByWild;
    });
  };

  applyFilter = teams => {
    const { selectedFilter } = this.state;
    if (selectedFilter === FILTER_ACTIVE) return teams.filter(t => t.isActive === true);
    if (selectedFilter === FILTER_INACTIVE) return teams.filter(t => t.isActive === false);
    return teams;
  };

  buildTeamRows = allTeams => {
    if (!Array.isArray(allTeams) || allTeams.length === 0) return [];

    const filtered = this.applyFilter(this.filteredTeamList(allTeams));

    const byModified = [...filtered].sort((a, b) => {
      const da = new Date(a?.modifiedDatetime || 0).getTime();
      const db = new Date(b?.modifiedDatetime || 0).getTime();
      return db - da;
    });

    return byModified.map((team, index) => (
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

  sortRows = (rows, state) => {
    if (!Array.isArray(rows)) return [];

    const { sortTeamNameState, sortTeamActiveState } = state;

    const sorted = [...rows].sort((a, b) => {
      const dateA = new Date(a.props.team.modifiedDatetime || 0).getTime();
      const dateB = new Date(b.props.team.modifiedDatetime || 0).getTime();
      const nameA = a.props.name || '';
      const nameB = b.props.name || '';
      const activeA = a.props.active ? 1 : 0;
      const activeB = b.props.active ? 1 : 0;

      if (sortTeamNameState === 'ascending') return nameA.localeCompare(nameB);
      if (sortTeamNameState === 'descending') return nameB.localeCompare(nameA);

      if (sortTeamActiveState === 'ascending') return activeA - activeB;
      if (sortTeamActiveState === 'descending') return activeB - activeA;

      return dateB - dateA;
    });

    return sorted.map((el, i) => ({ ...el, props: { ...el.props, index: i } }));
  };

  // ───────────────────────── render ─────────────────────────

  render() {
    const { allTeams = [], fetching = false } = this.props.state.allTeamsData || {};
    const { darkMode } = this.props.state.theme || { darkMode: false };

    const numberOfTeams = allTeams.length;
    const numberOfActiveTeams = allTeams.filter(t => t.isActive === true).length;
    const numberOfInActiveTeams = allTeams.filter(t => t.isActive === false).length;

    const containerClass = `teams-container ${darkMode ? 'bg-oxford-blue text-light' : ''}`;
    const tableClass = `table teams-table table-bordered table-responsive-sm ${
      darkMode ? 'dark-mode bg-yinmn-blue text-light' : ''
    }`;

    return (
      <Container fluid className={containerClass} style={{ minHeight: '100%' }}>
        {fetching ? (
          <Loading />
        ) : (
          <div className="container mt-3">
            {this.renderPopups(allTeams)}
            <TeamOverview
              numberOfTeams={numberOfTeams}
              numberOfActiveTeams={numberOfActiveTeams}
              numberOfInActiveTeams={numberOfInActiveTeams}
              onAllClick={() => this.setFilter(FILTER_ALL)}
              onActiveClick={() => this.setFilter(FILTER_ACTIVE)}
              onInactiveClick={() => this.setFilter(FILTER_INACTIVE)}
              selectedFilter={this.state.selectedFilter}
            />
            <TeamTableSearchPanel
              onSearch={this.onWildCardSearch}
              onCreateNewTeamClick={this.onCreateNewTeamShow}
              darkMode={darkMode}
              teamsData={{ allTeams }}
              searchText={this.state.wildCardSearchText}
            />

            {this.renderTable(tableClass, darkMode)}
          </div>
        )}
      </Container>
    );
  }

  renderTable = (tableClass, darkMode) => {
    if (this.state.teams === null) {
      return (
        <div
          className={`d-flex justify-content-center align-items-center py-5 ${
            darkMode ? 'dark-mode' : ''
          }`}
        >
          <h1 className="warning-text">
            <strong>Loading . . .</strong>
          </h1>
        </div>
      );
    }

    if (this.state.teams.length === 0) {
      return (
        <div
          className={`d-flex justify-content-center align-items-center py-5 ${
            darkMode ? 'dark-mode' : ''
          }`}
        >
          <h1 className="warning-text">
            <strong>Team Not Found</strong>
          </h1>
        </div>
      );
    }

    return (
      <div className="table-responsive">
        <table className={tableClass}>
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
    );
  };

  renderPopups = allTeams => {
    const {
      selectedTeamId,
      initialMembersForPopup,
      membersFetching,
      selectedTeam,
      teamMembersPopupOpen,
      deleteTeamPopupOpen,
      teamStatusPopupOpen,
      isActive,
      selectedTeamCode,
    } = this.state;

    // prefer cache → snapshot → slice
    const cachedNow = getCachedTeamMembers(String(selectedTeamId));
    const sliceMembers = this.props.state?.teamsTeamMembers || [];
    const members =
      (Array.isArray(cachedNow) && cachedNow) ||
      (Array.isArray(initialMembersForPopup) && initialMembersForPopup) ||
      (Array.isArray(sliceMembers) && sliceMembers) ||
      [];

    const selectedTeamData = Array.isArray(allTeams)
      ? allTeams.filter(team => team.teamName === selectedTeam)
      : [];

    return (
      <>
        <TeamMembersPopup
          open={teamMembersPopupOpen}
          onClose={this.onTeamMembersPopupClose}
          members={members}
          fetching={membersFetching}
          onDeleteClick={this.onDeleteTeamMember}
          usersdata={this.props.state?.allUserProfiles || []}
          onAddUser={this.onAddUser}
          teamData={selectedTeamData}
          onUpdateTeamMemberVisibility={this.onUpdateTeamMemberVisibility}
          selectedTeamName={selectedTeam}
        />
        <AddTeamPopup
          open={this.state.addTeamPopupOpen}
          onClose={this.onAddTeamPopupClose}
          teamsData={{ allTeams }}
          userTeamsById={[]}
          onSelectAssignTeam={async () => {
            try {
              // Close the popup first
              this.setState({
                addTeamPopupOpen: false,
                wildCardSearchText: '',
                teamNameSearchText: '',
                isEdit: false,
                selectedTeam: '',
                selectedTeamId: undefined,
                selectedTeamCode: '',
                isActive: '',
              });
              // Refresh the data from the server
              await this.props.getAllUserTeams();
              await this.props.getAllUserProfile();
            } catch (error) {
              toast.error('Error updating team list. Please refresh the page.');
            }
          }}
          handleSubmit={() => {}}
          userProfile={{}}
          darkMode={this.props.state.theme.darkMode}
          isTeamManagement
          isEdit={this.state.isEdit}
          teamName={this.state.selectedTeam}
          teamId={this.state.selectedTeamId}
          teamCode={this.state.selectedTeamCode}
          isActive={this.state.isActive}
          onUpdateTeam={this.props.updateTeam}
        />
        <DeleteTeamPopup
          open={deleteTeamPopupOpen}
          onClose={this.onDeleteTeamPopupClose}
          selectedTeamName={selectedTeam}
          selectedTeamId={selectedTeamId}
          selectedStatus={isActive}
          onDeleteClick={this.onDeleteUser}
          onSetInactiveClick={this.onConfirmClick}
          selectedTeamCode={selectedTeamCode}
        />
        <TeamStatusPopup
          open={teamStatusPopupOpen}
          onClose={this.onTeamStatusClose}
          selectedTeamName={selectedTeam}
          selectedTeamId={selectedTeamId}
          selectedStatus={isActive}
          onConfirmClick={this.onConfirmClick}
          selectedTeamCode={selectedTeamCode}
        />
      </>
    );
  };

  // ───────────────────────── handlers ─────────────────────────

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

  onUpdateTeamMemberVisibility = (userId, visibility) => {
    this.props.updateTeamMemeberVisibility(this.state.selectedTeamId, userId, visibility);
  };

  // NOTE: Team component calls (id, name, code) and we open immediately
  onTeamMembersPopupShow = (teamId, teamName, teamCode, initialSnapshot = []) => {
    this.setState({
      teamMembersPopupOpen: true,
      selectedTeamId: teamId,
      selectedTeam: teamName,
      selectedTeamCode: teamCode,
      initialMembersForPopup: Array.isArray(initialSnapshot) ? initialSnapshot : [],
    });
    this.props.getTeamMembers(teamId); // refresh in background
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
    this.setState({
      addTeamPopupOpen: true,
      isEdit: false,
      selectedTeam: '',
      selectedTeamId: undefined,
      selectedTeamCode: '',
      isActive: '',
    });
  };

  onAddTeamPopupClose = () => {
    this.setState({
      addTeamPopupOpen: false,
      selectedTeam: '',
    });
  };

  onEidtTeam = (teamName, teamId, status, teamCode) => {
    this.setState({
      addTeamPopupOpen: true,
      isEdit: true,
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
      teamStatusPopupOpen: false,
    });
  };

  onWildCardSearch = searchText => this.setState({ wildCardSearchText: searchText });

  onDeleteUser = async deletedId => {
    const res = await this.props.deleteTeam(deletedId, 'delete');
    if (res.status === 200) toast.success('Team successfully deleted and user profiles updated');
    else toast.error(res);
    this.setState({ deleteTeamPopupOpen: false });
  };

  onConfirmClick = async (teamName, teamId, isActive, teamCode) => {
    const res = await this.props.updateTeam(teamName, teamId, isActive, teamCode);
    if (res.status === 200) toast.success('Status Updated Successfully');
    else toast.error(res);
    this.setState({ teamStatusPopupOpen: false, deleteTeamPopupOpen: false });
  };

  onDeleteTeamMember = deletedUserId => {
    this.props.deleteTeamMember(this.state.selectedTeamId, deletedUserId);
  };

  toggleTeamNameSort = () => {
    this.setState(prev => {
      const step = { none: 'ascending', ascending: 'descending', descending: 'none' };
      return {
        sortTeamNameState: step[prev.sortTeamNameState] || 'none',
        sortTeamActiveState: 'none',
      };
    });
  };
  toggleTeamActiveSort = () => {
    this.setState(prev => {
      const step = { none: 'ascending', ascending: 'descending', descending: 'none' };
      return {
        sortTeamActiveState: step[prev.sortTeamActiveState] || 'none',
        sortTeamNameState: 'none',
      };
    });
  };
}

Teams.propTypes = {
  // connected redux state
  state: PropTypes.shape({
    allTeamsData: PropTypes.shape({
      allTeams: PropTypes.array,
      fetching: PropTypes.bool,
    }),
    theme: PropTypes.shape({
      darkMode: PropTypes.bool,
    }),
    teamsTeamMembers: PropTypes.array,
    allUserProfiles: PropTypes.array,
  }).isRequired,

  // actions (all required by usage)
  getAllUserTeams: PropTypes.func.isRequired,
  getAllUserProfile: PropTypes.func.isRequired,
  postNewTeam: PropTypes.func.isRequired,
  deleteTeam: PropTypes.func.isRequired,
  updateTeam: PropTypes.func.isRequired,
  getTeamMembers: PropTypes.func.isRequired,
  deleteTeamMember: PropTypes.func.isRequired,
  addTeamMember: PropTypes.func.isRequired,
  updateTeamMemeberVisibility: PropTypes.func.isRequired,
};

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
