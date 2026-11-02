/* eslint-disable testing-library/no-node-access */
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import TeamsReportLogs from '../TeamsReportLogs';

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

  const expectMetricValue = (label, expectedValue) => {
    const labelElement = screen.getByText(label);
    const block = screen
      .getAllByRole('heading', { level: 3 })
      .find(heading => within(heading.parentElement ?? document.body).queryByText(label));
    expect(block).toBeInTheDocument();
    expect(block).toHaveTextContent(String(expectedValue));
  };

  it('displays the correct title', () => {
    renderComponent();
    expect(screen.getByRole('heading', { level: 2, name: /Teams Report/i })).toBeInTheDocument();
  });

  it('displays the correct Number of Members', () => {
    renderComponent();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: String(selectedTeamsTotalValues.selectedTeamsTotalPeople),
      }),
    ).toBeInTheDocument();
  });

  it('displays the correct Total Team Blue Squares', () => {
    renderComponent();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: String(selectedTeamsTotalValues.selectedTeamsTotalBlueSquares),
      }),
    ).toBeInTheDocument();
  });

  it('displays the correct Weekly Committed Hours', () => {
    renderComponent();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: String(selectedTeamsTotalValues.selectedTeamsTotalCommitedHours),
      }),
    ).toBeInTheDocument();
  });

  it('displays the correct Total Worked Hours This Week', () => {
    renderComponent();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: String(totalWorkedHours),
      }),
    ).toBeInTheDocument();
  });

  it('renders 4 metric blocks even with no team data', () => {
    renderComponent(
      {
        selectedTeamsTotalPeople: 0,
        selectedTeamsTotalBlueSquares: 0,
        selectedTeamsTotalCommitedHours: 0,
      },
      [],
    );
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(4);
  });
});
