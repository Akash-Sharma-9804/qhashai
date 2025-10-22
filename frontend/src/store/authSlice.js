// import { createSlice } from "@reduxjs/toolkit";
// import { createNewConversation ,login, signup } from "../api_Routes/api";

// const initialState = {
//   user: null,
//   token: null,
//   conversationId: null, // Store the latest conversation ID
// };

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     setUser: (state, action) => {
//       state.user = action.payload.user;
//       state.token = action.payload.token;
//       state.conversationId = action.payload.conversationId;
//     },
//     logout: (state) => {
//       state.user = null;
//       state.token = null;
//       state.conversationId = null;
//     },
//   },
// });

// export const { setUser, logout } = authSlice.actions;

// // Async Thunk to handle Login + Auto-create Conversation
// // export const loginUser = (credentials) => async (dispatch) => {
// //   try {
// //     const data = await login(credentials);

// //     if (!data.token) {
// //       throw new Error("No token received from backend");
// //     }

// //     console.log("✅ Received Token:", data.token);

// //     localStorage.setItem("token", data.token);
// //     console.log("✅ Token stored:", localStorage.getItem("token"));

// //     const newConversation = await createNewConversation(data.token);

// //     dispatch(setUser({
// //       user: data.user,
// //       token: data.token,
// //       conversationId: newConversation.id
// //     }));

// //   } catch (error) {
// //     console.error("❌ Login failed:", error);
// //   }
// // };

// export const loginUser = (credentials) => async (dispatch) => {
//   try {
//     const data = await login(credentials); // this has token, user, conversation_id

//     console.log("🔍 Raw API Response:", data);

//     if (!data?.token || !data?.user?.user_id || !data?.conversation_id) {
//       throw new Error("❌ Missing token, user_id, or conversation_id");
//     }

//     console.log("✅ Received Token:", data.token);
//     console.log("✅ Conversation ID from Login:", data.conversation_id);

//     dispatch(setUser({
//       user: data.user,
//       token: data.token,
//       conversationId: data.conversation_id,
//     }));

//     localStorage.setItem("token", data.token);
//     localStorage.setItem("user_id", data.user.user_id);
//     localStorage.setItem("conversation_id", data.conversation_id);

//     return { payload: data }; // ✅ Pass entire data as payload
//   } catch (error) {
//     console.error("❌ Login failed:", error);
//     return { error: error.message };
//   }
// };

// // Async Thunk to handle Signup + Auto-create Conversation
// export const signupUser = (credentials) => async (dispatch) => {
//   try {
//     const data = await signup(credentials);
//     const newConversation = await createNewConversation(data.token);

//     dispatch(setUser({ user: data.user, token: data.token, conversationId: newConversation.id }));
//   } catch (error) {
//     console.error("Signup failed:", error);
//   }
// };

// export default authSlice.reducer;
import { createSlice } from "@reduxjs/toolkit";
import {
  createNewConversation,
  login,
  signup,
   fetchUserDetails,
   fetchGoogleCallbackData,
} from "../api_Routes/api";

// ✅ Safe JSON parse with auto-clean on error
const safeParseJSON = (key) => {
  try {
    const value = localStorage.getItem(key);
    if (!value || value === "undefined" || value === "null") return null;
    return JSON.parse(value);
  } catch (err) {
    console.error(`❌ Failed to parse localStorage key "${key}". Removing corrupted value.`, err);
    localStorage.removeItem(key);
    return null;
  }
};

// ✅ Safe fallback for conversationId
const getSafeConversationId = () => {
  const value = localStorage.getItem("conversation_id");
  return value && value !== "undefined" ? value : null;
};
 
const initialState = {
  // user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null,
    user: safeParseJSON("user"),

  token: localStorage.getItem("token") || null,
  conversationId: getSafeConversationId(),
   guest: localStorage.getItem("guest") === "true" || false,
     showGreeting: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      //  console.log("User payload:", action.payload.user); // Debugging line
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.conversationId = action.payload.conversationId;
       state.guest = false;
//  console.log("User saved in Redux state:", state.user);
      // ✅ Save to localStorage
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("conversation_id", action.payload.conversationId);
      localStorage.setItem("guest", "false");
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.conversationId = null;
 state.guest = false;
      // ✅ Clear localStorage
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("conversation_id");
       localStorage.removeItem("guest");
    },
      setGuestMode: (state) => {
      state.user = null;
      state.token = null;
      state.conversationId = "guest";
      state.guest = true;

      localStorage.setItem("guest", "true");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.setItem("conversation_id", "guest");
    },
  },
});

export const { setUser, logout,setGuestMode } = authSlice.actions;

// ✅ Login Thunk
export const loginUser = (credentials) => async (dispatch) => {
  try {
    const data = await login(credentials); // this has token, user, conversation_id

    console.log("🔍 Raw API Response:", data);

    if (!data?.token || !data?.user?.user_id || !data?.conversation_id) {
      throw new Error("❌ Missing token, user_id, or conversation_id");
    }

    console.log("✅ Received Token:", data.token);
    console.log("✅ Conversation ID from Login:", data.conversation_id);
    console.log("✅ User ID from Login:", data.user);
    dispatch(
      setUser({
        user: data.user,
        token: data.token,
        conversationId: data.conversation_id,
      })
    );

    return { payload: data }; // ✅ Return the full data
  } catch (error) {
    console.error("❌ Login failed:", error);
    return { error: error.message };
  }
};

// ✅ Signup Thunk
export const signupUser = (credentials) => async (dispatch) => {
  try {
    const data = await signup(credentials);

    dispatch(
      setUser({
        user: data.user,
        token: data.token,
        conversationId: data.conversation_id,
      })
    );
    return { payload: data };
  } catch (error) {
    console.error("❌ Signup failed:", error);
     // Extract the actual error message from backend
    const errorMessage =
      error.response?.data?.error || "Signup failed. Please try again.";
    return { error: errorMessage };
  }
};

// export const getUser = () => async (dispatch) => {
//   try {
//     const data = await fetchUserDetails(); // fetches from /auth/me

//     console.log("🔍 Raw API Response:", data);

//     if (!data?.success || !data?.user?.user_id) {
//       throw new Error("❌ Missing user data or success flag");
//     }

//     console.log("✅ User fetched:", data.user);
//     console.log("✅ Conversation ID:", data.conversation_id);

//     dispatch(
//       setUser({
//         user: data.user,
//         token: null,               // token is in cookie, so no need here
//         conversationId: data.conversation_id,
//       })
//     );

//     return { payload: data }; // optional if you want to use .unwrap()
//   } catch (error) {
//     console.error("❌ Get user failed:", error);
//     return { error: error.message };
//   }
// };
// ✅ Google Sign-In Thunk
export const googleSignIn = (token, user, conversationId) => async (dispatch) => {
// console.log("✅ user.",user);
  try {
    // Assuming you are receiving the full user data from Google
    dispatch(
      setUser({
        user: user, // Full user details from Google
        token: token, // JWT token
        conversationId: conversationId, // Conversation ID from Google login
      })
    );

    // Store the token in localStorage for persistence
    // localStorage.setItem("token", token);
    // localStorage.setItem("user", JSON.stringify(user));
    // localStorage.setItem("conversation_id", conversationId);

    // console.log("✅ Google Sign-In successful, user details stored in Redux and localStorage.");
  } catch (error) {
    console.error("❌ Google Sign-In failed:", error);
  }
};

export default authSlice.reducer;
