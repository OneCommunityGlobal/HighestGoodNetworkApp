import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import configureStore from 'redux-mock-store';
import ProjectTableHeader from './ProjectTableHeader';
import { renderWithProvider } from '../../../__tests__/utils';
import thunk from 'redux-thunk'
import { DELETE, PROJECT_NAME } from '../../../languages/en/ui'
import { rolesMock } from '../../../__tests__/mockStates'

const mockStore = configureStore([thunk]);

describe('ProjectTableHeader Tests', () => {
  let store;
  let mockHasPermission;

  // beforeEach(() => {
  //   store = mockStore({
  //     userProfile: { role: 'admin' }
  //   });
  //   mockHasPermission = jest.fn();
  // });
  beforeEach(() => {
    store = mockStore({
      auth: {
        user: {
          role: 'admin',
          permissions: {
            frontPermissions: ['deleteProject', 'seeProjectManagement']
          }
        }
      },
      role: rolesMock.role,

    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders all headers for admin with delete permissions', () => {
    mockHasPermission.mockReturnValue(true);
    renderWithProvider(<ProjectTableHeader hasPermission={mockHasPermission} />, { store });

    // Assertions for all headers including DELETE
    expect(screen.getByText(PROJECT_NAME)).toBeInTheDocument();
    // ... Other assertions
  });

  it('does not render delete header for user without delete permissions', () => {
    mockHasPermission.mockReturnValue(false);
    renderWithProvider(<ProjectTableHeader hasPermission={mockHasPermission} />, { store });

    // Assertion for absence of DELETE header
    expect(screen.queryByText(DELETE)).toBeNull();
  });

  // Additional test for edge cases
});
