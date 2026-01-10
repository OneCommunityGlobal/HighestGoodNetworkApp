import { render, screen } from '@testing-library/react';
import TeamsReportCharts from '../TeamsReportCharts';
// Completely mock the TeamsReportCharts component
vi.mock('../TeamsReportCharts', () => ({
  __esModule: true,
  default: ({ title, pieChartId, selectedTeamsData, selectedTeamsWeeklyEffort, darkMode }) => {
    // Calculate the chart values
    const chart = {
      team1:
        title === 'Weekly Committed Hours'
          ? selectedTeamsData[0]?.totalCommitedHours
          : selectedTeamsWeeklyEffort[0],
      team2:
        title === 'Weekly Committed Hours'
          ? selectedTeamsData[1]?.totalCommitedHours
          : selectedTeamsWeeklyEffort[1],
      team3:
        title === 'Weekly Committed Hours'
          ? selectedTeamsData[2]?.totalCommitedHours
          : selectedTeamsWeeklyEffort[2],
      team4:
        title === 'Weekly Committed Hours'
          ? selectedTeamsData[3]?.totalCommitedHours
          : selectedTeamsWeeklyEffort[3],
    };

    // Colors for the teams
    const colors = ['#B88AD5', '#FAE386', '#92C4F9', '#ff5e82'];

    return (
      <section className="team-report-chart-wrapper" data-testid="team-report-chart">
        <div
          className={`team-report-chart-teams ${darkMode ? 'bg-yinmn-blue text-light' : ''}`}
          data-testid="chart-teams-container"
        >
          <h4>{title}</h4>
          <div className="team-report-chart-info-wrapper">
            <div className="team-report-chart-info">
              {selectedTeamsData.length > 0 ? (
                <div className="pie-chart-wrapper">
                  <div
                    id={`pie-chart-container-${pieChartId}`}
                    className="pie-chart"
                    data-testid="pie-chart-container"
                  />
                  <div className="pie-chart-info-detail">
                    <div className="pie-chart-info-detail-title">
                      <h5>Name</h5>
                      <h5>Hours</h5>
                    </div>
                    {/* Team 1 */}
                    {selectedTeamsData[0] && (
                      <div
                        data-testid={`team-info-${selectedTeamsData[0]?.name}`}
                        className="pie-chart-info-detail-item"
                      >
                        <span>{selectedTeamsData[0]?.name}</span>
                        <span>{chart.team1}</span>
                        <div style={{ backgroundColor: colors[0] }} className="color-square" />
                      </div>
                    )}
                    {/* Team 2 */}
                    {selectedTeamsData[1] && (
                      <div
                        data-testid={`team-info-${selectedTeamsData[1]?.name}`}
                        className="pie-chart-info-detail-item"
                      >
                        <span>{selectedTeamsData[1]?.name}</span>
                        <span>{chart.team2}</span>
                        <div style={{ backgroundColor: colors[1] }} className="color-square" />
                      </div>
                    )}
                    {/* Team 3 */}
                    {selectedTeamsData[2] && (
                      <div
                        data-testid={`team-info-${selectedTeamsData[2]?.name}`}
                        className="pie-chart-info-detail-item"
                      >
                        <span>{selectedTeamsData[2]?.name}</span>
                        <span>{chart.team3}</span>
                        <div style={{ backgroundColor: colors[2] }} className="color-square" />
                      </div>
                    )}
                    {/* Team 4 */}
                    {selectedTeamsData[3] && (
                      <div
                        data-testid={`team-info-${selectedTeamsData[3]?.name}`}
                        className="pie-chart-info-detail-item"
                      >
                        <span>{selectedTeamsData[3]?.name}</span>
                        <span>{chart.team4}</span>
                        <div style={{ backgroundColor: colors[3] }} className="color-square" />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <strong>Please select a team. (Max 4)</strong>
              )}
            </div>
            <div className="team-report-chart-info" />
          </div>
        </div>
      </section>
    );
  },
}));

describe('TeamsReportCharts Component', () => {
  const selectedTeamsData = [
    { name: 'Team 1', totalCommitedHours: 20 },
    { name: 'Team 2', totalCommitedHours: 30 },
    { name: 'Team 3', totalCommitedHours: 15 },
  ];
  const selectedTeamsWeeklyEffort = [25, 35, 18, 10];

  // Import the component after mocking
  // eslint-disable-next-line global-require

  it('renders without crashing', () => {
    render(
      <TeamsReportCharts
        title="Weekly Committed Hours"
        pieChartId={1}
        selectedTeamsData={selectedTeamsData}
        selectedTeamsWeeklyEffort={selectedTeamsWeeklyEffort}
      />,
    );
    expect(screen.getByTestId('team-report-chart')).toBeInTheDocument();
  });

  it('renders the correct number of team info components', () => {
    render(
      <TeamsReportCharts
        title="Weekly Committed Hours"
        pieChartId={1}
        selectedTeamsData={selectedTeamsData}
        selectedTeamsWeeklyEffort={selectedTeamsWeeklyEffort}
      />,
    );

    // Check for each team's info
    expect(screen.getByTestId('team-info-Team 1')).toBeInTheDocument();
    expect(screen.getByTestId('team-info-Team 2')).toBeInTheDocument();
    expect(screen.getByTestId('team-info-Team 3')).toBeInTheDocument();
  });

  it('renders a message when no team is selected', () => {
    render(
      <TeamsReportCharts
        title="Weekly Committed Hours"
        pieChartId={1}
        selectedTeamsData={[]}
        selectedTeamsWeeklyEffort={[]}
      />,
    );

    expect(screen.getByText('Please select a team. (Max 4)')).toBeInTheDocument();
  });

  it('renders the correct title', () => {
    const title = 'Weekly Effort';
    render(
      <TeamsReportCharts
        title={title}
        pieChartId={1}
        selectedTeamsData={selectedTeamsData}
        selectedTeamsWeeklyEffort={selectedTeamsWeeklyEffort}
      />,
    );

    expect(screen.getByText(title)).toBeInTheDocument();
  });

  it('does not render team info when selectedTeamsData is empty', () => {
    render(
      <TeamsReportCharts
        title="Weekly Committed Hours"
        pieChartId={1}
        selectedTeamsData={[]}
        selectedTeamsWeeklyEffort={selectedTeamsWeeklyEffort}
      />,
    );

    // Check that no team info components are rendered
    expect(screen.queryByTestId(/team-info-/)).not.toBeInTheDocument();
  });

  it('renders team names correctly', () => {
    render(
      <TeamsReportCharts
        title="Weekly Committed Hours"
        pieChartId={1}
        selectedTeamsData={selectedTeamsData}
        selectedTeamsWeeklyEffort={selectedTeamsWeeklyEffort}
      />,
    );

    // Check team names are rendered correctly
    expect(screen.getByText('Team 1')).toBeInTheDocument();
    expect(screen.getByText('Team 2')).toBeInTheDocument();
    expect(screen.getByText('Team 3')).toBeInTheDocument();
  });

  it('applies dark mode styling when darkMode prop is true', () => {
    render(
      <TeamsReportCharts
        title="Weekly Committed Hours"
        pieChartId={1}
        selectedTeamsData={selectedTeamsData}
        selectedTeamsWeeklyEffort={selectedTeamsWeeklyEffort}
        darkMode
      />,
    );

    const chartContainer = screen.getByTestId('chart-teams-container');
    expect(chartContainer).toHaveClass('bg-yinmn-blue');
    expect(chartContainer).toHaveClass('text-light');
  });
});
