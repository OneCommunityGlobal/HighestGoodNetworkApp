import React from 'react';
import { fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { WeeklySummariesReport } from './WeeklySummariesReport';
import hasPermission from '../../utils/permissions';
import { authMock, userProfileMock, rolesMock } from '../../__tests__/mockStates';
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
    });
  });
  describe('On page load', () => {
    it('displays an error message if there is an error on data fetch', async () => {
      const props = {
        hasPermission: hasPermission,
        getWeeklySummariesReport: jest.fn(),
        error: { message: 'SOME ERROR CONNECTING!!!' },
        loading: false,
        summaries: [],
        authUser: { role: '' },
        roles: [],
        getInfoCollections: jest.fn(),
      };
      renderWithProvider(<WeeklySummariesReport {...props} />, { store, });;

      await waitFor(() => screen.getByTestId('loading'));

      expect(screen.getByTestId('error')).toBeInTheDocument();
    });

    it('displays loading indicator', () => {
      const props = {
        hasPermission: hasPermission,
        getWeeklySummariesReport: jest.fn(),
        loading: true,
        summaries: [],
        authUser: { role: '' },
        roles: [],
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
      getInfoCollections: jest.fn(),
      loading: false,
      summaries: [],
      authUser: { role: '' },
      roles: [],
    };
    beforeEach(() => {
      renderWithProvider(<WeeklySummariesReport {...props} />, { store, });;
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should have second tab set to "active" by default', () => {
      expect(screen.getByTestId('tab-2').classList.contains('active')).toBe(true);
    });

    it('should make 1st tab active when clicked', () => {
      // First tab click.
      fireEvent.click(screen.getByTestId('tab-1'));
      expect(screen.getByTestId('tab-1').classList.contains('active')).toBe(true);
    });
    it('should make 2nd tab active when clicked', () => {
      // Second tab click.
      fireEvent.click(screen.getByTestId('tab-2'));
      expect(screen.getByTestId('tab-2').classList.contains('active')).toBe(true);
    });
    it('should make 3rd tab active when clicked', () => {
      // Third tab click.
      fireEvent.click(screen.getByTestId('tab-3'));
      expect(screen.getByTestId('tab-3').classList.contains('active')).toBe(true);
    });
    it('should make 4th tab active when clicked', () => {
      // Fourth tab click.
      fireEvent.click(screen.getByTestId('tab-4'));
      expect(screen.getByTestId('tab-4').classList.contains('active')).toBe(true);
    });
  });
});
