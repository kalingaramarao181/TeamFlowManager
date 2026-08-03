const express = require("express");
const router = express.Router();
const db = require("../Config/connection");
const upload = require("../Config/multer");

// GET Issues - Callback-based Query
router.get("/issues", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;

  const query = `
    SELECT 
      issues.*,
      users.full_name AS assignee_name,
      projects.name AS project_name
    FROM issues
    LEFT JOIN users ON issues.assignee = users.id
    LEFT JOIN projects ON issues.project = projects.id
    ORDER BY issues.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const countQuery = `SELECT COUNT(*) as total FROM issues`;

  db.query(query, [limit, offset], (err, results) => {
    if (err) {
      console.error("Error fetching issues:", err);
      return res.status(500).json({ error: "Server error" });
    }

    db.query(countQuery, (err, countResult) => {
      if (err) {
        return res.status(500).json({ error: "Count error" });
      }

      const total = countResult[0].total;

      res.json({
        issues: results,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      });
    });
  });
});


router.get("/projects/:projectId/issues", (req, res) => {
  const { projectId } = req.params;

  const query = `
    SELECT 
      issues.*, 
      projects.name AS project_name, 
      projects.description AS project_description 
    FROM 
      issues 
    INNER JOIN 
      projects 
    ON 
      issues.project = projects.id 
    WHERE 
      projects.id = ?
    ORDER BY 
      issues.created_at DESC
  `;

  db.query(query, [projectId], (err, results) => {
    if (err) {
      console.error("Error fetching issues with project details:", err.message);
      return res
        .status(500)
        .json({ success: false, message: "Failed to fetch issues with project details" });
    }

    res.status(200).json({ success: true, issues: results });
  });
});


// POST Issues - Insert a new issue
router.post("/issues", upload.single("attachment"), (req, res) => {
  const {
    project,
    issueType,
    status,
    summary,
    description,
    priority,
    team,
    labels,
    sprint,
    linkedIssueType,
    linkedIssue,
    assignee,
  } = req.body;

  const attachment = req.file ? req.file.filename : null;

  const sql = `
    INSERT INTO issues 
    (project, issue_type, status, summary, description, priority, team, labels, sprint, 
    linked_issue_type, linked_issue, assignee, attachment)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      project,
      issueType,
      status || "To Do",
      summary,
      description,
      priority || "Medium",
      team,
      labels,
      sprint,
      linkedIssueType || "blocks",
      linkedIssue,
      assignee || "Automatic",
      attachment,
    ],
    (err, result) => {
      if (err) {
        console.error("Database Insert Error:", err);
        return res
          .status(500)
          .send({ message: "Failed to create issue", error: err });
      }

      res
        .status(200)
        .send({ message: "Issue created successfully", id: result.insertId });
    }
  );
});

router.put("/issues/:id", upload.single("attachment"), (req, res) => {
  const issueId = req.params.id;
  const {
    project,
    issueType,
    status,
    summary,
    description,
    priority,
    team,
    labels,
    sprint,
    linkedIssueType,
    linkedIssue,
    assignee,
  } = req.body;

  const attachment = req.file ? req.file.filename : null;

  // Start building the SQL query
  let sql = `
    UPDATE issues
    SET
      project = ?,
      issue_type = ?,
      status = ?,
      summary = ?,
      description = ?,
      priority = ?,
      team = ?,
      labels = ?,
      sprint = ?,
      linked_issue_type = ?,
      linked_issue = ?,
      assignee = ?
  `;

  const params = [
    project,
    issueType,
    status || "To Do",
    summary,
    description,
    priority || "Medium",
    team,
    labels,
    sprint,
    linkedIssueType || "blocks",
    linkedIssue,
    assignee,
  ];

  if (attachment) {
    sql += ", attachment = ?";
    params.push(attachment);
  }

  // Add the WHERE clause
  sql += " WHERE id = ?";
  params.push(issueId);

  // Execute the query
  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("Database Update Error:", err);
      return res
        .status(500)
        .send({ message: "Failed to update issue", error: err });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .send({ message: "Issue not found or no changes were made" });
    }

    res.status(200).send({ message: "Issue updated successfully" });
  });
});


router.get("/projects/:projectId/issues", (req, res) => {
  const { projectId } = req.params;

  const query = "SELECT * FROM issues WHERE project = ? ORDER BY created_at DESC";

  db.query(query, [projectId], (err, results) => {
    if (err) {
      console.error("Error fetching issues:", err.message);
      return res
        .status(500)
        .json({ success: false, message: "Failed to fetch issues" });
    }

    res.status(200).json({ success: true, issues: results });
  });
});

// DELETE Issue by issue ID
router.delete("/issues/:issueId", (req, res) => {
  const { issueId } = req.params;

  const query = "DELETE FROM issues WHERE id = ?";

  db.query(query, [issueId], (err, results) => {
    if (err) {
      console.error("Error deleting issue:", err.message);
      return res
        .status(500)
        .json({ success: false, message: "Failed to delete issue" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Issue not found" });
    } else {
      res.status(200).json({ success: true, message: "Issue deleted successfully" });
    }
  });
});

// GET Issue details by issue ID
router.get("/issues/:issueId", (req, res) => {
  const { issueId } = req.params;

  const query = "SELECT * FROM issues WHERE id = ?";

  db.query(query, [issueId], (err, results) => {
    if (err) {
      console.error("Error fetching issue details:", err.message);
      return res
        .status(500)
        .json({ success: false, message: "Failed to fetch issue details" });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Issue not found" });
    }

    res.status(200).json({ success: true, issue: results[0] });
  });
});

router.get("/issue-status/:userId", (req, res) => {
  const { userId } = req.params;
  

  const query = "SELECT summary FROM issues WHERE assignee = ? ORDER BY created_at DESC LIMIT 1";

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching issue status:", err.message);
      return res
        .status(500)
        .json({ success: false, message: "Failed to fetch issue status" });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "No issue found for this user" });
    }

    res.status(200).json({ success: true, issueStatus: results[0].summary });
  });
});

module.exports = router;
