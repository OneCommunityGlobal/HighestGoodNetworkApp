import React from 'react';
import { render } from '@testing-library/react';
import TeamChartsGroup from 'components/Reports/TeamReport/components/TeamChartsGroup';

describe('TeamChartsGroup Component', () => {
  it('renders TeamChartsGroup component with two ReportCharts', () => {
    const { getAllByText } = render(<TeamChartsGroup />);

    // Check if the component renders two chart with the same title
    const teamChartWrapper = getAllByText('Breakdown of Weekly Hours So Far This Week');
    const firstChart = teamChartWrapper[0];
    const secondChart = teamChartWrapper[1];
    expect(firstChart).toBeInTheDocument();
    expect(secondChart).toBeInTheDocument();
  });

  it('renders with the correct CSS class names', () => {
    const { container } = render(<TeamChartsGroup />);

    // Check if the container element has the "team-chart-wrapper" class
    expect(container.querySelector('.team-chart-wrapper')).toBeInTheDocument();

    // Check if both ReportBlocks have the "team-chart-container" class
    const reportBlocks = container.querySelectorAll('.team-chart-container');
    expect(reportBlocks).toHaveLength(2);
  });
});
