import axios from "axios";
import { addChat, updateChat, setCurrentChat } from "../redux/chatSlice"; // Ensure correct import path

const API_BASE_URL = "http://localhost:5001"; // Change if deployed

const sendMessage = async (input, file, chats, currentChat, setInput, setBotTyping, setLoading, setFile, dispatch, user_id) => {
    if (!input.trim() && !file) return;

    setLoading(true);
    setBotTyping("Thinking...");
    
    const chatId = currentChat || Date.now();
    let userMessageText = input;
    
    if (file) {
        try {
            const formData = new FormData();
            formData.append("file", file);
            const uploadResponse = await axios.post(`${API_BASE_URL}/upload`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            userMessageText += `\n(File Uploaded: ${file.name})`;
        } catch (error) {
            console.error("File Upload Error:", error);
            return;
        }
    }

    // Updating Redux state for UI
    let updatedChats = [...chats];

    if (!currentChat) {
        const newChat = {
            id: chatId,
            title: input.substring(0, 30) + (input.length > 30 ? "..." : ""),
            messages: [{ sender: "user", text: userMessageText }],
        };

        updatedChats = [newChat, ...updatedChats];
        dispatch(addChat(newChat));
        dispatch(setCurrentChat(chatId));
    } else {
        const chatIndex = updatedChats.findIndex(chat => chat.id === chatId);
        if (chatIndex !== -1) {
            updatedChats[chatIndex] = {
                ...updatedChats[chatIndex],
                messages: [...updatedChats[chatIndex].messages, { sender: "user", text: userMessageText }],
            };
            dispatch(updateChat(updatedChats[chatIndex]));
        }
    }

    setInput("");

    try {
        const response = await axios.post(`${API_BASE_URL}/query`, { user_id, userQuery: input });
        const botResponse = response.data.response || "Sorry, I couldn't understand.";

        const chatIndex = updatedChats.findIndex(chat => chat.id === chatId);
        if (chatIndex !== -1) {
            updatedChats[chatIndex] = {
                ...updatedChats[chatIndex],
                messages: [...updatedChats[chatIndex].messages, { sender: "bot", text: botResponse }],
            };
            dispatch(updateChat(updatedChats[chatIndex]));
        }
    } catch (error) {
        console.error("Error fetching OpenAI response:", error);

        const chatIndex = updatedChats.findIndex(chat => chat.id === chatId);
        if (chatIndex !== -1) {
            updatedChats[chatIndex] = {
                ...updatedChats[chatIndex],
                messages: [...updatedChats[chatIndex].messages, { sender: "bot", text: "Error getting response. Try again." }],
            };
            dispatch(updateChat(updatedChats[chatIndex]));
        }
    }

    setBotTyping("");
    setLoading(false);
    setFile(null);
};

export default sendMessage;
