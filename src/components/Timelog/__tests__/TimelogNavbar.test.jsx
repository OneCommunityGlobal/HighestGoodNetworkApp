// eslint-disable-next-line no-unused-vars
import React from 'react';
// eslint-disable-next-line no-unused-vars
import { screen, render, fireEvent } from '@testing-library/react';
// eslint-disable-next-line no-unused-vars
import userEvent from '@testing-library/user-event';
import configureStore from 'redux-mock-store';
import { Route } from 'react-router-dom';
import TimelogNavbar from '../TimelogNavbar';
import { renderWithRouterMatch } from '../../../__tests__/utils';
// eslint-disable-next-line no-unused-vars
import { authMock, userProfileMock, timeEntryMock, userProjectMock } from '../../../__tests__/mockStates';

const mockStore = configureStore();
const userId = '5edf141c78f1380017b829a6';
describe('<TimelogNavbar/>', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      userProfile: userProfileMock,
      timeEntries: timeEntryMock,
    });
    store.dispatch = vi.fn();
    renderWithRouterMatch(
      <Route>
        <TimelogNavbar userId={userId} />
      </Route>,
      {
        store,
      },
    );
  });

  it('should render <TimelogNavbar/> without crashing', () => {
    const viewProfileLink = screen.getByRole('link', { name: /view profile/i });
    expect(viewProfileLink).toHaveAttribute('href', expect.stringContaining(userId));
  });
  it('should render <TimelogNavbar/> with the right user name', () => {
    const navBarTitle = screen.getByText(/.*'s Timelog/).textContent;
    expect(navBarTitle).toMatch(
      `${userProfileMock.firstName} ${userProfileMock.lastName}'s Timelog`,
    );
  });
});

describe('test navigation bar color', () => {
  it('should render red bar', () => {
    const store = mockStore({
      userProfile: userProfileMock,
      timeEntries: {
        weeks: [
          [
            {
              hours: 0,
              minutes: 0,
            },
          ],
        ],
      },
    });
    renderWithRouterMatch(
      <Route>
        <TimelogNavbar userId={userId} />
      </Route>,
      {
        store,
      },
    );
  });
  it('should render orange bar', () => {
    const store = mockStore({
      userProfile: userProfileMock,
      timeEntries: {
        weeks: [
          [
            {
              hours: 8,
              minutes: 0,
            },
          ],
        ],
      },
    });
    renderWithRouterMatch(
      <Route>
        <TimelogNavbar userId={userId} />
      </Route>,
      {
        store,
      },
    );
  });
  it('should render green bar', () => {
    const store = mockStore({
      userProfile: userProfileMock,
      timeEntries: {
        weeks: [
          [
            {
              hours: 15,
              minutes: 0,
            },
          ],
        ],
      },
    });
    renderWithRouterMatch(
      <Route>
        <TimelogNavbar userId={userId} />
      </Route>,
      {
        store,
      },
    );
  });
  it('should render blue bar', () => {
    const store = mockStore({
      userProfile: userProfileMock,
      timeEntries: {
        weeks: [
          [
            {
              hours: 25,
              minutes: 0,
            },
          ],
        ],
      },
    });
    renderWithRouterMatch(
      <Route>
        <TimelogNavbar userId={userId} />
      </Route>,
      {
        store,
      },
    );
  });
  it('should render indigo bar', () => {
    const store = mockStore({
      userProfile: userProfileMock,
      timeEntries: {
        weeks: [
          [
            {
              hours: 38,
              minutes: 0,
            },
          ],
        ],
      },
    });
    renderWithRouterMatch(
      <Route>
        <TimelogNavbar userId={userId} />
      </Route>,
      {
        store,
      },
    );
  });
  it('should render violet bar', () => {
    const store = mockStore({
      userProfile: userProfileMock,
      timeEntries: {
        weeks: [
          [
            {
              hours: 47,
              minutes: 0,
            },
          ],
        ],
      },
    });
    renderWithRouterMatch(
      <Route>
        <TimelogNavbar userId={userId} />
      </Route>,
      {
        store,
      },
    );
  });
  it('should render purple bar', () => {
    const store = mockStore({
      userProfile: userProfileMock,
      timeEntries: {
        weeks: [
          [
            {
              hours: 70,
              minutes: 0,
            },
          ],
        ],
      },
    });
    renderWithRouterMatch(
      <Route>
        <TimelogNavbar userId={userId} />
      </Route>,
      {
        store,
      },
    );
  });
});
