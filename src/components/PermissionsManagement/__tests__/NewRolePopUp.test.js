import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import PermissionList from '../PermissionList';
const { default: NewRolePopUp } = require("../NewRolePopUp")

const mockTogglePopUpNewRole = jest.fn()

const mockRoleNames = [ 'Owner', 'Administrator' ]

const mockAuth = {
  isAuthenticated: true,
  user: {
    userid: '64d9571e5fe856d8590c43eb',
    role: 'Owner',
    permissions: {
      frontPermissions: [],
      backPermissions: []
    },
    access: {
      canAccessBMPortal: false
    },
    expiryTimestamp: '2024-02-20T17:21:11.844Z',
    iat: 1707585671
  },
  firstName: 'Jerry'
}

// mock the store
const middlewares = [thunk]
const mockStore = configureStore(middlewares)
const store = mockStore({
  auth: mockAuth,
  role: [mockRoleNames]
})

const renderComponent = () => {
  const { container } = render(
    <Provider store={store}>
      <NewRolePopUp toggle={mockTogglePopUpNewRole} roleNames={mockRoleNames} />
    </Provider>
  )

  return container
}

beforeEach(() => {
  store.clearActions(); // clear the dispatched actions stored internally by the mock store instance
});


describe('Render NewRolePopUp', () => {
  it('Renders without crashing', () => {
    renderComponent();
  });
  it('Render PermissionList child component', () => {
    const mockPermissionsChecked = []; // permissionsChecked is initially empty and remains empty in NewRolePopUp.jsx.
    const mockSetPermissionChecked = jest.fn();
    const { container } = render(
      <Provider store={store}>
        <PermissionList rolePermissions={mockPermissionsChecked} editable={true} setPermissions={mockSetPermissionChecked} />
      </Provider>
    );
    const permissionList = container.firstChild // expect .user-role-tab__permissionList
    expect(permissionList).toHaveClass('user-role-tab__permissionList')
  });
  it('Create button on click dispatches action to store', async () => {
    const container = renderComponent();
    const createBtn = screen.getByText('Create')
    expect(createBtn).toBeInTheDocument();
    
    // Add an input to Role field
    const roleInput = screen.getByPlaceholderText('Please enter a new role name')
    expect(roleInput).toBeInTheDocument()
    fireEvent.change(roleInput, { target: { value: 'newRole' } });
    expect(roleInput.value).toBe('newRole')

    // click on button
    fireEvent.click(createBtn);

    // check that action is dispatched to store.
    const actions = store.getActions()
    console.log("🚀 ~ file: NewRolePopUp.test.js:139 ~ it ~ actions:", actions)
    
    await waitFor(() => {
      expect(actions).toHaveLength(1)
      expect(actions).toContainEqual({ type: 'ADD_NEW_ROLE', payload: {} })
      console.log("🚀 ~ file: NewRolePopUp.test.js:159 ~ it ~ actions:", actions)
    })
  });
  it('Error message appears when adding a duplicate role', async () => {
    const container = renderComponent();
    const roleInput = screen.getByPlaceholderText('Please enter a new role name')
    
    expect(roleInput).toBeInTheDocument()
    fireEvent.change(roleInput, { target: { value: 'Administrator' } });
    expect(roleInput.value).toBe('Administrator')
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a different role name')).toBeInTheDocument()
    })
  });
})