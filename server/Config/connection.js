const mysql = require('mysql');
require('dotenv').config();

const db = mysql.createConnection({
    host: 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: "root",
    password: "",
    database: 'team_flow_manager',
    charset: 'utf8mb4'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Connected to the database');
    }
});

module.exports = db;
