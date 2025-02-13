import React, { useState } from 'react';
import './Sidebar.css';
import { FaHome, FaCalendarAlt, FaInfoCircle, FaUser, FaComments, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import bitLogo from "../../assets/college-logo bg.png";
import { jwtDecode } from "jwt-decode";

const getAuthenticatedUser = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    console.log("Decoded token:", decoded);  // Log the decoded token to check the role
    return { email: decoded.email, role: decoded.role };
  } catch (err) {
    console.error("Failed to decode token", err);
    return null;
  }
};

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const authenticatedUser = getAuthenticatedUser();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div>
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isOpen ? "×" : "☰"}
      </button>

      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <img src={bitLogo} alt="BIT Logo" className="sidebar-logo" />
          <span className="sidebar-bit-text">BIT</span>
        </div>

        <ul className="main-links">
          <li onClick={() => handleNavigation("/home")}><FaHome /> Home</li>
          <li onClick={() => handleNavigation("/hall-booking")}><FaCalendarAlt /> Hall-Booking</li>
          <li onClick={() => handleNavigation("/hall-availability")}><FaInfoCircle /> Hall-Available</li>
        </ul>

        <ul className="bottom-links">
          {authenticatedUser?.role === "admin" && (
            <>
              <li onClick={() => handleNavigation("/admin")}><FaUser /> Admin</li>
              <li onClick={() => handleNavigation("/feedback")}><FaComments /> Feedback</li>
            </>
          )}
          <li onClick={() => { localStorage.clear(); handleNavigation("/login"); }}><FaSignOutAlt /> Logout</li>
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;
