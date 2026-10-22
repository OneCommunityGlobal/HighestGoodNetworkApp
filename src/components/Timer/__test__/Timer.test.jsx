// eslint-disable-next-line no-unused-vars
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import Timer from '../Timer';

// Shared, hoisted so the vi.mock factory below (which Vitest hoists above this
// file's imports) can read/write it, and the test body can push fake server
// messages through it.
const mocks = vi.hoisted(() => ({
  lastJsonMessage: null,
  setLastJsonMessage: null,
}));

// Timer.jsx talks to the backend only through react-use-websocket. Mocking it
// here lets us drive "server" messages directly and assert on Timer's local
// (optimistic) state updates in isolation, without a real websocket/server.
// Named useMockWebSocket (not "default") so eslint's react-hooks/rules-of-hooks
// recognizes the useState/useEffect calls inside as belonging to a hook.
function useMockWebSocket(_url, options) {
  const [lastJsonMessage, setLastJsonMessage] = useState(mocks.lastJsonMessage);
  mocks.setLastJsonMessage = setLastJsonMessage;

  useEffect(() => {
    options.onOpen?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

describe('Timer handleStartButton', () => {
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
  });

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
