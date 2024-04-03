import React from 'react';
import { fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import WeeklySummariesReport from '../WeeklySummariesReport';
import hasPermission from '../../../utils/permissions';
import { authMock, userProfileMock, rolesMock } from '../../../__tests__/mockStates';
import { renderWithProvider } from '../../../__tests__/utils';
import thunk from 'redux-thunk';
import * as reduxHooks from 'react-redux';
import configureStore from 'redux-mock-store';

const mockStore = configureStore([thunk]);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'), // Import and re-export everything from the real module
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

describe('WeeklySummariesReport page', () => {
  // Mock store state
  const mockStoreState = {
    auth: authMock,
    userProfile: userProfileMock,
    role: rolesMock.role,
    // Add other initial state slices here
  };

  const mockDispatch = jest.fn();

  beforeEach(() => {
    // Reset mocks and set return values
    jest.clearAllMocks();
    reduxHooks.useDispatch.mockReturnValue(mockDispatch);
    reduxHooks.useSelector.mockImplementation(callback => callback(mockStoreState));
  });

  describe('On page load', () => {
    it('displays an error message if there is an error on data fetch', async () => {
      reduxHooks.useSelector.mockImplementation(callback => ({
        ...callback(mockStoreState),
        weeklySummariesReport: {
          error: { message: 'SOME ERROR CONNECTING!!!' },
          loading: false,
          summaries: [],
          hasPermission: hasPermission,
          getWeeklySummariesReport: jest.fn(),
          fetchAllBadges: jest.fn(),
          authUser: { role: '' },
          roles: [],
          badges: [],
          getInfoCollections: jest.fn(),
        },
      }));
      renderWithProvider(<WeeklySummariesReport />, {});
      expect(await screen.findByTestId('error')).toBeInTheDocument();
    });

    it('displays section title', async() => {
      reduxHooks.useSelector.mockImplementation(callback => ({
        ...callback(mockStoreState),
        weeklySummariesReport: {
          loading: true,
          summaries: [],
          hasPermission: hasPermission,
          getWeeklySummariesReport: jest.fn(),
          fetchAllBadges: jest.fn(),
          authUser: { role: '' },
          roles: [],
          badges: [],
          getInfoCollections: jest.fn(),
        },
      }));
      renderWithProvider(<WeeklySummariesReport />, {});
      await waitFor(() => {
        expect(screen.getByText(/Weekly Summaries Reports page/i)).toBeInTheDocument();
      });
    }, 3000);
  });
});
