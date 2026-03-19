const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

/* =========================
   CONTACT FORM EMAIL
========================= */

router.post("/contact", async (req, res) => {

    const { name, email, message } = req.body;

    try {

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "yourgmail@gmail.com",       // your Gmail
                pass: "your_app_password"          // 16-digit app password
            }
        });

        const mailOptions = {
            from: email,
            to: "yourgmail@gmail.com",  // where you want messages
            subject: "New Contact Message",
            html: `
                <h2>New Contact Request</h2>
                <p><b>Name:</b> ${name}</p>
                <p><b>Email:</b> ${email}</p>
                <p><b>Message:</b><br>${message}</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: "Message sent successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Email failed to send" });
    }
});

module.exports = router;