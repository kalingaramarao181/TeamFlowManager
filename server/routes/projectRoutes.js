const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const db = require('../Config/connection');
const { getAllProjects, getProjects, getProjectById, createProject, uploadProjectDocument, updateProject, deleteProject, cloneProject, getUsersByProjectIssues, getRecentProjectsWithTasks  } = require('../controllers/projectsController');
const { uploadDocument } = require('../models/statusReportModel');
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

router.get('/projects', protect, authorizeResource('projects'), getAllProjects);
router.get('/projects/all', protect, authorizeResource('projects'), getProjects);
router.get('/project/:projectId', protect, authorizeResource('projects'), getProjectById);
router.post('/projects', protect, authorizeResource('projects','can_create'), upload.single("projectLogo"), createProject);
router.post('/projects/documents', protect, authorizeResource('projects','can_create'), upload.single("document_path"), uploadProjectDocument);
router.put('/projects/:projectId', protect, authorizeResource('projects','can_edit'), upload.single("projectLogo"), updateProject);
router.delete('/projects/:projectId', protect, authorizeResource('projects','can_delete'), deleteProject);
router.post('/projects/:projectId/clone', protect, authorizeResource('projects','can_create'), cloneProject);
router.get("/projects/:projectId/users", protect, authorizeResource('projects'), getUsersByProjectIssues);
router.get("/projects/recent-tasks/:userId", protect, authorizeResource('projects'), getRecentProjectsWithTasks);

router.get('/projects/:projectId/overview', protect, authorizeResource('projects'), (req, res) => {
  const { projectId } = req.params;

  const queries = {
    project: `SELECT p.*, u.full_name AS lead_name FROM projects p LEFT JOIN users u ON p.lead = u.id WHERE p.id = ?`,
    tasks: `SELECT i.*, u.full_name AS assignee_name FROM issues i LEFT JOIN users u ON u.id = i.assignee WHERE i.project = ? ORDER BY i.created_at DESC`,
    teams: `SELECT * FROM teams WHERE project_id = ? ORDER BY created_at DESC`,
    status: `SELECT s.*, u.full_name AS user_name FROM employee_work_status s LEFT JOIN users u ON u.id = s.user_id WHERE s.project_id = ? ORDER BY s.created_at DESC LIMIT 20`,
    chat: `SELECT c.*, u.full_name AS sender_name FROM chat_messages c LEFT JOIN users u ON u.id = c.sender_id WHERE c.project_id = ? ORDER BY c.created_at ASC`,
  };

  const runQuery = (sql, params) => new Promise((resolve, reject) => {
    db.query(sql, params, (error, rows) => error ? reject(error) : resolve(rows));
  });

  Promise.all([
    runQuery(queries.project, [projectId]),
    runQuery(queries.tasks, [projectId]),
    runQuery(queries.teams, [projectId]),
    runQuery(queries.status, [projectId]),
    runQuery(queries.chat, [projectId]),
  ])
    .then(([project, tasks, teams, status, chat]) => {
      const normalizedTeams = teams.map((team) => ({
        ...team,
        team_members: team.team_members ? JSON.parse(team.team_members) : [],
      }));

      const completed = tasks.filter((task) => ["done", "resolved", "completed"].includes(String(task.status || '').toLowerCase())).length;
      const percentage = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

      res.status(200).json({
        project: project[0] || null,
        tasks,
        teams: normalizedTeams,
        status,
        chat,
        progress: {
          totalTasks: tasks.length,
          completed,
          percentage,
        },
      });
    })
    .catch((error) => {
      console.error('Project overview failed:', error);
      res.status(500).json({ error: 'Failed to load project overview' });
    });
});

