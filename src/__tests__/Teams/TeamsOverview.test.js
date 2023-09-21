import React from 'react';
import TeamsOverview from 'components/Teams/TeamsOverview';
import { renderWithProvider } from '__tests__/utils';

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
});
