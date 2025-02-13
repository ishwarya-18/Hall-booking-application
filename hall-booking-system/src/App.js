import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginSignup from './Pages/Login/Login';
import Home from './Pages/Home/Home';
import Admin from './Pages/Admin/Admin';
import FeedbackPage from './Pages/Feedback/FeedbackPage'; // Page for displaying feedback
import HallBooking from './Pages/hallBooking/hallBooking';
import HallAvailability from './Pages/hallAvailability/hallAvailability';
import { FeedbackProvider } from './Pages/Feedback/FeedbackContext'; // Import FeedbackProvider
import './App.css';

function App() {
  return (
    <FeedbackProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LoginSignup />} />
            <Route path="/home" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/hall-booking" element={<HallBooking />} />
            <Route path="/hall-availability" element={<HallAvailability />} />
            <Route path="/login" element={<LoginSignup />} />
          </Routes>
        </div>
      </Router>
    </FeedbackProvider>
  );
}

export default App;
