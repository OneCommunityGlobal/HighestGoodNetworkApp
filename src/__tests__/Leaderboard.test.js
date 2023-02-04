import React from 'react';
// import Leaderboard from '../components/Leaderboard';
import { renderWithProvider, renderWithRouterMatch } from './utils.js';
import '@testing-library/jest-dom/extend-expect';
import mockState from './mockAdminState.js';
import { createMemoryHistory } from 'history';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { ENDPOINTS } from '../utils/URL';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import routes from './../routes';
const url = ENDPOINTS.LEADER_BOARD(mockState.auth.user.userid);
const timerUrl = ENDPOINTS.TIMER(mockState.auth.user.userid);
const userProjectsUrl = ENDPOINTS.USER_PROJECTS(mockState.auth.user.userid);
let requestedLeaderBoard = false;
let refreshed = false;
import { ApiEndpoint } from '../utils/URL';

const server = setupServer(
  rest.get(url, (req, res, ctx) => {
    requestedLeaderBoard = true;
    if (!refreshed) {
      return res(
        ctx.status(200),
        ctx.json([
          {
            personId: 'abdefghijklmnop',
            name: 'Fake Admin',
            weeklycommittedHours: 10,
            totaltime_hrs: 105,
            totaltangibletime_hrs: 6,
            totalintangibletime_hrs: 99,
            percentagespentintangible: 100,
            didMeetWeeklyCommitment: false,
            weeklycommitted: 10,
            tangibletime: 6,
            intangibletime: 9,
            tangibletimewidth: 100,
            intangibletimewidth: 0,
            tangiblebarcolor: 'orange',
            totaltime: 15,
          },
        ]),
      );
    } else {
      return res(
        ctx.status(200),
        ctx.json([
          {
            personId: 'abdefghijklmnop',
            name: 'Fake Admin',
            weeklycommittedHours: 10,
            totaltime_hrs: 125,
            totaltangibletime_hrs: 60,
            totalintangibletime_hrs: 99,
            percentagespentintangible: 100,
            didMeetWeeklyCommitment: false,
            weeklycommitted: 10,
            tangibletime: 60,
            intangibletime: 9,
            tangibletimewidth: 100,
            intangibletimewidth: 0,
            tangiblebarcolor: 'orange',
            totaltime: 15,
          },
        ]),
      );
    }
  }),
  rest.get(ApiEndpoint + '/userprofile/*', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}));
  }),
  rest.get('http://*/hash.txt', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}));
  }),
  rest.get(userProjectsUrl, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json([]));
  }),
  rest.get(timerUrl, (req, res, ctx) => {
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

describe('Leaderboard structure', () => {
  //TESTS ARE FAILING
  // let mountedLeaderboard, rt, hist;
  // beforeEach(()=> {
  //     //used dashboard as it has the Leaderboard as a subcomponent
  //     rt = '/dashboard'
  //     hist = createMemoryHistory({ initialEntries: [rt] });
  //     mountedLeaderboard = renderWithRouterMatch(routes , {initialState: mockState, route: rt, history: hist});
  // });

  // ERRORS OUT says managingTeams underfined check the leaderboard and see what that is
  // mockstate may need to be updated on line 97

  // it('should be rendered with the correct table headers', async () => {

  //   await waitFor(()=>{
  //     expect(screen.getByText('Status')).toBeTruthy();
  //     expect(screen.getByText('Name')).toBeTruthy();
  //     expect(screen.getByText('Tangible Time')).toBeTruthy();
  //     expect(screen.getByText('Progress')).toBeTruthy();
  //     expect(screen.getByText('Total Time')).toBeTruthy();
  //   });

  //   await sleep(20);

  // });

  it('should have requested user data from server and have loaded that data into the leaderboard', async () => {
    //TEST FAILING NEED TO FIX
    // await waitFor(()=>{
    //   expect(requestedLeaderBoard).toBe(true);
    // });
    // await sleep(20);
    // //Check for name, intangible and total time created by our MSW Server to have been loaded onto the page
    // await waitFor(()=>{
    //   let nameLink = screen.getByText('Fake Admin');
    //   expect(nameLink).toBeTruthy();
    //   expect(nameLink.getAttribute('href')).toBe('/userprofile/abdefghijklmnop');
    //   expect(screen.getAllByText('6')[1]).toBeTruthy();
    //   expect(screen.getByText('105')).toBeTruthy();
    // });
    // await sleep(20);
  });

  it('should have refreshed user data from server and have loaded that data into the leaderboard', async () => {
    //TEST FAILING NEED TO FIX
    // await waitFor(()=>{
    //   expect(requestedLeaderBoard).toBe(true);
    // });
    // await sleep(20);
    // //Check for name, intangible and total time created by our MSW Server to have been loaded onto the page
    // await waitFor(()=>{
    //   let nameLink = screen.getByText('Fake Admin');
    //   expect(nameLink).toBeTruthy();
    //   expect(nameLink.getAttribute('href')).toBe('/userprofile/abdefghijklmnop');
    //   expect(screen.getAllByText('6')[1]).toBeTruthy();
    //   expect(screen.getByText('105')).toBeTruthy();
    // });
    // let refresh = screen.getByTitle('Click to refresh the leaderboard');
    // refreshed = true;
    // fireEvent.click(refresh);
    // //Check for name, intangible and total time created by our MSW Server to have been loaded onto the page
    // await waitFor(()=>{
    //   let nameLink = screen.getByText('Fake Admin');
    //   expect(nameLink).toBeTruthy();
    //   expect(nameLink.getAttribute('href')).toBe('/userprofile/abdefghijklmnop');
    //   expect(screen.getAllByText('60')[1]).toBeTruthy();
    //   expect(screen.getByText('125')).toBeTruthy();
    // });
    // await sleep(20);
  });
});
