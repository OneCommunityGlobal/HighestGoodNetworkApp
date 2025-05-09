import { Provider } from 'react-redux';
import UserTeamsTable from '../UserTeamsTable';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { render, screen, within, waitFor } from '@testing-library/react';
import { userProfileMock } from '../../../../__tests__/mockStates.js';
import axios from 'axios';

jest.mock('axios');
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
  }
}));

jest.mock('utils/permissions', () => ({
  hasPermission: jest.fn(() => true), 
}));

const mockStore = configureStore([thunk]);

const mockUserProfile = {
  userTeams: [
    { _id: '1', teamName: 'Team1' },
    { _id: '2', teamName: 'Team2' }
  ],
  userProfile: userProfileMock,
  setCodeValid: jest.fn(),
  onAssignTeamCode: jest.fn(),
  onUserVisibilitySwitch: jest.fn(),
  onButtonClick: jest.fn(),
  onDeleteClick: jest.fn(),
  fetchTeamCodeAllUsers: jest.fn(),
  canEditTeamCode: false,
  canEditVisibility: false,
  codeValid: true,
  disabled: false,
  edit: true,
  role: "Administrator",
  isVisible: false,
  inputAutoComplete: [],
  inputAutoStatus: false,
  isLoading: false
};

beforeEach(() => {
  jest.clearAllMocks();
  axios.get.mockResolvedValue({ data: {} });
  axios.patch.mockResolvedValue({ data: {} });
});

const renderComponent = (mockProps) => {
  const store = mockStore({
    auth: {
      user: {
        role: 'Owner', 
        permissions: {
          frontPermissions: [],
        },
      },
    }
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
        userProfile={mockProps.userProfile ? {
          ...mockProps.userProfile,
          teamCode: ""
        } : null}
        codeValid={mockProps.codeValid}
        hasPermission={jest.fn(() => true)}
        setCodeValid={mockProps.setCodeValid}
        onAssignTeamCode={mockProps.onAssignTeamCode}
        onUserVisibilitySwitch={mockProps.onUserVisibilitySwitch}
        onButtonClick={mockProps.onButtonClick}
        onDeleteClick={mockProps.onDeleteClick}
        fetchTeamCodeAllUsers={mockProps.fetchTeamCodeAllUsers}
        inputAutoComplete={mockProps.inputAutoComplete}
        inputAutoStatus={mockProps.inputAutoStatus}
        isLoading={mockProps.isLoading}
      />
    </Provider>
  );
};

describe('User Teams Table Component', () => {
  it('render without crashing', async () => {
    const { unmount } = renderComponent(mockUserProfile);
    await waitFor(() => {
      expect(screen.getByTestId('userTeamTest')).toBeInTheDocument();
    });
    unmount();
  });

  it('renders correct number of teams the user is assigned to', async () => {
    renderComponent(mockUserProfile);
    
    await waitFor(() => {
      const rows = within(screen.getByTestId('userTeamTest')).getAllByRole('row');
      expect(rows.length).toBe(3);
    });
  });

  it('renders correct team names', async () => {
    renderComponent(mockUserProfile);
    
    await waitFor(() => {
      const teamRows = within(screen.getByTestId('userTeamTest')).getAllByRole('row');
      expect(teamRows.length).toBe(3);
      const teamNames = [
        teamRows[1].cells[1].textContent,
        teamRows[2].cells[1].textContent
      ];
      
      expect(teamNames).toEqual(['Team1', 'Team2']);
    });
  });

  it('visibility toggle appears with permission', async () => {
    const modifiedMock = {
      ...mockUserProfile,
      canEditVisibility: true
    };
    
    renderComponent(modifiedMock);
    await waitFor(() => {
      const visibilityLabel = screen.getByText('Visibility');
      expect(visibilityLabel).toBeInTheDocument();
    });
  });

  it('renders team code input field with correct placeholder', async () => {
    renderComponent(mockUserProfile);
    
    await waitFor(() => {
      const teamCodeInput = screen.getByPlaceholderText('X-XXX');
      expect(teamCodeInput).toBeInTheDocument();
      expect(teamCodeInput.tagName).toBe('INPUT');
      expect(teamCodeInput.type).toBe('text');
      expect(teamCodeInput.id).toBe('teamCode');
    });
  });

  it('renders table headers with correct column titles', async () => {
    renderComponent(mockUserProfile);
    
    await waitFor(() => {
      const headerCells = within(screen.getByTestId('userTeamTest'))
        .getAllByRole('columnheader');
      expect(headerCells.length).toBe(4);
      expect(headerCells[0].textContent).toBe('#');
      expect(headerCells[1].textContent).toBe('Team Name');
      expect(headerCells[2].textContent).toBe('Members');
      expect(headerCells[3].textContent).toBe('');
    });
  });
});