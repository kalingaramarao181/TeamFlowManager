// src/components/IssuesTable.jsx
import React from "react";
import { baseUrlImg } from "../Config/env";
import { useNavigate } from "react-router-dom";
import { getStatusColor } from "../utils/colors";

const Issues = ({ issues }) => {
  const navigate = useNavigate();

  const handleCardClick = (issueId) => {
    navigate(`/dashboard/issues/${issueId}`);
  };

  return (
    <table className="tfm-table">
      <thead>
        <tr>
          <th>Project</th>
          <th>Key</th>
          <th>Summary</th>
          <th>Priority</th>
          <th>Assignee</th>
          <th>Status</th>
          <th>Attachment</th>
        </tr>
      </thead>
      <tbody>
        {issues.map((issue) => (
          <tr key={issue.id}>
            <td>{issue.project_name}</td>
            <td>
              <p
                className="tfm-issue-key"
                onClick={() => handleCardClick(issue.id)}
              >
                {issue.project_key}-{issue.id}
              </p>
            </td>
            <td>{issue.summary}</td>
            <td>{issue.priority || "Medium"}</td>
            <td>{issue.assignee_name || "Unassigned"}</td>
            <td style={{ color: getStatusColor(issue.status) }}>
              {issue.status || "N/A"}
            </td>
            <td>
              {issue.attachment ? (
                <a
                  href={`${baseUrlImg}uploads/${issue.attachment}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View Attachment
                </a>
              ) : (
                "No Attachment"
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Issues;
