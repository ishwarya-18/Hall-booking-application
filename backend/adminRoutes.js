import express from "express";
import pkg from "pg";  // Import the entire module
const { Client } = pkg;  // Extract Client from the module

const router = express.Router();

// PostgreSQL connection setup
const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "hall_booking",
  password: "2005",
  port: 5432,
});

client.connect().then(() => {
  console.log("Connected to PostgeSQL for Admin routes");
}).catch((err) => {
  console.error("Database connection error", err.stack);
});

// Route to get all users
router.get("/users", async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM users");
    res.json(result.rows); // Send users as response
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).send("Server Error");
  }
});

// Route to delete a user by ID
router.delete("/users/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    await client.query("DELETE FROM users WHERE id = $1", [userId]);
    res.status(200).send("User deleted");
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).send("Server Error");
  }
});

export default router;
