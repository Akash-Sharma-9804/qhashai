import React, { useState, useEffect, useRef } from "react";
import {  Link, useNavigate } from "react-router-dom";
import "./sidebar.css";
import {
  Sun,
  Moon,
  Plus,
  Menu,
  Trash,
  X,
  Pen,
  EllipsisVertical,
  CircleEllipsis ,
  CheckCircle ,
  Save,
  PanelRightOpen,
  BadgeHelp,
  History,
  MoreVertical,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchConversations,
  createNewConversation,
  fetchConversationHistory,
  renameConversation,
  deleteConversation,
} from "../../api_Routes/api";
import {
  setConversations,
  setActiveConversation,
  setMessages,
  addConversation,
  renameConversationRedux,
  removeConversationFromRedux,
} from "../../store/chatSlice2";
import dayjs from "dayjs";
import isYesterday from "dayjs/plugin/isYesterday";
import { toast } from "react-toastify";

dayjs.extend(isYesterday);
const Sidebar = ({isOpen, setIsOpen}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const buttonRef = useRef(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
   
  const [openMenu, setOpenMenu] = useState(null);
  const navigate = useNavigate(); 
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [dropdownId, setDropdownId] = useState(null);
 // Add these new state variables for typing animation
// Add these new state variables for typing animation (around line 35)
const [renamingId, setRenamingId] = useState(null);
const [tempRenameText, setTempRenameText] = useState("");
// Update the fetchingConversationId state to handle both single ID and Set
const [fetchingConversationId, setFetchingConversationId] = useState(null);




  // const [isOpen, setIsOpen] = useState(false); // For mobile view
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const { conversations, activeConversation } = useSelector(
    (state) => state.chat
  );

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true"; // default to false if not found
  });
  

  const prevActiveConvRef = useRef();
  // ✅ Group conversations by Today, Yesterday, Previous
  const groupConversationsByDate = (conversations) => {
    const today = [];
    const yesterday = [];
    const previous = [];

    conversations.forEach((conv) => {
      const createdAt = dayjs(conv.created_at || new Date());

      if (createdAt.isSame(dayjs(), "day")) {
        today.push(conv);
      } else if (createdAt.isYesterday()) {
        yesterday.push(conv);
      } else {
        previous.push(conv);
      }
    });

    return { today, yesterday, previous };
  };

  // useEffect(() => {
  //   if (token) {
  //     fetchConversations(token)
  //       .then((data) => {
  //         console.log("Fetched Conversations:", data);
  //         dispatch(setConversations(data.conversations || []));
  //       })
  //       .catch((err) => console.error("Error fetching conversations:", err));
  //   }
  // }, [token, dispatch]);

  // useEffect(() => {
  //   const storedConversationId = localStorage.getItem("conversation_id");
  //   if (storedConversationId) {
  //     dispatch(setActiveConversation(Number(storedConversationId)));
  //   }
  // }, []);

  // useEffect(() => {
  //   console.log("👀 Conversations in Redux:", conversations);
  // }, [conversations]);

  // useEffect(() => {
  //   if (token) {
  //     fetchConversations(token)
  //       .then((data) => {
  //         // console.log("Fetched Conversations:", data);
  //         dispatch(setConversations(data.conversations || []));
  //       })
  //       .catch((err) => console.error("Error fetching conversations:", err));
  //   }
  // }, [token, dispatch]);
// Replace the existing useEffect for fetching conversations
// Replace the existing useEffect for fetching conversations
// useEffect(() => {
//   if (token) {
//     fetchConversations(token)
//       .then((data) => {
//         console.log("Fetched Conversations:", data);
//         const conversations = data.conversations || [];
        
//         // Set all conversations as fetching initially
//         const fetchingIds = new Set(conversations.map(conv => conv.id));
//         setFetchingConversationId(fetchingIds);
        
//         // Set conversations in Redux
//         dispatch(setConversations(conversations));
        
//         // Simulate typing animation for each conversation
//         conversations.forEach((conv, index) => {
//           setTimeout(() => {
//             setFetchingConversationId(prev => {
//               if (prev instanceof Set) {
//                 const newSet = new Set(prev);
//                 newSet.delete(conv.id);
//                 return newSet.size > 0 ? newSet : null;
//               }
//               return prev === conv.id ? null : prev;
//             });
//           }, (index + 1) * 300); // Stagger the animations
//         });
//       })
//       .catch((err) => console.error("Error fetching conversations:", err));
//   }
// }, [token, dispatch]);

