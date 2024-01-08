import React from 'react';
import { fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { WeeklySummariesReport } from './WeeklySummariesReport';
import hasPermission from '../../utils/permissions';
import { authMock, userProfileMock, rolesMock, viewingUserMock } from '../../__tests__/mockStates';
import { renderWithProvider } from '../../__tests__/utils';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

const mockStore = configureStore([thunk]);

describe('WeeklySummariesReport page', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      auth: authMock,
      userProfile: userProfileMock,
      role: rolesMock.role,
      viewingUser: viewingUserMock,
    });
  });
  describe('On page load', () => {
    it('displays an error message if there is an error on data fetch', async () => {
      const props = {
        hasPermission: hasPermission,
        getWeeklySummariesReport: jest.fn(),
        fetchAllBadges: jest.fn(),
        error: { message: 'SOME ERROR CONNECTING!!!' },
        loading: false,
        summaries: [],
        authUser: { role: '' },
        roles: [],
        badges: [],
        getInfoCollections: jest.fn(),
      };
      renderWithProvider(<WeeklySummariesReport {...props} />, { store, });

      expect(screen.getByTestId('error')).toBeInTheDocument();
    });

    it('displays loading indicator', () => {
      const props = {
        hasPermission: hasPermission,
        getWeeklySummariesReport: jest.fn(),
        fetchAllBadges: jest.fn(),
        loading: true,
        summaries: [],
        authUser: { role: '' },
        roles: [],
        badges: [],
        getInfoCollections: jest.fn(),
      };
      renderWithProvider(<WeeklySummariesReport {...props} />, { store, });;
      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });
  });

  describe('Tabs display', () => {
    const props = {
      hasPermission: hasPermission,
      getWeeklySummariesReport: jest.fn(),
      fetchAllBadges: jest.fn(),
      getInfoCollections: jest.fn(),
      loading: false,
      summaries: [],
      authUser: { role: '' },
      roles: [],
      badges: [],
    };
    beforeEach(() => {
      renderWithProvider(<WeeklySummariesReport {...props} />, { store, });;
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should have second tab set to "active" by default', () => {
      expect(screen.getByTestId('Last Week').classList.contains('active')).toBe(true);
      expect(screen.getBy)
    });

    it('should make 1st tab active when clicked', () => {
      // First tab click.
      fireEvent.click(screen.getByTestId('This Week'));
      expect(screen.getByTestId('This Week').classList.contains('active')).toBe(true);
    });
    it('should make 2nd tab active when clicked', () => {
      // Second tab click.
      fireEvent.click(screen.getByTestId('Last Week'));
      expect(screen.getByTestId('Last Week').classList.contains('active')).toBe(true);
    });
    it('should make 3rd tab active when clicked', () => {
      // Third tab click.
      fireEvent.click(screen.getByTestId('Week Before Last'));
      expect(screen.getByTestId('Week Before Last').classList.contains('active')).toBe(true);
    });
    it('should make 4th tab active when clicked', () => {
      // Fourth tab click.
      fireEvent.click(screen.getByTestId('Three Weeks Ago'));
      expect(screen.getByTestId('Three Weeks Ago').classList.contains('active')).toBe(true);
    });
  });
});