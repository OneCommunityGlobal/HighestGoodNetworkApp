import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import FormattedReport from '../FormattedReport'; // Adjust the path as necessary
import { BrowserRouter as Router } from 'react-router-dom';

const mockStore = configureStore([]);

describe('FormattedReport component', () => {
  let store;

  const defaultProps = {
    summaries: [
      {
        _id: 'summary1',
        email: 'testuser@example.com',
        firstName: 'John',
        lastName: 'Doe',
        weeklySummaries: [{ summary: 'Weekly summary content' }],
        badgeCollection: [],
        totalSeconds: [36000], // 10 hours
        promisedHoursByWeek: [20],
        totalTangibleHrs: 85,
        daysInTeam: 65,
        bioPosted: 'default',
        role: 'Administrator',
        adminLinks: [],
      },
    ],
    weekIndex: 0,
    bioCanEdit: true,
    allRoleInfo: [],
    badges: [],
    loadBadges: true,
    canEditTeamCode: true,
    auth: { user: { email: 'admin@example.com', role: 'Administrator' } },
    canSeeBioHighlight: true,
    darkMode: false,
    handleTeamCodeChange: jest.fn(),
  };

  beforeEach(() => {
    store = mockStore({
      permissions: {
        hasPermission: () => true,
      },
    });
  });

  it('renders the FormattedReport component correctly', () => {
    render(
      <Provider store={store}>
        <Router>
          <FormattedReport {...defaultProps} />
        </Router>
      </Provider>
    );

    expect(screen.getByText('Weekly Summary (')).toBeInTheDocument();
  });

  it('displays email icon and copy functionality when user is an Administrator', () => {
    render(
      <Provider store={store}>
        <Router>
          <FormattedReport {...defaultProps} />
        </Router>
      </Provider>
    );

    const emailIcon = screen.getByTestId('emailIcon');
    fireEvent.click(emailIcon);
    expect(defaultProps.handleTeamCodeChange).not.toHaveBeenCalled(); // Placeholder to verify email function.
  });

  it('displays correct hours logged for the week', () => {
    render(
      <Provider store={store}>
        <Router>
          <FormattedReport {...defaultProps} />
        </Router>
      </Provider>
    );

    expect(screen.getByText('Hours logged: 10.00 / 20')).toBeInTheDocument();
  });

  it('displays team code input when team code is editable', () => {
    render(
      <Provider store={store}>
        <Router>
          <FormattedReport {...defaultProps} />
        </Router>
      </Provider>
    );

    expect(screen.getByPlaceholderText('X-XXX')).toBeInTheDocument();
  });

  it('displays bio announcement as requested if bio is not posted', () => {
    const updatedProps = {
      ...defaultProps,
      summaries: [
        {
          ...defaultProps.summaries[0],
          bioPosted: 'requested',
        },
      ],
    };

    render(
      <Provider store={store}>
        <Router>
          <FormattedReport {...updatedProps} />
        </Router>
      </Provider>
    );

    expect(screen.getByText('Bio announcement: Requested')).toBeInTheDocument();
  });

  it('does not render if no summaries are provided', () => {
    render(
      <Provider store={store}>
        <Router>
          <FormattedReport {...defaultProps} summaries={[]} />
        </Router>
      </Provider>
    );

    expect(screen.queryByText('Weekly Summary')).not.toBeInTheDocument();
  });
});