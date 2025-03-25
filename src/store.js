import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web

import thunk from 'redux-thunk';
import { localReducers, sessionReducers } from './reducers';

const middleware = [thunk];
const initialState = {};
const devTools = window.__REDUX_DEVTOOLS_EXTENSION__
  ? window.__REDUX_DEVTOOLS_EXTENSION__()
  : f => f;

export const rootReducers = combineReducers({
  ...localReducers,
  ...sessionReducers,
});

const persistConfig = {
  key: 'root',
  storage,
  blacklist: [
    'auth', 
    'errors', 
    'notifications',      
    'userActivities',     
    'allUsersTimeEntries',
    ...Object.keys(sessionReducers)
  ],
};

const localPersistReducer = persistReducer(persistConfig, rootReducers);

const store = createStore(
  localPersistReducer,
  initialState,
  compose(applyMiddleware(...middleware), devTools),
);

const persistor = persistStore(store);

export default () => {
  return { store, persistor };
}
