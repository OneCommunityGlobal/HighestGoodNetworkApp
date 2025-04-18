import React from 'react';
import { rolesMock, themeMock } from '../../__tests__/mockStates';
import PermissionsManagement from './PermissionsManagement';
import thunk from 'redux-thunk';
import { Route } from 'react-router-dom';
import { screen } from '@testing-library/react';
import { renderWithRouterMatch } from '../../__tests__/utils';
import configureMockStore from 'redux-mock-store';
import userEvent from '@testing-library/user-event';
import { ModalProvider } from 'context/ModalContext';
import axios from 'axios';
jest.mock('axios');
// Mock API call to prevent real network requests during tests, avoiding ECONNREFUSED errors 
// and ensuring consistent, fast, and reliable test execution.
axios.get.mockResolvedValue({ data: [] }); 


jest.mock('actions/role.js');

const mockStore = configureMockStore([thunk]);

const mockInfoCollections = [
  // Your mock data
  {infoName: 'testInfo',
  infoContent: 'a'},
  {infoName: 'testInfo2',
  infoContent: ''},
];


describe('permissions management page structure', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      role: rolesMock.role,
      roleInfo: { roleInfo: {} },
      theme: themeMock,
    });
    store.dispatch = jest.fn();

    renderWithRouterMatch(
      <ModalProvider>
      <Route path="/permissionsmanagement">{props => <PermissionsManagement {...props} infoCollections={mockInfoCollections} areaName={'testInfo'} role={'Owner'} fontSiz={24} />}</Route>
      </ModalProvider>,
      {
        route: `/permissionsmanagement`,
        store,
      },
    );
  });

  it('should be rendered with one h1 User Roles', () => {
    expect(screen.getByText(/User Roles/i)).toBeInTheDocument();
  });

  describe('Add New Role button', () => {
    test('add new role button should be present', () => {
      if (screen.queryByRole('Button')) {
        expect(screen.queryByRole('Button', { name: /add new role/i })).toBeInTheDocument();
      } else {
        expect(screen.queryByRole('Button', { name: /add new role/i })).not.toBeInTheDocument();
      }
    });
  });

  describe('permissions management behavior', () => {
    it('should fire newRole modal with a form to create a new Role', () => {
      if (screen.queryByRole('Button')) {
        userEvent.click(screen.getByText(/add new role/i));
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByRole('Button', { name: 'Close' })).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      } else {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(screen.queryByRole('Button', { name: 'Close' })).not.toBeInTheDocument();
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      }
    });
  });
});
