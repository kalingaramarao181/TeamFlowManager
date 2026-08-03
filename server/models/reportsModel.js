const db = require("../Config/connection");
const Report = {
  getAllReports: (skip, limit, startDate, endDate, userType) => {
    console.log("Fetching reports with params:", { skip, limit, startDate, endDate, userType });
    
    return new Promise((resolve, reject) => {
      let conditions = [];
      let values = [];

      if (startDate) {
        conditions.push("reports.createdAt >= ?");
        values.push(startDate);
      }

      if (endDate) {
        conditions.push("reports.createdAt <= ?");
        values.push(endDate);
      }

      let whereClause = conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

      let groupBy = userType === "unique" ? "GROUP BY reports.userId" : "";

      const query = `
      SELECT reports.*, users.full_name AS user_name
      FROM reports
      LEFT JOIN users ON reports.userId = users.id
      ${whereClause}
      ${groupBy}
      ORDER BY reports.createdAt DESC
      LIMIT ? OFFSET ?
    `;

      values.push(limit, skip);

      db.query(query, values, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  },

  getReportsCount: (startDate, endDate, userType) => {
    return new Promise((resolve, reject) => {
      let conditions = [];
      let values = [];

      if (startDate) {
        conditions.push("createdAt >= ?");
        values.push(startDate);
      }

      if (endDate) {
        conditions.push("createdAt <= ?");
        values.push(endDate);
      }

      let whereClause = conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";
      let query = "";

      if (userType === "unique") {
        query = `
        SELECT COUNT(DISTINCT userId) AS count FROM reports ${whereClause}
      `;
      } else {
        query = `
        SELECT COUNT(*) AS count FROM reports ${whereClause}
      `;
      }

      db.query(query, values, (err, result) => {
        if (err) reject(err);
        else resolve(result[0].count);
      });
    });
  },



  getReportsByUserId: (user_id, skip, limit) => {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT * FROM reports WHERE userId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
        [user_id, limit, skip],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  },

  getReportsCountByUserId: (user_id) => {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT COUNT(*) AS count FROM reports WHERE userId = ?`,
        [user_id],
        (err, result) => {
          if (err) reject(err);
          else resolve(result[0].count);
        }
      );
    });
  },

  createReport: (userId, reportText, reportImage) => {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO reports (userId, reportText, reportImage) VALUES (?, ?, ?)`;
      db.query(query, [userId, reportText, reportImage], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  },
};

module.exports = Report;
