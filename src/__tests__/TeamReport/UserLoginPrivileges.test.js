import React from 'react';
import { render, screen } from '@testing-library/react';
import UserLoginPrivileges from 'components/Reports/TeamReport/components/UserLoginPrivileges';

describe('UserLoginPrivileges component', () => {
  //Mock props
  const mockTeamName = 'Tuan team';
  const mockTeamMember = [
    { id: 1, name: 'Tuan Dinh', weeklyCommitedHours: 40, infringements: [] },
    { id: 2, name: 'Minh Nguyen', weeklyCommitedHours: 40, infringements: [] },
    { id: 3, name: 'Thanh Le', weeklyCommitedHours: 40, infringements: [] },
    { id: 4, name: 'Khang Le', weeklyCommitedHours: 40, infringements: [] },
  ];
  const mockTotalTeamWeeklyWorkedHours = 160;
  const mockSelectedTeams = [];
  const mockSelectedTeamsWeeklyEffort = [25, 35, 18, 10];
  const mockAllTeamsMembers = [];

  it('renders without crashing', () => {
    render(
      <UserLoginPrivileges
        role="user"
        teamName={mockTeamName}
        teamMembers={mockTeamMember}
        totalTeamWeeklyWorkedHours={mockTotalTeamWeeklyWorkedHours}
        selectedTeams={mockSelectedTeams}
        selectedTeamsWeeklyEffort={mockSelectedTeamsWeeklyEffort}
        allTeamsMembers={mockAllTeamsMembers}
      />,
    );
  });

  it('renders team name and team report logs', () => {
    render(
      <UserLoginPrivileges
        role="user"
        teamName={mockTeamName}
        teamMembers={mockTeamMember}
        totalTeamWeeklyWorkedHours={mockTotalTeamWeeklyWorkedHours}
        selectedTeams={mockSelectedTeams}
        selectedTeamsWeeklyEffort={mockSelectedTeamsWeeklyEffort}
        allTeamsMembers={mockAllTeamsMembers}
      />,
    );

    // Check if the team name is rendered
    expect(screen.getByText(mockTeamName)).toBeInTheDocument();
    // Check if the team report logs are rendered
    expect(screen.getByText('Selected Teams')).toBeInTheDocument();
  });

  it('renders selected teams and corresponding charts', () => {
    // Mock selected teams data and other necessary props...

    render(
      <UserLoginPrivileges
        role="user"
        teamName={mockTeamName}
        teamMembers={mockTeamMember}
        totalTeamWeeklyWorkedHours={mockTotalTeamWeeklyWorkedHours}
        selectedTeams={mockSelectedTeams}
        selectedTeamsWeeklyEffort={mockSelectedTeamsWeeklyEffort}
        allTeamsMembers={mockAllTeamsMembers}
      />,
    );

    // Check if the selected teams title is rendered
    expect(screen.getByText('Selected Teams')).toBeInTheDocument();

    // Check if the charts and other elements related to selected teams are rendered
    expect(screen.getByText('Breakdown of Weekly Hours So Far This Week')).toBeInTheDocument();
  });

  it('displays correct data in team report logs', () => {
    render(
      <UserLoginPrivileges
        role="user"
        teamName={mockTeamName}
        teamMembers={mockTeamMember}
        totalTeamWeeklyWorkedHours={mockTotalTeamWeeklyWorkedHours}
        selectedTeams={mockSelectedTeams}
        selectedTeamsWeeklyEffort={mockSelectedTeamsWeeklyEffort}
        allTeamsMembers={mockAllTeamsMembers}
      />,
    );

    // Find all elements that might contain the expected text
    const elements = screen.getAllByRole('heading', {
      name: String(mockTotalTeamWeeklyWorkedHours),
    });

    // Extract text content from the elements and combine it
    const combinedTextContent = elements.map(element => element.textContent).join('');

    // Perform assertion on the combined text content
    expect(combinedTextContent).toContain(`${mockTotalTeamWeeklyWorkedHours}`);
  });

  it('check if correct data in the second team report logs ', () => {
    render(
      <UserLoginPrivileges
        role="user"
        teamName={mockTeamName}
        teamMembers={mockTeamMember}
        totalTeamWeeklyWorkedHours={mockTotalTeamWeeklyWorkedHours}
        selectedTeams={mockSelectedTeams}
        selectedTeamsWeeklyEffort={mockSelectedTeamsWeeklyEffort}
        allTeamsMembers={mockAllTeamsMembers}
      />,
    );

    // Check if the team report charts weekly commit is rendered
    expect(screen.getByText('Weekly Commited Hours')).toBeInTheDocument();
    // Check if the team report charts hours worked is rendered
    expect(screen.getByText('Hours Worked In Current Week')).toBeInTheDocument();
  });

  it('Check if certain styles are applied correctly for chart container', () => {
    const { container } = render(
      <UserLoginPrivileges
        role="user"
        teamName={mockTeamName}
        teamMembers={mockTeamMember}
        totalTeamWeeklyWorkedHours={mockTotalTeamWeeklyWorkedHours}
        selectedTeams={mockSelectedTeams}
        selectedTeamsWeeklyEffort={mockSelectedTeamsWeeklyEffort}
        allTeamsMembers={mockAllTeamsMembers}
      />,
    );

    // Check styles applied directly using inline styles
    const teamChartContainers = container.querySelectorAll('.team-chart-container');
    teamChartContainers.forEach(chartContainer => {
      expect(chartContainer).toHaveStyle('display: block');
    });
  });

  it('Check if certain styles are applied correctly for pie charts with data', () => {
    const { container } = render(
      <UserLoginPrivileges
        role="user"
        teamName={mockTeamName}
        teamMembers={mockTeamMember}
        totalTeamWeeklyWorkedHours={mockTotalTeamWeeklyWorkedHours}
        selectedTeams={mockSelectedTeams}
        selectedTeamsWeeklyEffort={mockSelectedTeamsWeeklyEffort}
        allTeamsMembers={mockAllTeamsMembers}
      />,
    );

    const mobileChart = container.querySelector('.mobile-chart');
    // Check styles applied using CSS classes
    expect(mobileChart).toHaveClass('mobile-chart');
    expect(mobileChart).toHaveStyle('display: flex');
    expect(mobileChart).toHaveStyle('gap: 16px');
  });
});
