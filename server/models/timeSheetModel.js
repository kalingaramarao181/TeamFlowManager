const db = require("../Config/connection");
const { formatDate } = require("../utils/dateUtils");
const { getWeekDatesFromWeekNumber } = require("../utils/weekUtils");

exports.saveWeeklyTimesheet = (data) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO weekly_timesheets
      (user_id, week_no, year, entry_type,
       project_id, task_name, worked_on,
       mon_hours, tue_hours, wed_hours, thu_hours,
       fri_hours, sat_hours, sun_hours,
       total_hours)
      VALUES ?
    `;

    // Convert rows into bulk insert format
    const values = data.entries.map((row) => {
      const total =
        Number(row.mon) +
        Number(row.tue) +
        Number(row.wed) +
        Number(row.thu) +
        Number(row.fri) +
        Number(row.sat) +
        Number(row.sun);

      return [
        data.user_id,
        data.week_no,
        data.year,
        row.entry_type || "project",
        row.project_id || null,
        row.task_name,
        row.worked_on,

        row.mon,
        row.tue,
        row.wed,
        row.thu,
        row.fri,
        row.sat,
        row.sun,

        total,
      ];
    });

    db.query(query, [values], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

exports.getExistingWeekStatus = (userId, weekNo, year) =>
  new Promise((resolve, reject) => {
    db.query(
      `SELECT status, COUNT(*) row_count FROM weekly_timesheets
       WHERE user_id = ? AND week_no = ? AND year = ?
       GROUP BY status LIMIT 1`,
      [userId, weekNo, year],
      (err, rows) => err ? reject(err) : resolve(rows[0] || null)
    );
  });

exports.deleteRejectedWeek = (userId, weekNo, year) =>
  new Promise((resolve, reject) => {
    db.query(
      `DELETE FROM weekly_timesheets
       WHERE user_id = ? AND week_no = ? AND year = ? AND status = 'Rejected'`,
      [userId, weekNo, year],
      (err, result) => err ? reject(err) : resolve(result)
    );
  });

exports.validateProjectIds = (projectIds) =>
  new Promise((resolve, reject) => {
    db.query(
      `SELECT id FROM projects WHERE id IN (?)`,
      [projectIds],
      (err, rows) => err ? reject(err) : resolve(rows.map((row) => Number(row.id)))
    );
  });

exports.getUserSummary = (userId) =>
  new Promise((resolve, reject) => {
    db.query(
      `SELECT
        COUNT(DISTINCT CONCAT(year, '-', week_no)) total,
        COUNT(DISTINCT CASE WHEN status = 'Pending' THEN CONCAT(year, '-', week_no) END) pending,
        COUNT(DISTINCT CASE WHEN status = 'Approved' THEN CONCAT(year, '-', week_no) END) approved,
        COUNT(DISTINCT CASE WHEN status = 'Rejected' THEN CONCAT(year, '-', week_no) END) rejected,
        COALESCE(SUM(CASE WHEN week_no = WEEK(CURRENT_DATE(), 1) AND year = YEAR(CURRENT_DATE())
          THEN total_hours ELSE 0 END), 0) current_week_hours
       FROM weekly_timesheets WHERE user_id = ?`,
      [userId],
      (err, rows) => err ? reject(err) : resolve(rows[0])
    );
  });

exports.getWeeklyTimesheet = (userId, weekNo, year) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT COALESCE(p.name, CASE t.entry_type WHEN 'leave' THEN 'Leave' WHEN 'training' THEN 'Training' ELSE 'Project' END) AS project_name, t.*
      FROM weekly_timesheets t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE user_id = ?
        AND week_no = ?
        AND year = ?
      ORDER BY created_at ASC
    `;

    db.query(query, [userId, weekNo, year], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

exports.getWorkbyWeekNumber = (userId, week, year) => {
  return new Promise((resolve, reject) => {
    const { week_start, week_end } = getWeekDatesFromWeekNumber(week, year);

    const query = `
      SELECT 
    E.status,
    E.login_time,
    E.working_on, 
    E.worked_on,

    P.name AS project_name,
    E.module_name AS task_name

FROM employee_work_status E

JOIN projects P 
    ON E.project_id = P.id

WHERE E.user_id = ?
  AND DATE(E.created_at) BETWEEN ? AND ?

ORDER BY E.created_at ASC;
    `;

    db.query(query, [userId, week_start, week_end], (err, results) => {
      if (err) reject(err);
      else
        resolve({
          week_start,
          week_end,
          work_status: results,
        });
    });
  });
};


exports.getWeeklyReports = (page, limit, filters = {}) => {
  return new Promise((resolve, reject) => {
    const offset = (page - 1) * limit;
    const { name, weekNo, year, status, projectId } = filters;

    let filterConditions = [];
    let queryParams = [];
    let countParams = [];

    // Filter by name
    if (name) {
      filterConditions.push(`U.full_name LIKE ?`);
      queryParams.push(`%${name}%`);
      countParams.push(`%${name}%`);
    }

    // Filter by week number
    if (weekNo) {
      filterConditions.push(`W.week_no = ?`);
      queryParams.push(weekNo);
      countParams.push(weekNo);
    }
    if (year) {
      filterConditions.push(`W.year = ?`);
      queryParams.push(year);
      countParams.push(year);
    }
    if (status) {
      filterConditions.push(`W.status = ?`);
      queryParams.push(status);
      countParams.push(status);
    }
    if (projectId) {
      filterConditions.push(`W.project_id = ?`);
      queryParams.push(projectId);
      countParams.push(projectId);
    }

    const whereClause =
      filterConditions.length > 0
        ? `WHERE ${filterConditions.join(" AND ")}`
        : "";

    // ? Main Query (Fix for ONLY_FULL_GROUP_BY)
    const query = `
      SELECT 
        MIN(W.id) id,
        W.user_id,
        U.full_name AS name,
        W.week_no,
        W.year,
        GROUP_CONCAT(DISTINCT W.worked_on ORDER BY W.id SEPARATOR ' | ') worked_on,
        MAX(W.status) status,
        SUM(W.total_hours) total_hours,
        COUNT(*) entry_count,
        GROUP_CONCAT(DISTINCT COALESCE(P.name, CASE W.entry_type WHEN 'leave' THEN 'Leave' WHEN 'training' THEN 'Training' ELSE 'Project' END) ORDER BY COALESCE(P.name, W.entry_type) SEPARATOR ', ') projects,
        MAX(W.created_at) created_at
      FROM weekly_timesheets W
      JOIN users U ON W.user_id = U.id
      LEFT JOIN projects P ON W.project_id = P.id
      ${whereClause}
      GROUP BY W.user_id, U.full_name, W.week_no, W.year
      ORDER BY MAX(W.created_at) DESC
      LIMIT ? OFFSET ?
    `;

    // ? Count Query (Counts grouped weekly records correctly)
    const countQuery = `
      SELECT COUNT(*) AS total FROM (
          SELECT W.user_id, W.week_no, W.year
          FROM weekly_timesheets W
          JOIN users U ON W.user_id = U.id
          LEFT JOIN projects P ON W.project_id = P.id
          ${whereClause}
          GROUP BY W.user_id, W.week_no, W.year
      ) AS grouped
    `;

    db.query(countQuery, countParams, (err, countRes) => {
      if (err) return reject(err);

      db.query(
        query,
        [...queryParams, limit, offset],
        (err, results) => {
          if (err) return reject(err);

          const formattedReports = results.map((r) => {
            const { week_start, week_end } =
              getWeekDatesFromWeekNumber(r.week_no, r.year);

            return {
              ...r,
              week_start,
              week_end,
              week_label: `${r.week_no}th Week, ${formatDate(
                week_start
              )} - ${formatDate(week_end)}, ${r.year}`,
            };
          });

          resolve({
            total: countRes[0].total,
            reports: formattedReports,
          });
        }
      );
    });
  });
};

exports.getAdminSummary = () => new Promise((resolve, reject) => {
  const query = `
    SELECT
      (SELECT COUNT(*) FROM users) total_employees,
      COUNT(DISTINCT CONCAT(W.user_id, '-', W.year, '-', W.week_no)) total_submissions,
      COUNT(DISTINCT CASE WHEN W.status = 'Pending' THEN CONCAT(W.user_id, '-', W.year, '-', W.week_no) END) pending,
      COUNT(DISTINCT CASE WHEN W.status = 'Approved' THEN CONCAT(W.user_id, '-', W.year, '-', W.week_no) END) approved,
      COUNT(DISTINCT CASE WHEN W.status = 'Rejected' THEN CONCAT(W.user_id, '-', W.year, '-', W.week_no) END) rejected,
      COUNT(DISTINCT CASE WHEN DATE(W.created_at) = CURRENT_DATE() THEN W.user_id END) submitted_today,
      COALESCE(SUM(CASE WHEN W.week_no = WEEK(CURRENT_DATE(), 1) AND W.year = YEAR(CURRENT_DATE()) THEN W.total_hours ELSE 0 END), 0) weekly_hours,
      COALESCE(SUM(CASE WHEN MONTH(W.created_at) = MONTH(CURRENT_DATE()) AND YEAR(W.created_at) = YEAR(CURRENT_DATE()) THEN W.total_hours ELSE 0 END), 0) monthly_hours,
      COALESCE((SELECT SUM(GREATEST(weekly_total - 40, 0)) FROM (
        SELECT SUM(total_hours) weekly_total FROM weekly_timesheets
        GROUP BY user_id, year, week_no
      ) weekly_totals), 0) overtime_hours,
      GREATEST((SELECT COUNT(*) FROM users) -
        COUNT(DISTINCT CASE WHEN W.week_no = WEEK(CURRENT_DATE(), 1) AND W.year = YEAR(CURRENT_DATE()) THEN W.user_id END), 0) missing_current_week
    FROM weekly_timesheets W`;
  db.query(query, (err, rows) => err ? reject(err) : resolve(rows[0]));
});

exports.getAdminTimesheetDetail = (timesheetId) => new Promise((resolve, reject) => {
  const query = `
    SELECT W.*, U.full_name AS employee_name, U.email, COALESCE(P.name, CASE W.entry_type WHEN 'leave' THEN 'Leave' WHEN 'training' THEN 'Training' ELSE 'Project' END) AS project_name
    FROM weekly_timesheets W
    JOIN weekly_timesheets source ON source.id = ?
      AND W.user_id = source.user_id AND W.week_no = source.week_no AND W.year = source.year
    JOIN users U ON U.id = W.user_id
    LEFT JOIN projects P ON P.id = W.project_id
    ORDER BY W.created_at ASC`;
  db.query(query, [timesheetId], (err, rows) => err ? reject(err) : resolve(rows));
});




exports.getTimesheetStatus = (timesheetId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT status 
      FROM weekly_timesheets
      WHERE id = ?
      LIMIT 1
    `;

    db.query(query, [timesheetId], (err, results) => {
      if (err) reject(err);
      else resolve(results[0]);
    });
  });
};


exports.updateTimesheetStatus = (timesheetId, status) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE weekly_timesheets target
      JOIN weekly_timesheets source ON source.id = ?
      SET target.status = ?
      WHERE target.user_id = source.user_id
        AND target.week_no = source.week_no
        AND target.year = source.year
    `;

    db.query(query, [timesheetId, status], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

exports.getAttendanceByWeekNumber = (userId, week, year) => {
  return new Promise((resolve, reject) => {
    const { week_start, week_end } = getWeekDatesFromWeekNumber(week, year);

    const query = `
      SELECT 
        DATE(created_at) AS workDate,
        status,
        login_time,
        logout_time,
        working_on,
        worked_on
      FROM employee_work_status
      WHERE user_id = ?
        AND DATE(created_at) BETWEEN ? AND ?
      ORDER BY created_at ASC
    `;

    db.query(query, [userId, week_start, week_end], (err, results) => {
      if (err) reject(err);
      else
        resolve({
          week_start,
          week_end,
          attendance: results,
        });
    });
  });
};
