import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { getWeeklySummaries, updateWeeklySummaries } from '../actions/weeklySummaries';
import configureStore from '../store';
import { ENDPOINTS } from '../utils/URL';

const { store } = configureStore();
const url = ENDPOINTS.USER_PROFILE(':userId');

const weeklySummariesMockData = {
  weeklySummariesCount: 1,
  weeklySummaries: [{ _id: '1', dueDate: '1', summary: 'a', uploadDate: '1' }],
  mediaUrl: 'u',
};

const server = setupServer(
  rest.get(url, (req, res, ctx) => res(ctx.json(weeklySummariesMockData), ctx.status(200))),
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

const wSummariesSlice = () => store.getState().weeklySummaries;

describe('WeeklySummary Redux related actions', () => {
  describe('Fetching the weekly summaries from the server', () => {
    it('should fetch mediaUrl, weeklySummaries and weeklySummariesCount from the userProfile and put in the store', async () => {
      await store.dispatch(getWeeklySummaries('1'));

      expect(wSummariesSlice().summaries).toHaveProperty('mediaUrl', 'u');
      expect(wSummariesSlice().summaries).toHaveProperty('weeklySummaries', [
        { _id: '1', dueDate: '1', summary: 'a', uploadDate: '1' },
      ]);
      expect(wSummariesSlice().summaries).toHaveProperty('weeklySummariesCount', 1);
    });

    describe('loading indicator', () => {
      it('should be true while fetching', () => {
        server.use(
          rest.get(url, async (req, res, ctx) => {
            expect(wSummariesSlice().loading).toBe(true);
            return res(ctx.status(200));
          }),
        );

        store.dispatch(getWeeklySummaries('1'));
      });

      it('should be false after the reports are fetched', async () => {
        await store.dispatch(getWeeklySummaries('1'));

        expect(wSummariesSlice().loading).toBe(false);
      });

      it('should be false if the server returns an error', async () => {
        server.use(rest.get(url, (req, res, ctx) => res(ctx.status(500))));

        await store.dispatch(getWeeklySummaries('1'));

        expect(wSummariesSlice().loading).toBe(false);
      });
    });
  });

  describe('Save the weekly summaries and related data to the server', () => {
    it('should return status 200 on weekly summaries update', async () => {
      server.use(
        rest.put(url, (req, res, ctx) => {
          const { userId } = req.params;
          return res(ctx.json({ _id: userId }), ctx.status(200));
        }),
      );
      const response = await store.dispatch(updateWeeklySummaries('1', weeklySummariesMockData));
      expect(response).toBe(200);
    });

    it('should return status 404 on record is not found', async () => {
      server.use(rest.put(url, (req, res, ctx) => res(ctx.status(404))));
      const response = await store.dispatch(updateWeeklySummaries('1', weeklySummariesMockData));
      expect(response).toBe(404);
    });
  });
});
