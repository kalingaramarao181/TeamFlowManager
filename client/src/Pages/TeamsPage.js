import React, { useEffect, useState } from "react";
import { getTeams } from "../api/teamApi";

const TeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const data = await getTeams();
        setTeams(data);
      } finally {
        setLoading(false);
      }
    };

    loadTeams();
  }, []);

  return (
    <main className="project-panel">
      <h2>Teams</h2>
      {loading ? <p>Loading teams...</p> : null}
      {!loading && !teams.length ? <p>No teams found.</p> : null}
      <div className="project-team-grid">
        {teams.map((team) => (
          <article key={team.id} className="project-panel">
            <h3>{team.team_name}</h3>
            <p>{team.description || "No team description"}</p>
            <small>Project ID: {team.project_id}</small>
            <div>
              <strong>Lead:</strong> {team.team_lead || "Not assigned"}
            </div>
            <div>
              <strong>Members:</strong>
              <ul>
                {(team.team_members || []).map((member) => <li key={member}>{member}</li>)}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
};

export default TeamsPage;
