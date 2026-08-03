import React, { useState } from "react";
import "./DailyStatusUpdate.css";

const DailyStatusUpdate = () => {
  const [status, setStatus] = useState("offline");
  const [project, setProject] = useState("");
  const [report, setReport] = useState("");
  const [document, setDocument] = useState(null);
  const [updates, setUpdates] = useState([]);

  const handleSubmit = () => {
    const newUpdate = {
      time: new Date().toLocaleString(),
      status,
      project,
      report,
      document: document?.name || "No document",
    };
    setUpdates([newUpdate, ...updates]);
    // Reset
    setStatus("offline");
    setProject("");
    setReport("");
    setDocument(null);
  };

  return (
    <div className="daily-status-container">
      <h2 className="daily-status-title">Daily Work Update</h2>

      <div className="status-cards">
        <button
          className={`status-card ${status === "online" ? "active" : ""}`}
          onClick={() => setStatus("online")}
        >
          🔵 Login to Work
        </button>
        <button
          className={`status-card ${status === "working" ? "active" : ""}`}
          onClick={() => setStatus("working")}
        >
          🛠️ Working on Project
        </button>
        <button
          className={`status-card ${status === "completed" ? "active" : ""}`}
          onClick={() => setStatus("completed")}
        >
          ✅ Work Completed
        </button>
      </div>

      {status !== "offline" && (
        <div className="work-section">
          <div className="field">
            <label>Project:</label>
            <select value={project} onChange={(e) => setProject(e.target.value)}>
              <option value="">Select Project</option>
              <option value="TeamFlow">TeamFlow</option>
              <option value="OrderSwift">OrderSwift</option>
              <option value="Mockup AI">Mockup AI</option>
            </select>
          </div>

          <div className="field">
            <label>Working Report:</label>
            <textarea
              rows="4"
              value={report}
              placeholder="Describe your work for today..."
              onChange={(e) => setReport(e.target.value)}
            ></textarea>
          </div>

          <div className="field">
            <label>Attach Document:</label>
            <input type="file" onChange={(e) => setDocument(e.target.files[0])} />
          </div>

          <button className="submit-btn" onClick={handleSubmit}>
            Submit Update
          </button>
        </div>
      )}

      <div className="updates-list">
        <h3>Today's Updates</h3>
        {updates.length === 0 ? (
          <p>No updates yet.</p>
        ) : (
          updates.map((item, idx) => (
            <div key={idx} className="update-card">
              <div><strong>Status:</strong> {item.status}</div>
              <div><strong>Project:</strong> {item.project}</div>
              <div><strong>Report:</strong> {item.report}</div>
              <div><strong>Document:</strong> {item.document}</div>
              <div><em>{item.time}</em></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DailyStatusUpdate;
