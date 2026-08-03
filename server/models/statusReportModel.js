const db = require("../Config/connection");
const moment = require("moment-timezone");

// Get current Georgia time
const getGeorgiaTime = () =>
  moment().tz("America/New_York").format("YYYY-MM-DD HH:mm:ss");
const getGeorgiaDate = () =>
  moment().tz("America/New_York").format("YYYY-MM-DD");

exports.insertLoginStatus = async (data) => {
  const { user_id, project_id, module_name, working_on, status } = data;
  const now = getGeorgiaTime();

  const result = await db.query(
    `INSERT INTO employee_work_status 
     (user_id, project_id, module_name, working_on, status, login_time, created_at, login_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
    [user_id, project_id, module_name, working_on, status, now, now]
  );
  return result.insertId;
};

exports.updateLogoutStatus = async (id, data) => {
  const { worked_on, status } = data;
  const now = getGeorgiaTime();

  await db.query(
    `UPDATE employee_work_status
     SET logout_time = ?, worked_on = ?, status = ?, login_status = 0
     WHERE id = ?`,
    [now, worked_on, status, id]
  );
};

exports.uploadDocument = async (work_status_id, file_name) => {
  const now = getGeorgiaTime();

  await db.query(
    `INSERT INTO employee_status_documents (work_status_id, file_name, uploaded_at)
     VALUES (?, ?, ?)`,
    [work_status_id, file_name, now]
  );
};

exports.getTodayStatusByUserId = async (user_id) => {
  const today = getGeorgiaDate();

  return new Promise((resolve, reject) => {
    db.query(
      `SELECT ews.*, esd.id AS document_id, esd.file_name, esd.uploaded_at 
       FROM employee_work_status ews
       LEFT JOIN employee_status_documents esd ON ews.id = esd.work_status_id
       WHERE ews.user_id = ? AND DATE(ews.login_time) = ?`,
      [user_id, today],
      (err, results) => {
        if (err) {
          reject(err);
        } else if (results.length === 0) {
          resolve(null);
        } else {
          const status = results[0];
          status.documents = results
            .filter((row) => row.document_id)
            .map((doc) => ({
              id: doc.document_id,
              file_name: doc.file_name,
              uploaded_at: doc.uploaded_at,
            }));

          delete status.document_id;
          delete status.file_name;
          delete status.uploaded_at;

          resolve(status);
        }
      }
    );
  });
};

exports.getAllStatusReports = async (userId, skip, limit) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT 
        ews.*, 
        users.full_name AS user_name, 
        projects.name AS project_name,
        esd.id AS document_id,
        esd.file_name,
        esd.uploaded_at
      FROM employee_work_status ews
      LEFT JOIN users ON ews.user_id = users.id
      LEFT JOIN projects ON ews.project_id = projects.id
      LEFT JOIN employee_status_documents esd ON esd.work_status_id = ews.id
      WHERE ews.user_id = ?
      ORDER BY ews.created_at DESC
      LIMIT ? OFFSET ?`,
      [userId, limit, skip],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          const statusMap = new Map();

          results.forEach((row) => {
            if (!statusMap.has(row.id)) {
              statusMap.set(row.id, {
                ...row,
                documents: [],
              });
            }
            const status = statusMap.get(row.id);

            if (row.document_id) {
              status.documents.push({
                id: row.document_id,
                file_name: row.file_name,
                uploaded_at: row.uploaded_at,
              });
            }
            delete status.document_id;
            delete status.file_name;
            delete status.uploaded_at;
          });

          resolve([...statusMap.values()]);
        }
      }
    );
  });
};


