// eslint-disable-next-line no-unused-vars
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { useEffect, useRef, useState } from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import config from '../../../config.json';
import Timer from '../Timer';

// Minimal (unsigned, never verified - jwtDecode only reads the payload) JWT so
// Timer's reconnect-auth-check (isStoredTokenUsable) sees a usable token, using
// the same `expiryTimestamp` claim utils/authInit.js expects.
const base64url = obj =>
  btoa(JSON.stringify(obj))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
const makeFakeToken = expiryTimestamp =>
  `${base64url({ alg: 'none', typ: 'JWT' })}.${base64url({ expiryTimestamp })}.sig`;

// Shared, hoisted so the vi.mock factory below (which Vitest hoists above this
// file's imports) can read/write it, and the test body can push fake server
// messages through it.
const mocks = vi.hoisted(() => ({
  lastJsonMessage: null,
  setLastJsonMessage: null,
  // Latest options Timer.jsx passed to useWebSocket - lets tests fire onClose/
  // onError/onOpen directly, the same way a real socket event would.
  latestOptions: null,
  // How many of the next (re)connection attempts - including the very first
  // mount - should fail instead of succeeding. Decremented on each attempt.
  failNextAttempts: 0,
}));

// Timer.jsx talks to the backend only through react-use-websocket. Mocking it
// here lets us drive "server" messages and connection lifecycle events (open/
// close/error, reconnect attempts) directly, and assert on Timer's local state
// in isolation, without a real websocket/server.
// Named useMockWebSocket (not "default") so eslint's react-hooks/rules-of-hooks
// recognizes the useState/useEffect calls inside as belonging to a hook.
function useMockWebSocket(_url, options) {
  const [lastJsonMessage, setLastJsonMessage] = useState(mocks.lastJsonMessage);
  mocks.setLastJsonMessage = setLastJsonMessage;
  mocks.latestOptions = options;

  // Timer.jsx forces a fresh connection attempt by bumping wsKey, which flows in
  // here as queryParams.reconnect - mirrors the real library opening a new socket
  // whenever the computed URL changes.
  const reconnectToken = options.queryParams?.reconnect;
  const hasHandledTokenRef = useRef();

  useEffect(() => {
    if (hasHandledTokenRef.current === reconnectToken) return;
    hasHandledTokenRef.current = reconnectToken;

    if (mocks.failNextAttempts > 0) {
      mocks.failNextAttempts -= 1;
      options.onClose?.({ code: 1006, reason: 'mock failure' });
    } else {
      options.onOpen?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reconnectToken]);

  return {
    sendMessage: vi.fn(),
    sendJsonMessage: vi.fn(),
    lastJsonMessage,
    getWebSocket: () => ({ readyState: 1, close: vi.fn() }),
  };
}

vi.mock('react-use-websocket', async () => {
  const actual = await vi.importActual('react-use-websocket');
  return {
    ...actual,
    default: useMockWebSocket,
  };
});

// TimeEntryForm is the actual Log Time form - heavy (its own API calls, child
// modals, etc.) and not what these tests are about. Stubbing it lets us assert
// on exactly the one prop Timer.jsx got wrong: the `data` (hours/minutes) it
// prefills the form with.
vi.mock('../../Timelog/TimeEntryForm', () => ({
  // eslint-disable-next-line react/prop-types
  default: ({ data, isOpen }) =>
    isOpen ? <div data-testid="time-entry-form-data">{`${data.hours}:${data.minutes}`}</div> : null,
}));

const mockStore = configureMockStore([]);

const renderTimer = () => {
  const store = mockStore({
    auth: { user: { userid: 'user-1', role: 'Volunteer' } },
    userProfile: {},
  });

  // isPopout renders the Countdown (Start/Stop buttons) as soon as the socket
  // is "open", without needing to click through the header dropdown toggle first.
  return render(
    <Provider store={store}>
      <Timer isPopout darkMode={false} />
    </Provider>,
  );
};

let originalPlay;
let originalPause;

beforeAll(() => {
  // jsdom has no real <audio> playback; Timer plays a chime element on
  // mount/modal-open and this avoids noisy "not implemented" errors.
  originalPlay = window.HTMLMediaElement.prototype.play;
  originalPause = window.HTMLMediaElement.prototype.pause;
  window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
  window.HTMLMediaElement.prototype.pause = vi.fn();
});

afterAll(() => {
  window.HTMLMediaElement.prototype.play = originalPlay;
  window.HTMLMediaElement.prototype.pause = originalPause;
});

beforeEach(() => {
  mocks.lastJsonMessage = null;
  mocks.setLastJsonMessage = null;
  mocks.latestOptions = null;
  mocks.failNextAttempts = 0;
  localStorage.setItem(
    config.tokenKey,
    makeFakeToken(new Date(Date.now() + 86400000).toISOString()),
  );
});

afterEach(() => {
  localStorage.clear();
});

describe('Timer handleStartButton', () => {
  it('does not trigger the time-over modal when starting a fresh 1-minute timer', async () => {
    renderTimer();

    const oneMinute = 60000;

    // Simulate the GET_TIMER response the server sends for a timer that was
    // just set to a 1-minute goal via the pencil/edit-goal control but has
    // never been started this session. startAt is deliberately stale (the
    // server only refreshes it on an actual START_TIMER) - this is the exact
    // shape that used to trip the bug.
    act(() => {
      mocks.setLastJsonMessage({
        started: false,
        paused: false,
        chiming: false,
        forcedPause: false,
        weekEndPause: false,
        time: oneMinute,
        goal: oneMinute,
        initialGoal: oneMinute,
        startAt: Date.now() - 60 * 60 * 1000, // 1 hour stale
      });
    });

    const startButton = await screen.findByLabelText('Start timer');
    fireEvent.click(startButton);

    expect(screen.queryByText('Time Complete!')).not.toBeInTheDocument();
  });
});

describe('Timer Log Time form after a reload', () => {
  it('prefills the Log Time form with the real elapsed time, not 0:0, after a reload', async () => {
    renderTimer();

    const oneMinute = 60000;

    // Simulate the GET_TIMER response after a page reload for a 1-minute timer
    // that already ran out and auto-paused itself (started stays true - only an
    // explicit Stop/Clear sets it false - but paused is true and time is 0).
    // This is bug #6's exact repro: run a 1-min timer out, close the Time
    // Complete popup, refresh, then click Log Time.
    act(() => {
      mocks.setLastJsonMessage({
        started: true,
        paused: true,
        chiming: true,
        forcedPause: false,
        weekEndPause: false,
        time: 0,
        goal: oneMinute,
        initialGoal: oneMinute,
        startAt: null,
      });
    });

    const stopButton = await screen.findByLabelText('Stop timer and log timer');
    fireEvent.click(stopButton);

    const formData = await screen.findByTestId('time-entry-form-data');
    expect(formData).toHaveTextContent('0:1');
  });
});

// Pushes a GET_TIMER-shaped message for a timer that is actively running
// (started, not paused) with the given goal, nothing elapsed yet.
const pushRunningMessage = goal => {
  act(() => {
    mocks.setLastJsonMessage({
      started: true,
      paused: false,
      chiming: false,
      forcedPause: false,
      weekEndPause: false,
      time: goal,
      goal,
      initialGoal: goal,
      startAt: Date.now(),
    });
  });
};

describe('Timer connection loss and recovery', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('stops the local countdown immediately on a dropped connection, so it cannot hit 0 and fire Time Complete on its own', () => {
    renderTimer();
    pushRunningMessage(2000); // 2-second goal

    expect(screen.getByLabelText('Stop timer and log timer')).toBeInTheDocument();

    // Simulate the connection dropping (sleep, wifi drop, server restart, etc.).
    act(() => {
      mocks.latestOptions.onClose({ code: 1006, reason: 'mock drop' });
    });

    // Immediately: UI should reflect "not connected", not the normal running
    // countdown (checked before auto-reconnect's first attempt has a chance to
    // fire and resync, so this specifically proves the *local* response to the
    // drop, not just that a later resync happened to fix things up).
    expect(screen.queryByLabelText('Stop timer and log timer')).not.toBeInTheDocument();

    // If the countdown had kept running locally, 5 real seconds would be enough
    // for a 2-second goal to hit 0 and pop "Time Complete!". It shouldn't, because
    // running was forced false the moment the connection was lost.
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.queryByText('Time Complete!')).not.toBeInTheDocument();
  });

  it('shows "Reconnecting..." (not "Disconnected") while retrying, and recovers on its own once reconnected, with no manual click', () => {
    renderTimer();
    pushRunningMessage(60000);

    act(() => {
      mocks.latestOptions.onClose({ code: 1006, reason: 'mock drop' });
    });

    expect(screen.getByText('Reconnecting...')).toBeInTheDocument();
    expect(screen.queryByText('Disconnected')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Reload timer')).not.toBeInTheDocument();

    // First backoff step (1s) - mock succeeds (failNextAttempts defaults to 0).
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.queryByText('Reconnecting...')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Stop timer and log timer')).toBeInTheDocument();
  });

  it('does not chime after reconnecting if the server says the timer was already stopped elsewhere', () => {
    renderTimer();
    pushRunningMessage(60000);

    act(() => {
      mocks.latestOptions.onClose({ code: 1006, reason: 'mock drop' });
    });
    act(() => {
      vi.advanceTimersByTime(1000); // first retry succeeds
    });

    // The reconnect resync (sendGetTimer) comes back showing it was already
    // stopped/logged in another tab while this one was down.
    act(() => {
      mocks.setLastJsonMessage({
        started: false,
        paused: false,
        chiming: false,
        forcedPause: false,
        weekEndPause: false,
        time: 60000,
        goal: 60000,
        initialGoal: 60000,
        startAt: null,
      });
    });

    expect(screen.queryByText('Timer Paused')).not.toBeInTheDocument();
  });

  it('chimes after reconnecting if the server confirms a genuine forced pause', () => {
    renderTimer();
    pushRunningMessage(60000);

    act(() => {
      mocks.latestOptions.onClose({ code: 1006, reason: 'mock drop' });
    });
    act(() => {
      vi.advanceTimersByTime(1000); // first retry succeeds
    });

    // The server's own liveness check caught a real dead connection while this
    // was the only tab, and already marked it forced-paused.
    act(() => {
      mocks.setLastJsonMessage({
        started: true,
        paused: true,
        chiming: false,
        forcedPause: true,
        weekEndPause: false,
        time: 45000,
        goal: 60000,
        initialGoal: 60000,
        startAt: null,
      });
    });

    expect(screen.getByText('Timer Paused')).toBeInTheDocument();
  });

  it('stops retrying and shows Disconnected + a manual refresh button once the stored token is unusable', () => {
    localStorage.removeItem(config.tokenKey); // simulate an expired/cleared token

    renderTimer();
    pushRunningMessage(60000);

    act(() => {
      mocks.latestOptions.onClose({ code: 1006, reason: 'mock drop' });
    });

    // No retry gets scheduled at all - exhausted immediately.
    expect(screen.getByText('Disconnected')).toBeInTheDocument();
    expect(screen.getByLabelText('Reload timer')).toBeInTheDocument();
  });

  it('keeps retrying every 30s indefinitely (never shows Disconnected) as long as the token stays valid', () => {
    // A real backend restart/deploy can easily take longer than a short fixed
    // attempt ladder - this test runs well past where the old 6-attempt/~61s
    // ladder used to give up, with every single attempt still failing
    // (failNextAttempts stays ahead of however many retries fire).
    mocks.failNextAttempts = 20;

    renderTimer();
    pushRunningMessage(60000);

    act(() => {
      mocks.latestOptions.onClose({ code: 1006, reason: 'mock drop' });
    });

    // ~6.5 minutes: backoff ramps 1s/2s/4s/8s/16s then every 30s after -
    // roughly 17 failed attempts fit in this window, far beyond the old cap.
    act(() => {
      vi.advanceTimersByTime(400000);
    });

    expect(screen.getByText('Reconnecting...')).toBeInTheDocument();
    expect(screen.queryByText('Disconnected')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Reload timer')).not.toBeInTheDocument();
  });

  it('reconnects on an online event once exhausted, if the token has since become usable again', () => {
    localStorage.removeItem(config.tokenKey); // simulate an expired/cleared token

    renderTimer();
    pushRunningMessage(60000);

    act(() => {
      mocks.latestOptions.onClose({ code: 1006, reason: 'mock drop' });
    });

    expect(screen.getByText('Disconnected')).toBeInTheDocument();

    // Token becomes usable again (e.g. refreshed in another tab) before the
    // browser reports we're back online - should no longer be stuck.
    localStorage.setItem(
      config.tokenKey,
      makeFakeToken(new Date(Date.now() + 86400000).toISOString()),
    );

    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(screen.queryByText('Disconnected')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Stop timer and log timer')).toBeInTheDocument();
  });

  it('eventually stops the countdown via the heartbeat-miss path when pongs stop arriving', () => {
    renderTimer();
    // Goal must outlast the ~250s heartbeat-miss window, otherwise the countdown
    // would legitimately reach 0 on its own well before heartbeat-miss matters.
    pushRunningMessage(3600000); // 1 hour

    expect(screen.getByLabelText('Stop timer and log timer')).toBeInTheDocument();

    // 4 heartbeat cycles (60s interval + 10s miss-check each) with no pong ever
    // arriving - the same background-tab-throttling scenario that used to chime
    // hours later based on a stale assumption. Stop just past the 4th miss-check
    // (4*60000 + 10000 = 250000ms) but before the first reconnect retry (+1000ms)
    // fires, so this specifically catches the moment disconnection is detected.
    act(() => {
      vi.advanceTimersByTime(250100);
    });

    expect(screen.queryByText('Time Complete!')).not.toBeInTheDocument();
    expect(screen.getByText('Reconnecting...')).toBeInTheDocument();
  });

  it('preserves the real accumulated goal through a manual reload instead of wiping it to the 15-minute default - covers "after 5 hours it says Disconnected, refresh resets ... and the time is lost"', () => {
    localStorage.removeItem(config.tokenKey); // simulate an expired token
    renderTimer();

    const longGoal = 4.5 * 60 * 60 * 1000; // a long accumulated session/goal
    pushRunningMessage(longGoal);
    expect(screen.getByText('Goal: 04:30:00')).toBeInTheDocument();

    // Connection drops with a bad token - exhausted immediately, shows Disconnected.
    act(() => {
      mocks.latestOptions.onClose({ code: 1006, reason: 'mock drop' });
    });
    expect(screen.getByText('Disconnected')).toBeInTheDocument();

    // The user actually logs back in (token becomes usable again) before clicking
    // the manual "Reload timer" button.
    localStorage.setItem(
      config.tokenKey,
      makeFakeToken(new Date(Date.now() + 86400000).toISOString()),
    );

    fireEvent.click(screen.getByLabelText('Reload timer'));

    // The mock socket auto-opens (failNextAttempts is 0), but no fresh GET_TIMER
    // response has arrived yet - this is exactly the moment the old code wiped
    // message to the 15-minute default (would show "Goal: 00:15:00" here). The
    // real goal must still be showing; only a genuine GET_TIMER reply should ever
    // change it.
    expect(screen.queryByText('Disconnected')).not.toBeInTheDocument();
    expect(screen.getByText('Goal: 04:30:00')).toBeInTheDocument();

    // The real GET_TIMER resync now arrives (the server's own state was never at
    // risk - only the client's display was) and the Log Time form reflects the
    // true accumulated time, same as the already-fixed "0:0 after a reload" bug.
    act(() => {
      mocks.setLastJsonMessage({
        started: true,
        paused: true,
        chiming: false,
        forcedPause: true,
        weekEndPause: false,
        time: 30 * 60 * 1000, // 30 minutes left of the 4.5h goal
        goal: longGoal,
        initialGoal: longGoal,
        startAt: null,
      });
    });

    fireEvent.click(screen.getByLabelText('Stop timer and log timer'));
    // 4 hours logged (>= 2) shows a "long session" confirmation modal first.
    fireEvent.click(screen.getByRole('button', { name: /yes, submit/i }));

    const formData = screen.getByTestId('time-entry-form-data');
    expect(formData).toHaveTextContent('4:0'); // 4.5h goal - 30min left = 4h worked
  });
});
