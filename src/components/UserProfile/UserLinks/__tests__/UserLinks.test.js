import React from 'react';
import { screen } from '@testing-library/react';
import { userProfileMock } from '../../../../__tests__/mockStates';
import { renderWithRouter } from '../../../../__tests__/utils';
import UserLinks from '../UserLinks';

describe('user links tests', () => {
  beforeEach(() => {
    renderWithRouter(<UserLinks links={userProfileMock.personalLinks} />);
  });
  it('should render links', () => {
    expect(screen.getAllByRole('link')).toHaveLength(userProfileMock.personalLinks.length);
  });
  it('should render links with the correct href', () => {
    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', `/${userProfileMock.personalLinks[0].Link}`);
  });
});
