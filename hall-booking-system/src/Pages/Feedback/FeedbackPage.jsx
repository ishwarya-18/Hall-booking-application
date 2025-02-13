import React, { useEffect } from "react";
import { useFeedback } from "./FeedbackContext"; // Assuming useFeedback is a custom hook for state management
import Sidebar from "../../components/Sidebar/Sidebar";
import "./Feedback.css";

const FeedbackPage = () => {
  const { feedbackList, setFeedbackList } = useFeedback(); // Access feedback list and setter function
  useEffect(() => {
    const createWebSocket = () => {
      const ws = new WebSocket("ws://localhost:5000");
  
      ws.onopen = () => {
        console.log("WebSocket connection established");
      };
  
      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setTimeout(createWebSocket, 5000); // Try to reconnect after a delay
      };
  
      ws.onmessage = (event) => {
        try {
          if (ws.readyState === WebSocket.OPEN) {
            const message = JSON.parse(event.data);
            if (message.type === "feedback") {
              setFeedbackList((prevList) => [message, ...prevList]);
            }
          } else {
            console.error("WebSocket connection is closed.");
          }
        } catch (err) {
          console.error("Error processing WebSocket message:", err);
        }
      };
  
      return ws;
    };
  
    const ws = createWebSocket();
  
    return () => {
      ws.close();
    };
  }, [setFeedbackList]);  

  return (
    <div className="feedback-page">
      <Sidebar />
      <h1 className="feedback-title">Feedback</h1>
      <div className="feedback-container">
        <div className="feedback-table-container">
          <table className="feedback-table">
            <colgroup>
              <col style={{ width: "15%" }} />
              <col style={{ width: "25%" }} />
              <col style={{ width: "80%" }} />
            </colgroup>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Feedback</th>
              </tr>
            </thead>
            <tbody>
  {feedbackList.length === 0 ? (
    <tr>
      <td colSpan="3" className="no-feedback-message">
        No feedback available.
      </td>
    </tr>
  ) : (
    feedbackList
      .filter(item => item && item.user_id && item.name && item.feedback) // Ensure the item is not undefined/null and has all necessary fields
      .map((item, index) => (
        <tr key={index}>
          <td>{item.user_id}</td>
          <td>{item.name}</td>
          <td>{item.feedback}</td>
        </tr>
      ))
  )}
</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
