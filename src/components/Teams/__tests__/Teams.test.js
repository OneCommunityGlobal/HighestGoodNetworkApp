// Teams.test.js
import React from 'react';
import { shallow } from 'enzyme';
import Teams from '../Teams';
import { toast } from 'react-toastify';

// Mock the connect function from react-redux
jest.mock('react-redux', () => {
  const OriginalReactRedux = jest.requireActual('react-redux');
  return {
    ...OriginalReactRedux,
    connect: () => component => component,
  };
});

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('lodash', () => ({
  isEqual: jest.fn(),
}));

describe('Teams Component', () => {
  let wrapper;
  let instance;
  let props;

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

  afterAll(() => {
    jest.resetModules();
  });

  it('should render without crashing', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('should call getAllUserTeams and getAllUserProfile on componentDidMount', () => {
    instance.componentDidMount();
    expect(props.getAllUserTeams).toHaveBeenCalled();
    expect(props.getAllUserProfile).toHaveBeenCalled();
  });


  it('should update wildCardSearchText state when onWildCardSearch is called', () => {
    const searchText = 'test search';
    instance.onWildCardSearch(searchText);
    expect(instance.state.wildCardSearchText).toBe(searchText);
  });


  it('should call deleteTeam when onDeleteUser is called', async () => {
    const deletedId = '1';
    props.deleteTeam.mockResolvedValue({ status: 200 });
    await instance.onDeleteUser(deletedId);
    expect(props.deleteTeam).toHaveBeenCalledWith(deletedId, 'delete');
    expect(toast.success).toHaveBeenCalledWith('Team successfully deleted and user profiles updated');
    expect(instance.state.deleteTeamPopupOpen).toBe(false);
  });

  it('should render Loading component when fetching is true', () => {
    wrapper.setProps({
      state: {
        ...props.state,
        allTeamsData: {
          ...props.state.allTeamsData,
          fetching: true,
        },
      },
    });
    expect(wrapper.find('Loading').exists()).toBe(true);
  });


  it('should toggle sortTeamNameState when toggleTeamNameSort is called', () => {
    instance.setState({ sortTeamNameState: 'none' });
    instance.toggleTeamNameSort();
    expect(instance.state.sortTeamNameState).toBe('ascending');
    instance.toggleTeamNameSort();
    expect(instance.state.sortTeamNameState).toBe('descending');
    instance.toggleTeamNameSort();
    expect(instance.state.sortTeamNameState).toBe('none');
  });

  it('should toggle sortTeamActiveState when toggleTeamActiveSort is called', () => {
    instance.setState({ sortTeamActiveState: 'none' });
    instance.toggleTeamActiveSort();
    expect(instance.state.sortTeamActiveState).toBe('ascending');
    instance.toggleTeamActiveSort();
    expect(instance.state.sortTeamActiveState).toBe('descending');
    instance.toggleTeamActiveSort();
    expect(instance.state.sortTeamActiveState).toBe('none');
  });

  it('should call getTeamMembers and open team members popup when onTeamMembersPopupShow is called', () => {
    const teamId = '1';
    const teamName = 'Team 1';
    const teamCode = 'code1';
    instance.onTeamMembersPopupShow(teamId, teamName, teamCode);
    expect(props.getTeamMembers).toHaveBeenCalledWith(teamId);
    expect(instance.state.teamMembersPopupOpen).toBe(true);
    expect(instance.state.selectedTeamId).toBe(teamId);
    expect(instance.state.selectedTeam).toBe(teamName);
    expect(instance.state.selectedTeamCode).toBe(teamCode);
  });

  it('should close team members popup when onTeamMembersPopupClose is called', () => {
    instance.setState({ teamMembersPopupOpen: true, selectedTeamId: '1', selectedTeam: 'Team 1' });
    instance.onTeamMembersPopupClose();
    expect(instance.state.teamMembersPopupOpen).toBe(false);
    expect(instance.state.selectedTeamId).toBeUndefined();
    expect(instance.state.selectedTeam).toBe('');
  });

  it('should call deleteTeamMember when onDeleteTeamMember is called', () => {
    instance.setState({ selectedTeamId: '1' });
    const deletedUserId = 'user1';
    instance.onDeleteTeamMember(deletedUserId);
    expect(props.deleteTeamMember).toHaveBeenCalledWith('1', deletedUserId);
  });
});
