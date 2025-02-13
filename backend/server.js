import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./authRoutes.js";
import feedbackRoutes from "./feedbackRoutes.js";
import { verifyToken } from "./middleware.js";
import adminRoutes from "./adminRoutes.js";
import bookingRoutes from "./bookingRoutes.js"; // Import booking routes
import availabilityRoutes from "./availabilityRoutes.js"; // Import availability routes

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(bodyParser.json());

app.use("/auth", authRoutes);
app.use("/api", verifyToken);
app.use("/feedback", verifyToken, feedbackRoutes);
app.use("/admin", adminRoutes);
app.use("/api", bookingRoutes);  // Use booking routes for booking operations
app.use(availabilityRoutes);

wss.on("connection", (ws) => {
  console.log("New WebSocket connection");

  ws.on("message", (message) => {
    console.log("Received message:", message);
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
  });

  // Example: notify all connected clients about an availability change
  ws.send(JSON.stringify({ type: "availability-change", hall: "Main Auditorium Hall", slot: "9:00 - 9:30" }));
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
