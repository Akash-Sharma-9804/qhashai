

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { signupUser, setUser } from "../store/authSlice";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios"; // Assuming you'll send OTP via backend
import OtpInput from "../components/helperComponent/OtpInput";
import PasswordInput from "../components/helperComponent/PasswordInput";
import { ImSpinner2 } from "react-icons/im";
import { verifyOtp, resendOtp,initiateGoogleLogin } from "../api_Routes/api";
 import HexagonBackground from "../components/helperComponent/HexagonBackground";
const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [serverOtp, setServerOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [otpResent, setOtpResent] = useState(false); // Track resend state
  const [otpError, setOtpError] = useState(false);
  const [resendTimer, setResendTimer] = useState(0); // seconds left to show Resend
   const [googleloading, setgoogleLoading] = useState(false);
  const [error, setError] = useState("");
    const [passwordError, setPasswordError] = useState("");


     // Regex for strong password
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    // Validate password
    if (!strongPasswordRegex.test(newPassword)) {
      setPasswordError(
        "Password must be 8+ characters and include uppercase, lowercase, number, and special character."
      );
    } else {
      setPasswordError("");
    }
  };

  const handleSendOtp = async () => {
  if (!email || !username) {
    toast.error("Please enter both email and username.");
    return;
  }

  setLoadingOtp(true);
  try {
    const result = await dispatch(signupUser({ email, username }));

    if (result.error) {
      throw new Error(result.error);
    }

    setOtpSent(true);
    setOtpResent(false);
    setOtpError(false);
    toast.success("📩 OTP sent to your email.");
  } catch (error) {
    console.error("Send OTP Error:", error);
    toast.error(error.message || "❌ Failed to send OTP.");
  } finally {
    setLoadingOtp(false);
  }
};

 
  const handleVerifyOtp = async () => {
    if (!otp || !password) {
      toast.error("Please enter OTP and password.");
      return;
    }

    setLoading(true);
    setOtpError(false);
    startResendCountdown(); // restart countdown
    try {
      

const data = await verifyOtp({ email, username, otp, password });

      dispatch(
        setUser({
          user: data.user,
          token: data.token,
          conversationId: data.conversation_id,
        })
      );
      sessionStorage.setItem("token", data.token);
      toast.success("✅ Account created successfully!");
      navigate("/");
    } catch (error) {
      console.error("OTP Verification Error:", error);
      setOtpError(true); // Trigger Resend OTP button
      setOtp(""); // Clear OTP input
      setPassword(""); // Clear password input
      toast.error(error.response?.data?.error || "❌ OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setLoadingOtp(true);
    try {
      await resendOtp({ email, username });
      setOtpResent(true);
      setOtpError(false);
      setOtp(""); // Clear OTP input
      setPassword(""); // Clear password input
      toast.success("🔁 OTP resent to your email.");
    } catch (error) {
      console.error("Resend OTP Error:", error);
      toast.error("❌ Failed to resend OTP.");
    } finally {
      setLoadingOtp(false);
    }
  };

  const startResendCountdown = () => {
    setResendTimer(15);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setOtpError(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
   const handleGoogleLogin = () => {
   initiateGoogleLogin();
   setgoogleLoading(true); // Start loading
 };


  return (
    <div className="font-mono h-screen   max-w-screen flex items-center justify-center">
        {/* Hexagon Particle Background */}
  <div className="absolute inset-0 -z-10">
    <HexagonBackground />
  </div>
      <div className="rounded-xl backdrop-blur-lg bg-white/1 shadow-lg w-4/5 md:w-2/3 lg:w-9/12 sm:flex">
        {/* Left Section */}
        <div className="md:flex rounded-xl sm:w-2/3 w-full flex-col justify-center  ">
          <div className="w-full h-full   border border-white/20 py-5 sm:p-2 rounded-xl shadow-lg flex flex-col justify-center items-center">
            <h1 className="text-white text-center text-2xl sm:text-4xl font-bold">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 text-transparent bg-clip-text">
                QuantumAi
              </span>
            </h1>
            <p className="text-white mt-2 sm:mt-6 text-sm sm:text-lg w-4/6 text-justify ">
              Discover the Future with QuantumAI — Your Personal AI Assistant.
             
                Experience the next level of intelligent conversations and
                problem-solving.
                 <span className="hidden sm:flex">
                 From generating creative ideas to providing
                real-time answers, QuantumAI adapts to your needs and delivers
                fast, accurate insights. Sign up today and step into a smarter
                tomorrow!
              </span>
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="w-full md:w-1/2 p-4  bg-white/10 md:p-8 flex flex-col justify-center">
          <h2 className="text-center text-lg md:text-2xl font-bold  text-white">
            Sign Up With Us
          </h2>

          <form className="  md:mt-4" onSubmit={(e) => e.preventDefault()}>
            <div className="signup-container flex flex-col gap-1 md:gap-5">
              <div className="flex flex-col ">
                <div className="mb-1 text-sm md:text-base">
                  <label className="block text-white">Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 placeholder:text-xs placeholder:md:text-base  border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div className="mb-2 text-sm md:text-base">
                  <label className="block text-white" htmlFor="Username">
                    First Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your Name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full   px-4 py-2 border rounded-lg  placeholder:text-xs placeholder:md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>
              {!otpSent ? (
                <button
                  onClick={handleSendOtp}
                  disabled={loadingOtp}
                  className={`btn p-2 bg-green-300 rounded-lg text-sm md:text-base font-bold  flex justify-center items-center mx-auto w-full gap-2 ${
                    loadingOtp
                      ? "opacity-60 cursor-not-allowed animate-pulse"
                      : ""
                  }`}>
                  {loadingOtp ? (
                    <>
                      <svg
                        className="w-4 h-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                      Sending OTP...
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </button>
              ) : (
                <>
                  <div className="flex   flex-col items-center    ">
                  <span className="text-white text-xs md:text-lg mb-1">Enter OTP</span>
                  <OtpInput otp={otp} setOtp={setOtp} />
                  </div>

                  <div className=" gap-5 text-sm md:text-base">
                    <label className="block    text-white" htmlFor="Username">
                      Password
                    </label>
                    <PasswordInput
                      // type="password"
                      placeholder="Set Password"
                      value={password}
                      onChange={handlePasswordChange}
                      // className="w-full   px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    {passwordError && (
        <p className="text-red-500 text-xs mt-1">{passwordError}</p>
      )}
                  </div>
                  <button
                    onClick={handleVerifyOtp}
                    disabled={loading}
                    className={`w-full bg-indigo-500 text-sm md:text-base hover:bg-indigo-600 text-white font-bold py-1 md:py-2 rounded-lg transition duration-300 flex items-center justify-center gap-2 ${
                      loading
                        ? "animate-pulse opacity-60 cursor-not-allowed"
                        : ""
                    }`}>
                    {loading ? (
                      <>
                        <svg
                          className="w-5 h-5 animate-spin text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                        Signing Up...
                      </>
                    ) : (
                      "Verify & Signup"
                    )}
                  </button>

                  {/* 🔁 Resend OTP Button */}
                  {resendTimer > 0 ? (
                    <p className="text-center text-sm mt-2 text-red-500">
                      You can resend OTP in {resendTimer} sec
                    </p>
                  ) : (
                    otpError && (
                      <button
                        onClick={handleResendOtp}
                        disabled={loadingOtp}
                        className="text-xs md:mt-3 bg-green-500 p-1 md:p-2 flex justify-center gap-2 items-center text-black rounded-2xl w-2/4 mx-auto hover:bg-green-300">
                        {loadingOtp ?
                          // ? "Resending..."
                          // : otpResent
                          // ? "OTP Resent!"
                          // : "🔁 Resend OTP"}
                           <>
                                            <ImSpinner2 className="animate-spin" />
                                            Sending...
                                          </>
                                         : 
                                          "🔁 Resend OTP"
                                        }
                      </button>
                    )
                  )}
                </>
              )}
            </div>
          </form>
 <div className="flex flex-col mt-2 md:mt-5 gap-2 text-white">
            <span className="text-xs md:text-base">Or Continue with</span>
            <div className="mx-auto">
              <button
                onClick={handleGoogleLogin}
                className="group flex cursor-pointer items-center justify-center border rounded-2xl gap-2 w-fit  pl-1 pr-3 py-1 bg-zinc-800 hover:bg-white hover:text-black"
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
                        Signing Up with Google...
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
                    <span className="text-sm">Sign Up with Google</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <p className="text-center text-sm md:text-base text-white mt-2">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-500 font-bold">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
