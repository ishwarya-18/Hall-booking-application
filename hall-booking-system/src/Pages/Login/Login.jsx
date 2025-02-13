import React, { useState } from "react";
import { FaUser, FaLock, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [phoneError, setPhoneError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setErrorMessage("");
  };

  const validatePhone = (e) => {
    const phoneInput = e.target.value;
    if (phoneInput.length !== 10 || !/^\d{10}$/.test(phoneInput)) {
      setPhoneError("Phone number must be exactly 10 digits.");
    } else {
      setPhoneError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const name = !isLogin ? document.getElementById("name").value : null;
    const phone = !isLogin ? document.getElementById("phone").value : null;

    if (!isLogin && phoneError) {
      alert("Please fix the phone number error before submitting.");
      return;
    }

    try {
      if (isLogin) {
        // Login API call
        const response = await axios.post("http://localhost:5000/auth/login", {
          email,
          password,
        });
        // Save token and redirect
        localStorage.setItem("token", response.data.token);
        navigate("/home");
      } else {
        // Signup API call
        const response = await axios.post("http://localhost:5000/auth/signup", {
          name,
          email,
          phone,
          password,
        });
        setIsLogin(true); // Switch to login view
      }
    } catch (error) {
      // Handle errors
      setErrorMessage(
        error.response?.data?.error || "An error occurred. Please try again."
      );
    }
  };

  return (
    <div className="login-signup-container">
      <div className="form-box">
        <h2 className="form-header">
          {isLogin ? "Login to Manage Your Reservations" : "Join Us! Create Your Account"}
        </h2>

        {errorMessage && <p className="error-text">{errorMessage}</p>}

        <form className="form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name">
                <FaUser className="icon" /> Full Name
              </label>
              <input type="text" id="name" placeholder="Enter your full name" required />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">
              <FaEnvelope className="icon" /> Email ID
            </label>
            <input type="email" id="email" placeholder="Enter your email ID" required />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <FaLock className="icon" /> Password
            </label>
            <input type="password" id="password" placeholder="Enter your password" required />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="phone">
                <FaPhoneAlt className="icon" /> Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                placeholder="Enter your phone number"
                onChange={validatePhone}
                required
              />
              {phoneError && <p className="error-text">{phoneError}</p>}
            </div>
          )}

          <button type="submit" className="submit-btn">
            {isLogin ? "Login" : "Sign Up"}
          </button>

          <p className="toggle-link">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span onClick={handleToggle} className="toggle-action">
              {isLogin ? "Sign Up" : "Login"}
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginSignup;
