import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import reducers from "./reducers";

const middleware = [thunk];
const intialState = {}
const devTools = window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : (f) => f;

const store = createStore(
	reducers,
	intialState,
	compose(
		applyMiddleware(...middleware),
		devTools
	)
);

export default store;