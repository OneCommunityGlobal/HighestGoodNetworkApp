import React from 'react';
import { shallow, mount } from 'enzyme';
import TeamsTab from '../TeamsTab';
import AddTeamPopup from '../AddTeamPopup';
import UserTeamsTable from '../UserTeamsTable';
import { addTeamMember, deleteTeamMember } from 'actions/allTeamsAction';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

const mockStore = configureStore();
let store;

jest.mock('actions/allTeamsAction', () => ({
  addTeamMember: jest.fn(),
  deleteTeamMember: jest.fn()
}));

describe('TeamsTab Component', () => {
  let wrapper;
  const props = {
    teamsData: [],
    userTeams: {},
    onDeleteTeam: jest.fn(),
    onAssignTeam: jest.fn(),
    onAssignTeamCode: jest.fn(),
    edit: true,
    role: 'admin',
    onUserVisibilitySwitch: jest.fn(),
    isVisible: true,
    canEditVisibility: true,
    handleSubmit: jest.fn(),
    disabled: false,
    canEditTeamCode: true,
    setUserProfile: jest.fn(),
    userProfile: {_id: 'userId', firstName: 'John', lastName: 'Doe'},
    codeValid: true,
    setCodeValid: jest.fn(),
    saved: true
  };

  const initialState = {
    userProfile: {
      _id: 'userId',
      firstName: 'John',
      lastName: 'Doe'
    },
    teams: {
      teamsData: [],
      userTeams: {}
    }
  };

  beforeEach(() => {
    store = mockStore(initialState);
    wrapper = shallow(<TeamsTab {...props} />);
  });


  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('renders AddTeamPopup component', () => {
    expect(wrapper.find(AddTeamPopup).exists()).toBe(true);
  });

  it('renders UserTeamsTable component', () => {
    expect(wrapper.find(UserTeamsTable).exists()).toBe(true);
  });

  it('handles onAddTeamPopupShow correctly', () => {
    wrapper.find(UserTeamsTable).prop('onButtonClick')();
    expect(wrapper.find(AddTeamPopup).exists()).toBe(true);
  });
  

  it('handles onAddTeamPopupClose correctly', () => {
    wrapper.find(UserTeamsTable).prop('onButtonClick')();
    expect(wrapper.find(AddTeamPopup).exists()).toBe(true);
  
    wrapper.find(AddTeamPopup).prop('onClose')();
    expect(wrapper.find(AddTeamPopup).exists()).toBe(true);
  });
  

  it('handles onSelectDeleteTeam correctly', () => {
    const teamId = 'team123';
    wrapper.find(UserTeamsTable).prop('onDeleteClick')(teamId);
    expect(props.onDeleteTeam).toHaveBeenCalledWith(teamId);
  });
  
  // it('handles onSelectAssignTeam correctly', () => {
  //   const teamId = 'team123';
  //   const team = { _id: teamId };

  //   // Mount the component to get access to the "Assign" button
  //   const wrapper = mount(
  //     <Provider store={store}>
  //       <TeamsTab {...props} />
  //     </Provider>
  //   );
  
  //   // Mount the component to get access to the "Assign" button
  //   // const wrapper = mount(<TeamsTab {...props} />);
  
  //   // Find the "Assign" button within the UserTeamsTable
  //   const assignButton = wrapper.find(UserTeamsTable).findWhere(n => n.prop('title') === 'Assign').first();
  
  //   // Simulate a click event on the "Assign" button
  //   assignButton.simulate('click');
  
  //   // Verify that onAssignTeam prop is called with the correct parameters
  //   expect(props.onAssignTeam).toHaveBeenCalledWith(team);
  
  //   // Verify that addTeamMember is called with the correct parameters
  //   expect(addTeamMember).toHaveBeenCalledWith(
  //     teamId,
  //     props.userProfile._id,
  //     props.userProfile.firstName,
  //     props.userProfile.lastName
  //   );
  
  //   // Verify that renderedOn state is updated
  //   expect(wrapper.state('renderedOn')).not.toBe(0);
  // });

  // it('calls deleteTeamMember when saved and removedTeams is not empty', () => {
  //   wrapper.setState({ removedTeams: ['team123', 'team456'] });
  //   wrapper.setProps({ saved: true });
  //   expect(deleteTeamMember).toHaveBeenCalledTimes(2);
  //   expect(deleteTeamMember).toHaveBeenCalledWith('team123', props.userProfile._id);
  //   expect(deleteTeamMember).toHaveBeenCalledWith('team456', props.userProfile._id);
  //   expect(wrapper.state('removedTeams')).toEqual([]);
  // });

  // it('calls deleteTeamMember when saved and removedTeams is not empty', () => {
  //   const wrapper = shallow(<TeamsTab {...props} />);
  //   const instance = wrapper.instance();
  //   const teamIds = ['team123', 'team456'];

  //   // Simulate props change
  //   wrapper.setProps({ saved: true });

  //   // Call the method directly
  //   teamIds.forEach(teamId => instance.onSelectDeleteTeam(teamId));

  //   // Verify expectations
  //   expect(deleteTeamMember).toHaveBeenCalledTimes(2);
  //   expect(deleteTeamMember).toHaveBeenCalledWith('team123', props.userProfile._id);
  //   expect(deleteTeamMember).toHaveBeenCalledWith('team456', props.userProfile._id);
  // });

});
