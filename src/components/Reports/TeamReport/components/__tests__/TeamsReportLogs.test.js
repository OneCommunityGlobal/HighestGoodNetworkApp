import { render, screen, within } from '@testing-library/react';
import TeamsReportLogs from '../TeamsReportLogs';

// Ensure jest-dom matchers are available
import '@testing-library/jest-dom/extend-expect';

describe('TeamsReportLogs Component', () => {
  const selectedTeamsTotalValues = {
    selectedTeamsTotalPeople: 10,
    selectedTeamsTotalBlueSquares: 25,
    selectedTeamsTotalCommitedHours: 200,
  };

  const selectedTeamsWeeklyEffort = [30, 40, 20, 35];
  const totalWorkedHours = selectedTeamsWeeklyEffort.reduce((acc, curr) => acc + curr, 0);

  const renderComponent = (values = selectedTeamsTotalValues, effort = selectedTeamsWeeklyEffort) =>
    render(
      <TeamsReportLogs
        title="Teams Report"
        selectedTeamsTotalValues={values}
        selectedTeamsWeeklyEffort={effort}
      />,
    );

  it('displays the correct title', () => {
    renderComponent();
    const titleEl = screen.getByRole('heading', { level: 2, name: /Teams Report/i });
    expect(titleEl).toBeInTheDocument();
  });

  it('displays the correct Number of Members', () => {
    renderComponent();
    const block = screen.getByText('Number of Members').closest('.team-report-time-log-block');
    expect(block).toBeInTheDocument();
    const valueEl = within(block).getByRole('heading', { level: 3 });
    expect(valueEl).toHaveTextContent(String(selectedTeamsTotalValues.selectedTeamsTotalPeople));
  });

  it('displays the correct Total Team Blue Squares', () => {
    renderComponent();
    const block = screen
      .getByText('Total Team Blue Squares')
      .closest('.team-report-time-log-block');
    expect(block).toBeInTheDocument();
    const valueEl = within(block).getByRole('heading', { level: 3 });
    expect(valueEl).toHaveTextContent(
      String(selectedTeamsTotalValues.selectedTeamsTotalBlueSquares),
    );
  });

  it('displays the correct Weekly Committed Hours', () => {
    renderComponent();
    const block = screen.getByText('Weekly Committed Hours').closest('.team-report-time-log-block');
    expect(block).toBeInTheDocument();
    const valueEl = within(block).getByRole('heading', { level: 3 });
    expect(valueEl).toHaveTextContent(
      String(selectedTeamsTotalValues.selectedTeamsTotalCommitedHours),
    );
  });

  it('displays the correct Total Worked Hours This Week', () => {
    renderComponent();
    const block = screen
      .getByText('Total Worked Hours This Week')
      .closest('.team-report-time-log-block');
    expect(block).toBeInTheDocument();
    const valueEl = within(block).getByRole('heading', { level: 3 });
    expect(valueEl).toHaveTextContent(String(totalWorkedHours));
  });

  it('renders 4 blocks even with no team data', () => {
    const { container } = renderComponent({}, []);
    const blocks = container.querySelectorAll('.team-report-time-log-block');
    expect(blocks).toHaveLength(4);
  });
});
