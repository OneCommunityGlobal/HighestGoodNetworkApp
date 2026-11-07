import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { vi } from 'vitest';
import { toast } from 'react-toastify';

vi.mock('../HGNForm/HGNQuestionnarieRemainder/services/questionnaireService', () => ({
  getQuestionnaireStatus: vi.fn(),
}));

import { getQuestionnaireStatus } from '../HGNForm/HGNQuestionnarieRemainder/services/questionnaireService';

vi.mock('../LeaderBoard', () => ({ default: () => <div data-testid="leaderboard" /> }));
vi.mock('../WeeklySummary/WeeklySummary', () => ({
  default: () => <div data-testid="weeklysummary" />,
}));
vi.mock('../Timelog/Timelog', () => ({ default: () => <div data-testid="timelog" /> }));
vi.mock('../SummaryBar/SummaryBar', () => ({
  default: props => <div data-testid="summarybar" data-displayuserid={props.displayUserId} />,
}));
vi.mock('./TimeOffRequestDetailModal', () => ({ default: () => <div data-testid="timeoff" /> }));
vi.mock('../FeedbackModal/FeedbackModal', () => ({
  default: () => <div data-testid="feedbackmodal" />,
}));
vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

import ConnectedDashboard from './Dashboard';

const mockStore = configureMockStore();

describe('Dashboard', () => {
  let store;
  const match = { params: { userId: 'user2' } };

  beforeEach(() => {
    store = mockStore({
      auth: { user: { userid: 'user1', role: 'Admin', email: 'admin@example.com' } },
      theme: { darkMode: false },
    });

    vi.clearAllMocks();
    getQuestionnaireStatus.mockResolvedValue({ completed: true });
  });

  it('renders all child components with correct props', async () => {
    render(
      <Provider store={store}>
        <ConnectedDashboard match={match} />
      </Provider>,
    );

    const summaryBar = await screen.findByTestId('summarybar');

    expect(summaryBar).toBeInTheDocument();
    expect(summaryBar).toHaveAttribute('data-displayuserid', 'user2');

    expect(screen.getByTestId('leaderboard')).toBeInTheDocument();
    expect(screen.getByTestId('weeklysummary')).toBeInTheDocument();
    expect(screen.getByTestId('timelog')).toBeInTheDocument();
    expect(screen.getByTestId('timeoff')).toBeInTheDocument();
  });

  it('shows and clears the PM Resource Dashboard permission denied toast state', async () => {
    const location = {
      pathname: '/dashboard',
      state: {
        from: { pathname: '/pm/dashboard/resources' },
        permissionDeniedMessage: 'You do not have access to the Resource Dashboard.',
      },
    };
    const history = { replace: vi.fn() };

    render(
      <Provider store={store}>
        <ConnectedDashboard match={match} location={location} history={history} />
      </Provider>,
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Permission Denied: You do not have access to the Resource Dashboard.',
      );
    });

    expect(history.replace).toHaveBeenCalledWith({
      ...location,
      state: { from: { pathname: '/pm/dashboard/resources' } },
    });
  });

  it('does not show a permission denied toast during normal dashboard navigation', async () => {
    render(
      <Provider store={store}>
        <ConnectedDashboard
          match={match}
          location={{ pathname: '/dashboard', state: undefined }}
          history={{ replace: vi.fn() }}
        />
      </Provider>,
    );

    await waitFor(() => {
      expect(getQuestionnaireStatus).toHaveBeenCalled();
    });

    expect(toast.error).not.toHaveBeenCalled();
  });
});
