const express = require("express");
const router = express.Router();
const db = require("../Config/connection");
const upload = require("../Config/multer");

// GET Projects - Fetch all projects
router.get("/projects", (req, res) => {
  const query = "SELECT * FROM projects ORDER BY created_at DESC";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching projects:", err.message);
      return res
        .status(500)
        .json({ success: false, message: "Failed to fetch projects" });
    }

    res.status(200).json({ success: true, projects: results });
  });
});


router.get("/projects/:projectId", (req, res) => {
  const projectId = req.params.projectId;

  // Query to fetch project details from the 'PROJECTS' table
  const projectQuery = `
    SELECT p.id, p.name, p.description, p.type, p.projectKey, p.projectLogo, p.projectURL, p.created_at, u.full_name AS lead_name
    FROM projects p
    LEFT JOIN users u ON p.lead = u.id
    WHERE p.id = ?
  `;

  db.query(projectQuery, [projectId], (err, projectResults) => {
    if (err) {
      console.error("Error fetching project details:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    if (projectResults.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    const project = projectResults[0];

    // Query to fetch project members from the 'ISSUES' table (all unique assignees in this project)
    const membersQuery = `
      SELECT DISTINCT u.id, u.full_name, u.email, u.role
      FROM issues i
      JOIN users u ON i.assignee = u.id
      WHERE i.project = ? AND i.assignee IS NOT NULL
    `;

    db.query(membersQuery, [projectId], (err, membersResults) => {
      if (err) {
        console.error("Error fetching project members:", err);
        return res.status(500).json({ message: "Internal Server Error" });
      }

      // Respond with project details and members
      res.status(200).json({
        project: {
          id: project.id,
          name: project.name,
          description: project.description,
          projectKey: project.projectKey,
          lead: project.lead_name,
          createdAt: project.created_at,
          updatedAt: project.updated_at,
          projectURL: project.projectURL,
          projectLogo: project.projectLogo,
          projectType: project.type,
        },
        members: membersResults, // List of unique project members (assignees)
      });
    });
  });
});

// GET Project Name by Project ID
router.get("/project-name/:projectId", (req, res) => {
  const projectId = req.params.projectId;

  // Query to fetch only the project name based on the provided project ID
  const query = `
    SELECT name, projectKey
    FROM projects
    WHERE id = ?
  `;

  db.query(query, [projectId], (err, results) => {
    if (err) {
      console.error("Error fetching project name:", err.message);
      return res.status(500).json({ success: false, message: "Failed to fetch project name" });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Respond with the project name
    res.status(200).json({
      success: true,
      projectName: results[0].name,
      projectKey: results[0].projectKey
    });
  });
});



router.get("/user/:userId/projects", (req, res) => {
  const userId = req.params.userId;

  // Query to fetch projects where the user is a member
  const query = `
    SELECT DISTINCT 
      p.id, 
      p.name, 
      p.description, 
      p.type, 
      p.projectKey, 
      p.projectLogo, 
      p.projectURL, 
      p.created_at, 
      u.full_name AS lead_name
    FROM projects p
    LEFT JOIN users u ON p.lead = u.id
    JOIN issues i ON i.project = p.id
    WHERE i.assignee = ?
    ORDER BY p.created_at DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching user projects:", err.message);
      return res
        .status(500)
        .json({ success: false, message: "Failed to fetch user projects" });
    }

    // Respond with the list of projects
    res.status(200).json({ success: true, projects: results });
  });
});

// POST Project - Insert a new project
router.post("/projects", upload.single("projectLogo"), (req, res) => {
  const { name, key, type, lead, projectURL, description } = req.body;

  const projectLogo = req.file ? req.file.filename : null;

  const sql = `
    INSERT INTO projects 
    (name, projectKey, type, lead, projectURL, description, projectLogo)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [name, key, type, lead, projectURL, description, projectLogo],
    (err, result) => {
      if (err) {
        console.error("Database Insert Error:", err);
        return res
          .status(500)
          .send({ message: "Failed to create project", error: err });
      }

      res
        .status(200)
        .send({ message: "Project created successfully", id: result.insertId });
    }
  );
});

module.exports = router;
