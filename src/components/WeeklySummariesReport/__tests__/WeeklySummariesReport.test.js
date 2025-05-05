import { rest } from 'msw';
import { setupServer } from 'msw/node';
import axios from 'axios';
import {
  getWeeklySummariesReport,
  fetchWeeklySummariesReportSuccess,
} from '../../../actions/weeklySummariesReport';
import configureStore from '../../../store';
import { ENDPOINTS } from '../../../utils/URL';

const { store } = configureStore();
const url = ENDPOINTS.WEEKLY_SUMMARIES_REPORT();

// Mock data that will be returned by our server
const mockData = [{ _id: 1 }];

const server = setupServer(
  rest.get(url, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockData));
  }),
  rest.get('*', (req, res, ctx) => {
    return res(ctx.status(500), ctx.json({ error: 'Unhandled request' }));
  }),
);

// Helper to see Redux state
const wsReportSlice = () => store.getState().weeklySummariesReport;

describe('WeeklySummariesReport Redux related actions', () => {
  // Setup and teardown for MSW
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe('Fetching the weekly summaries report from the server', () => {
    it('should be fetched from the server and put in the store', async () => {
      // Mock axios.get directly instead of relying on MSW
      jest.spyOn(axios, 'get').mockResolvedValueOnce({
        status: 200,
        data: mockData,
      });
      await store.dispatch(getWeeklySummariesReport());
      const state = wsReportSlice();
      expect(state.summaries).toHaveLength(1);
      expect(state.summaries[0]._id).toBe(1);
      axios.get.mockRestore();
    });

    it('should update the store when the success action is dispatched directly', () => {
      store.dispatch(fetchWeeklySummariesReportSuccess(mockData));
      const state = wsReportSlice();
      expect(state.summaries).toHaveLength(1);
      expect(state.summaries[0]._id).toBe(1);
    });

    describe('loading indicator', () => {
      it('should be true while fetching', () => {
        jest.spyOn(axios, 'get').mockImplementation(async () => {
          expect(wsReportSlice().loading).toBe(true);
          return { status: 200, data: mockData };
        });
        store.dispatch(getWeeklySummariesReport());
        axios.get.mockRestore();
      });

      it('should be false after the reports are fetched', async () => {
        jest.spyOn(axios, 'get').mockResolvedValueOnce({
          status: 200,
          data: mockData,
        });
        await store.dispatch(getWeeklySummariesReport());
        expect(wsReportSlice().loading).toBe(false);
        axios.get.mockRestore();
      });

      it('should be false if the server returns an error', async () => {
        jest.spyOn(axios, 'get').mockRejectedValueOnce({
          response: { status: 500 },
        });
        await store.dispatch(getWeeklySummariesReport());
        expect(wsReportSlice().loading).toBe(false);
        axios.get.mockRestore();
      });
    });
  });
});
