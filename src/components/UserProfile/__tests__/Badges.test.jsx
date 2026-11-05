// Badges.test.jsx
import { vi } from 'vitest';
vi.mock('react', async importOriginal => {
  const React = await importOriginal();
  return {
    ...React,
    useLayoutEffect: React.useEffect,
  };
});
import { render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Badges from '../Badges';
import { authMock, userProfileMock, rolesMock } from '../../../__tests__/mockStates';

// Mock the axios request that's failing
vi.mock('axios', () => ({
  get: vi.fn().mockResolvedValue({ data: [] }),
  defaults: {
    headers: {
      common: {},
    },
  },
}));

const mockStore = configureMockStore([thunk]);

// Custom render function with Redux provider
const renderWithReduxProvider = (ui, { store }) => {
  return render(<Provider store={store}>{ui}</Provider>);
};

describe('Badges Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      auth: {
        ...authMock,
        user: {
          ...authMock.user,
          userid: 'different-id', // Make sure authUser.userid !== displayUserId
        },
      },
      userProfile: userProfileMock,
      role: rolesMock.role,
      theme: {
        darkMode: false,
      },
    });
  });

  // Updated badge data with all required properties
  const badgeProps = {
    isUserSelf: false,
    userProfile: {
      badgeCollection: [],
      _id: 'fakeid',
      firstName: 'First Name',
      lastName: 'Last Name',
      personalBestMaxHrs: 40, // Add this property required by FeaturedBadges component
    },
    setUserProfile: vi.fn(),
    setOriginalUserProfile: vi.fn(),
    role: null,
    canEdit: true,
    handleSubmit: vi.fn(),
    userPermissions: [],
    darkMode: false, // Add darkMode prop
    displayUserId: 'fakeid', // Add displayUserId to match _id
    allBadgeData: [], // Add allBadgeData prop
  };

  // Helper function to create badge with all required properties
  const createBadge = (badgeName, type, count, id = `badge-${Math.random()}`) => ({
    _id: id,
    badge: {
      _id: `badge-obj-${id}`,
      badgeName,
      type,
      imageUrl: 'https://placekitten.com/100/100', // Add image URL
      description: `Description for ${badgeName}`, // Add description
      ranking: 1, // Add ranking for sorting
      lastModified: '2023-01-01',
    },
    count,
    lastModified: '2023-01-01',
    earnedDate: ['2023-01-01'], // Add earned dates array
    hasBadgeDeletionImpact: false, // Add this property for conditional rendering
  });

  describe('Card Footer Text', () => {
    describe('When viewing your own profile', () => {
      it('should display the correct text when you have no badges', () => {
        const props = {
          ...badgeProps,
          isUserSelf: true,
        };

        renderWithReduxProvider(<Badges {...props} />, { store });

        // Test might need to find text in specific element rather than just anywhere
        const footerElement = screen.getByText('You have no badges.');
        expect(footerElement).toBeInTheDocument();
      });

      it('should display the correct text when you have exactly 1 badge', () => {
        const props = {
          ...badgeProps,
          isUserSelf: true,
          userProfile: {
            ...badgeProps.userProfile,
            badgeCollection: [createBadge('Test Badge', 'Normal', 1)],
          },
        };

        renderWithReduxProvider(<Badges {...props} />, { store });

        // Get the footer element
        const footer = screen.getByText((content, element) => {
          return (
            element.tagName.toLowerCase() === 'div' &&
            content.includes('Bravo!') &&
            content.includes('You have') &&
            content.includes('earned')
          );
        });

        // Get the number from the link within the footer
        const badgeCountLink = within(footer).getByRole('link');
        expect(badgeCountLink.textContent).toBe('1');

        // Check for "badge" text (singular)
        expect(footer.textContent).toMatch(/badge!/);
      });

      it('should display the correct text when you have amount of badges > 1', () => {
        const props = {
          ...badgeProps,
          isUserSelf: true,
          userProfile: {
            ...badgeProps.userProfile,
            badgeCollection: [
              createBadge('Badge 1', 'Normal', 1, 'id1'),
              createBadge('Badge 2', 'Normal', 2, 'id2'),
              createBadge('Badge 3', 'Normal', 3, 'id3'),
            ],
          },
        };

        renderWithReduxProvider(<Badges {...props} />, { store });

        // Get the footer element
        const footer = screen.getByText((content, element) => {
          return (
            element.tagName.toLowerCase() === 'div' &&
            content.includes('Bravo!') &&
            content.includes('You have') &&
            content.includes('earned')
          );
        });

        // Get the number from the link within the footer
        const badgeCountLink = within(footer).getByRole('link');
        expect(badgeCountLink.textContent).toBe('6');

        // Check for "badges" text (plural)
        expect(footer.textContent).toMatch(/badges!/);
      });
    });

    describe("When viewing someone else's profile", () => {
      it('should display the correct text when they have no badges', () => {
        renderWithReduxProvider(<Badges {...badgeProps} />, { store });

        const footerElement = screen.getByText('This person has no badges.');
        expect(footerElement).toBeInTheDocument();
      });

      it('should display the correct text when they have exactly 1 badge', () => {
        const props = {
          ...badgeProps,
          userProfile: {
            ...badgeProps.userProfile,
            badgeCollection: [createBadge('Test Badge', 'Normal', 1)],
          },
        };

        renderWithReduxProvider(<Badges {...props} />, { store });

        // Get the footer element
        const footer = screen.getByText((content, element) => {
          return (
            element.tagName.toLowerCase() === 'div' &&
            content.includes('Bravo!') &&
            content.includes('This person has') &&
            content.includes('earned')
          );
        });

        // Get the number from the link within the footer
        const badgeCountLink = within(footer).getByRole('link');
        expect(badgeCountLink.textContent).toBe('1');

        // Check for "badge" text (singular)
        expect(footer.textContent).toMatch(/badge!/);
      });

      it('should display the correct text when they have amount of badges > 1', () => {
        const props = {
          ...badgeProps,
          userProfile: {
            ...badgeProps.userProfile,
            badgeCollection: [
              createBadge('Badge 1', 'Normal', 1, 'id1'),
              createBadge('Badge 2', 'Normal', 2, 'id2'),
              createBadge('Badge 3', 'Normal', 3, 'id3'),
            ],
          },
        };

        renderWithReduxProvider(<Badges {...props} />, { store });

        // Get the footer element
        const footer = screen.getByText((content, element) => {
          return (
            element.tagName.toLowerCase() === 'div' &&
            content.includes('Bravo!') &&
            content.includes('This person has') &&
            content.includes('earned')
          );
        });

        // Get the number from the link within the footer
        const badgeCountLink = within(footer).getByRole('link');
        expect(badgeCountLink.textContent).toBe('6');

        // Check for "badges" text (plural)
        expect(footer.textContent).toMatch(/badges!/);
      });
    });
  });
});
