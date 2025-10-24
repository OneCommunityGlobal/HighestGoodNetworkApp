// Badges.test.jsx
import React from 'react';
import Badges from '../Badges';
import { renderWithEnzymeProvider as renderWithProvider } from '../../../__tests__/utils';
import { authMock, userProfileMock, rolesMock } from '../../../__tests__/mockStates';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

// Mock useLayoutEffect to useEffect to avoid SSR warnings in test environment
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useLayoutEffect: jest.requireActual('react').useEffect,
}));

const mockStore = configureStore([thunk]);

describe('Badges Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      auth: authMock,
      userProfile: userProfileMock,
      role: rolesMock.role,
    });
  });

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
        expect(renderedBadges.find('.card-footer').text()).toBe('You have no badges.');
      });
      // Modified this test case to match improved badge structure, see PR3098 for details
      it('should display the correct text when you have exactly 1 badge', () => {
        const props = {
          ...badgeProps,
          isUserSelf: true,
          userProfile: { ...badgeProps.userProfile, badgeCollection: [{ badge: { badgeName: 'Test Badge', type: 'Normal' }, count: 1 }] },
        };
        const renderedBadges = renderWithProvider(<Badges {...props} />, {
          store,
        });
        expect(renderedBadges.find('.card-footer').text()).toBe('Bravo! You have earned 1 badge!');
      });
      // Modified this test case to match improved badge structure, see PR3098 for details
      it('should display the correct text when you have amount of badges > 1', () => {
        const props = {
          ...badgeProps,
          isUserSelf: true,
          userProfile: {
            ...badgeProps.userProfile,
            badgeCollection: [
              { badge: { badgeName: 'Badge 1', type: 'Normal' }, count: 1 },
              { badge: { badgeName: 'Badge 2', type: 'Normal' }, count: 2 },
              { badge: { badgeName: 'Badge 3', type: 'Normal' }, count: 3 }
            ],
          },
        };
        const renderedBadges = renderWithProvider(<Badges {...props} />, {
          store,
        });
        expect(renderedBadges.find('.card-footer').text()).toMatch(
          /Bravo! You have earned ([1-9]\d+|[2-9]) badges!/
        );
      });
    });

    describe("When viewing someone else's profile", () => {
      it('should display the correct text when they have no badges', () => {
        const renderedBadges = renderWithProvider(<Badges {...badgeProps} />, {
          store,
        });
        expect(renderedBadges.find('.card-footer').text()).toBe('This person has no badges.');
      });
      // Modified this test case to match improved badge structure, see PR3098 for details
      it('should display the correct text when they have exactly 1 badge', () => {
        const props = {
          ...badgeProps,
          userProfile: { ...badgeProps.userProfile, badgeCollection: [{ badge: { badgeName: 'Test Badge', type: 'Normal' }, count: 1 }] },
        };
        const renderedBadges = renderWithProvider(<Badges {...props} />, {
          store,
        });
        expect(renderedBadges.find('.card-footer').text()).toBe(
          'Bravo! This person has earned 1 badge!'
        );
      });
      // Modified this test case to match improved badge structure, see PR3098 for details
      it('should display the correct text when they have amount of badges > 1', () => {
        const props = {
          ...badgeProps,
          userProfile: {
            ...badgeProps.userProfile,
            badgeCollection: [
              { badge: { badgeName: 'Badge 1', type: 'Normal' }, count: 1 },
              { badge: { badgeName: 'Badge 2', type: 'Normal' }, count: 2 },
              { badge: { badgeName: 'Badge 3', type: 'Normal' }, count: 3 }
            ],
          },
        };
        const renderedBadges = renderWithProvider(<Badges {...props} />, {
          store,
        });
        expect(renderedBadges.find('.card-footer').text()).toMatch(
          /Bravo! This person has earned ([1-9]\d+|[2-9]) badges!/
        );
      });
    });
  });
});