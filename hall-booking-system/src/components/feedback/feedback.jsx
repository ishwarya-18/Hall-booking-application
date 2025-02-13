import React, { useState } from 'react';
import './feedback.css';
import { useFeedback } from '../../Pages/Feedback/FeedbackContext'; // Import useFeedback hook

const Feedback = () => {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const { addFeedback } = useFeedback(); // Access the addFeedback function from context

  const handleFeedbackOpen = () => {
    setIsFeedbackOpen(true);
  };

  const handleFeedbackClose = () => {
    setIsFeedbackOpen(false);
    setFeedback('');
  };

  const handleFeedbackSubmit = async () => {
    if (feedback.trim()) {
      const newFeedback = {
        feedback,
      };

      try {
        const token = localStorage.getItem('token'); // Get token from localStorage

        if (!token) {
          alert("No token provided. Please log in again.");
          return;
        }

        const response = await fetch('http://localhost:5000/feedback/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Send token as Bearer token in the header
          },
          body: JSON.stringify(newFeedback),
        });

        const data = await response.json();

        if (response.ok) {
          alert('Thank you for your feedback!');
          addFeedback(newFeedback); // Add the new feedback to the list via context
          handleFeedbackClose();
        } else {
          alert(data.error || 'Failed to submit feedback.');
        }
      } catch (error) {
        console.error('Error submitting feedback:', error);
        alert('An error occurred while submitting feedback.');
      }
    } else {
      alert('Please enter feedback before submitting.');
    }
  };

  return (
    <div className="feed-container">
      <button onClick={handleFeedbackOpen} className="enhanced-feedback-button">
        ✍️ Give Feedback
      </button>
      {isFeedbackOpen && (
        <div className="enhanced-feedback-modal">
          <div className="enhanced-feedback-modal-content">
            <h2 className="modal-title">We'd Love Your Feedback! 📝</h2>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Enter your feedback..."
              className="enhanced-feedback-input"
            />
            <div className="modal-buttons">
              <button onClick={handleFeedbackSubmit} className="enhanced-submit-button">
                ✅ Send Feedback
              </button>
              <button onClick={handleFeedbackClose} className="enhanced-cancel-button">
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedback;
