const db = require("../Config/connection");
const Project = {
  createProject: (
    name,
    projectKey,
    type,
    lead,
    projectUrl,
    description,
    projectLogo
  ) => {
    return new Promise((resolve, reject) => {
      db.query(
        `INSERT INTO projects 
         (name, projectKey, type, \`lead\`, projectUrl, description, projectLogo) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, projectKey, type, lead, projectUrl, description, projectLogo],
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

  getProjectById: (projectId) => {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT projects.*, users.full_name AS lead_name 
        FROM projects 
        LEFT JOIN users ON projects.lead = users.id WHERE projects.id = ?`,
        [projectId],
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

  getRecentProjectsWithTasks: (userId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        p.id AS projectId,
        p.name AS projectName,
        p.projectKey,

        ews.working_on AS taskName
      FROM employee_work_status ews
      JOIN projects p ON ews.project_id = p.id
      WHERE ews.user_id = ?
      ORDER BY ews.created_at DESC
      LIMIT 5
    `;

    db.query(query, [userId], (err, results) => {
      if (err) return reject(err);

      let projects = [];
      let tasks = [];

      const projectMap = new Map();
      const taskSet = new Set();

      results.forEach((row) => {
        if (!projectMap.has(row.projectId)) {
          projectMap.set(row.projectId, true);

          projects.push({
            projectId: row.projectId,
            projectName: row.projectName,
            projectKey: row.projectKey,
          });
        }

        if (row.taskName) {
          const key = `${row.projectId}-${row.taskName}`;

          if (!taskSet.has(key)) {
            taskSet.add(key);

            tasks.push({
              projectId: row.projectId,
              taskName: row.taskName,
            });
          }
        }
      });

      resolve({ projects, tasks });
    });
  });
},

  updateProject: (projectId, data) => {
    return new Promise((resolve, reject) => {
      db.query(
        `UPDATE projects SET ? WHERE id = ?`,
        [data, projectId],
        (err, result) => {
          if (err) {
            reject(err);
          } else if (result.affectedRows === 0) {
            resolve(null);
          } else {
            resolve(result);
          }
        }
      );
    });
  },

  deleteProject: (projectId) => {
    return new Promise((resolve, reject) => {
      db.query(
        `DELETE FROM projects WHERE id = ?`,
        [projectId],
        (err, result) => {
          if (err) {
            reject(err);
          } else if (result.affectedRows === 0) {
            resolve(null);
          } else {
            resolve(result);
          }
        }
      );
    });
  },

  getProjects: async () => {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT projects.name AS projectName, projects.id, projects.projectKey AS projectKey FROM projects`,
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

  getAllProjects: (skip, limit, search) => {
  return new Promise((resolve, reject) => {
    const searchQuery = `%${search}%`;
    db.query(
      `
      SELECT 
        projects.*, 
        users.full_name AS owner_name, 
        latest_docs.document_path,
        (SELECT COUNT(*) FROM issues i WHERE i.project = projects.id) AS issue_count,
        (SELECT COUNT(*) FROM issues i WHERE i.project = projects.id
          AND LOWER(COALESCE(i.status, '')) IN ('done','resolved','completed')) AS completed_count,
        (SELECT COUNT(DISTINCT i.assignee) FROM issues i WHERE i.project = projects.id) AS member_count
      FROM projects
      LEFT JOIN users ON projects.lead = users.id
      LEFT JOIN (
          SELECT pd1.project_id, pd1.document_path
          FROM project_documents pd1
          INNER JOIN (
              SELECT project_id, MAX(uploaded_at) AS latest_upload
              FROM project_documents
              GROUP BY project_id
          ) pd2 ON pd1.project_id = pd2.project_id AND pd1.uploaded_at = pd2.latest_upload
      ) AS latest_docs ON projects.id = latest_docs.project_id
      WHERE projects.name LIKE ? OR projects.projectKey LIKE ? OR users.full_name LIKE ?
      ORDER BY projects.created_at DESC
      LIMIT ? OFFSET ?
      `,
      [searchQuery, searchQuery, searchQuery, limit, skip],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
},

  getProjectsCount: (search) => {
    return new Promise((resolve, reject) => {
      const searchQuery = `%${search}%`;
      db.query(
        `
      SELECT COUNT(*) AS count 
      FROM projects 
      LEFT JOIN users ON projects.lead = users.id 
      WHERE projects.name LIKE ? OR projects.projectKey LIKE ? OR users.full_name LIKE ?
      `,
        [searchQuery, searchQuery, searchQuery],
        (err, result) => {
          if (err) reject(err);
          else resolve(result[0].count);
        }
      );
    });
  },

  getUsersByProjectIssues: (projectId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT DISTINCT 
        u.id, 
        u.full_name, 
        u.email, 
        u.role
      FROM issues i
      JOIN users u ON i.assignee = u.id
      WHERE i.project = ?
      ORDER BY u.full_name ASC
    `;

    db.query(query, [projectId], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
},

  getProjectIssues: (projectId) =>
    new Promise((resolve, reject) => {
      db.query(
        `SELECT i.*, u.full_name AS assignee_name
         FROM issues i LEFT JOIN users u ON u.id = i.assignee
         WHERE i.project = ? ORDER BY i.created_at DESC`,
        [projectId],
        (err, results) => err ? reject(err) : resolve(results)
      );
    }),

  getProjectDocuments: (projectId) =>
    new Promise((resolve, reject) => {
      db.query(
        `SELECT pd.*, u.full_name AS uploaded_by_name
         FROM project_documents pd LEFT JOIN users u ON u.id = pd.uploaded_by
         WHERE pd.project_id = ? ORDER BY pd.uploaded_at DESC`,
        [projectId],
        (err, results) => err ? reject(err) : resolve(results)
      );
    }),

  cloneProject: (source) =>
    new Promise((resolve, reject) => {
      const baseKey = `${source.projectKey}-COPY`;
      const projectKey = `${baseKey}-${Date.now().toString().slice(-5)}`;
      db.query(
        `INSERT INTO projects (name, projectKey, type, \`lead\`, projectURL, description, projectLogo)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [`${source.name} Copy`, projectKey, source.type, source.lead, source.projectURL, source.description, source.projectLogo],
        (err, result) => {
          if (err) reject(err);
          else resolve({ ...result, projectKey });
        }
      );
    }),

  uploadProjectDocument: (formData, projectId, uploadedBy) => {
    console.log("Uploading project document with formData:", formData);
    
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO project_documents (project_id, document_path, uploaded_by) VALUES (?, ?, ?)`;
      db.query(
        sql,
        [projectId, formData.filename, uploadedBy],
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
  }
};

module.exports = Project;
