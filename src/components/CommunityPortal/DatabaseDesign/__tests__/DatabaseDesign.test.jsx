import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import DatabaseDesign from '../DatabaseDesign';
import styles from '../DatabaseDesign.module.css';
import { getEvents, getEventLocations, getEventTypes } from '~/actions/eventActions';
import { toast } from 'react-toastify';

vi.mock('~/actions/eventActions', () => ({
  getEvents: vi.fn(),
  getEventTypes: vi.fn(),
  getEventLocations: vi.fn(),
  joinWaitlist: vi.fn(),
  leaveWaitlist: vi.fn(),
}));

vi.mock('react-toastify', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() },
}));

const mockStore = configureMockStore([]);
const virtualEvent = {
  id: 1,
  title: 'Virtual Workshop',
  type: 'Workshop',
  location: 'Virtual',
  time: '10:00 AM',
  date: new Date(2025, 0, 27),
  status: 'New',
  description: 'A virtual workshop.',
};
const inPersonEvent = {
  id: 2,
  title: 'Office Meeting',
  type: 'Meeting',
  location: 'Office',
  format: 'In person',
  time: '2:00 PM',
  date: new Date(2025, 0, 28),
  status: 'Need attendees',
  maxAttendees: 20,
  currentAttendees: 5,
};

function renderPage({ darkMode = false, history = createMemoryHistory() } = {}) {
  const store = mockStore({ theme: { darkMode }, userProfile: {} });
  const view = render(
    <Provider store={store}>
      <Router history={history}>
        <DatabaseDesign />
      </Router>
    </Provider>,
  );
  return { ...view, history };
}

async function waitForEvents() {
  await screen.findByText('Virtual Workshop');
}

async function renderLoadedPage(options) {
  const view = renderPage(options);
  await waitForEvents();
  return view;
}

async function expectOnlyEvent(visibleTitle, hiddenTitle) {
  expect(await screen.findByText(visibleTitle)).toBeInTheDocument();
  await waitFor(() => expect(screen.queryByText(hiddenTitle)).not.toBeInTheDocument());
}

describe('DatabaseDesign', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getEventTypes.mockResolvedValue({
      data: { types: ['Workshop', 'Meeting', 'Webinar', 'Social Gathering'] },
    });
    getEventLocations.mockResolvedValue({ data: { locations: ['Virtual', 'Office'] } });
    getEvents.mockResolvedValue({ data: { events: [virtualEvent, inPersonEvent] } });
  });

  it('shows an initial loading state before event data arrives', async () => {
    let resolveEvents;
    getEvents.mockReturnValue(
      new Promise(resolve => {
        resolveEvents = resolve;
      }),
    );
    renderPage();

    expect(screen.getByText('Loading events...')).toBeInTheDocument();
    await act(async () => resolveEvents({ data: { events: [virtualEvent, inPersonEvent] } }));
    await waitForEvents();
  });

  it('keeps the attendance and report actions visible when capacity is not part of the event schema', async () => {
    await renderLoadedPage();

    expect(screen.getAllByRole('button', { name: 'Confirm Attendance' })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: 'Log Activity' })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: 'Reports' })).toHaveLength(2);
  });

  it('falls back to built-in filter options when option endpoints fail', async () => {
    getEventTypes.mockRejectedValue(new Error('Types unavailable'));
    getEventLocations.mockRejectedValue(new Error('Locations unavailable'));
    await renderLoadedPage();
    expect(screen.getByRole('option', { name: 'Social Gathering' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Webinar' })).toBeInTheDocument();
    expect(screen.getAllByRole('option', { name: 'In person' })).toHaveLength(2);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('filters accurately by type, location, format, and their combination', async () => {
    await renderLoadedPage();

    fireEvent.change(screen.getByLabelText('Event Type'), { target: { value: 'Workshop' } });
    await expectOnlyEvent('Virtual Workshop', 'Office Meeting');

    fireEvent.change(screen.getByLabelText('Event Type'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Location'), { target: { value: 'Office' } });
    await expectOnlyEvent('Office Meeting', 'Virtual Workshop');

    fireEvent.change(screen.getByLabelText('Location'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Format'), { target: { value: 'Virtual' } });
    await expectOnlyEvent('Virtual Workshop', 'Office Meeting');

    fireEvent.change(screen.getByLabelText('Event Type'), { target: { value: 'Meeting' } });
    fireEvent.change(screen.getByLabelText('Location'), { target: { value: 'Office' } });
    fireEvent.change(screen.getByLabelText('Format'), { target: { value: 'In person' } });
    await expectOnlyEvent('Office Meeting', 'Virtual Workshop');

    fireEvent.change(screen.getByLabelText('Event Type'), { target: { value: 'Workshop' } });
    expect(await screen.findByText('No events found matching your filters.')).toBeInTheDocument();
    expect(screen.getByText('Showing 0 events')).toBeInTheDocument();
  });

  it('shows a retryable event fetch error and reloads successfully', async () => {
    getEvents
      .mockResolvedValueOnce({ status: 500, message: 'Events unavailable' })
      .mockResolvedValueOnce({ data: { events: [virtualEvent, inPersonEvent] } });
    renderPage();

    expect(await screen.findByText(/Error: Events unavailable/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await waitForEvents();
    expect(getEvents).toHaveBeenCalledTimes(2);
  });

  it('renders page sections and event details with dark mode styles', async () => {
    await renderLoadedPage({ darkMode: true });

    expect(screen.getByRole('main')).toHaveClass(styles.darkMode);
    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(screen.getByLabelText('Event Type')).toHaveClass(styles.filterSelect);
    expect(screen.getByText('Virtual Event')).toHaveClass(styles.formatBadge);
    expect(screen.getByText('New')).toHaveClass(styles.statusBadge, styles.statusNew);
    expect(screen.getByText('Virtual Event')).toBeInTheDocument();
    expect(screen.getByText('In-Person Event')).toBeInTheDocument();
  });

  it.each([
    ['Confirm Attendance', { destination: '/communityportal/Activities/Register/1' }],
    ['Log Activity', { destination: '/communityportal/ActivityAttendance' }],
    ['Reports', { destination: '/communityportal/reports/participation' }],
    ['Confirm Attendance', { error: 'Failed to navigate to attendance confirmation' }],
    ['Log Activity', { error: 'Failed to navigate to activity logging' }],
    ['Reports', { error: 'Failed to navigate to reports' }],
  ])('handles the %s action', async (label, expectation) => {
    const { history } = await renderLoadedPage();

    if (expectation.error) {
      vi.spyOn(history, 'push').mockImplementation(() => {
        throw new Error('Navigation failed');
      });
    }

    fireEvent.click(screen.getAllByRole('button', { name: label })[0]);

    if (expectation.error) {
      expect(await screen.findByRole('alert')).toHaveTextContent(expectation.error);
      expect(toast.error).toHaveBeenCalledWith(expectation.error);
      return;
    }

    expect(history.location.pathname).toBe(expectation.destination);
  });
});
