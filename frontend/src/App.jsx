


import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUser} from "./store/authSlice";
import HomePage from "./Pages/HomePage";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import AboutUs from "./Pages/AboutUs"; // Add this import
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
 import { fetchUserDetails } from "./api_Routes/api"; // adjust path
import OAuthSuccess from "./components/OAuthSuccess";
import TermsAndPolicies from "./components/TermsAndPolicies";

// ✅ Routes component that restores auth state from localStorage
const AppRoutes = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
 
   
  
useEffect(() => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  const convId = sessionStorage.getItem("conversation_id");

  if ([token, user, convId].some(item => item === "undefined" || item === "[object Object]")) {
    console.warn("🚨 Corrupted localStorage detected. Auto-resetting...");
    localStorage.clear();
    window.location.reload(); // Optional: force reload with clean state
  }
}, []);


 useEffect(() => {
  const userStr = localStorage.getItem("user");
  let storedUser = null;
  try {
    if (userStr && userStr !== "undefined") {
      storedUser = JSON.parse(userStr);
    }
  } catch (err) {
    console.error("❌ Failed to parse stored user JSON:", err);
    localStorage.removeItem("user");
  }

  const token = localStorage.getItem("token");
  const conversationId = sessionStorage.getItem("conversation_id");

  // console.log("Stored User from localStorage:", storedUser); // Debug line

  const currentPath = window.location.pathname;

  // ✅ Don't fetch user details if on signup or login page
  if ((currentPath === "/signup" || currentPath === "/login")) return;

  if (storedUser && !user) {
    dispatch(setUser({ user: storedUser, token, conversationId }));
  } else if (token && !storedUser) {
    const fetchUserData = async () => {
      try {
        const response = await fetchUserDetails(token);

        if (response.ok) {
          const data = await response.json();
          dispatch(setUser({ user: data.user, token, conversationId: data.conversation_id }));
          localStorage.setItem("user", JSON.stringify(data.user));
          sessionStorage.setItem("conversation_id", data.conversation_id);
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        navigate("/login");
      }
    };

    fetchUserData();
  }
}, [dispatch, navigate, user]);

   

  return (
    // <Routes>
    //   <Route path="/oauth-success" element={<OAuthSuccess />} />
    //   {!user ? (
    //     <>
         
    //       <Route path="/login" element={<Login />} />
    //       <Route path="/signup" element={<Signup />} />
    //       <Route path="/forgot-password" element={<ForgotPassword />} />
    // <Route path="/reset-password" element={<ResetPassword />} />
    //       <Route path="*" element={<Navigate to="/login" />} />
          
    //     </>
    //   ) : (
    //     <>
        
    //       <Route path="/" element={<HomePage />} />
    //       <Route path="/about" element={<AboutUs />} />
    //       <Route path="*" element={<Navigate to="/" />} />
    //     </>
    //   )}
    // </Routes>
  
    <Routes>
      <Route path="/oauth-success" element={<OAuthSuccess />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ✅ Show HomePage to ALL (guest + auth) */}
      <Route path="/" element={<HomePage isGuest={!user} />} />

      {/* ✅ About Us, accessible to all */}
      <Route path="/about" element={<AboutUs />} />
       <Route path="/terms&policies" element={<TermsAndPolicies />} />

      {/* ✅ Wildcard redirect to homepage */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>

  );
};

// ✅ Main App with Router and basename for Hostinger
const App = () => {
  return (
    <Router basename="/">
      <ToastContainer position="top-right" theme="dark" autoClose={3000} />
      <AppRoutes />
    </Router>
  );
};

export default App;
