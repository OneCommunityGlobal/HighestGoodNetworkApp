import { render, screen } from '@testing-library/react';
import TeamChartsGroup from '../TeamChartsGroup';

// Mock the ReportCharts component since it's causing errors
vi.mock('../ReportCharts', () => {
  return function MockReportCharts(props) {
    return <div data-testid="report-chart" data-props={JSON.stringify(props)} />;
  };
});

describe('Test Suite for TeamChartsGroup Component', () => {
  it('Test case 1 : Renders two ReportCharts components', () => {
    render(<TeamChartsGroup />);
    const reportCharts = screen.getAllByTestId('report-chart');
    expect(reportCharts).toHaveLength(2);
  });

  it('Test case 2 : Renders divs with appropriate classNames', () => {
    const { container } = render(<TeamChartsGroup />);
    const divs = container.querySelectorAll('.team-chart-container');
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
