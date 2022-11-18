import React from 'react';
import { rolesMock } from '../../__tests__/mockStates';
import PermissionsManagement from './PermissionsManagement';
import thunk from 'redux-thunk';
import { Route } from 'react-router-dom';
import { screen } from '@testing-library/react';
import { renderWithRouterMatch } from '../../__tests__/utils';
import configureMockStore from 'redux-mock-store';
import userEvent from '@testing-library/user-event';

jest.mock('actions/role.js');

const mockStore = configureMockStore([thunk]);

describe('permissions management page structure', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      role: rolesMock.role,
    });
    store.dispatch = jest.fn();

    renderWithRouterMatch(
      <Route path="/permissionsmanagement">{props => <PermissionsManagement {...props} />}</Route>,
      {
        route: `/permissionsmanagement`,
        store,
      },
    );
  });

  it('should be rendered with one h1 User Roles', () => {
    expect(screen.getByText(/User Roles/i)).toBeInTheDocument();
  });

  it('should be rendered with one button Add New Role', () => {
    expect(screen.getByRole('button', { name: /add new role/i })).toBeInTheDocument();
  });

  describe('permissions management behavior', () => {
    it('should fire newRole modal with a form to create a new Role', () => {
      userEvent.click(screen.getByText(/add new role/i));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

  });
});
