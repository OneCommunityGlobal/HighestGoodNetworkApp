import { renderWithProvider, renderWithRouterMatch } from '../utils.js';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import mockState from '../mockAdminState.js';
import { GET_ERRORS } from '../../constants/errors';
import { createMemoryHistory } from 'history';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { ENDPOINTS } from '../../utils/URL';
import * as Message from '../../languages/en/messages';
import { render, fireEvent, waitFor, screen, within } from '@testing-library/react';
import routes from '../../routes';

const projectMembersUrl = ENDPOINTS.PROJECT_MEMBER('5ad91ec3590b19002asacd26');
const searchUsersUrl = ENDPOINTS.USER_PROFILES;
const userProfileUrl = ENDPOINTS.USER_PROFILE(mockState.auth.user.userid);
const leaderboardUrl = ENDPOINTS.LEADER_BOARD(mockState.auth.user.userid);
const timerUrl = ENDPOINTS.TIMER(mockState.auth.user.userid);
const userProjectsUrl = ENDPOINTS.USER_PROJECTS(mockState.auth.user.userid);
let deleteMemberCalled = false;
let addedMemberCalled = false;
let activatedProjectCalled = false;
let nameChangeCalled = false;
let addedProject = false;
mockState.allProjects.fetched = false;
mockState.allProjects.projects = [];

const server = setupServer(
  rest.get(projectMembersUrl, (req, res, ctx) => {
    if (deleteMemberCalled) {
      deleteMemberCalled = false;
      return res(ctx.status(200), ctx.json([]));
    }
    return res(
      ctx.status(200),
      ctx.json([
        {
          firstName: 'Fake',
          lastName: 'Volunteer',
          _id: '5ad91ec3590b19002asacd26',
        },
      ]),
    );
  }),
  rest.post(projectMembersUrl, (req, res, ctx) => {
    if (req.body.users[0].operation == 'unAssign') {
      deleteMemberCalled = true;
    } else {
      addedMemberCalled = true;
    }

    return res(ctx.status(200), ctx.json({}));
  }),
  rest.get(searchUsersUrl, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          isActive: false,
          weeklyComittedHours: 0,
          createdDate: '2019-01-26T20:24:48.672Z',
          _id: '5c4cc2109487b0003924f1e3',
          role: 'Administrator',
          firstName: 'Test',
          lastName: 'Admin',
          email: 'onecommunityglobal@gmail.com',
          reactivationDate: '2020-09-12T00:00:00.000Z',
        },
        {
          isActive: false,
          weeklyComittedHours: 0,
          createdDate: '2019-01-26T20:24:48.672Z',
          _id: 'ad91ec3590b19002asacd26',
          role: 'Administrator',
          firstName: 'Fake',
          lastName: 'Volunteer',
          email: 'onecommunityglobal@gmail.com',
          reactivationDate: '2020-09-12T00:00:00.000Z',
        },
      ]),
    );
  }),
  rest.get(userProjectsUrl, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json([]));
  }),
  rest.get(userProfileUrl, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}));
  }),
  rest.get(leaderboardUrl, (req, res, ctx) => {
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
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('Project Members behavior', () => {
  let projectMemMountedPage;

  it('should get the members list and display it on the page', async () => {
    let rt = '/project/members/5ad91ec3590b19002asacd26';
    const hist = createMemoryHistory({ initialEntries: [rt] });
    projectMemMountedPage = renderWithRouterMatch(routes, {
      initialState: mockState,
      route: rt,
      history: hist,
    });
    await waitFor(() => expect(screen.getByRole('table')).toBeTruthy());

    await waitFor(() => expect(screen.getByText('Fake Volunteer')).toBeTruthy());
  });

  it('should have a delete button that removes the member', async () => {
    let rt = '/project/members/5ad91ec3590b19002asacd26';
    const hist = createMemoryHistory({ initialEntries: [rt] });
    projectMemMountedPage = renderWithRouterMatch(routes, {
      initialState: mockState,
      route: rt,
      history: hist,
    });
    await waitFor(() => expect(screen.getByRole('table')).toBeTruthy());
    let table = within(screen.getByRole('table'));
    await waitFor(() => expect(table.getByRole('button')).toBeTruthy());
    fireEvent.click(table.getByRole('button'));
    await waitFor(() => expect(deleteMemberCalled).toBeTruthy());
    deleteMemberCalled = false;
    await waitFor(() => expect(screen.queryAllByText('Fake Volunteer').length).toBe(0));
  });

  it('should return Test Admin when searching for a', async () => {
    let rt = '/project/members/5ad91ec3590b19002asacd26';
    const hist = createMemoryHistory({ initialEntries: [rt] });
    projectMemMountedPage = renderWithRouterMatch(routes, {
      initialState: mockState,
      route: rt,
      history: hist,
    });
    await waitFor(() => expect(screen.getByPlaceholderText('Name')).toBeTruthy());
    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'a' } });
    let inputDiv = within(projectMemMountedPage.container.querySelector('.input-group'));
    fireEvent.click(inputDiv.getAllByRole('button')[0]);
    await waitFor(() => expect(screen.getAllByRole('table').length).toBe(2));
    await waitFor(() => expect(screen.getByText('Test Admin')).toBeTruthy());
  });

  it('should return Test Admin when looking at all users', async () => {
    let rt = '/project/members/5ad91ec3590b19002asacd26';
    const hist = createMemoryHistory({ initialEntries: [rt] });
    projectMemMountedPage = renderWithRouterMatch(routes, {
      initialState: mockState,
      route: rt,
      history: hist,
    });
    fireEvent.click(screen.getByText('All'));
    await waitFor(() => expect(screen.getAllByRole('table').length).toBe(2));
    await waitFor(() => expect(screen.getByText('Test Admin')).toBeTruthy());
    await waitFor(() =>
      expect(screen.getByText('Test Admin').closest('a')).toHaveAttribute(
        'href',
        '/userprofile/5c4cc2109487b0003924f1e3',
      ),
    );
  });

  it('should be able to add Test Admin to members list by click +All button', async () => {
    let rt = '/project/members/5ad91ec3590b19002asacd26';
    const hist = createMemoryHistory({ initialEntries: [rt] });
    projectMemMountedPage = renderWithRouterMatch(routes, {
      initialState: mockState,
      route: rt,
      history: hist,
    });
    fireEvent.click(screen.getByText('All'));
    let tables;
    await waitFor(() => {
      tables = screen.getAllByRole('table');
      expect(tables.length).toBe(2);
    });
    await waitFor(() => expect(screen.getByText('Test Admin')).toBeTruthy());
    fireEvent.click(screen.getByText('+All'));
    const { getByText } = within(tables[1]);
    await waitFor(() => expect(getByText('Test Admin')).toBeTruthy());
  });

  it('should be able to add Test Admin to members list by click that users plus button', async () => {
    let rt = '/project/members/5ad91ec3590b19002asacd26';
    const hist = createMemoryHistory({ initialEntries: [rt] });
    projectMemMountedPage = renderWithRouterMatch(routes, {
      initialState: mockState,
      route: rt,
      history: hist,
    });
    fireEvent.click(screen.getByText('All'));
    let tables;
    await waitFor(() => {
      tables = screen.getAllByRole('table');
      expect(tables.length).toBe(2);
    });
    await waitFor(() => expect(screen.getByText('Test Admin')).toBeTruthy());
    fireEvent.click(within(tables[0]).getAllByRole('button')[1]);
    const { getByText } = within(tables[1]);
    await waitFor(() => expect(getByText('Test Admin')).toBeTruthy());
  });
});
