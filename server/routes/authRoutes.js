const express = require('express');
const User = require('../models/userModels');
const { registerUser, loginUser, sendOtp, verifyOtp, sendResetOtp, resetPassword, verifyResetOtp } = require('../controllers/authControllers');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/send-reset-otp', sendResetOtp);
router.post('/reset-password', resetPassword);

router.get('/positions', authMiddleware, async (req, res) => {
  try {
    const positions = await User.listPositions();
    return res.status(200).json(positions);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load positions', error: error.message });
  }
});

router.get('/resources', authMiddleware, async (req, res) => {
  try {
    const permissionList = await User.getResourceAccessForUser(req.user.id);
    const allowedResources = permissionList
      .filter((item) => item.can_view)
      .map((item) => ({ id: item.id, name: item.name, resource_key: item.resource_key, can_view: item.can_view }));

    return res.status(200).json(allowedResources);
  } catch (error) {
    console.error('Resource fetch failed:', error);
    return res.status(500).json({ message: 'Failed to load resources', error: error.message });
  }
});

router.get('/user-permissions', authMiddleware, async (req, res) => {
  try {
    const [permissions, positions] = await Promise.all([
      User.getResourceAccessForUser(req.user.id),
      User.listPositions(),
    ]);

    return res.status(200).json({ permissions, positions });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load user permissions', error: error.message });
  }
});

module.exports = router;