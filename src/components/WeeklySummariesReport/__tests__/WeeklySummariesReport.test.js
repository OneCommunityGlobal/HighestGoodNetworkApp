import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { getWeeklySummariesReport } from '../../../actions/weeklySummariesReport';
import configureStore from '../../../store';
import { ENDPOINTS } from '../../../utils/URL';

const { store } = configureStore();
const url = ENDPOINTS.WEEKLY_SUMMARIES_REPORT();

const server = setupServer(
  rest.get(url, (req, res, ctx) => res(ctx.status(200), ctx.json([{ _id: 1 }]))),
  rest.get('*', (req, res, ctx) => {
    // eslint-disable-next-line no-console
    console.error(
      `Please add request handler for ${req.url.toString()} in your MSW server requests.`,
    );
    return res(ctx.status(500), ctx.json({ error: 'You must add request handler.' }));
  }),
);

beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

const wsReportSlice = () => store.getState().weeklySummariesReport;

describe('WeeklySummariesReport Redux related actions', () => {
  describe('Fetching the weekly summaries report from the server', () => {
    it('should be fetched from the server and put in the store', async () => {
      await store.dispatch(getWeeklySummariesReport());

      expect(wsReportSlice().summaries).toHaveLength(1);
    });

    describe('loading indicator', () => {
      it('should be true while fetching', () => {
        server.use(
          rest.get(url, async (req, res, ctx) => {
            expect(wsReportSlice().loading).toBe(true);
            return res(ctx.status(200));
          }),
        );

        store.dispatch(getWeeklySummariesReport());
      });

      it('should be false after the reports are fetched', async () => {
        await store.dispatch(getWeeklySummariesReport());

        expect(wsReportSlice().loading).toBe(false);
      });

      it('should be false if the server returns an error', async () => {
        server.use(rest.get(url, (req, res, ctx) => res(ctx.status(500))));

        await store.dispatch(getWeeklySummariesReport());

        expect(wsReportSlice().loading).toBe(false);
      });
    });

    // Additional tests for Redux actions
    describe('action dispatching', () => {
      it('should update the loading state correctly during fetch', async () => {
        const { store: testStore } = configureStore();
        const fetchPromise = testStore.dispatch(getWeeklySummariesReport());
        expect(testStore.getState().weeklySummariesReport.loading).toBe(true);
        await fetchPromise;
        expect(testStore.getState().weeklySummariesReport.loading).toBe(false);
        expect(testStore.getState().weeklySummariesReport.summaries).toBeDefined();
      });

      it('should handle errors correctly', async () => {
        server.use(
          rest.get(url, (req, res, ctx) =>
            res(ctx.status(500), ctx.json({ message: 'Server error' })),
          ),
        );

        const { store: testStore } = configureStore();
        await testStore.dispatch(getWeeklySummariesReport());
        expect(testStore.getState().weeklySummariesReport.loading).toBe(false);
        expect(testStore.getState().weeklySummariesReport.error).toBeTruthy();
      });
    });

    describe('error handling', () => {
      it('should store error message in the Redux state when fetch fails', async () => {
        const errorMessage = 'Internal Server Error';
        server.use(
          rest.get(url, (req, res, ctx) =>
            res(ctx.status(500), ctx.json({ message: errorMessage })),
          ),
        );

        await store.dispatch(getWeeklySummariesReport());
        expect(wsReportSlice().error).toBeTruthy();
        expect(wsReportSlice().error.message || wsReportSlice().error).toBeTruthy();
      });

      it('should clear previous errors when a new request is made', async () => {
        server.use(
          rest.get(url, (req, res, ctx) =>
            res(ctx.status(500), ctx.json({ message: 'Error message' })),
          ),
        );

        await store.dispatch(getWeeklySummariesReport());
        expect(wsReportSlice().error).toBeTruthy();
        server.use(rest.get(url, (req, res, ctx) => res(ctx.status(200), ctx.json([{ _id: 1 }]))));
        await store.dispatch(getWeeklySummariesReport());
        expect(wsReportSlice().error).toBeFalsy();
      });
    });

    describe('response handling', () => {
      it('should correctly process and store summaries with different data structures', async () => {
        const mockData = [
          { _id: '1', name: 'Summary 1', totalSeconds: [3600, 7200, 0, 0] },
          { _id: '2', name: 'Summary 2', totalSeconds: [1800, 3600, 5400, 7200] },
        ];

        server.use(rest.get(url, (req, res, ctx) => res(ctx.status(200), ctx.json(mockData))));

        await store.dispatch(getWeeklySummariesReport());
        expect(wsReportSlice().summaries).toHaveLength(2);
        expect(wsReportSlice().summaries[0]._id).toBe('1');
        expect(wsReportSlice().summaries[1]._id).toBe('2');
        expect(wsReportSlice().summaries[0].totalSeconds).toEqual([3600, 7200, 0, 0]);
      });

      it('should handle empty response data correctly', async () => {
        server.use(rest.get(url, (req, res, ctx) => res(ctx.status(200), ctx.json([]))));

        await store.dispatch(getWeeklySummariesReport());
        expect(wsReportSlice().summaries).toHaveLength(0);
        expect(Array.isArray(wsReportSlice().summaries)).toBe(true);
      });
    });

    describe('network error handling', () => {
      it('should handle network errors gracefully', async () => {
        server.use(
          rest.get(url, (req, res, ctx) => {
            return res(ctx.status(500), ctx.json({ message: 'Network error simulation' }));
          }),
        );

        await store.dispatch(getWeeklySummariesReport());
        expect(wsReportSlice().loading).toBe(false);
        expect(wsReportSlice().error).toBeTruthy();
      });

      it('should handle timeout scenarios', async () => {
        jest.setTimeout(10000);

        server.use(
          rest.get(url, (req, res, ctx) => {
            return res(ctx.delay(200), ctx.status(408), ctx.json({ message: 'Request timeout' }));
          }),
        );

        await store.dispatch(getWeeklySummariesReport());
        expect(wsReportSlice().loading).toBe(false);
        expect(wsReportSlice().error).toBeTruthy();
        jest.setTimeout(5000);
      });
    });

    describe('data consistency', () => {
      it('should maintain consistent Redux state between multiple fetches', async () => {
        server.use(
          rest.get(url, (req, res, ctx) =>
            res(ctx.status(200), ctx.json([{ _id: '1', name: 'First fetch' }])),
          ),
        );

        await store.dispatch(getWeeklySummariesReport());
        expect(wsReportSlice().summaries).toHaveLength(1);
        expect(wsReportSlice().summaries[0].name).toBe('First fetch');

        server.use(
          rest.get(url, (req, res, ctx) =>
            res(
              ctx.status(200),
              ctx.json([
                { _id: '2', name: 'Second fetch item 1' },
                { _id: '3', name: 'Second fetch item 2' },
              ]),
            ),
          ),
        );

        await store.dispatch(getWeeklySummariesReport());
        expect(wsReportSlice().summaries).toHaveLength(2);
        expect(wsReportSlice().summaries[0].name).toBe('Second fetch item 1');
      });
    });
  });
});
