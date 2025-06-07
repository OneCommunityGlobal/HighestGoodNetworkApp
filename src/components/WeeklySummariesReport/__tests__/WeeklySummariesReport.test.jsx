import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import axios from 'axios';
import { toast } from 'react-toastify';

import {
  fetchWeeklySummariesReportBegin,
  fetchWeeklySummariesReportSuccess,
  fetchWeeklySummariesReportError,
  updateSummaryReport,
  getWeeklySummariesReport,
  updateOneSummaryReport,
  toggleUserBio,
} from '../../../actions/weeklySummariesReport';
import * as constants from '../../../constants/weeklySummariesReport';
import { ENDPOINTS } from '~/utils/URL';

vi.mock('axios');
vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockStore = configureMockStore([thunk]);

describe('weeklySummariesReport action creators', () => {
  it('fetchWeeklySummariesReportBegin()', () => {
    expect(fetchWeeklySummariesReportBegin()).toEqual({
      type: constants.FETCH_SUMMARIES_REPORT_BEGIN,
    });
  });

  it('fetchWeeklySummariesReportSuccess()', () => {
    const data = [{ _id: 'x' }];
    expect(fetchWeeklySummariesReportSuccess(data)).toEqual({
      type: constants.FETCH_SUMMARIES_REPORT_SUCCESS,
      payload: { weeklySummariesData: data },
    });
  });

  it('fetchWeeklySummariesReportError()', () => {
    const err = new Error('oops');
    expect(fetchWeeklySummariesReportError(err)).toEqual({
      type: constants.FETCH_SUMMARIES_REPORT_ERROR,
      payload: { error: err },
    });
  });

  it('updateSummaryReport()', () => {
    const upd = { foo: 'bar' };
    expect(updateSummaryReport({ _id: '1', updatedField: upd })).toEqual({
      type: constants.UPDATE_SUMMARY_REPORT,
      payload: { _id: '1', updatedField: upd },
    });
  });
});

describe('weeklySummariesReport thunks', () => {
  let store;
  beforeEach(() => {
    store = mockStore({});
    vi.clearAllMocks();
  });

  describe('getWeeklySummariesReport()', () => {
    it('dispatches BEGIN + SUCCESS, returns {status,data}', async () => {
      const data = [{ _id: '1' }];
      axios.get.mockResolvedValueOnce({ status: 200, data });

      const result = await store.dispatch(getWeeklySummariesReport());
      const actions = store.getActions();

      expect(actions[0]).toEqual(fetchWeeklySummariesReportBegin());
      expect(actions[1]).toEqual(fetchWeeklySummariesReportSuccess(data));
      expect(result).toEqual({ status: 200, data });
    });

    it('dispatches BEGIN + ERROR, returns status on failure', async () => {
      const err = { response: { status: 500 }, message: 'fail' };
      axios.get.mockRejectedValueOnce(err);

      const result = await store.dispatch(getWeeklySummariesReport());
      const actions = store.getActions();

      expect(actions[0]).toEqual(fetchWeeklySummariesReportBegin());
      expect(actions[1]).toEqual(fetchWeeklySummariesReportError(err));
      expect(result).toBe(500);
    });
  });

  describe('updateOneSummaryReport()', () => {
    const userId = 'user123';
    const updatedField = { foo: 'baz' };
    const profile = { name: 'Alice', x: 42 };
    const url = ENDPOINTS.USER_PROFILE(userId);

    it('fetches, PUTs, dispatches updateSummaryReport, returns res', async () => {
      axios.get.mockResolvedValueOnce({ data: profile });
      axios.put.mockResolvedValueOnce({ status: 200 });

      const res = await store.dispatch(updateOneSummaryReport(userId, updatedField));
      const actions = store.getActions();

      expect(actions).toEqual([updateSummaryReport({ _id: userId, updatedField })]);
      expect(res).toEqual({ status: 200 });
      expect(axios.get).toHaveBeenCalledWith(url);
      expect(axios.put).toHaveBeenCalledWith(url, { ...profile, ...updatedField });
    });

    it('throws when PUT returns non-200', async () => {
      axios.get.mockResolvedValueOnce({ data: profile });
      axios.put.mockResolvedValueOnce({ status: 500 });

      await expect(store.dispatch(updateOneSummaryReport(userId, updatedField))).rejects.toThrow(
        'An error occurred while attempting to save the changes to the profile.',
      );
    });
  });

  describe('toggleUserBio()', () => {
    const userId = 'user123';
    const bioPosted = 'posted';
    const url = ENDPOINTS.TOGGLE_BIO_STATUS(userId);

    it('PATCHes, dispatches updateSummaryReport, toasts success, returns res', async () => {
      axios.patch.mockResolvedValueOnce({ status: 200 });

      const res = await store.dispatch(toggleUserBio(userId, bioPosted));
      const actions = store.getActions();

      expect(actions).toEqual([updateSummaryReport({ _id: userId, updatedField: { bioPosted } })]);
      expect(toast.success).toHaveBeenCalledWith(`Bio status updated to "${bioPosted}"`);
      expect(res).toEqual({ status: 200 });
      expect(axios.patch).toHaveBeenCalledWith(url, { bioPosted });
    });

    it('toasts error and re-throws on patch failure', async () => {
      const error = new Error('patch fail');
      axios.patch.mockRejectedValueOnce(error);

      await expect(store.dispatch(toggleUserBio(userId, bioPosted))).rejects.toThrow(error);
      expect(toast.error).toHaveBeenCalledWith('An error occurred while updating bio status.');
    });
  });
});
