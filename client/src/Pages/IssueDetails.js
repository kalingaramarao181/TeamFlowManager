import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import "./Styles/IssueDetails.css";
import { deleteIssue, getIssueById } from "../api/issueApi";
import FormView from "../Forms/FormView";
import { getUserDataFromCookies } from "../utils/cookiesData";

const IssueDetails = () => {
  const { issueId } = useParams();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [openForm, setOpenForm] = useState(null);

  const [updateIssueData, setUpdateIssueData] = useState(null);

  const userData = getUserDataFromCookies();

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        setLoading(true);
        const data = await getIssueById(issueId);
        setIssue(data);
      } catch (error) {
        console.error("Error fetching issue:", error);
        alert("Failed to load issue details.");
      } finally {
        setLoading(false);
      }
    };
    if (issueId) fetchIssue();
  }, [issueId]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "green";
      case "In Progress":
        return "orange";
      case "Closed":
        return "red";
      default:
        return "gray";
    }
  };

  const handleDeleteIssue = async () => {
    try {
      const res = await deleteIssue(issueId);
      console.log(res);
      alert(`Issue deleted successfully.`);
      window.location.href = "/dashboard/issues";
    } catch (error) {
      console.error("Error deleting issue:", error);
      alert("Failed to delete issue.");
    }
  }

  if (loading) return <p>Loading issue details...</p>;
  if (!issue) return <p>Issue not found.</p>;

  return (
    <div className="issue-details-page">
      <div className="issue-card-theme">
        <div className="card-header">
          <div
            className="status-border"
            style={{ backgroundColor: getStatusColor(issue.status) }}
          ></div>
          <div className="card-header-content">
            <h4 className="issue-title">{issue.summary}</h4>
            <p className="issue-subtitle">{issue.project_name}</p>
          </div>

          {/* EDIT button */}
          <button
            className="issue-edit-button"
            onClick={() => {
              setOpenForm("issue");
              setUpdateIssueData(issue);
            }}
          >
            <CiEdit />
          </button>
        </div>

        <div className="card-details">
          <p style={{ color: getStatusColor(issue.status) }}>
            <strong>Status:</strong> {issue.status}
          </p>
          <p><strong>Priority:</strong> {issue.priority}</p>
          <p><strong>Assignee:</strong> {issue.assignee_name}</p>
          <p><strong>Created At:</strong> {new Date(issue.created_at).toLocaleDateString()}</p>
        </div>

        {issue.attachment && (
          <div className="card-attachment">
            <a href={issue.attachment} target="_blank" rel="noopener noreferrer">
              View Attachment
            </a>
          </div>
        )}

        <button
          className="remove-issue-button"
          onClick={() => setShowDeletePopup("Delete")}
        >
          Remove Issue <FaTrash />
        </button>
      </div>

      {/* Popup messages removed for simplicity */}

      {showDeletePopup && (
        <div className="user-dashboard-popup">
          <div className="user-dashboard-popup-content">
            <h3>Are you sure you want to Delete "{issue.summary}"?</h3>
            <div className="user-dashboard-popup-actions">
            <button
                className="issue-btn-cancel"
                onClick={() => setShowDeletePopup(false)}
              >
                Cancel
              </button>
              <button className="btn-delete" onClick={handleDeleteIssue}>
                Delete
              </button>
              
            </div>
          </div>
        </div>
      )}

      <FormView
        openForm={openForm}
        setOpenForm={setOpenForm}
        currentUserId={userData.id}
        issueId={issueId}
        updateIssueData={updateIssueData}
      />
    </div>
  );
};

export default IssueDetails;
