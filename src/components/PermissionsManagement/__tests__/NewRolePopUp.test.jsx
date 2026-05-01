import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { configureStore } from 'redux-mock-store';
import { ModalProvider } from '~/context/ModalContext';
import axios from 'axios';
import CreateNewRolePopup from '../NewRolePopUp';

vi.mock('axios');

const mockTogglePopUpNewRole = vi.fn();
const mockAddNewRole = vi.fn();
const mockRoleNames = ['Owner', 'Administrator'];
const mockAuth = {
  isAuthenticated: true,
  user: {
    role: 'Owner',
    permissions: {
      frontPermissions: [],
      backPermissions: [],
    },
  },
  firstName: 'Jerry',
};
const themeMock = { primaryColor: '#000000' };
const middlewares = [thunk];
const mockStore = configureStore(middlewares);
let store;

// Helper to render the component with our mocked store & context
const renderComponent = () => {
  store = mockStore({
    auth: mockAuth,
    role: [mockRoleNames],
    theme: themeMock,
  });
  store.clearActions();
  axios.get.mockResolvedValue({ data: {} });

  return render(
    <Provider store={store}>
      <ModalProvider>
        <CreateNewRolePopup
          toggle={mockTogglePopUpNewRole}
          addNewRole={mockAddNewRole}
          roleNames={mockRoleNames}
        />
      </ModalProvider>
    </Provider>,
  );
};

describe('Render NewRolePopUp component', () => {
  beforeEach(() => {
    // reset the axios mock and store before each test
    store = mockStore({
      auth: mockAuth,
      role: [mockRoleNames],
      theme: themeMock,
    });
    store.clearActions();
    axios.get.mockResolvedValue({ data: {} });
  });

  it('renders without crashing', () => {
    const { container } = renderComponent();
    expect(container).toBeInTheDocument();
  });

  it('renders PermissionList child component(s)', () => {
    renderComponent();
    const permissionListElements = screen.getAllByTestId('permission-list');
    expect(permissionListElements.length).toBeGreaterThan(0);
  });

  // Uncomment and fill in if you want to test dispatching ADD_NEW_ROLE:
  // it('Create button on click dispatches action to store', async () => {
  //   renderComponent()
  //   const roleInput = screen.getByPlaceholderText('Please enter a new role name')
  //   fireEvent.change(roleInput, { target: { value: 'newRole' } })
  //   fireEvent.click(screen.getByText('Create'))
  //   await waitFor(() => {
  //     const actions = store.getActions()
  //     expect(actions).toHaveLength(1)
  //     expect(actions[0].type).toBe('ADD_NEW_ROLE')
  //   })
  // })

  it('error message appears when adding a duplicate role', async () => {
    renderComponent();
    const roleInput = screen.getByPlaceholderText('Please enter a new role name');

    fireEvent.change(roleInput, { target: { value: 'Administrator' } });
    await waitFor(() => {
      expect(screen.getByText('Please enter a different role name')).toBeInTheDocument();
    });
  });
});
