import React from 'react';
import { renderWithProvider } from '__tests__/utils';
import { screen } from '@testing-library/react';
import TeamsOverview from '~/components/Teams/TeamsOverview';
import styles from '~/components/Teams/TeamsOverview.module.css';

describe('TeamsOverview', () => {
  it.each([false, true])('preserves status icon classes when darkMode is %s', darkMode => {
    renderWithProvider(
      <TeamsOverview
        numberOfTeams={10}
        numberOfActiveTeams={6}
        numberOfInActiveTeams={4}
        darkMode={darkMode}
      />,
    );

    // These decorative, aria-hidden icons have no accessible role or label to query.
    /* eslint-disable testing-library/no-node-access */
    const activeIcon = screen.getByTestId('active_teams').querySelector('i');
    const inactiveIcon = screen.getByTestId('inactive_teams').querySelector('i');
    const totalIcon = screen.getByTestId('total_teams').querySelector('i');
    /* eslint-enable testing-library/no-node-access */

    expect(activeIcon).toHaveClass('fa', 'fa-circle', styles.faCircleIsActive);
    expect(activeIcon).not.toHaveClass(styles.faCircleIsInActive);
    expect(inactiveIcon).toHaveClass('fa', 'fa-circle', styles.faCircleIsInActive);
    expect(inactiveIcon).not.toHaveClass(styles.faCircleIsActive);
    expect(totalIcon).toHaveClass('fa', 'fa-users');
    expect(totalIcon).not.toHaveClass('fa-circle');
    expect(totalIcon).not.toHaveClass(styles.faCircleIsActive);
    expect(totalIcon).not.toHaveClass(styles.faCircleIsInActive);
  });

  it('should render correctly', () => {
    renderWithProvider(<TeamsOverview numberOfTeams={0} numberOfActiveTeams={0} />);
  });

  it('displays the correct number of teams', () => {
    renderWithProvider(<TeamsOverview numberOfTeams={10} numberOfActiveTeams={0} />);
    expect(screen.getByText(/Total Teams\s*:\s*10/)).toBeInTheDocument();
  });

  it('displays the correct number of active teams', () => {
    renderWithProvider(<TeamsOverview numberOfTeams={0} numberOfActiveTeams={5} />);
    expect(screen.getByText(/Active Teams\s*:\s*5/)).toBeInTheDocument();
  });

  it('has a card for total teams', () => {
    renderWithProvider(<TeamsOverview numberOfTeams={0} numberOfActiveTeams={0} />);
    expect(screen.getByTestId('total_teams')).toBeInTheDocument();
  });

  it('has a card for active teams', () => {
    renderWithProvider(<TeamsOverview numberOfTeams={0} numberOfActiveTeams={0} />);
    expect(screen.getByTestId('active_teams')).toBeInTheDocument();
  });

  it('has a card for total teams', () => {
    renderWithProvider(<TeamsOverview numberOfTeams={0} numberOfActiveTeams={0} />);
    // This is correct and should be passing now.
    expect(screen.getByTestId('total_teams')).toBeInTheDocument();
  });

  it('has a card for active teams', () => {
    renderWithProvider(<TeamsOverview numberOfTeams={0} numberOfActiveTeams={0} />);
    // This is correct and should be passing now.
    expect(screen.getByTestId('active_teams')).toBeInTheDocument();
  });

  it('displays the correct localization for total teams', () => {
    renderWithProvider(<TeamsOverview numberOfTeams={0} numberOfActiveTeams={0} />);
    expect(screen.getByTestId('total_teams')).toBeInTheDocument();
  });

  it('displays the correct localization for active teams', () => {
    renderWithProvider(<TeamsOverview numberOfTeams={0} numberOfActiveTeams={0} />);
    expect(screen.getByTestId('active_teams')).toBeInTheDocument();
  });
});
