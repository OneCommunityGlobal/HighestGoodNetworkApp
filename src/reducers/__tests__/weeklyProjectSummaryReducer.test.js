import { weeklyProjectSummaryReducer } from '../bmdashboard/weeklyProjectSummaryReducer';
import {
  FETCH_WEEKLY_PROJECT_SUMMARY_PROJECT_STATUS_BEGIN,
  FETCH_WEEKLY_PROJECT_SUMMARY_PROJECT_STATUS_ERROR,
  FETCH_WEEKLY_PROJECT_SUMMARY_PROJECT_STATUS_SUCCESS,
} from '../../constants/bmdashboard/weeklyProjectSummaryConstants';

const requestA = { requestId: 'request-a', requestKey: 'startDate=2026-09-01' };
const requestB = { requestId: 'request-b', requestKey: 'startDate=2026-10-01' };
const requestC = { requestId: 'request-c', requestKey: 'startDate=2026-11-01' };
const beginAction = meta => ({
  type: FETCH_WEEKLY_PROJECT_SUMMARY_PROJECT_STATUS_BEGIN,
  meta,
});
const successAction = (meta, value) => ({
  type: FETCH_WEEKLY_PROJECT_SUMMARY_PROJECT_STATUS_SUCCESS,
  payload: { current: { metrics: { totalProjects: { value } } } },
  meta,
});
const errorAction = (meta, message = 'request failed') => ({
  type: FETCH_WEEKLY_PROJECT_SUMMARY_PROJECT_STATUS_ERROR,
  payload: new Error(message),
  meta,
});
const createLoadingLatestState = () =>
  weeklyProjectSummaryReducer(
    weeklyProjectSummaryReducer(undefined, beginAction(requestA)),
    beginAction(requestB),
  );

describe('weeklyProjectSummaryReducer Project Status requests', () => {
  it('clears previous Project Status data when a new request begins', () => {
    const state = {
      ...weeklyProjectSummaryReducer(undefined, {}),
      projectStatusData: { current: { metrics: { totalProjects: { value: 150 } } } },
      projectStatusDataRequestKey: requestA.requestKey,
      projectStatusError: new Error('old error'),
    };

    const nextState = weeklyProjectSummaryReducer(state, {
      ...beginAction(requestB),
    });

    expect(nextState).toMatchObject({
      projectStatusLoading: true,
      projectStatusData: null,
      projectStatusError: null,
      projectStatusActiveRequestId: requestB.requestId,
      projectStatusActiveRequestKey: requestB.requestKey,
      projectStatusDataRequestKey: null,
      projectStatusErrorRequestKey: null,
    });
  });

  it('ignores stale Project Status success and error actions after a newer request begins', () => {
    const loadingLatestState = createLoadingLatestState();

    [
      {
        type: FETCH_WEEKLY_PROJECT_SUMMARY_PROJECT_STATUS_SUCCESS,
        payload: { current: { metrics: { totalProjects: { value: 1 } } } },
        meta: requestA,
      },
      {
        type: FETCH_WEEKLY_PROJECT_SUMMARY_PROJECT_STATUS_ERROR,
        payload: new Error('stale failure'),
        meta: requestA,
      },
    ].forEach(action => {
      expect(weeklyProjectSummaryReducer(loadingLatestState, action)).toBe(loadingLatestState);
    });
  });

  it('accepts the latest Project Status success after an older response is ignored', () => {
    const staleState = weeklyProjectSummaryReducer(createLoadingLatestState(), {
      type: FETCH_WEEKLY_PROJECT_SUMMARY_PROJECT_STATUS_SUCCESS,
      payload: { current: { metrics: { totalProjects: { value: 1 } } } },
      meta: requestA,
    });
    const latestData = { current: { metrics: { totalProjects: { value: 2 } } } };
    const nextState = weeklyProjectSummaryReducer(staleState, {
      type: FETCH_WEEKLY_PROJECT_SUMMARY_PROJECT_STATUS_SUCCESS,
      payload: latestData,
      meta: requestB,
    });

    expect(nextState).toMatchObject({
      projectStatusLoading: false,
      projectStatusData: latestData,
      projectStatusError: null,
      projectStatusActiveRequestId: requestB.requestId,
      projectStatusActiveRequestKey: requestB.requestKey,
      projectStatusDataRequestKey: requestB.requestKey,
    });
  });

  it('clears previous Project Status data when the active request fails', () => {
    const state = weeklyProjectSummaryReducer(
      {
        ...weeklyProjectSummaryReducer(undefined, {}),
        projectStatusData: { current: { metrics: { totalProjects: { value: 150 } } } },
        projectStatusDataRequestKey: requestA.requestKey,
      },
      {
        ...beginAction(requestB),
      },
    );
    const error = new Error('latest failure');

    const nextState = weeklyProjectSummaryReducer(state, {
      type: FETCH_WEEKLY_PROJECT_SUMMARY_PROJECT_STATUS_ERROR,
      payload: error,
      meta: requestB,
    });

    expect(nextState).toMatchObject({
      projectStatusLoading: false,
      projectStatusData: null,
      projectStatusError: error,
      projectStatusActiveRequestId: requestB.requestId,
      projectStatusActiveRequestKey: requestB.requestKey,
      projectStatusDataRequestKey: null,
      projectStatusErrorRequestKey: requestB.requestKey,
    });
  });

  it('does not let request A success overwrite request B after request B succeeds first', () => {
    const loadingBState = createLoadingLatestState();
    const requestBSuccessState = weeklyProjectSummaryReducer(
      loadingBState,
      successAction(requestB, 2),
    );

    const nextState = weeklyProjectSummaryReducer(requestBSuccessState, successAction(requestA, 1));

    expect(nextState).toBe(requestBSuccessState);
    expect(nextState.projectStatusData.current.metrics.totalProjects.value).toBe(2);
  });

  it('does not let request A failure overwrite request B after request B succeeds first', () => {
    const loadingBState = createLoadingLatestState();
    const requestBSuccessState = weeklyProjectSummaryReducer(
      loadingBState,
      successAction(requestB, 2),
    );

    const nextState = weeklyProjectSummaryReducer(
      requestBSuccessState,
      errorAction(requestA, 'late request A failure'),
    );

    expect(nextState).toBe(requestBSuccessState);
    expect(nextState.projectStatusData.current.metrics.totalProjects.value).toBe(2);
    expect(nextState.projectStatusError).toBeNull();
  });

  it('does not let late request A or B responses overwrite request C after request C succeeds first', () => {
    const loadingCState = weeklyProjectSummaryReducer(
      createLoadingLatestState(),
      beginAction(requestC),
    );
    const requestCSuccessState = weeklyProjectSummaryReducer(
      loadingCState,
      successAction(requestC, 3),
    );

    const afterLateASuccess = weeklyProjectSummaryReducer(
      requestCSuccessState,
      successAction(requestA, 1),
    );
    const afterLateBSuccess = weeklyProjectSummaryReducer(
      afterLateASuccess,
      successAction(requestB, 2),
    );
    const afterLateBFailure = weeklyProjectSummaryReducer(
      afterLateBSuccess,
      errorAction(requestB, 'late request B failure'),
    );

    expect(afterLateASuccess).toBe(requestCSuccessState);
    expect(afterLateBSuccess).toBe(requestCSuccessState);
    expect(afterLateBFailure).toBe(requestCSuccessState);
    expect(afterLateBFailure.projectStatusData.current.metrics.totalProjects.value).toBe(3);
    expect(afterLateBFailure.projectStatusError).toBeNull();
  });
});
