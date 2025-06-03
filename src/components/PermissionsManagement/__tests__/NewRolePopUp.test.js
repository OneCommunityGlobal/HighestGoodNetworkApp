import React from 'react';
import { fireEvent, render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import CreateNewRolePopup from '../NewRolePopUp'
import { ModalProvider } from 'context/ModalContext';
import axios from 'axios';

jest.mock('axios');



const mockTogglePopUpNewRole = jest.fn()
const mockAddNewRole = jest.fn()
const mockRoleNames = [ 'Owner', 'Administrator' ]
const mockAuth = {
 isAuthenticated: true,
 user: {
   role: 'Owner',
   permissions: {
     frontPermissions: [],
     backPermissions: []
   },
 },
 firstName: 'Jerry'
}

const themeMock = {
  primaryColor: '#000000',
};
const middlewares = [thunk]
const mockStore = configureStore(middlewares)
const store = mockStore({
 auth: mockAuth,
 role: [mockRoleNames],
 theme: themeMock,
})

const renderComponent = () => {
  const { container } = render(
    <Provider store={store}>
      <ModalProvider>
      <CreateNewRolePopup toggle={mockTogglePopUpNewRole} addNewRole={mockAddNewRole} roleNames={mockRoleNames} />
      </ModalProvider>
    </Provider>
  )

const renderComponent = () => {
 const { container } = render(
   <Provider store={store}>
     <CreateNewRolePopup toggle={mockTogglePopUpNewRole} addNewRole={mockAddNewRole} roleNames={mockRoleNames} />
   </Provider>
 )


 return container
}


beforeEach(() => {
  store.clearActions();
  axios.get.mockResolvedValue({ data: {} });
});




describe('Render NewRolePopUp component', () => {
 it('Renders without crashing', () => {
   renderComponent();
 });
 it('Render PermissionList child component', () => {
   const container = renderComponent();
   const permissionListElement = container.querySelector('.user-role-tab__permissionList')
   expect(permissionListElement).toBeInTheDocument();
 });
 // it('Create button on click dispatches action to store', async () => {
 //   renderComponent();
 //   const createBtn = screen.getByText('Create')
  
 //   const roleInput = screen.getByPlaceholderText('Please enter a new role name')
 //   fireEvent.change(roleInput, { target: { value: 'newRole' } });
 //   expect(roleInput).toBeInTheDocument()
 //   expect(roleInput.value).toBe('newRole')
 //   expect(createBtn).toBeInTheDocument();
  
 //   fireEvent.click(createBtn);
 //   const actions = store.getActions()
  
 //   await waitFor(() => {
 //     expect(actions).toHaveLength(1)
 //     expect(actions).toContainEqual({ type: 'ADD_NEW_ROLE', payload: {} })
 //   })
 // });
 it('Error message appears when adding a duplicate role', async () => {
   renderComponent();
   const roleInput = screen.getByPlaceholderText('Please enter a new role name')
  
   expect(roleInput).toBeInTheDocument()
   fireEvent.change(roleInput, { target: { value: 'Administrator' } });
   expect(roleInput.value).toBe('Administrator')
  
   await waitFor(() => {
     expect(screen.getByText('Please enter a different role name')).toBeInTheDocument()
   })
 });
})
}