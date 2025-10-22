


// import React, { useEffect, useRef, useState } from "react";
// import "./VoiceVisualizerLive.css";

// const VoiceVisualizer = ({ isRecording }) => {
//   const [volumeData, setVolumeData] = useState(new Array(32).fill(0));
//   const audioContextRef = useRef(null);
//   const analyserRef = useRef(null);
//   const dataArrayRef = useRef(null);
//   const sourceRef = useRef(null);
//   const animationRef = useRef(null);
//   const streamRef = useRef(null);

//   useEffect(() => {
//     if (!isRecording) {
//       cancelAnimationFrame(animationRef.current);
//       if (audioContextRef.current) {
//         audioContextRef.current.close();
//         audioContextRef.current = null;
//       }
//       return;
//     }

//     const initAudio = async () => {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       streamRef.current = stream;

//       const audioContext = new (window.AudioContext || window.webkitAudioContext)();
//       const analyser = audioContext.createAnalyser();
//       analyser.fftSize = 64;

//       const source = audioContext.createMediaStreamSource(stream);
//       source.connect(analyser);

//       const bufferLength = analyser.frequencyBinCount;
//       const dataArray = new Uint8Array(bufferLength);

//       audioContextRef.current = audioContext;
//       analyserRef.current = analyser;
//       dataArrayRef.current = dataArray;
//       sourceRef.current = source;

//       const draw = () => {
//         analyser.getByteFrequencyData(dataArray);
//         const normalizedData = Array.from(dataArray).map(v => v / 255);
//         setVolumeData(normalizedData);
//         animationRef.current = requestAnimationFrame(draw);
//       };

//       draw();
//     };

//     initAudio();

//     return () => {
//       cancelAnimationFrame(animationRef.current);
//       streamRef.current?.getTracks().forEach((t) => t.stop());
//       audioContextRef.current?.close();
//     };
//   }, [isRecording]);

//   const barsToShow = 32;
//   const mid = Math.floor(barsToShow / 2);
//   const left = volumeData.slice(0, mid).reverse();
//   const right = volumeData.slice(mid, barsToShow);

//   return (
//     <div className="voice-visualizer-live flex items-center gap-10 justify-center">
//         <span>Recording</span>
        
//       {left.map((value, i) => (
//         <span key={`l-${i}`} className="bar" style={{ height: `${value * 40 + 5}px` }} />
//       ))}
//       {right.map((value, i) => (
//         <span key={`r-${i}`} className="bar" style={{ height: `${value * 40 + 5}px` }} />
//       ))}
//     </div>
//   );
// };

// export default VoiceVisualizer;


// import React, { useEffect, useRef, useState } from "react";
// import "./VoiceVisualizerLive.css";

// const VoiceVisualizer = ({ isRecording }) => {
//   const [volumeData, setVolumeData] = useState(new Array(64).fill(0)); // 64 bars for more detail
//   const audioContextRef = useRef(null);
//   const analyserRef = useRef(null);
//   const dataArrayRef = useRef(null);
//   const sourceRef = useRef(null);
//   const animationRef = useRef(null);
//   const streamRef = useRef(null);

//   useEffect(() => {
//     if (!isRecording) {
//       cancelAnimationFrame(animationRef.current);
//       if (audioContextRef.current) {
//         audioContextRef.current.close();
//         audioContextRef.current = null;
//       }
//       return;
//     }

//     const initAudio = async () => {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       streamRef.current = stream;

//       const audioContext = new (window.AudioContext || window.webkitAudioContext)();
//       const analyser = audioContext.createAnalyser();
//       analyser.fftSize = 128; // More frequency bins for higher bar count

//       const source = audioContext.createMediaStreamSource(stream);
//       source.connect(analyser);

//       const bufferLength = analyser.frequencyBinCount;
//       const dataArray = new Uint8Array(bufferLength);

//       audioContextRef.current = audioContext;
//       analyserRef.current = analyser;
//       dataArrayRef.current = dataArray;
//       sourceRef.current = source;

//       const draw = () => {
//         analyser.getByteFrequencyData(dataArray);
//         const normalizedData = Array.from(dataArray).map(v => v / 255);
//         setVolumeData(normalizedData);
//         animationRef.current = requestAnimationFrame(draw);
//       };

//       draw();
//     };

//     initAudio();

