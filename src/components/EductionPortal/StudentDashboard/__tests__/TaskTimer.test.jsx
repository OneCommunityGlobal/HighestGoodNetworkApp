import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import httpService from '~/services/httpService';
import { ENDPOINTS } from '~/utils/URL';
import TaskTimer from '../TaskTimer';

vi.mock('~/services/httpService');

const mockStore = configureStore([thunk]);

// Real student tasks carry a genuine MongoDB ObjectId (the API sets both `id`
// and `_id` to task._id); demo/fallback tasks carry sequential numeric ids.
const REAL_TASK_ID = '65cf6c3706d8ac105827bb2e';
const COMPLETED_TASK_ID = '65cf6c3706d8ac105827bb2f';
const GRADED_TASK_ID = '65cf6c3706d8ac105827bb30';

const tasks = [
  { id: REAL_TASK_ID, title: 'Algebra Homework', status: 'assigned' },
  { id: COMPLETED_TASK_ID, title: 'Finished Course', status: 'completed' },
];

// Mirrors mockTasks from the demo fallback: numeric `id` wins over `_id`, so
// the id the timer would submit is not a valid ObjectId.
const demoTasks = [
  { id: 1, _id: '507f1f77bcf86cd799439011', course_name: 'Mathematics', status: 'assigned' },
];

const baseState = {
  theme: { darkMode: false },
};

const renderTimer = (props = {}) => {
  const store = mockStore(baseState);
  return {
    store,
    ...render(
      <Provider store={store}>
        <TaskTimer tasks={tasks} {...props} />
      </Provider>,
    ),
  };
};

beforeEach(() => {
  vi.clearAllMocks();
  // Mount-time status recovery: default to "no session in progress".
  httpService.get.mockResolvedValue({ data: { data: { status: 'idle' } } });
});

