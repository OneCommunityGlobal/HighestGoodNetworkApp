import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import { createMemoryHistory } from 'history';
import { Router, Route } from 'react-router-dom';
<<<<<<< HEAD
import thunk from 'redux-thunk';
import reducer from '../reducers';

=======
import reducer from '../reducers';
import thunk from 'redux-thunk';
>>>>>>> 91c5efdb675c3e9781ac1c1e68a0a94c417c7a66
const middleware = [thunk];


function renderWithProvider(
  ui,
  {
<<<<<<< HEAD
    initialState,
    store = createStore(reducer),
=======
    initialState = {},
    store = createStore(reducer, initialState, compose(applyMiddleware(...middleware))),
>>>>>>> 91c5efdb675c3e9781ac1c1e68a0a94c417c7a66
    ...renderOptions
  } = {},
) {
  function Wrapper({ children }) {
    return <Provider store={store}>{children}</Provider>;
  }
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// Helper function
<<<<<<< HEAD
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
=======
function renderWithRouterMatch(
  ui,
  {
    initialState = {},
    store = createStore(reducer, initialState, compose(applyMiddleware(...middleware))),
    route = '/',
    history = createMemoryHistory({ initialEntries: [route] }),
    ...renderOptions
  } = {},
) {
  function Wrapper({ children }) {
    return <Provider store={store}><Router history={history}>{children}</Router></Provider>;
  }
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
>>>>>>> 91c5efdb675c3e9781ac1c1e68a0a94c417c7a66
}

// re-export everything
export * from '@testing-library/react';
// override render method
<<<<<<< HEAD
export { renderWithProvider };
=======
export { renderWithProvider, renderWithRouterMatch };
>>>>>>> 91c5efdb675c3e9781ac1c1e68a0a94c417c7a66
