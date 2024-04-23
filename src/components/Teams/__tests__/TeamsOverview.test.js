import React from 'react';
import TeamsOverview from 'components/Teams/TeamsOverview';
import { renderWithProvider } from '__tests__/utils';
import { TOTAL_TEAMS, ACTIVE_TEAMS } from '../../../languages/en/ui';

describe('TeamsOverview', () => {
  it('should render correctly', () => {
    renderWithProvider(<TeamsOverview />);
  });

  it('displays the correct number of teams', () => {
    const { getByText } = renderWithProvider(<TeamsOverview numberOfTeams={10} />);
    expect(getByText('10')).toBeInTheDocument();
  });

  it('displays the correct number of active teams', () => {
    const { getByText } = renderWithProvider(<TeamsOverview numberOfActiveTeams={5} />);
    expect(getByText('5')).toBeInTheDocument();
  });

  it('has a card for total teams', () => {
    const { getByText } = renderWithProvider(<TeamsOverview />);
    expect(getByText('Teams')).toBeInTheDocument();
  });

  it('has a card for active teams', () => {
    const { getByText } = renderWithProvider(<TeamsOverview />);
    expect(getByText('Active Teams')).toBeInTheDocument();
  });

  it('displays the user icon', () => {
    const { getByTestId } = renderWithProvider(<TeamsOverview />);
    expect(getByTestId('card_team')).toBeInTheDocument();
  });

  it('displays the circle icon', () => {
    const { getByTestId } = renderWithProvider(<TeamsOverview />);
    expect(getByTestId('card_active')).toBeInTheDocument();
  });

  it('displays the correct localization for total teams', () => {
    const { getByText } = renderWithProvider(<TeamsOverview />);
    expect(getByText(TOTAL_TEAMS)).toBeInTheDocument();
  });

  it('displays the correct localization for active teams', () => {
    const { getByText } = renderWithProvider(<TeamsOverview />);
    expect(getByText(ACTIVE_TEAMS)).toBeInTheDocument();
  });
});
