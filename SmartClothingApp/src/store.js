import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";

import userReducer from "./reducers/userReducer";
import toastReducer from "./reducers/toastReducer";
import deviceReducer from "./reducers/deviceReducer";
import appReducer from "./reducers/appReducer";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const rootReducer = combineReducers({
  user: userReducer,
  toast: toastReducer,
  device: deviceReducer,
  app: appReducer,
});

const configureStore = () =>
  createStore(rootReducer, composeEnhancers(applyMiddleware(thunk)));

export default configureStore;
