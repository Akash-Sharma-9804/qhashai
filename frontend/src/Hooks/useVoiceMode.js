import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addMessage } from "../store/chatSlice2";
import { v4 as uuidv4 } from "uuid";

let mediaRecorder;
let audioChunks = [];
let pauseTimer = null;
let socket = null;

const useVoiceMode = ({ userId, token, activeConversationId }) => {
  const dispatch = useDispatch();
  const [isRecording, setIsRecording] = useState(false);

  const startAivoice = async () => {
    if (isRecording) return;
    setIsRecording(true);

    audioChunks = [];
    socket = new WebSocket(`ws://localhost:5001/api/voice/live?user_id=${userId}`);

    socket.onopen = () => {
      console.log("🎙️ WebSocket connection established");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "transcript") {
        const { transcript, response, conversation_id } = data;

        dispatch(addMessage({
          conversationId: conversation_id,
          message: {
            id: uuidv4(),
            type: "user",
            content: transcript,
            timestamp: new Date().toISOString(),
          },
        }));

        dispatch(addMessage({
          conversationId: conversation_id,
          message: {
            id: uuidv4(),
            type: "ai",
            content: response,
            timestamp: new Date().toISOString(),
          },
        }));
      }
    };

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(event.data);
      }
    };

    mediaRecorder.onstart = () => {
      console.log("🎤 Recording started");
    };

    mediaRecorder.onstop = () => {
      console.log("🛑 Recording stopped");
    };

    mediaRecorder.start(250); // record and send every 250ms

    // Listen for silence (1s pause detection)
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.fftSize);
    const silenceThreshold = 5;

    const checkSilence = () => {
      analyser.getByteTimeDomainData(dataArray);
      const isSilent = dataArray.every(val => Math.abs(val - 128) < silenceThreshold);

      if (isSilent) {
        if (!pauseTimer) {
          pauseTimer = setTimeout(() => {
            mediaRecorder.requestData(); // manually flush audio
            pauseTimer = null;
          }, 1000); // pause of 1 second
        }
      } else if (pauseTimer) {
        clearTimeout(pauseTimer);
        pauseTimer = null;
      }

      if (isRecording) {
        requestAnimationFrame(checkSilence);
      }
    };

    requestAnimationFrame(checkSilence);
  };

  const stopAivoice = () => {
    if (!isRecording) return;
    setIsRecording(false);

    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.close();
    }

    pauseTimer && clearTimeout(pauseTimer);
    pauseTimer = null;
    console.log("🛑 Voice mode ended");
  };

  return { startAivoice, stopAivoice, isRecording };
};

export default useVoiceMode;
