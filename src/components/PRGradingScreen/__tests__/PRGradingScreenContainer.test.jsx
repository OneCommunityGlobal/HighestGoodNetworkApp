import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route } from 'react-router-dom';
import { configureStore } from 'redux-mock-store';
import thunk from 'redux-thunk';

vi.mock('uuid', () => ({
  v4: () => 'mocked-uuid-1234',
}));

import * as prGradingActions from '../../../actions/prGradingActions';
import { UserRole } from '../../../utils/enums';

vi.mock('../../../actions/prGradingActions', () => ({
  fetchWeeklyGrading: vi.fn(),
  fetchPRGradingConfig: vi.fn(),
}));

vi.mock('../PRGradingScreen', () => ({
  default: ({ teamData, reviewers, teamOptions, selectedTeamName, onTeamChange, emptyMessage }) => (
    <div data-testid="pr-grading-screen">
      <span data-testid="team-name">{teamData?.teamName}</span>
      <span data-testid="reviewer-count">{reviewers?.length}</span>
      <span data-testid="team-options-count">{teamOptions?.length ?? 0}</span>
      <span data-testid="selected-team-name">{selectedTeamName}</span>
      {emptyMessage && <span data-testid="empty-message">{emptyMessage}</span>}
      {teamOptions?.length > 0 && (
        <select
          data-testid="team-dropdown"
          value={selectedTeamName}
          onChange={e => onTeamChange?.(e.target.value)}
        >
          {teamOptions.map(t => (
            <option key={t._id ?? t.teamName} value={t.teamName}>
              {t.teamName}
            </option>
          ))}
        </select>
      )}
    </div>
  ),
}));

import PRGradingScreenContainer from '../index';

const mockStore = configureStore([thunk]);

const baseStore = {
  theme: { darkMode: false },
  auth: {
    isAuthenticated: true,
    user: { role: UserRole.Administrator, permissions: ['see_all_reports'] },
  },
  userProfile: {
    permission: {
      permission: ['see_all_reports', 'manage_PR_grading'],
    },
  },
};

const renderContainer = (locationState = {}, storeOverrides = {}, teamId = '') => {
  const store = mockStore({ ...baseStore, ...storeOverrides });
  const path = teamId ? `/pr-grading-screen/${teamId}` : '/pr-grading-screen';
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[{ pathname: path, state: locationState }]}>
        <Route path="/pr-grading-screen/:teamId?">
          <PRGradingScreenContainer />
        </Route>
      </MemoryRouter>
    </Provider>,
  );
};

const apiFlatArray = [
  {
    reviewer: 'Dave',
    prsNeeded: 5,
    prsReviewed: 2,
    gradedPrs: [{ prNumbers: '101', grade: 'Okay' }],
  },
];

const teamOptions = [
  { _id: 'id1', teamName: 'Team 1' },
  { _id: 'id2', teamName: 'Team 2' },
];

beforeEach(() => {
  vi.clearAllMocks();
  prGradingActions.fetchPRGradingConfig.mockReturnValue(() =>
    Promise.resolve({ success: true, data: teamOptions }),
  );
  prGradingActions.fetchWeeklyGrading.mockReturnValue(() =>
    Promise.resolve({ success: true, data: apiFlatArray }),
  );
});

describe('dynamic teamId + config (no API call)', () => {
  const config = {
    teamName: 'DynamicTeam',
    reviewerCount: 3,
    reviewerNames: ['Alice', 'Bob', 'Carol'],
  };

  it('builds reviewers from config.reviewerNames', async () => {
    renderContainer({ config }, {}, 'custom-abc');

    await waitFor(() => {
      expect(screen.getByTestId('team-name').textContent).toBe('DynamicTeam');
      expect(screen.getByTestId('reviewer-count').textContent).toBe('3');
    });

    expect(prGradingActions.fetchWeeklyGrading).not.toHaveBeenCalled();
  });

  it('falls back to "Reviewer N" when reviewerNames is missing', async () => {
    renderContainer({ config: { teamName: 'NoNameTeam', reviewerCount: 2 } }, {}, 'custom-xyz');

    await waitFor(() => {
      expect(screen.getByTestId('reviewer-count').textContent).toBe('2');
    });
  });

  it('renders zero reviewers when reviewerCount is 0', async () => {
    renderContainer(
      { config: { teamName: 'EmptyTeam', reviewerCount: 0 } },
      {},
      'custom-empty',
    );

    await waitFor(() => {
      expect(screen.getByTestId('reviewer-count').textContent).toBe('0');
    });
  });
});

describe('static teamId (error state)', () => {
  it('shows error for static team IDs instead of mock data', async () => {
    renderContainer({}, {}, 'team1');

    await waitFor(() => {
      expect(screen.getByText(/Static mock team IDs are not supported/i)).toBeInTheDocument();
    });

    expect(prGradingActions.fetchWeeklyGrading).not.toHaveBeenCalled();
  });
});