describe('TaskTimer task eligibility', () => {
  it('offers a real task whose id is a valid ObjectId, and it can be selected', () => {
    renderTimer();
    fireEvent.click(screen.getAllByRole('button')[0]);
    const dialog = screen.getByRole('dialog');

    expect(within(dialog).getByText('Algebra Homework')).toBeInTheDocument();

    const select = within(dialog).getByLabelText('Task');
    fireEvent.change(select, { target: { value: REAL_TASK_ID } });

    expect(select.value).toBe(REAL_TASK_ID);
    expect(within(dialog).getByLabelText('Start')).not.toBeDisabled();
  });

  it('does not offer a demo/fallback task whose effective id is not a valid ObjectId', () => {
    renderTimer({ tasks: demoTasks });
    fireEvent.click(screen.getAllByRole('button')[0]);
    const dialog = screen.getByRole('dialog');

    // The demo "Mathematics" task must never be startable, even though it
    // carries a valid-looking _id, because id:1 is what would be submitted.
    expect(within(dialog).queryByText('Mathematics')).not.toBeInTheDocument();
    expect(within(dialog).queryByLabelText('Task', { selector: 'select' })).not.toBeInTheDocument();
  });

  it('keeps Start disabled when there are no valid timer tasks', () => {
    renderTimer({ tasks: demoTasks });
    fireEvent.click(screen.getAllByRole('button')[0]);
    const dialog = screen.getByRole('dialog');

    expect(within(dialog).getByLabelText('Start')).toBeDisabled();
  });

  it('shows a clear empty state and sends no Start request when there are no valid tasks', () => {
    renderTimer({ tasks: [] });
    fireEvent.click(screen.getAllByRole('button')[0]);
    const dialog = screen.getByRole('dialog');

    expect(within(dialog).getByText(/No assigned tasks available/i)).toBeInTheDocument();

    fireEvent.click(within(dialog).getByLabelText('Start'));
    expect(httpService.post).not.toHaveBeenCalled();
  });

  it('still filters out completed and graded tasks that do have valid ObjectIds', () => {
    renderTimer({
      tasks: [
        { id: REAL_TASK_ID, title: 'Algebra Homework', status: 'assigned' },
        { id: COMPLETED_TASK_ID, title: 'Finished Course', status: 'completed' },
        { id: GRADED_TASK_ID, title: 'Graded Course', status: 'graded' },
      ],
    });
    fireEvent.click(screen.getAllByRole('button')[0]);
    const dialog = screen.getByRole('dialog');

    expect(within(dialog).getByText('Algebra Homework')).toBeInTheDocument();
    expect(within(dialog).queryByText('Finished Course')).not.toBeInTheDocument();
    expect(within(dialog).queryByText('Graded Course')).not.toBeInTheDocument();
  });

  it('keeps popup behaviour intact when the task list is empty', () => {
    renderTimer({ tasks: [] });
    fireEvent.click(screen.getAllByRole('button')[0]);

    // Opens, stays open on an inside click, and the close controls still work.
    expect(screen.getByText('Timer')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Timer'));
    expect(screen.getByText('Timer')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Close timer'));
    expect(screen.queryByText('Timer')).not.toBeInTheDocument();
  });
});

describe('TaskTimer', () => {
  it('opens the popup on demand and lists only non-completed tasks', () => {
    renderTimer();
    expect(screen.queryByText('Timer')).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button')[0]);

    expect(screen.getByText('Timer')).toBeInTheDocument();
    expect(screen.getByText('Algebra Homework')).toBeInTheDocument();
    expect(screen.queryByText('Finished Course')).not.toBeInTheDocument();
  });

  it('disables Start until a task is selected, and enables it once one is', () => {
    renderTimer();
    fireEvent.click(screen.getAllByRole('button')[0]);
    const dialog = screen.getByRole('dialog');

    const startBtn = within(dialog).getByLabelText('Start');
    expect(startBtn).toBeDisabled();

    fireEvent.change(within(dialog).getByLabelText('Task'), { target: { value: REAL_TASK_ID } });
    expect(startBtn).not.toBeDisabled();

    expect(screen.queryByText('Finished Course')).not.toBeInTheDocument();
  });

  it('sends a valid 0-59 minutes payload with taskId on Start (regression for the total-minutes bug)', async () => {
    httpService.post.mockResolvedValueOnce({
      data: {
        data: { status: 'running', durationMs: 7200000, elapsedMs: 0, remainingMs: 7200000 },
      },
    });

    renderTimer();
    fireEvent.click(screen.getAllByRole('button')[0]);
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Task'), { target: { value: REAL_TASK_ID } });
    fireEvent.click(within(dialog).getByLabelText('Start'));

    await waitFor(() => expect(httpService.post).toHaveBeenCalledTimes(1));

    const [url, body] = httpService.post.mock.calls[0];
    expect(url).toBe(ENDPOINTS.STUDENT_TIMER_START);
    expect(body.taskId).toBe(REAL_TASK_ID);
    expect(body.minutes).toBeGreaterThanOrEqual(0);
    expect(body.minutes).toBeLessThanOrEqual(59);
    expect(body.hours).toBe(2);
    expect(body.minutes).toBe(0);
  });

  it('Stop calls only the timer stop endpoint and makes no separate Daily Log POST', async () => {
    const thirtyOneMinutesMs = 31 * 60 * 1000;
    httpService.post
      .mockResolvedValueOnce({
        data: { data: { status: 'running', durationMs: 7200000, elapsedMs: 0 } },
      })
      .mockResolvedValueOnce({
        data: {
          data: {
            status: 'stopped',
            durationMs: 7200000,
            elapsedMs: thirtyOneMinutesMs,
            sessionStartedAt: '2026-01-01T10:00:00.000Z',
            endedAt: '2026-01-01T10:31:00.000Z',
            activityLogId: 'log-abc',
          },
        },
      });

    renderTimer();
    fireEvent.click(screen.getAllByRole('button')[0]);
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Task'), { target: { value: REAL_TASK_ID } });
    fireEvent.click(within(dialog).getByLabelText('Start'));
    await waitFor(() => expect(httpService.post).toHaveBeenCalledTimes(1));

    fireEvent.click(within(dialog).getByLabelText('Stop'));
    await waitFor(() => expect(httpService.post).toHaveBeenCalledTimes(2));

    // Exactly two calls total: start and stop. No client-authored Daily Log write.
    expect(httpService.post).toHaveBeenCalledTimes(2);
    expect(httpService.post.mock.calls[1][0]).toBe(ENDPOINTS.STUDENT_TIMER_STOP);

    const postedUrls = httpService.post.mock.calls.map(([url]) => url);
    expect(postedUrls.some(url => String(url).includes('daily-log'))).toBe(false);

    // The client sends no duration/timestamp/task metadata on stop.
    const stopBody = httpService.post.mock.calls[1][1];
    expect(stopBody).toEqual({});
  });

  it('returns the UI to idle on a successful Stop that the server confirmed logging for', async () => {
    httpService.post
      .mockResolvedValueOnce({
        data: { data: { status: 'running', durationMs: 7200000, elapsedMs: 0 } },
      })
      .mockResolvedValueOnce({
        data: {
          data: {
            status: 'stopped',
            durationMs: 7200000,
            elapsedMs: 61 * 60 * 1000,
            activityLogId: 'log-xyz',
          },
        },
      });

    renderTimer();
    fireEvent.click(screen.getAllByRole('button')[0]);
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Task'), { target: { value: REAL_TASK_ID } });
    fireEvent.click(within(dialog).getByLabelText('Start'));
    await waitFor(() => expect(httpService.post).toHaveBeenCalledTimes(1));

    fireEvent.click(within(dialog).getByLabelText('Stop'));
    await waitFor(() => expect(httpService.post).toHaveBeenCalledTimes(2));

    // Back to idle: the Start control (idle-only) is present again.
    expect(await within(dialog).findByLabelText('Start')).toBeInTheDocument();
  });

  it('does not claim a successful stop when the server did not persist the activity record', async () => {
    httpService.post
      .mockResolvedValueOnce({
        data: { data: { status: 'running', durationMs: 7200000, elapsedMs: 0 } },
      })
      .mockResolvedValueOnce({
        data: {
          data: {
            status: 'stopped',
            durationMs: 7200000,
            elapsedMs: 31 * 60 * 1000,
            activityLogId: null,
          },
        },
      });

    renderTimer();
    fireEvent.click(screen.getAllByRole('button')[0]);
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Task'), { target: { value: REAL_TASK_ID } });
    fireEvent.click(within(dialog).getByLabelText('Start'));
    await waitFor(() => expect(httpService.post).toHaveBeenCalledTimes(1));

    fireEvent.click(within(dialog).getByLabelText('Stop'));

    expect(
      await within(dialog).findByText(
        'Timer stopped, but the session could not be saved to the Daily Log.',
      ),
    ).toBeInTheDocument();
  });

  it('accepts a zero-duration stop without requiring an activity log', async () => {
    httpService.post
      .mockResolvedValueOnce({
        data: { data: { status: 'running', durationMs: 7200000, elapsedMs: 0 } },
      })
      .mockResolvedValueOnce({
        data: {
          data: { status: 'stopped', durationMs: 7200000, elapsedMs: 0, activityLogId: null },
        },
      });

    renderTimer();
    fireEvent.click(screen.getAllByRole('button')[0]);
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Task'), { target: { value: REAL_TASK_ID } });
    fireEvent.click(within(dialog).getByLabelText('Start'));
    await waitFor(() => expect(httpService.post).toHaveBeenCalledTimes(1));

    fireEvent.click(within(dialog).getByLabelText('Stop'));
    await waitFor(() => expect(httpService.post).toHaveBeenCalledTimes(2));

    // No log required for a zero-length session, and no false error shown.
    expect(
      within(dialog).queryByText(
        'Timer stopped, but the session could not be saved to the Daily Log.',
      ),
    ).not.toBeInTheDocument();
  });

  it('sends only one stop request when Stop is double-clicked', async () => {
    let resolveStop;
    httpService.post
      .mockResolvedValueOnce({
        data: { data: { status: 'running', durationMs: 7200000, elapsedMs: 0 } },
      })
      .mockImplementationOnce(
        () =>
          new Promise(resolve => {
            resolveStop = resolve;
          }),
      );

    renderTimer();
    fireEvent.click(screen.getAllByRole('button')[0]);
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Task'), { target: { value: REAL_TASK_ID } });
    fireEvent.click(within(dialog).getByLabelText('Start'));
    await waitFor(() => expect(httpService.post).toHaveBeenCalledTimes(1));

    fireEvent.click(within(dialog).getByLabelText('Stop'));
    fireEvent.click(within(dialog).getByLabelText('Stop'));

    // start + a single stop, despite two clicks.
    expect(httpService.post).toHaveBeenCalledTimes(2);

    resolveStop({
      data: {
        data: { status: 'stopped', durationMs: 7200000, elapsedMs: 1000, activityLogId: 'log-1' },
      },
    });
    await waitFor(() => expect(httpService.post).toHaveBeenCalledTimes(2));
  });

  it('settles to idle when Stop returns 409 because the session was already stopped', async () => {
    httpService.post
      .mockResolvedValueOnce({
        data: { data: { status: 'running', durationMs: 7200000, elapsedMs: 0 } },
      })
      .mockRejectedValueOnce({
        response: { status: 409, data: { error: 'No active timer' } },
      });

    renderTimer();
    fireEvent.click(screen.getAllByRole('button')[0]);
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Task'), { target: { value: REAL_TASK_ID } });
    fireEvent.click(within(dialog).getByLabelText('Start'));
    await waitFor(() => expect(httpService.post).toHaveBeenCalledTimes(1));

    fireEvent.click(within(dialog).getByLabelText('Stop'));

    // No stale running state left on screen.
    expect(await within(dialog).findByLabelText('Start')).toBeInTheDocument();
  });

  it('asks for confirmation before resetting a running timer with meaningful elapsed time', async () => {
    httpService.post.mockResolvedValueOnce({
      data: {
        data: { status: 'running', durationMs: 7200000, elapsedMs: 120000, remainingMs: 7080000 },
      },
    });
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    renderTimer();
    fireEvent.click(screen.getAllByRole('button')[0]);
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Task'), { target: { value: REAL_TASK_ID } });
    fireEvent.click(within(dialog).getByLabelText('Start'));
    await waitFor(() => expect(httpService.post).toHaveBeenCalledTimes(1));

    fireEvent.click(within(dialog).getByLabelText('Reset'));

    expect(confirmSpy).toHaveBeenCalled();
    expect(httpService.post).toHaveBeenCalledTimes(1);
  });

  it('closing via backdrop click works, but clicking inside the dialog does not close it', () => {
    renderTimer();
    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(screen.getByText('Timer')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Timer'));
    expect(screen.getByText('Timer')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Close timer'));
    expect(screen.queryByText('Timer')).not.toBeInTheDocument();
  });

  it('shows an overtime indicator once elapsed passes the countdown target, and keeps the clock at 00:00:00', async () => {
    // 1-minute target, 2m15s actually elapsed → Overtime +00:01:15
    httpService.post.mockResolvedValueOnce({
      data: {
        data: {
          status: 'running',
          durationMs: 60 * 1000,
          elapsedMs: 135 * 1000,
          overtimeMs: 75 * 1000,
          isOvertime: true,
        },
      },
    });

    renderTimer();
    fireEvent.click(screen.getAllByRole('button')[0]);
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Task'), { target: { value: REAL_TASK_ID } });
    fireEvent.click(within(dialog).getByLabelText('Start'));

    await waitFor(() => expect(within(dialog).getByText('Overtime +00:01:15')).toBeInTheDocument());
    // Countdown is floored at zero rather than going negative.
    expect(within(dialog).getByText('00:00:00')).toBeInTheDocument();
  });

  it('keeps overtime visible and accurate for a 1-minute target worked 31 minutes, then stops cleanly', async () => {
    const thirtyOneMinutesMs = 31 * 60 * 1000;
    httpService.post
      .mockResolvedValueOnce({
        data: {
          data: {
            status: 'running',
            durationMs: 60 * 1000,
            elapsedMs: thirtyOneMinutesMs,
            overtimeMs: thirtyOneMinutesMs - 60 * 1000,
            isOvertime: true,
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: {
            status: 'stopped',
            durationMs: 60 * 1000,
            elapsedMs: thirtyOneMinutesMs,
            activityLogId: 'log-overtime',
          },
        },
      });

    renderTimer();
    fireEvent.click(screen.getAllByRole('button')[0]);
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Task'), { target: { value: REAL_TASK_ID } });
    fireEvent.click(within(dialog).getByLabelText('Start'));

    // 31 min elapsed against a 1 min target => 30 min of overtime displayed.
    expect(await within(dialog).findByText('Overtime +00:30:00')).toBeInTheDocument();
    expect(within(dialog).getByText('00:00:00')).toBeInTheDocument();

    fireEvent.click(within(dialog).getByLabelText('Stop'));
    await waitFor(() => expect(httpService.post).toHaveBeenCalledTimes(2));

    // The exact duration is derived and persisted server-side; the client sends
    // no duration of its own.
    expect(httpService.post.mock.calls[1][1]).toEqual({});
    expect(await within(dialog).findByLabelText('Start')).toBeInTheDocument();
  });

  it('recovers a running overtime session from the server after a refresh', async () => {
    httpService.get.mockResolvedValue({
      data: {
        data: {
          status: 'running',
          durationMs: 60 * 1000,
          elapsedMs: 200 * 1000,
          overtimeMs: 140 * 1000,
          isOvertime: true,
          taskId: REAL_TASK_ID,
        },
      },
    });

    renderTimer();

    await waitFor(() => expect(httpService.get).toHaveBeenCalledTimes(1));
    expect(httpService.get.mock.calls[0][0]).toBe(ENDPOINTS.STUDENT_TIMER_STATUS);

    // Overtime restored from the recovered session (200s - 60s = 140s).
    expect(await screen.findByText('Overtime +00:02:20')).toBeInTheDocument();
  });

  it('surfaces a visible error instead of failing silently when Start is rejected', async () => {
    httpService.post.mockRejectedValueOnce({
      response: { data: { error: 'minutes must be between 0 and 59' } },
    });

    renderTimer();
    fireEvent.click(screen.getAllByRole('button')[0]);
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Task'), { target: { value: REAL_TASK_ID } });
    fireEvent.click(within(dialog).getByLabelText('Start'));

    await waitFor(() =>
      expect(within(dialog).getByText('minutes must be between 0 and 59')).toBeInTheDocument(),
    );
  });
});
