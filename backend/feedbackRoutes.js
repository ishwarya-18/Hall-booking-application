import express from "express";
import pkg from "pg";
const { Pool } = pkg;
import { verifyToken } from "./middleware.js"; // Middleware for token verification
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// PostgreSQL pool configuration
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "hall_booking",
  password: process.env.DB_PASSWORD || "2005",
  port: process.env.DB_PORT || 5432,
});

// Submit Feedback Route
router.post("/submit", verifyToken, async (req, res) => {
  const { feedback } = req.body;
  const { userId, role } = req.user; // userId and role from the verified JWT token

  if (role === "admin") {
    return res.status(403).json({ error: "Admins cannot submit feedback." });
  }
  
  if (!feedback || feedback.trim().length === 0) {
    return res.status(400).json({ error: "Feedback cannot be empty." });
  }

  try {
    // Check if the feedback already exists for the user
    const existingFeedback = await pool.query(
      "SELECT * FROM feedback WHERE user_id = $1 AND feedback = $2",
      [userId, feedback]
    );

    if (existingFeedback.rows.length > 0) {
      // If feedback already exists, silently return without inserting
      return res.status(200).json({ message: "Feedback already submitted." });
    }

    // Insert new feedback into the database
    const created_at = new Date();
    const result = await pool.query(
      "INSERT INTO feedback (user_id, feedback, created_at) VALUES ($1, $2, $3) RETURNING id, user_id, feedback, created_at",
      [userId, feedback, created_at]
    );
    const feedbackData = result.rows[0];

    // Check if WebSocket connection exists and send feedback data to all connected clients
    if (req.app.locals.wss) {
      req.app.locals.wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(feedbackData)); // Broadcast feedback data to all WebSocket clients
        }
      });
    }

    res.status(201).json({feedback: feedbackData });
  } catch (err) {
    console.error("Error occurred during feedback submission:", err); // Log the specific error
    res.status(500).json({ error: "Internal server error during feedback submission." });
  }
});

// Get Feedback Route (Admin or User)
router.get("/", verifyToken, async (req, res) => {
  const { userId, role } = req.user;

  try {
    let query;
    let values = [];

    if (role === "admin") {
      query = `
        SELECT feedback.id, feedback.user_id, feedback.feedback, feedback.created_at, users.name
        FROM feedback
        JOIN users ON feedback.user_id = users.id
        WHERE feedback.user_id != $1  -- Exclude admin user's feedback
        GROUP BY feedback.id, feedback.user_id, feedback.feedback, feedback.created_at, users.name
        ORDER BY feedback.created_at DESC;
      `;
      values = [userId]; 
    } else {
      query = `
        SELECT feedback.id, feedback.user_id, feedback.feedback, feedback.created_at, users.name
        FROM feedback
        JOIN users ON feedback.user_id = users.id
        WHERE feedback.user_id = $1
        ORDER BY feedback.created_at DESC;
      `;
      values = [userId];
    }

    const result = await pool.query(query, values);
    // Only send feedback for users who have submitted it
    if (result.rows.length > 0) {
      res.status(200).json(result.rows);
    } else {
      res.status(200).json([]); // Return empty array if no feedback is found
    }
  } catch (err) {
    console.error("Error fetching feedback:", err);
    res.status(500).json({ error: "Error fetching feedback." });
  }
});

export default router;
