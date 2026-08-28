const express = require("express");
const db = require("../Config/connection");
const router = express.Router();
require("dotenv").config();
const { protect, authorizeResource } = require("../middlewares/authMiddleware");

const normalizeTeamMembers = (members) => {
  if (!members) return [];
  if (Array.isArray(members)) return members.map(String);
  if (typeof members === "string") {
    try {
      const parsed = JSON.parse(members);
      return Array.isArray(parsed) ? parsed.map(String) : [String(parsed)];
    } catch (error) {
      return members.split(",").map((item) => item.trim()).filter(Boolean).map(String);
    }
  }
  return [];
};

router.post("/teams", protect, authorizeResource("teams", "can_create"), (req, res) => {
  const { team_name, description, project_id, team_members, created_by, team_lead } = req.body;

  if (!team_name || !project_id || !team_members || !created_by) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const members = normalizeTeamMembers(team_members);
  const leadUserId = team_lead || (members[0] ?? null);
  const updated_by = created_by;
  const teamMembersJSON = JSON.stringify(members);

  const sql = `INSERT INTO teams (team_name, description, project_id, team_members, created_by, updated_by, team_lead) 
               VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    sql,
    [team_name, description, project_id, teamMembersJSON, created_by, updated_by, leadUserId],
    (err, result) => {
      if (err) {
        console.error("Error inserting team:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.status(201).json({
        message: "Team created successfully",
        team_id: result.insertId,
        team_lead: leadUserId,
      });
    }
  );
});

router.get("/teams", protect, authorizeResource("teams"), (req, res) => {
  const { project_id } = req.query;
  let sql = "SELECT * FROM teams";
  const values = [];

  if (project_id) {
    sql += " WHERE project_id = ?";
    values.push(project_id);
  }

  sql += " ORDER BY created_at DESC";

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error("Error fetching teams:", err);
      return res.status(500).json({ error: "Database error" });
    }

    const teams = results.map((team) => ({
      ...team,
      team_members: team.team_members ? JSON.parse(team.team_members) : [],
    }));

    res.status(200).json({ teams });
  });
});

router.patch("/teams/:teamId/lead", protect, authorizeResource("teams", "can_assign"), (req, res) => {
  const { teamId } = req.params;
  const { team_lead } = req.body;

  if (!team_lead) {
    return res.status(400).json({ error: "Team lead is required" });
  }

  db.query(
    "UPDATE teams SET team_lead = ?, updated_by = ? WHERE id = ?",
    [team_lead, team_lead, teamId],
    (err) => {
      if (err) {
        console.error("Error updating team lead:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.status(200).json({ message: "Team lead updated successfully" });
    }
  );
});

module.exports = router;

