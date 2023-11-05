import React from 'react';
import { render } from '@testing-library/react';
import TeamChartsGroup from 'components/Reports/TeamReport/components/TeamChartsGroup';

describe('TeamChartsGroup Component', () => {
  it('renders two ReportCharts with correct titles and pieChartIds', () => {
    const { getByText } = render(<TeamChartsGroup />);

    // Check if the first ReportCharts is rendered with the correct title and pieChartId
    expect(getByText('Breakdown of Weekly Hours So Far This Week')).toBeInTheDocument();
    expect(getByText('chart1')).toBeInTheDocument();

    // Check if the second ReportCharts is rendered with the correct title and pieChartId
    expect(getByText('Breakdown of Weekly Hours So Far This Week')).toBeInTheDocument();
    expect(getByText('chart2')).toBeInTheDocument();
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
