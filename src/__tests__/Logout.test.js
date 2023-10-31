import '@testing-library/jest-dom/extend-expect';
import mockState from './mockAdminState.js';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { ApiEndpoint, ENDPOINTS } from '../utils/URL';
const userProjectsUrl = ENDPOINTS.USER_PROJECTS(mockState.auth.user.userid);

window.confirm = jest.fn(() => true);

const server = setupServer(
  rest.get(ApiEndpoint + '/userprofile/*', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}));
  }),
  rest.get(ApiEndpoint + '/api/dashboard/*', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        leaderBoardData: [
          {
            personId: '5edf141c78f1380017b829a6',
            name: 'Dev Admin',
            weeklycommittedHours: 10,
            totaltime_hrs: 6,
            totaltangibletime_hrs: 6,
            totalintangibletime_hrs: 0,
            percentagespentintangible: 100,
            didMeetWeeklyCommitment: false,
            weeklycommitted: 10,
            tangibletime: 6,
            intangibletime: 0,
            tangibletimewidth: 100,
            intangibletimewidth: 0,
            tangiblebarcolor: 'orange',
            totaltime: 6,
          },
        ],
      }),
    );
  }),
  rest.get(userProjectsUrl, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          isActive: true,
          _id: '5ad91ec3590b19002acfcd26',
          projectName: 'HG Fake Project',
        },
      ]),
    );
  }),
  rest.get('http://*/hash.txt', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}));
  }),
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('Logout behavior', () => {
  it('should remove user info from state and redirect to login page', async () => {
    // let rt = '/logout'
    // const hist = createMemoryHistory({ initialEntries: [rt] });
    // const store = createStore(reducer, mockState, compose(applyMiddleware(...middleware)));
    // let logoutMountedPage = renderWithRouterMatch(routes , {initialState: mockState, route: rt, store: store, history: hist});
    // let {getByLabelText} = logoutMountedPage;
    // await sleep(10);
    // let state = store.getState();
    // expect(state.isAuthenticated).toBeFalsy();
    // expect(state.user).toBeFalsy();
    // expect(state.firstName).toBeFalsy();
    // expect(getByLabelText('Email:')).toBeTruthy();
    // expect(getByLabelText('Password:')).toBeTruthy();
  });
});
