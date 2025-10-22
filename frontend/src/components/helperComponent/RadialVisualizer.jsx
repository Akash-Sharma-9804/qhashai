// import { useEffect, useRef } from "react";
// // import logo from "../logo.png"; // Update the path if needed

// const RadialVisualizer = ({ audioStream }) => {
//   const canvasRef = useRef(null);
//   const imageRef = useRef(null);

//   useEffect(() => {
//     if (!audioStream) return;

//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");

//     canvas.width = 200;
//     canvas.height = 200;

//     const audioCtx = new AudioContext();
//     const source = audioCtx.createMediaStreamSource(audioStream);
//     const analyser = audioCtx.createAnalyser();
//     source.connect(analyser);

//     analyser.fftSize = 128;
//     const bufferLength = analyser.frequencyBinCount;
//     const dataArray = new Uint8Array(bufferLength);

//     const draw = () => {
//       requestAnimationFrame(draw);
//       analyser.getByteFrequencyData(dataArray);

//       ctx.clearRect(0, 0, canvas.width, canvas.height);
//       const centerX = canvas.width / 2;
//       const centerY = canvas.height / 2;
//       const radius = 50;

//       // Draw radial bars
//       for (let i = 0; i < bufferLength; i++) {
//         const angle = (i / bufferLength) * 2 * Math.PI;
//         const barHeight = dataArray[i] * 0.5;
//         const x1 = centerX + Math.cos(angle) * radius;
//         const y1 = centerY + Math.sin(angle) * radius;
//         const x2 = centerX + Math.cos(angle) * (radius + barHeight);
//         const y2 = centerY + Math.sin(angle) * (radius + barHeight);

//         ctx.beginPath();
//         ctx.moveTo(x1, y1);
//         ctx.lineTo(x2, y2);
//         ctx.strokeStyle = "rgba(255, 105, 180, 0.85)";
//         ctx.lineWidth = 2;
//         ctx.stroke();
//       }

//       // Draw center logo image
//       const img = imageRef.current;
//       const imgSize = 40;
//       if (img.complete) {
//         ctx.save();
//         ctx.beginPath();
//         ctx.arc(centerX, centerY, imgSize / 2, 0, Math.PI * 2);
//         ctx.clip();
//         ctx.drawImage(
//           img,
//           centerX - imgSize / 2,
//           centerY - imgSize / 2,
//           imgSize,
//           imgSize
//         );
//         ctx.restore();
//       }
//     };

//     draw();

//     return () => {
//       audioCtx.close();
//     };
//   }, [audioStream]);

//   return (
//     <div className="relative w-52 h-52">
//       <canvas
//         ref={canvasRef}
//         className="absolute top-0 left-0 w-full h-full"
//       />
//       {/* Hidden image used for drawing into canvas */}
//       <img
//         ref={imageRef}
//          src="./logo.png"
//         alt="Bot Logo"
//         className="hidden"
//       />
//     </div>
//   );
// };

// export default RadialVisualizer;


import { useEffect, useRef } from "react";

const RadialVisualizer = ({ audioStream }) => {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  // Draw static visualization with fixed circle when no audio stream
  const drawStaticVisualization = (ctx, width, height) => {
    ctx.clearRect(0, 0, width, height);
    
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) * 0.6;
    const barCount = 64;
    const baseBarHeight = radius * 0.1;
    
    // Draw static bars in a circle
    for (let i = 0; i < barCount; i++) {
      const angle = (i / barCount) * Math.PI * 2;
      
      const x1 = centerX + Math.cos(angle) * radius;
      const y1 = centerY + Math.sin(angle) * radius;
      const x2 = centerX + Math.cos(angle) * (radius + baseBarHeight);
      const y2 = centerY + Math.sin(angle) * (radius + baseBarHeight);
      
      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, "rgba(0, 70, 255, 0.9)");
      gradient.addColorStop(1, "rgba(180, 0, 255, 0.7)");
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = gradient;
      ctx.stroke();
    }
    
    // Draw center logo image
    const img = imageRef.current;
    if (img && img.complete) {
      const imgSize = radius * 0.8;
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, imgSize / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(
        img,
        centerX - imgSize / 2,
        centerY - imgSize / 2,
        imgSize,
        imgSize
      );
      ctx.restore();
    }
  };

  useEffect(() => {
    if (!audioStream) {
      // Even without audio stream, create a static visualization
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext("2d");
      
      // Set canvas size to match container
      const resizeCanvas = () => {
        const parent = canvas.parentElement;
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        drawStaticVisualization(ctx, canvas.width, canvas.height);
      };
      
      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);
      
      return () => {
        window.removeEventListener("resize", resizeCanvas);
      };
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Set canvas size to match container
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };
    
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Set up audio analyzer
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(audioStream);
    const analyser = audioCtx.createAnalyser();
    source.connect(analyser);

    // Use a higher FFT size for smoother visualization
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      // Clear canvas with transparent background
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const barCount = 64; // Number of bars to display
      const radius = Math.min(centerX, centerY) * 0.6; // Base radius for the circle

      // Draw radial bars
      for (let i = 0; i < barCount; i++) {
        // Calculate data index for this bar
        const dataIndex = Math.floor(i * (bufferLength / barCount));
        
        // Calculate angle for this bar
        const angle = (i / barCount) * Math.PI * 2;
        
        // Calculate initial bar height and additional height for audio
        const baseBarHeight = radius * 0.3; // Always visible base height covering entire circle
        
        // Calculate bar height based on audio data with always visible base height
        const value = dataArray[dataIndex];
        const additionalHeight = (value / 255) * (radius * 0.7);
        const barHeight = baseBarHeight + additionalHeight; // Bars always visible and grow with sound
        
        // Calculate start and end points
        const x1 = centerX + Math.cos(angle) * radius;
        const y1 = centerY + Math.sin(angle) * radius;
        const x2 = centerX + Math.cos(angle) * (radius + barHeight);
        const y2 = centerY + Math.sin(angle) * (radius + barHeight);

        // Draw a line with blue/purple gradient (matching screenshot)
        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, "rgba(0, 70, 255, 0.9)");
        gradient.addColorStop(1, "rgba(180, 0, 255, 0.7)");
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = 2.5; // Bar thickness
        ctx.strokeStyle = gradient;
        ctx.stroke();
      }

      // Draw inner circle (transparent)
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      
      // Draw center logo image
      const img = imageRef.current;
      if (img && img.complete) {
        const imgSize = radius * 0.8; // Size of logo relative to circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, imgSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(
          img,
          centerX - imgSize / 2,
          centerY - imgSize / 2,
          imgSize,
          imgSize
        );
        ctx.restore();
      }
    };

    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      audioCtx.close();
    };
  }, [audioStream]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
      {/* Hidden image used for drawing into canvas */}
      <img
        ref={imageRef}
        src="./logo.png"
        alt="Bot Logo"
        className="hidden   animate-walkingBot"
      />
      <style>
      {` 
      
      
      @keyframes botWalk {
    0% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
    100% { transform: translateY(0); }
  }

  .animate-walkingBot {
    animation: botWalk 0.8s infinite;
  }`}
      </style>
    </>
  );
};

export default RadialVisualizer;