import React from 'react';
import TeamsOverview from 'components/Teams/TeamsOverview';
import { renderWithProvider } from '__tests__/utils';
import { TOTAL_TEAMS, ACTIVE_TEAMS } from '../../../languages/en/ui';
import { screen } from '@testing-library/react';

describe('TeamsOverview', () => {
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

  it('displays the user icon', () => {
    renderWithProvider(<TeamsOverview numberOfTeams={0} numberOfActiveTeams={0} />);
    expect(screen.getByTestId('card_team')).toBeInTheDocument();
  });

  it('displays the circle icon', () => {
    renderWithProvider(<TeamsOverview numberOfTeams={0} numberOfActiveTeams={0} />);
    expect(screen.getByTestId('card_active')).toBeInTheDocument();
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
