import React from 'react';
import Leaderboard from '../components/Leaderboard';
import { renderWithProvider, renderWithRouterMatch } from './utils.js'
import '@testing-library/jest-dom/extend-expect'
import mockState from './mockAdminState.js'
import { createMemoryHistory } from 'history';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { ENDPOINTS } from '../utils/URL';
import { render, fireEvent, waitFor, screen} from "@testing-library/react";
import routes from './../routes';
const url = ENDPOINTS.LEADER_BOARD(mockState.auth.user.userid);
const timerUrl = ENDPOINTS.TIMER(mockState.auth.user.userid);
const userProjectsUrl = ENDPOINTS.USER_PROJECTS(mockState.auth.user.userid);
let requestedLeaderBoard = false;

const server = setupServer( 
  rest.get(url, (req, res, ctx) =>  {
      requestedLeaderBoard = true;
      return res(ctx.status(200), ctx.json( [
        {
          "personId": "abdefghijklmnop",
          "name": "Fake Admin",
          "weeklyComittedHours": 10,
          "totaltime_hrs": 105,
          "totaltangibletime_hrs": 6,
          "totalintangibletime_hrs": 99,
          "percentagespentintangible": 100,
          "didMeetWeeklyCommitment": false,
          "weeklycommited": 10,
          "tangibletime": 6,
          "intangibletime": 9,
          "tangibletimewidth": 100,
          "intangibletimewidth": 0,
          "tangiblebarcolor": "orange",
          "totaltime": 15
        }]), )  
  }),
  rest.get('http://localhost:4500/api/userprofile/*', (req, res, ctx) =>  {
    return res(ctx.status(200), ctx.json({}), )  
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
    

describe('Leaderboard structure', () => {
    let mountedLeaderboard, rt, hist;
    beforeEach(()=> {
        //used dashboard as it has the Leaderboard as a subcomponent
        rt = '/dashboard'
        hist = createMemoryHistory({ initialEntries: [rt] });
        mountedLeaderboard = renderWithRouterMatch(routes , {initialState: mockState, route: rt, history: hist});
    });

    it('should be rendered with the correct table headers', async () => {
      
      await waitFor(()=>{
        expect(screen.getByText('Status')).toBeTruthy();
        expect(screen.getByText('Name')).toBeTruthy();
        expect(screen.getByText('intangibletime')).toBeTruthy();
        expect(screen.getByText('Progress')).toBeTruthy();
        expect(screen.getByText('totaltime')).toBeTruthy();
      });

      await sleep(20);

    });

    it('should have requested user data from server and have loaded that data into the leaderboard', async () => {
      
      await waitFor(()=>{
        expect(requestedLeaderBoard).toBe(true);
      });

      //Check for name, intangible and total time created by our MSW Server to have been loaded onto the page
      await waitFor(()=>{
        let nameLink = screen.getByText('Fake Admin');
        expect(nameLink).toBeTruthy();
        expect(nameLink.getAttribute('href')).toBe('/userprofile/abdefghijklmnop');
        expect(screen.getByText('99')).toBeTruthy();
        expect(screen.getByText('105')).toBeTruthy();
      });

      await sleep(20);

    });

});
