
import { renderWithProvider, renderWithRouterMatch } from './utils.js'
import '@testing-library/jest-dom/extend-expect'
import React from 'react';
import mockState from './mockAdminState.js'
import { GET_ERRORS } from '../constants/errors';
import { createMemoryHistory } from 'history';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { ENDPOINTS } from '../utils/URL';
import { render, fireEvent, waitFor, screen} from "@testing-library/react";
import routes from './../routes';

const projectsUrl = ENDPOINTS.PROJECTS;
const projectUrl = ENDPOINTS.PROJECT + '*';
const userProfileUrl = ENDPOINTS.USER_PROFILE(mockState.auth.user.userid);
const leaderboardUrl = ENDPOINTS.LEADER_BOARD(mockState.auth.user.userid);
let deleteProjectCalled = false;
let inActivateProjectCalled = false;
let activatedProjectCalled = false;
let nameChangeCalled = false;
mockState.allProjects.fetched = false;

const server = setupServer(
  rest.get(projectsUrl, (req, res, ctx) =>  {
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
  rest.post(projectsUrl, (req, res, ctx) =>  {
    return res(ctx.status(200), ctx.json({}));
  }),
  rest.delete(projectUrl, (req, res, ctx) =>  {
    deleteProjectCalled = true;
    return res(ctx.status(200), ctx.json({}));
  }),
  rest.put(projectUrl, (req, res, ctx) =>  {
    if (!req.body.isActive && req.body.projectName === "HG Fake Project") {
        inActivateProjectCalled = true;
    } else if (!req.body.isActive && req.body.projectName === "HG Fake Project") {
        activatedProjectCalled = true;
    } else if (req.body.projectName === "HG Fake Project2") {
      nameChangeCalled = true;
    }
    return res(ctx.status(200), ctx.json({}));
  }),    
  rest.get(userProfileUrl, (req, res, ctx) =>  {
      return res(ctx.status(200), ctx.json({}), )  
  }),
  rest.get(leaderboardUrl, (req, res, ctx) =>  {
    return res(ctx.status(200), ctx.json( [
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
      }]), )  
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

describe('Projects behavior', () => {
  let projectsMountedPage;

  it('should update the projects list to include only the project from the server', async () => {
    
    let rt = '/projects'
    const hist = createMemoryHistory({ initialEntries: [rt] });
    projectsMountedPage = renderWithRouterMatch(routes , {initialState: mockState, route: rt, history: hist});

    await waitFor(() => expect(screen.getByDisplayValue('HG Fake Project')).toBeTruthy());
    await waitFor(() => expect(screen.queryByDisplayValue('HG Food')).toBeNull());
  });

  it('should pop up a modal and not delete a project when the delete button is clicked and canceled', async () => {
    
    let rt = '/projects'
    const hist = createMemoryHistory({ initialEntries: [rt] });
    projectsMountedPage = renderWithRouterMatch(routes , {initialState: mockState, route: rt, history: hist});

    await waitFor(() => expect(screen.getByDisplayValue('HG Fake Project')).toBeTruthy());
    fireEvent.click(screen.getByText('Delete'));
    //Modal Pops Up
    await waitFor(() => expect(screen.getByText('Confirm Deletion')).toBeTruthy());
    fireEvent.click(screen.getByText('Close'));
    await waitFor(() => expect(screen.getByDisplayValue('HG Fake Project')).toBeTruthy());
    await waitFor(() => expect(screen.queryByText('Confirm Deletion')).toBeNull());
    expect(deleteProjectCalled).toBe(false);
    
  });

  it('should pop up a modal and not delete a project when the delete button is clicked and you click off the modal', async () => {
    
    let rt = '/projects'
    const hist = createMemoryHistory({ initialEntries: [rt] });
    projectsMountedPage = renderWithRouterMatch(routes , {initialState: mockState, route: rt, history: hist});

    await waitFor(() => expect(screen.getByDisplayValue('HG Fake Project')).toBeTruthy());
    fireEvent.click(screen.getByText('Delete'));
    //Modal Pops Up
    await waitFor(() => expect(screen.getByText('Confirm Deletion')).toBeTruthy());
    fireEvent.click(screen.getByText('Close'));
    await waitFor(() => expect(screen.getByDisplayValue('HG Fake Project')).toBeTruthy());
    await waitFor(() => expect(screen.queryByText('Confirm Deletion')).toBeNull());
    expect(deleteProjectCalled).toBe(false);
    
  });


  it('should pop up a modal and not delete a project when the delete button is clicked and setInactive', async () => {
    
    let rt = '/projects'
    const hist = createMemoryHistory({ initialEntries: [rt] });
    projectsMountedPage = renderWithRouterMatch(routes , {initialState: mockState, route: rt, history: hist});

    await waitFor(() => expect(screen.getByDisplayValue('HG Fake Project')).toBeTruthy());
    fireEvent.click(screen.getByText('Delete'));
    //Modal Pops Up
    await waitFor(() => expect(screen.getByText('Confirm Deletion')).toBeTruthy());
    fireEvent.click(screen.getByText('Set inactive'));
    await waitFor(() => expect(screen.getByDisplayValue('HG Fake Project')).toBeTruthy());
    await waitFor(() => expect(screen.queryByText('Confirm Deletion')).toBeNull());
    expect(deleteProjectCalled).toBe(false);
    expect(inActivateProjectCalled).toBeTruthy();
    inActivateProjectCalled = false;
    
  });

  it('should link to the members section', async () => {
    
    let rt = '/projects'
    const hist = createMemoryHistory({ initialEntries: [rt] });
    projectsMountedPage = renderWithRouterMatch(routes , {initialState: mockState, route: rt, history: hist});

    await waitFor(() => expect(screen.getByDisplayValue('HG Fake Project')).toBeTruthy());
    
    await waitFor(() => 
    expect(projectsMountedPage.container.querySelector('td a').getAttribute('href'))
    .toBe('/project/members/5ad91ec3590b19002acfcd26')
    );

    
  });

  it('should inactivate and then reactivate a project when the activate button is clicked', async () => {
    
    let rt = '/projects'
    const hist = createMemoryHistory({ initialEntries: [rt] });
    projectsMountedPage = renderWithRouterMatch(routes , {initialState: mockState, route: rt, history: hist});

    await waitFor(() => expect(screen.getByDisplayValue('HG Fake Project')).toBeTruthy());
    
    fireEvent.click(projectsMountedPage.container.querySelector('td i'));
    
    await waitFor(() => expect(inActivateProjectCalled).toBeTruthy());
    inActivateProjectCalled = false;

    fireEvent.click(projectsMountedPage.container.querySelector('td i'));
    await waitFor(() => expect(activatedProjectCalled));
    activatedProjectCalled = false;
    
  });

  it('should be able to change the name of a project to a new name', async () => {
    
    let rt = '/projects'
    const hist = createMemoryHistory({ initialEntries: [rt] });
    projectsMountedPage = renderWithRouterMatch(routes , {initialState: mockState, route: rt, history: hist});

    await waitFor(() => expect(screen.getByDisplayValue('HG Fake Project')).toBeTruthy());
    
    fireEvent.change(screen.getByDisplayValue('HG Fake Project'), { target: { value: 'HG Fake Project2'}});
    fireEvent.blur(screen.getByDisplayValue('HG Fake Project2'));

    await waitFor(() => expect(screen.getByDisplayValue('HG Fake Project2')).toBeTruthy());
    await waitFor(() => expect(nameChangeCalled).toBeTruthy());
    nameChangeCalled = false;
    
  });

  //add test for adding a new project

  //add test for error updating project modal
  

  it('should delete a project when the delete button is clicked and confirmed', async () => {
    
    let rt = '/projects'
    const hist = createMemoryHistory({ initialEntries: [rt] });
    projectsMountedPage = renderWithRouterMatch(routes , {initialState: mockState, route: rt, history: hist});

    await waitFor(() => expect(screen.getByDisplayValue('HG Fake Project')).toBeTruthy());
    fireEvent.click(screen.getByText('Delete'));
    //Modal Pops Up
    await waitFor(() => expect(screen.getByText('Confirm Deletion')).toBeTruthy());
    fireEvent.click(screen.getByText('Confirm'));
    await waitFor(() => expect(screen.queryByDisplayValue('HG Fake Project')).toBeNull());
    expect(deleteProjectCalled).toBe(true);
  });

});
