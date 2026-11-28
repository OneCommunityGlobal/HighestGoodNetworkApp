import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore, combineReducers } from 'redux';
import UserCard from '../UserCard';
import WeeklySummaryStatusBadge, { INCOMPLETE_SUMMARY_LABEL } from '../WeeklySummaryStatusBadge';

const store = createStore(combineReducers({ theme: (state = { darkMode: false }) => state }));

const renderCard = user =>
  render(
    <Provider store={store}>
      <MemoryRouter>
        <UserCard user={user} />
      </MemoryRouter>
    </Provider>,
  );

describe('WeeklySummaryStatusBadge', () => {
  it('shows a text label when the weekly summary is incomplete', () => {
    render(<WeeklySummaryStatusBadge status="incomplete" />);
    expect(screen.getByText(INCOMPLETE_SUMMARY_LABEL)).toBeInTheDocument();
  });

  it.each(['completed', 'notRequired', null, undefined])(
    'renders nothing for status %s',
    status => {
      const { container } = render(<WeeklySummaryStatusBadge status={status} />);
      expect(container).toBeEmptyDOMElement();
    },
  );
});

describe('UserCard weekly summary indicator', () => {
  const baseUser = { userId: 'u1', name: 'Ada Lovelace', topSkills: [] };

  it('shows the indicator next to the member whose summary is incomplete', () => {
    renderCard({ ...baseUser, weeklySummaryStatus: 'incomplete' });
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText(INCOMPLETE_SUMMARY_LABEL)).toBeInTheDocument();
  });

  it('does not show the indicator when the summary is completed', () => {
    renderCard({ ...baseUser, weeklySummaryStatus: 'completed' });
    expect(screen.queryByText(INCOMPLETE_SUMMARY_LABEL)).not.toBeInTheDocument();
  });

  it('does not show the indicator when status is unavailable', () => {
    renderCard(baseUser);
    expect(screen.queryByText(INCOMPLETE_SUMMARY_LABEL)).not.toBeInTheDocument();
  });

  it('updates when the status changes', () => {
    const { rerender } = renderCard({ ...baseUser, weeklySummaryStatus: 'incomplete' });
    expect(screen.getByText(INCOMPLETE_SUMMARY_LABEL)).toBeInTheDocument();

    rerender(
      <Provider store={store}>
        <MemoryRouter>
          <UserCard user={{ ...baseUser, weeklySummaryStatus: 'completed' }} />
        </MemoryRouter>
      </Provider>,
    );
    expect(screen.queryByText(INCOMPLETE_SUMMARY_LABEL)).not.toBeInTheDocument();
  });
});
