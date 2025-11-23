import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Team from '~/components/Teams/Team';
import { renderWithProvider } from '../../../__tests__/utils';
import { authMock, userProfileMock, rolesMock, themeMock } from '../../../__tests__/mockStates';

const mockStore = configureMockStore([thunk]);

let store;

const mockDefault = vi.fn();

const teamProps = {
  name: 'Team Name',
  teamId: 1,
  active: true,
  teamCode: 'X-XXX',
  onEditTeam: mockDefault,
  onDeleteClick: mockDefault,
  onMembersClick: mockDefault,
  onStatusClick: mockDefault,
};

beforeEach(() => {
  store = mockStore({
    auth: authMock,
    userProfile: userProfileMock,
    role: rolesMock.role,
    theme: themeMock,
    ...teamProps,
  });
});

describe('Team component', () => {
  it('should call onEditTeam function', () => {
    renderWithProvider(
      <Team
        name={teamProps.name}
        teamId={teamProps.teamId}
        active={teamProps.active}
        teamCode={teamProps.teamCode}
        onEditTeam={teamProps.onEditTeam}
        onDeleteClick={teamProps.onDeleteClick}
        onMembersClick={teamProps.onMembersClick}
        onStatusClick={teamProps.onStatusClick}
      />,
      { store },
    );

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    expect(teamProps.onEditTeam).toHaveBeenCalledWith('Team Name', 1, true, 'X-XXX');
  });

  it('should call onDeleteClick function', () => {
    renderWithProvider(
      <Team
        name={teamProps.name}
        teamId={teamProps.teamId}
        active={teamProps.active}
        teamCode={teamProps.teamCode}
        onEditTeam={teamProps.onEditTeam}
        onDeleteClick={teamProps.onDeleteClick}
        onMembersClick={teamProps.onMembersClick}
        onStatusClick={teamProps.onStatusClick}
      />,
      { store },
    );

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    expect(teamProps.onDeleteClick).toHaveBeenCalledWith('Team Name', 1, true, 'X-XXX');
  });

  it('should call onMembersClick function', () => {
    renderWithProvider(
      <Team
        name={teamProps.name}
        teamId={teamProps.teamId}
        active={teamProps.active}
        teamCode={teamProps.teamCode}
        onEditTeam={teamProps.onEditTeam}
        onDeleteClick={teamProps.onDeleteClick}
        onMembersClick={teamProps.onMembersClick}
        onStatusClick={teamProps.onStatusClick}
      />,
      { store },
    );

    const memberButton = screen.getByTestId('members-btn');
    fireEvent.click(memberButton);

    expect(teamProps.onMembersClick).toHaveBeenCalledWith(1, 'Team Name', 'X-XXX');
  });

  it('should call onStatusClick function', () => {
    renderWithProvider(
      <Team
        name={teamProps.name}
        teamId={teamProps.teamId}
        active={teamProps.active}
        teamCode={teamProps.teamCode}
        onEditTeam={teamProps.onEditTeam}
        onDeleteClick={teamProps.onDeleteClick}
        onMembersClick={teamProps.onMembersClick}
        onStatusClick={teamProps.onStatusClick}
      />,
      { store },
    );

    const activeMarker = screen.getByTestId('active-marker');
    fireEvent.click(activeMarker);

    expect(teamProps.onStatusClick).toHaveBeenCalledWith('Team Name', 1, true, 'X-XXX');
  });
});
