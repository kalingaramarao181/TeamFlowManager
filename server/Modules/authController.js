const express = require('express');
const { sendEmail } = require("../Config/mailer");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../Config/connection');
const User = require('../models/userModels');
const router = express.Router();
require("dotenv").config();

// Generate OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
router.post('/send-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    try {
         const user = await User.findUserByEmail(email);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const otp = generateOTP();
        const token = jwt.sign({ email, otp }, process.env.JWT_SECRET, { expiresIn: "5m" });

        await sendEmail(email, "Password Reset OTP", `Your OTP is: ${otp}. It expires in 5 minutes.`);

        res.json({ message: "OTP sent successfully", token });
    } catch (error) {
        console.error("Error in send-otp:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post('/verify-otp', (req, res) => {
    const { email, otp, token } = req.body;
    if (!email || !otp || !token) return res.status(400).json({ message: "All fields required" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.email !== email || decoded.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "10m" });

        res.json({ message: "OTP verified", resetToken });
    } catch (error) {
        res.status(400).json({ message: "Invalid or expired OTP" });
    }
});

router.post('/reset-password', async (req, res) => {
    const { resetToken, newPassword } = req.body;
    
    if (!resetToken || !newPassword) return res.status(400).json({ message: "All fields required" });

    try {
        const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updateQuery = "UPDATE users SET password = ? WHERE email = ?";
        db.query(updateQuery, [hashedPassword, decoded.email], (err) => {
            if (err) return res.status(500).json({ message: "Database error" });
            res.json({ message: "Password updated successfully" });
        });
    } catch (error) {
        console.log(error);
        
        res.status(400).json({ message: "Invalid or expired token" });
    }
});

module.exports = router;