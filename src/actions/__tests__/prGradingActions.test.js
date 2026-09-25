import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { ENDPOINTS } from '~/utils/URL';
import {
  fetchWeeklyGrading,
  fetchPRGradingConfig,
  saveWeeklyGrading,
  deleteWeeklyGradingReviewer,
  syncPRGradingReviewers,
} from '../prGradingActions';

vi.mock('axios');

const mockStore = configureMockStore([thunk]);

const mockGradingData = [
  { reviewer: 'Alice', prsNeeded: 5, prsReviewed: 2, gradedPrs: [] },
];

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// fetchWeeklyGrading
// ---------------------------------------------------------------------------
describe('fetchWeeklyGrading', () => {
  it('calls the base URL when no params are provided', async () => {
    axios.get.mockResolvedValue({ data: mockGradingData });
    const store = mockStore({});
    const result = await store.dispatch(fetchWeeklyGrading());

    expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.WEEKLY_GRADING);
    expect(result).toEqual({ success: true, data: mockGradingData });
  });

  it('appends ?team= when only team is provided', async () => {
    axios.get.mockResolvedValue({ data: mockGradingData });
    const store = mockStore({});
    await store.dispatch(fetchWeeklyGrading('TeamA'));

    expect(axios.get).toHaveBeenCalledWith(`${ENDPOINTS.WEEKLY_GRADING}?team=TeamA`);
  });

  it('appends both ?team= and &weekStart= when both are provided', async () => {
    axios.get.mockResolvedValue({ data: mockGradingData });
    const store = mockStore({});
    await store.dispatch(fetchWeeklyGrading('Team 1', '2026-06-15'));

    expect(axios.get).toHaveBeenCalledWith(
      `${ENDPOINTS.WEEKLY_GRADING}?team=Team+1&weekStart=2026-06-15`,
    );
  });

  it('URL-encodes team names with special characters', async () => {
    axios.get.mockResolvedValue({ data: mockGradingData });
    const store = mockStore({});
    await store.dispatch(fetchWeeklyGrading('Team A & B'));

    const call = axios.get.mock.calls[0][0];
    expect(call).toContain('Team+A+%26+B');
  });

  it('returns success: false with the HTTP status on a 4xx error', async () => {
    axios.get.mockRejectedValue({ response: { status: 401 } });
    const store = mockStore({});
    const result = await store.dispatch(fetchWeeklyGrading());

    expect(result).toEqual({ success: false, status: 401 });
  });

  it('returns success: false with the HTTP status on a 5xx error', async () => {
    axios.get.mockRejectedValue({ response: { status: 503 } });
    const store = mockStore({});
    const result = await store.dispatch(fetchWeeklyGrading());

    expect(result).toEqual({ success: false, status: 503 });
  });

  it('returns undefined status when the error has no response (network failure)', async () => {
    axios.get.mockRejectedValue(new Error('Network Error'));
    const store = mockStore({});
    const result = await store.dispatch(fetchWeeklyGrading());

    expect(result).toEqual({ success: false, status: undefined });
  });

  it('handles a null data payload without throwing', async () => {
    axios.get.mockResolvedValue({ data: null });
    const store = mockStore({});
    const result = await store.dispatch(fetchWeeklyGrading());

    expect(result).toEqual({ success: true, data: null });
  });
});

// ---------------------------------------------------------------------------
// saveWeeklyGrading
// ---------------------------------------------------------------------------
describe('saveWeeklyGrading', () => {
  it('posts the payload to the correct endpoint and returns success', async () => {
    const payload = { teamName: 'Team 1', date: '2026-06-15', gradings: [] };
    axios.post.mockResolvedValue({ data: { saved: true } });
    const store = mockStore({});
    const result = await store.dispatch(saveWeeklyGrading(payload));

    expect(axios.post).toHaveBeenCalledWith(ENDPOINTS.WEEKLY_GRADING_SAVE, payload);
    expect(result).toEqual({ success: true, data: { saved: true } });
  });

  it('returns success: false with status on a 5xx error', async () => {
    axios.post.mockRejectedValue({ response: { status: 500 } });
    const store = mockStore({});
    const result = await store.dispatch(saveWeeklyGrading({}));

    expect(result).toEqual({ success: false, status: 500 });
  });

  it('returns success: false with status on a 4xx error', async () => {
    axios.post.mockRejectedValue({ response: { status: 422 } });
    const store = mockStore({});
    const result = await store.dispatch(saveWeeklyGrading({ invalid: true }));

    expect(result).toEqual({ success: false, status: 422 });
  });

  it('returns undefined status when there is no response object (network failure)', async () => {
    axios.post.mockRejectedValue(new Error('Network Error'));
    const store = mockStore({});
    const result = await store.dispatch(saveWeeklyGrading({}));

    expect(result).toEqual({ success: false, status: undefined });
  });

  it('handles an empty payload without throwing', async () => {
    axios.post.mockResolvedValue({ data: {} });
    const store = mockStore({});
    const result = await store.dispatch(saveWeeklyGrading({}));

    expect(result).toEqual({ success: true, data: {} });
  });
});

