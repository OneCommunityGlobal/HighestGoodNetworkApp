// eslint-disable-next-line no-unused-vars
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
          <TeamTableHeader {...defaultProps} />
        </tbody>
      </table>,
    );

    expect(screen.getByText('#')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Team Name/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Active/i })).toBeInTheDocument();
    expect(screen.getByText(/Members/i)).toBeInTheDocument();
    // delete column should appear since hasPermission() returns true
    expect(screen.getByTestId('teams__delete')).toBeInTheDocument();
  });

  it('hides the delete column when no delete or put permission', () => {
    render(
      <table>
        <tbody>
          <TeamTableHeader {...defaultProps} hasPermission={() => false} />
        </tbody>
      </table>,
    );

    expect(screen.queryByTestId('teams__delete')).toBeNull();
  });

  it('is wrapped in React.memo', () => {
    // React.memo components share the same $$typeof
    const dummyMemo = React.memo(() => { });
    expect(TeamTableHeader.$$typeof).toBe(dummyMemo.$$typeof);
  });
});
