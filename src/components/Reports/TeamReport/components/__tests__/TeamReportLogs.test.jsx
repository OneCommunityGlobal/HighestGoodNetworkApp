import { render, screen, within } from '@testing-library/react';
import TeamReportLogs from '../TeamReportLogs';

describe('TeamReportLogs', () => {
  const props = {
    title: 'Team Report',
    teamMembers: ['Alice', 'Bob', 'Charlie'],
    teamTotalBlueSquares: 3,
    teamWeeklyCommittedHours: 3,
    totalTeamWeeklyWorkedHours: 3,
  };

  it('renders the correct title', () => {
    render(<TeamReportLogs {...props} />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent(props.title);
  });

  it('renders Number of Members block correctly', () => {
    render(<TeamReportLogs {...props} />);
    const blocks = screen.getAllByTestId('log-block');
    const { getByText } = within(blocks[0]);
    expect(getByText(props.teamMembers.length.toString())).toBeInTheDocument();
    expect(getByText('Number of Members')).toBeInTheDocument();
  });

  it('renders Total Team Blue Squares block correctly', () => {
    render(<TeamReportLogs {...props} />);
    const blocks = screen.getAllByTestId('log-block');
    const { getByText } = within(blocks[1]);
    expect(getByText(props.teamTotalBlueSquares.toString())).toBeInTheDocument();
    expect(getByText('Total Team Blue Squares')).toBeInTheDocument();
  });

  it('renders Weekly Committed Hours block correctly', () => {
    render(<TeamReportLogs {...props} />);
    const blocks = screen.getAllByTestId('log-block');
    const { getByText } = within(blocks[2]);
    expect(getByText(props.teamWeeklyCommittedHours.toString())).toBeInTheDocument();
    expect(getByText('Weekly Committed Hours')).toBeInTheDocument();
  });

  it('renders Total Worked Hours This Week block correctly', () => {
    render(<TeamReportLogs {...props} />);
    const blocks = screen.getAllByTestId('log-block');
    const { getByText } = within(blocks[3]);
    expect(getByText(props.totalTeamWeeklyWorkedHours.toString())).toBeInTheDocument();
    expect(getByText('Total Worked Hours This Week')).toBeInTheDocument();
  });
});