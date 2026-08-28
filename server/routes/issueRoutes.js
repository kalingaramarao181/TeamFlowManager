const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { getAllIssues, getIssuesByProjectId, createIssue, updateIssue, deleteIssue, getIssueById, getIssueStatusByUserId } = require('../controllers/issuesController');
const { protect, authorize, authorizeResource } = require('../middlewares/authMiddleware');

const router = express.Router();

const uploadDir = path.join(__dirname, '../uploads/');
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

const upload = multer({ storage });

router.get('/issues', protect, authorizeResource('issues'), getAllIssues);
router.post('/issues', protect, authorizeResource('issues','can_create'), upload.single("attachment"), createIssue);
router.get('/issues/:issueId', protect, authorizeResource('issues'), getIssueById);
router.get('/project/:projectId/issues', protect, authorizeResource('issues'), getIssuesByProjectId);
router.put('/issues/:issueId', protect, authorizeResource('issues','can_edit'), upload.single("attachment"), updateIssue);
router.delete('/issues/:issueId', protect, authorizeResource('issues','can_delete'), deleteIssue);


module.exports = router;