router.post('/projects/:projectId/tasks', protect, authorizeResource('projects','can_create'), (req, res) => {
  const { projectId } = req.params;
  const {
    issueType = 'task',
    status = 'To Do',
    summary,
    description = '',
    priority = 'Medium',
    team = '',
    labels = '',
    sprint = '',
    linkedIssueType = '',
    linkedIssue = '',
    assignee,
  } = req.body;

  if (!summary) {
    return res.status(400).json({ error: 'Task summary is required' });
  }

  db.query(
    `INSERT INTO issues (project, issue_type, status, summary, description, priority, team, labels, sprint, linked_issue_type, linked_issue, assignee) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [projectId, issueType, status, summary, description, priority, team, labels, sprint, linkedIssueType, linkedIssue, assignee || null],
    (err, result) => {
      if (err) {
        console.error('Error creating project task:', err);
        return res.status(500).json({ error: 'Failed to create task' });
      }

      res.status(201).json({
        message: 'Task created successfully',
        task: {
          id: result.insertId,
          project: Number(projectId),
          issue_type: issueType,
          status,
          summary,
          description,
          priority,
          team,
          labels,
          sprint,
          linked_issue_type: linkedIssueType,
          linked_issue: linkedIssue,
          assignee: assignee || null,
        },
      });
    }
  );
});

router.get('/projects/:projectId/tasks', protect, authorizeResource('projects'), (req, res) => {
  const { projectId } = req.params;

  db.query(
    `SELECT i.*, u.full_name AS assignee_name FROM issues i LEFT JOIN users u ON u.id = i.assignee WHERE i.project = ? ORDER BY i.created_at DESC`,
    [projectId],
    (err, tasks) => {
      if (err) {
        console.error('Error fetching project tasks:', err);
        return res.status(500).json({ error: 'Failed to fetch tasks' });
      }

      res.status(200).json({ tasks });
    }
  );
});

router.post('/projects/:projectId/tasks/:taskId/subtasks', protect, authorizeResource('projects','can_create'), (req, res) => {
  const { projectId, taskId } = req.params;
  const { subtask_name, assignee_id, status = 'pending', percentage = 0 } = req.body;

  if (!subtask_name) {
    return res.status(400).json({ error: 'Subtask name is required' });
  }

  db.query(
    `INSERT INTO project_task_breakdowns (project_id, task_id, subtask_name, assignee_id, status, percentage) VALUES (?, ?, ?, ?, ?, ?)`,
    [projectId, taskId, subtask_name, assignee_id || null, status, percentage],
    (err, result) => {
      if (err) {
        console.error('Error creating subtask:', err);
        return res.status(500).json({ error: 'Failed to create subtask' });
      }

      res.status(201).json({
        message: 'Subtask added successfully',
        subtask: { id: result.insertId, project_id: projectId, task_id: taskId, subtask_name, assignee_id, status, percentage },
      });
    }
  );
});

router.get('/projects/:projectId/tasks/:taskId/subtasks', protect, authorizeResource('projects'), (req, res) => {
  const { projectId, taskId } = req.params;

  db.query(
    `SELECT * FROM project_task_breakdowns WHERE project_id = ? AND task_id = ? ORDER BY created_at ASC`,
    [projectId, taskId],
    (err, subtasks) => {
      if (err) {
        console.error('Error fetching subtasks:', err);
        return res.status(500).json({ error: 'Failed to fetch subtasks' });
      }

      res.status(200).json({ subtasks });
    }
  );
});

router.post('/projects/:projectId/github', protect, authorizeResource('projects','can_create'), (req, res) => {
  const { projectId } = req.params;
  const { repo_url, repo_name, github_token } = req.body;

  if (!repo_url) {
    return res.status(400).json({ error: 'GitHub repo URL is required' });
  }

  db.query(
    `INSERT INTO project_github_configs (project_id, repo_url, repo_name, github_token) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE repo_url = VALUES(repo_url), repo_name = VALUES(repo_name), github_token = VALUES(github_token), updated_at = CURRENT_TIMESTAMP`,
    [projectId, repo_url, repo_name || repo_url.split('/').filter(Boolean).pop(), github_token || null],
    (err) => {
      if (err) {
        console.error('GitHub config save failed:', err);
        return res.status(500).json({ error: 'Failed to save GitHub config' });
      }

      res.status(200).json({ message: 'GitHub repository linked successfully' });
    }
  );
});

router.get('/projects/:projectId/github', protect, authorizeResource('projects'), (req, res) => {
  const { projectId } = req.params;

  db.query(
    `SELECT * FROM project_github_configs WHERE project_id = ? LIMIT 1`,
    [projectId],
    (err, rows) => {
      if (err) {
        console.error('GitHub config fetch failed:', err);
        return res.status(500).json({ error: 'Failed to fetch GitHub config' });
      }

      if (!rows.length) {
        return res.status(404).json({ error: 'GitHub repo not linked' });
      }

      const repo = rows[0];
      const repoOwner = repo.repo_url.split('/').filter(Boolean)[0];
      const repoName = repo.repo_url.split('/').filter(Boolean)[1] || repo.repo_name;

      res.status(200).json({
        id: repo.id,
        project_id: repo.project_id,
        repo_url: repo.repo_url,
        repo_name: repo.repo_name || repoName,
        github_owner: repoOwner,
        link: `https://github.com/${repoOwner}/${repoName}`,
      });
    }
  );
});


module.exports = router;

