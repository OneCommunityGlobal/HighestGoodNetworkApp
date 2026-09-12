import * as actions from '../EnhancedPopularityAnalytics/EnhancedPopularityActions';
import {
  ENHANCED_POPULARITY_DATA_REQUEST,
  ENHANCED_POPULARITY_DATA_SUCCESS,
  ENHANCED_POPULARITY_DATA_FAILURE,
  ENHANCED_POPULARITY_ROLES_REQUEST,
  ENHANCED_POPULARITY_ROLES_SUCCESS,
  ENHANCED_POPULARITY_ROLES_FAILURE,
} from '../../constants/EnchanedPopularityAnalytics/EnchanedPopularityConstants';
import { ENDPOINTS } from '../../utils/URL';

globalThis.fetch = vi.fn();

const mockJsonResponse = (data, ok = true) => ({
  ok,
  json: () => Promise.resolve(data),
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('EnhancedPopularityActions', () => {
  describe('fetchEnhancedPopularityData', () => {
    const params = {
      range: '6months',
      roles: ['Developer'],
      includeLowVolume: true,
      token: 'test-token',
    };

    it('dispatches REQUEST then SUCCESS when the API call succeeds', async () => {
      const mockData = { data: [{ role: 'Developer', data: [] }] };
      fetch.mockResolvedValueOnce(mockJsonResponse(mockData));

      const dispatch = vi.fn();
      await actions.fetchEnhancedPopularityData(params)(dispatch);

      const expectedUrl = ENDPOINTS.ENHANCED_POPULARITY(
        params.range,
        params.roles,
        null,
        null,
        params.includeLowVolume,
      );

      expect(fetch).toHaveBeenCalledWith(expectedUrl, {
        method: 'GET',
        headers: { Authorization: params.token },
      });
      expect(dispatch).toHaveBeenCalledWith({ type: ENHANCED_POPULARITY_DATA_REQUEST });
      expect(dispatch).toHaveBeenCalledWith({
        type: ENHANCED_POPULARITY_DATA_SUCCESS,
        payload: mockData,
      });
    });

    it('dispatches FAILURE with the response error message when the API responds with a non-ok status', async () => {
      fetch.mockResolvedValueOnce(mockJsonResponse({ error: 'Bad request' }, false));

      const dispatch = vi.fn();
      await actions.fetchEnhancedPopularityData(params)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: ENHANCED_POPULARITY_DATA_FAILURE,
        payload: 'Bad request',
      });
    });

    it('dispatches FAILURE with a default message when the API responds with a non-ok status and no error body', async () => {
      fetch.mockResolvedValueOnce(mockJsonResponse({}, false));

      const dispatch = vi.fn();
      await actions.fetchEnhancedPopularityData(params)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: ENHANCED_POPULARITY_DATA_FAILURE,
        payload: 'Failed to fetch data',
      });
    });

    it('dispatches FAILURE when fetch rejects (network error)', async () => {
      fetch.mockRejectedValueOnce(new Error('Network Error'));

      const dispatch = vi.fn();
      await actions.fetchEnhancedPopularityData(params)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: ENHANCED_POPULARITY_DATA_FAILURE,
        payload: 'Network Error',
      });
    });

    it('defaults roles to an empty array when not provided', async () => {
      fetch.mockResolvedValueOnce(mockJsonResponse({ data: [] }));

      const dispatch = vi.fn();
      await actions.fetchEnhancedPopularityData({
        range: '3months',
        includeLowVolume: false,
        token: 'test-token',
      })(dispatch);

      const expectedUrl = ENDPOINTS.ENHANCED_POPULARITY('3months', [], null, null, false);
      expect(fetch).toHaveBeenCalledWith(expectedUrl, expect.any(Object));
    });
  });

  describe('fetchEnhancedRoles', () => {
    const token = 'test-token';

    it('dispatches REQUEST then SUCCESS when the API call succeeds', async () => {
      const mockData = { data: [{ role: 'Developer', totalHits: 5 }] };
      fetch.mockResolvedValueOnce(mockJsonResponse(mockData));

      const dispatch = vi.fn();
      await actions.fetchEnhancedRoles(token)(dispatch);

      expect(fetch).toHaveBeenCalledWith(ENDPOINTS.ENHANCED_POPULARITY_ROLES, {
        method: 'GET',
        headers: { Authorization: token },
      });
      expect(dispatch).toHaveBeenCalledWith({ type: ENHANCED_POPULARITY_ROLES_REQUEST });
      expect(dispatch).toHaveBeenCalledWith({
        type: ENHANCED_POPULARITY_ROLES_SUCCESS,
        payload: mockData,
      });
    });

    it('dispatches FAILURE with the response error message when the API responds with a non-ok status', async () => {
      fetch.mockResolvedValueOnce(mockJsonResponse({ error: 'Unauthorized' }, false));

      const dispatch = vi.fn();
      await actions.fetchEnhancedRoles(token)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: ENHANCED_POPULARITY_ROLES_FAILURE,
        payload: 'Unauthorized',
      });
    });

    it('dispatches FAILURE when fetch rejects (network error)', async () => {
      fetch.mockRejectedValueOnce(new Error('Network Error'));

      const dispatch = vi.fn();
      await actions.fetchEnhancedRoles(token)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: ENHANCED_POPULARITY_ROLES_FAILURE,
        payload: 'Network Error',
      });
    });
  });
});
