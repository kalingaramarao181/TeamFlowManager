const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { getOverview } = require("../controllers/dashboardController");

const {
  submitLogin,
  submitLogout,
  getTodayStatus,
  getAllStatusReports,
  getAdminDashboardData,
  getTodayModules,
  getDaywiseReports
} = require('../controllers/statusReportController');

const uploadDir = path.join(__dirname, '../uploads/DailyStatusReports');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
  const uniqueSuffix = Date.now();
  const ext = file.originalname.split('.').pop();
  cb(null, `${uniqueSuffix}.${ext}`);
},
});

const upload = multer({
  storage,
});

// Routes
router.get('/dashboard/overview', protect, getOverview);

router.post('/employee-reports/login', protect, submitLogin);

router.post('/employee-reports/logout', protect, upload.array('files'), submitLogout);

router.get('/employee-reports/status/:userId', protect, getTodayStatus);

router.get('/employee-reports/:userId', protect, getAllStatusReports);

router.get('/employee-reports/dashboard/data', protect, authorize(["admin", "manager"]), getAdminDashboardData);

router.get('/employee-reports/modules/today', protect, getTodayModules);

router.get('/employee-reports/reports/daily-reports', protect, authorize(["admin", "manager"]), getDaywiseReports);

module.exports = router;
