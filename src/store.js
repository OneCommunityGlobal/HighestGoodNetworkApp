import { createStore, applyMiddleware, compose } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web

import thunk from 'redux-thunk';
import reducers from './reducers';

const middleware = [thunk];
const intialState = {};
const devTools = window.__REDUX_DEVTOOLS_EXTENSION__
  ? window.__REDUX_DEVTOOLS_EXTENSION__()
  : f => f;

const persistConfig = {
  key: 'root',
  storage,
  blacklist: ['auth', 'errors'],
};

const persistedReducer = persistReducer(persistConfig, reducers);

export default () => {
  const store = createStore(
    persistedReducer,
    intialState,
    compose(applyMiddleware(...middleware), devTools),
  );
  const persistor = persistStore(store);
  return { store, persistor };
};

// export default store;
