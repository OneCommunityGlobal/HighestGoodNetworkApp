import React from 'react';
import {
  screen,
  render,
  fireEvent,
  waitFor,
  waitForElementToBeRemoved,
  act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { authMock, userProfileMock, timerMock, timeEntryMock, userProjectMock } from './mockStates';
import { renderWithProvider, sleep } from './utils';
import Timer from '../components/Timer/Timer';
import * as actions from '../actions/timer';
import { ENDPOINTS } from '../utils/URL';

// jest.mock('../actions/timer.js');
const mockStore = configureMockStore([thunk]);
const url = ENDPOINTS.TIMER(authMock.user.userid);

const server = setupServer(
  // request for a forced password update.
  rest.put(url, (req, res, ctx) => res(ctx.status(200))),
  rest.get('*', (req, res, ctx) => res(ctx.status(200))),
  // Any other requests error out
  rest.get('*', (req, res, ctx) => {
    console.error(
      `Please add request handler for ${req.url.toString()} in your MSW server requests.`,
    );
    return res(ctx.status(500), ctx.json({ error: 'You must add request handler.' }));
  }),
);

beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(() => {
  // jest.clearAllMocks();
  server.resetHandlers();
});

describe('Timer component', () => {
  jest.useFakeTimers();
  let store;
  beforeEach(() => {
    store = mockStore({
      timer: timerMock,
      auth: authMock,
    });
    // store.dispatch = jest.fn();
    renderWithProvider(<Timer />, {
      store,
    });
  });
  describe('Structure', () => {
    it('should render the timer with 0:00:00', () => {
      expect(screen.getByText(/0:00:00/i)).toBeInTheDocument();
    });
    it('should render a `start` button', () => {
      expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
    });
    it('should render a `stop` button', () => {
      expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument();
    });
  });
  describe('Behavior', () => {
    it('should redner a `pause` button once the user clicks the `start` button', async () => {
      userEvent.click(screen.getByRole('button', { name: /start/i }));
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
      });
    });
    it('should render `start` button back once the user clicks the `pause` button', async () => {
      userEvent.click(screen.getByRole('button', { name: /start/i }));
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
      });
      userEvent.click(screen.getByRole('button', { name: /pause/i }));
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
      });
    });
    it('should render a modal after the user clicks `stop` button', async () => {
      userEvent.click(screen.getByRole('button', { name: /start/i }));
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
      });
      act(() => jest.advanceTimersByTime(1000));
      userEvent.click(screen.getByRole('button', { name: /stop/i }));
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });
  });
});
