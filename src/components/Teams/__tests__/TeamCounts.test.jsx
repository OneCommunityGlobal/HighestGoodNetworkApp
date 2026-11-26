import React from 'react';
import { screen } from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Team, { computeCounts } from '~/components/Teams/Team';
import { renderWithProvider } from '../../../__tests__/utils';
import { authMock, userProfileMock, rolesMock, themeMock } from '../../../__tests__/mockStates';

const mockStore = configureMockStore([thunk]);
const noop = vi.fn();

// Shape returned by the getAllTeams aggregation: no isActive on members.
const team = {
  _id: 'team-1',
  teamName: 'Team Name',
  isActive: true,
  members: [{ _id: 'u1' }, { _id: 'u2' }, { _id: 'u3' }],
};

const renderTeam = userProfiles => {
  const store = mockStore({
    auth: authMock,
    userProfile: userProfileMock,
    role: rolesMock.role,
    theme: themeMock,
    allUserProfiles: { userProfiles },
  });
  return renderWithProvider(
    <Team
      name="Team Name"
      teamId="team-1"
      active
      team={team}
      onEditTeam={noop}
      onDeleteClick={noop}
      onMembersClick={noop}
      onStatusClick={noop}
    />,
    { store },
  );
};

describe('computeCounts', () => {
  it('resolves member status from the user status map', () => {
    const map = new Map([
      ['u1', true],
      ['u2', false],
      ['u3', true],
    ]);
    expect(computeCounts(team.members, map)).toEqual({ total: 3, active: 2, inactive: 1 });
  });

  it('prefers a flag already present on the member', () => {
    const map = new Map([['u1', false]]);
    expect(computeCounts([{ _id: 'u1', isActive: true }], map)).toEqual({
      total: 1,
      active: 1,
      inactive: 0,
    });
  });

  it('ignores the empty member entry emitted for a team with no members', () => {
    expect(computeCounts([{}], new Map())).toEqual({ total: 0, active: 0, inactive: 0 });
  });

  it('shows placeholders while statuses are unknown', () => {
    expect(computeCounts(team.members, new Map())).toEqual({
      total: 3,
      active: '…',
      inactive: '…',
    });
  });
});

describe('Team row counts and active-member badge', () => {
  it('shows All | Active | Inactive counts and the green badge once profiles load', () => {
    renderTeam([
      { _id: 'u1', isActive: true },
      { _id: 'u2', isActive: false },
      { _id: 'u3', isActive: true },
    ]);
    expect(screen.getByText('Team Name (3 | 2 | 1)')).toBeInTheDocument();
    expect(screen.getByTestId('active-member-badge')).toHaveTextContent('2');
  });

  it('hides the badge while statuses are unknown', () => {
    renderTeam([]);
    expect(screen.getByText('Team Name (3 | … | …)')).toBeInTheDocument();
    expect(screen.queryByTestId('active-member-badge')).not.toBeInTheDocument();
  });
});
