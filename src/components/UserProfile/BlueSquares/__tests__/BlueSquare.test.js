import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import BlueSquare from '../BlueSquare';
import thunk from 'redux-thunk';
import mockAdminState from '__tests__/mockAdminState';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import hasPermission from 'utils/permissions';

const handleBlueSquare = jest.fn();

const mockStore = configureStore([thunk]);
const initialState = {
  auth: {
    user: {
      permissions: {
        frontPermissions: ['infringementAuthorizer', 'putUserProfileImportantInfo'],
        backPermissions: [],
      },
      role: 'Volunteer',
    },
  },
  userProfile: {
    infringements: [
      { _id: '1', date: '2023-12-03', description: 'some reason' },
      { _id: '2', date: '2023-12-10', description: 'test reason' },
    ],
  },
  role: mockAdminState.role,
};

let store;

beforeEach(() => {
  store = mockStore(initialState);
});
afterEach(() => {
  store.clearActions();
});

describe('BlueSquare component', () => {
  it('userProfile prop present', () => {
    render(
      <Provider store={store}>
        <BlueSquare
          blueSquares={store.getState().userProfile?.infringements}
          handleBlueSquare={handleBlueSquare}
        />
      </Provider>,
    );
    const blueSquareElements = screen.getAllByTestId('blueSquare');
    expect(blueSquareElements.length).toBeGreaterThanOrEqual(1);
  });
  it('userProfile prop is not present', () => {
    const mockInitialState = JSON.parse(JSON.stringify(initialState));
    delete mockInitialState.userProfile;
    const testStore = mockStore(mockInitialState);

    render(
      <Provider store={testStore}>
        <BlueSquare
          blueSquares={testStore.getState().userProfile?.infringements}
          handleBlueSquare={handleBlueSquare}
        />
      </Provider>,
    );
    expect(screen.queryByTestId('blueSquare')).not.toBeInTheDocument();
  });
  it('check date and description', () => {
    render(
      <Provider store={store}>
        <BlueSquare
          blueSquares={store.getState().userProfile?.infringements}
          handleBlueSquare={handleBlueSquare}
        />
      </Provider>,
    );
    expect(screen.queryByText('Dec-02-23')).toBeInTheDocument();
    expect(screen.queryByText('Dec-09-23')).toBeInTheDocument();
    expect(screen.queryByText('some reason')).toBeInTheDocument();
    expect(screen.queryByText('test reason')).toBeInTheDocument();
  });
  it('check if + sign is visible when infringementAuthorizer permission is not added', () => {
    const mockInitialState = JSON.parse(JSON.stringify(initialState));
    mockInitialState.auth.user.permissions.frontPermissions = [];
    const testStore = mockStore(mockInitialState);

    render(
      <Provider store={testStore}>
        <BlueSquare
          blueSquares={testStore.getState().userProfile?.infringements}
          handleBlueSquare={handleBlueSquare}
        />
      </Provider>,
    );
    expect(screen.queryByText('+')).not.toBeInTheDocument();
  });
  it('check if + sign is visible when infringementAuthorizer permission is added', () => {
    render(
      <Provider store={store}>
        <BlueSquare
          blueSquares={store.getState().userProfile?.infringements}
          handleBlueSquare={handleBlueSquare}
        />
      </Provider>,
    );
    expect(screen.queryByText('+')).toBeInTheDocument();
  });
  it('check if handleBlueSquare is called when user clicks on the button', () => {
    const { container } = render(
      <Provider store={store}>
        <BlueSquare
          blueSquares={store.getState().userProfile?.infringements}
          handleBlueSquare={handleBlueSquare}
        />
      </Provider>,
    );
    const blueSquareButtonElement = container.querySelector('.blueSquareButton');
    fireEvent.click(blueSquareButtonElement);
    expect(handleBlueSquare).toHaveBeenCalled();
  });
  it('check if handleBlueSquare is not called when user does not click on the button', () => {
    render(
      <Provider store={store}>
        <BlueSquare
          blueSquares={store.getState().userProfile?.infringements}
          handleBlueSquare={handleBlueSquare}
        />
      </Provider>,
    );
    expect(handleBlueSquare).not.toHaveBeenCalled();
  });
  it('check hasPermission function returns false if permission is not present', () => {
    const mockInitialState = JSON.parse(JSON.stringify(initialState));
    mockInitialState.auth.user.permissions.frontPermissions = [];
    const testStore = mockStore(mockInitialState);

    const permissionValue = testStore.dispatch(hasPermission('infringementAuthorizer'));
    expect(permissionValue).toBe(false);
    testStore.clearActions();
  });

  it('check hasPermission function returns true if permission is present', () => {
    const permissionValue = store.dispatch(hasPermission('infringementAuthorizer'));
    expect(permissionValue).toBe(true);
  });
});
