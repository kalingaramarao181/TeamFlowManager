const express = require("express");
const db = require("../Config/connection");
const router = express.Router();
require("dotenv").config();

// Endpoint to create a new team
router.post("/teams", (req, res) => {
  const { team_name, description, project_id, team_members, created_by } = req.body;
  console.log(created_by);
  

  if (!team_name || !project_id || !team_members || !created_by) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const updated_by = created_by;
  const teamMembersJSON = JSON.stringify(team_members);

  const sql = `INSERT INTO teams (team_name, description, project_id, team_members, created_by, updated_by) 
                 VALUES (?, ?, ?, ?, ?, ?)`;

  db.query(
    sql,
    [team_name, description, project_id, teamMembersJSON, created_by, updated_by],
    (err, result) => {
      if (err) {
        console.error("Error inserting team:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.status(201).json({
        message: "Team created successfully",
        team_id: result.insertId,
      });
    }
  );
});

// Endpoint to fetch all teams
router.get("/teams", (req, res) => {
  const sql = "SELECT * FROM teams";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching teams:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(200).json({ teams: results });
  });
});

module.exports = router;
