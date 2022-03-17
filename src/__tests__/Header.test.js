import {
  LOGO,
  DASHBOARD,
  TIMELOG,
  REPORTS,
  WEEKLY_SUMMARIES_REPORT,
  OTHER_LINKS,
  USER_MANAGEMENT,
  PROJECTS,
  TEAMS,
  WELCOME,
  VIEW_PROFILE,
  UPDATE_PASSWORD,
  LOGOUT,
} from '../languages/en/ui';
import { renderWithProvider, renderWithRouterMatch } from './utils.js';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import mockState from './mockAdminState.js';
import { createMemoryHistory } from 'history';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { ENDPOINTS } from '../utils/URL';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import routes from './../routes';
const url = ENDPOINTS.USER_PROFILE(mockState.auth.user.userid);
const timerUrl = ENDPOINTS.TIMER(mockState.auth.user.userid);
const userProjectsUrl = ENDPOINTS.USER_PROJECTS(mockState.auth.user.userid);

const server = setupServer(
  rest.get(url, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ firstName: 'fakeFirstName', profilePic: '/fakesrc.jpg' }),
    );
  }),
  rest.get('http://localhost:4500/api/dashboard/*', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          personId: '5edf141c78f1380017b829a6',
          name: 'Dev Admin',
          weeklyComittedHours: 10,
          totaltime_hrs: 6,
          totaltangibletime_hrs: 6,
          totalintangibletime_hrs: 0,
          percentagespentintangible: 100,
          didMeetWeeklyCommitment: false,
          weeklycommited: 10,
          tangibletime: 6,
          intangibletime: 0,
          tangibletimewidth: 100,
          intangibletimewidth: 0,
          tangiblebarcolor: 'orange',
          totaltime: 6,
        },
      ]),
    );
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

describe('Header structure', () => {
  let mountedHeader, rt, hist;
  beforeEach(() => {
    //used updatepassword as is an easy page without many extra server calls
    rt = '/updatepassword/5edf141c78f1380017b829a6';
    hist = createMemoryHistory({ initialEntries: [rt] });
  });

  it('should be rendered with the correct UI text items and profile information', async () => {
    mountedHeader = renderWithRouterMatch(routes, {
      initialState: mockState,
      route: rt,
      history: hist,
    });
    const textItems = [
      /**LOGO, */ DASHBOARD,
      TIMELOG,
      REPORTS,
      WEEKLY_SUMMARIES_REPORT,
      OTHER_LINKS,
      USER_MANAGEMENT,
      PROJECTS,
      TEAMS,
      VIEW_PROFILE,
      UPDATE_PASSWORD,
      LOGOUT,
    ];

    for (let i = 0; i < textItems.length; i++) {
      await waitFor(() => {
        expect(screen.getAllByText(textItems[i])).toBeTruthy();
      });
    }

    await waitFor(() => {
      expect(screen.getAllByText(WELCOME + ',' + ' fakeFirstName')).toBeTruthy();
    });

    await waitFor(() => {
      expect(mountedHeader.container.querySelector('img').getAttribute('src')).toBe('/fakesrc.jpg');
    });
  });

  it('should be rendered with the correct links', async () => {
    mountedHeader = renderWithRouterMatch(routes, {
      initialState: mockState,
      route: rt,
      history: hist,
    });

    const linkItems = [
      /*[LOGO, '/'], */ [DASHBOARD, '/dashboard'],
      [TIMELOG, `/timelog/${mockState.auth.user.userid}`],
      [REPORTS, '/reports'],
      [WEEKLY_SUMMARIES_REPORT, '/weeklysummariesreport'],
      [USER_MANAGEMENT, '/usermanagement'],
      [PROJECTS, '/projects'],
      [TEAMS, '/teams'],
      [VIEW_PROFILE, `/userprofile/${mockState.auth.user.userid}`],
      [UPDATE_PASSWORD, `/updatepassword/${mockState.auth.user.userid}`],
      [LOGOUT, '/logout'],
    ];

    for (let i = 0; i < linkItems.length; i++) {
      await waitFor(() => {
        let results = screen.getAllByText(linkItems[i][0]);
        expect(results[results.length - 1].closest('a')).toHaveAttribute('href', linkItems[i][1]);
      });
    }
  });

  it('should not render User Management if User is not administrator', async () => {
    mockState.auth.user.role = 'User';
    mountedHeader = renderWithRouterMatch(routes, {
      initialState: mockState,
      route: rt,
      history: hist,
    });

    await waitFor(() => {
      expect(screen.queryByText(USER_MANAGEMENT)).toBeNull();
    });
  });
});