// ---------------------------------------------------------------------------
// fetchPRGradingConfig
// ---------------------------------------------------------------------------
describe('fetchPRGradingConfig', () => {
  it('calls the correct endpoint and returns config data', async () => {
    const configData = [{ _id: '1', teamName: 'Team A', reviewerCount: 3 }];
    axios.get.mockResolvedValue({ data: configData });
    const store = mockStore({});
    const result = await store.dispatch(fetchPRGradingConfig());

    expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.PR_GRADING_CONFIG);
    expect(result).toEqual({ success: true, data: configData });
  });

  it('returns an empty array when the config list is empty', async () => {
    axios.get.mockResolvedValue({ data: [] });
    const store = mockStore({});
    const result = await store.dispatch(fetchPRGradingConfig());

    expect(result).toEqual({ success: true, data: [] });
  });

  it('returns success: false with 403 on authorization failure', async () => {
    axios.get.mockRejectedValue({ response: { status: 403 } });
    const store = mockStore({});
    const result = await store.dispatch(fetchPRGradingConfig());

    expect(result).toEqual({ success: false, status: 403 });
  });

  it('returns success: false with 404 when the endpoint does not exist', async () => {
    axios.get.mockRejectedValue({ response: { status: 404 } });
    const store = mockStore({});
    const result = await store.dispatch(fetchPRGradingConfig());

    expect(result).toEqual({ success: false, status: 404 });
  });

  it('returns undefined status when there is no response object (network failure)', async () => {
    axios.get.mockRejectedValue(new Error('Network Error'));
    const store = mockStore({});
    const result = await store.dispatch(fetchPRGradingConfig());

    expect(result).toEqual({ success: false, status: undefined });
  });
});

// ---------------------------------------------------------------------------
// deleteWeeklyGradingReviewer
// ---------------------------------------------------------------------------
describe('deleteWeeklyGradingReviewer', () => {
  it('calls DELETE with all three required query params', async () => {
    axios.delete.mockResolvedValue({ data: {} });
    const store = mockStore({});
    const result = await store.dispatch(
      deleteWeeklyGradingReviewer('Team 1', 'Alice', '2026-06-15'),
    );

    const call = axios.delete.mock.calls[0][0];
    expect(call).toContain('team=Team+1');
    expect(call).toContain('reviewer=Alice');
    expect(call).toContain('weekStart=2026-06-15');
    expect(result).toEqual({ success: true });
  });

  it('returns success: false with 404 when reviewer not found', async () => {
    axios.delete.mockRejectedValue({ response: { status: 404 } });
    const store = mockStore({});
    const result = await store.dispatch(
      deleteWeeklyGradingReviewer('Team 1', 'Nobody', '2026-06-15'),
    );

    expect(result).toEqual({ success: false, status: 404 });
  });

  it('returns success: false with 400 on missing params', async () => {
    axios.delete.mockRejectedValue({ response: { status: 400 } });
    const store = mockStore({});
    const result = await store.dispatch(deleteWeeklyGradingReviewer('', '', ''));

    expect(result).toEqual({ success: false, status: 400 });
  });

  it('returns undefined status on network failure', async () => {
    axios.delete.mockRejectedValue(new Error('Network Error'));
    const store = mockStore({});
    const result = await store.dispatch(
      deleteWeeklyGradingReviewer('Team 1', 'Alice', '2026-06-15'),
    );

    expect(result).toEqual({ success: false, status: undefined });
  });
});

// ---------------------------------------------------------------------------
// syncPRGradingReviewers
// ---------------------------------------------------------------------------
describe('syncPRGradingReviewers', () => {
  it('POSTs to the sync endpoint and returns success with data', async () => {
    const syncResponse = {
      message: 'Synced',
      team1: [{ name: 'Alice Smith', prsNeeded: 7 }],
      team2: [{ name: 'Zara Jones', prsNeeded: 10 }],
    };
    axios.post.mockResolvedValue({ data: syncResponse });
    const store = mockStore({});
    const result = await store.dispatch(syncPRGradingReviewers());

    expect(axios.post).toHaveBeenCalledWith(ENDPOINTS.PR_GRADING_SYNC_REVIEWERS, {});
    expect(result).toEqual({ success: true, data: syncResponse });
  });

  it('returns success: false with status on API error', async () => {
    axios.post.mockRejectedValue({ response: { status: 500 } });
    const store = mockStore({});
    const result = await store.dispatch(syncPRGradingReviewers());

    expect(result).toEqual({ success: false, status: 500 });
  });

  it('returns undefined status on network failure', async () => {
    axios.post.mockRejectedValue(new Error('Network Error'));
    const store = mockStore({});
    const result = await store.dispatch(syncPRGradingReviewers());

    expect(result).toEqual({ success: false, status: undefined });
  });
});
