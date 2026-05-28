import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import thunk from 'redux-thunk';
import { configureStore } from 'redux-mock-store';
import { render } from '@testing-library/react';

const mockStore = configureStore([thunk]);

export const makeStore = (overrides = {}) =>
  mockStore({
    auth: {
      isAuthenticated: true,
      user: {
        permissions: { frontPermissions: [], backPermissions: [] },
        role: 'Owner',
      },
      permissions: { frontPermissions: [], backPermissions: [] },
    },
    ...overrides,
  });

export const renderWithStoreRouter = (ui, { initialState, store, route = '/' } = {}) => {
  const testStore = store || makeStore(initialState || {});
  return {
    store: testStore,
    ...render(
      <Provider store={testStore}>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </Provider>,
    ),
  };
};
