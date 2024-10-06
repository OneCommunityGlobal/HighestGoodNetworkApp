import React from 'react';
import LeaderBoard from '../Leaderboard.jsx'; // Ensure correct import path
import { renderWithProvider, renderWithRouterMatch } from '../../../__tests__/utils.js';
import '@testing-library/jest-dom/extend-expect';
import mockState from '../../../__tests__/mockAdminState.js';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { ENDPOINTS } from '../../../utils/URL.js';
import routes from '../../../routes.js'; // Ensure you import routes

// Dynamically build URLs based on mockState data
const url = ENDPOINTS.LEADER_BOARD(mockState.auth.user.userid);
const userProjectsUrl = ENDPOINTS.USER_PROJECTS(mockState.auth.user.userid);

let requestedLeaderBoard = false;
let refreshed = false;

// Mock window.scrollTo to prevent test errors
window.scrollTo = jest.fn();

// Mock Server Setup
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
        ])
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
        ])
      );
    }
  }),
  rest.get(userProjectsUrl, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json([]));
  }),
  rest.get('*', (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({ error: 'You must add request handler.' })
    );
  })
);

// Server lifecycle hooks
beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

describe('Leaderboard structure', () => {
  
  // Test to directly render the LeaderBoard component
  it('should render LeaderBoard directly and check table headers', async () => {
    renderWithProvider(<LeaderBoard />, {
      initialState: mockState,
    });

    await waitFor(() => {
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Tangible Time')).toBeInTheDocument();
      expect(screen.getByText('Progress')).toBeInTheDocument();
      expect(screen.getByText('Total Time')).toBeInTheDocument();
    });
  });

  it('should request user data from the server and load that data into the leaderboard', async () => {
    renderWithRouterMatch(routes, {
      initialState: mockState,
      route: '/dashboard',
    });

    // Wait for leaderboard data to be requested
    await waitFor(() => {
      expect(requestedLeaderBoard).toBe(true);
    });

    // Check if data is rendered correctly
    await waitFor(() => {
      let nameLink = screen.getByText('Fake Admin');
      expect(nameLink).toBeInTheDocument();
      expect(nameLink.getAttribute('href')).toBe('/userprofile/abdefghijklmnop');
      expect(screen.getAllByText('6')[1]).toBeInTheDocument();
      expect(screen.getByText('105')).toBeInTheDocument();
    });
  });

  it('should refresh user data from the server and reload that data into the leaderboard', async () => {
    renderWithRouterMatch(routes, {
      initialState: mockState,
      route: '/dashboard',
    });

    // Wait for initial data load
    await waitFor(() => {
      expect(requestedLeaderBoard).toBe(true);
    });

    // Simulate a refresh event
    const refresh = screen.getByTitle('Click to refresh the leaderboard') || screen.getByRole('button', { name: /refresh/i });
    refreshed = true;
    fireEvent.click(refresh);

    // Check if refreshed data is rendered correctly
    await waitFor(() => {
      let nameLink = screen.getByText('Fake Admin');
      expect(nameLink).toBeInTheDocument();
      expect(nameLink.getAttribute('href')).toBe('/userprofile/abdefghijklmnop');
      expect(screen.getAllByText('60')[1]).toBeInTheDocument();
      expect(screen.getByText('125')).toBeInTheDocument();
    });
  });
});
