const db = require("../Config/connection");
const bcrypt = require("bcryptjs");
const User = {
  createUser: async (name, email, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    return new Promise((resolve, reject) => {
      db.query(
        `INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)`,
        [name, email, hashedPassword],
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        }
      );
    });
  },
  findByEmail: (email) => {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT * FROM users WHERE email = ?`,
        [email],
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
  findEmailById: (userId) => {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT email FROM users WHERE id = ?`,
        [userId],
        (err, result) => {
          if (err) {
            reject(err);
          } else if (result.length === 0) {
            resolve(null);
          } else {
            resolve(result[0].email);
          }
        }
      );
    });
  },

  getUsers: async () => {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT full_name AS userName, id AS userId FROM users`,
        (err, result) => {
          if (err) {
            reject(err);
          } else if (result.length === 0) {
            resolve(null);
          } else {
            resolve(result);
          }
        }
      );
    });
  },
  
  findById: (userId) => {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT * FROM users
                 WHERE id = ?`,
        [userId],
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
  updateUserPassword: (email,  hashedPassword) => {
    return new Promise((resolve, reject) => {
      db.query(
        `UPDATE users SET password = ? WHERE email = ?`,
        [hashedPassword, email],
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        }
      );
    });
  },
  findAllUsers: () => {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT users.*, roles.name as role FROM users 
                 JOIN roles ON users.role_id = roles.id`,
        (err, result) => {
          if (err) {
            reject(err);
          } else if (result.length === 0) {
            resolve(null);
          } else {
            resolve(result);
          }
        }
      );
    });
  },


  getAllUsers: (skip, limit, search) => {
    return new Promise((resolve, reject) => {
      const searchPattern = `%${search}%`;
      const query = `
      SELECT * FROM users 
      WHERE full_name LIKE ? OR email LIKE ? OR role LIKE ?
      LIMIT ? OFFSET ?
    `;
      db.query(
        query,
        [searchPattern, searchPattern, searchPattern, limit, skip],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  },

  getUsersCount: (search) => {
    return new Promise((resolve, reject) => {
      const searchPattern = `%${search}%`;
      const query = `
      SELECT COUNT(*) AS count FROM users 
      WHERE full_name LIKE ? OR email LIKE ? OR role LIKE ?
    `;
      db.query(
        query,
        [searchPattern, searchPattern, searchPattern],
        (err, result) => {
          if (err) reject(err);
          else resolve(result[0].count);
        }
      );
    });
  },
};

module.exports = User;
