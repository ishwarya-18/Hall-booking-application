import express from "express";
import pkg from 'pg';

const { Pool } = pkg;
const router = express.Router();

// PostgreSQL pool configuration
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "hall_booking",
  password: process.env.DB_PASSWORD || "2005",
  port: process.env.DB_PORT || 5432,
});

// Delete a booking
router.delete("/bookings/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Delete the booking from the database
    const result = await pool.query("DELETE FROM bookings WHERE id = $1 RETURNING *", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Booking not found." });
    }

    res.status(200).json({ message: "Booking deleted successfully." });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Create a new booking
// Create a new booking
router.post("/bookings", async (req, res) => {
  const { hall, date, slots, purpose, user_id } = req.body; // Expecting slots as an array

  try {
    // Check if any of the selected slots are already booked
    const conflictResults = await Promise.all(
      slots.map((slot) =>
        pool.query("SELECT * FROM bookings WHERE hall = $1 AND date = $2 AND slot = $3", [hall, date, slot])
      )
    );

    // If any slot is already booked, return conflict response
    const conflicts = conflictResults.filter(result => result.rows.length > 0);
    if (conflicts.length > 0) {
      const conflictedSlots = conflicts.map(result => result.rows[0].slot);
      return res.status(400).json({ message: `The following slots are already booked: ${conflictedSlots.join(", ")}` });
    }

    // Insert new bookings for all selected slots
    const newBookings = [];
    for (let slot of slots) {
      const newBooking = await pool.query(
        "INSERT INTO bookings (user_id, hall, date, slot, purpose) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [user_id, hall, date, slot, purpose]
      );
      newBookings.push(newBooking.rows[0]);
    }

    res.status(201).json(newBookings); // Return all the created bookings
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// Get all bookings
router.get("/bookings", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM bookings");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
