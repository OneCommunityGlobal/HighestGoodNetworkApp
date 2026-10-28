import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import {
  authMock,
  userProfileMock,
  timeEntryMock,
  userProjectMock,
  rolesMock,
} from '../../../../__tests__/mockStates';
import { renderWithProvider } from '../../../../__tests__/utils';
import TimeEntryForm from '../TimeEntryForm';

// These tests cover the "double logging" fix: a Timer-sourced submission must stop the
// timer (server-confirmed) BEFORE saving the entry, not after - and a stale GET_TIMER
// resync must block saving time that was already logged/stopped elsewhere. The call
// order below is the thing under test, not the full form-filling UX (already covered
// by TimeEntryForm.test.jsx) - so `data` is pre-filled with everything validateForm needs.
vi.mock('../../../../actions/timeEntries', async () => {
  const actual = await vi.importActual('../../../../actions/timeEntries');
  return {
    __esModule: true,
    ...actual,
    postTimeEntry: vi.fn(() => () => Promise.resolve()),
  };
});

const { postTimeEntry } = await import('../../../../actions/timeEntries');

vi.mock('axios', async () => {
  const actual = await vi.importActual('axios');
  return {
    __esModule: true,
    ...actual,
    get: vi.fn(url => {
      if (url.includes('/userProjects')) {
        return Promise.resolve({ data: userProjectMock.projects });
      }
      if (url.includes('/tasks')) {
        return Promise.resolve({ data: [] });
      }
      if (url.includes('/userProfile')) {
        return Promise.resolve({ data: userProfileMock });
      }
      return Promise.resolve({ data: [] });
    }),
  };
});

const mockStore = configureMockStore([thunk]);

describe('<TimeEntryForm from="Timer"/> stop-before-save ordering', () => {
  const baseData = { ...timeEntryMock.weeks[0][0], hours: '1', minutes: '43' };
  let store;
  let toggle;
  let sendStop;
  let sendGetTimerAndConfirm;
  let onTimeSubmitted;
  let callOrder;

  beforeEach(() => {
    vi.clearAllMocks();
    callOrder = [];
    toggle = vi.fn();
    onTimeSubmitted = vi.fn();
    sendGetTimerAndConfirm = vi.fn(async () => {
      callOrder.push('resync');
      return { started: true };
    });
    sendStop = vi.fn(async () => {
      callOrder.push('stop');
      return true;
    });
    postTimeEntry.mockImplementation((...args) => () => {
      callOrder.push('save');
      return Promise.resolve();
    });
    store = mockStore({
      auth: authMock,
      userProjects: {
        ...userProjectMock,
        projects: Array.isArray(userProjectMock.projects) ? userProjectMock.projects : [],
      },
      userProfile: userProfileMock,
      role: rolesMock,
      theme: { darkMode: false },
    });
    store.dispatch = vi.fn((action) => (typeof action === 'function' ? action(store.dispatch, store.getState) : action));
  });

  const renderForm = (overrides = {}) =>
    renderWithProvider(
      <TimeEntryForm
        from="Timer"
        edit={false}
        data={baseData}
        toggle={toggle}
        isOpen
        timerConnected
        sendStop={sendStop}
        sendGetTimerAndConfirm={sendGetTimerAndConfirm}
        onTimeSubmitted={onTimeSubmitted}
        sessionId="session-1"
        {...overrides}
      />,
      { store },
    );

  const clickSubmit = async () => {
    const submit = await screen.findByRole('button', { name: /^submit$/i });
    await userEvent.click(submit);
  };

  it('happy path: stops the timer BEFORE saving, then notifies and closes the form', async () => {
    renderForm();
    await clickSubmit();

    await waitFor(() => expect(postTimeEntry).toHaveBeenCalled());
    expect(sendGetTimerAndConfirm).toHaveBeenCalled();
    expect(sendStop).toHaveBeenCalled();
    expect(callOrder).toEqual(['resync', 'stop', 'save']);
    expect(onTimeSubmitted).toHaveBeenCalled();
  });

  it('a stale tab whose resync shows the session already stopped does NOT save', async () => {
    sendGetTimerAndConfirm.mockImplementation(async () => {
      callOrder.push('resync');
      return { started: false };
    });
    renderForm();
    await clickSubmit();

    await waitFor(() => expect(sendGetTimerAndConfirm).toHaveBeenCalled());
    expect(sendStop).not.toHaveBeenCalled();
    expect(postTimeEntry).not.toHaveBeenCalled();
    expect(onTimeSubmitted).not.toHaveBeenCalled();
  });

  it('a failed stop confirmation does NOT save, and keeps the form open for retry', async () => {
    sendStop.mockImplementation(async () => {
      callOrder.push('stop');
      return false;
    });
    renderForm();
    await clickSubmit();

    await waitFor(() => expect(sendStop).toHaveBeenCalled());
    expect(postTimeEntry).not.toHaveBeenCalled();
    expect(onTimeSubmitted).not.toHaveBeenCalled();
    expect(toggle).not.toHaveBeenCalled(); // form stays open, not closed
  });

  it('if saving fails after a confirmed stop, the timer is not stopped twice and the form stays open', async () => {
    postTimeEntry.mockImplementation(() => () => {
      callOrder.push('save');
      return Promise.reject(new Error('network error'));
    });
    renderForm();
    await clickSubmit();

    await waitFor(() => expect(postTimeEntry).toHaveBeenCalled());
    expect(sendStop).toHaveBeenCalledTimes(1); // stop was attempted exactly once
    expect(callOrder).toEqual(['resync', 'stop', 'save']);
    expect(onTimeSubmitted).not.toHaveBeenCalled();
    expect(toggle).not.toHaveBeenCalled(); // form stays open, not closed - hours/minutes intact
  });
});
