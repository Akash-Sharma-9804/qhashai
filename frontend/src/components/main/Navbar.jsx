import React, { useState, useEffect, useRef } from "react";
import { User, ChevronDown, LogOut } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/authSlice";
import { clearChatData } from "../../store/chatSlice2";
import { useNavigate } from "react-router-dom";
import { Sun, Moon, CircleHelp, Menu, X, LogIn } from "lucide-react";
import { createPortal } from 'react-dom';

const Navbar = ({ setSidebarOpen, isGuest }) => {
  const [active, setActive] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fetch user data from Redux store
  const user = useSelector((state) => state.auth.user); // Assuming user is stored in state.auth.user
  // console.log("User Image URL:", user?.user_img); // Debug line
  // console.log("user", user);
  const handleLogout = () => {
    
    dispatch(logout()); // Clears user data from auth slice
    dispatch(clearChatData()); // Clears chat data from chat slice
    dispatch({ type: "RESET" }); // Reset the entire Redux store to initial state
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("conversation_id");

    localStorage.clear(); // Clear localStorage
    navigate("/login"); // Redirect to login page
  };

   
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActive(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true"; // default to false if not found
  });
  
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

  const handleMobileMenuToggle = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const handleAboutClick = () => {
    navigate("/about");
    setShowMobileMenu(false);
  };

  const handleLoginClick = () => {
    navigate("/login");
    setShowMobileMenu(false);
  };

  return (
<div className="fixed top-0 left-0 w-full pt-2 px-4 pb-2 z-30 navbar-transparent" style={{ width: 'calc(100% - 12px)' }}>
  <div className={`flex items-center gap-7 navbar-interactive ${!isGuest ? 'justify-between ' : 'sm:justify-between justify-around'}`}>

        {/* Logo */}
        <div className="relative ml-16 justify-center items-center cursor-pointer   backdrop-blur-sm rounded-lg px-2 py-1">
          <span className="text-2xl mt-2  flex items-center cursor-pointer sm:text-center font-bold text-black dark:text-white">
            <img
              src="./logo.png"
              className="w-12 h-12 hidden md:block dark:hidden"
              alt="Logo"
            />
            <img
              src="./q.png"
              className="w-12 h-12 hidden md:dark:block"
              alt="Logo"
            />
            {isGuest && (
              <>
                <img
                  src="./logoName.png"
                  className="w-fit h-6 md:hidden dark:hidden"
                  alt="Logo"
                />
                <img
                  src="./dark_logo.png"
                  className="w-fit h-7 md:dark:hidden hidden dark:block md:hidden"
                  alt="Logo"
                />
              </>
            )}
            
          </span>
        </div>

        <div className="flex gap-4 items-center text-black dark:text-white sm:mr-6    rounded-lg px-3 py-2">
          {isGuest ? (
            <>
              {/* Desktop Login Button */}
              <div className="hidden md:flex gap-2 ">
                <button
                  onClick={() => navigate("/login")}
                  className="font-sans bg-gradient-to-r from-[#0000B5] to-[#0076FF] hover:bg-gradient-to-r hover:from-[#0076FF] hover:to-[#0000B5]   text-white font-bold   dark:border-slate-400 text-xs md:text-sm px-4 py-2 rounded-3xl hover:bg-blue-700 transition">
                  Log in
                </button>
              </div>

              {/* Desktop Theme Toggle and About Us */}
              <div className="hidden md:flex gap-2 items-center">
                <button
                  onClick={toggleTheme}
                  className={`relative overflow-hidden p-2 flex items-center gap-4 
                       bg-[#282828] dark:bg-slate-200 text-white dark:text-black 
                       hover:bg-slate-200 hover:text-black border border-black dark:border-white 
                       rounded-lg cursor-pointer transition-all duration-300`}>
                  {/* Animated Icon Swap */}
                  <div className="relative w-5 h-5">
                    <div
                      className={`absolute inset-0 transition-transform duration-500 ${
                        darkMode
                          ? "translate-x-0 opacity-100"
                          : "-translate-x-full opacity-0"
                      }`}>
                      <Sun size={18} />
                    </div>
                    <div
                      className={`absolute inset-0 transition-transform duration-500 ${
                        darkMode
                          ? "translate-x-full opacity-0"
                          : "translate-x-0 opacity-100"
                      }`}>
                      <Moon size={18} />
                    </div>
                  </div>
                </button>

                <div className="relative">
                  <span
                    onClick={() => navigate("/about")}
                    onMouseEnter={() => setShowAbout(true)}
                    onMouseLeave={() => setShowAbout(false)}
                    className="cursor-pointer">
                    <CircleHelp />
                  </span>

                  {showAbout && (
                    <div className="absolute z-20 top-full left-1/2 transform -translate-x-1/2 mt-[6px] px-2 py-1 text-xs text-white bg-zinc-900 rounded-lg shadow-md flex items-center justify-center whitespace-nowrap">
                      {/* Arrow pointing upward, at the top of the tooltip */}
                      <div
                        className="absolute -top-[6px] left-1/2 transform -translate-x-1/2 w-0 h-0 
                                   border-l-[6px] border-l-transparent 
                                   border-r-[6px] border-r-transparent 
                                   border-b-[6px] border-b-zinc-900"
                      />
                      About us
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden relative" ref={mobileMenuRef}>
                <button
                  onClick={handleMobileMenuToggle}
                  className="p-2 border border-black dark:border-white rounded-lg hover:bg-gray-100 dark:hover:bg-[#121212]  transition-colors">
                  {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
                </button>

              {/* Mobile Menu Dropdown */}
{showMobileMenu && createPortal(
  <>
    <div 
      className="fixed inset-0 z-[99998]" 
      onClick={() => setShowMobileMenu(false)}
    />
    <div className="fixed z-[99999] top-16 right-4 bg-white dark:bg-[#121212] backdrop-blur-sm border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4 min-w-[200px]">
      <div className="flex flex-col gap-4">
        {/* Login Button */}
        <div className="flex items-center justify-between">
          <span className="text-sm dark:text-white font-medium">Login</span>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowMobileMenu(false);
              navigate("/login");
            }}
            className="bg-gradient-to-r from-[#0000B5] to-[#0076FF] hover:bg-gradient-to-r hover:from-[#0076FF] hover:to-[#0000B5] text-white p-2 rounded-lg transition-all duration-300">
            <LogIn size={18} />
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-300 dark:border-gray-600"></div>

        {/* Theme Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm dark:text-white font-medium">Theme</span>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDarkMode((prev) => {
                localStorage.setItem("darkMode", !prev);
                return !prev;
              });
              setShowMobileMenu(false);
            }}
            className={`relative overflow-hidden p-2 flex items-center gap-4 
                 bg-[#282828] dark:bg-slate-200 text-white dark:text-black 
                 hover:bg-slate-200 hover:text-black border border-black dark:border-white 
                 rounded-lg cursor-pointer transition-all duration-300`}>
            <div className="relative w-5 h-5">
              <div
                className={`absolute inset-0 transition-transform duration-500 ${
                  darkMode
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-full opacity-0"
                }`}>
                <Sun size={18} />
              </div>
              <div
                className={`absolute inset-0 transition-transform duration-500 ${
                  darkMode
                    ? "translate-x-full opacity-0"
                    : "translate-x-0 opacity-100"
                }`}>
                <Moon size={18} />
              </div>
            </div>
          </button>
        </div>

        {/* About Us */}
        <div className="flex items-center justify-between">
          <span className="text-sm dark:text-white font-medium">About Us</span>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowMobileMenu(false);
              navigate("/about");
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white rounded-lg transition-colors">
            <CircleHelp size={20} />
          </button>
        </div>
      </div>
    </div>
  </>,
  document.body
)}


              </div>
            </>
          ) : (
            <>
              <div
                ref={dropdownRef}
                className="relative  z-50 cursor-pointer text-black dark:text-white border-black dark:border-white rounded-full p-2"
                onClick={() => setActive(!active)}>
                <img
                  src={user?.user_img ? user.user_img : (darkMode ? "./user_light.png" : "./user.png")}
                  className="h-9 w-9 rounded-full object-cover border-2 border-black dark:border-white"
                  alt="User Avatar"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = darkMode ? "./user_light.png" : "./user.png";
                  }}
                />
        {active && createPortal(
  <>
    <div 
      className="fixed inset-0 z-[99998]" 
      onClick={() => setActive(false)}
    />
    <div className="fixed z-[99999] top-16 right-4 rounded-lg w-48 bg-slate-500 flex items-center justify-center transition-opacity duration-300 shadow-2xl">
      <div className="flex flex-col justify-center py-5 gap-2 items-center">
        <img
          src={user?.user_img ? user.user_img : (darkMode ? "./user_light.png" : "./user.png")}
          className="h-12 w-12 rounded-full object-cover"
          alt="User Avatar"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = darkMode ? "./user_light.png" : "./user.png";
          }}
        />

        {/* Username */}
        <span className="text-sm darkMode dark:text-white font-semibold text-black">
          {user?.username || "Guest"}
        </span>

        {/* Email */}
        <span className="text-xs darkMode dark:text-white font-semibold text-black">
          {user?.email || "guest@example.com"}
        </span>

        {/* Logout Button */}
        <div
          className="text-base flex items-center gap-2 cursor-pointer hover:bg-slate-600 px-3 py-1 rounded transition-colors"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("Logout clicked"); // Debug log
            setActive(false);
            handleLogout();
          }}
        >
          <LogOut size={16} />
          Logout
        </div>
      </div>
    </div>
  </>,
  document.body
)}


              </div>
            </>
          )}
        </div>
      </div>
      <style>
        {
          `.navbar-transparent {
  pointer-events: none !important;
}

.navbar-interactive {
  pointer-events: auto !important;
}`
        }
      </style>
    </div>
    
  );
};

export default Navbar;
