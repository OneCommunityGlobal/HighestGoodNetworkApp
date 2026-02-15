/* eslint-env jest */
// eslint-disable-next-line no-unused-vars
import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import thunk from 'redux-thunk';
import { rootReducers as reducer } from '../store';

const middleware = [thunk];

export function renderWithProvider(
  ui,
  { initialState, store = createStore(reducer), ...renderOptions } = {},
) {
  function Wrapper({ children }) {
    return <Provider store={store}>{children}</Provider>;
  }
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// Helper function to render with Router and Redux Provider
export function renderWithRouterMatch(
  ui,
  {
    initialState,
    store = createStore(reducer, initialState, compose(applyMiddleware(...middleware))),
    route = '/',
    history = createMemoryHistory({ initialEntries: [route] }),
  } = {},
) {
  return {
    ...rtlRender(
      <Provider store={store}>
        <Router history={history}>{ui}</Router>
      </Provider>,
    ),
    store,
    history,
  };
}

// Helper function to render with Router only
export function renderWithRouter(
  ui,
  { route = '/', history = createMemoryHistory({ initialEntries: [route] }) } = {},
) {
  function Wrapper({ children }) {
  return <Router history={history}>{children}</Router>
}
  return {
    ...rtlRender(ui, { wrapper: Wrapper }),
    history,
  };
}

// Sleep function for waiting in tests
export function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  });
}

// re-export everything from RTL for easy access
export * from '@testing-library/react';

describe('Stop Error', () => {
  it('should not error out due to no tests  (utils.js)', () => { });
});
