import { Provider } from 'react-redux';
import UserTeamsTable from '../UserTeamsTable';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { userProfileMock } from '../../../../__tests__/mockStates.js';

const mockStore = configureStore([thunk]);

const mockUserProfile = {
  userTeams: [
  { _id: '1', teamName: 'Team1' },
  { _id: '2', teamName: 'Team2' }
],
userProfile: userProfileMock
};

const renderComponent = mockProps => {
  const store = mockStore({
      canEditTeamCode: false,
      canEditVisibility: false,
      codeValid: true,
      disabled: false,
      edit: true,
      isVisible: false,
      role: "Administrator",
      userProfile: {
       ...mockProps.userProfile,
       teamCode: ""
      },
      UserTeamsById: mockProps.userTeams
  });

  return render(
    <Provider store={store}>
      <UserTeamsTable
        userTeamsById={mockProps.userTeams}
        canEditVisibility={mockProps.canEditVisibility}
        isVisible={mockProps.isVisible}
        renderedOn={Date.now()}
        edit={mockProps.edit}
        role={mockProps.role}
        disabled={mockProps.disabled}
        canEditTeamCode={mockProps.canEditTeamCode}
        userProfile={mockProps.userProfile}
        codeValid={mockProps.codeValid}
      />
    </Provider>,
  );
};


describe('User Teams Table Component', () => {
  it('render without crashing', () => {
    renderComponent(mockUserProfile);
  });

  it('renders correct number of teams the user is assigned to', () => {
    renderComponent(mockUserProfile);
   // console.log(screen.getAllByRole('row').length);
    expect(screen.getAllByRole('row').length).toBe(3); // 2 teams + 1 header
  });

 /* // Test for correct rendering of team names
  it('renders correct team names', () => {
    const teamRows = component.find('tr').slice(1); // Skip the header row
    expect(teamRows.length).toBe(3); // Ensure we have 2 team rows

    const teamNames = teamRows.map(row => {
      const nameCell = row.find('td').at(0);
      expect(nameCell.exists()).toBe(true); // Check if the cell exists
      return nameCell.text();
    });

    expect(teamNames).toEqual(['Team1', 'Team2']);
  });


  // Test edit team code interaction
  /*it('allows editing team code if permitted', () => {
    // Assuming 'editTeamCode' permission allows editing the team code
    const firstTeamInput = component.find('Input').first();
    firstTeamInput.simulate('change', { target: { value: 'New-Code' } });

    // Verify the input value change
    expect(firstTeamInput.prop('value')).toBe('A-123');
  });*/
});
