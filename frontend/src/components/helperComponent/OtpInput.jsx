

// import React, { useRef } from "react";

// const OtpInput = ({ otp, setOtp }) => {
//   const inputRefs = useRef([]);

//   const handleChange = (e, index) => {
//     const value = e.target.value.replace(/\D/g, ""); // Only digits
//     if (!value) return;

//     const newOtp = otp.split("");
//     newOtp[index] = value;
//     const updatedOtp = newOtp.join("").padEnd(6, ""); // Ensure length stays 6
//     setOtp(updatedOtp);

//     // Move to next input
//     if (value && inputRefs.current[index + 1]) {
//       inputRefs.current[index + 1].focus();
//     }
//   };

//   const handleKeyDown = (e, index) => {
//     if (e.key === "Backspace") {
//       e.preventDefault();
//       const newOtp = otp.split("");
//       newOtp[index] = "";
//       setOtp(newOtp.join(""));

//       if (index > 0 && inputRefs.current[index - 1]) {
//         inputRefs.current[index - 1].focus();
//       }
//     }
//   };

//   const handlePaste = (e) => {
//     e.preventDefault();
//     const pastedData = e.clipboardData.getData("text").replace(/\D/g, ""); // Only digits
//     if (!pastedData) return;

//     const newOtp = pastedData.slice(0, 6).split("");
//     const updatedOtp = [...otp];

//     newOtp.forEach((digit, index) => {
//       updatedOtp[index] = digit;
//       if (inputRefs.current[index]) {
//         inputRefs.current[index].value = digit;
//       }
//     });

//     setOtp(updatedOtp.join(""));

//     // Focus next empty input (if any)
//     const nextEmptyIndex = updatedOtp.findIndex((val) => !val);
//     if (nextEmptyIndex !== -1 && inputRefs.current[nextEmptyIndex]) {
//       inputRefs.current[nextEmptyIndex].focus();
//     }
//   };

//   return (
//     <div className="flex gap-2 justify-center">
//       {Array(6)
//         .fill(0)
//         .map((_, index) => (
//           <input
//             key={index}
//             type="text"
//             maxLength={1}
//             value={otp[index] || ""}
//             onChange={(e) => handleChange(e, index)}
//             onKeyDown={(e) => handleKeyDown(e, index)}
//             onPaste={handlePaste}
//             ref={(ref) => (inputRefs.current[index] = ref)}
//             className="w-10 h-12 text-center text-xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//           />
//         ))}
//     </div>
//   );
// };

// export default OtpInput;

import React, { useRef } from "react";

const OtpInput = ({ otp, setOtp }) => {
  const inputRefs = useRef([]);

  const handleChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, ""); // Only digits
    if (!value) return;

    const newOtp = otp.split("");
    newOtp[index] = value;
    const updatedOtp = newOtp.join("").padEnd(6, "");
    setOtp(updatedOtp);

    // Move to next input
    if (inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newOtp = otp.split("");
      newOtp[index] = "";
      setOtp(newOtp.join(""));

      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e, startIndex) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pastedData) return;

    const otpArray = otp.split("");
    for (let i = 0; i < pastedData.length && startIndex + i < 6; i++) {
      otpArray[startIndex + i] = pastedData[i];
    }

    setOtp(otpArray.join(""));

    // Focus next input after the pasted data
    const nextIndex = startIndex + pastedData.length;
    if (nextIndex < 6 && inputRefs.current[nextIndex]) {
      inputRefs.current[nextIndex].focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array(6)
        .fill(0)
        .map((_, index) => (
          <input
            key={index}
            type="text"
            maxLength={1}
            value={otp[index] || ""}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={(e) => handlePaste(e, index)}
            ref={(ref) => (inputRefs.current[index] = ref)}
            className="w-8 h-8 md:w-10 md:h-12 text-center text-xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        ))}
    </div>
  );
};

export default OtpInput;
