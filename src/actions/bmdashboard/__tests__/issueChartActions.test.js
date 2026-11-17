import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
  fetchMostExpensiveIssues,
  fetchLongestOpenIssues,
} from '../issueChartActions';
import issueReducer from '../../../reducers/bmdashboard/issueReducer';
import {
  FETCH_MOST_EXPENSIVE_ISSUES_REQUEST,
  FETCH_MOST_EXPENSIVE_ISSUES_SUCCESS,
  FETCH_MOST_EXPENSIVE_ISSUES_FAILURE,
} from '../../../constants/bmdashboard/issueConstants';

vi.mock('axios');

const mockStore = configureMockStore([thunk]);

describe('issueChartActions & issueReducer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchMostExpensiveIssues', () => {
    it('dispatches REQUEST and SUCCESS with formatted parameters (dates and projects)', async () => {
      const mockData = [
        { issueName: 'Foundation Crack', cost: 25000 },
        { issueName: 'Roof Leak', cost: 8000 },
      ];
      axios.get.mockResolvedValueOnce({ data: mockData });

      const store = mockStore({});
      await store.dispatch(
        fetchMostExpensiveIssues({
          projects: ['proj1', 'proj2'],
          startDate: '2025-01-01',
          endDate: '2025-06-01',
        }),
      );

      const actions = store.getActions();
      expect(actions[0]).toEqual({ type: FETCH_MOST_EXPENSIVE_ISSUES_REQUEST });
      expect(actions[1]).toEqual({
        type: FETCH_MOST_EXPENSIVE_ISSUES_SUCCESS,
        payload: mockData,
      });

      // Verify params passed to axios
      expect(axios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            projects: 'proj1,proj2',
            projectIds: 'proj1,proj2',
            startDate: '2025-01-01',
            endDate: '2025-06-01',
            dates: '2025-01-01,2025-06-01',
          }),
        }),
      );
    });

    it('dispatches FAILURE when API call fails', async () => {
      axios.get.mockRejectedValueOnce(new Error('Network error'));

      const store = mockStore({});
      await store.dispatch(fetchMostExpensiveIssues({}));

      const actions = store.getActions();
      expect(actions[0]).toEqual({ type: FETCH_MOST_EXPENSIVE_ISSUES_REQUEST });
      expect(actions[1]).toEqual({
        type: FETCH_MOST_EXPENSIVE_ISSUES_FAILURE,
        payload: 'Network error',
      });
    });
  });

  describe('issueReducer for mostExpensiveIssues', () => {
    it('handles direct array payload correctly', () => {
      const issues = [{ issueName: 'Foundation Crack', cost: 25000 }];
      const state = issueReducer(undefined, {
        type: FETCH_MOST_EXPENSIVE_ISSUES_SUCCESS,
        payload: issues,
      });

      expect(state.loading).toBe(false);
      expect(state.mostExpensiveIssues).toEqual(issues);
    });

    it('handles object with data property correctly', () => {
      const issues = [{ issueName: 'HVAC Failure', cost: 12000 }];
      const state = issueReducer(undefined, {
        type: FETCH_MOST_EXPENSIVE_ISSUES_SUCCESS,
        payload: { data: issues },
      });

      expect(state.loading).toBe(false);
      expect(state.mostExpensiveIssues).toEqual(issues);
    });
  });
});
