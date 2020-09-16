import React from 'react';
import { screen, render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  authMock, userProfileMock, timeEntryMock, userProjectMock,
} from '../mockStates';
import { renderWithProvider, renderWithRouterMatch } from '../utils';
import UserLinks from '../../components/UserProfile/UserLinks';


describe('user links tests', () => {
  beforeEach(() => {
    render(
      <UserLinks
        links={userProfileMock.personalLinks}
      />,
    );
  });
  it('should render links', () => {
    expect(screen.getAllByRole('link')).toHaveLength(userProfileMock.personalLinks.length);
  });
  it('should render links with the correct href', () => {
    const links = screen.getAllByRole('link');
    links.forEach((link, i) => {
      expect(link).toHaveAttribute('href', userProfileMock.personalLinks[i].Link);
    });
  });
});
