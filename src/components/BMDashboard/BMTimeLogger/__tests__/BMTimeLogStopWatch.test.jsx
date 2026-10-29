import { Provider } from 'react-redux';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import { render, screen, fireEvent, act } from '@testing-library/react';
import axios from 'axios';
import BMTimeLogStopWatch from '../BMTimeLogStopWatch';
import { bmTimeLoggerReducer } from '../../../../reducers/bmdashboard/timeLoggerReducer';
import { errorsReducer } from '../../../../reducers/errorsReducer';
import { getCurrentTimeLog } from '../../../../actions/bmdashboard/timeLoggerActions';
import { START_TIME_LOG } from '../../../../constants/bmdashboard/timeLoggerConstants';

vi.mock('axios');
const now = new Date('2026-10-27T17:00:00Z').getTime();
const ongoing = {
  _id: 'log',
  status: 'ongoing',
  totalElapsedTime: 60000,
  createdAt: new Date(now - 120000).toISOString(),
  updatedAt: new Date(now - 30000).toISOString(),
  task: 'Build',
};
const makeStore = () =>
  createStore(
    combineReducers({
      bmTimeLogger: bmTimeLoggerReducer,
      errors: errorsReducer,
    }),
    applyMiddleware(thunk),
  );
const mountTimer = async (store = makeStore()) => {
  const view = visible => (
    <Provider store={store}>
      <BMTimeLogStopWatch projectId="project" memberId="member" isVisible={visible} />
    </Provider>
  );
  const utils = render(view(true));
  await act(async () => {
    await Promise.resolve();
  });
  return { ...utils, store, view };
};

describe('BM stopwatch lifecycle', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('restores the GET wrapper and accounts for hidden time without hidden intervals or timer operations', async () => {
    axios.get.mockResolvedValue({ data: [ongoing] });
    const { rerender, view, unmount } = await mountTimer();
    expect(screen.getByText('00:01:30')).toBeInTheDocument();
    expect(vi.getTimerCount()).toBe(1);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText('00:01:35')).toBeInTheDocument();
    rerender(view(false));
    expect(vi.getTimerCount()).toBe(0);
    act(() => {
      vi.advanceTimersByTime(60000);
    });
    rerender(view(true));
    expect(screen.getByText('00:02:35')).toBeInTheDocument();
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('restores an ongoing timer after unmounting, including logs started before today', async () => {
    const log = { ...ongoing, createdAt: new Date(now - 86400000).toISOString() };
    axios.get.mockResolvedValue({ data: [log] });
    const first = await mountTimer();
    first.unmount();
    act(() => {
      vi.advanceTimersByTime(20000);
    });
    const second = await mountTimer(first.store);
    expect(screen.getByText('00:01:50')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'PAUSE' })).not.toBeDisabled();
    expect(vi.getTimerCount()).toBe(1);
    second.unmount();
    expect(vi.getTimerCount()).toBe(0);
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('restores paused time, resumes from server timestamps, and prevents duplicate operations', async () => {
    const paused = { ...ongoing, status: 'paused', totalElapsedTime: 45000 };
    axios.get.mockResolvedValue({ data: [paused] });
    const { unmount } = await mountTimer();
    expect(screen.getByText('00:00:45')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(20000);
    });
    expect(screen.getByText('00:00:45')).toBeInTheDocument();
    expect(vi.getTimerCount()).toBe(0);
    let resolve;
    axios.post.mockReturnValueOnce(
      new Promise(done => {
        resolve = done;
      }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'START' }));
    expect(screen.getByRole('button', { name: 'START' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'START' }));
    expect(axios.post).toHaveBeenCalledTimes(1);
    await act(async () => {
      resolve({
        data: {
          timeLog: {
            ...paused,
            status: 'ongoing',
            currentIntervalStarted: new Date(Date.now() - 3000).toISOString(),
          },
        },
      });
    });
    expect(screen.getByText('00:00:48')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByText('00:00:50')).toBeInTheDocument();
    axios.post.mockResolvedValueOnce({ data: { timeLog: { ...paused, totalElapsedTime: 51000 } } });
    fireEvent.click(screen.getByRole('button', { name: 'PAUSE' }));
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByText('00:00:51')).toBeInTheDocument();
    expect(axios.post.mock.calls[1][0]).toContain('/pause');
    expect(vi.getTimerCount()).toBe(0);
    unmount();
  });

  it('preserves stopwatch CLEAR as a STOP operation and retains the final display', async () => {
    axios.get.mockResolvedValue({ data: [ongoing] });
    const { unmount } = await mountTimer();
    axios.post.mockResolvedValueOnce({ data: { timeLog: { ...ongoing, status: 'completed' } } });
    fireEvent.click(screen.getByRole('button', { name: 'CLEAR' }));
    await act(async () => {
      await Promise.resolve();
    });
    expect(axios.post.mock.calls[0][0]).toContain('/stop');
    expect(screen.getByText('00:01:30')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'START' })).not.toBeDisabled();
    unmount();
  });

  it('keeps failed starts stopped instead of leaving an optimistic running display', async () => {
    axios.get.mockResolvedValue({ data: [] });
    await mountTimer();
    axios.post.mockRejectedValueOnce(new Error('Offline'));
    fireEvent.click(screen.getByRole('button', { name: 'START' }));
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByText('00:00:00')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'START' })).not.toBeDisabled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('ignores a stale restoration GET after a newer timer operation updates Redux', async () => {
    const store = makeStore();
    let resolve;
    axios.get.mockReturnValueOnce(
      new Promise(done => {
        resolve = done;
      }),
    );
    const restoring = store.dispatch(getCurrentTimeLog('project', 'member'));
    const newer = { ...ongoing, projectId: 'project', memberId: 'member' };
    store.dispatch({ type: START_TIME_LOG, payload: newer });
    resolve({ data: [] });
    await restoring;
    expect(store.getState().bmTimeLogger.bmTimeLogs.member_project).toBe(newer);
  });
});
