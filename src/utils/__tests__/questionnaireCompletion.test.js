import { vi } from 'vitest';
import httpService from '../../services/httpService';
import { ENDPOINTS } from '../URL';
import {
  QUESTIONNAIRE_REFRESH_MIN_INTERVAL_MS,
  fetchCompletedQuestionnaireUserIds,
  subscribeToCompletedQuestionnaireUserIds,
} from '../questionnaireCompletion';

vi.mock('../../services/httpService', () => ({
  default: { get: vi.fn() },
}));

describe('fetchCompletedQuestionnaireUserIds', () => {
  afterEach(() => vi.clearAllMocks());

  it('returns the set of user ids that submitted the questionnaire', async () => {
    httpService.get.mockResolvedValue({
      data: [{ userId: 'u1' }, { userId: 'u2' }, { userId: null }, {}],
    });

    const result = await fetchCompletedQuestionnaireUserIds();

    expect(httpService.get).toHaveBeenCalledWith(ENDPOINTS.HGN_FORM_RANKED);
    expect([...result]).toEqual(['u1', 'u2']);
  });

  it('returns an empty set when the response is not an array', async () => {
    httpService.get.mockResolvedValue({ data: { error: 'x' } });
    const result = await fetchCompletedQuestionnaireUserIds();
    expect(result.size).toBe(0);
  });
});

describe('subscribeToCompletedQuestionnaireUserIds', () => {
  const flush = () => vi.advanceTimersByTimeAsync(0);
  const returnToTab = () => document.dispatchEvent(new Event('visibilitychange'));
  const waitPastThrottle = () =>
    vi.advanceTimersByTimeAsync(QUESTIONNAIRE_REFRESH_MIN_INTERVAL_MS);
  const respondWith = (...userIds) =>
    httpService.get.mockResolvedValueOnce({ data: userIds.map(userId => ({ userId })) });

  let unsubscribe;
  let onChange;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    onChange = vi.fn();
  });

  afterEach(() => {
    unsubscribe?.();
    vi.useRealTimers();
    vi.restoreAllMocks();
    httpService.get.mockReset();
  });

  it('marks a person complete when they return to the tab after submitting elsewhere', async () => {
    respondWith('other');
    unsubscribe = subscribeToCompletedQuestionnaireUserIds(onChange);
    await flush();
    expect(onChange.mock.lastCall[0].has('submitter')).toBe(false);

    respondWith('other', 'submitter');
    await waitPastThrottle();
    returnToTab();
    await flush();

    const latest = onChange.mock.lastCall[0];
    expect(latest.has('submitter')).toBe(true);
    expect(latest.has('other')).toBe(true);
  });

  it('keeps the last known status when a refresh fails', async () => {
    respondWith('u1');
    unsubscribe = subscribeToCompletedQuestionnaireUserIds(onChange);
    await flush();

    httpService.get.mockRejectedValueOnce(new Error('network'));
    await waitPastThrottle();
    returnToTab();
    await flush();

    expect(httpService.get).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('never reports a status when the first load fails', async () => {
    httpService.get.mockRejectedValueOnce(new Error('network'));
    unsubscribe = subscribeToCompletedQuestionnaireUserIds(onChange);
    await flush();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not notify when the refreshed status is unchanged', async () => {
    respondWith('u1');
    unsubscribe = subscribeToCompletedQuestionnaireUserIds(onChange);
    await flush();

    respondWith('u1');
    await waitPastThrottle();
    returnToTab();
    await flush();

    expect(httpService.get).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('does not refetch when returning to the tab again within the throttle window', async () => {
    respondWith('u1');
    unsubscribe = subscribeToCompletedQuestionnaireUserIds(onChange);
    await flush();

    returnToTab();
    window.dispatchEvent(new Event('focus'));
    await flush();

    expect(httpService.get).toHaveBeenCalledTimes(1);
  });

  it('does not refetch while the tab is hidden', async () => {
    respondWith('u1');
    unsubscribe = subscribeToCompletedQuestionnaireUserIds(onChange);
    await flush();
    await waitPastThrottle();

    const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    returnToTab();
    await flush();
    visibility.mockRestore();

    expect(httpService.get).toHaveBeenCalledTimes(1);
  });

  it('stops refetching and ignores in-flight responses after unsubscribing', async () => {
    respondWith('u1');
    const stop = subscribeToCompletedQuestionnaireUserIds(onChange);
    stop();
    await flush();
    expect(onChange).not.toHaveBeenCalled();

    await waitPastThrottle();
    returnToTab();
    await flush();
    expect(httpService.get).toHaveBeenCalledTimes(1);
  });
});
