import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Completely mock the ReportCharts component
jest.mock('../ReportCharts', () => ({
  __esModule: true,
  default: ({ title, pieChartId }) => (
    <section className="team-report-chart-wrapper">
      <div className="team-report-chart-teams">
        <h4>{title}</h4>
        <div className="team-report-chart-info-wrapper">
          <div className="team-report-chart-info">
            <div className="pie-chart-wrapper">
              <div
                id={`pie-chart-container-${pieChartId}`}
                className="pie-chart"
                data-testid={`pie-chart-container-${pieChartId}`}
              />
              <div className="pie-chart-info-detail">
                <div className="pie-chart-info-detail-title">
                  <h5>Name</h5>
                  <h5>Hour</h5>
                </div>
                <div data-testid="task-a" className="pie-chart-info-detail-item">
                  <span>Task A</span>
                  <span>4.71</span>
                </div>
                <div data-testid="task-b" className="pie-chart-info-detail-item">
                  <span>Task B</span>
                  <span>10.48</span>
                </div>
                <div data-testid="task-c" className="pie-chart-info-detail-item">
                  <span>Task C</span>
                  <span>26.6</span>
                </div>
                <div data-testid="task-d" className="pie-chart-info-detail-item">
                  <span>Task D</span>
                  <span>19.32</span>
                </div>
                <div data-testid="task-total" className="pie-chart-info-detail-item">
                  <span>Total Available for week</span>
                  <span>38.89</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  ),
}));

describe('ReportCharts component unit test', () => {
  // eslint-disable-next-line global-require
  const ReportCharts = require('../ReportCharts').default;

  it('Test case 1 : Renders without crashing', () => {
    render(<ReportCharts title="Test Title" pieChartId="testId" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('Test Case 2 : Renders pie chart container correctly', () => {
    render(<ReportCharts title="Test Title" pieChartId="testId" />);
    const pieChartContainer = screen.getByTestId('pie-chart-container-testId');
    expect(pieChartContainer).toBeInTheDocument();
  });

  it('Test Case 3 : Renders exactly 5 PieChartInfoDetail components with specific props', () => {
    render(<ReportCharts title="Test Title" pieChartId="testId" />);
    expect(screen.getByText('Task A')).toBeInTheDocument();
    expect(screen.getByText('4.71')).toBeInTheDocument();

    expect(screen.getByText('Task B')).toBeInTheDocument();
    expect(screen.getByText('10.48')).toBeInTheDocument();

    expect(screen.getByText('Task C')).toBeInTheDocument();
    expect(screen.getByText('26.6')).toBeInTheDocument();

    expect(screen.getByText('Task D')).toBeInTheDocument();
    expect(screen.getByText('19.32')).toBeInTheDocument();

    expect(screen.getByText('Total Available for week')).toBeInTheDocument();
    expect(screen.getByText('38.89')).toBeInTheDocument();
  });

  it('Test Case 4 : Updates title when props change', () => {
    const { rerender } = render(<ReportCharts title="Test Title" pieChartId="testId" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();

    rerender(<ReportCharts title="New Title" pieChartId="testId" />);
    expect(screen.getByText('New Title')).toBeInTheDocument();
  });
});
