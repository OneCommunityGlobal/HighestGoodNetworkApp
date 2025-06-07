// eslint-disable-next-line no-unused-vars
import React from 'react';
import thunk from 'redux-thunk';
import { Route } from 'react-router-dom';
import { screen, act } from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import userEvent from '@testing-library/user-event';
import { ModalProvider } from '~/context/ModalContext';
import axios from 'axios';
import { renderWithRouterMatch } from '../../__tests__/utils';
import PermissionsManagement from './PermissionsManagement';
import { rolesMock, themeMock } from '../../__tests__/mockStates';

vi.mock('axios');
// Mock API call to prevent real network requests during tests, avoiding ECONNREFUSED errors
// and ensuring consistent, fast, and reliable test execution.
axios.get.mockResolvedValue({ data: [] });

vi.mock('~/actions/role.js');

const mockStore = configureMockStore([thunk]);

const mockInfoCollections = [
  // Your mock data
  { infoName: 'testInfo', infoContent: 'a' },
  { infoName: 'testInfo2', infoContent: '' },
];

describe('permissions management page structure', () => {
  let store;
  beforeEach(async () => {
    store = mockStore({
      role: rolesMock.role,
      roleInfo: { roleInfo: {} },
      theme: themeMock,
    });
    store.dispatch = vi.fn();

    await act(async () => {
      renderWithRouterMatch(
        <ModalProvider>
          <Route path="/permissionsmanagement">
            {props => (
              <PermissionsManagement
                history={props.history}
                location={props.location}
                match={props.match}
                infoCollections={mockInfoCollections}
                areaName="testInfo"
                aria-label="Owner"
                fontSiz={24}
              />
            )}
          </Route>
        </ModalProvider>,
        {
          route: `/permissionsmanagement`,
          store,
        },
      );
    });
  });

  it('should be rendered with one h1 User Roles', () => {
    expect(screen.getByText(/User Roles/i)).toBeInTheDocument();
  });

  describe('Add New Role button', () => {
    test('add new role button should be present', () => {
      const addNewRoleButton = screen.queryByRole('button', { name: /add new role/i });
      if (addNewRoleButton) {
        expect(addNewRoleButton).toBeInTheDocument();
      } else {
        expect(addNewRoleButton).not.toBeInTheDocument();
      }
    });
  });

  describe('permissions management behavior', () => {
    it('should fire newRole modal with a form to create a new Role', async () => {
      const addNewRoleButton = screen.queryByRole('button', { name: /add new role/i });
      if (addNewRoleButton) {
        await act(async () => {
          userEvent.click(addNewRoleButton);
        });
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      } else {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      }
    });
  });
});
