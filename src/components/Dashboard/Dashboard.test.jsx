import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { vi } from 'vitest';
import { toast } from 'react-toastify';

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
    // Provide auth.user and theme.darkMode for connect + useSelector
    store = mockStore({
      auth: { user: { userid: 'user1', role: 'Admin', email: 'admin@example.com' } },
      theme: { darkMode: false },
    });
    vi.clearAllMocks();
  });

  it('renders all child components with correct props', () => {
    render(
      <Provider store={store}>
        {/* pass match prop for routing params */}
        <ConnectedDashboard match={match} />
      </Provider>,
    );

    // SummaryBar should receive displayUserId from match.params.userId
    const summaryBar = screen.getByTestId('summarybar');
    expect(summaryBar).toBeInTheDocument();
    expect(summaryBar).toHaveAttribute('data-displayuserid', 'user2');

    // Other child components appear
    expect(screen.getByTestId('leaderboard')).toBeInTheDocument();
    expect(screen.getByTestId('weeklysummary')).toBeInTheDocument();
    expect(screen.getByTestId('timelog')).toBeInTheDocument();
    expect(screen.getByTestId('timeoff')).toBeInTheDocument();
    // expect(screen.getByTestId('feedbackmodal')).toBeInTheDocument()
  });

  it('toggles the Weekly Summary with mouse, Enter, and Space', () => {
    render(
      <Provider store={store}>
        <ConnectedDashboard match={match} />
      </Provider>,
    );

    const toggleControl = screen.getByRole('button');
    expect(screen.getAllByTestId('weeklysummary')).toHaveLength(1);

    fireEvent.click(toggleControl);
    expect(screen.getAllByTestId('weeklysummary')).toHaveLength(2);

    fireEvent.keyDown(toggleControl, { key: 'Enter' });
    expect(screen.getAllByTestId('weeklysummary')).toHaveLength(1);

    fireEvent.keyDown(toggleControl, { key: ' ' });
    expect(screen.getAllByTestId('weeklysummary')).toHaveLength(2);
  });

  it.each([
    ['Meta+Shift+4', { key: '4', metaKey: true, shiftKey: true }],
    ['Control+Shift+4', { key: '4', ctrlKey: true, shiftKey: true }],
    ['ArrowDown', { key: 'ArrowDown' }],
  ])('does not toggle the Weekly Summary for %s', (_, keyboardEvent) => {
    render(
      <Provider store={store}>
        <ConnectedDashboard match={match} />
      </Provider>,
    );

    fireEvent.keyDown(screen.getByRole('button'), keyboardEvent);

    expect(screen.getAllByTestId('weeklysummary')).toHaveLength(1);
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

  it('does not show a permission denied toast during normal dashboard navigation', () => {
    render(
      <Provider store={store}>
        <ConnectedDashboard
          match={match}
          location={{ pathname: '/dashboard', state: undefined }}
          history={{ replace: vi.fn() }}
        />
      </Provider>,
    );

    expect(toast.error).not.toHaveBeenCalled();
  });
});
