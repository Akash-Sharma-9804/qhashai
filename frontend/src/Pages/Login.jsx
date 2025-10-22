import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { loginUser } from "../store/authSlice";
import PasswordInput from "../components/helperComponent/PasswordInput";
import { toast } from "react-toastify";
import { useAuth0 } from "@auth0/auth0-react";
import { initiateGoogleLogin } from "../api_Routes/api";
// import ParticlesBackground from "../components/HexagonsBackground"; // adjust path if needed
import HexagonBackground from "../components/helperComponent/HexagonBackground";

const Login = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate(); // 👈 Import useNavigate
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleloading, setgoogleLoading] = useState(false);
const [guestLoading, setGuestLoading] = useState(false);



useEffect(() => {
    console.log("🧹 Clearing localStorage on Login page load...");
    localStorage.clear();
        sessionStorage.clear();
    // Or if you want to clear specific items only:
    // localStorage.removeItem("token");
    // localStorage.removeItem("user_id");
    // localStorage.removeItem("conversation_id");
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get("error");
    if (error) {
      toast.error(decodeURIComponent(error));
    }
  }, [location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Reset error state
    setLoading(true); // Start loading

    try {
      const response = await dispatch(loginUser({ email, password }));

      console.log("🔍 Full Login Response:", response);

      // ❌ Handle explicit error returned from thunk
      if (response?.error) {
        console.error("❌ Login error:", response.error);
        setError(response.error);
        toast.error("❌ Login failed!");
        return;
      }

      // ❌ Handle unexpected structure
      if (!response || !response.payload) {
        console.error("❌ Login failed: No response or payload received");
        setError("Login failed: No response or payload received");
        toast.error("❌ Login failed!");
        return;
      }

      const { token, user, conversation_id } = response.payload;

      // ❌ Check missing values
      if (!token || !user?.user_id || !conversation_id) {
        console.error(
          "❌ Login failed: Missing token, user_id, or conversation_id."
        );
        setError("Login failed: Missing required login data.");
        toast.error("❌ Login failed!");
        return;
      }

      // ✅ Store in localStorage
    // ✅ Store in localStorage and sessionStorage
localStorage.setItem("token", token);
localStorage.setItem("user_id", user.user_id);
sessionStorage.setItem("conversation_id", conversation_id);
sessionStorage.setItem("conversation_name", "New Chat");

console.log("✅ Token stored:", token);
console.log("✅ User ID stored:", user.user_id);
console.log("✅ Conversation ID stored in session:", conversation_id);


      // ✅ Add the new conversation to the list
      const newConversation = {
        id: conversation_id,
        name: "New Chat",
      };

      setConversations((prev) => [newConversation, ...prev]); // Add to top
      setCurrentConversationId(conversation_id); // Set as selected
      toast.success("🎉 Login successful!");
      navigate("/"); // ✅ Redirect after login
    } catch (err) {
      console.error("❌ Login Exception:", err);
      toast.error("❌ Login failed!");

      // ✅ Show detailed error message if available
      setError(
        err?.response?.data?.error ||
          err?.message ||
          "An unexpected error occurred during login."
      );
    } finally {
      setLoading(false); // Stop loading
    }
  };

  //  const { user, loginWithRedirect } = useAuth0();
  // console.log("User:", user);

  // const handleGoogleLogin = () => {
  //   loginWithRedirect({
  //     connection: "google-oauth2"
  //   });
  // };

  const handleGoogleLogin = () => {
    initiateGoogleLogin();
    setgoogleLoading(true); // Start loading
    
  };

  const handleFacebookLogin = () => {
    loginWithRedirect({
      connection: "facebook",
    });
  };
  // handle guest login
const handleGuestLogin = () => {
  setGuestLoading(true);
  // Simulate a brief loading period before redirect
  setTimeout(() => {
    navigate("/");
  }, 1000);
};

  return (
    <div className="font-mono h-screen   max-w-screen flex items-center justify-center">
      {/* Hexagon Particle Background */}
      <div className="absolute inset-0 -z-10">
        <HexagonBackground />
      </div>
      <div className="rounded-xl backdrop-blur-lg   shadow-lg w-4/5 md:w-2/4 lg:w-9/12 sm:flex">
        {/* Left Section */}
        <div className="md:flex rounded-xl flex-col justify-center  ">
          <div className="w-full h-full   border border-white/20 py-5 sm:p-0 rounded-xl shadow-lg flex flex-col justify-center items-center">
            <h1 className="text-white text-center text-2xl sm:text-4xl font-bold">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 text-transparent bg-clip-text">
                QuantumAi
              </span>
            </h1>
            <p className="text-white mt-2 sm:mt-6 text-sm sm:text-lg w-4/6">
              Welcome back! Unlock the full potential of AI — log in to continue
              your journey with{" "}
              <span className="bg-gradient-to-r  from-blue-500 via-purple-500 to-red-500 text-transparent bg-clip-text">
                QuantumAi
              </span>{" "}
              and experience smarter, faster insights.
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="w-full rounded-xl bg-white/10 border border-white/20 shadow-lg md:w-1/2 p-4 md:p-7 flex flex-col justify-center">
          <h2 className="text-center   text-2xl font-bold text-white">Login</h2>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <form className="mt-2 md:mt-6" onSubmit={handleLogin}>
            <div className="mb-1 md:mb-4 text-sm md:text-base">
              <label className="block text-white">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 border rounded-lg placeholder:text-xs placeholder:md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-2 md:mb-4 text-sm md:text-base">
              <label className="block text-white">Password</label>

              <PasswordInput
                // type="password"
                placeholder="Enter your password"
                // className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Link
              to="/forgot-password"
              className="text-white text-xs md:text-sm hover:text-sky-200 ">
              Forgot Password?
            </Link>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 text-white font-bold py-2 rounded-lg transition-all duration-300 ${
                loading
                  ? "bg-indigo-400 cursor-not-allowed animate-pulse"
                  : "bg-indigo-500 hover:bg-indigo-600"
              }`}>
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="flex flex-col mt-2 md:mt-5 gap-2 text-white">
            <span className="text-sm md:text-base">Or Continue with</span>
            <div className="mx-auto">
              <button
                onClick={handleGoogleLogin}
                className="group flex cursor-pointer items-center justify-center border rounded-2xl gap-2 w-fit mb-2 pl-1 pr-3 py-1 bg-zinc-800 hover:bg-white hover:text-black"
                disabled={googleloading}>
                {googleloading ? (
                  <>
                    <div className="pl-2 pr-3 py-1 flex gap-1 items-center">
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                      <span className="ml-2  text-sm">
                        Signing in with Google...
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="bg-white rounded-full group-hover:bg-zinc-800 transition-colors duration-200">
                      <img
                        src="./google.png"
                        className="h-6 w-6 rounded-full"
                        alt="Google Icon"
                      />
                    </span>
                    <span className="text-sm">Sign in with Google</span>
                  </>
                )}
              </button>
              {/* guest button  */}
              <button
      onClick={handleGuestLogin}
      disabled={guestLoading}
      className={`group flex cursor-pointer mx-auto items-center justify-center border rounded-2xl gap-2 w-fit mb-2 pl-1 pr-3 py-1 transition-colors duration-200 ${
        guestLoading 
          ? "bg-gray-400 cursor-not-allowed" 
          : "  hover:bg-white hover:text-black"
      }`}>
      {guestLoading ? (
        <div className="flex gap-1 items-center">
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <span className="ml-2 text-sm">
            Signing in as Guest...
          </span>
        </div>
      ) : (
        <>
         <span className="bg-white rounded-full group-hover:bg-zinc-600 transition-colors duration-200">
                  <img
                    src="./guest_bg.png"
                    className="h-6 w-6 rounded-full"
                    alt=""
                  />
                </span>
        <span className="text-sm">Continue as Guest</span>
        </>
      )}
    </button>
              {/* <button
                onClick={() => navigate("/")}
                className="group flex cursor-pointer mx-auto items-center justify-center border rounded-2xl gap-2 w-fit mb-2 pl-3 pr-3 py-1   hover:bg-white hover:text-black transition-colors duration-200">
                <span className="bg-white rounded-full group-hover:bg-zinc-700 transition-colors duration-200">
                  <img
                    src="./guest_bg.png"
                    className="h-6 w-6 rounded-full"
                    alt=""
                  />
                </span>
                <span className="text-sm">Sign in as Guest</span>
              </button> */}
            </div>
          </div>
          <p className="text-center text-sm mt-2 md:text-base text-white">
            Don’t have an account?{" "}
            <Link
              to="/signup"
              className="text-blue-200 font-bold hover:text-blue-500">
              Signup
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
