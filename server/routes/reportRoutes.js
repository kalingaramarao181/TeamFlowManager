const express = require('express');
const { getAllReports, getReportsByUserId, uploadReport  } = require('../controllers/reportsController');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ====== Multer storage config ======
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); 
    const uniqueName = Date.now() + ext;   
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

router.get('/reports', protect, authorize(["admin", "manager"]), getAllReports);
router.post('/reports', protect, upload.single('file'), uploadReport);
router.get('/reports/user/:userId', protect, getReportsByUserId)




module.exports = router;