useEffect(() => {
  if (token) {
    fetchConversations(token)
      .then(async (data) => {
        console.log("Fetched Conversations:", data);
        const conversations = data.conversations || [];
        
        // Set all conversations as fetching initially
        const fetchingIds = new Set(conversations.map(conv => conv.id));
        setFetchingConversationId(fetchingIds);
        
        // Set conversations in Redux
        dispatch(setConversations(conversations));
        
        // Check if session conversation exists, if not create new one
        const sessionConvId = sessionStorage.getItem("conversation_id");
        const isCreating = sessionStorage.getItem("creating_conversation");
        
        if (!sessionConvId && !isCreating) {
          try {
            // Set flag to prevent duplicate creation
            sessionStorage.setItem("creating_conversation", "true");
            
            console.log("🔄 No session conversation found, creating new one...");
            const newConversation = await createNewConversation(token);
            
            if (newConversation?.conversation_id || newConversation?.id) {
              const conversationId = newConversation.conversation_id || newConversation.id;
              const conversationName = newConversation.name || "New Chat";
              
              const conversationData = {
                id: conversationId,
                name: conversationName,
                created_at: new Date().toISOString(),
              };
              
              // Add to Redux
              dispatch(addConversation(conversationData));
              
              // Set as active and store in session
              dispatch(setActiveConversation(conversationId));
              sessionStorage.setItem("conversation_id", conversationId);
              sessionStorage.setItem("conversation_name", conversationName);
              
              console.log("✅ New conversation created and stored in session:", conversationId);
            }
          } catch (error) {
            console.error("❌ Failed to create new conversation:", error);
          } finally {
            // Remove the flag after creation attempt
            sessionStorage.removeItem("creating_conversation");
          }
        }
        
        // Simulate typing animation for each conversation
        conversations.forEach((conv, index) => {
          setTimeout(() => {
            setFetchingConversationId(prev => {
              if (prev instanceof Set) {
                const newSet = new Set(prev);
                newSet.delete(conv.id);
                return newSet.size > 0 ? newSet : null;
              }
              return prev === conv.id ? null : prev;
            });
          }, (index + 1) * 300); // Stagger the animations
        });
      })
      .catch((err) => console.error("Error fetching conversations:", err));
  }
}, [token, dispatch]);



  // useEffect(() => {
  //   const storedConversationId = localStorage.getItem("conversation_id");
  //   const storedConversationName = localStorage.getItem("conversation_name");

  //   // Update the state if the conversation name has changed in localStorage
  //   if (storedConversationId && storedConversationName) {
  //     dispatch(setActiveConversation(Number(storedConversationId)));
  //   }
  // }, [dispatch]);

   // Updated useEffect for fetching conversations with loading animation
  

  // useEffect(() => {
  //   console.log("👀 Conversations in Redux:", conversations);
  // }, [conversations]);

   // This runs once when the component mounts.

  // useEffect(() => {
  //   if (conversations.length) {
  //     // Check if conversations have been updated
  //     const updatedConversation = conversations.find(
  //       (conv) => conv.id === activeConversation
  //     );
  //     if (updatedConversation) {
  //       // If there's an active conversation, update its name from Redux
  //       localStorage.setItem("conversation_name", updatedConversation.name);
  //     }
  //   }
  // }, [conversations, activeConversation, dispatch]); // Run whenever conversations or activeConversation changes

  // Updated useEffect for localStorage with loading animation
  // Replace the existing useEffect for localStorage
