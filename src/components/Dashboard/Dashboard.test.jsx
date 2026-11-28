import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';
import { toast } from 'react-toastify';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock('../HGNForm/HGNQuestionnarieRemainder/services/questionnaireService', () => ({
  getQuestionnaireStatus: vi.fn(),
}));

import { getQuestionnaireStatus } from '../HGNForm/HGNQuestionnarieRemainder/services/questionnaireService';

vi.mock('../LeaderBoard', () => ({
  default: () => <div data-testid="leaderboard" />,
}));

vi.mock('../WeeklySummary/WeeklySummary', () => ({
  default: () => <div data-testid="weeklysummary" />,
}));

vi.mock('../Timelog/Timelog', () => ({
  default: () => <div data-testid="timelog" />,
}));

vi.mock('../SummaryBar/SummaryBar', () => ({
  default: props => <div data-testid="summarybar" data-displayuserid={props.displayUserId} />,
}));

vi.mock('./TimeOffRequestDetailModal', () => ({
  default: () => <div data-testid="timeoff" />,
}));

vi.mock('../HGNForm/HGNQuestionnarieRemainder/components/QuestionnaireReminder', () => ({
  default: () => <div data-testid="questionnaire-reminder" />,
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

  const match = {
    params: {
      userId: 'user2',
    },
  };

  beforeEach(() => {
    store = mockStore({
      auth: {
        user: {
          userid: 'user1',
          role: 'Admin',
          email: 'admin@example.com',
        },
      },
      theme: {
        darkMode: false,
      },
    });

    vi.clearAllMocks();

    axios.get.mockResolvedValue({
      data: {
        eligible: true,
      },
    });

    getQuestionnaireStatus.mockResolvedValue({
      completed: true,
    });
  });

  it('renders all Dashboard child components', async () => {
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

    expect(axios.get).toHaveBeenCalled();
    expect(getQuestionnaireStatus).toHaveBeenCalledWith('user2');
  });

  it('shows questionnaire reminder when eligible user has not completed questionnaire', async () => {
    getQuestionnaireStatus.mockResolvedValue({
      completed: false,
    });

    render(
      <Provider store={store}>
        <ConnectedDashboard match={match} />
      </Provider>,
    );

    expect(await screen.findByTestId('questionnaire-reminder')).toBeInTheDocument();

    expect(screen.queryByTestId('summarybar')).not.toBeInTheDocument();
    expect(screen.queryByTestId('leaderboard')).not.toBeInTheDocument();
    expect(screen.queryByTestId('timelog')).not.toBeInTheDocument();
  });

  it('allows Dashboard access when user is not Dropbox eligible', async () => {
    axios.get.mockResolvedValue({
      data: {
        eligible: false,
      },
    });

    render(
      <Provider store={store}>
        <ConnectedDashboard match={match} />
      </Provider>,
    );

    expect(await screen.findByTestId('summarybar')).toBeInTheDocument();

    expect(getQuestionnaireStatus).not.toHaveBeenCalled();

    expect(screen.queryByTestId('questionnaire-reminder')).not.toBeInTheDocument();
  });

  it('allows Dashboard access when Dropbox eligibility API fails', async () => {
    axios.get.mockRejectedValue(new Error('Network error'));

    render(
      <Provider store={store}>
        <ConnectedDashboard match={match} />
      </Provider>,
    );

    expect(await screen.findByTestId('summarybar')).toBeInTheDocument();

    expect(screen.queryByTestId('questionnaire-reminder')).not.toBeInTheDocument();

    expect(getQuestionnaireStatus).not.toHaveBeenCalled();
  });

  it('shows and clears the PM Resource Dashboard permission denied toast state', async () => {
    const location = {
      pathname: '/dashboard',
      state: {
        from: {
          pathname: '/pm/dashboard/resources',
        },
        permissionDeniedMessage: 'You do not have access to the Resource Dashboard.',
      },
    };

    const history = {
      replace: vi.fn(),
    };

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
      state: {
        from: {
          pathname: '/pm/dashboard/resources',
        },
      },
    });
  });

  it('does not show a permission denied toast during normal dashboard navigation', async () => {
    render(
      <Provider store={store}>
        <ConnectedDashboard
          match={match}
          location={{
            pathname: '/dashboard',
            state: undefined,
          }}
          history={{
            replace: vi.fn(),
          }}
        />
      </Provider>,
    );

    await waitFor(() => {
      expect(getQuestionnaireStatus).toHaveBeenCalled();
    });

    expect(toast.error).not.toHaveBeenCalled();
  });
});
