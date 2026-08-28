const mysql = require('mysql');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Beedata@2024',
  database: process.env.DB_NAME || 'team_flow_manager',
  charset: 'utf8mb4',
  multipleStatements: true,
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message || err);
  } else {
    console.log('Connected to the database');
  }
});

db.on('error', (err) => {
  console.error('Database connection error:', err.message || err);
});

module.exports = db;
