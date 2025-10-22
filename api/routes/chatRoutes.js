const express = require("express");
const {
    askChatbot,
    getChatHistory,
    createConversation,
    getConversations,
    getConversationHistory,
    softDeleteConversation,
    updateConversationName,
    guestChat,
} = require("../controllers/chatController");
const authMiddleware = require("../middleware/authMiddleware");
const { semanticSearch } = require("../utils/semanticSearch");
const router = express.Router();

// ✅ Create a new conversation
router.post("/create-conversation", authMiddleware, createConversation);

// ✅ Get all conversations for the authenticated user
router.get("/conversations", authMiddleware, getConversations);

// ✅ Fetch chat history for a specific conversation
router.get("/conversations/:conversation_id", authMiddleware, getConversationHistory);

// ✅ Handle chatbot interaction (POST request)
router.post("/", authMiddleware, askChatbot); 

router.post("/guest-chat", guestChat);

// ✅ Fetch general chat history for the authenticated user
router.get("/history", authMiddleware, getChatHistory);

// ✅ rename conversation name
router.put('/rename/:conversationId', authMiddleware, updateConversationName);

// ✅ Soft delete a conversation
router.patch('/conversations/:id/delete', authMiddleware, softDeleteConversation);

// Semantic search endpoint
router.post("/semantic-search", async (req, res) => {
  try {
    const { query, conversation_id, limit = 5 } = req.body;
    const user_id = req.user?.user_id;

    if (!user_id || !query) {
      return res.status(400).json({ 
        error: "User ID and query are required" 
      });
    }

    console.log(`🔍 Semantic search request from user ${user_id}: "${query}"`);

    const searchResult = await semanticSearch.searchWithContext(
      query,
      user_id,
      conversation_id,
      { limit, includeFileStats: true }
    );

    res.json({
      success: true,
      ...searchResult,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("❌ Semantic search API error:", error);
    res.status(500).json({
      success: false,
      error: "Semantic search failed",
      message: error.message,
    });
  }
});

// RAG system health check
router.get("/rag-status",  async (req, res) => {
  try {
    const user_id = req.user?.user_id;
    const { ragSystem } = require("../utils/ragSystem");
    
    // Get user's file statistics
    const stats = await ragSystem.getFileStats(user_id);
    
    res.json({
      success: true,
      ragSystemStatus: "operational",
      userStats: stats,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error("❌ RAG status check error:", error);
    res.status(500).json({
      success: false,
      ragSystemStatus: "error",
      error: error.message,
    });
  }
});
module.exports = router;
