// import React from 'react';
import { render, screen} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import UserLoginPrivileges from '../UserLoginPrivileges';

describe('UserLoginPrivileges Component', () => {
  // Mock props
  const mockProps = {
    role: 'admin',
    teamName: 'Team A',
    teamMembers: [
      { id: 1, name: 'Oscar', weeklycommittedHours: 10, infringements: [] },
      { id: 2, name: 'John', weeklycommittedHours: 20, infringements: [] },
      { id: 3, name: 'Jane', weeklycommittedHours: 25, infringements: [] },
      { id: 4, name: 'Lily', weeklycommittedHours: 15, infringements: [] },
    ],
    totalTeamWeeklyWorkedHours: 70,
    selectedTeams: [],
    selectedTeamsWeeklyEffort: [20, 30],
    allTeamsMembers: [],
    darkMode: false,
    teamDataLoading: false,
  };

  // Test if the component renders without crashing
  test('renders without crashing', () => {
    render(
      <UserLoginPrivileges
        role={mockProps.role}
        teamName={mockProps.teamName}
        teamMembers={mockProps.teamMembers}
        totalTeamWeeklyWorkedHours={mockProps.totalTeamWeeklyWorkedHours}
        selectedTeams={mockProps.selectedTeams}
        selectedTeamsWeeklyEffort={mockProps.selectedTeamsWeeklyEffort}
        allTeamsMembers={mockProps.allTeamsMembers}
        darkMode={mockProps.darkMode}
        teamDataLoading={mockProps.teamDataLoading}
      />
    );
  });

  // Test if the component renders the correct team name and team logs
  test('renders team name and team report logs', () => {
    render(
      <UserLoginPrivileges
        role={mockProps.role}
        teamName={mockProps.teamName}
        teamMembers={mockProps.teamMembers}
        totalTeamWeeklyWorkedHours={mockProps.totalTeamWeeklyWorkedHours}
        selectedTeams={mockProps.selectedTeams}
        selectedTeamsWeeklyEffort={mockProps.selectedTeamsWeeklyEffort}
        allTeamsMembers={mockProps.allTeamsMembers}
        darkMode={mockProps.darkMode}
        teamDataLoading={mockProps.teamDataLoading}
      />
    );
    
    // Verify team name
    expect(screen.getByText(/Team A/)).toBeInTheDocument();
    
    // Verify team logs
    expect(screen.getByText('Selected Teams')).toBeInTheDocument();
  });

  // Test if the component renders selected teams and corresponding charts
  test('renders selected teams and corresponding charts', () => {
    render(
      <UserLoginPrivileges
        role={mockProps.role}
        teamName={mockProps.teamName}
        teamMembers={mockProps.teamMembers}
        totalTeamWeeklyWorkedHours={mockProps.totalTeamWeeklyWorkedHours}
        selectedTeams={mockProps.selectedTeams}
        selectedTeamsWeeklyEffort={mockProps.selectedTeamsWeeklyEffort}
        allTeamsMembers={mockProps.allTeamsMembers}
        darkMode={mockProps.darkMode}
        teamDataLoading={mockProps.teamDataLoading}
      />
    );
  
    // Verify selected teams title
    expect(screen.getByText('Selected Teams')).toBeInTheDocument();
  
    // Verify selected teams' charts and other related elements
    expect(screen.getByText('Breakdown of Weekly Hours So Far This Week')).toBeInTheDocument();
  });

  // Test if the component displays correct data in team report logs
  test('displays correct data in team report logs', () => {
    render(
      <UserLoginPrivileges
        role={mockProps.role}
        teamName={mockProps.teamName}
        teamMembers={mockProps.teamMembers}
        totalTeamWeeklyWorkedHours={mockProps.totalTeamWeeklyWorkedHours}
        selectedTeams={mockProps.selectedTeams}
        selectedTeamsWeeklyEffort={mockProps.selectedTeamsWeeklyEffort}
        allTeamsMembers={mockProps.allTeamsMembers}
        darkMode={mockProps.darkMode}
        teamDataLoading={mockProps.teamDataLoading}
      />
    );
  
    // Find all elements that might contain the expected text
    const elements = screen.getAllByRole('heading', {
      name: String(mockProps.totalTeamWeeklyWorkedHours),
    });

    // Extract text content from the elements and combine it
    const combinedTextContent = elements.map(element => element.textContent).join('');
    
    // Perform assertion on the combined text content
    expect(combinedTextContent).toContain(`${mockProps.totalTeamWeeklyWorkedHours}`);
  });

  // Test if the component displays correct data in selected teams report logs
  test('displays correct data in second teams report logs', () => {
    render(
      <UserLoginPrivileges
        role={mockProps.role}
        teamName={mockProps.teamName}
        teamMembers={mockProps.teamMembers}
        totalTeamWeeklyWorkedHours={mockProps.totalTeamWeeklyWorkedHours}
        selectedTeams={mockProps.selectedTeams}
        selectedTeamsWeeklyEffort={mockProps.selectedTeamsWeeklyEffort}
        allTeamsMembers={mockProps.allTeamsMembers}
        darkMode={mockProps.darkMode}
        teamDataLoading={mockProps.teamDataLoading}
      />
    );

    // Check if the team report charts weekly commit is rendered
    expect(screen.getByText('Weekly Commited Hours')).toBeInTheDocument();
    // Check if the team report charts hours worked is rendered
    expect(screen.getByText('Hours Worked In Current Week')).toBeInTheDocument();
  });

  // Test if the component applied certain styles correctly
  test('Check if certain styles are applied correctly for chart container', () => {
    const { container } = render(<UserLoginPrivileges {...mockProps} />);
  
    // Check styles applied directly using inline styles
    const teamChartContainers = container.querySelectorAll('.team-chart-container');
    teamChartContainers.forEach((chartContainer) => {
      expect(chartContainer).toHaveStyle('display: block');
    });
  });

  // Test if the component applied certain styles correctly for pie charts
  test('Check if certain styles are applied correctly for pie charts with data', () => {
    const { container } = render(<UserLoginPrivileges {...mockProps} />);
  
    const mobileChart = container.querySelector('.mobile-chart');
    
    // Check styles applied using CSS classes
    expect(mobileChart).toHaveClass('mobile-chart');
    expect(mobileChart).toHaveStyle('display: flex');
    expect(mobileChart).toHaveStyle('gap: 16px');
  });

  // Test if the component works when given real team data
  test('renders charts and headings based on selectedTeams and allTeamsMembers data', () => {
    const customProps = {
      ...mockProps,
      selectedTeams: [{ selectedTeam: { teamName: 'Team X' }, index: 0 }],
      allTeamsMembers: [[
      { name: 'Tiger', weeklycommittedHours: 10, infringements: [1, 2] },
      { name: 'King', weeklycommittedHours: 15, infringements: [] }
      ]]
    };

    render(
      <UserLoginPrivileges
        role={mockProps.role}
        teamName={mockProps.teamName}
        teamMembers={mockProps.teamMembers}
        totalTeamWeeklyWorkedHours={mockProps.totalTeamWeeklyWorkedHours}
        selectedTeams={mockProps.selectedTeams}
        selectedTeamsWeeklyEffort={mockProps.selectedTeamsWeeklyEffort}
        allTeamsMembers={mockProps.allTeamsMembers}
        darkMode={mockProps.darkMode}
        teamDataLoading={mockProps.teamDataLoading}
      />
    );

    const weeklyCommittedHeading = screen.getByText('Weekly Commited Hours');
    const hoursWorkedHeading = screen.getByText('Hours Worked In Current Week');
    const selectedTeamsHeading = screen.getByText('Selected Teams');

    expect(weeklyCommittedHeading).toBeInTheDocument();
    expect(hoursWorkedHeading).toBeInTheDocument();
    expect(selectedTeamsHeading).toBeInTheDocument();
  });
});