const express = require('express');
const { registerUser, loginUser, sendOtp, verifyOtp, sendResetOtp, resetPassword, verifyResetOtp } = require('../controllers/authControllers');
const { verifyJWT } = require('../middlewares/roleMiddleware');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/send-reset-otp', sendResetOtp);
router.post('/reset-password', resetPassword);

router.get("/resources", authMiddleware, (req, res) => {
  const role = req.user.role;
  const resources = {
    admin: [
      { id: 1, name: "Dashboard" },
      { id: 3, name: "Projects" },
      { id: 8, name: "Time Sheets" },
      { id: 6, name: "Admin Time Sheets" },
      { id: 4, name: "Reports" },
      { id: 6, name: "Settings" },
      { id: 2, name: "Your work" },
      { id: 5, name: "Status" },
      { id: 7, name: "All Reports" },
      { id: 9, name: "Issues" },
      { id: 10, name: "Calendar" },

    ],
    user: [
      { id: 2, name: "Your work" },
      { id: 8, name: "Time Sheets" },
      { id: 5, name: "Status" },
      { id: 9, name: "Issues" },
      { id: 10, name: "Calendar" },

    ],
    manager: [
      { id: 5, name: "Team Overview" },
      { id: 6, name: "Performance" },
      { id: 8, name: "Time Sheets" },
      { id: 10, name: "Calendar" },
    ],
  };

  const data = resources[role] || [];
  return res.json(data);
});


module.exports = router;