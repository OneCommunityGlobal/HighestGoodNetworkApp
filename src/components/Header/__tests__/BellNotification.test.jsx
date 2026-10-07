import { vi } from 'vitest';
import React from 'react';

vi.mock('axios');

vi.mock('../../../utils/messagingSocket', () => ({
  getMessagingSocket: () => ({ addEventListener: vi.fn(), removeEventListener: vi.fn() }),
}));

vi.mock('../../../actions/lbdashboard/messagingActions', () => ({
  clearNotifications: () => ({ type: 'CLEAR_NOTIFICATIONS' }),
  clearDBNotifications: () => ({ type: 'CLEAR_DB_NOTIFICATIONS' }),
}));

import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import axios from 'axios';
import BellNotification from '../BellNotification';

const mockStore = configureMockStore([thunk]);
const USER_ID = 'u1';

// Current PT week: Sun 2026-10-04 07:00Z -> Sun 2026-10-11 07:00Z
const AT_50H_LEFT = '2026-10-09T05:00:00.000Z';
const AT_48H_LEFT = '2026-10-09T07:00:00.000Z';
const AT_36H_LEFT = '2026-10-09T19:00:00.123Z';
const AT_24H_LEFT = '2026-10-10T07:00:00.000Z';
const NEXT_WEEK_MONDAY = '2026-10-12T19:00:00.000Z';

const task = (hoursLogged, overrides = {}) => ({
  _id: 't1',
  taskName: 'Bell Test 1',
  estimatedHours: 10,
  hoursLogged,
  resources: [],
  ...overrides,
});

let api;

function mockApi({
  committed = 10,
  entries = [],
  tasks = [],
  dbNotifications = [],
} = {}) {
  api = { committed, entries, tasks, dbNotifications };
  axios.get.mockImplementation(url => {
    if (url.includes('/userprofile/')) {
      return Promise.resolve({ data: { weeklycommittedHours: api.committed } });
    }
    if (url.includes('/TimeEntry/user/')) return Promise.resolve({ data: api.entries });
    if (url.includes('/tasks/user/')) return Promise.resolve({ data: api.tasks });
    if (url.includes('/notification/unread/user/')) {
      return Promise.resolve({ data: api.dbNotifications });
    }
    return Promise.resolve({ data: [] });
  });
  axios.post.mockResolvedValue({ data: {} });
}

function renderBell(stateOverrides = {}, props = {}) {
  const store = mockStore({
    theme: { darkMode: false },
    messages: { notifications: [] },
    // Shared slices that may hold ANOTHER user's data; the bell must not use them
    timeEntries: { weeks: { 0: [{ hours: 99, minutes: 0, isTangible: true }] } },
    userProfile: { weeklycommittedHours: 999 },
    userTask: [task(9, { _id: 'other', taskName: 'Someone else task' })],
    ...stateOverrides,
  });
  return render(
    <Provider store={store}>
      <BellNotification userId={USER_ID} {...props} />
    </Provider>,
  );
}

const bell = () => screen.getByRole('button', { name: /notifications/i });

async function openPanel() {
  await waitFor(() => expect(bell()).toBeInTheDocument());
  fireEvent.click(bell());
}

async function renderAt(iso, stateOverrides, props) {
  window.__BELL_TEST_NOW = iso;
  const utils = renderBell(stateOverrides, props);
  // let profile / entries / tasks fetches resolve
  await waitFor(() => expect(axios.get).toHaveBeenCalled());
  await waitFor(() => expect(bell()).toBeInTheDocument());
  return utils;
}

