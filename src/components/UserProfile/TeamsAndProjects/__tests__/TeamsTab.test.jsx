import React from 'react';
import { vi } from 'vitest';

// MUST come before you import TeamsTab!
vi.mock('../AddTeamPopup', () => ({
  __esModule: true,
  default: function AddTeamPopupMock(props) {
    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
      <div
        data-testid="add-team-popup"
        data-open={props.open ? 'true' : 'false'}
        onClick={() => props.onClose && props.onClose()}
        onDoubleClick={() =>
          props.onSelectAssignTeam && props.onSelectAssignTeam({ _id: 'TEAM999' })
        }
      />
    );
  },
}));

vi.mock('../UserTeamsTable', () => ({
  __esModule: true,
  default: function UserTeamsTableMock(props) {
    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
      <div
        data-testid="user-teams-table"
        onClick={() => props.onButtonClick && props.onButtonClick()}
        onDoubleClick={() => props.onDeleteClick && props.onDeleteClick('TEAM123')}
      />
    );
  },
}));

// Stub your action creators
vi.mock('../../../../actions/allTeamsAction', () => ({
  __esModule: true,
  addTeamMember: vi.fn(),
  deleteTeamMember: vi.fn(),
}));

// Stub toast
vi.mock('react-toastify', () => ({
  __esModule: true,
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { render, screen, fireEvent } from '@testing-library/react';
import TeamsTab from '../TeamsTab';
import { addTeamMember, deleteTeamMember } from '../../../../actions/allTeamsAction';
import { toast } from 'react-toastify';

describe('TeamsTab (unit)', () => {
    beforeEach(() => {
    vi.clearAllMocks();
  });
  const baseProps = {
    teamsData: [],
    userTeams: {},
    onDeleteTeam: vi.fn(),
    onAssignTeam: vi.fn(),
    onAssignTeamCode: vi.fn(),
    edit: true,
    role: 'admin',
    onUserVisibilitySwitch: vi.fn(),
    isVisible: true,
    canEditVisibility: true,
    handleSubmit: vi.fn(),
    disabled: false,
    canEditTeamCode: true,
    setUserProfile: vi.fn(),
    userProfile: { _id: 'userId', firstName: 'John', lastName: 'Doe' },
    codeValid: true,
    setCodeValid: vi.fn(),
    saved: false,
    inputAutoComplete: '',
    inputAutoStatus: '',
    isLoading: false,
    fetchTeamCodeAllUsers: vi.fn(),
    darkMode: false,
  };

  it('1. renders without crashing', () => {
    const { container } = render(<TeamsTab {...baseProps} />);
    expect(container).toBeInTheDocument();
  });

  it('2. always renders the AddTeamPopup stub', () => {
    render(<TeamsTab {...baseProps} />);
    expect(screen.getByTestId('add-team-popup')).toBeInTheDocument();
  });

  it('3. always renders the UserTeamsTable stub', () => {
    render(<TeamsTab {...baseProps} />);
    expect(screen.getByTestId('user-teams-table')).toBeInTheDocument();
  });

  it('4. opens the popup when UserTeamsTable “add” is clicked', () => {
    render(<TeamsTab {...baseProps} />);
    fireEvent.click(screen.getByTestId('user-teams-table'));
    expect(screen.getByTestId('add-team-popup')).toHaveAttribute('data-open', 'true');
  });

  it('5. closes the popup when AddTeamPopup is clicked (onClose)', () => {
    render(<TeamsTab {...baseProps} />);
    fireEvent.click(screen.getByTestId('user-teams-table')); // open
    fireEvent.click(screen.getByTestId('add-team-popup'));    // close
    expect(screen.getByTestId('add-team-popup')).toHaveAttribute('data-open', 'false');
  });

  it('6. calls onDeleteTeam and toast.success on delete', () => {
    render(<TeamsTab {...baseProps} />);
    fireEvent.doubleClick(screen.getByTestId('user-teams-table'));
    expect(baseProps.onDeleteTeam).toHaveBeenCalledWith('TEAM123');
    expect(toast.success).toHaveBeenCalledWith('Team Deleted successfully');
  });

  it('7. calls onAssignTeam, addTeamMember and toast.success on assign', () => {
    render(<TeamsTab {...baseProps} />);
    // open popup so it's mounted with open=true
    fireEvent.click(screen.getByTestId('user-teams-table'));
    // double-click popup to simulate assign
    fireEvent.doubleClick(screen.getByTestId('add-team-popup'));

    expect(baseProps.onAssignTeam).toHaveBeenCalledWith({ _id: 'TEAM999' });
    expect(addTeamMember).toHaveBeenCalledWith(
      'TEAM999',
      baseProps.userProfile._id,
      baseProps.userProfile.firstName,
      baseProps.userProfile.lastName,
    );
    expect(toast.success).toHaveBeenCalledWith('Team assigned successfully');
  });

  it('8. runs the saved→useEffect and clears removedTeams', () => {
    const { rerender } = render(<TeamsTab {...baseProps} saved={false} />);
    rerender(<TeamsTab {...baseProps} saved />);
    expect(deleteTeamMember).not.toHaveBeenCalled();
  });
});