
import { renderWithProvider, renderWithRouterMatch } from './utils.js'
import '@testing-library/jest-dom/extend-expect'
import mockState from './mockAdminState.js'
import { createMemoryHistory } from 'history';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { ENDPOINTS } from '../utils/URL';
import { render, fireEvent} from "@testing-library/react";
import routes from './../routes';
import reducer from '../reducers';
import thunk from 'redux-thunk';
import { createStore, applyMiddleware, compose } from 'redux';
const middleware = [thunk];
const url = ENDPOINTS.LOGIN;
const timerUrl = ENDPOINTS.TIMER(mockState.auth.user.userid);
const userProjectsUrl = ENDPOINTS.USER_PROJECTS(mockState.auth.user.userid);
let endpoint = process.env.REACT_APP_APIENDPOINT;
if (!endpoint) {
  // This is to resolve the issue in azure env variable
  // APIEndpoint = fetch('/config.json').then((data) => {
  endpoint = 'https://hgnrestdev.azurewebsites.net';
  // });
}
window.confirm = jest.fn(()=>(true));

const server = setupServer(
  rest.get(endpoint + '/userprofile/*', (req, res, ctx) =>  {
      return res(ctx.status(200), ctx.json({}), )  
  }),
  rest.get(endpoint + '/api/dashboard/*', (req, res, ctx) =>  {
    return res(ctx.status(200), ctx.json({leaderBoardData: [
      {
        "personId": "5edf141c78f1380017b829a6",
        "name": "Dev Admin",
        "weeklyComittedHours": 10,
        "totaltime_hrs": 6,
        "totaltangibletime_hrs": 6,
        "totalintangibletime_hrs": 0,
        "percentagespentintangible": 100,
        "didMeetWeeklyCommitment": false,
        "weeklycommited": 10,
        "tangibletime": 6,
        "intangibletime": 0,
        "tangibletimewidth": 100,
        "intangibletimewidth": 0,
        "tangiblebarcolor": "orange",
        "totaltime": 6
      }]}), )  
  }),
  rest.get(userProjectsUrl, (req, res, ctx) =>  {
      return res(ctx.status(200), ctx.json(
        [
        {
          "isActive": true,
          "_id": "5ad91ec3590b19002acfcd26",
          "projectName": "HG Fake Project"
        }
      ]
    ));
  }),
  rest.get(timerUrl, (req, res, ctx) =>  {
    return res(ctx.status(200), ctx.json({}), )  
  }),
  rest.get('*', (req, res, ctx) => {
    console.error(`Please add request handler for ${req.url.toString()} in your MSW server requests.`);
    return res(
      ctx.status(500),
      ctx.json({ error: 'You must add request handler.' }),
    );
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
