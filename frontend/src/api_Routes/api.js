import axios from "axios";

// const API_BASE_URL = "https://quantumhash-backend-1.onrender.com/api"; // Replace with your backend URL

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Login API
// export const login = async (credentials) => {
//   try {
//     const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
    
//     console.log("🔍 Raw Axios Response:", response); // Check raw response
//     console.log("🔍 Response Data:", response.data); // Ensure .data exists

//     return response.data; // ✅ Return actual data
//   } catch (error) {
//     if (error.response) {
//       console.error("❌ Login API Error (Response):", error.response.data);
//     } else if (error.request) {
//       console.error("❌ Login API Error (No Response):", error.request);
//     } else {
//       console.error("❌ Login API Error (Other):", error.message);
//     }
//     return null; // Prevents breaking the app
//   }
// };

export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
    
    console.log("🔍 Raw Axios Response:", response); // Check raw response
    console.log("🔍 Response Data:", response.data); // Ensure .data exists

    return response.data; // ✅ Return actual data
  } catch (error) {
    let errorMsg = "Login failed!";
    if (error.response) {
      console.error("❌ Login API Error (Response):", error.response.data);
      errorMsg = error.response.data?.error || errorMsg;
    } else if (error.request) {
      console.error("❌ Login API Error (No Response):", error.request);
      errorMsg = "No response from server.";
    } else {
      console.error("❌ Login API Error (Other):", error.message);
      errorMsg = error.message;
    }

    // ❌ Throw the error to be caught by the thunk
    throw new Error(errorMsg);
  }
};

 
 

// Fetch user, token, and conversation ID from Google callback route
export const fetchGoogleCallbackData = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/google/callback`,credentials );
console.log("🔍 Google Callback Response:", response);
console.log("🔍 Response Data:", response.data); // Ensure .data exists

    if (!response.ok) {
      throw new Error("❌ Google login failed");
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Google login failed");
    }

    return data; // Return the data containing token, user, and conversation_id
  } catch (error) {
    console.error("❌ Error in API call:", error.message);
    throw error; // Rethrow the error to be caught in the Redux action
  }
};


export const initiateGoogleLogin = () => {
  window.location.href = `${API_BASE_URL}/auth/google`;
};

 

// Signup API


export const signup = async (credentials) => {
  const response = await axios.post(`${API_BASE_URL}/auth/signup`, credentials);
  return response.data;
};


// New: Verify OTP API
export const verifyOtp = async (data) => {
  const response = await axios.post(`${API_BASE_URL}/auth/verify-otp`, data);
  return response.data;
};

// New: Resend OTP API
export const resendOtp = async (data) => {
  const response = await axios.post(`${API_BASE_URL}/auth/signup`, data); 
  // Assuming resend is the same endpoint as signup sending OTP again
  return response.data;
};

export const sendForgotPasswordOtp = async (email) => {
  const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
  return response.data;
};

export const verifyResetOtp = async ({ email, otp }) => {
  const response = await axios.post(`${API_BASE_URL}/auth/verify-reset-otp`, { email, otp });
  return response.data;
};

export const resetPassword = async ({ email, otp, newPassword, confirmPassword }) => {
  const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
    email,
    otp,
    newPassword,
    confirmPassword,
  });
  return response.data;
};


// Fetch user's conversations
export const fetchConversations = async (token) => {
  const response = await axios.get(`${API_BASE_URL}/chat/conversations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Fetch conversation history
