import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { ImSpinner2 } from "react-icons/im";
import { motion } from "framer-motion";
import PasswordInput from "./helperComponent/PasswordInput";
import { MdOutlinePassword } from "react-icons/md";
import { resetPassword } from "../api_Routes/api";
import HexagonBackground from "../components/helperComponent/HexagonBackground";

const ResetPassword = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { email, otp } = state || {}; // use `state` here, not `location.state`
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingReset, setLoadingReset] = useState(false);
    const [passwordError, setPasswordError] = useState("");


     // Regex for strong password
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  const handlePasswordChange = (e) => {
  const value = e.target.value;
  setNewPassword(value);

  // Validate password
  if (!strongPasswordRegex.test(value)) {
    setPasswordError(
      "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
    );
  } else {
    setPasswordError("");
  }
};



  if (!email || !otp) {
    navigate("/forgot-password");
    return null;
  }

  // const handleReset = async () => {
  //   setLoadingReset(true);
    
  //   if (newPassword !== confirmPassword) {
  //     toast.error("Passwords do not match");
  //     return;
  //   }

  //   try {
  //     // await axios.post("http://localhost:5001/api/auth/reset-password", {
  //     //   email,
  //     //   otp,
  //     //   newPassword,
  //     //   confirmPassword,
  //     // });
  //     await resetPassword({ email, otp, newPassword, confirmPassword });
  //     toast.success("Password reset successful");
  //     navigate("/login");
  //   } catch (err) {
  //     toast.error(err.response?.data?.error || "Reset failed");
  //   } finally {
  //     setLoadingReset(false);
  //   }
  // };

const handleReset = async () => {
  if (!strongPasswordRegex.test(newPassword)) {
    toast.error("Password is not strong enough.");
    return;
  }

  if (newPassword !== confirmPassword) {
    toast.error("Passwords do not match");
    return;
  }

  setLoadingReset(true);
  try {
    await resetPassword({ email, otp, newPassword, confirmPassword });
    toast.success("Password reset successful");
    navigate("/login");
  } catch (err) {
    toast.error(err.response?.data?.error || "Reset failed");
  } finally {
    setLoadingReset(false);
  }
};


  return (

    <div>
         <div className="absolute inset-0 -z-10">
       <HexagonBackground />
   
    </div>
    <motion.div
      className="p-6  w-72  md:w-[448px] mx-auto font-mono border-2 bg-white/40 backdrop-blur-0 shadow-2xl rounded-xl mt-10"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}>
      <div className="flex flex-col items-center mb-5">
        <span className="border-2 border-slate-500 rounded-lg p-2">
        
          <img src="./logo.png" className="h-8 w-8  " alt="logo" />
        </span>
          <MdOutlinePassword className="h-8 w-8  " />
        <h2 className="text-base md:text-2xl font-semibold mb-4 text-center">
          Reset Your Password
        </h2>
        <span className="text-[11px] md:text-sm">Must be at least 8 characters.</span>
      </div>
      <div className="flex flex-col gap-4 mb-5"> 
        <label htmlFor="password " className="text-xs md:text-base">New Password</label>
        <PasswordInput
          // type="password"
          placeholder="New Password"
          // className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={newPassword}
          onChange={handlePasswordChange}
        />
           {passwordError && (
  <p className="text-red-500 text-xs">{passwordError}</p>
)}
        <label htmlFor="password" className="text-xs md:text-base">Confirm Password</label>
        <PasswordInput
          // type="password"
          placeholder="Confirm Password"
          // className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleReset}
        // className="btn btn-primary w-full flex justify-center p-2 bg-green-400 rounded-xl items-center gap-2 mt-2"
         className={`btn btn-primary w-full flex justify-center p-2 rounded-xl items-center gap-2 mt-2 ${
    (!strongPasswordRegex.test(newPassword) || loadingReset) ? "bg-gray-300 cursor-not-allowed" : "bg-green-400"
  }`}
        disabled={!strongPasswordRegex.test(newPassword) || loadingReset}>
        {loadingReset ? (
          <>
            <ImSpinner2 className="animate-spin" />
            Resetting...
          </>
        ) : (
          "Reset Password"
        )}
      </motion.button>
    </motion.div>
      </div>
  );
};

export default ResetPassword;
