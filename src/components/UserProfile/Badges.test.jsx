import React from 'react';
import Badges from './Badges';
import { renderWithEnzymeProvider as renderWithProvider } from '../../__tests__/utils';
import { authMock, userProfileMock, rolesMock } from '../../__tests__/mockStates';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

const mockStore = configureStore([thunk]);


describe('Badges Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      auth: authMock,
      userProfile: userProfileMock,
      role: rolesMock.role
    });
  })
  const badgeProps = {
    isUserSelf: false,
    userProfile: {
      badgeCollection: [],
      _id: 'fakeid',
      firstName: 'First Name',
      lastName: 'Last Name',
    },
    setUserProfile: jest.fn(),
    setOriginalUserProfile: jest.fn(),
    role: null,
    canEdit: true,
    handleSubmit: jest.fn(),
    userPermissions: [],
  };
  describe('Card Footer Text', () => {
    describe('When viewing your own profile', () => {
      it('should display the correct text when you have no badges', () => {
        const props = {
          ...badgeProps,
          isUserSelf: true,
        };
        const renderedBadges = renderWithProvider(<Badges {...props} />, {
          store,
        });
        expect(renderedBadges.find('.card-footer').text()).toBe('You have no badges. ');
      });

      it('should display the correct text when you have exactly 1 badge', () => {
        const props = {
          ...badgeProps,
          isUserSelf: true,
          userProfile: { ...badgeProps.userProfile, badgeCollection: ['B1'] },
        };
        const renderedBadges = renderWithProvider(<Badges {...props} />, {
          store,
        });
        expect(renderedBadges.find('.card-footer').text()).toBe('Bravo! You have earned 1 badge! ');
      });

      it('should display the correct text when you have amount of badges > 1', () => {
        const props = {
          ...badgeProps,
          isUserSelf: true,
          userProfile: {
            ...badgeProps.userProfile,
            badgeCollection: ['B1', 'B2', 'B3'],
          },
        };
        const renderedBadges = renderWithProvider(<Badges {...props} />, {
          store,
        });
        // This uses a regular expression that matches all postive numbers > 1.
        expect(renderedBadges.find('.card-footer').text()).toMatch(
          /Bravo! You have earned ([1-9]\d+|[2-9]) badges! /,
        );
      });
    });

    describe("When viewing someone else's profile", () => {
      it('should display the correct text when they have no badges', () => {
        const renderedBadges = renderWithProvider(<Badges {...badgeProps} />, {
          store,
        });
        expect(renderedBadges.find('.card-footer').text()).toBe('This person has no badges. ');
      });

      it('should display the correct text when they have exactly 1 badge', () => {
        const props = {
          ...badgeProps,
          userProfile: { ...badgeProps.userProfile, badgeCollection: ['B1'] },
        };
        const renderedBadges = renderWithProvider(<Badges {...props} />, {
          store,
        });
        expect(renderedBadges.find('.card-footer').text()).toBe(
          'Bravo! This person has earned 1 badge! ',
        );
      });

      it('should display the correct text when they have amount of badges > 1', () => {
        const props = {
          ...badgeProps,
          userProfile: {
            ...badgeProps.userProfile,
            badgeCollection: ['B1', 'B2', 'B3'],
          },
        };

        const renderedBadges = renderWithProvider(<Badges {...props} />, {
          store,
        });
        expect(renderedBadges.find('.card-footer').text()).toMatch(
          /Bravo! This person has earned ([1-9]\d+|[2-9]) badges! /,
        );
      });
    });
  });
});
