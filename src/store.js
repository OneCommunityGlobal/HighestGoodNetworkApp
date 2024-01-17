import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import storageSession from 'redux-persist/lib/storage/session';
import concatenateReducers from 'redux-concatenate-reducers'

import thunk from 'redux-thunk';
import { localReducers, sessionReducers } from './reducers';

const middleware = [thunk];
const initialState = {};
const devTools = window.__REDUX_DEVTOOLS_EXTENSION__
  ? window.__REDUX_DEVTOOLS_EXTENSION__()
  : f => f;
  
// const localPersistReducers = Object.entries(localReducers).reduce((acc, [key, reducer]) => {
//   return { ...acc, 
//     [key]: persistReducer({
//       key: 'root',
//       storage
//     }, reducer) 
//   }
// }, {})


// const sessionPersistReducers = Object.entries(sessionReducers).reduce((acc, [key, reducer]) => {
//   return { ...acc, 
//     [key]: persistReducer({
//       key: 'root',
//       storage: storageSession,
//     }, reducer) 
//   }
// }, {})

const localPersistReducer = persistReducer({
  key: 'root',
  storage,
  blacklist: ['auth', 'errors', ...Object.keys(sessionReducers)]
}, combineReducers(localReducers))

const sessionPersistReducer = persistReducer({
  key: 'root',
  storage: storageSession,
  blacklist: [...Object.keys(localReducers)]
}, combineReducers(sessionReducers))

const filteredReducer = (reducer) => {
  let knownKeys = Object.keys(reducer(undefined, { type: '@@FILTER/INIT' }))
  return (state, action) => {
      let filteredState = state
      if (knownKeys.length && state !== undefined) {
          filteredState = knownKeys.reduce((current, key) => {
              current[key] = state[key];
              return current
          }, {})
      }
      const newState = reducer(filteredState, action)
      let nextState = state
      if (newState !== filteredState) {
          knownKeys = Object.keys(newState)
          nextState = {
              ...state,
              ...newState
          }
      }
      return nextState;
  };
}

const rootReducers = concatenateReducers([filteredReducer(sessionPersistReducer), filteredReducer(localPersistReducer)])

export default () => {
  const store = createStore(
    rootReducers,
    initialState,
    compose(applyMiddleware(...middleware), devTools),
  );
  const persistor = persistStore(store);
  return { store, persistor };
};

