import { createStore, applyMiddleware, compose } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";
import thunk from "redux-thunk";
import reducers from "./reducers";

const persistConfig = {
  key: "root",
  storage,
  stateReconciler: autoMergeLevel2 // see "Merge Process" section for details.
};

const devTools = window.__REDUX_DEVTOOLS_EXTENSION__
  ? window.__REDUX_DEVTOOLS_EXTENSION__()
  : f => f;
const pReducer = persistReducer(persistConfig, reducers);
const middleware = [thunk];
const intialState = {};

export const store = createStore(
  pReducer,
  intialState,
  compose(
    applyMiddleware(...middleware),
    devTools
  )
);
export const persistor = persistStore(store);
