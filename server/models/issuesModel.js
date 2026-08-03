const db = require("../Config/connection");
const Issue = {
  createIssue: (project, issueType, status, summary, description, priority, team, lables, sprint, linkedIssueType, linkedIssue, assignedTo, attachment) => {
    return new Promise((resolve, reject) => {
      db.query(
        `INSERT INTO issues (project, issue_type, status, summary, description, priority, team, labels, sprint, linked_issue_type, linked_issue, assignee, attachment) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [project, issueType, status, summary, description, priority, team, lables, sprint, linkedIssueType, linkedIssue, assignedTo, attachment],
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
  },

  getIssueById: (issueId) => {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT issues.*, users.full_name AS assignee_name, 
       projects.name AS project_name 
FROM issues
LEFT JOIN users ON issues.assignee = users.id 
LEFT JOIN projects ON issues.project = projects.id 
WHERE issues.id = ?`,
        [issueId],
        (err, result) => {
          if (err) {
            reject(err);
          } else if (result.length === 0) {
            resolve(null);
          } else {
            resolve(result[0]);
          }
        }
      );
    });
  },

  getIssuesByProjectId: (projectId) => {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT issues.*, users.full_name AS assignee_name, projects.name AS project_name FROM issues 
        LEFT JOIN users ON issues.assignee = users.id
        LEFT JOIN projects ON issues.project = projects.id
        WHERE project = ?`,
        [projectId],
        (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        }
      );
    });
  },

  updateIssue: (issueId, updates) => {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE issues SET ? WHERE id = ?`;
      db.query(sql, [updates, issueId], (err, result) => {
        if (err) {
          reject(err);
        } else if (result.affectedRows === 0) {
          resolve(null);
        } else {
          resolve(result);
        }
      });
    });
  },

  deleteIssue: (issueId) => {
    return new Promise((resolve, reject) => {
      db.query(`DELETE FROM issues WHERE id = ?`, [issueId], (err, result) => {
        if (err) {
          reject(err);
        } else if (result.affectedRows === 0) {
          resolve(null);
        } else {
          resolve(result);
        }
      });
    });
  },

  getUserSummariesByProject: (userId, projectId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT summary
      FROM issues
      WHERE assignee = ? AND project = ?
      ORDER BY created_at DESC
      LIMIT 10
    `;

    db.query(query, [userId, projectId], (err, results) => {
      if (err) return reject(err);

      const summaries = results.map(row => row.summary).join(", ");
      resolve(summaries);
    });
  });
},

  getIssuesByProject: (projectId) => {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT * FROM issues WHERE project = ?`,
        [projectId],
        (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        }
      );
    });
  },

  getAllIssues: (skip, limit, project, searchKey, userId) => {
  return new Promise((resolve, reject) => {
    // Step 1: First, get user role
    const roleQuery = `SELECT role FROM users WHERE id = ?`;
    db.query(roleQuery, [userId], (roleErr, roleResult) => {
      if (roleErr) return reject(roleErr);
      if (!roleResult.length) return reject(new Error("User not found"));

      const userRole = roleResult[0].role;
      const isAdmin = userRole === "admin"; // adjust if role names differ

      // Step 2: Build issue query
      let query = `
        SELECT 
          issues.*, 
          users.full_name AS assignee_name, 
          projects.name AS project_name,
          projects.projectKey AS project_key
        FROM issues
        LEFT JOIN users ON issues.assignee = users.id
        LEFT JOIN projects ON issues.project = projects.id
        WHERE 1 = 1
      `;

      const params = [];

      // ✅ If not admin, filter only by assigned issues
      if (!isAdmin) {
        query += " AND issues.assignee = ?";
        params.push(userId);
      }

      if (project) {
        query += " AND issues.project = ?";
        params.push(project);
      }

      if (searchKey) {
        query += " AND CONCAT(projects.projectKey, '-', issues.id) LIKE ?";
        params.push(`%${searchKey}%`);
      }

      query += " ORDER BY issues.created_at DESC";
      query += " LIMIT ? OFFSET ?";
      params.push(limit, skip);

      db.query(query, params, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  });
},

  getIssuesCount: (project, searchKey, userId) => {
  return new Promise((resolve, reject) => {
    // Step 1: Get user role
    const roleQuery = `SELECT role FROM users WHERE id = ?`;
    db.query(roleQuery, [userId], (roleErr, roleResult) => {
      if (roleErr) return reject(roleErr);
      if (!roleResult.length) return reject(new Error("User not found"));

      const userRole = roleResult[0].role;
      const isAdmin = userRole === "admin";

      // Step 2: Build count query
      let query = `
        SELECT COUNT(*) AS count
        FROM issues
        LEFT JOIN projects ON issues.project = projects.id
        WHERE 1 = 1
      `;

      const params = [];

      if (!isAdmin) {
        query += " AND issues.assignee = ?";
        params.push(userId);
      }

      if (project) {
        query += " AND issues.project = ?";
        params.push(project);
      }

      if (searchKey) {
        query += " AND CONCAT(projects.projectKey, '-', issues.id) LIKE ?";
        params.push(`%${searchKey}%`);
      }

      db.query(query, params, (err, results) => {
        if (err) reject(err);
        else resolve(results[0].count);
      });
    });
  });
},

  getIssueStatusByUser: (userId) => {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT status, COUNT(*) as count FROM issues WHERE assignee = ? GROUP BY status`,
        [userId],
        (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        }
      );
    });
  },

  getIssuesByAssignee: (assigneeId) => {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT * FROM issues WHERE assignee = ?`,
        [assigneeId],
        (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        }
      );
    });
  },

  getIssuesByStatus: (status) => {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT * FROM issues WHERE status = ?`,
        [status],
        (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        }
      );
    });
  },
};

module.exports = Issue;