// export const fetchConversationHistory = async (conversationId, token) => {
//   const response = await axios.get(`${API_BASE_URL}/chat/conversations/${conversationId}`, {
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   return response.data;
// };
// ✅ FIND YOUR EXISTING fetchConversationHistory FUNCTION AND REPLACE IT:
export const fetchConversationHistory = async (conversationId, token) => {
  const response = await axios.get(`${API_BASE_URL}/chat/conversations/${conversationId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  
  
  return response.data;
};




export const sendMessage = async (
  conversationId,
  message,
  userId,
  token,
  extracted_summary_raw = "",
  uploaded_file_metadata = [],
  file_upload_ids = [],
  onStreamChunk = null // Callback for streaming chunks
) => {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userMessage: message,
      conversation_id: conversationId,
      user_id: userId,
      extracted_summary: extracted_summary_raw,
      uploaded_file_metadata,
      _file_upload_ids: file_upload_ids
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  let buffer = '';
  let fullResponse = '';
  let metadata = null;
  let suggestions = [];

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer
      
      for (const line of lines) {
        if (line.trim()) {
          try {
            const data = JSON.parse(line);
            
            switch (data.type) {
              case 'start':
                metadata = data;
                if (onStreamChunk) {
                  onStreamChunk({ type: 'start', data: metadata });
                }
                break;
                
              case 'content':
                fullResponse += data.content;
                if (onStreamChunk) {
                  onStreamChunk({ 
                    type: 'content', 
                    content: data.content,
                    fullResponse: fullResponse 
                  });
                }
                break;
                 // 📄 ADD THESE MISSING CASES:
  case 'file_generation':
  if (onStreamChunk) {
    onStreamChunk({
      type: 'file_generation',
      status: data.status,
      file_type: data.file_type,
      message: data.message
    });
  }
  break;

case 'file_created':  // ✅ ADD: This was missing!
  if (onStreamChunk) {
    onStreamChunk({
      type: 'file_created',
      status: data.status,
      files_count: data.files_count
    });
  }
  break;

case 'file_error':  // ✅ ADD: This was also missing!
  if (onStreamChunk) {
    onStreamChunk({
      type: 'file_error',
      error: data.error,
      message: data.message
    });
  }
  break;

case 'file_generated':
  if (onStreamChunk) {
    onStreamChunk({
      type: 'file_generated',
      file_type: data.file_type,
      filename: data.filename,
      mime_type: data.mime_type,
      file_data: data.file_data,
      download_ready: data.download_ready,
      success: data.success
    });
  }
  break;

              case 'end':
                suggestions = data.suggestions || [];
                if (onStreamChunk) {
                  onStreamChunk({ 
                    type: 'end', 
                    suggestions: suggestions,
                    fullResponse: fullResponse 
                  });
                }
                break;
                
              case 'error':
                // ✅ ADD: Proper error handling
                console.error('❌ Backend error received:', data.error);
                if (onStreamChunk) {
                  onStreamChunk({
                    type: 'error',
                    error: data.error,
                    timestamp: data.timestamp
                  });
                }
                // ✅ ADD: Throw error to stop processing
                throw new Error(data.error);
            }
          } catch (parseError) {
            console.error('Error parsing streaming data:', parseError);
            // ✅ ADD: If it's our thrown error, re-throw it
            if (parseError.message && parseError.message !== 'Unexpected token') {
              throw parseError;
            }
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return {
    response: fullResponse,
    suggestions: suggestions,
    files: metadata?.uploaded_files || [],
    conversation_id: metadata?.conversation_id || conversationId,
    ...metadata
  };
};

// Create a new conversation (Auto-call on Login/Signup)
  export const createNewConversation = async (token) => {
  const response = await axios.post(
    `${API_BASE_URL}/chat/create-conversation`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// ✅ Upload files
export const uploadFiles = async (formData, token) => {
  if (!token) {
      throw new Error("🚨 No authentication token found!");
  }

  return await axios.post(`${API_BASE_URL}/files/upload-files`, formData, {
    headers: { 
      Authorization: `Bearer ${token}`, // ✅ Ensure token is passed
      "Content-Type": "multipart/form-data"
    },
    withCredentials: true, // <- ✅ important
  });
};

// rename conversations 
export const renameConversation = async (conversationId, newName, token) => {
  const response = await axios.put(
    `${API_BASE_URL}/chat/rename/${conversationId}`,
    { name: newName },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// soft delete function 
export const deleteConversation = async (id, token) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/chat/conversations/${id}/delete`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // Return the backend response
  } catch (error) {
    console.error("❌ Error deleting conversation:", error);
    throw error;
  }
};

// voice upload 
// api.js
export const uploadFinalAudio = async (blob, token) => {
  try {
    const formData = new FormData();
    formData.append("audio", blob, "voice.webm");

    const res = await fetch(`${API_BASE_URL}/voice/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();
    return data.transcript;
  } catch (err) {
    console.error("❌ Final audio upload failed:", err);
    return "";
  }
};

// Send a message from voice (used by startRealtimeAI)
 
export const fetchUserDetails = async (token) => {
  const response = await fetch(`${API_BASE_URL}/auth/userDetails`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
};

// guest mode 
export const sendGuestMessage = async (plainText, onStream) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/guest-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userMessage: plainText,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Handle streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    let suggestions = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(Boolean);

      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          
          switch (data.type) {
            case 'start':
              onStream?.({
                type: 'start',
                data: data
              });
              break;
            case 'content':
              fullResponse += data.content;
              onStream?.({
                type: 'content',
                content: data.content,
                fullResponse: fullResponse
              });
              break;
            case 'end':
              suggestions = data.suggestions || [];
              onStream?.({
                type: 'end',
                fullResponse: data.full_response || fullResponse,
                suggestions: suggestions
              });
              break;
            case 'error':
              onStream?.({
                type: 'error',
                error: data.error
              });
              throw new Error(data.error);
          }
        } catch (parseError) {
          console.error('Parse error:', parseError);
        }
      }
    }

    return {
      response: fullResponse,
      suggestions: suggestions
    };
  } catch (error) {
    console.error("❌ Error sending guest message:", error);
    throw error;
  }
};

  