import { render, screen } from '@testing-library/react';
import { RiskTooltip, truncateAxisLabel } from '../ProjectRiskProfileOverview';

const renderTooltip = row =>
  render(<RiskTooltip active payload={[{ payload: row }]} label={row.projectName} />);

describe('ProjectRiskProfileOverview tooltip', () => {
  it('does not repeat N/A or show a zero change when the period has a single point', () => {
    renderTooltip({
      projectName: 'Building 1',
      predictedCostOverrun: null,
      predictedTimeDelay: null,
      totalOpenIssues: 0,
      __history: [{ predictedCostOverrun: null, predictedTimeDelay: null, totalOpenIssues: 0 }],
    });
    expect(
      screen.getByText('Key drivers of change: not enough history in this period'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/N\/A N\/A/)).not.toBeInTheDocument();
  });

  it('shows one arrow and value per driver across the period', () => {
    renderTooltip({
      projectName: 'Building 1',
      predictedCostOverrun: 15,
      predictedTimeDelay: null,
      totalOpenIssues: 4,
      __history: [
        { predictedCostOverrun: 10, predictedTimeDelay: null, totalOpenIssues: 1 },
        { predictedCostOverrun: 15, predictedTimeDelay: null, totalOpenIssues: 4 },
      ],
    });
    expect(
      screen.getByText('Key drivers of change: Cost ↑ 5%, Delay N/A, Issues ↑ 3'),
    ).toBeInTheDocument();
  });
});

describe('truncateAxisLabel', () => {
  it('keeps short names and shortens long ones', () => {
    expect(truncateAxisLabel('Building 1')).toBe('Building 1');
    expect(truncateAxisLabel('[Stock Risk QA 5709] Ready')).toBe('[Stock Risk QA 57…');
  });
});
