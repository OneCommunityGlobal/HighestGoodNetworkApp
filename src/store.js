import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web

import thunk from 'redux-thunk';
import { userPreferencesReducer } from 'reducers/lbdashboard/userPreferencesReducer';
import { messagingReducer } from 'reducers/lbdashboard/messagingReducer';
import { localReducers, sessionReducers } from './reducers';


const middleware = [thunk];
const initialState = {};
const devTools = window.__REDUX_DEVTOOLS_EXTENSION__
  ? window.__REDUX_DEVTOOLS_EXTENSION__()
  : f => f;

export const rootReducers = combineReducers({
  userPreferences: userPreferencesReducer,
  messages: messagingReducer,
  ...localReducers,
  ...sessionReducers,
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['theme'], // Only persist theme settings
  blacklist: ['auth', 'errors', ...Object.keys(sessionReducers)],
  timeout: 0, // No timeout
  writeFailHandler: (err) => {
    // If storage quota is exceeded, clear storage and try again
    if (err.name === 'QuotaExceededError') {
      storage.removeItem('persist:root');
      window.location.reload();
    }
  }
};

const localPersistReducer = persistReducer(persistConfig, rootReducers);

const store = createStore(
  localPersistReducer,
  initialState,
  compose(applyMiddleware(...middleware), devTools),
);

const persistor = persistStore(store);

export { store, persistor };
