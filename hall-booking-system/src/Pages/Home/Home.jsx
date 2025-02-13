import React from "react";
import "./Home.css";
import logo from "../../assets/home logo.png";
import Sidebar from "../../components/Sidebar/Sidebar"; // Import Sidebar component
import Feedback from "../../components/feedback/feedback"; // Import Sidebar component

const Home = () => {
  return (
    <div className="home-container">
      <Sidebar/>
      <div className="logo-section">
        <img
          src={logo}
          alt="BIT Logo"
          className="bit-logo"
        />
      </div>
      <Feedback/>
    </div>
  );
};

export default Home; 