describe('loading state', () => {
  it('shows loading text while API is in flight', () => {
    prGradingActions.fetchWeeklyGrading.mockReturnValue(() => new Promise(() => {}));
    renderContainer();

    expect(screen.getByText('Loading grading data...')).toBeInTheDocument();
  });
});

describe('API fetch path — success', () => {
  it('renders reviewer data from the API response', async () => {
    renderContainer();

    await waitFor(() => {
      expect(screen.getByTestId('team-name').textContent).toBe('Team 1');
      expect(screen.getByTestId('reviewer-count').textContent).toBe('1');
    });
  });

  it('calls fetchWeeklyGrading with the first team from config', async () => {
    renderContainer();

    await waitFor(() => {
      expect(prGradingActions.fetchWeeklyGrading).toHaveBeenCalledWith('Team 1', expect.any(String));
    });
  });

  it('uses location.state.teamName as the initial team if provided', async () => {
    renderContainer({ teamName: 'Team 2' });

    await waitFor(() => {
      expect(prGradingActions.fetchWeeklyGrading).toHaveBeenCalledWith('Team 2', expect.any(String));
    });
  });
});

describe('empty state', () => {
  it('shows empty message when API returns []', async () => {
    prGradingActions.fetchWeeklyGrading.mockReturnValue(() =>
      Promise.resolve({ success: true, data: [] }),
    );
    renderContainer();

    await waitFor(() => {
      expect(screen.getByTestId('empty-message').textContent).toBe(
        'No grading data for this team yet.',
      );
    });
  });
});

describe('error state', () => {
  it('shows error message when API returns success: false', async () => {
    prGradingActions.fetchWeeklyGrading.mockReturnValue(() =>
      Promise.resolve({ success: false, status: 503 }),
    );
    renderContainer();

    await waitFor(() => {
      expect(
        screen.getByText('Failed to load grading data. Please try again.'),
      ).toBeInTheDocument();
    });
  });

  it('shows error message when data is not an array', async () => {
    prGradingActions.fetchWeeklyGrading.mockReturnValue(() =>
      Promise.resolve({ success: true, data: null }),
    );
    renderContainer();

    await waitFor(() => {
      expect(
        screen.getByText('Failed to load grading data. Please try again.'),
      ).toBeInTheDocument();
    });
  });

  it('shows error message when dispatch throws', async () => {
    prGradingActions.fetchWeeklyGrading.mockReturnValue(() =>
      Promise.reject(new Error('Network error')),
    );
    renderContainer();

    await waitFor(() => {
      expect(
        screen.getByText('Failed to load grading data. Please try again.'),
      ).toBeInTheDocument();
    });
  });
});

describe('team switching', () => {
  it('loads team options from config on mount', async () => {
    renderContainer();

    await waitFor(() => {
      expect(screen.getByTestId('team-options-count').textContent).toBe('2');
    });

    expect(prGradingActions.fetchPRGradingConfig).toHaveBeenCalledTimes(1);
  });

  it('does not show dropdown when config returns empty array', async () => {
    prGradingActions.fetchPRGradingConfig.mockReturnValue(() =>
      Promise.resolve({ success: true, data: [] }),
    );
    renderContainer();

    await waitFor(() => {
      expect(screen.getByTestId('team-options-count').textContent).toBe('0');
    });

    expect(screen.queryByTestId('team-dropdown')).not.toBeInTheDocument();
  });

  it('does not show dropdown when config fetch fails', async () => {
    prGradingActions.fetchPRGradingConfig.mockReturnValue(() =>
      Promise.resolve({ success: false }),
    );
    renderContainer();

    await waitFor(() => {
      expect(screen.getByTestId('team-options-count').textContent).toBe('0');
    });

    expect(screen.queryByTestId('team-dropdown')).not.toBeInTheDocument();
  });

  it('re-fetches grading data with new teamName when dropdown changes', async () => {
    renderContainer();

    await waitFor(() => {
      expect(screen.getByTestId('team-dropdown')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId('team-dropdown'), { target: { value: 'Team 2' } });

    await waitFor(() => {
      expect(prGradingActions.fetchWeeklyGrading).toHaveBeenCalledWith('Team 2', expect.any(String));
    });
  });

  it('does not fetch config for config-driven teamId paths', async () => {
    const config = { teamName: 'Custom', reviewerCount: 1, reviewerNames: ['Alice'] };
    renderContainer({ config }, {}, 'custom-123');

    await waitFor(() => {
      expect(screen.getByTestId('team-name').textContent).toBe('Custom');
    });

    expect(prGradingActions.fetchPRGradingConfig).not.toHaveBeenCalled();
  });
});
