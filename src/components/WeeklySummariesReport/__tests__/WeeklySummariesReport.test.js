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
  });
});
