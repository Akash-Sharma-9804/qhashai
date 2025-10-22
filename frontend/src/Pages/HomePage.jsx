import React from "react";
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";

import ChatArea from "../components/main/ChatArea";

import Sidebar from "../components/main/Sidebar";

const HomePage = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  // ✅ Check if user is authenticated
  const user = useSelector((state) => state.auth.user);

  // ✅ Determine guest mode
  const isGuest = !user;

  return (
    <div className=" font-poppins  h-screen overflow-hidden   text-white   ">
      <div className="flex h-screen overflow-auto">
       {!isGuest && (
  <Sidebar
    isGuest={isGuest}
    isCollapsed={!isSidebarOpen}
    setSidebarOpen={setSidebarOpen}
     isOpen={isSidebarOpen}  // ✅ ADD: Pass isOpen state
            setIsOpen={setSidebarOpen}  // ✅ ADD: Pass setIsOpen function
  />
)}


        <ChatArea
          isGuest={isGuest}
          isCollapsed={!isSidebarOpen}
          setSidebarOpen={setSidebarOpen}
            sidebarOpen={isSidebarOpen}  // ✅ ADD: Pass sidebar state
        />
      </div>
    </div>
  );
};

export default HomePage;
