import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MyCases from '../MyCases';

const { getEventsMock } = vi.hoisted(() => ({
  getEventsMock: vi.fn(),
}));

vi.mock('../../../../../actions/eventActions', () => ({
  getEvents: getEventsMock,
}));

vi.mock('../CreateEventModal', () => ({
  default: () => null,
}));

vi.mock('react-calendar', () => ({
  default: ({ value }) => (
    <div data-testid="events-calendar">{value.toLocaleDateString('en-US')}</div>
  ),
}));

const makeEvent = (index, date = '2026-11-05', endDate = date) => ({
  _id: `event-${index}`,
  title: `Event ${index}`,
  type: 'Workshop',
  location: 'Virtual',
  date: `${date}T10:00:00`,
  startTime: `${date}T10:00:00`,
  endTime: `${endDate}T11:00:00`,
  currentAttendees: index,
});

const renderCases = events => {
  getEventsMock.mockResolvedValue({ status: 200, data: { events } });
  const store = configureStore({
    reducer: {
      theme: () => ({ darkMode: false }),
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
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date(2026, 10, 2, 12));
  });

  afterEach(() => {
    getEventsMock.mockReset();
    vi.useRealTimers();
  });

  it('places More beside the heading and expands the same API events in card and list views', async () => {
    renderCases(Array.from({ length: 11 }, (_, index) => makeEvent(index + 1)));

    await screen.findByText('Event 1');
    expect(getEventsMock).toHaveBeenCalledWith({
      limit: null,
      sortBy: 'date',
      sortOrder: 'desc',
    });
    const headingControls = screen.getByRole('group', { name: 'Upcoming Events controls' });
    const moreButton = within(headingControls).getByRole('button', { name: 'More' });
    expect(screen.queryByText('Event 11')).not.toBeInTheDocument();

    fireEvent.click(moreButton);
    expect(screen.getByText('Event 11')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'List' }));
    expect(screen.getByText('Event 11')).toBeInTheDocument();
  });

  it('keeps a specific-day filter consistent across Card, List, and Calendar views', async () => {
    renderCases([
      makeEvent(1, '2026-11-05'),
      makeEvent(2, '2026-11-06'),
      makeEvent(3, '2026-11-05', '2026-11-07'),
    ]);
    await screen.findByText('Event 1');

    fireEvent.change(screen.getByLabelText('Filter upcoming events by date range'), {
      target: { value: 'Specific Date' },
    });
    fireEvent.change(screen.getByLabelText('Select a specific event date'), {
      target: { value: '2026-11-06' },
    });

    await waitFor(() => {
      expect(screen.queryByText('Event 1')).not.toBeInTheDocument();
      expect(screen.getByText('Event 2')).toBeInTheDocument();
      expect(screen.getByText('Event 3')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'List' }));
    expect(screen.getByText('Event 2')).toBeInTheDocument();
    expect(screen.getByText('Event 3')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Calendar' }));
    expect(screen.getByTestId('events-calendar')).toHaveTextContent('11/6/2026');
    expect(screen.getByText('Events on November 6, 2026')).toBeInTheDocument();
    expect(screen.getByText('Event 2')).toBeInTheDocument();
    expect(screen.getByText('Event 3')).toBeInTheDocument();
  });
});
