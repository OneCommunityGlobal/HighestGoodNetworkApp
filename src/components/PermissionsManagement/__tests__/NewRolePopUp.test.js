import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import thunk from 'redux-thunk'; // I don't think I need thunk because the store update is synchronous. It is not asynchronous (i.e., it does not involve an HTTP request). 
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { shallow } from 'enzyme';
import PermissionList from '../PermissionList';

// Check that input element's value changes with user interaction

const { default: NewRolePopUp } = require("../NewRolePopUp")


// Since the PermissionList child component has complex behavior and log crucial to the overall functionality of the NewRolePopUp component, I will write test for it to ensure it works correctly. Such as...
  // Renders a list of permissions passed to it via props. (It actually just renders all the Permissions from the external file containing all the permission names and descriptions.)

// Use enzyme to mock the child component, PermissionList. To verify that it renders correctly. (Nah, I can't figure out how to use enzyme correctly with Redux components)

// Check that the Create button runs the handleSubmit function when clicked

// Check that the reducers work correctly (maybe not needed as the Unit test file specifically tests for the Reducers)

// Check that addNewRole works. 
  // mock addNewRole() and checks that it was called.

// mock togglePopUpNewRole() and roleNames data
const mockTogglePopUpNewRole = jest.fn()

// time entry 1: changed mockRoleNames from this to that. Found this out by console logging the props passed into NewRolePopUp when interacting with the component normally.
// const mockRoleNames = [
//   {
//     permissions: [
//       'postRole',
//       'deleteRole',
//       'putRole',
//       'addDeleteEditOwners',
//       'putUserProfilePermissions'
//     ],
//     roleName: 'Owner',
//   },
//   {
//     permissions: [
//       'seeBadges',
//       'assignBadges',
//       'createBadges',
//       'deleteBadges',
//       'updateBadges',
//     ],
//     roleName: 'Administrator',
//   }
// ]
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

describe('Render NewRolePopUp', () => {
  it('Renders without crashing', () => {
    renderComponent();
  });
  it('Render PermissionList child component', () => {
    // mock props
    const mockPermissionsChecked = []; // permissionsChecked is initially empty and remains empty in NewRolePopUp.jsx.
    const mockSetPermissionChecked = jest.fn();
    // The rendered component is stored in the 'container' variable.
    const { container } = render(
      <Provider store={store}>
        <PermissionList rolePermissions={mockPermissionsChecked} editable={true} setPermissions={mockSetPermissionChecked} />
      </Provider>
    );
    
    // Retrieve the first child element.
    const permissionList = container.firstChild // expect .user-role-tab__permissionList
    // jest-dom's toHaveClass() function (https://github.com/testing-library/jest-dom?tab=readme-ov-file#tohaveclass)
    expect(permissionList).toHaveClass('user-role-tab__permissionList')
    
    // Check that it renders somethings.

    /////////////////// My attempt at using Enzyme...  /////////////////// 
    // const wrapper = shallow(
    //   <Provider store={store}>
    //     <PermissionList rolePermissions={mockPermissionsChecked} editable={true} setPermissions={mockSetPermissionChecked} />
    //   </Provider>
    // );

    // expect(wrapper.find('.user-role-tab__permissionList')).to.have.lengthOf(1);
    // expect(wrapper.find('.user-role-tab__permissionList').length).toBe(1);
    // console.log(wrapper.debug()); // renders the PermissionList component like this: <Connect(PermissionList) rolePermissions={{...}} ... />
    
    /////////////////////////////////////////////////////////////////////
  });
  it('Create button on click dispatches action to store', async () => {
    // render component
    const container = renderComponent();

    // console.log(container.innerHTML);

    // select button
    // const createBtn = document.getElementById('createRole')
    const createBtn = screen.getByText('Create')
    expect(createBtn).toBeInTheDocument();
    
    
    // Add an input to Role field
    const roleInput = screen.getByPlaceholderText('Please enter a new role name')
    expect(roleInput).toBeInTheDocument()
    // Simulate a change event with a new value
    fireEvent.change(roleInput, { target: { value: 'temp' } });
    // console.log('roleInput.value: ' +  roleInput.value)

    expect(roleInput.value).toBe('temp')

    // click on button
    fireEvent.click(createBtn);

    // check that action is dispatched to store.
    const actions = store.getActions()
    console.log("🚀 ~ file: NewRolePopUp.test.js:139 ~ it ~ actions:", actions)

    await waitFor(() => {
      expect(actions).toHaveLength(1)
    })
  });


})