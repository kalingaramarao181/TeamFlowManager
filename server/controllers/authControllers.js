const User = require("../models/userModels");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const generateOTP  = require("../utils/generateOtp");
const sendEmail = require("../utils/emailService");
require("dotenv").config();

const registerUser = async (req, res) => {
  const { name, email, password, role, position_id } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }

  try {
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const normalizedRole = ["user", "admin", "moderator", "super_admin"].includes(role) ? role : "user";
    if (normalizedRole === "super_admin") {
      return res.status(403).json({ message: "Super admin assignment must be done by an existing super admin" });
    }

    const defaultPositionId = position_id || (await User.getDefaultPositionId());

    await User.createUser(name, email, password, {
      role: normalizedRole,
      position_id: defaultPositionId,
    });

    if (defaultPositionId) {
      const createdUser = await User.findByEmail(email);
      await User.assignUserPosition(createdUser.id, defaultPositionId, createdUser.id);
    }

    return res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findByEmail(email);
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const currentPosition = await User.getCurrentPositionId(user.id);
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.full_name, role: user.role, position_id: currentPosition || user.position_id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        role: user.role,
        position_id: currentPosition || user.position_id,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const userData = await User.findByEmail(email);
    if (userData) {
      return res.status(404).json({ message: "User already exists" });
    }
    const otp = generateOTP();
    const token = jwt.sign({ email, otp }, process.env.JWT_SECRET, { expiresIn: "5m" });
    await sendEmail(email, "Password Reset OTP", `Your OTP is: ${otp}. It expires in 5 minutes.`);
    res.json({ message: "OTP sent successfully", token });
  } catch (error) {
    console.error("Error in send-otp:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const sendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const userData = await User.findByEmail(email);
    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = generateOTP();
    const token = jwt.sign({ email, otp }, process.env.JWT_SECRET, { expiresIn: "5m" });
    await sendEmail(email, "Reset Password OTP", `Your OTP is: ${otp}. It expires in 5 minutes.`);
    res.json({ message: "Reset OTP sent successfully", token });
  } catch (error) {
    console.error("Error in send-reset-otp:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp, token } = req.body;
  if (!email || !otp || !token)
    return res.status(400).json({ message: "All fields required" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.email !== email || decoded.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const registerToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "10m" });
    res.json({ message: "OTP verified", registerToken });
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired OTP" });
  }
};

const verifyResetOtp = async (req, res) => {
  const { email, otp, token } = req.body;
  if (!email || !otp || !token)
    return res.status(400).json({ message: "All fields required" });

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
};

const resetPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;
  if (!resetToken || !newPassword)
    return res.status(400).json({ message: "All fields required" });

  try {
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updateUserPassword(decoded.email, hashedPassword);
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Invalid or expired token" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  sendOtp,
  verifyOtp,
  sendResetOtp,
  resetPassword,
  verifyResetOtp
};
