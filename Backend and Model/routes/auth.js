const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../db");
const jwt = require("jsonwebtoken");

const router = express.Router();

//////////////////////////
// ✅ REGISTER
//////////////////////////
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check user exists
    const userCheck = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 🔐 hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // insert user with gamification defaults
    const newUser = await pool.query(
      `INSERT INTO users(name,email,password,xp,level,coins)
       VALUES($1,$2,$3,$4,$5,$6)
       RETURNING id,name,email,xp,level,coins`,
      [name, email, hashedPassword, 0, 1, 0]
    );

    res.json({
      message: "Registration successful",
      user: newUser.rows[0],
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

//////////////////////////
// ✅ LOGIN (with JWT)
//////////////////////////
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = result.rows[0];

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 🔑 CREATE JWT TOKEN
    const token = jwt.sign(
      { id: user.id, email: user.email }, // payload
      process.env.JWT_SECRET,            // secret from .env
      { expiresIn: "7d" }                // token valid for 7 days
    );

    res.json({
      message: "Login successful",
      token, // send token to frontend
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        xp: user.xp ?? 0,
        level: user.level ?? 1,
        coins: user.coins ?? 0,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;