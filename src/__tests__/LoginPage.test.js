
import { renderWithProvider, renderWithRouterMatch } from './utils.js'
import '@testing-library/jest-dom/extend-expect'
import thunk from 'redux-thunk';
import mockState from './mockAdminState.js'
import { GET_ERRORS } from '../constants/errors';
import { createMemoryHistory } from 'history';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { ENDPOINTS } from '../utils/URL';
import { render, fireEvent} from "@testing-library/react";
import routes from './../routes';
const url = ENDPOINTS.LOGIN;

const server = setupServer(
  rest.post(url, (req, res, ctx) =>  {
    if (req.body.email === 'validEmail@gmail.com' && req.body.password === 'validPass') {
      return res(ctx.status(200), ctx.json({token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOiI1ZWRmMTQxYzc4ZjEzODAwMTdiODI5YTYiLCJyb2xlIjoiQWRtaW5pc3RyYXRvciIsImV4cGlyeVRpbWVzdGFtcCI6IjIwMjAtMDgtMjhUMDU6MDA6NTguOTE0WiIsImlhdCI6MTU5NzcyNjg1OH0.zyPNn0laHv0iQONoIczZt1r5wNWlwSm286xDj-eYC4o'}), )
    } else if (req.body.email === 'newUserEmail@gmail.com' && req.body.password === 'validPass'){
      return res(ctx.status(200), ctx.json({new: true, token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOiI1ZWRmMTQxYzc4ZjEzODAwMTdiODI5YTYiLCJyb2xlIjoiQWRtaW5pc3RyYXRvciIsImV4cGlyeVRpbWVzdGFtcCI6IjIwMjAtMDgtMjhUMDU6MDA6NTguOTE0WiIsImlhdCI6MTU5NzcyNjg1OH0.zyPNn0laHv0iQONoIczZt1r5wNWlwSm286xDj-eYC4o'}), )
    } else {
      return res(ctx.status(403), ctx.json({message: 'Invalid email and/ or password.'}), )
    }
  }),  
  rest.get('http://localhost:4500/api/userprofile/*', (req, res, ctx) =>  {
      return res(ctx.status(200), ctx.json({}), )  
  }),
  rest.get('http://localhost:4500/api/dashboard/*', (req, res, ctx) =>  {
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

import { loginUser } from "../actions/authActions";

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

mockState.auth.isAuthenticated = false;

describe('Login behavior', () => {

  it('should perform correct redirection if user tries to access a proctected route from some other location', async () => {

    
    let rt = '/updatepassword/5edf141c78f1380017b829a6'
    const hist = createMemoryHistory({ initialEntries: [rt] });
    let loginMountedPage = renderWithRouterMatch(routes , {initialState: mockState, route: rt, history: hist});
    await sleep(100);
    let {getByLabelText, getByText} = loginMountedPage;
    fireEvent.change(getByLabelText('Email:'), {
      target: {value: 'validEmail@gmail.com'}
    });
    await sleep(10);
    fireEvent.change(getByLabelText('Password:'), {
      target: {value: 'validPass'}
    });
    await sleep(10);
    fireEvent.click(getByText('Submit'));
    await sleep(100);
    expect(getByLabelText('Current Password:')).toBeTruthy();
    return;
  });

  it('should redirect to dashboard if no previous redirection', async () => {

    const rt = '/login'
    const hist = createMemoryHistory({ initialEntries: [rt] });
    let loginMountedPage = renderWithRouterMatch(routes , {initialState: mockState, route: rt, history: hist});
    await sleep(100);
    let {getByLabelText, getByText} = loginMountedPage;
    fireEvent.change(getByLabelText('Email:'), {
      target: {value: 'validEmail@gmail.com'}
    });
    await sleep(10);
    fireEvent.change(getByLabelText('Password:'), {
      target: {value: 'validPass'}
    });
    await sleep(10);
    fireEvent.click(getByText('Submit'));
    await sleep(100);
    expect(getByText(/weekly summaries/i)).toBeTruthy();
  });

  it('should redirect to forcePassword Update if new User', async () => {

    let rt = '/login'
    const hist = createMemoryHistory({ initialEntries: [rt] });
    let loginMountedPage = renderWithRouterMatch(routes , {initialState: mockState, route: rt, history: hist});
    let {getByLabelText, getByText} = loginMountedPage;
    fireEvent.change(getByLabelText('Email:'), {
      target: {value: 'newUserEmail@gmail.com'}
    });
    await sleep(10);
    fireEvent.change(getByLabelText('Password:'), {
      target: {value: 'validPass'}
    });
    await sleep(10);
    fireEvent.click(getByText('Submit'));
    await sleep(100);
    expect(getByLabelText('New Password:')).toBeTruthy();

  });

  it('should populate errors if login fails', async () => {
    let rt = '/login'
    const hist = createMemoryHistory({ initialEntries: [rt] });
    let loginMountedPage = renderWithRouterMatch(routes , {initialState: mockState, route: rt, history: hist});
    let {getByLabelText, getByText} = loginMountedPage;
    fireEvent.change(getByLabelText('Email:'), {
      target: {value: 'incorrectEmail@gmail.com'}
    });
    await sleep(10);
    fireEvent.change(getByLabelText('Password:'), {
      target: {value: 'incorrectPassword'}
    });
    await sleep(10);
    fireEvent.click(getByText('Submit'));
    await sleep(100);
    expect(getByText('Invalid email and/ or password.')).toBeTruthy();
    
  });

  it('should test if loginUser action works correctly', async () => {
    const expectedAction = {
          type: GET_ERRORS,
          payload: {email: 'Invalid email and/ or password.'}
        };
    let cred = {email: "incorrectEmail", password: "incorrectPassword"};
    let anAction = await loginUser(cred);
    expect((typeof anAction)).toEqual('function');
    const dispatch = jest.fn();
    return anAction(dispatch).finally(()=>{
      expect(dispatch).toBeCalledWith(expectedAction);
    });
    
  });


});
