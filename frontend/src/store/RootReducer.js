// rootReducer.js
import { combineReducers } from "redux";
import authReducer from "./authSlice";  // Path to your auth slice
import chatReducer from "./ChatSlice";  // Path to your chat slice

// Combine your reducers
const rootReducer = combineReducers({
  auth: authReducer,
  chat: chatReducer,
  // Add more slices here if necessary
});

// Handle the RESET action to reset the store state
const appReducer = (state, action) => {
  if (action.type === "RESET") {
    state = undefined; // This resets the store to its initial state
  }
  return rootReducer(state, action);
};

export default appReducer;
