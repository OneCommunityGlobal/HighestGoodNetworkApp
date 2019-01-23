import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import reducers from './reducers';

const middleware = [thunk];

const intialState = {};

const store = createStore(
  reducers,
  intialState,
  compose(
    applyMiddleware(...middleware),
  ),
);

export default store;