//     return () => {
//       cancelAnimationFrame(animationRef.current);
//       streamRef.current?.getTracks().forEach((t) => t.stop());
//       audioContextRef.current?.close();
//     };
//   }, [isRecording]);

//   const barsToShow = 64; // Increased bars for more detail
//   const barWidth = 100 / barsToShow; // Dynamically calculate width for each bar

//   return (
//     <div className="voice-visualizer-live">
//       <span className="recording-level-text">Recording</span>
//       <div className="bars-container">
//         {volumeData.map((value, i) => {
//           // Generate a waveform pattern with negative and positive values
//           const offset = Math.sin(i / 5) * 10; // Create a wave-like effect with a sine function
//           const height = Math.max(0, value * 40 + offset); // Apply the sine offset to create deflection

//           return (
//             <span
//               key={i}
//               className="bar"
//               style={{
//                 height: `${height}px`, // Dynamic height based on volume and sine offset
//                 width: `${barWidth}%`, // Set bar width proportionally
//                 transform: `translateY(${height}px)`, // Apply upward and downward movement
//               }}
//             />
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default VoiceVisualizer;

// waorking 
// import React, { useEffect, useRef, useState } from "react";
// import "./VoiceVisualizerLive.css";

// const VoiceVisualizer = ({ isRecording }) => {
//   const [volumeData, setVolumeData] = useState(new Array(64).fill(0)); // 64 bars
//   const audioContextRef = useRef(null);
//   const analyserRef = useRef(null);
//   const dataArrayRef = useRef(null);
//   const sourceRef = useRef(null);
//   const animationRef = useRef(null);
//   const streamRef = useRef(null);

//   useEffect(() => {
//     if (!isRecording) {
//       cancelAnimationFrame(animationRef.current);
//       if (audioContextRef.current) {
//         audioContextRef.current.close();
//         audioContextRef.current = null;
//       }
//       return;
//     }

//     const initAudio = async () => {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       streamRef.current = stream;

//       const audioContext = new (window.AudioContext || window.webkitAudioContext)();
//       const analyser = audioContext.createAnalyser();
//       analyser.fftSize = 128; // More frequency bins for higher bar count

//       const source = audioContext.createMediaStreamSource(stream);
//       source.connect(analyser);

//       const bufferLength = analyser.frequencyBinCount;
//       const dataArray = new Uint8Array(bufferLength);

//       audioContextRef.current = audioContext;
//       analyserRef.current = analyser;
//       dataArrayRef.current = dataArray;
//       sourceRef.current = source;

//       const draw = () => {
//         analyser.getByteFrequencyData(dataArray);
//         const normalizedData = Array.from(dataArray).map(v => v / 255);
//         setVolumeData(normalizedData);
//         animationRef.current = requestAnimationFrame(draw);
//       };

//       draw();
//     };

//     initAudio();

//     return () => {
//       cancelAnimationFrame(animationRef.current);
//       streamRef.current?.getTracks().forEach((t) => t.stop());
//       audioContextRef.current?.close();
//     };
//   }, [isRecording]);

//   const barsToShow = 64; // Increased bars
//   const barWidth = 60 / barsToShow; // Set width for each bar based on the total width

//   return (
//     <div className="voice-visualizer-live">
//       <span className="recording-level-text">Recording</span>
//       <div className="bars-container">
//         {volumeData.map((value, i) => (
//           <span
//             key={i}
//             className="bar"
//             style={{
//               height: `${value * 30 + 5}px`, // Adjust the height based on the value
//               width: `${barWidth}%`, // Dynamically set bar width
//             }}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default VoiceVisualizer;

// working well 
// import React, { useEffect, useRef, useState } from "react";

// const VoiceVisualizer = ({ isRecording }) => {
//   const canvasRef = useRef(null);
//   const audioContextRef = useRef(null);
//   const analyserRef = useRef(null);
//   const dataArrayRef = useRef(null);
//   const sourceRef = useRef(null);
//   const animationRef = useRef(null);
//   const streamRef = useRef(null);
//   const waveDataRef = useRef([]);
  
//   // Wave configuration
//   const wavePoints = 128;
  
//   useEffect(() => {
//     if (!isRecording) {
//       cancelAnimationFrame(animationRef.current);
//       if (audioContextRef.current) {
//         audioContextRef.current.close();
//         audioContextRef.current = null;
//       }
//       return;
//     }

//     const initAudio = async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//         streamRef.current = stream;

