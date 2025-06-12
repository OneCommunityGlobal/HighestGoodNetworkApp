import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import '@testing-library/jest-dom';
import { authMock, userProfileMock, rolesMock, themeMock } from '../../../__tests__/mockStates';
import { renderWithProvider } from '../../../__tests__/utils';
import configureStore from 'redux-mock-store';
import Badge from '../Badge';
import { waitForElementToBeRemoved } from '@testing-library/react';
import thunk from 'redux-thunk';

const mockStore = configureStore([thunk]);

describe('Badge Component', () => {
  let store;
  const badgeProps = {
    userId: '123456789',
    userProfile: {
      personalBestMaxHrs: 50,
      badgeCollection: [],
      _id: 'fakeid',
      firstName: 'First Name',
      lastName: 'Last Name',
    },
  };

  // Initialize the mock store before each test
  beforeEach(() => {
    store = mockStore({
      auth: authMock,
      userProfile: userProfileMock,
      role: rolesMock.role,
      theme: themeMock,
    });
  });

  describe('Static components check', () => {
    describe('Title check', () => {
      it('should display the correct title upon render', () => {
        // Render the Badge component with the provided props and mock store
        const { container } = renderWithProvider(<Badge {...badgeProps} />, { store });
        const titleElement = container.querySelector('.card-header');
        expect(titleElement).toHaveTextContent('Badges');
      });
    });

    describe('Footer text check with empty badge collection', () => {
      it('should display the correct footer message upon render', () => {
        // Ensure the footer text is correct for an empty badge collection
        const { container } = renderWithProvider(<Badge {...badgeProps} />, { store });
        const titleElement = container.querySelector('.card-text');
        expect(titleElement).toHaveTextContent('You have no badges.');
      });
    });

    describe('Footer icon hover check', () => {
      it('should display the tooltip content upon hovering over and then disappear when moving out of the CountInfo icon', async () => {
        // Test tooltip visibility on hover and disappearance on mouse out
        const { container } = renderWithProvider(<Badge {...badgeProps} />, { store });
        const countInfoIcon = container.querySelector('#CountInfo');
        fireEvent.mouseOver(countInfoIcon);
        const tooltipContent = await screen.findByText(
          /This is the total number of badges you have earned./i,
          { timeout: 3000 },
        );
        expect(tooltipContent).toBeInTheDocument();
        fireEvent.mouseOut(countInfoIcon);
        await waitForElementToBeRemoved(() =>
          screen.queryByText(/This is the total number of badges you have earned./i),
        );
        expect(
          screen.queryByText(/This is the total number of badges you have earned./i),
        ).not.toBeInTheDocument();
      });
    });

    describe('Header icon hover check', () => {
      it('should display the tooltip content upon hovering over the BadgeInfo icon and then disappear when moving out', async () => {
        // Test tooltip visibility on hover and disappearance on mouse out for BadgeInfo icon
        const { container } = renderWithProvider(<Badge {...badgeProps} />, { store });
        const badgeInfoIcon = container.querySelector('#BadgeInfo');
        fireEvent.mouseOver(badgeInfoIcon);
        const tooltipContent = await screen.findByText(
          /There are several types of badges you can earn/i,
          { timeout: 3000 },
        );
        expect(tooltipContent).toBeInTheDocument();
        fireEvent.mouseOut(badgeInfoIcon);
        await waitForElementToBeRemoved(() =>
          screen.queryByText(/There are several types of badges you can earn/i),
        );
        expect(
          screen.queryByText(/There are several types of badges you can earn/i),
        ).not.toBeInTheDocument();
      });
    });

    describe('Footer text check with non-empty badge collection', () => {
      it('should display the correct footer message upon render', async () => {
        // Test the footer text with a non-empty badge collection
        store = mockStore({
          auth: authMock,
          userProfile: {
            ...userProfileMock,
            badgeCollection: [
              {
                badge: {
                  badgeName: 'Personal Max',
                  type: 'Personal Max',
                  imageUrl: 'url-to-personal-max-badge',
                  ranking: 1,
                  _id: 101,
                  description: 'Achieved personal maximum',
                },
                count: 1,
                lastModified: new Date().toISOString(),
                earnedDate: [],
              },
              {
                badge: {
                  badgeName: 'Test',
                  type: 'Test',
                  imageUrl: 'url-to-test-badge',
                  ranking: 2,
                  _id: 102,
                  description: 'Test badge description',
                },
                count: 12,
                lastModified: new Date().toISOString(),
                earnedDate: [],
              },
            ],
          },
          role: rolesMock.role,
          theme: themeMock,
        });
        const { container } = renderWithProvider(<Badge {...badgeProps} />, { store });
        const titleElement = container.querySelector('.card-text');
        expect(titleElement).toHaveTextContent(
          'Bravo! You have earned 13 badges and a personal best of 50 hours in a week!',
        );
      });
    });

    describe('Test UI changes in response to store updates', () => {
      it('should reflect UI changes when the store state changes', async () => {
        // Test component reactivity to store state changes
        const initialState = {
          auth: authMock,
          userProfile: userProfileMock,
          role: rolesMock.role,
          theme: themeMock,
        };
        let store = mockStore(initialState);
        const { container, rerender } = render(
          <Provider store={store}>
            <Badge {...badgeProps} />
          </Provider>,
        );

        const initialTitleElement = container.querySelector('.card-text');
        expect(initialTitleElement).toHaveTextContent('You have no badges.');

        const updatedUserProfile = {
          ...userProfileMock,
          badgeCollection: [
            ...userProfileMock.badgeCollection,
            {
              badge: {
                badgeName: 'Test2',
                type: 'Test2',
                imageUrl: 'url-to-test2-badge',
                ranking: 3,
                _id: 103,
                description: 'Test2 badge description',
              },
              count: 1,
              lastModified: new Date().toISOString(),
              earnedDate: [],
            },
          ],
        };

        const updatedState = {
          ...initialState,
          userProfile: updatedUserProfile,
        };

        store = mockStore(updatedState);
        rerender(
          <Provider store={store}>
            <Badge {...badgeProps} />
          </Provider>,
        );

        const updatedTitleElement = container.querySelector('.card-text');
        expect(updatedTitleElement).toHaveTextContent('Bravo! You have earned 1 badge!');
      });
    });
  });
});
