// Teams.test.js
import React from 'react';
import { shallow } from 'enzyme';
import { Teams } from '../Teams'; 
import { toast } from 'react-toastify';

// Mock the actions and other dependencies
jest.mock('../../../actions/allTeamsAction', () => ({
  getAllUserTeams: jest.fn(),
  postNewTeam: jest.fn(),
  deleteTeam: jest.fn(),
  updateTeam: jest.fn(),
  getTeamMembers: jest.fn(),
  deleteTeamMember: jest.fn(),
  addTeamMember: jest.fn(),
  updateTeamMemeberVisibility: jest.fn(),
}));

jest.mock('../../../actions/userManagement', () => ({
  getAllUserProfile: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('utils/search', () => ({
  searchWithAccent: jest.fn((text, searchText) => text.includes(searchText)),
}));

// Mock subcomponents to prevent rendering them
jest.mock('../TeamsOverview', () => 'TeamOverview');
jest.mock('../TeamTableSearchPanel', () => 'TeamTableSearchPanel');
jest.mock('../TeamMembersPopup', () => 'TeamMembersPopup');
jest.mock('../CreateNewTeamPopup', () => 'CreateNewTeamPopup');
jest.mock('../DeleteTeamPopup', () => 'DeleteTeamPopup');
jest.mock('../TeamStatusPopup', () => 'TeamStatusPopup');
jest.mock('../Team', () => 'Team');
jest.mock('../../common/Loading', () => 'Loading');

describe('Teams Component', () => {
  let wrapper;
  let props;
  let instance;

  beforeEach(() => {
    props = {
      state: {
        allTeamsData: {
          allTeams: [],
          fetching: false,
        },
        theme: {
          darkMode: false,
        },
        teamsTeamMembers: {
          teamMembers: [],
          fetching: false,
        },
        allUserProfiles: [],
      },
      getAllUserTeams: jest.fn(),
      getAllUserProfile: jest.fn(),
      postNewTeam: jest.fn(),
      deleteTeam: jest.fn(),
      updateTeam: jest.fn(),
      getTeamMembers: jest.fn(),
      deleteTeamMember: jest.fn(),
      addTeamMember: jest.fn(),
      updateTeamMemeberVisibility: jest.fn(),
    };

    wrapper = shallow(<Teams {...props} />);
    instance = wrapper.instance();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('should call getAllUserTeams and getAllUserProfile on componentDidMount', () => {
    expect(props.getAllUserTeams).toHaveBeenCalled();
    expect(props.getAllUserProfile).toHaveBeenCalled();
  });

  it('should render Loading component when fetching is true', () => {
    props.state.allTeamsData.fetching = true;
    wrapper = shallow(<Teams {...props} />);
    expect(wrapper.find('Loading').exists()).toBe(true);
  });

  it('should update wildCardSearchText state when onWildCardSearch is called', () => {
    expect(wrapper.state('wildCardSearchText')).toBe('');
    instance.onWildCardSearch('test search');
    expect(wrapper.state('wildCardSearchText')).toBe('test search');
  });

  it('should open CreateNewTeamPopup when onCreateNewTeamShow is called', () => {
    expect(wrapper.state('createNewTeamPopupOpen')).toBe(false);
    instance.onCreateNewTeamShow();
    expect(wrapper.state('createNewTeamPopupOpen')).toBe(true);
  });

  it('should close CreateNewTeamPopup when onCreateNewTeamClose is called', () => {
    wrapper.setState({ createNewTeamPopupOpen: true });
    instance.onCreateNewTeamClose();
    expect(wrapper.state('createNewTeamPopupOpen')).toBe(false);
  });

  it('should open TeamMembersPopup when onTeamMembersPopupShow is called', () => {
    instance.onTeamMembersPopupShow('teamId123', 'Team Name', 'teamCode123');
    expect(wrapper.state('teamMembersPopupOpen')).toBe(true);
    expect(wrapper.state('selectedTeamId')).toBe('teamId123');
    expect(wrapper.state('selectedTeam')).toBe('Team Name');
    expect(props.getTeamMembers).toHaveBeenCalledWith('teamId123');
  });

  it('should close TeamMembersPopup when onTeamMembersPopupClose is called', () => {
    wrapper.setState({ teamMembersPopupOpen: true });
    instance.onTeamMembersPopupClose();
    expect(wrapper.state('teamMembersPopupOpen')).toBe(false);
    expect(wrapper.state('selectedTeamId')).toBeUndefined();
    expect(wrapper.state('selectedTeam')).toBe('');
  });

  it('should open DeleteTeamPopup when onDeleteTeamPopupShow is called', () => {
    instance.onDeleteTeamPopupShow('Team Name', 'teamId123', true, 'teamCode123');
    expect(wrapper.state('deleteTeamPopupOpen')).toBe(true);
    expect(wrapper.state('selectedTeam')).toBe('Team Name');
    expect(wrapper.state('selectedTeamId')).toBe('teamId123');
    expect(wrapper.state('isActive')).toBe(true);
    expect(wrapper.state('selectedTeamCode')).toBe('teamCode123');
  });

  it('should close DeleteTeamPopup when onDeleteTeamPopupClose is called', () => {
    wrapper.setState({ deleteTeamPopupOpen: true });
    instance.onDeleteTeamPopupClose();
    expect(wrapper.state('deleteTeamPopupOpen')).toBe(false);
    expect(wrapper.state('selectedTeamId')).toBeUndefined();
    expect(wrapper.state('selectedTeam')).toBe('');
  });

  it('should open TeamStatusPopup when onTeamStatusShow is called', () => {
    instance.onTeamStatusShow('Team Name', 'teamId123', true, 'teamCode123');
    expect(wrapper.state('teamStatusPopupOpen')).toBe(true);
    expect(wrapper.state('selectedTeam')).toBe('Team Name');
    expect(wrapper.state('selectedTeamId')).toBe('teamId123');
    expect(wrapper.state('isActive')).toBe(true);
    expect(wrapper.state('selectedTeamCode')).toBe('teamCode123');
  });

  it('should close TeamStatusPopup when onTeamStatusClose is called', () => {
    wrapper.setState({ teamStatusPopupOpen: true });
    instance.onTeamStatusClose();
    expect(wrapper.state('teamStatusPopupOpen')).toBe(false);
    expect(wrapper.state('selectedTeamId')).toBeUndefined();
    expect(wrapper.state('selectedTeam')).toBe('');
    expect(wrapper.state('isEdit')).toBe(false);
  });

  it('should update team member visibility when onUpdateTeamMemberVisibility is called', () => {
    instance.onUpdateTeamMemberVisibility('userId123', true);
    expect(props.updateTeamMemeberVisibility).toHaveBeenCalledWith(
      instance.state.selectedTeamId,
      'userId123',
      true
    );
  });

  it('should add a new user to the team when onAddUser is called', () => {
    wrapper.setState({ selectedTeamId: 'teamId123' });
    const user = {
      _id: 'userId123',
      firstName: 'John',
      lastName: 'Doe',
      role: 'Member',
    };
    instance.onAddUser(user);
    expect(props.addTeamMember).toHaveBeenCalledWith(
      'teamId123',
      'userId123',
      'John',
      'Doe',
      'Member',
      expect.any(Number)
    );
  });

  it('should call postNewTeam when adding a new team', async () => {
    props.postNewTeam.mockResolvedValue({ status: 200 });
    await instance.addNewTeam('New Team', false);
    expect(props.postNewTeam).toHaveBeenCalledWith('New Team', true);
    expect(toast.success).toHaveBeenCalledWith('Team added successfully');
  });

  it('should call updateTeam when editing an existing team', async () => {
    wrapper.setState({
      selectedTeamId: 'teamId123',
      isActive: true,
      selectedTeamCode: 'teamCode123',
    });
    props.updateTeam.mockResolvedValue({ status: 200 });
    await instance.addNewTeam('Updated Team', true);
    expect(props.updateTeam).toHaveBeenCalledWith(
      'Updated Team',
      'teamId123',
      true,
      'teamCode123'
    );
    expect(toast.success).toHaveBeenCalledWith('Team updated successfully');
  });

  it('should call deleteTeam when deleting a team', async () => {
    props.deleteTeam.mockResolvedValue({ status: 200 });
    await instance.onDeleteUser('teamId123');
    expect(props.deleteTeam).toHaveBeenCalledWith('teamId123', 'delete');
    expect(toast.success).toHaveBeenCalledWith('Team successfully deleted and user profiles updated');
  });

  it('should handle error when deleting a team fails', async () => {
    props.deleteTeam.mockResolvedValue('Error deleting team');
    await instance.onDeleteUser('teamId123');
    expect(toast.error).toHaveBeenCalledWith('Error deleting team');
  });

  it('should update sortTeamNameState when toggleTeamNameSort is called', () => {
    instance.toggleTeamNameSort();
    expect(wrapper.state('sortTeamNameState')).toBe('ascending');
    instance.toggleTeamNameSort();
    expect(wrapper.state('sortTeamNameState')).toBe('descending');
    instance.toggleTeamNameSort();
    expect(wrapper.state('sortTeamNameState')).toBe('none');
  });

  it('should update sortTeamActiveState when toggleTeamActiveSort is called', () => {
    instance.toggleTeamActiveSort();
    expect(wrapper.state('sortTeamActiveState')).toBe('ascending');
    instance.toggleTeamActiveSort();
    expect(wrapper.state('sortTeamActiveState')).toBe('descending');
    instance.toggleTeamActiveSort();
    expect(wrapper.state('sortTeamActiveState')).toBe('none');
  });

  it('should sort teams correctly when sortTeams is called', () => {
    const mockTeams = [
      {
        _id: '1',
        teamName: 'Alpha',
        isActive: true,
        modifiedDatetime: 1000,
      },
      {
        _id: '2',
        teamName: 'Beta',
        isActive: false,
        modifiedDatetime: 2000,
      },
      {
        _id: '3',
        teamName: 'Gamma',
        isActive: true,
        modifiedDatetime: 1500,
      },
    ];

    // Mock teamTableElements to return simplified team components
    instance.teamTableElements = jest.fn(() =>
      mockTeams.map((team) => ({
        props: {
          name: team.teamName,
          active: team.isActive,
          team: team,
        },
      }))
    );

    wrapper.setState({
      teams: instance.teamTableElements(),
      sortTeamNameState: 'ascending',
      sortTeamActiveState: 'none',
    });

    instance.sortTeams();
    expect(wrapper.state('sortedTeams')[0].props.name).toBe('Alpha');
    expect(wrapper.state('sortedTeams')[1].props.name).toBe('Beta');
    expect(wrapper.state('sortedTeams')[2].props.name).toBe('Gamma');
  });

  it('should call deleteTeamMember when onDeleteTeamMember is called', () => {
    wrapper.setState({ selectedTeamId: 'teamId123' });
    instance.onDeleteTeamMember('userId123');
    expect(props.deleteTeamMember).toHaveBeenCalledWith('teamId123', 'userId123');
  });

  it('should call getAllUserTeams and getAllUserProfile on onConfirmClick', async () => {
    props.updateTeam.mockResolvedValue({ status: 200 });
    await instance.onConfirmClick('Team Name', 'teamId123', true, 'teamCode123');
    expect(props.updateTeam).toHaveBeenCalledWith(
      'Team Name',
      'teamId123',
      true,
      'teamCode123'
    );
    expect(props.getAllUserTeams).toHaveBeenCalled();
    expect(props.getAllUserProfile).toHaveBeenCalled();
  });

  it('should handle error when updating team status fails', async () => {
    props.updateTeam.mockResolvedValue('Error updating status');
    await instance.onConfirmClick('Team Name', 'teamId123', true, 'teamCode123');
    expect(toast.error).toHaveBeenCalledWith('Error updating status');
  });
});
