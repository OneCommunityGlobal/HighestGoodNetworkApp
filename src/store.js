import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web

import thunk from 'redux-thunk';
import { userPreferencesReducer } from './reducers/listBidDashboard/userPreferencesReducer';
import { messagingReducer } from './reducers/listBidDashboard/messagingReducer';
import { weeklyProjectSummaryReducer } from '~/reducers/bmdashboard/weeklyProjectSummaryReducer';
import { localReducers, sessionReducers } from './reducers';

const middleware = [thunk];
const initialState = {};

// Enhanced dev tools with better error handling
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
  writeFailHandler: err => {
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
    // For other errors, just log them and continue
    // eslint-disable-next-line no-console
    // console.warn('Non-quota storage error, continuing without persistence');
  },
  // Add better error handling for storage operations
  serialize: data => {
    try {
      return JSON.stringify(data);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to serialize state:', error);
      return '{}';
    }
  },
  deserialize: data => {
    try {
      return JSON.parse(data);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to deserialize state:', error);
      return {};
    }
  },
};

const localPersistReducer = persistReducer(persistConfig, rootReducers);

// Enhanced store creation with better error handling
const store = createStore(
  localPersistReducer,
  initialState,
  compose(applyMiddleware(...middleware), devTools),
);

// Add store state validation
const validateStoreState = () => {
  try {
    const state = store.getState();
    if (!state || typeof state !== 'object') {
      console.error('Invalid store state detected');
      return false;
    }
    return true;
  } catch (error) {
    console.error('Store state validation failed:', error);
    return false;
  }
};

// Validate store after creation
if (!validateStoreState()) {
  console.error('Store validation failed during creation');
}

const persistor = persistStore(store, null, () => {
  // Callback after rehydration
  console.log('Redux store rehydration completed');

  // Validate store after rehydration
  if (!validateStoreState()) {
    console.error('Store validation failed after rehydration');
  }
});

export { store, persistor };
