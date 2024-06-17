import { Provider } from 'react-redux';
import UserTeamsTable from '../UserTeamsTable';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { render, screen, within } from '@testing-library/react';
import { userProfileMock } from '../../../../__tests__/mockStates.js';

jest.mock('utils/permissions', () => ({
  hasPermission: jest.fn((a) => true), // 
}));

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
    auth: {
      user: {
        role: 'Owner', 
        permissions: {
          frontPermissions: [],
        },
      },
    },
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
      hasPermission: jest.fn((a) => true),
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
        hasPermission={jest.fn((a) => true)}
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
    expect(within(screen.getByTestId('userTeamTest')).getAllByRole('row').length).toBe(2);
  });

  // Test for correct rendering of team names
  it('renders correct team names', () => {
    renderComponent(mockUserProfile);
    const teamRows = within(screen.getByTestId('userTeamTest')).getAllByRole('row'); 
    expect(teamRows.length).toBe(2); // Ensure we have 2 team rows

    const teamNames = teamRows.map(row => {
      return row.cells[1].textContent;
    });
    expect(teamNames).toEqual(['Team1', 'Team2']);
  });

  // Test if the Visibility toggle appears on the screen
  it('visibility toggle appears with permission', () => {
    mockUserProfile.canEditVisibility = true;
    renderComponent(mockUserProfile);
    const visibilityToggle = within(screen.getByTestId('userTeamTest')).queryAllByTestId('visibility-switch');
    expect(visibilityToggle).toHaveLength(1);
  });
});
