const User = require("../models/userModels");
require("dotenv").config();


const getUserProfile = async (req, res) => {
  try {
    const user = await User.findByEmail(req.user.email);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({
      id: user.id,
      fullName: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      id: user.id,
      fullName: user.name,
      phone: user.phone,
      email: user.email,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getAllUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search || "";

  try {
    const users = await User.getAllUsers(skip, limit, search);
    const totalCount = await User.getUsersCount(search);
    const totalPages = Math.ceil(totalCount / limit);
    res.status(200).json({ users, totalPages });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.getUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUserProfile,
  getUserById,
  getAllUsers,
  getUsers,
};
