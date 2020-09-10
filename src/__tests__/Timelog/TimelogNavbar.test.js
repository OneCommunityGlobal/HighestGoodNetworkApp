import React from 'react';
import { screen, render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureStore from 'redux-mock-store';
import TimelogNavbar from '../../components/Timelog/TimelogNavbar';
import { renderWithProvider } from '../utils';
import { authMock, userProfileMock, timeEntryMock, userProjectMock } from '../mockStates';
const mockStore = configureStore();
describe('<TimelogNavbar/>', () => {
  const userId = '5edf141c78f1380017b829a6';
  beforeEach(() => {
    const store = mockStore({
      userProfile: userProfileMock,
      timeEntries: timeEntryMock,
    });
    renderWithProvider(<TimelogNavbar userId={userId} />,
      { store });
  });
  it('should render <TimelogNavbar/> without crashing', () => {
    const viewProfileLink = screen.getByRole('link', { name: /view profile/i });
    expect(viewProfileLink).toHaveAttribute('href', expect.stringContaining(userId));
  });

  it('should render <TimelogNavbar/> with the right user name', () => {
    const navBarTitle = screen.getByText(/.*'s Timelog/).textContent;
    expect(navBarTitle).toMatch(`${userProfileMock.firstName} ${userProfileMock.lastName}'s Timelog`);
  });
  it('should render <TimelogNavbar/> with the correct `view profile` link', () => {
    const viewProfileLink = screen.getByRole('link', { name: /view profile/i });
    expect(viewProfileLink).toHaveAttribute('href', expect.stringContaining(userId));
  });
});