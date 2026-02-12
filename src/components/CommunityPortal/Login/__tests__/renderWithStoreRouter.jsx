import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
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

export const renderWithStoreRouter = (ui, { store } = {}) => {
  const testStore = store || makeStore();
  return {
    store: testStore,
    ...render(
      <Provider store={testStore}>
        <Router>{ui}</Router>
      </Provider>,
    ),
  };
};
