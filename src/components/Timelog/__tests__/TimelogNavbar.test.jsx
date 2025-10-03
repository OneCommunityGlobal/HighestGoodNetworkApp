import React from 'react';
import { BrowserRouter, Router, Switch } from 'react-router-dom';
// import { BrowserRouter as Router , Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { screen, render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// import configureStore from 'redux-mock-store';
import { configureStore } from '@reduxjs/toolkit';
import TimelogNavbar from '../TimelogNavbar';
import { renderWithRouterMatch } from '../../../__tests__/utils';
// eslint-disable-next-line no-unused-vars
import { authMock, userProfileMock, timeEntryMock, userProjectMock } from '../../../__tests__/mockStates';
const mockStore = configureStore();

describe('TimelogNavbar', () => {
  let store;
  let component;

    const initialState = {
      userProfile: {
        firstName: 'John',
        lastName: 'Doe',
        weeklycommittedHours: 40,
      },
      timeEntries: {
        weeks: [
          [
            { hours: 10, minutes: 30 },
            { hours: 8, minutes: 0 },
            { hours: 6, minutes: 45 },
          ],
        ],
      },
    }
      beforeEach(() => {
        store = mockStore(initialState);
      });

      const renderNavbar = () =>
        render(
          <Provider store={store}>
            <Router>
              <TimelogNavbar userId="user123" />
            </Router>
          </Provider>
        );

  //   store = mockStore(initialState);
  //   component = render(
  //     <Provider store={store}>
  //       <Router>
  //         <TimelogNavbar userId="user123" />
  //       </Router>
  //     </Provider>
  //   );
  // });

  test('renders TimelogNavbar component', () => {
    renderNavbar();
    expect(screen.getByText('John Doe\'s Timelog')).toBeInTheDocument();
  });

  test('renders user name correctly', () => {
    renderNavbar();
    expect(screen.getByText('John Doe\'s Timelog')).toBeInTheDocument();
  });

  test('renders total effort and weekly committed hours correctly', () => {
    expect(screen.getByText(/Current Week\s*:\s*25\.25\s*\/\s*40/)).toBeInTheDocument();
  });

  it('renders progress bar with correct value and color', () => {
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '63');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    expect(progressBar).not.toHaveStyle('background-color: orange');
  });

  it('toggles navbar on click', () => {
    const toggleButton = screen.getByRole('button');
    const navElement = screen.getByRole('navigation');
    // Check if the navigation element is initially visible
    expect(navElement).not.toHaveAttribute('hidden');
    fireEvent.click(toggleButton);
  });

  it('renders "View Profile" link correctly', () => {
    const profileLink = screen.getByRole('link', { name: 'View Profile' });
    expect(profileLink).toHaveAttribute('href', '/userprofile/user123');
  });
});
