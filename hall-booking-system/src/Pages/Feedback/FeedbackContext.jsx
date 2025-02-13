import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Corrected import

const FeedbackContext = createContext();

export const useFeedback = () => {
  return useContext(FeedbackContext);
};

export const FeedbackProvider = ({ children }) => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);

  // Fetch token from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    setToken(savedToken);

    // If there's no token, the user is not logged in
    if (!savedToken) {
      setIsLoggedIn(false);
      return;
    }

    // If token exists, check its validity
    try {
      const decodedToken = jwtDecode(savedToken);  // Correctly using jwtDecode
      const currentTime = Date.now() / 1000; // Get current time in seconds

      if (decodedToken.exp < currentTime) {
        // Token is expired
        setIsLoggedIn(false);
        localStorage.removeItem('token'); // Clear expired token
        alert('Your session has expired. Please log in again.');
      } else {
        // Token is valid
        setIsLoggedIn(true);
      }
    } catch (error) {
      setIsLoggedIn(false);
      localStorage.removeItem('token'); // Remove invalid token
      alert('Invalid token. Please log in again.');
    }
  }, []);

  // Fetch feedback from the backend API
  useEffect(() => {
    const fetchFeedback = async () => {
      if (!isLoggedIn) return; // Don't fetch feedback if not logged in

      try {
        const response = await fetch('http://localhost:5000/feedback', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok) {
          if (Array.isArray(data)) {
            setFeedbackList(data.filter(item => item.user_id)); // Filter out invalid feedback without user_id
          } else {
            console.error('Received non-array data:', data);
          }
        } else {
          alert(data.error || 'Failed to fetch feedback.');
        }
      } catch (error) {
        console.error('Error fetching feedback:', error);
      }
    };

    fetchFeedback();
  }, [isLoggedIn, token]); // Only fetch feedback if the user is logged in

  // Function to submit feedback
  const addFeedback = async (newFeedback) => {
    if (!isLoggedIn) {
      alert('You need to log in to submit feedback.');
      return;
    }

    try {
      const feedbackIds = new Set(feedbackList.map(item => item.id));
      if (feedbackIds.has(newFeedback.id)) {
        alert('This feedback has already been submitted.');
        return;
      }

      const response = await fetch('http://localhost:5000/feedback/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ feedback: newFeedback.feedback }),
      });

      const data = await response.json();
      if (response.ok) {
        setFeedbackList(prev => [data.feedback, ...prev]); // Add the new feedback to the state
      } else {
        alert(data.error || 'Failed to submit feedback.');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  return (
    <FeedbackContext.Provider value={{ feedbackList, addFeedback, isLoggedIn }}>
      {children}
    </FeedbackContext.Provider>
  );
};
