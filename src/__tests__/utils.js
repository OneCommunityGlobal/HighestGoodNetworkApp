import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import { createMemoryHistory } from 'history';
import { Router, Route } from 'react-router-dom';
import thunk from 'redux-thunk';
import reducer from '../reducers';

const middleware = [thunk];


function renderWithProvider(
  ui,
  {
    initialState,
    store = createStore(reducer),
    ...renderOptions
  } = {},
) {
  function Wrapper({ children }) {
    return <Provider store={store}>{children}</Provider>;
  }
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
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

// export function sleep(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }


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
