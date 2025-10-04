import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { vi } from 'vitest';

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
});
