import React from 'react';
import { Badges } from './Badges';
import { render } from 'enzyme';

describe('Badges Component', () => {
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
    it('should say "You\'ve earned..." when user is viewing their own profile', () => {
      const props = { ...badgeProps, isUserSelf: true };
      const renderedBadges = render(<Badges {...props} />);
      expect(renderedBadges.find('.card-footer').text()).toBe("Bravo! You've earned 0 badges! ");
    });

    it('should say "This person has earned..." when user is viewing someone else\'s profile', () => {
      const renderedBadges = render(<Badges {...badgeProps} />);
      expect(renderedBadges.find('.card-footer').text()).toBe(
        'Bravo! This person has earned 0 badges! ',
      );
    });

    it('should use the singular version of badge when the user has exactly 1 badge', () => {
      const props = {
        ...badgeProps,
        userProfile: { ...badgeProps.userProfile, badgeCollection: ['B1'] },
      };
      const renderedBadges = render(<Badges {...props} />);
      expect(renderedBadges.find('.card-footer').text()).toBe(
        'Bravo! This person has earned 1 badge! ',
      );
    });

    it('should use the plural version of badge when the user has any number of badges other than 1 ', () => {
      const props = {
        ...badgeProps,
        userProfile: { ...badgeProps.userProfile, badgeCollection: ['B1', 'B2'] },
      };
      const renderedBadges = render(<Badges {...props} />);
      expect(renderedBadges.find('.card-footer').text()).toBe(
        'Bravo! This person has earned 2 badges! ',
      );
    });
  });
});
