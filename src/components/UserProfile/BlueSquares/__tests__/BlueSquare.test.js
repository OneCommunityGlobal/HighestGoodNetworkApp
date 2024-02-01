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

const store = mockStore({
  auth: {
    user: {
      permissions: {
        frontPermissions: ['infringementAuthorizer', 'putUserProfileImportantInfo'],
        backPermissions: [],
      },
      role: 'Manager',
    },
  },
  userProfile: {
    infringements: [
      { _id: '1', date: '2023-12-03', description: 'some reason' },
      { _id: '2', date: '2023-12-10', description: 'test reason' },
    ],
  },
  role: mockAdminState.role,
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
    const store = mockStore({
      auth: {
        user: {
          permissions: {
            frontPermissions: ['infringementAuthorizer', 'putUserProfileImportantInfo'],
            backPermissions: [],
          },
          role: 'Manager',
        },
      },
      role: mockAdminState.role,
    });

    render(
      <Provider store={store}>
        <BlueSquare
          blueSquares={store.getState().userProfile?.infringements}
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
    expect(screen.queryByText('Dec-03-23')).toBeInTheDocument();
    expect(screen.queryByText('Dec-09-23')).toBeInTheDocument();
    expect(screen.queryByText('some reason')).toBeInTheDocument();
    expect(screen.queryByText('test reason')).toBeInTheDocument();
  });
  it('check if + sign is visible when infringementAuthorizer permission is not added', () => {
    const store = mockStore({
      auth: {
        user: {
          permissions: {
            frontPermissions: [],
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
    });
    render(
      <Provider store={store}>
        <BlueSquare
          blueSquares={store.getState().userProfile?.infringements}
          handleBlueSquare={handleBlueSquare}
        />
      </Provider>,
    );
    expect(screen.queryByText('+')).not.toBeInTheDocument();
  });
  it('check if + sign is visible when infringementAuthorizer permission is added', () => {
    const store = mockStore({
      auth: {
        user: {
          permissions: {
            frontPermissions: ['infringementAuthorizer'],
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
    });
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
    const store = mockStore({
      auth: {
        user: {
          permissions: {
            frontPermissions: [],
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
    });
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
    const store = mockStore({
      auth: {
        user: {
          permissions: {
            frontPermissions: [],
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
    });
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
    const store = mockStore({
      auth: {
        user: {
          permissions: {
            frontPermissions: [],
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
    });
    const permissionValue = store.dispatch(hasPermission('infringementAuthorizer'));
    expect(permissionValue).toBe(false);
  });
  it('check hasPermission function returns true if permission is present', () => {
    const store = mockStore({
      auth: {
        user: {
          permissions: {
            frontPermissions: ['infringementAuthorizer'],
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
    });
    const permissionValue = store.dispatch(hasPermission('infringementAuthorizer'));
    expect(permissionValue).toBe(true);
  });
});