describe('BellNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    delete window.__BELL_TEST_NOW;
  });

  describe('hours alerts (48h / 24h)', () => {
    it('does not alert more than 48h before the PT week ends', async () => {
      mockApi({ entries: [{ hours: 2, minutes: 0, isTangible: true }] });
      await renderAt(AT_50H_LEFT);
      await openPanel();
      expect(screen.queryByText(/Hours Reminder/)).not.toBeInTheDocument();
    });

    it("alerts at 48h left using the bell user's own tangible hours only", async () => {
      mockApi({
        committed: 10,
        entries: [
          { hours: 3, minutes: 0, isTangible: true },
          { hours: 20, minutes: 0, isTangible: false },
        ],
      });
      await renderAt(AT_48H_LEFT);
      await openPanel();
      expect(await screen.findByText(/Hours Reminder/)).toBeInTheDocument();
      expect(screen.getByText(/completed 3 hours out of the 10 hours/)).toBeInTheDocument();
    });

    it('keeps a dismissed 48h alert dismissed after a reload in the same week', async () => {
      mockApi({ entries: [{ hours: 2, minutes: 0, isTangible: true }] });
      const { unmount } = await renderAt(AT_48H_LEFT);
      await openPanel();
      fireEvent.click(await screen.findByRole('button', { name: 'Mark as read' }));
      unmount();

      // "reload" later in the same week, with different milliseconds
      await renderAt(AT_36H_LEFT);
      await openPanel();
      expect(screen.queryByText(/Hours Reminder/)).not.toBeInTheDocument();
    });

    it('re-notifies at 24h left if hours are still not met', async () => {
      mockApi({ entries: [{ hours: 2, minutes: 0, isTangible: true }] });
      const { unmount } = await renderAt(AT_48H_LEFT);
      await openPanel();
      fireEvent.click(await screen.findByRole('button', { name: 'Mark as read' }));
      unmount();

      await renderAt(AT_24H_LEFT);
      await openPanel();
      expect(await screen.findByText(/Hours Reminder/)).toBeInTheDocument();
    });

    it('does not alert once committed hours are met', async () => {
      mockApi({ committed: 10, entries: [{ hours: 10, minutes: 0, isTangible: true }] });
      await renderAt(AT_24H_LEFT);
      await openPanel();
      expect(screen.queryByText(/Hours Reminder/)).not.toBeInTheDocument();
    });

    it('does not alert before its own data has loaded', async () => {
      axios.get.mockImplementation(() => new Promise(() => {}));
      await renderAt(AT_24H_LEFT);
      await openPanel();
      expect(screen.queryByText(/Hours Reminder/)).not.toBeInTheDocument();
    });
  });

  describe('task progress alerts', () => {
    it("shows the 50% alert for the bell user's own task, not tasks from Redux", async () => {
      mockApi({ tasks: [task(5)] });
      await renderAt(AT_50H_LEFT);
      await openPanel();
      expect(await screen.findByText(/Task Progress Alerts/)).toBeInTheDocument();
      expect(screen.getAllByText('Bell Test 1').length).toBeGreaterThan(0);
      expect(screen.queryByText(/Someone else task/)).not.toBeInTheDocument();
    });

    it('does not alert for tasks below 50% or at 100%', async () => {
      mockApi({ tasks: [task(4), task(10, { _id: 't2' })] });
      await renderAt(AT_50H_LEFT);
      await openPanel();
      expect(screen.queryByText(/Task Progress Alerts/)).not.toBeInTheDocument();
    });

    it('does not carry an unread alert into next week without progress', async () => {
      mockApi({ tasks: [task(5)] });
      const { unmount } = await renderAt(AT_50H_LEFT);
      unmount();

      await renderAt(NEXT_WEEK_MONDAY);
      await openPanel();
      expect(screen.queryByText(/Task Progress Alerts/)).not.toBeInTheDocument();
    });

    it('alerts next week when the task reaches a higher level', async () => {
      mockApi({ tasks: [task(5)] });
      const { unmount } = await renderAt(AT_50H_LEFT);
      unmount();

      api.tasks = [task(7.5)];
      await renderAt(NEXT_WEEK_MONDAY);
      await openPanel();
      expect(await screen.findByText(/Task Progress Alerts/)).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('"Mark all as read" hides task alerts but keeps message notifications', async () => {
      mockApi({ tasks: [task(5)], dbNotifications: [{ _id: 'n1', message: 'Hello there' }] });
      await renderAt(AT_50H_LEFT);
      await openPanel();
      fireEvent.click(await screen.findByRole('button', { name: 'Mark all as read' }));

      await openPanel();
      expect(screen.queryByText(/Task Progress Alerts/)).not.toBeInTheDocument();
      expect(screen.getByText('Hello there')).toBeInTheDocument();
    });
  });

  describe('dev time travel and storage', () => {
    it('window.__setBellNow switches the time without a reload', async () => {
      mockApi({ entries: [{ hours: 2, minutes: 0, isTangible: true }] });
      await renderAt(AT_50H_LEFT);
      await openPanel();
      expect(screen.queryByText(/Hours Reminder/)).not.toBeInTheDocument();

      await act(async () => {
        window.__setBellNow(AT_24H_LEFT);
      });
      expect(await screen.findByText(/Hours Reminder/)).toBeInTheDocument();
    });

    it('does not write undefined:: keys when userId is missing', async () => {
      mockApi();
      window.__BELL_TEST_NOW = AT_50H_LEFT;
      renderBell({}, { userId: undefined });
      await waitFor(() => expect(bell()).toBeInTheDocument());
      expect(axios.get).not.toHaveBeenCalledWith(expect.stringContaining('undefined'));
      const keys = Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i));
      expect(keys.some(k => k.startsWith('undefined::'))).toBe(false);
    });
  });
});
