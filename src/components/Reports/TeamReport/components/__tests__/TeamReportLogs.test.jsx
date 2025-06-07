import { render, screen } from '@testing-library/react';
import TeamReportLogs from '../TeamReportLogs';

describe('TeamReportLogs', () => {
  const props = {
    title: 'Team Report',
    teamMembers: ['Alice', 'Bob', 'Charlie'],
    teamTotalBlueSquares: 3,
    teamWeeklyCommittedHours: 3,
    totalTeamWeeklyWorkedHours: 3,
  };

  it('renders without crashing', () => {
    const { container } = render(<TeamReportLogs {...props} />);
    expect(container).toBeInTheDocument();
  });

  it('renders the correct title', () => {
    render(<TeamReportLogs {...props} />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent(props.title);
  });

  it('renders the correct number of report blocks', () => {
    const { container } = render(<TeamReportLogs {...props} />);
    const blocks = container.getElementsByClassName('team-report-time-log-block');
    expect(blocks.length).toBe(4);
  });

  it('renders the correct number of team members', () => {
    const { container } = render(<TeamReportLogs {...props} />);
    const blocks = container.getElementsByClassName('team-report-time-log-block');
    expect(blocks[0].querySelector('h3').textContent).toBe(props.teamMembers.length.toString());
  });

  it('renders the correct number of total team blue squares', () => {
    const { container } = render(<TeamReportLogs {...props} />);
    const blocks = container.getElementsByClassName('team-report-time-log-block');
    expect(blocks[1].querySelector('h3').textContent).toBe(props.teamTotalBlueSquares.toString());
  });

  it('renders the correct number of weekly committed hours', () => {
    const { container } = render(<TeamReportLogs {...props} />);
    const blocks = container.getElementsByClassName('team-report-time-log-block');
    expect(blocks[2].querySelector('h3').textContent).toBe(
      props.teamWeeklyCommittedHours.toString(),
    );
  });

  it('renders the correct number of total worked hours this week', () => {
    const { container } = render(<TeamReportLogs {...props} />);
    const blocks = container.getElementsByClassName('team-report-time-log-block');
    expect(blocks[3].querySelector('h3').textContent).toBe(
      props.totalTeamWeeklyWorkedHours.toString(),
    );
  });
});
