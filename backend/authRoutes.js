import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
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

// Middleware to verify JWT and extract user role
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user data to the request
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

// Middleware to check for admin role
const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }
  next();
};

// Sign Up Route
router.post("/signup", async (req, res) => {
  const { name, email, phone, password, role = "user" } = req.body;

  try {
    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "User already exists with that email." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (name, email, phone, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role",
      [name, email, phone, hashedPassword, role]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({ message: "User created successfully", token });
  } catch (error) {
    console.error("Signup Error:", error); // Log the error details
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({token });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/profile", authenticate, async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, email, phone, role FROM users WHERE id = $1", [req.user.userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin-Only Route
router.get("/admin/users", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, email, phone, role FROM users");
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
