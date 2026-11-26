import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { vi } from 'vitest';
import axios from 'axios';
import JobApplicationAnalyticsPage from '../JobApplicationAnalyticsPage';

vi.mock('axios');

const mockStore = configureMockStore([]);

function renderPage(role = 'Owner') {
  const store = mockStore({
    auth: {
      isAuthenticated: true,
      user: { userid: 'u1', role },
    },
    theme: { darkMode: false },
  });

  return render(
    <Provider store={store}>
      <JobApplicationAnalyticsPage />
    </Provider>,
  );
}

describe('JobApplicationAnalyticsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockImplementation(url => {
      if (String(url).includes('/jobforms/applications/summary')) {
        return Promise.resolve({
          data: {
            totalApplications: 10,
            applicationsLast7Days: 2,
            applicationsLast30Days: 5,
            uniqueApplicants: 8,
            activeForms: 3,
            formsWithSubmissions: 2,
            topForms: [{ formId: 'f1', formTitle: 'Software', count: 4 }],
            applicationsByWeekday: [
              { label: 'Mon', count: 3 },
              { label: 'Tue', count: 2 },
            ],
            applicationsByHour: [{ label: '14:00', count: 4 }],
            hoursPerWeekBreakdown: [{ label: '10–19 hrs/week', count: 5 }],
            commitmentBreakdown: [{ label: '3–6 months', count: 4 }],
            joiningExpectations: [{ label: '2026-03-01', count: 2 }],
          },
        });
      }
      if (String(url).includes('/jobforms/applications')) {
        return Promise.resolve({
          data: {
            total: 1,
            page: 1,
            limit: 25,
            items: [
              {
                _id: 'a1',
                formTitle: 'Software',
                respondent: 'Ada Lovelace',
                email: 'ada@example.com',
                submittedAt: '2026-01-02T12:00:00.000Z',
                resumeUrl: '',
                answerCount: 3,
              },
            ],
          },
        });
      }
      if (String(url).includes('/jobforms/all')) {
        return Promise.resolve({ data: { forms: [{ _id: 'f1', title: 'Software' }] } });
      }
      return Promise.resolve({ data: [] });
    });
  });

  it('shows Access Denied for Volunteer', () => {
    renderPage('Volunteer');
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('renders heading and table for Owner', async () => {
    renderPage('Owner');
    expect(screen.getByRole('heading', { name: /Job Application Analytics/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    });
    expect(screen.getByText('ada@example.com')).toBeInTheDocument();
    expect(screen.getAllByText('Software').length).toBeGreaterThan(0);
  });

  it('renders summary cards from mock payload', async () => {
    renderPage('Administrator');
    await waitFor(() => {
      expect(screen.getByTestId('analytics-summary-cards')).toBeInTheDocument();
    });
    expect(screen.getByText('Total applications')).toBeInTheDocument();
  });
});
