import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Timer from '../Timer';

const { sendJsonMessage } = vi.hoisted(() => ({ sendJsonMessage: vi.fn() }));

vi.mock('react-redux', () => ({
  connect: () => Component => Component,
  useDispatch: () => vi.fn(),
}));

vi.mock('react-use-websocket', async () => {
  const { useEffect } = await import('react');
  const message = {
    time: 1800000,
    goal: 3600000,
    started: true,
    paused: true,
    forcedPause: false,
    chiming: false,
    startAt: Date.now(),
  };
  const useMockWebSocket = (_url, options) => {
    useEffect(() => {
      options.onOpen();
    }, []);
    return {
      sendMessage: vi.fn(),
      sendJsonMessage,
      lastJsonMessage: message,
      getWebSocket: () => ({ readyState: 1, close: vi.fn() }),
    };
  };
  return {
    ReadyState: { CONNECTING: 0, OPEN: 1, CLOSED: 3 },
    default: useMockWebSocket,
  };
});

vi.mock('../TimerPopout', () => ({ default: () => <div>Popout control</div> }));
vi.mock('../../Timelog/TimeEntryForm', () => ({
  default: () => <div>Time entry form</div>,
}));

describe('Timer controls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
    vi.spyOn(window, 'focus').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('preserves timer actions and opens the time entry form', async () => {
    render(
      <MemoryRouter>
        <Timer authUser={{ userid: 'user-123', role: 'Owner' }} darkMode={false} />
      </MemoryRouter>,
    );

    await screen.findByRole('button', { name: 'Start timer' });
    expect(screen.getByText('Popout control')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Add 15min' }));
    fireEvent.click(screen.getByRole('button', { name: 'Subtract 15min' }));
    fireEvent.click(screen.getByRole('button', { name: 'Start timer' }));
    expect(screen.getByRole('button', { name: 'Pause timer' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Pause timer' }));
    fireEvent.click(screen.getByRole('button', { name: 'Stop timer and log time' }));

    expect(await screen.findByText('Time entry form')).toBeInTheDocument();
    expect(sendJsonMessage).toHaveBeenCalledWith({ action: 'ADD_TO_GOAL', value: 900000 }, false);
    expect(sendJsonMessage).toHaveBeenCalledWith(
      { action: 'REMOVE_FROM_GOAL', value: 900000 },
      false,
    );
    expect(sendJsonMessage).toHaveBeenCalledWith({ action: 'START_TIMER' }, false);
    expect(sendJsonMessage).toHaveBeenCalledWith({ action: 'PAUSE_TIMER' }, false);
    expect(sendJsonMessage).not.toHaveBeenCalledWith(
      expect.objectContaining({ action: 'STOP_TIMER' }),
      false,
    );
  });
});
