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
import isEqual from 'lodash/isEqual';
import { getCachedTeamMembers } from './teamMembersCache';

// constants (avoid magic strings / duplication)
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
      createNewTeamPopupOpen: false,
      teamStatusPopupOpen: false,
      wildCardSearchText: '',
      selectedTeamId: 0,
      selectedTeam: '',
      isActive: '',
      selectedTeamCode: '',
      teams: null, // null = loading, [] = empty, [...Team rows] = ready
      sortedTeams: [],
      sortTeamNameState: 'none', // 'none' | 'ascending' | 'descending'
      sortTeamActiveState: 'none', // 'none' | 'ascending' | 'descending'
      selectedFilter: FILTER_ALL,

      initialMembersForPopup: [],
      membersFetching: false,
    };
  }

  componentDidMount() {
    // single fetch on mount
    this.props.getAllUserTeams(FILTER_ALL);
    this.props.getAllUserProfile();
  }

  componentDidUpdate(prevProps, prevState) {
    const prevSlice = prevProps.state?.allTeamsData;
    const currSlice = this.props.state?.allTeamsData;
    const prevTeams = prevSlice?.allTeams ?? [];
    const currTeams = currSlice?.allTeams ?? [];
    const fetching = Boolean(currSlice?.fetching);

    // Rebuild visible rows if source teams changed or user-chosen filters changed
    const filterChanged =
      prevState.teamNameSearchText !== this.state.teamNameSearchText ||
      prevState.wildCardSearchText !== this.state.wildCardSearchText ||
      prevState.selectedFilter !== this.state.selectedFilter;

    const teamsChanged = !isEqual(prevTeams, currTeams);

    if (teamsChanged || filterChanged) {
      // Guarded setState (no nested setStates without conditions)
      // teams: null while fetching, else build rows now
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ teams: fetching ? null : this.buildTeamRows(currTeams) });
    }

    // Re-sort when rows or sort states change
    const sortChanged =
      prevState.teams !== this.state.teams ||
      prevState.sortTeamNameState !== this.state.sortTeamNameState ||
      prevState.sortTeamActiveState !== this.state.sortTeamActiveState;

    if (sortChanged) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ sortedTeams: this.sortRows(this.state.teams, this.state) });
    }
  }

  // ───────────────────────────────────────────── helpers ─────────────────────────────────────────────

  setFilter = filter => this.setState({ selectedFilter: filter });

  filteredTeamList = allTeams => {
    const { teamNameSearchText, wildCardSearchText } = this.state;
    return allTeams.filter(team => {
      const name = team?.teamName || '';
      const wild = wildCardSearchText.trim();

      if (!name) return false;

      const matchByName = searchWithAccent(name, teamNameSearchText);
      const matchByWild = wild ? searchWithAccent(name, wild) : true;

      return (teamNameSearchText ? matchByName : true) && matchByWild;
    });
  };

  applyFilter = teams => {
    const { selectedFilter } = this.state;
    if (selectedFilter === FILTER_ACTIVE) return teams.filter(t => t.isActive === true);
    if (selectedFilter === FILTER_INACTIVE) return teams.filter(t => t.isActive === false);
    return teams; // all
  };

  buildTeamRows = allTeams => {
    if (!Array.isArray(allTeams) || allTeams.length === 0) return [];

    const filtered = this.applyFilter(this.filteredTeamList(allTeams));

    // sort by modifiedDatetime descending by default (stable)
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

      return dateB - dateA; // default
    });

    // re-index after sort (no mutation of existing elements)
    return sorted.map((el, i) => ({ ...el, props: { ...el.props, index: i } }));
  };

  // ───────────────────────────────────────────── render ─────────────────────────────────────────────

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
      createNewTeamPopupOpen,
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

        <CreateNewTeamPopup
          open={createNewTeamPopupOpen}
          onClose={this.onCreateNewTeamClose}
          onOkClick={this.addNewTeam}
          teamName={selectedTeam}
          teamId={selectedTeamId}
          isActive={isActive}
          isEdit={this.state.isEdit}
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

  // ───────────────────────────────────────── event handlers ─────────────────────────────────────────

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

  // NOTE: Team component now calls (id, name, code) immediately (open-first UX)
  onTeamMembersPopupShow = (teamId, teamName, teamCode, initialSnapshot = []) => {
    this.setState({
      teamMembersPopupOpen: true,
      selectedTeamId: teamId,
      selectedTeam: teamName,
      selectedTeamCode: teamCode,
      initialMembersForPopup: Array.isArray(initialSnapshot) ? initialSnapshot : [],
    });
    // refresh in background
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
      if (res.status === 200) toast.success('Team updated successfully');
      else toast.error(res);
    } else {
      const res = await this.props.postNewTeam(name, true);
      if (res.status === 200) toast.success('Team added successfully');
      else toast.error(res);
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

  // sort toggles with safe functional setState (no nested setState smells)
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