// Replace the existing useEffect for localStorage
useEffect(() => {
  const storedConversationId = sessionStorage.getItem("conversation_id");
  const storedConversationName = sessionStorage.getItem("conversation_name");

  if (storedConversationId && storedConversationName) {
    // Show typing animation for the stored conversation
    setFetchingConversationId(Number(storedConversationId));
    
    // Simulate fetching delay with typing animation
    setTimeout(() => {
      dispatch(setActiveConversation(Number(storedConversationId)));
      setFetchingConversationId(null);
    }, 1200); // Show animation for 1.2 seconds
  }
}, [dispatch]);



  useEffect(() => {
    if (conversations.length) {
      const updatedConversation = conversations.find(
        (conv) => conv.id === activeConversation
      );
      if (updatedConversation) {
        sessionStorage.setItem("conversation_name", updatedConversation.name);
      }
    }
  }, [conversations, activeConversation, dispatch]);
 
 
  // const handleNewChat = async () => {
  //   try {
  //     const newChat = await createNewConversation(token); // API call to create conversation

  //     if (newChat?.conversation_id) {
  //       const newConversation = {
  //         id: newChat.conversation_id,
  //         name: newChat.name || "New Chat",
  //         created_at: new Date().toISOString(),
  //       };

  //       // ✅ Add to Redux immediately
  //       dispatch(addConversation(newConversation));

  //       // ✅ Set it as active
  //       dispatch(setActiveConversation(newConversation.id));

  //       // ✅ Optional: save to localStorage
  //       localStorage.setItem("conversation_id", newConversation.id);
  //     }
  //   } catch (error) {
  //     console.error("Error creating new chat:", error);
  //   }
  // };

  // rename conversations

//   const handleNewChat = async () => {
//   try {
//     const newChat = await createNewConversation(token); // API call to create conversation
//     console.log("🔍 API Response:", newChat); // Debug log

//     if (newChat?.conversation_id) {
//       const conversationData = {
//         id: newChat.conversation_id,
//         name: newChat.name || "New Chat",
//         created_at: new Date().toISOString(),
//       };

//       // Check if conversation already exists in Redux
//       const existsInRedux = conversations.some(conv => conv.id === newChat.conversation_id);

//       if (newChat.action === "created") {
//         // Always add new conversations
//         dispatch(addConversation(conversationData));
//         console.log("✅ Added new conversation to Redux:", conversationData);
//       } else if (newChat.action === "reused" && !existsInRedux) {
//         // Add reused conversation only if it's not already in Redux
//         dispatch(addConversation(conversationData));
//         console.log("🔄 Added reused conversation to Redux:", conversationData);
//       } else {
//         console.log("🔄 Reusing existing conversation from Redux:", newChat.conversation_id);
//       }

//       // ✅ Always set as active (whether new or reused)
//       dispatch(setActiveConversation(newChat.conversation_id));

//       // ✅ Optional: save to localStorage
//       sessionStorage.setItem("conversation_id", newChat.conversation_id);
//     }
//   } catch (error) {
//     console.error("Error creating new chat:", error);
//   }
// };
  const handleNewChat = async () => {
  const isCreating = sessionStorage.getItem("creating_conversation");
  
  if (isCreating) {
    console.log("⚠️ Conversation creation already in progress, skipping...");
    return;
  }
  
  try {
    sessionStorage.setItem("creating_conversation", "true");
    
    const newChat = await createNewConversation(token); // API call to create conversation
    console.log("🔍 API Response:", newChat); // Debug log

    if (newChat?.conversation_id || newChat?.id) {
      const conversationId = newChat.conversation_id || newChat.id;
      const conversationData = {
        id: conversationId,
        name: newChat.name || "New Chat",
        created_at: new Date().toISOString(),
      };

      // Check if conversation already exists in Redux
      const existsInRedux = conversations.some(conv => conv.id === conversationId);

      if (newChat.action === "created") {
        // Always add new conversations
        dispatch(addConversation(conversationData));
        console.log("✅ Added new conversation to Redux:", conversationData);
      } else if (newChat.action === "reused" && !existsInRedux) {
        // Add reused conversation only if it's not already in Redux
        dispatch(addConversation(conversationData));
        console.log("🔄 Added reused conversation to Redux:", conversationData);
      } else {
        console.log("🔄 Reusing existing conversation from Redux:", conversationId);
      }

      // ✅ Always set as active (whether new or reused)
      dispatch(setActiveConversation(conversationId));

      // ✅ Save to sessionStorage
      sessionStorage.setItem("conversation_id", conversationId);
      sessionStorage.setItem("conversation_name", newChat.name || "New Chat");
    }
  } catch (error) {
    console.error("Error creating new chat:", error);
  } finally {
    sessionStorage.removeItem("creating_conversation");
  }
};


  // const handleRename = async (id) => {
  //   if (
  //     !editText ||
  //     conversations.find((c) => c.id === id)?.name === editText
  //   ) {
  //     // No change, just close rename UI
  //     setEditingId(null);
  //     setDropdownId(null);
  //     return;
  //   }

  //   try {
  //     await renameConversation(id, editText, token);
  //     dispatch(renameConversationRedux({ id, newName: editText }));
  //   } catch (err) {
  //     console.error("Rename failed", err);
  //   } finally {
  //     setEditingId(null);
  //     setDropdownId(null);
  //   }
  // };
 
