/* eslint-disable testing-library/no-node-access */
/* eslint-disable testing-library/no-container */
import { vi } from 'vitest'
import React from 'react'

// Stub out the chart components to avoid d3-shape runtime errors
vi.mock('../TeamReportCharts', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-team-report-charts" />,
}))
vi.mock('../TeamsReportCharts', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-teams-report-charts" />,
}))

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import UserLoginPrivileges from '../UserLoginPrivileges'

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
  }

  test('renders without crashing', () => {
    render(<UserLoginPrivileges {...mockProps} />)
  })

  test('renders team name and team report logs', () => {
    render(<UserLoginPrivileges {...mockProps} />)
    expect(screen.getByText(/Team A/)).toBeInTheDocument()
    expect(screen.getByText('Selected Teams')).toBeInTheDocument()
  })

  test('renders selected teams and corresponding chart stub', () => {
    render(<UserLoginPrivileges {...mockProps} />)
    expect(screen.getByText('Selected Teams')).toBeInTheDocument()

    // now assert at least one of the two chart stubs is present
    expect(screen.getAllByTestId('mock-teams-report-charts').length).toBeGreaterThan(0)
  })

  test('displays correct data in team report logs', () => {
    render(<UserLoginPrivileges {...mockProps} />)
    const elements = screen.getAllByRole('heading', {
      name: String(mockProps.totalTeamWeeklyWorkedHours),
    })
    const combinedTextContent = elements.map(el => el.textContent).join('')
    expect(combinedTextContent).toContain(`${mockProps.totalTeamWeeklyWorkedHours}`)
  })

  test('displays correct data in second teams report logs', () => {
    render(<UserLoginPrivileges {...mockProps} />)

    // allow for duplicates, just ensure at least one match
    expect(screen.getAllByText('Weekly Committed Hours').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Total Worked Hours This Week').length).toBeGreaterThan(0)
  })

  test('Check if certain styles are applied correctly for chart container', () => {
    const { container } = render(<UserLoginPrivileges {...mockProps} />)
    const chartContainers = container.querySelectorAll('.team-chart-container')
    chartContainers.forEach(c => {
      expect(c).toHaveStyle('display: block')
    })
  })

  test('Check if certain styles are applied correctly for mobile charts', () => {
    const { container } = render(<UserLoginPrivileges {...mockProps} />)
    const mobileChart = container.querySelector('.mobile-chart')
    expect(mobileChart).toHaveClass('mobile-chart')
    expect(mobileChart).toHaveStyle('display: flex')
    expect(mobileChart).toHaveStyle('gap: 16px')
  })

  test('renders charts and headings based on selectedTeams and allTeamsMembers data', () => {
    const custom = {
      ...mockProps,
      selectedTeams: [{ selectedTeam: { teamName: 'Team X' }, index: 0 }],
      allTeamsMembers: [
        [
          { name: 'Tiger', weeklycommittedHours: 10, infringements: [1, 2] },
          { name: 'King', weeklycommittedHours: 15, infringements: [] },
        ],
      ],
    }
    render(<UserLoginPrivileges {...custom} />)

    // again, allow duplicates
    expect(screen.getAllByText('Weekly Committed Hours').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Total Worked Hours This Week').length).toBeGreaterThan(0)
    expect(screen.getByText('Selected Teams')).toBeInTheDocument()
  })
})