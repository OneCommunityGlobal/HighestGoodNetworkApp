import { fireEvent, render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MyCases from '../MyCases';

vi.mock('../../../../../actions/communityPortal/EventActivityActions', () => ({
  fetchEventDetails: vi.fn(() => ({ type: 'TEST_FETCH_EVENTS' })),
  createEvent: vi.fn(),
}));

vi.mock('../EventsCalendar', () => ({
  EventsCalendar: ({ events, selectedDate }) => (
    <div data-testid="events-calendar">
      {selectedDate}:{events.map(event => event.title).join(',')}
    </div>
  ),
}));

const makeEvent = (index, date = '2026-11-05') => ({
  _id: `event-${index}`,
  title: `Event ${index}`,
  type: 'Workshop',
  location: 'Virtual',
  startTime: `${date}T10:00:00-05:00`,
  endTime: `${date}T11:00:00-05:00`,
  currentAttendees: index,
});

const renderCases = events => {
  const store = configureStore({
    reducer: {
      theme: () => ({ darkMode: false }),
      fetchEvent: () => ({ data: { events }, loading: false, error: null }),
    },
  });

  return render(
    <Provider store={store}>
      <MyCases />
    </Provider>,
  );
};

describe('MyCases event views', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-02T12:00:00-05:00'));
    localStorage.setItem('token', 'test-token');
  });

  afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  it('places More beside the heading and expands the same API events used by card and list views', () => {
    renderCases(Array.from({ length: 11 }, (_, index) => makeEvent(index + 1)));

    const headingControls = screen.getByRole('group', { name: 'Upcoming Events controls' });
    const moreButton = within(headingControls).getByRole('button', { name: 'More' });
    expect(screen.queryByText('Event 11')).not.toBeInTheDocument();

    fireEvent.click(moreButton);
    expect(screen.getByText('Event 11')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'List' }));
    expect(screen.getByText('Event 11')).toBeInTheDocument();
  });

  it('preserves a specific-day filter across Card, List, and Calendar views', () => {
    renderCases([makeEvent(1, '2026-11-05'), makeEvent(2, '2026-11-06')]);

    fireEvent.change(screen.getByLabelText('Filter upcoming events by date range'), {
      target: { value: 'Specific Date' },
    });
    fireEvent.change(screen.getByLabelText('Select a specific event date'), {
      target: { value: '2026-11-06' },
    });

    expect(screen.queryByText('Event 1')).not.toBeInTheDocument();
    expect(screen.getByText('Event 2')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'List' }));
    expect(screen.getByText('Event 2')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Calendar' }));
    expect(screen.getByTestId('events-calendar')).toHaveTextContent('2026-11-06:Event 2');
  });
});
