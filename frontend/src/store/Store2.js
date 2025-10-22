import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "./chatSlice2";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    auth: authReducer,
  },
});
