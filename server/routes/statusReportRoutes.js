const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { protect, authorize, authorizeResource } = require('../middlewares/authMiddleware');
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
router.get('/dashboard/overview', protect, authorizeResource('work'), getOverview);

router.post('/employee-reports/login', protect, authorizeResource('work','can_create'), submitLogin);

router.post('/employee-reports/logout', protect, authorizeResource('work','can_create'), upload.array('files'), submitLogout);

router.get('/employee-reports/status/:userId', protect, authorizeResource('work'), getTodayStatus);

router.get('/employee-reports/:userId', protect, authorizeResource('work'), getAllStatusReports);

router.get('/employee-reports/dashboard/data', protect, authorizeResource('work'), getAdminDashboardData);

router.get('/employee-reports/modules/today', protect, authorizeResource('work'), getTodayModules);

router.get('/employee-reports/reports/daily-reports', protect, authorizeResource('work'), getDaywiseReports);

module.exports = router;