exports.getStatusReportsCount = async (userId) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT COUNT(*) AS count FROM employee_work_status WHERE user_id = ?`, [userId],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results[0].count);
        }
      }
    );
  });
};

exports.getActiveUsersToday = async () => {
  const today = getGeorgiaDate();

  return new Promise((resolve, reject) => {
    db.query(
      `SELECT 
        users.full_name AS user_name, 
        employee_work_status.login_time, 
        employee_work_status.logout_time, 
        projects.name AS project_name, 
        employee_work_status.module_name,
        employee_work_status.working_on
       FROM employee_work_status 
       LEFT JOIN users ON employee_work_status.user_id = users.id
       LEFT JOIN projects ON employee_work_status.project_id = projects.id
       WHERE DATE(login_time) = ?`,
      [today],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      }
    );
  });
};

exports.getWorkingProjects = async () => {
  const today = getGeorgiaDate();

  return new Promise((resolve, reject) => {
    db.query(
      `SELECT 
         projects.name AS project_name, 
         COUNT(employee_work_status.project_id) AS active_projects 
       FROM employee_work_status
       LEFT JOIN projects ON employee_work_status.project_id = projects.id
       WHERE DATE(employee_work_status.login_time) = ? AND employee_work_status.login_status = 1
       GROUP BY employee_work_status.project_id`,
      [today],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);  
        }
      }
    );
  });
};

exports.getAverageWorkingHours = async () => {
  const today = getGeorgiaDate();

  return new Promise((resolve, reject) => {
    db.query(
      `SELECT 
         AVG(TIMESTAMPDIFF(HOUR, login_time, logout_time)) AS average_hours 
       FROM employee_work_status
       WHERE DATE(login_time) = ? AND login_status = 0`,
      [today],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results[0].average_hours);
        }
      }
    );
  });
};

exports.getAllUsers = async () => {
  return new Promise((resolve, reject) => {
    db.query(`SELECT id, full_name FROM users`, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

exports.getTodayModules = async () => {
  const today = getGeorgiaDate();
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT 
         ews.id AS work_status_id,
         ews.module_name,
         u.full_name AS user_name,
         ews.working_on AS working_on,
         ews.worked_on AS last_worked_on,
         ews.status AS status,
         p.name AS project_name,
         esd.id AS document_id,
         esd.file_name,
         esd.uploaded_at
       FROM employee_work_status ews
       LEFT JOIN projects p ON ews.project_id = p.id
       LEFT JOIN users u ON ews.user_id = u.id
       LEFT JOIN employee_status_documents esd ON ews.id = esd.work_status_id
       WHERE DATE(ews.login_time) = ?
       ORDER BY ews.created_at DESC`,
      [today],
      (err, results) => {
        if (err) {
          return reject(err);
        }

        const statusMap = new Map();

        results.forEach((row) => {
          if (!statusMap.has(row.work_status_id)) {
            statusMap.set(row.work_status_id, {
              work_status_id: row.work_status_id,
              module_name: row.module_name,
              user_name: row.user_name,
              working_on: row.working_on,
              last_worked_on: row.last_worked_on,
              status: row.status,
              project_name: row.project_name,
              documents: [],
            });
          }

          if (row.document_id) {
            statusMap.get(row.work_status_id).documents.push({
              id: row.document_id,
              file_name: row.file_name,
              uploaded_at: row.uploaded_at,
            });
          }
        });

        resolve([...statusMap.values()]);
      }
    );
  });
};



exports.getDaywiseReports = async (start_date, end_date, skip, limit) => {
  return new Promise((resolve, reject) => {
    let conditions = [];
    let values = [];

    if (start_date !== "undefined") {
      conditions.push("created_at >= ?");
      values.push(start_date);
    }

    if (end_date !== "undefined") {
      conditions.push("created_at <= ?");
      values.push(end_date);
    }

    let whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    // ✅ Step 1: get dates with pagination
    let dateQuery = `
      SELECT DISTINCT DATE(created_at) AS work_date
      FROM employee_work_status
      ${whereClause}
      ORDER BY work_date DESC
      LIMIT ? OFFSET ?;
    `;

    const safeLimit = Number(limit) || 10;
    const safeSkip = Number(skip) || 0;

    db.query(dateQuery, [...values, safeLimit, safeSkip], (err, dateResults) => {
      if (err) return reject(err);
      if (!dateResults.length) return resolve([]);

      const dates = dateResults.map((r) => r.work_date);

      // ✅ Step 2: get employees for those dates
      let dataQuery = `
        SELECT 
            DATE(ews.created_at) AS work_date,
            u.full_name AS employee_name,
            ews.login_time,
            ews.logout_time,
            TIMESTAMPDIFF(HOUR, ews.login_time, ews.logout_time) AS working_hours
        FROM employee_work_status ews
        LEFT JOIN users u ON ews.user_id = u.id
        WHERE DATE(ews.created_at) IN (?)
        ORDER BY ews.created_at DESC;
      `;

      db.query(dataQuery, [dates], (err, results) => {
        if (err) return reject(err);

        // Group by work_date
        const reportsMap = {};

        results.forEach((row) => {
          if (!reportsMap[row.work_date]) {
            reportsMap[row.work_date] = {
              date: row.work_date,
              employees: []
            };
          }

          reportsMap[row.work_date].employees.push({
            employee_name: row.employee_name || "",
            login_time: row.login_time || "",
            logout_time: row.logout_time || "",
            working_hours: row.working_hours || 0
          });
        });

        resolve(Object.values(reportsMap));
      });
    });
  });
};


exports.getDaywiseReportsCount = async (start_date, end_date) => {
  return new Promise((resolve, reject) => {
    let conditions = [];
    let values = [];

    if (start_date !== "undefined") {
      conditions.push("created_at >= ?");
      values.push(start_date);
    }

    if (end_date !== "undefined") {
      conditions.push("created_at <= ?");
      values.push(end_date);
    }

    let whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    let query = `
      SELECT DATE(created_at) AS work_date
      FROM employee_work_status
      ${whereClause}
      GROUP BY DATE(created_at);
    `;

    db.query(query, values, (err, results) => {
      if (err) return reject(err);

      resolve(results.length);
    });
  });
};


