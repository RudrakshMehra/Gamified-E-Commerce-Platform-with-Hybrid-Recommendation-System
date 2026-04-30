const express = require("express");
const router  = express.Router();
const pool    = require("../db");

/* =========================
   CONTACT FORM — saves to DB
   (email sending requires real
    Gmail credentials in .env)
========================= */

router.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Always save to DB so no message is ever lost
    await pool.query(
      `INSERT INTO contact_messages(name, email, message)
       VALUES($1, $2, $3)`,
      [name, email, message]
    );

    // Optional email — only runs if credentials are configured
    if (
      process.env.CONTACT_EMAIL &&
      process.env.CONTACT_EMAIL !== "yourgmail@gmail.com" &&
      process.env.EMAIL_APP_PASSWORD
    ) {
      try {
        const nodemailer   = require("nodemailer");
        const transporter  = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.CONTACT_EMAIL,
            pass: process.env.EMAIL_APP_PASSWORD,
          },
        });
        await transporter.sendMail({
          from:    email,
          to:      process.env.CONTACT_EMAIL,
          subject: "New Contact Message from ShopXP",
          html: `<h2>New Contact Request</h2>
                 <p><b>Name:</b> ${name}</p>
                 <p><b>Email:</b> ${email}</p>
                 <p><b>Message:</b><br>${message}</p>`,
        });
      } catch (mailErr) {
        // Email failure is non-fatal — message is already saved to DB
        console.warn("Email send failed (message saved to DB):", mailErr.message);
      }
    }

    res.json({ message: "Message sent successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
