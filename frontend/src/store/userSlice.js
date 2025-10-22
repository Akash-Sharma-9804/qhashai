import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: null,
  conversationId: null, // ✅ Store conversation ID
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.conversationId = action.payload.conversationId; // ✅ Store conversation ID
      localStorage.setItem("user_id", action.payload.user.user_id); // ✅ Store user ID
      localStorage.setItem("token", action.payload.token); // ✅ Store token
      localStorage.setItem("conversation_id", action.payload.conversationId); // ✅ Store conversation ID
    },
    setConversationId: (state, action) => {
      state.conversationId = action.payload;
      localStorage.setItem("conversation_id", action.payload); // ✅ Update conversation ID in LocalStorage
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.conversationId = null;
      localStorage.removeItem("user_id");
      localStorage.removeItem("token");
      localStorage.removeItem("conversation_id");
    },
  },
});

export const { setUser, setConversationId, logout } = userSlice.actions;
export default userSlice.reducer;
