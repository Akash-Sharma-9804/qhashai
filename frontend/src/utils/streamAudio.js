// // utils/streamAudio.js
// export async function streamAudio(text, voice = 'af_heart', speed = 1.0) {
//   const response = await fetch('https://composed-singular-seagull.ngrok-free.app/stream', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ text, voice, speed }),
//   });

//   const reader = response.body.getReader();
//   const chunks = [];

//   while (true) {
//     const { done, value } = await reader.read();
//     if (done) break;
//     chunks.push(value);
//   }

//   const audioBlob = new Blob(chunks, { type: 'audio/wav' });
//   const audioUrl = URL.createObjectURL(audioBlob);
//   const audio = new Audio(audioUrl);
//   audio.play();
// }

// utils/streamAudio.js

// export async function streamAudio(text, voice = 'af_heart', speed = 1.0) {
//      let isTTSPlaying = true; // Declare the variable here
//  const response = await fetch('https://composed-singular-seagull.ngrok-free.app/stream', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ text, voice, speed }),
//   });

//   const reader = response.body.getReader();
//   const chunks = [];

//   while (true) {
//     const { done, value } = await reader.read();
//     if (done) break;
//     chunks.push(value);
//   }

//   const audioBlob = new Blob(chunks, { type: 'audio/wav' });
//   const audioUrl = URL.createObjectURL(audioBlob);
//   const audio = new Audio(audioUrl);

//   audio.onended = () => {
//     // After TTS finishes, resume recording
//     if (!isTTSPlaying) {
//       startRecorder(audioStreamRef.current); // Restart recording
//     }
//   };

//   await audio.play(); // Wait for the audio to finish playing
// };

// let isTTSPlaying = false; // place this at the module level
export async function streamAudio(text, voice = 'am_michael', speed = 1.0) {
  let isTTSPlaying = true; // Declare a flag for TTS playing status

  const response = await fetch('https://composed-singular-seagull.ngrok-free.app/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice, speed }),
  });

  const reader = response.body.getReader();
  const chunks = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const audioBlob = new Blob(chunks, { type: 'audio/wav' });
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);

  audio.onended = () => {
    // After TTS finishes, resume recording
    if (!isTTSPlaying) {
      startRecorder(audioStreamRef.current); // Restart recording
    }
    isTTSPlaying = false; // Update flag after TTS ends
  };

  await audio.play(); // Wait for the audio to finish playing
}
