import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ImSpinner2 } from "react-icons/im";
import { motion } from "framer-motion";
import OtpInput from "./helperComponent/OtpInput"; // Adjust the path if needed
import { IoFingerPrint } from "react-icons/io5";
import { MoveLeft } from "lucide-react";
import { sendForgotPasswordOtp,verifyResetOtp } from "../api_Routes/api";
import HexagonBackground from "./helperComponent/HexagonBackground";
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [loadingSendOtp, setLoadingSendOtp] = useState(false);
  const [loadingVerifyOtp, setLoadingVerifyOtp] = useState(false);
const [maskedEmail, setMaskedEmail] = useState("");
const [showResend, setShowResend] = useState(false);
const [resendTimer, setResendTimer] = useState(0); // seconds left to show Resend
// for masking email 
function maskEmail(email) {
  const [user, domain] = email.split("@");
  if (user.length < 3) return "*".repeat(user.length) + "@" + domain;

  return (
    user[0] + "*".repeat(user.length - 2) + user[user.length - 1] + "@" + domain
  );
}


  const handleSendOtp = async () => {
     if (resendTimer > 0) return; // ⛔ Prevent spamming
    setLoadingSendOtp(true);
    try {
      // await axios.post("http://localhost:5001/api/auth/forgot-password", {
      //   email,
      // });
      await sendForgotPasswordOtp(email);
      toast.success("OTP sent to your email");
      setMaskedEmail(maskEmail(email)); // Masked email for display

      setStep(2);
        setShowResend(false);
       
    } catch (err) {
      toast.error("email is required" || "Something went wrong Try again");
    } finally {
      setLoadingSendOtp(false);
    }
  };

  // const handleVerifyOtp = async () => {
  //   setLoadingVerifyOtp(true);
  //   try {
  //     const res = await axios.post(
  //       "http://localhost:5001/api/auth/verify-reset-otp",
  //       { email, otp }
  //     );
  //     if (res.data.success) {
  //       toast.success("OTP verified");
  //       navigate("/reset-password", { state: { email, otp } });
  //     }
  //   } 
  //   // catch (err) {
  //   //   toast.error(err.response?.data?.error || "Invalid OTP");
  //   catch (err) {
  //   const errorMsg = err.response?.data?.error || "Invalid OTP";
  //   toast.error(errorMsg);

  //   // Only allow resend if OTP is invalid or expired
  //   if (
  //     errorMsg.toLowerCase().includes("expired") ||
  //     errorMsg.toLowerCase().includes("invalid")
  //   ) {
  //     setShowResend(false);
  //     startResendCountdown(); // restart countdown
  //   }
  //   } finally {
  //     setLoadingVerifyOtp(false);
  //   }
  // };

const handleVerifyOtp = async () => {
  setLoadingVerifyOtp(true);
  try {
    const res = await verifyResetOtp({ email, otp });

    if (res.success) {
      toast.success("OTP verified");
      navigate("/reset-password", { state: { email, otp } });
    }
  } catch (err) {
    const errorMsg = err.response?.data?.error || "Invalid OTP";
    toast.error(errorMsg);
     
    // Allow resend only if OTP expired or invalid
    if (
      errorMsg.toLowerCase().includes("expired") ||
      errorMsg.toLowerCase().includes("invalid")
    ) {
      setShowResend(false);
      startResendCountdown(); // restart countdown
      setOtp(false);
    }
  } finally {
    setLoadingVerifyOtp(false);
  }
};


const startResendCountdown = () => {
  setResendTimer(15);
  const interval = setInterval(() => {
    setResendTimer((prev) => {
      if (prev <= 1) {
        clearInterval(interval);
        setShowResend(true);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
};


  return (
   < div className="flex  justify-center items-center   h-screen "> 
   <div className="absolute inset-0 -z-10">
       <HexagonBackground />
     </div>
    <motion.div
      className="p-6 w-72 md:w-[448px] mx-auto  bg-white/40 backdrop-blur-sm font-mono  border-2 shadow-2xl rounded-xl"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}>
      <div className="flex flex-col  mb-5 items-center justify-center">
        <span className="border-2 border-slate-500 rounded-lg p-2">
             <img src="./logo.png" className="h-8 w-8  " alt="logo" />
          {/* <IoFingerPrint className="h-8 w-8  " /> */}
        </span>

        <h2 className="text-base md:text-2xl  font-bold mb-2 text-center">
          Forgot Password ? 
        </h2>
        <h3 className="text-[9px] md:text-sm  ">
          No worries, we'll send you reset instructions.
        </h3>
      </div>
      <div className="flex flex-col gap-2">
        {step === 1 ? (
          <>
            <div className="flex flex-col  ">
              <label className="block text-sm md:text-base  " htmlFor="email">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none placeholder:text-xs placeholder:md:text-base focus:ring-2 focus:ring-indigo-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendOtp}
              className="btn btn-primary w-full flex justify-center p-2 bg-green-400 rounded-xl items-center gap-2"
              disabled={loadingSendOtp}>
              {loadingSendOtp ? (
                <>
                  <ImSpinner2 className="animate-spin" />
                  Sending... OTP
                </>
              ) : (
                "Send OTP"
              )}
            </motion.button>
          </>
        ) : (
          <>
          <span className="text-xs md:text-sm text-center mb-2">
  Verification code has been sent via email to <strong>{maskedEmail}</strong>
</span>

            <OtpInput otp={otp} setOtp={setOtp} />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleVerifyOtp}
              className="btn btn-primary w-full flex justify-center items-center p-2 bg-green-400 rounded-xl gap-2 mt-2"
              disabled={loadingVerifyOtp || (!showResend && resendTimer > 0)}>
              {loadingVerifyOtp ? (
                <>
                  <ImSpinner2 className="animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </motion.button>
            {/* ⏱ Countdown OR Resend Button */}
{resendTimer > 0 ? (
  <p className="text-center text-sm mt-2 text-red-500">
    You can resend OTP in {resendTimer} sec
  </p>
) : (
  showResend && (
   
 <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendOtp}
              className="btn btn-primary w-2/4 mx-auto flex justify-center p-2 bg-yellow-400  rounded-xl items-center gap-2"
              disabled={loadingSendOtp}>
              {loadingSendOtp ? (
                <>
                  <ImSpinner2 className="animate-spin" />
                  Sending...
                </>
              ) : (
                "Resend OTP"
              )}
            </motion.button>  
)
)}
          </>
        )}
      </div>
      <motion.div
       whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}>
        <Link to="/login"
          className="flex p-2 bg-white/80 justify-center text-[10px] hover:text-blue-500 md:text-base items-center gap-2 mt-5 border border-stone-900 cursor-pointer font-medium hover:border-gray-700   w-2/4 mx-auto text-black">
          <MoveLeft size={16} />
          back to login
        </Link>
      </motion.div>
    </motion.div>
     </div>
  );
};

export default ForgotPassword;
