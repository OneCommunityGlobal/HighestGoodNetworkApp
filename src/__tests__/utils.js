import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import { createMemoryHistory } from 'history';
import { Router, Route } from 'react-router-dom';
import reducer from '../reducers';
import thunk from 'redux-thunk';
const middleware = [thunk];


function renderWithProvider(
  ui,
  {
    initialState = {},
    store = createStore(reducer, initialState, compose(applyMiddleware(...middleware))),
    ...renderOptions
  } = {},
) {
  function Wrapper({ children }) {
    return <Provider store={store}>{children}</Provider>;
  }
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// Helper function
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
}

// re-export everything
export * from '@testing-library/react';
// override render method
export { renderWithProvider, renderWithRouterMatch };