//         const audioContext = new (window.AudioContext || window.webkitAudioContext)();
//         const analyser = audioContext.createAnalyser();
//         analyser.fftSize = 256;

//         const source = audioContext.createMediaStreamSource(stream);
//         source.connect(analyser);

//         const bufferLength = analyser.frequencyBinCount;
//         const dataArray = new Uint8Array(bufferLength);

//         audioContextRef.current = audioContext;
//         analyserRef.current = analyser;
//         dataArrayRef.current = dataArray;
//         sourceRef.current = source;
        
//         // Initialize wave data with small values
//         waveDataRef.current = Array(wavePoints).fill(5);

//         const draw = () => {
//           if (!analyserRef.current || !canvasRef.current) return;
          
//           const canvas = canvasRef.current;
//           const ctx = canvas.getContext('2d');
          
//           // Make sure canvas dimensions match its display size
//           const { width, height } = canvas.getBoundingClientRect();
//           canvas.width = width;
//           canvas.height = height;
          
//           // Get frequency data
//           analyser.getByteFrequencyData(dataArray);
          
//           // Clear the canvas
//           ctx.clearRect(0, 0, width, height);
          
//           // Setup gradient
//           const gradient = ctx.createLinearGradient(0, 0, width, 0);
//           gradient.addColorStop(0, '#3b82f6');  // Blue
//           gradient.addColorStop(1, '#06b6d4');  // Cyan
//           ctx.strokeStyle = gradient;
//           ctx.lineWidth = 2;
          
//           // Shift existing wave data to the left
//           waveDataRef.current.shift();
          
//           // Calculate new amplitude based on current audio levels
//           // Take average of frequencies, giving more weight to lower frequencies
//           const lowFreq = Array.from(dataArray.slice(0, 10)).reduce((a, b) => a + b, 0) / 10;
//           const midFreq = Array.from(dataArray.slice(10, 30)).reduce((a, b) => a + b, 0) / 20;
//           const highFreq = Array.from(dataArray.slice(30, 50)).reduce((a, b) => a + b, 0) / 20;
          
//           // Weighted average to create smoother response
//           const amplitude = (lowFreq * 0.6 + midFreq * 0.3 + highFreq * 0.1) / 255;
//           const newValue = Math.max(3, amplitude * (height * 0.4));
          
//           // Add new point to the end (right side)
//           waveDataRef.current.push(newValue);
          
//           // Draw wave path
//           ctx.beginPath();
          
//           const centerY = height / 2;
//           const sliceWidth = width / (waveDataRef.current.length - 1);
          
//           // Start at the left edge
//           ctx.moveTo(0, centerY);
          
//           // Draw the wave from left to right
//           waveDataRef.current.forEach((value, i) => {
//             const x = i * sliceWidth;
//             const y = centerY - value / 2; // Top half of the wave
//             ctx.lineTo(x, y);
//           });
          
//           // Draw the reflection (bottom half of the wave)
//           for (let i = waveDataRef.current.length - 1; i >= 0; i--) {
//             const x = i * sliceWidth;
//             const y = centerY + waveDataRef.current[i] / 2; // Bottom half
//             ctx.lineTo(x, y);
//           }
          
//           ctx.closePath();
//           ctx.fillStyle = 'rgba(59, 130, 246, 0.2)'; // Light blue with transparency
//           ctx.fill();
          
//           // Draw the top line of the wave
//           ctx.beginPath();
//           waveDataRef.current.forEach((value, i) => {
//             const x = i * sliceWidth;
//             const y = centerY - value / 2;
//             if (i === 0) {
//               ctx.moveTo(x, y);
//             } else {
//               ctx.lineTo(x, y);
//             }
//           });
//           ctx.stroke();
          
//           // Draw the bottom line of the wave
//           ctx.beginPath();
//           waveDataRef.current.forEach((value, i) => {
//             const x = i * sliceWidth;
//             const y = centerY + value / 2;
//             if (i === 0) {
//               ctx.moveTo(x, y);
//             } else {
//               ctx.lineTo(x, y);
//             }
//           });
//           ctx.stroke();
          
//           animationRef.current = requestAnimationFrame(draw);
//         };

//         draw();
//       } catch (err) {
//         console.error("Error accessing microphone:", err);
//       }
//     };

//     initAudio();

//     return () => {
//       cancelAnimationFrame(animationRef.current);
//       streamRef.current?.getTracks().forEach((t) => t.stop());
//       audioContextRef.current?.close();
//     };
//   }, [isRecording]);

