import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';// defaults to localStorage for web

import thunk from 'redux-thunk';
import { userPreferencesReducer } from './reducers/listBidDashboard/userPreferencesReducer';
import { messagingReducer } from './reducers/listBidDashboard/messagingReducer';
import { weeklyProjectSummaryReducer } from '~/reducers/bmdashboard/weeklyProjectSummaryReducer';
import { localReducers, sessionReducers } from './reducers';

const middleware = [thunk];
const initialState = {};
const devTools = window.__REDUX_DEVTOOLS_EXTENSION__
  ? window.__REDUX_DEVTOOLS_EXTENSION__()
  : f => f;

export const rootReducers = combineReducers({
  userPreferences: userPreferencesReducer,
  messages: messagingReducer,
  weeklyProjectSummary: weeklyProjectSummaryReducer,
  ...localReducers,
  ...sessionReducers,
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['theme', 'role'], // Only persist theme settings
  blacklist: ['auth', 'errors', ...Object.keys(sessionReducers)],
  timeout: 0, // No timeout
  writeFailHandler: (err) => {
    // If storage quota is exceeded, clear storage and try again
    if (err.name === 'QuotaExceededError') {
      try {
        storage.removeItem('persist:root');
        // Use setTimeout to avoid blocking the current execution
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } catch (clearError) {
        // If we can't clear storage, just reload anyway
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    } 
    // else {
    //   // For other errors, just log them and continue
    //   console.warn('Non-quota storage error, continuing without persistence');
    // }
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