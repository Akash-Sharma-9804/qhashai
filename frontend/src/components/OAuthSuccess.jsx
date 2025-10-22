// import { useEffect } from "react";
// import { useDispatch } from "react-redux";
// import { useSearchParams, useNavigate } from "react-router-dom";
// import { setUser } from "../store/authSlice";

// export default function OAuthSuccess() {
//   const [searchParams] = useSearchParams();
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   useEffect(() => {
//     console.log("🔁 useEffect fired in OAuthSuccess");
//     const token = searchParams.get("token");
//     const user_id = searchParams.get("user_id");
//     const conversation_id = searchParams.get("conversation_id");
//     // console.log("🔍 OAuth Success Params:", { token, user_id, conversation_id });
//     console.log("searchParams:", Object.fromEntries([...searchParams]));
//     if (token && user_id && conversation_id) {
//       const user = {
//         user_id,
//         username,
//         email,
//         user_img,
//         // You can add additional info if needed, like username or email later
//       };

//       dispatch(setUser({ user, token, conversationId: conversation_id }));
//       // ✅ Persist in localStorage for page refresh
//       localStorage.setItem("token", token);
//       localStorage.setItem("user_id", user_id);
//       localStorage.setItem("conversation_id", conversation_id);

//       navigate("/"); // ✅ Redirect to main app page
//     } else {
//       console.warn("OAuth params missing, redirecting to login...");
//       navigate("/login");
//     }
//   }, [searchParams, dispatch, navigate]);

//   return (
//     <div className="text-white p-6 text-center">
//       Logging you in with Google...
//     </div>
//   );
// }



// import { useEffect } from "react";
// import { useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { setUser } from "../store/authSlice";

// export default function OAuthSuccess() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   // useEffect(() => {
//   //   console.log("🔁 useEffect fired in OAuthSuccess");

//   //   fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/me`, {
//   //     credentials: "include", // send cookies
//   //   })
//   //     .then((res) => {
//   //       if (!res.ok) throw new Error("Failed to fetch user info");
//   //       return res.json();
//   //     })
//   //     .then((data) => {
//   //       const { user, conversation_id } = data;
//   //       if (user && conversation_id) {
//   //         dispatch(
//   //           setUser({
//   //             user,
//   //             token: null, // token is in HttpOnly cookie, so null here
//   //             conversationId: conversation_id,
//   //           })
//   //         );
//   //         // ✅ Persist conversationId and user_id for page refresh
//   //         localStorage.setItem("user_id", user.user_id);
//   //         localStorage.setItem("conversation_id", conversation_id);

//   //         navigate("/"); // ✅ Redirect to main app page
//   //       } else {
//   //         console.warn("User or conversation_id missing, redirecting to login...");
//   //         navigate("/login");
//   //       }
//   //     })
//   //     .catch((err) => {
//   //       console.error("Error fetching user info:", err);
//   //       navigate("/login");
//   //     });
//   // }, [dispatch, navigate]);


//   useEffect(() => {
//   console.log("🔁 useEffect fired in OAuthSuccess");

//   // Helper function to read cookie by name
//   function getCookie(name) {
//     const value = `; ${document.cookie}`;
//     const parts = value.split(`; ${name}=`);
//     if (parts.length === 2) return parts.pop().split(';').shift();
//   }

//   const token = getCookie("token");

//   if (!token) {
//     console.warn("No token cookie found, redirecting to login...");
//     navigate("/login");
//     return;
//   }

//   fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/me`, {
//     credentials: "include", // send cookies anyway
//     headers: {
//       Authorization: `Bearer ${token}`, // <-- add token in header here
//     },
//   })
//     .then((res) => {
//       if (!res.ok) throw new Error("Failed to fetch user info");
//       return res.json();
//     })
//     .then((data) => {
//       const { user, conversation_id } = data;
//       if (user && conversation_id) {
//         dispatch(
//           setUser({
//             user,
//             token, // you can keep token here if you want
//             conversationId: conversation_id,
//           })
//         );
//         localStorage.setItem("user_id", user.user_id);
//         localStorage.setItem("conversation_id", conversation_id);

//         navigate("/");
//       } else {
//         console.warn("User or conversation_id missing, redirecting to login...");
//         navigate("/login");
//       }
//     })
//     .catch((err) => {
//       console.error("Error fetching user info:", err);
//       navigate("/login");
//     });
// }, [dispatch, navigate]);

//   return (
//     <div className="text-white p-6 text-center">
//       Logging you in with Google...
//     </div>
//   );
// }

// import { useEffect } from "react";
// import { useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { setUser } from "../store/authSlice";

// export default function OAuthSuccess() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   useEffect(() => {
//     console.log("🔁 useEffect fired in OAuthSuccess");

//     // Call backend to get user details and token
//     async function fetchOAuthData() {
//       try {
//         const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/google/callback`, {
//           method: "GET",
//           credentials: "include", // important if you set httpOnly cookies
//           headers: {
//             "Content-Type": "application/json",
//           },
//         });

//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const data = await response.json();
//         console.log("OAuth success data from backend:", data);

//         if (data.success && data.token && data.user && data.conversation_id) {
//           dispatch(
//             setUser({
//               user: data.user, // contains user_id, username, email, etc.
//               token: data.token,
//               conversationId: data.conversation_id,
//             })
//           );

//           // Save in localStorage for persistence
//           localStorage.setItem("token", data.token);
//           localStorage.setItem("user_id", data.user.user_id);
//           localStorage.setItem("conversation_id", data.conversation_id);

//           navigate("/"); // Redirect to main app page
//         } else {
//           console.warn("OAuth data incomplete, redirecting to login");
//           navigate("/login");
//         }
//       } catch (error) {
//         console.error("Error fetching OAuth data:", error);
//         navigate("/login");
//       }
//     }

//     fetchOAuthData();
//   }, [dispatch, navigate]);

//   return (
//     <div className="text-white p-6 text-center">
//       Logging you in with Google...
//     </div>
//   );
// }

import { useEffect ,useState } from "react";
import { useDispatch,useSelector  } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUser } from "../store/authSlice";
import { googleSignIn } from "../store/authSlice";
import { toast } from "react-toastify";
export default function OAuthSuccess() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
 const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const user = useSelector((state) => state.auth.user);

useEffect(() => {
  const params = new URLSearchParams(window.location.search);

  const token = params.get("token");
  const userId = params.get("user_id");
  const username = params.get("username");
  const email = params.get("email");
  const userImg = params.get("user_img");
  const firstname = params.get("firstname"); 
  const conversationId = params.get("conversation_id");

  if (!token || !userId || !username || !email || !conversationId) {
    navigate("/login"); // If something is missing, redirect to login page
    return;
  }
const user = { user_id: userId, username, email, user_img: userImg, firstname };
  // Store the token, user, and conversation in Redux or localStorage
  dispatch(
    googleSignIn(token, user, conversationId)
  );

  // Optionally store the token in localStorage (encrypted if needed)
  localStorage.setItem("token", token);
   localStorage.setItem("user", JSON.stringify(user)); // Store the full user object
  sessionStorage.setItem("conversation_id", conversationId);

  // console.log("✅ User details (from Google) stored:", { token, userId, username, email, conversationId });

  setCurrentConversationId(conversationId); // Set as selected
  toast.success("🎉 Login successful!");
  setTimeout(() => {
      navigate("/"); // ✅ Redirect after login
    }, 500); // 500ms delay to show the toast

}, [dispatch, navigate]);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="text-white p-6 text-center">
      Logging you in with Google...
    </div>
  );
}