// Update the handleRename function
 // Update the handleRename function
const handleRename = async (id) => {
  if (
    !editText ||
    conversations.find((c) => c.id === id)?.name === editText
  ) {
    setEditingId(null);
    setDropdownId(null);
    return;
  }

  try {
    // Start the typing animation
    setRenamingId(id);
    setTempRenameText(editText);
    setEditingId(null);
    setDropdownId(null);

    // Call the API
    await renameConversation(id, editText, token);
    
    // Keep animation for a bit to show the effect
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Update Redux with the new name
    dispatch(renameConversationRedux({ id, newName: editText }));
    
    // Stop the typing animation
    setRenamingId(null);
    setTempRenameText("");
    
  } catch (err) {
    console.error("Rename failed", err);
    setRenamingId(null);
    setTempRenameText("");
    toast.error("Failed to rename conversation");
  }
};

  
 // Your existing useEffect for auto-save rename...
  useEffect(() => {
    if (
      editingId !== null &&
      prevActiveConvRef.current &&
      prevActiveConvRef.current !== activeConversation &&
      editingId !== activeConversation
    ) {
      handleRename(editingId);
    }
  
    prevActiveConvRef.current = activeConversation;
  }, [activeConversation, editingId]);

   
  // const handleDeleteConversation = async (id) => {
  //   try {
  //     await deleteConversation(id, token); // Soft delete backend
  //     dispatch(removeConversationFromRedux(id)); // Remove from Redux
  //     toast.success("🗑️ deleted successfully!");
  //     if (activeConversation === id) {
  //       const remaining = conversations.filter((conv) => conv.id !== id);
  
  //       if (remaining.length > 0) {
  //         const nextConv = remaining[0];
  //         const messages = await fetchConversationHistory(nextConv.id, token);
  //         dispatch(setMessages({ conversationId: nextConv.id, messages }));
  //         dispatch(setActiveConversation(nextConv.id));
  //         navigate(`/chat/${nextConv.id}`);
  //       } else {
  //         const newConv = await createNewConversation(token);
  //         dispatch(addConversation(newConv));
  //         dispatch(setMessages({ conversationId: newConv.id, messages: [] }));
  //         dispatch(setActiveConversation(newConv.id));
  //         navigate(`/chat/${newConv.id}`);
  //       }
  //     }
  //   } catch (error) {
  //     console.error("❌ Error deleting conversation:", error);
  //   }
  // };
  
  
