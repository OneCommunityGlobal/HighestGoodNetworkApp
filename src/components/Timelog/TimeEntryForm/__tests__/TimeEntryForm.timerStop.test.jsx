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

// URL -> response data, checked in order (first match wins) - same responses as
// the other TimeEntryForm test suites' axios mock, just expressed as a lookup
// table instead of a repeated if/else chain.
const AXIOS_GET_RESPONSES = [
  [/\/userProjects/, () => userProjectMock.projects],
  [/\/tasks/, () => []],
  [/\/userProfile/, () => userProfileMock],
];
vi.mock('axios', async () => {
  const actual = await vi.importActual('axios');
  return {
    __esModule: true,
    ...actual,
    get: vi.fn(url => {
      const match = AXIOS_GET_RESPONSES.find(([pattern]) => pattern.test(url));
      return Promise.resolve({ data: match ? match[1]() : [] });
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
    // paused + time:0 + goal:6180000ms (1h43m) matches baseData's hours/minutes, so
    // the authoritative-elapsed computation agrees with the stale form value by
    // default - tests that care about a MISMATCH override this explicitly.
    sendGetTimerAndConfirm = vi.fn(async () => {
      callOrder.push('resync');
      return { started: true, paused: true, time: 0, goal: 6180000, startAt: null };
    });
    sendStop = vi.fn(async () => {
      callOrder.push('stop');
      return true;
    });
    postTimeEntry.mockImplementation((...args) => () => {
      callOrder.push('save');
      return Promise.resolve(200);
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
    expect(toggle).toHaveBeenCalled(); // the modal actually closes, not just clears its fields
  });

  it('saves the server-authoritative elapsed time, not the possibly-stale local form value', async () => {
    // Form/local countdown stale at 1h43m (baseData), but the server's resync says
    // 2h30m was really worked (e.g. the tab was backgrounded/throttled and its own
    // countdown lagged behind) - the save must use the authoritative 2h30m.
    sendGetTimerAndConfirm.mockImplementation(async () => {
      callOrder.push('resync');
      return { started: true, paused: true, time: 0, goal: 2.5 * 60 * 60 * 1000, startAt: null };
    });
    let savedPayload = null;
    postTimeEntry.mockImplementation((payload) => () => {
      callOrder.push('save');
      savedPayload = payload;
      return Promise.resolve(200);
    });

    renderForm();
    await clickSubmit();

    await waitFor(() => expect(postTimeEntry).toHaveBeenCalled());
    expect(savedPayload.hours).toBe(2);
    expect(savedPayload.minutes).toBe(30);
    expect(onTimeSubmitted).toHaveBeenCalledWith(
      expect.objectContaining({ hours: 2, minutes: 30 }),
    );
  });

  it('computes elapsed from a still-actively-running resync (not paused) using startAt, not just the stale time field', async () => {
    const startAt = Date.now() - 45 * 60 * 1000; // 45 minutes ago
    sendGetTimerAndConfirm.mockImplementation(async () => {
      callOrder.push('resync');
      // goal 1h, time is the full goal (never recomputed while running - matches the
      // real server's addGoal/startTimer behavior), still actively running.
      return { started: true, paused: false, time: 60 * 60 * 1000, goal: 60 * 60 * 1000, startAt };
    });
    let savedPayload = null;
    postTimeEntry.mockImplementation((payload) => () => {
      callOrder.push('save');
      savedPayload = payload;
      return Promise.resolve(200);
    });

    renderForm();
    await clickSubmit();

    await waitFor(() => expect(postTimeEntry).toHaveBeenCalled());
    expect(savedPayload.hours).toBe(0);
    expect(savedPayload.minutes).toBe(45);
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

  it('a resync that times out (null, not an explicit "stopped") still proceeds to stop and save - does not hang the timer running with the form stuck open', async () => {
    // Reproduces the real bug: sendGetTimerAndConfirm() resolves null whenever the
    // response never arrives in time (e.g. backend not yet updated to echo requestId
    // for GET_TIMER) - that used to be treated the same as an explicit "already
    // stopped elsewhere" and aborted before sendStop() was ever called, leaving the
    // timer visibly running and the Log Time form open indefinitely.
    sendGetTimerAndConfirm.mockImplementation(async () => {
      callOrder.push('resync-timeout');
      return null;
    });
    renderForm();
    await clickSubmit();

    await waitFor(() => expect(postTimeEntry).toHaveBeenCalled());
    expect(sendStop).toHaveBeenCalled();
    expect(callOrder).toEqual(['resync-timeout', 'stop', 'save']);
    expect(onTimeSubmitted).toHaveBeenCalled();
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

  it('treats a resolved postTimeEntry carrying an HTTP error status as a failed save, not a success', async () => {
    // postTimeEntry's real action never throws on an HTTP error - it catches it and
    // resolves with the response status instead (see actions/timeEntries.js). A save that
    // resolves with 500 must still be treated as failed, not fall through to the success path.
    postTimeEntry.mockImplementation(() => () => {
      callOrder.push('save');
      return Promise.resolve(500);
    });
    renderForm();
    await clickSubmit();

    await waitFor(() => expect(postTimeEntry).toHaveBeenCalled());
    expect(onTimeSubmitted).not.toHaveBeenCalled();
    expect(toggle).not.toHaveBeenCalled(); // form stays open - the save didn't actually succeed
  });

  it('retries only the save (not GET_TIMER/STOP_TIMER) after a confirmed stop whose save failed, so the worked time is not discarded on retry', async () => {
    // Reproduces the reviewer's repro on #5788: a fake server that remembers its state.
    // sendStop really stops the session server-side on the first attempt; if the retry
    // re-ran GET_TIMER, it would read back started:false and be mistaken for "stopped
    // elsewhere", discarding the time that only failed to save.
    let started = true;
    sendGetTimerAndConfirm.mockImplementation(async () => {
      callOrder.push('resync');
      return { started, paused: true, time: 0, goal: 6180000, startAt: null };
    });
    sendStop.mockImplementation(async () => {
      callOrder.push('stop');
      started = false;
      return true;
    });
    let saveAttempts = 0;
    postTimeEntry.mockImplementation(() => () => {
      callOrder.push('save');
      saveAttempts += 1;
      return saveAttempts === 1 ? Promise.reject(new Error('network error')) : Promise.resolve(200);
    });

    renderForm();
    await clickSubmit();
    await waitFor(() => expect(postTimeEntry).toHaveBeenCalledTimes(1));
    expect(toggle).not.toHaveBeenCalled(); // first save failed - form stays open for retry

    await clickSubmit();
    await waitFor(() => expect(postTimeEntry).toHaveBeenCalledTimes(2));
    expect(sendGetTimerAndConfirm).toHaveBeenCalledTimes(1); // not re-run on retry
    expect(sendStop).toHaveBeenCalledTimes(1); // not re-run on retry
    expect(onTimeSubmitted).toHaveBeenCalled(); // retry's save succeeded
    expect(toggle).toHaveBeenCalled(); // form finally closes
  });
});
