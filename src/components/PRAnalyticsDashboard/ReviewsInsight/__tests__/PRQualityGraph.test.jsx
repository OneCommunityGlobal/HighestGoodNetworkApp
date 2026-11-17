import { vi } from 'vitest';

vi.mock('react-redux', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    useSelector: vi.fn(() => false),
  };
});

let lastPieOptions;
vi.mock('react-chartjs-2', () => ({
  Pie: ({ options }) => {
    lastPieOptions = options;
    return <div data-testid="pie-chart" />;
  },
}));

import { render, screen } from '@testing-library/react';
import PRQualityGraph from '../PRQualityGraph';

const renderWithStore = ui => render(ui);

const selectedTeams = [{ value: 'Team A', label: 'Team A' }];
const qualityData = {
  'Team A': {
    NotApproved: 0,
    LowQuality: 1,
    Sufficient: 1,
    Exceptional: 0,
  },
};
const teamData = {
  'Team A': {
    memberCount: 5,
  },
};

describe('PRQualityGraph', () => {
  it('labels every category in the tooltip in Number mode', () => {
    renderWithStore(
      <PRQualityGraph
        selectedTeams={selectedTeams}
        qualityData={qualityData}
        isDataViewActive={false}
        orderedTeamIds={['Team A']}
        teamData={teamData}
      />,
    );

    const { tooltip } = lastPieOptions.plugins;
    expect(tooltip.callbacks.title()).toBe('');
    expect(tooltip.callbacks.label({ label: 'Not Approved', raw: 0 })).toBe('Not Approved: 0');
    expect(tooltip.callbacks.label({ label: 'Low Quality', raw: 1 })).toBe('Low Quality: 1');
    expect(tooltip.callbacks.label({ label: 'Sufficient', raw: 1 })).toBe('Sufficient: 1');
    expect(tooltip.callbacks.label({ label: 'Exceptional', raw: 0 })).toBe('Exceptional: 0');
  });

  it('labels every category in the tooltip in Data View (percentage) mode', () => {
    renderWithStore(
      <PRQualityGraph
        selectedTeams={selectedTeams}
        qualityData={qualityData}
        isDataViewActive
        orderedTeamIds={['Team A']}
        teamData={teamData}
      />,
    );

    const { tooltip } = lastPieOptions.plugins;
    expect(tooltip.callbacks.label({ label: 'Not Approved', raw: 0 })).toBe('Not Approved: 0.0%');
    expect(tooltip.callbacks.label({ label: 'Low Quality', raw: 50 })).toBe('Low Quality: 50.0%');
  });

  it('renders the team member count from teamData', () => {
    renderWithStore(
      <PRQualityGraph
        selectedTeams={selectedTeams}
        qualityData={qualityData}
        isDataViewActive={false}
        orderedTeamIds={['Team A']}
        teamData={teamData}
      />,
    );

    expect(screen.getByText(/5 members/)).toBeInTheDocument();
  });

  it('defaults to 0 members when teamData is missing for a team', () => {
    renderWithStore(
      <PRQualityGraph
        selectedTeams={selectedTeams}
        qualityData={qualityData}
        isDataViewActive={false}
        orderedTeamIds={['Team A']}
        teamData={{}}
      />,
    );

    expect(screen.getByText(/0 members/)).toBeInTheDocument();
  });
});