const handleDeleteConversation = async (id) => {
  try {
    const deleteResponse = await deleteConversation(id, token);
    
    // Handle different backend responses
    if (deleteResponse.action === "deleted") {
      // Normal deletion - conversation deleted, others remain
      dispatch(removeConversationFromRedux(id));
      toast.success("🗑️ Chat deleted successfully!");
      
      if (activeConversation === id) {
        const remaining = conversations.filter((conv) => conv.id !== id);
        if (remaining.length > 0) {
          const nextConv = remaining[0];
          const messages = await fetchConversationHistory(nextConv.id, token);
          dispatch(setMessages({ conversationId: nextConv.id, messages }));
          dispatch(setActiveConversation(nextConv.id));
          navigate(`/chat/${nextConv.id}`);
        }
      }
    } else if (deleteResponse.action === "deleted_and_created_new" || deleteResponse.action === "deleted_and_selected_existing") {
      // Backend created/selected a new conversation for us
      dispatch(removeConversationFromRedux(id));
      
      const newConversation = {
        id: deleteResponse.conversation_id,
        name: deleteResponse.name,
        created_at: new Date().toISOString()
      };
      
      // Add the new conversation to Redux
      dispatch(addConversation(newConversation));
      
      // Set empty messages for the new conversation
      dispatch(setMessages({ conversationId: newConversation.id, messages: [] }));
      
      // Set as active conversation
      dispatch(setActiveConversation(newConversation.id));
      
      // Navigate to the new conversation
      navigate(`/chat/${newConversation.id}`);
      
      // Update localStorage
      sessionStorage.setItem("conversation_id", newConversation.id);
      sessionStorage.setItem("conversation_name", newConversation.name);
      
      toast.success("🗑️ Conversation cleared! Fresh workspace ready.");
      console.log(`✅ Auto-selected new conversation: ${newConversation.id}`);
    } else if (deleteResponse.action === "kept_as_workspace") {
      // Conversation kept as workspace - it's a feature!
      toast.info("💡 This is your active workspace! Ready for new conversations.", {
        duration: 4000,
        icon: "🚀"
      });
      
      // Ensure this conversation stays selected
      if (activeConversation !== id) {
        dispatch(setActiveConversation(parseInt(id)));
        navigate(`/chat/${id}`);
      }
      
      console.log(`💡 Conversation ${id} kept as workspace`);
    }

  } catch (error) {
    console.error("❌ Error deleting conversation:", error);
    toast.error("Failed to delete conversation");
  }
};



  const handleSelectConversation = async (conv_id) => {
    console.log("📌 Selected Conversation ID:", conv_id);

    dispatch(setActiveConversation(conv_id));
    sessionStorage.setItem("conversation_id", conv_id);

    const selectedConversation = conversations.find(
      (conv) => conv.id === conv_id
    );

    if (selectedConversation) {
      sessionStorage.setItem("conversation_name", selectedConversation.name);
    }
    // ✅ Close sidebar on mobile when conversation is selected
  if (window.innerWidth <= 768) {
    setIsOpen(false);
  }
  };

  const groupedConversations = groupConversationsByDate(conversations);

  // Theme change
  const toggleTheme = () => {
    setDarkMode((prev) => {
      localStorage.setItem("darkMode", !prev);
      return !prev;
    });
  };
  

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside any dropdown
      if (dropdownId !== null) {
        const dropdownElement = document.querySelector(`[data-dropdown-id="${dropdownId}"]`);
        if (dropdownElement && !dropdownElement.contains(event.target)) {
          setDropdownId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownId]);

const [dropdownPosition, setDropdownPosition] = useState({});