//   return (
//     <div className="voice-visualizer-live">
//       <span className="recording-level-text">Recording</span>
//       <canvas 
//         ref={canvasRef}
//         className="wave-canvas"
//       />
//     </div>
//   );
// };

// export default VoiceVisualizer;


import React, { useEffect, useRef, useState } from "react";

const VoiceVisualizer = ({ isRecording }) => {
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);
  const animationRef = useRef(null);
  const streamRef = useRef(null);
  const waveDataRef = useRef([]);
  
  // Wave configuration
  const wavePoints = 128;
  
  useEffect(() => {
    if (!isRecording) {
      cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      return;
    }

    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;

        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        dataArrayRef.current = dataArray;
        sourceRef.current = source;
        
        // Initialize wave data with small values
        waveDataRef.current = Array(wavePoints).fill(5);

        const draw = () => {
          if (!analyserRef.current || !canvasRef.current) return;
          
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          
          // Make sure canvas dimensions match its display size
          const { width, height } = canvas.getBoundingClientRect();
          canvas.width = width;
          canvas.height = height;
          
          // Get frequency data
          analyser.getByteFrequencyData(dataArray);
          
          // Clear the canvas
          ctx.clearRect(0, 0, width, height);
          
          // Setup gradient
          const gradient = ctx.createLinearGradient(0, 0, width, 0);
          gradient.addColorStop(0, '#3b82f6');  // Blue
          gradient.addColorStop(1, '#06b6d4');  // Cyan
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 2;
          
          // Shift existing wave data to the left
          waveDataRef.current.shift();
          
          // Calculate new amplitude based on current audio levels
          // Take average of frequencies, giving more weight to lower frequencies
          const lowFreq = Array.from(dataArray.slice(0, 10)).reduce((a, b) => a + b, 0) / 10;
          const midFreq = Array.from(dataArray.slice(10, 30)).reduce((a, b) => a + b, 0) / 20;
          const highFreq = Array.from(dataArray.slice(30, 50)).reduce((a, b) => a + b, 0) / 20;
          
          // Weighted average to create smoother response
          const amplitude = (lowFreq * 0.6 + midFreq * 0.3 + highFreq * 0.1) / 255;
          
          // Limit the height to prevent overflow - using a smaller multiplier
          const newValue = Math.max(3, amplitude * (height * 0.35));
          
          // Add new point to the end (right side)
          waveDataRef.current.push(newValue);
          
          // Draw wave path
          ctx.beginPath();
          
          const centerY = height / 2;
          const sliceWidth = width / (waveDataRef.current.length - 1);
          
          // Start at the left edge
          ctx.moveTo(0, centerY);
          
          // Draw the wave from left to right
          waveDataRef.current.forEach((value, i) => {
            const x = i * sliceWidth;
            const y = centerY - value / 2; // Top half of the wave
            ctx.lineTo(x, y);
          });
          
          // Draw the reflection (bottom half of the wave)
          for (let i = waveDataRef.current.length - 1; i >= 0; i--) {
            const x = i * sliceWidth;
            const y = centerY + waveDataRef.current[i] / 2; // Bottom half
            ctx.lineTo(x, y);
          }
          
          ctx.closePath();
          ctx.fillStyle = 'rgba(59, 130, 246, 0.2)'; // Light blue with transparency
          ctx.fill();
          
          // Draw the top line of the wave
          ctx.beginPath();
          waveDataRef.current.forEach((value, i) => {
            const x = i * sliceWidth;
            const y = centerY - value / 2;
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          });
          ctx.stroke();
          
          // Draw the bottom line of the wave
          ctx.beginPath();
          waveDataRef.current.forEach((value, i) => {
            const x = i * sliceWidth;
            const y = centerY + value / 2;
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          });
          ctx.stroke();
          
          animationRef.current = requestAnimationFrame(draw);
        };

        draw();
      } catch (err) {
        console.error("Error accessing microphone:", err);
      }
    };

    initAudio();

    return () => {
      cancelAnimationFrame(animationRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioContextRef.current?.close();
    };
  }, [isRecording]);

  return (
    <div className="h-full w-full">
      <span className="text-sm font-bold font-centurygothic text-black dark:text-white opacity-70 absolute top-1 left-3">Recording</span>
      <canvas 
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
};

export default VoiceVisualizer;