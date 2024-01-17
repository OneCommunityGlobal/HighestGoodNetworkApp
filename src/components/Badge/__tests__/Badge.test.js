import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { authMock, userProfileMock, rolesMock } from '../../../__tests__/mockStates';
import { renderWithEnzymeProvider as renderWithProvider } from '../../../__tests__/utils';
import configureStore from 'redux-mock-store';
import Badge from '../Badge';
import thunk from 'redux-thunk';

const mockStore = configureStore([thunk]);
describe('Badge Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      auth: authMock,
      userProfile: userProfileMock,
      role: rolesMock.role
    });
  })
  const badgeProps = {
    userId:'123456789',
    userProfile: {
      personalBestMaxHrs:50,
      badgeCollection: [],
      _id: 'fakeid',
      firstName: 'First Name',
      lastName: 'Last Name',
    },
  };

  describe('Static components check', () => {
    describe('Title check', () => {
      it('should display the correct title upon render', () => {
        const props = {
          ...badgeProps,
        };
        const renderedBadges = renderWithProvider(<Badge {...props} />, {
          store,
        });
        expect(renderedBadges.find('.card-header').text()).toContain('Badges');
      });
    });

    describe('Footer text check with empty badge collection', () => {
      it('should display the correct footer message upon render', () => {
        const props = {
          ...badgeProps,
        };
        const renderedBadges = renderWithProvider(<Badge {...props} />, {
          store,
        });
        expect(renderedBadges.find('.card-text').text()).toContain('You have no badges.');
      });
    });
    describe('Footer text check with 3 badge collection', () => {
      it('should display the correct footer message upon render', async () => {
        const props = {
          ...badgeProps,
          userProfile: {
            ...badgeProps.userProfile,
            badgeCollection: [   ],
          },
        };
        const renderedBadges = renderWithProvider(<Badge {...props} />, { store });
        // Use waitFor to wait for the assertion to pass
        await waitFor(() => {
          expect(renderedBadges.find('.card-text').text()).toContain('Bravo');
        });
      });
    });
  });
});

// test for positive cases
// test for negative cases