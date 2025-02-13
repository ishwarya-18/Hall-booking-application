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
// Backend API for hall availability
router.get("/api/availability", async (req, res) => {
  const { hall, date } = req.query;

  if (!hall || !date) {
    return res.status(400).json({ message: "Hall and date are required" });
  }

  try {
    // Get booked slots for the specific hall and date
    const bookedSlots = await pool.query(
      "SELECT slot FROM bookings WHERE hall = $1 AND date = $2",
      [hall, date]
    );

    // Slot times for the day
    const slots = [
      "8:30 - 9:00", "9:00 - 9:30", "9:30 - 10:00", "10:00 - 10:30", "10:30 - 11:00", "11:00 - 11:30", 
      "11:30 - 12:00", "12:00 - 12:30", "1:00 - 1:30", "1:30 - 2:00", "2:00 - 2:30", "2:30 - 3:00", 
      "3:00 - 3:30", "3:30 - 4:00", "4:00 - 4:30", "After 4:30",
    ];

    // Mark booked slots
    const availableSlots = slots.map(slot => ({
      slot,
      status: bookedSlots.rows.some(booked => booked.slot === slot) ? "red" : "green",
    }));

    // Send the availability response
    res.json({ availableSlots });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching availability" });
  }
});


export default router;
