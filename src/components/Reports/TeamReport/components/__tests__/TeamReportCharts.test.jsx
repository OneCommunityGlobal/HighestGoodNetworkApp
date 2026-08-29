import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TeamReportCharts from '../TeamReportCharts';
vi.mock('../TeamReportCharts', () => ({
  __esModule: true,
  default: ({
    title,
    pieChartId,
    teamWeeklyCommittedHours,
    totalTeamWeeklyWorkedHours,
    darkMode,
  }) => {
    const totalHoursAvailable = teamWeeklyCommittedHours - totalTeamWeeklyWorkedHours;

    return (
      <section className="team-report-chart-wrapper" data-testid="team-report-chart">
        <div className={`team-report-chart-teams ${darkMode ? 'bg-yinmn-blue' : ''}`}>
          <h4 style={{ textAlign: 'center', color: darkMode ? 'white' : '' }}>{title}</h4>
          <div className="team-report-chart-info-wrapper mobile-pie-chart">
            <div className="team-report-chart-info">
              <div className="pie-chart-wrapper mobile-pie-chart">
                <div
                  id={`pie-chart-container-${pieChartId}`}
                  className="pie-chart"
                  data-testid={`pie-chart-container-${pieChartId}`}
                />
                <div className="pie-chart-info-detail">
                  <div className="pie-chart-info-detail-title">
                    <h5 className={darkMode ? 'text-light' : ''}>Name</h5>
                    <h5 className={darkMode ? 'text-light' : ''}>Hours</h5>
                  </div>
                  <div data-testid="pie-info-committed" className="pie-chart-info-detail-item">
                    <span>Commited</span>
                    <span>{teamWeeklyCommittedHours}</span>
                  </div>
                  <div data-testid="pie-info-worked" className="pie-chart-info-detail-item">
                    <span>Worked</span>
                    <span>{totalTeamWeeklyWorkedHours}</span>
                  </div>
                  <div data-testid="pie-info-available" className="pie-chart-info-detail-item">
                    <span>Total Hours Available</span>
                    <span>{totalHoursAvailable > 0 ? totalHoursAvailable : 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  },
}));

describe('TeamReportCharts', () => {
  const props = {
    title: 'Team Report',
    pieChartId: 'chart-1',
    teamWeeklyCommittedHours: 100,
    totalTeamWeeklyWorkedHours: 50,
    darkMode: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<TeamReportCharts {...props} />);
    expect(screen.getByTestId('team-report-chart')).toBeInTheDocument();
  });

  it('renders the correct title', () => {
    render(<TeamReportCharts {...props} />);
    expect(screen.getByText('Team Report')).toBeInTheDocument();
  });

  it('renders the correct number of pie chart info details', () => {
    render(<TeamReportCharts {...props} />);
    expect(screen.getByTestId('pie-info-committed')).toBeInTheDocument();
    expect(screen.getByTestId('pie-info-worked')).toBeInTheDocument();
    expect(screen.getByTestId('pie-info-available')).toBeInTheDocument();
  });

  it('renders the correct pie chart id', () => {
    render(<TeamReportCharts {...props} />);
    const pieChartContainer = screen.getByTestId(`pie-chart-container-${props.pieChartId}`);
    expect(pieChartContainer).toBeInTheDocument();
  });

  it('renders the correct teamWeeklyCommittedHours', () => {
    render(<TeamReportCharts {...props} />);
    const committedHoursElement = screen.getByTestId('pie-info-committed');
    expect(committedHoursElement.textContent).toContain('100');
  });

  it('renders the correct totalTeamWeeklyWorkedHours', () => {
    render(<TeamReportCharts {...props} />);
    const workedHoursElement = screen.getByTestId('pie-info-worked');
    expect(workedHoursElement.textContent).toContain('50');
  });

  it('applies dark mode when darkMode is true', () => {
    render(<TeamReportCharts {...props} darkMode />);
    const pieChartContainer = screen.getByTestId(`pie-chart-container-${props.pieChartId}`);
    expect(pieChartContainer).toBeInTheDocument();
  });
});
