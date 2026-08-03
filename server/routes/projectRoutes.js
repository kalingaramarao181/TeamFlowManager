const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { getAllProjects, getProjects, getProjectById, createProject, uploadProjectDocument, updateProject, deleteProject, cloneProject, getUsersByProjectIssues, getRecentProjectsWithTasks  } = require('../controllers/projectsController');
const { uploadDocument } = require('../models/statusReportModel');
const { protect, authorize } = require('../middlewares/authMiddleware');

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

router.get('/projects', protect, getAllProjects);
router.get('/projects/all', protect, getProjects);
router.get('/project/:projectId', protect, getProjectById);
router.post('/projects', protect, authorize(["admin"]), upload.single("projectLogo"), createProject);
router.post('/projects/documents', protect, upload.single("document_path"), uploadProjectDocument);
router.put('/projects/:projectId', protect, authorize(["admin"]), upload.single("projectLogo"), updateProject);
router.delete('/projects/:projectId', protect, authorize(["admin"]), deleteProject);
router.post('/projects/:projectId/clone', protect, authorize(["admin"]), cloneProject);
router.get("/projects/:projectId/users", protect, getUsersByProjectIssues);
router.get("/projects/recent-tasks/:userId", protect, getRecentProjectsWithTasks);


module.exports = router;
