import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import WBSItem from '../WBSItem';
import thunk from 'redux-thunk';
import mockAdminState from '__tests__/mockAdminState';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import hasPermission from 'utils/permissions';
import getPopupById from 'actions/popupEditorAction';
import axios from 'axios';
import { permissions } from 'utils/constants';


const index = 0;
const key = 'item123';
const wbsId = 'item123';
const projectId = 'project123';
const name = 'test';

const mockStore = configureStore([thunk]);
let store;
beforeEach(() => {
  store = mockStore({
    auth: {
      user: {
        permissions: {
          frontPermissions: ['deleteWbs'],
          backPermissions: [],
        },
        role: 'Manager',
      },
    },
    role: mockAdminState.role,
  });
});

afterEach(() => {
  store.clearActions();
});

jest.mock('axios');

const renderComponent = (index, key, wbsId, projectId, name) => {
  return render(
    <Provider store={store}>
      <table>
        <tbody>
          <WBSItem
            index={index}
            key={key}
            wbsId={wbsId}
            projectId={projectId}
            name={name}
            popupEditor={{ currPopup: { popupContent: 'this is popup content' } }}
          />
        </tbody>
      </table>
    </Provider>,
  );
};

describe('WBSItem component', () => {
  it('check index is displaying properly', () => {
    renderComponent(index, key, wbsId, projectId, name);
    expect(screen.queryByText('0')).toBeInTheDocument();
  });
  it('check name and link associated with name displays properly', () => {
    renderComponent(index, key, wbsId, projectId, name);
    expect(screen.queryByText('test')).toBeInTheDocument();
    const linkElement = screen.getByRole('link');
    const hrefAttributeElement = linkElement.getAttribute('href');
    expect(hrefAttributeElement).toBe(`/wbs/tasks/${wbsId}/${projectId}/${name}`);
  });
  it('check if deleteWBS html elements get displayed in virtual DOM when the permission is not present', () => {
    store.getState().auth.user.permissions.frontPermissions = [];
    const { container } = renderComponent(index, key, wbsId, projectId, name);
    expect(container.querySelector('.members__assign')).not.toBeInTheDocument();
  });

  it('check if deleteWBS html elements get displayed in virtual DOM when the permission is present', () => {
    const { container } = renderComponent(index, key, wbsId, projectId, name);
    expect(container.querySelector('.members__assign')).toBeInTheDocument();
  });
  it('check if modal opens when button is clicked', async () => {
    axios.get.mockResolvedValue({
      data: 'test',
    });
    renderComponent(index, key, wbsId, projectId, name);
    const buttonElement = screen.getByRole('button');
    fireEvent.click(buttonElement);
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
  it('check if modal does not open when button is not clicked', async () => {
    renderComponent(index, key, wbsId, projectId, name);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
  it('check hasPermission returns true when the permission is present', () => {
    store.getState().auth.user.role = 'Volunteer';
    const permissionValue = store.dispatch(hasPermission(permissions.projects.deleteWbs));
    expect(permissionValue).toBe(true);
  });
  it('check hasPermission returns false when the permission is not present', () => {
    store.getState().auth.user.role = 'Volunteer';
    store.getState().auth.user.permissions.frontPermissions = [];
    const permissionValue = store.dispatch(hasPermission(permissions.projects.deleteWbs));
    expect(permissionValue).toBe(false);
  });
});
