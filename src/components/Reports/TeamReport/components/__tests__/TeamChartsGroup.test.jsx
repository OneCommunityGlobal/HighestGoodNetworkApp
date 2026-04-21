import React from 'react';
import { vi } from 'vitest'; // 1) import vi first
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
vi.mock('../ReportCharts', () => ({
  __esModule: true, // mark it as an ES module
  default: (
    props, // this becomes the default export
  ) => <div data-testid="report-chart" data-props={JSON.stringify(props)} />,
}));
import TeamChartsGroup from '../TeamChartsGroup';

describe('Test Suite for TeamChartsGroup Component', () => {
  it('Test case 1 : Renders two ReportCharts components', () => {
    render(<TeamChartsGroup />);
    const reportCharts = screen.getAllByTestId('report-chart');
    expect(reportCharts).toHaveLength(2);
  });

it('Test case 2 : Renders divs with appropriate classNames', () => {
  render(<TeamChartsGroup />);
  const divs = screen.getAllByTestId('team-chart-container');
  expect(divs).toHaveLength(2);
});

  it('Test case 3 : Passes correct props to ReportCharts components', () => {
    render(<TeamChartsGroup />);
    const reportCharts = screen.getAllByTestId('report-chart');

    const props1 = JSON.parse(reportCharts[0].dataset.props);
    const props2 = JSON.parse(reportCharts[1].dataset.props);

    expect(props1).toEqual({
      title: 'Breakdown of Weekly Hours So Far This Week',
      pieChartId: 'chart1',
    });

    expect(props2).toEqual({
      title: 'Breakdown of Weekly Hours So Far This Week',
      pieChartId: 'chart2',
    });
  });
});
