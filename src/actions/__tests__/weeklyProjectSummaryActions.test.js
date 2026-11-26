import { describe, it, expect, vi, beforeEach } from 'vitest';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import axios from 'axios';
import {
  fetchWeeklyProjectSummaryProjectStatus,
} from '../bmdashboard/weeklyProjectSummaryActions';
import {
  FETCH_WEEKLY_PROJECT_SUMMARY_PROJECT_STATUS_BEGIN,
  FETCH_WEEKLY_PROJECT_SUMMARY_PROJECT_STATUS_ERROR,
  FETCH_WEEKLY_PROJECT_SUMMARY_PROJECT_STATUS_SUCCESS,
} from '../../constants/bmdashboard/weeklyProjectSummaryConstants';

vi.mock('axios');

const mockStore = configureMockStore([thunk]);

const createDeferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, resolve, reject };
};

describe('weeklyProjectSummaryActions Project Status requests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('dispatches unique request metadata for rapid Project Status requests', async () => {
    const firstRequest = createDeferred();
    const secondRequest = createDeferred();
    axios.get.mockReturnValueOnce(firstRequest.promise).mockReturnValueOnce(secondRequest.promise);
    const store = mockStore({});

    const firstDispatch = store.dispatch(
      fetchWeeklyProjectSummaryProjectStatus({
        startDate: '2026-09-13',
        endDate: '2026-09-19',
        projectId: '',
        comparisonStartDate: null,
        comparisonEndDate: undefined,
      }),
    );
    const secondDispatch = store.dispatch(
      fetchWeeklyProjectSummaryProjectStatus({
        startDate: '2026-09-20',
        endDate: '2026-09-26',
      }),
    );

    const [firstBegin, secondBegin] = store.getActions();
    expect(firstBegin.type).toBe(FETCH_WEEKLY_PROJECT_SUMMARY_PROJECT_STATUS_BEGIN);
    expect(secondBegin.type).toBe(FETCH_WEEKLY_PROJECT_SUMMARY_PROJECT_STATUS_BEGIN);
    expect(firstBegin.meta.requestId).not.toBe(secondBegin.meta.requestId);
    expect(firstBegin.meta.requestKey).toBe('endDate=2026-09-19&startDate=2026-09-13');
    expect(secondBegin.meta.requestKey).toBe('endDate=2026-09-26&startDate=2026-09-20');

    secondRequest.resolve({ data: { current: { metrics: { totalProjects: { value: 2 } } } } });
    await secondDispatch;
    firstRequest.resolve({ data: { current: { metrics: { totalProjects: { value: 1 } } } } });
    await firstDispatch;

    const successActions = store
      .getActions()
      .filter(action => action.type === FETCH_WEEKLY_PROJECT_SUMMARY_PROJECT_STATUS_SUCCESS);
    expect(successActions).toHaveLength(2);
    expect(successActions[0].meta.requestId).toBe(secondBegin.meta.requestId);
    expect(successActions[1].meta.requestId).toBe(firstBegin.meta.requestId);
  });

  it('dispatches the active request metadata on Project Status failure', async () => {
    const error = new Error('network failure');
    axios.get.mockRejectedValue(error);
    const store = mockStore({});

    const result = await store.dispatch(
      fetchWeeklyProjectSummaryProjectStatus({
        startDate: '2026-09-13',
        endDate: '2026-09-19',
      }),
    );

    const [beginAction, errorAction] = store.getActions();
    expect(result).toBeNull();
    expect(errorAction).toMatchObject({
      type: FETCH_WEEKLY_PROJECT_SUMMARY_PROJECT_STATUS_ERROR,
      payload: error,
      meta: beginAction.meta,
    });
  });
});
