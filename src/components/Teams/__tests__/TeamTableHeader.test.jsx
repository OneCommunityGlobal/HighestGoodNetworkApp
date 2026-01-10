import React from 'react';
import { render, screen } from '@testing-library/react';
import { TeamTableHeader } from '~/components/Teams/TeamTableHeader';

const defaultProps = {
  hasPermission: () => true,
  darkMode: false,
  sortTeamNameState: '',
  sortTeamActiveState: '',
  onTeamNameSort: vi.fn(),
  onTeamActiveSort: vi.fn(),
};

describe('TeamTableHeader (pure)', () => {
  it('renders correctly with all standard columns', () => {
    render(
      <table>
        <tbody>
          <TeamTableHeader
            hasPermission={defaultProps.hasPermission}
            darkMode={defaultProps.darkMode}
            sortTeamNameState={defaultProps.sortTeamNameState}
            sortTeamActiveState={defaultProps.sortTeamActiveState}
            onTeamNameSort={defaultProps.onTeamNameSort}
            onTeamActiveSort={defaultProps.onTeamActiveSort}
          />
        </tbody>
      </table>,
    );

    expect(screen.getByText('#')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Team Name/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Active/i })).toBeInTheDocument();
    expect(screen.getByText(/Members/i)).toBeInTheDocument();
    expect(screen.getByTestId('teams__delete')).toBeInTheDocument();
  });

  it('hides the delete column when no delete or put permission', () => {
    render(
      <table>
        <tbody>
          <TeamTableHeader
            hasPermission={() => false}
            darkMode={defaultProps.darkMode}
            sortTeamNameState={defaultProps.sortTeamNameState}
            sortTeamActiveState={defaultProps.sortTeamActiveState}
            onTeamNameSort={defaultProps.onTeamNameSort}
            onTeamActiveSort={defaultProps.onTeamActiveSort}
          />
        </tbody>
      </table>,
    );

    expect(screen.queryByTestId('teams__delete')).toBeNull();
  });

  it('is wrapped in React.memo', () => {
    const DummyMemoComponent = () => {};
    const MemoWrapped = React.memo(DummyMemoComponent);
    expect(TeamTableHeader.$$typeof).toBe(MemoWrapped.$$typeof);
  });
});