// Add this function to calculate dropdown position:
const calculateDropdownPosition = (convId) => {
  const conversationElement = document.querySelector(`[data-conversation-id="${convId}"]`);
  const scrollContainer = document.querySelector('.conversation-scroll-container');
  
  if (conversationElement && scrollContainer) {
    const containerRect = scrollContainer.getBoundingClientRect();
    const elementRect = conversationElement.getBoundingClientRect();
    
    // Calculate available space below and above
    const spaceBelow = containerRect.bottom - elementRect.bottom;
    const spaceAbove = elementRect.top - containerRect.top;
    
    // Dropdown approximate height is 80px
    const dropdownHeight = 80;
    
    // Position dropdown based on available space with minimal spacing
    if (spaceBelow >= dropdownHeight) {
      return { position: 'below', class: 'top-full mt-1' }; // Changed from 'top-8 mt-2' to 'top-full mt-1'
    } else if (spaceAbove >= dropdownHeight) {
      return { position: 'above', class: 'bottom-full mb-1' }; // Changed from 'bottom-8 mb-2' to 'bottom-full mb-1'
    } else {
      // If neither has enough space, position below and scroll
      return { position: 'below-scroll', class: 'top-full mt-1' }; // Changed from 'top-8 mt-2' to 'top-full mt-1'
    }
  }
  
  return { position: 'below', class: 'top-full mt-1' }; // Changed default positioning
};

 const handleDropdownOpen = (convId) => {
  const wasOpen = dropdownId === convId;
  
  if (!wasOpen) {
    // Calculate position before opening
    const position = calculateDropdownPosition(convId);
    setDropdownPosition(prev => ({ ...prev, [convId]: position }));
    
    // If we need to scroll, do it before opening
    if (position.position === 'below-scroll') {
      const conversationElement = document.querySelector(`[data-conversation-id="${convId}"]`);
      if (conversationElement) {
        conversationElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }
    }
  }
  
  setDropdownId(wasOpen ? null : convId);
};

 return (
  <div className="flex min-h-screen">
    {/* Sidebar starts */}
    <div
      data-sidebar
      className={`fixed md:relative z-50 h-full md:h-screen
        ${isOpen ? "translate-x-0 w-72" : "-translate-x-full w-72"} md:translate-x-0
        ${isCollapsed ? "md:w-20" : "md:w-72"}
        bg-white dark:bg-[#1a1a1a] 
        border-r border-slate-200 dark:border-slate-700
        flex flex-col transition-all  duration-500 ease-out overflow-hidden
        shadow-xl md:shadow-lg`}>

      {/* Mobile Close Button */}
      {isOpen && (
        <button
          className="md:hidden absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-800 text-white hover:bg-slate-700 transition-all duration-200 shadow-lg"
          onClick={() => setIsOpen(false)}>
          <X size={18} />
        </button>
      )}

     {/* Header Section */}
<div className={`flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 ${
  isCollapsed ? "justify-center" : ""
}`}>
  <div className={`flex items-center gap-3 transition-all  duration-500 ${
    isCollapsed ? "opacity-0 scale-0 w-0" : "opacity-100 scale-100"
  }`}>
    <div className="w-8 h-8 rounded-lg flex items-center justify-center">
      <img src="./logo.png" className="w-5 h-5 block dark:hidden" alt="Logo" />
      <img src="./q.png" className="w-5 h-5 hidden dark:block" alt="Logo" />
    </div>
    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
      Quantumhash
    </span>
  </div>

  {/* Collapse Button - Always visible and centered when collapsed */}
  <button
    className={`hidden md:flex p-2 rounded-lg border border-gray-500 text-black dark:text-white hover:dark:bg-slate-600 hover:bg-slate-400    transition-all duration-200 shadow-sm relative ${
      isCollapsed ? "mx-auto" : ""
    }`}
    onClick={() => setIsCollapsed(!isCollapsed)}
    onMouseEnter={() => setShowTooltip(true)}
    onMouseLeave={() => setShowTooltip(false)}
    ref={buttonRef}>
    <PanelRightOpen 
      size={20} 
      className={`transition-transform  duration-500 ${
        isCollapsed ? "rotate-180" : "rotate-0"
      }`} 
    />
    {showTooltip && (
              <div
                className={`absolute z-40 ${
                  isCollapsed
                    ? "top-9 left-9 transform -translate-x-3/4"
                    : "top-9 left-1/2 transform -translate-x-2/3"
                } mt-1 px-2 py-1 text-xs text-white bg-zinc-900 rounded transition-all  duration-500 ease-in-out`}>
                {isCollapsed ? "Open Sidebar" : "Close Sidebar"}
              </div>
            )}
  </button>
</div>

{/* New Chat Button */}
<div className="p-4">
  <button 
    onClick={handleNewChat}
    className={`w-full h-12 flex items-center p-3 rounded-xl
     bg-gradient-to-r from-[#0000B5] to-[#0076FF]
            hover:from-[#0076FF] hover:to-[#0000B5] text-white font-medium shadow-md hover:shadow-lg
      transition-all  duration-500 transform hover:scale-[1.02]
      ${isCollapsed ? "justify-center" : "justify-start gap-3"}`}>
    <Plus size={18} className="flex-shrink-0" />
    <span className={`transition-all  duration-500 ${
      isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto ml-3"
    }`}>
      New Chat
    </span>
  </button>
</div>


      {/* Chat History */}
      <div className={`flex-1 flex flex-col min-h-0 px-4 pb-24 transition-all  duration-500 ${
        isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}>
        <div className="flex items-center gap-2 mb-4">
          <History size={16} className="text-slate-500 dark:text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            Recent Chats
          </h2>
        </div>
        
        {/* Scrollable conversation list */}
        <div className="conversation-scroll-container flex-1 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
          {Object.entries(groupedConversations).map(
            ([section, convs]) =>
              convs.length > 0 && (
                <div key={section} className="mb-6">
                  <h3 className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2 px-2">
                    {section === "today" ? "Today" : section === "yesterday" ? "Yesterday" : "Previous"}
                  </h3>
                  
                  {convs.map((conv) => (
                    <div
                      key={conv.id}
                      data-conversation-id={conv.id}
                      className={`group relative p-3 rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-between
                        ${activeConversation === conv.id
                          ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 shadow-sm"
                          : "hover:bg-slate-100 dark:hover:bg-slate-700/50"
                        }`}>
                      
                      <div
                        onClick={() => handleSelectConversation(conv.id)}
                        className="flex-1 min-w-0 flex items-center gap-3">
                        
                        {/* Chat Icon */}
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          activeConversation === conv.id 
                            ? "bg-blue-500" 
                            : "bg-slate-300 dark:bg-slate-600"
                        }`} />

                        {/* Chat Content */}
                        <div className="flex-1 min-w-0">
                          {renamingId === conv.id ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-slate-600 dark:text-slate-300 animate-pulse">
                                {tempRenameText}
                              </span>
                              <div className="flex gap-1">
                                <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" />
                                <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                                <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                              </div>
                            </div>
                          ) : fetchingConversationId === conv.id ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-slate-600 dark:text-slate-300 animate-pulse">
                                {conv.name || "New Chat"}
                              </span>
                              <div className="flex gap-1">
                                <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" />
                                <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                                <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                              </div>
                            </div>
                          ) : editingId === conv.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editText}
                                autoFocus
                                onChange={(e) => setEditText(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                onBlur={() => handleRename(conv.id)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleRename(conv.id);
                                  if (e.key === "Escape") {
                                    setEditText("");
                                    setEditingId(null);
                                  }
                                }}
                                className="bg-transparent border-b border-blue-300 dark:border-blue-600 outline-none text-sm text-slate-700 dark:text-slate-200 w-full"
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRename(conv.id);
                                }}
                                className="text-green-500 hover:text-green-600 transition-colors">
                                <CheckCircle size={14} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate block">
                              {conv.name || "New Chat"}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Dropdown Menu */}
                      {renamingId !== conv.id && fetchingConversationId !== conv.id && (
                        <div className="relative" data-dropdown-id={conv.id}>
                          <button
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDropdownOpen(conv.id);
                            }}>
                            <MoreVertical size={14} className="text-slate-500 dark:text-slate-400" />
                          </button>

                          {dropdownId === conv.id && (
                            <div className={`absolute right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-xl z-50 min-w-[140px] ${
                              dropdownPosition[conv.id]?.class || 'top-full mt-1'
                            }`}>
                              <button
                                className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 rounded-t-lg transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingId(conv.id);
                                  setEditText(conv.name || "New Chat");
                                  setDropdownId(null);
                                }}>
                                <Pen size={14} />
                                Rename
                              </button>
                              <button
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 rounded-b-lg transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteConversation(conv.id);
                                  setDropdownId(null);
                                }}>
                                <Trash size={14} />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
          )}

          {conversations.length === 0 && (
            <div className="space-y-3 animate-pulse">
              {[...Array(4)].map((_, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3">
                  <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                  <div className="flex-1 h-4 bg-slate-300 dark:bg-slate-600 rounded-md"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

   {/* Footer Buttons */}
<div className={`absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-[#1a1a1a] border-t border-slate-200 dark:border-slate-700 space-y-3 transition-all  duration-500`}>
  {/* Theme Toggle */}
  <button
    onClick={toggleTheme}
    className={`w-full h-12 flex items-center p-3 rounded-xl
      bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800
      hover:bg-slate-700 dark:hover:bg-slate-300
      transition-all  duration-500 shadow-md hover:shadow-lg
      ${isCollapsed ? "justify-center" : "justify-start gap-3"}`}>
    
    <div className="relative w-5 h-5 flex-shrink-0">
      <Sun size={18} className={`absolute transition-all  duration-500 ${
        darkMode ? "opacity-0 rotate-180" : "opacity-100 rotate-0"
      }`} />
      <Moon size={18} className={`absolute transition-all  duration-500 ${
        darkMode ? "opacity-100 rotate-0" : "opacity-0 -rotate-180"
      }`} />
    </div>

    <span className={`font-medium transition-all  duration-500 ${
      isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto ml-3"
    }`}>
      {darkMode ? "Light Mode" : "Dark Mode"}
    </span>
  </button>

  {/* About Us */}
  <Link to="/about"
    className={`w-full h-12 flex items-center p-3 rounded-xl
      bg-gradient-to-r from-[#0000B5] to-[#0076FF]
            hover:from-[#0076FF] hover:to-[#0000B5] text-white shadow-md hover:shadow-lg
      transition-all  duration-500 transform hover:scale-[1.02]
      ${isCollapsed ? "justify-center" : "justify-start gap-3"}`}>
    <BadgeHelp size={18} className="flex-shrink-0" />
    <span className={`font-medium transition-all  duration-500 ${
      isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto ml-3"
    }`}>
      About Us
    </span>
  </Link>
</div>

    </div>
  </div>
);


};

export default Sidebar;

