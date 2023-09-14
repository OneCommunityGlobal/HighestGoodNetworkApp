import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { render as enzymeRender } from 'enzyme';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import { createMemoryHistory } from 'history';
import { Router, Route } from 'react-router-dom';
import thunk from 'redux-thunk';
import reducer from '../reducers';

const middleware = [thunk];

function renderWithProvider(
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
  { initialState, store = createStore(reducer), ...renderOptions } = {},
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
  const Wrapper = ({ children }) => <Router history={history}>{children}</Router>;
  return {
    ...rtlRender(ui, { wrapper: Wrapper }),
    // adding `history` to the returned utilities to allow us
    // to reference it in our tests (just try to avoid using
    // this to test implementation details).
    history,
  };
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
export { renderWithProvider };

describe('Stop Error', () => {
  it('should not error out due to no tests  (utils.js)', () => {});
});
