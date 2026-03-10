import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { render, screen, within, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';

import UserTeamsTable from '../UserTeamsTable';
import { userProfileMock } from '../../../../__tests__/mockStates.js';

vi.mock('axios');

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

const mockStore = configureStore([thunk]);

const mockUserProfile = {
  userTeams: [
    { _id: '1', teamName: 'Team1' },
    { _id: '2', teamName: 'Team2' },
  ],
  userProfile: userProfileMock,
  setCodeValid: vi.fn(),
  onAssignTeamCode: vi.fn(),
  onUserVisibilitySwitch: vi.fn(),
  onButtonClick: vi.fn(),
  onDeleteClick: vi.fn(),
  fetchTeamCodeAllUsers: vi.fn(),
  canEditTeamCode: false,
  canEditVisibility: false,
  codeValid: true,
  disabled: false,
  edit: true,
  role: 'Administrator',
  isVisible: false,
  inputAutoComplete: [],
  inputAutoStatus: false,
  isLoading: false,
};

beforeEach(() => {
  vi.clearAllMocks();
  axios.get.mockResolvedValue({ data: {} });
  axios.patch.mockResolvedValue({ data: {} });
});

const renderComponent = mockProps => {
  const store = mockStore({
    auth: {
      user: {
        role: 'Owner',
        permissions: {
          frontPermissions: ['assignTeamToUsers'],
          removedDefaultPermissions: [],
        },
      },
    },
    role: {
      roles: [
        {
          roleName: 'Owner',
          permissions: ['assignTeamToUsers'],
        },
        {
          roleName: 'Administrator',
          permissions: ['assignTeamToUsers'],
        },
      ],
    },
  });

  return render(
    <Provider store={store}>
      <div data-testid="userTeamTest">
        <UserTeamsTable
          userTeamsById={mockProps.userTeams}
          canEditVisibility={mockProps.canEditVisibility}
          isVisible={mockProps.isVisible}
          renderedOn={Date.now()}
          edit={mockProps.edit}
          role={mockProps.role}
          disabled={mockProps.disabled}
          canEditTeamCode={mockProps.canEditTeamCode}
          userProfile={
            mockProps.userProfile
              ? {
                  ...mockProps.userProfile,
                  teamCode: '',
                  teams: mockProps.userTeams,
                }
              : null
          }
          codeValid={mockProps.codeValid}
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
      </div>
    </Provider>
  );
};

describe('User Teams Table Component', () => {
  it('renders without crashing', async () => {
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
        teamRows[2].cells[1].textContent,
      ];

      expect(teamNames).toEqual(['Team1', 'Team2']);
    });
  });

  it('visibility toggle appears with permission', async () => {
    const modifiedMock = {
      ...mockUserProfile,
      canEditVisibility: true,
    };

    renderComponent(modifiedMock);

    await waitFor(() => {
      expect(screen.getByText('Visibility')).toBeInTheDocument();
    });
  });

  it('renders team code input field with correct placeholder', async () => {
    renderComponent(mockUserProfile);

    await waitFor(() => {
      const teamCodeInput = screen.getByPlaceholderText('X-XXX');
      expect(teamCodeInput).toBeInTheDocument();
      expect(teamCodeInput.tagName).toBe('INPUT');
    })
    expect(teamCodeInput).toHaveAttribute('id', 'teamCode');
;
  });

  it('renders table headers with correct column titles', async () => {
    renderComponent(mockUserProfile);

    await waitFor(() => {
      const headerCells = within(screen.getByTestId('userTeamTest')).getAllByRole('columnheader');
      expect(headerCells.length).toBe(4);
      expect(headerCells[0].textContent).toBe('#');
      expect(headerCells[1].textContent).toBe('Team Name');
      expect(headerCells[2].textContent).toBe('Members');
      expect(headerCells[3].textContent).toBe('');
    });
  });
});

// done