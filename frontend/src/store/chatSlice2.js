
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  conversations: [],
  activeConversation: null,
  messages: {}, // ✅ Per-conversation messages   
  isGuest: false,              // <-- track if guest mode is active
  guestConversationId: null,   // <-- store guest conversation ID
};

const chatSlice2 = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setConversations: (state, action) => {
      state.conversations = Array.isArray(action.payload) ? action.payload : [action.payload];
    },
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
      if (!state.messages[action.payload]) {
        state.messages[action.payload] = [];
      }
    },
    addConversation: (state, action) => {
      // Check if conversation already exists
      const existingConversation = state.conversations.find(
        conv => conv.id === action.payload.id
      );
      
      if (!existingConversation) {
        // Only add if it doesn't exist
        state.conversations.unshift(action.payload);
        console.log("✅ Added conversation to Redux:", action.payload.id);
      } else {
        console.log("⚠️ Conversation already exists in Redux:", action.payload.id);
      }
    },
    setMessages: (state, action) => {
      const { conversationId, messages } = action.payload;
      // console.log("📦 Setting messages in Redux for:", conversationId, messages); // <-- Add this
      state.messages[conversationId] = messages;
    },
    removeConversationFromRedux: (state, action) => {
      state.conversations = state.conversations.filter(
        (conv) => conv.id !== action.payload
      );
    },
    renameConversationRedux: (state, action) => {
      const { id, newName } = action.payload;
      state.conversations = state.conversations.map((conv) =>
        conv.id === id ? { ...conv, name: newName } : conv
      );
    },
    addMessage: (state, action) => {
      const { conversationId, message } = action.payload;
      
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      // Adding files to the message object (if files are present)
      const newMessage = {
        ...message,
        files: message.files || [], // Ensure files array is present 
        suggestions: message.suggestions || [], // ✅ add this
        isStreaming: message.isStreaming || false, // 🚀 Add streaming flag
        
      };
      state.messages[conversationId].push(newMessage);
    },
    // 🚀 Updated updateMessage to handle all possible updates including streaming
    updateMessage: (state, action) => {
      const { conversationId, id, ...updates } = action.payload;
      
      if (!state.messages[conversationId]) return;
      
      const messageIndex = state.messages[conversationId].findIndex(msg => msg.id === id);
      if (messageIndex !== -1) {
        // 🚀 Merge all updates into the existing message
        state.messages[conversationId][messageIndex] = {
          ...state.messages[conversationId][messageIndex],
          ...updates, // This will include message, response, files, suggestions, isStreaming, etc.
        };
      }
    },
    clearChatData: (state) => {
      state.conversations = [];
      state.activeConversation = null;
      state.messages = {};
      localStorage.removeItem("conversation_id"); // fix key name
      localStorage.removeItem("guest_conversation_id"); // clear guest ID
    },
    resetChat: (state) => {
      state.activeConversation = null;
    },
    removeMessage: (state, action) => {
      const { conversationId, id } = action.payload;
      const conversation = state.messages[conversationId];
      if (conversation) {
        state.messages[conversationId] = conversation.filter(
          (msg) => msg.id !== id
        );
      }
    },
    setGuestMode: (state, action) => {
      state.isGuest = action.payload;
      if (!action.payload) {
        state.guestConversationId = null;
        localStorage.removeItem("guest_conversation_id");
      }
    },
    setGuestConversationId: (state, action) => {
      state.guestConversationId = action.payload;
      localStorage.setItem("guest_conversation_id", action.payload);
    },
    // 🚀 New action for updating streaming status specifically
    setMessageStreaming: (state, action) => {
      const { conversationId, id, isStreaming } = action.payload;
      
      if (!state.messages[conversationId]) return;
      
      const messageIndex = state.messages[conversationId].findIndex(msg => msg.id === id);
      if (messageIndex !== -1) {
        state.messages[conversationId][messageIndex].isStreaming = isStreaming;
      }
    },
    // 🚀 New action for appending streaming content (alternative approach)
    appendMessageContent: (state, action) => {
      const { conversationId, id, content } = action.payload;
      
      if (!state.messages[conversationId]) return;
      
      const messageIndex = state.messages[conversationId].findIndex(msg => msg.id === id);
      if (messageIndex !== -1) {
        const currentMessage = state.messages[conversationId][messageIndex];
        state.messages[conversationId][messageIndex] = {
          ...currentMessage,
          message: (currentMessage.message || '') + content,
          response: (currentMessage.response || '') + content,
        };
      }
    },
    // 🚀 New action for batch updating message with all streaming data
    updateStreamingMessage: (state, action) => {
      const { conversationId, id, message, response, suggestions, files, isStreaming } = action.payload;
      
      if (!state.messages[conversationId]) return;
      
      const messageIndex = state.messages[conversationId].findIndex(msg => msg.id === id);
      if (messageIndex !== -1) {
        state.messages[conversationId][messageIndex] = {
          ...state.messages[conversationId][messageIndex],
          ...(message !== undefined && { message }),
          ...(response !== undefined && { response }),
          ...(suggestions !== undefined && { suggestions }),
          ...(files !== undefined && { files }),
          ...(isStreaming !== undefined && { isStreaming }),
        };
      }
    },
  },
});

export const {
  setConversations,
  setActiveConversation,
  addConversation,
  setMessages,
  addMessage,
  updateMessage,
  removeMessage,
  clearChatData,
  renameConversationRedux,
  removeConversationFromRedux,
  resetChat,
  setGuestMode,           // Export guest mode toggle
  setGuestConversationId, // Export guest conv id setter
  setMessageStreaming,    // 🚀 Export streaming status updater
  appendMessageContent,   // 🚀 Export content appender
  updateStreamingMessage, // 🚀 Export streaming message updater
} = chatSlice2.actions;

export default chatSlice2.reducer;
