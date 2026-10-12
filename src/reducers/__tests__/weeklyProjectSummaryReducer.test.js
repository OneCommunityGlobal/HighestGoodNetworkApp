import { weeklyProjectSummaryReducer } from '../bmdashboard/weeklyProjectSummaryReducer';
import {
  FETCH_WEEKLY_PROJECT_SUMMARY_PROJECT_STATUS_BEGIN,
  FETCH_WEEKLY_PROJECT_SUMMARY_PROJECT_STATUS_ERROR,
  FETCH_WEEKLY_PROJECT_SUMMARY_PROJECT_STATUS_SUCCESS,
} from '../../constants/bmdashboard/weeklyProjectSummaryConstants';

const requestA = { requestId: 'request-a', requestKey: 'startDate=2026-09-01' };
const requestB = { requestId: 'request-b', requestKey: 'startDate=2026-10-01' };
const beginAction = meta => ({
  type: FETCH_WEEKLY_PROJECT_SUMMARY_PROJECT_STATUS_BEGIN,
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
      projectStatusActiveRequestId: null,
      projectStatusActiveRequestKey: null,
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
      projectStatusActiveRequestId: null,
      projectStatusActiveRequestKey: null,
      projectStatusDataRequestKey: null,
      projectStatusErrorRequestKey: requestB.requestKey,
    });
  });
});
