const express = require('express');
// const { registerUser, loginUser, getUserProfile, updateUserRole, getUsersByRole } = require('../controllers/authController');
// const { protect, authorize } = require('../middlewares/authMiddleware');
// const { getUserById, getAllUsers, getUserDetails } = require('../controllers/userController');

const {getAllUsers, getUserById, getUsers} = require("../controllers/userControllers");
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

// router.get('/user/:userId', getUserById);
router.get('/users', protect, authorize(["admin", "manager"]), getAllUsers);
router.get('/users/all', protect, getUsers);
router.get(`/user/:userId`, protect, getUserById)



module.exports = router;
