import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import storageSession from 'redux-persist/lib/storage/session';


import thunk from 'redux-thunk';
import { localReducers, sessionReducers } from './reducers';

const middleware = [thunk];
const intialState = {};
const devTools = window.__REDUX_DEVTOOLS_EXTENSION__
  ? window.__REDUX_DEVTOOLS_EXTENSION__()
  : f => f;

const localPersistConfig = {
  key: 'root',
  storage,
  blacklist: ['auth', 'errors', ...Object.keys(sessionReducers)],
};

const sessionPersistConfig = {
  key: 'root',
  storage: storageSession,
  whitelist: [...Object.keys(sessionReducers)]
}

const rootReducers = combineReducers({
  ...localReducers,
  ...sessionReducers,
})

export const persistedReducer = persistReducer(sessionPersistConfig, persistReducer(localPersistConfig, rootReducers));

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
