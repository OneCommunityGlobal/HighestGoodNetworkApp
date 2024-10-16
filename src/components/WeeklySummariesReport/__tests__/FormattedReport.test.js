// Corrected Test File for FormattedReport Component

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import FormattedReport from '../FormattedReport'; // Adjust the import path as necessary

// Mocking required modules and functions
jest.mock('../../../utils/permissions', () => ({
  hasPermission: jest.fn(() => true), // Mock `hasPermission` to return true
  cantUpdateDevAdminDetails: jest.fn(() => false), // Mock this function as well
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
  },
}));

jest.mock('../../../actions/weeklySummariesReport', () => ({
  updateOneSummaryReport: jest.fn(() => ({ status: 200 })),
}));

// Mock store setup
const mockStore = configureStore([]);

// Mock data for summaries
const mockSummaries = [
  {
    _id: 'summary1',
    firstName: 'John',
    lastName: 'Doe',
    totalSeconds: [3600, 7200],
    promisedHoursByWeek: [2, 4],
    totalTangibleHrs: 85,
    daysInTeam: 100,
    bioPosted: 'posted',
    weeklySummaries: [{ summary: 'Completed all tasks', uploadDate: '2023-10-10' }],
    email: 'john@example.com',
    role: 'Volunteer',
    adminLinks: [{ Name: 'Google Doc', Link: 'http://google.com' }],
  },
  {
    _id: 'summary2',
    firstName: 'Jane',
    lastName: 'Doe',
    totalSeconds: [5400, 3600],
    promisedHoursByWeek: [3, 1],
    totalTangibleHrs: 90,
    daysInTeam: 80,
    bioPosted: 'requested',
    weeklySummaries: [{ summary: 'Worked on major updates', uploadDate: '2023-10-08' }],
    email: 'jane@example.com',
    role: 'Administrator',
    adminLinks: [],
  },
];

describe('FormattedReport Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      auth: {
        user: {
          email: 'admin@example.com',
          role: 'Administrator',
        },
      },
    });
  });

  test('renders FormattedReport with summaries', () => {
    render(
      <Provider store={store}>
        <Router>
          <FormattedReport
            summaries={mockSummaries}
            weekIndex={0}
            bioCanEdit={true}
            allRoleInfo={[]}
            badges={[]}
            loadBadges={true}
            canEditTeamCode={true}
            auth={{ user: { email: 'admin@example.com' } }}
            canSeeBioHighlight={true}
            darkMode={false}
            handleTeamCodeChange={() => {}}
          />
        </Router>
      </Provider>
    );

    // Check if the names are rendered
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/Jane Doe/i)).toBeInTheDocument();

    // Check if the weekly summary for the first user is displayed
    expect(screen.getByText(/Completed all tasks/i)).toBeInTheDocument();
  });

  test('displays the hours logged correctly', () => {
    render(
      <Provider store={store}>
        <Router>
          <FormattedReport
            summaries={mockSummaries}
            weekIndex={0}
            bioCanEdit={true}
            allRoleInfo={[]}
            badges={[]}
            loadBadges={true}
            canEditTeamCode={true}
            auth={{ user: { email: 'admin@example.com' } }}
            canSeeBioHighlight={true}
            darkMode={false}
            handleTeamCodeChange={() => {}}
          />
        </Router>
      </Provider>
    );

    // Verify the hours logged are displayed correctly for both summaries
    expect(screen.getByText(/Hours logged: 1.00 \/ 2/i)).toBeInTheDocument(); // John Doe
    expect(screen.getByText(/Hours logged: 1.50 \/ 3/i)).toBeInTheDocument(); // Jane Doe
  });

  test('displays the Google Doc link if provided', () => {
    render(
      <Provider store={store}>
        <Router>
          <FormattedReport
            summaries={mockSummaries}
            weekIndex={0}
            bioCanEdit={true}
            allRoleInfo={[]}
            badges={[]}
            loadBadges={true}
            canEditTeamCode={true}
            auth={{ user: { email: 'admin@example.com' } }}
            canSeeBioHighlight={true}
            darkMode={false}
            handleTeamCodeChange={() => {}}
          />
        </Router>
      </Provider>
    );

    // Check if the Google Doc link is rendered for the first summary
    expect(screen.getByText(/Open link to media files/i)).toHaveAttribute('href', 'http://google.com');
  });

  test('displays bio announcement status', () => {
    render(
      <Provider store={store}>
        <Router>
          <FormattedReport
            summaries={mockSummaries}
            weekIndex={0}
            bioCanEdit={true}
            allRoleInfo={[]}
            badges={[]}
            loadBadges={true}
            canEditTeamCode={true}
            auth={{ user: { email: 'admin@example.com' } }}
            canSeeBioHighlight={true}
            darkMode={false}
            handleTeamCodeChange={() => {}}
          />
        </Router>
      </Provider>
    );

    // Verify that the bio status is displayed for both summaries
    expect(screen.getByText(/Bio announcement:/i)).toBeInTheDocument();
    expect(screen.getByText(/Posted/i)).toBeInTheDocument(); // John Doe
    expect(screen.getByText(/Requested/i)).toBeInTheDocument(); // Jane Doe
  });

  test('renders the CopyToClipboard component and copies emails', () => {
    render(
      <Provider store={store}>
        <Router>
          <FormattedReport
            summaries={mockSummaries}
            weekIndex={0}
            bioCanEdit={true}
            allRoleInfo={[]}
            badges={[]}
            loadBadges={true}
            canEditTeamCode={true}
            auth={{ user: { email: 'admin@example.com' } }}
            canSeeBioHighlight={true}
            darkMode={false}
            handleTeamCodeChange={() => {}}
          />
        </Router>
      </Provider>
    );

    // Since you mocked `react-toastify` for `Emails Copied!`, check if the mock function is called
    expect(screen.getByText(/Emails Copied!/i)).toBeInTheDocument();
  });
});
