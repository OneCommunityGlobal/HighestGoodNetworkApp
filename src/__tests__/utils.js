/* eslint-env jest */
// eslint-disable-next-line no-unused-vars
import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { render as enzymeRender } from 'enzyme';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import { createMemoryHistory } from 'history';
// eslint-disable-next-line no-unused-vars
import { Router, Route } from 'react-router-dom';
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

export function renderWithEnzymeProvider(
  ui,
  // { initialState, store = createStore(reducer), ...renderOptions } = {},
  // eslint-disable-next-line no-unused-vars
  { initialState, store = createStore(reducer) } = {},
) {
  return enzymeRender(<Provider store={store}>{ui}</Provider>);
}

// Helper function
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

export function renderWithRouter(
  ui,
  { route = '/', history = createMemoryHistory({ initialEntries: [route] }) } = {},
) {
  function Wrapper({ children }) {
  return <Router history={history}>{children}</Router>
}
  return {
    ...rtlRender(ui, { wrapper: Wrapper }),
    // adding `history` to the returned utilities to allow us
    // to reference it in our tests (just try to avoid using
    // this to test implementation details).
    history,
  };
}

export function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  });
}

// export function renderWithRouterMatch(
//   ui,
//   {
//     initialState = {},
//     store = createStore(reducer, initialState, compose(applyMiddleware(...middleware))),
//     route = '/',
//     history = createMemoryHistory({ initialEntries: [route] }),
//     ...renderOptions
//   } = {},
// ) {
//   function Wrapper({ children }) {
//     return <Provider store={store}><Router history={history}>{children}</Router></Provider>;
//   }
//   return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
// }

// re-export everything
export * from '@testing-library/react';
// override render method
// export { renderWithProvider };

describe('Stop Error', () => {
  it('should not error out due to no tests  (utils.js)', () => { });
});
