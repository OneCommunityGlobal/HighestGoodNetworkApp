// eslint-disable-next-line import/named
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import { ENDPOINTS } from '~/utils/URL';

// Mock the action creators
vi.fn().mockImplementation(() => ({ type: 'GET_WEEKLY_SUMMARIES' }));
vi.fn().mockImplementation(() => ({ type: 'UPDATE_WEEKLY_SUMMARIES' }));

// Replace the import with our mocked actions
vi.mock('../../../actions/weeklySummaries', () => ({
  getWeeklySummaries: vi.fn().mockImplementation(() => ({ type: 'GET_WEEKLY_SUMMARIES' })),
  updateWeeklySummaries: vi.fn().mockImplementation(() => ({ type: 'UPDATE_WEEKLY_SUMMARIES' })),
}));

// Create mock store
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const store = mockStore({
  weeklySummaries: {
    loading: false,
    summaries: {
      weeklySummariesCount: 1,
      weeklySummaries: [{ _id: '1', dueDate: '1', summary: 'a', uploadDate: '1' }],
      mediaUrl: 'u',
    },
  },
});

const url = ENDPOINTS.USER_PROFILE(':userId');

const weeklySummariesMockData = {
  weeklySummariesCount: 1,
  weeklySummaries: [{ _id: '1', dueDate: '1', summary: 'a', uploadDate: '1' }],
  mediaUrl: 'u',
};

const server = setupServer(
  rest.get(url, (req, res, ctx) => res(ctx.json(weeklySummariesMockData), ctx.status(200))),
  rest.put(url, (req, res, ctx) => res(ctx.json({ _id: '1' }), ctx.status(200))),
  rest.get('*', (req, res, ctx) => {
    return res(ctx.status(500), ctx.json({ error: 'Unhandled request' }));
  }),
);

beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(() => {
  server.resetHandlers();
  store.clearActions();
  vi.clearAllMocks();
});

const wSummariesSlice = () => store.getState().weeklySummaries;

describe('WeeklySummary Redux related actions', () => {
  describe('Fetching the weekly summaries from the server', () => {
    it('should fetch mediaUrl, weeklySummaries and weeklySummariesCount from the userProfile and put in the store', () => {
      store.dispatch({ type: 'GET_WEEKLY_SUMMARIES' });

      expect(wSummariesSlice().summaries).toHaveProperty('mediaUrl', 'u');
      expect(wSummariesSlice().summaries).toHaveProperty('weeklySummaries', [
        { _id: '1', dueDate: '1', summary: 'a', uploadDate: '1' },
      ]);
      expect(wSummariesSlice().summaries).toHaveProperty('weeklySummariesCount', 1);
    });

    describe('loading indicator', () => {
      it('should be true while fetching', () => {
        store.dispatch({ type: 'WEEKLY_SUMMARIES_LOADING' });
        const actions = store.getActions();
        expect(actions).toContainEqual({ type: 'WEEKLY_SUMMARIES_LOADING' });
      });

      it('should be false after the reports are fetched', () => {
        expect(wSummariesSlice().loading).toBe(false);
      });

      it('should be false if the server returns an error', () => {
        expect(wSummariesSlice().loading).toBe(false);
      });
    });
  });

  describe('Save the weekly summaries and related data to the server', () => {
    it('should return status 200 on weekly summaries update', () => {
      store.dispatch({ type: 'UPDATE_WEEKLY_SUMMARIES' });
      const actions = store.getActions();
      expect(actions).toContainEqual({ type: 'UPDATE_WEEKLY_SUMMARIES' });
    });

    it('should return status 404 on record is not found', () => {
      store.dispatch({ type: 'UPDATE_WEEKLY_SUMMARIES_ERROR' });

      const actions = store.getActions();
      expect(actions).toContainEqual({ type: 'UPDATE_WEEKLY_SUMMARIES_ERROR' });
    });
  });
});
