import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaTrash } from "react-icons/fa";
import Sidebar from "../Sidebar";
import Header from "../Header";
import { CiEdit } from "react-icons/ci";
import axios from "axios";
import { baseUrl, baseUrlImg } from "../Config/env";
import { getStatusColor } from "../utils/colors";
import { getIssueById } from "../api/issueApi";
import { convertDate } from "../utils/dateFormater";
import "./styles/issueDetails.css";


const IssueDetails = () => {
  const { issueId } = useParams(); // Get issueId from URL
  const [issue, setIssue] = useState(null); // State for a single issue
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [isCollapsed, setIsCollapsed] = useState(false); // Sidebar collapsed state
  const [isPopupOpen, setIsPopupOpen] = useState(false); // Popup open state
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const navigate = useNavigate();
  const [options, setOptions] = useState({
      projects: [],
      issueTypes: [
        { value: "Story", label: "Story" },
        { value: "Task", label: "Task" },
        { value: "Epic", label: "Epic" },
        { value: "Bug", label: "Bug" },
      ],
    }); 

  useEffect(() => {
    const fetchIssueDetails = async () => {
      try {
        // Fetch issue details
        const issueResponse = await getIssueById(37);
        setIssue(issueResponse);
          
      } catch (error) {
        setError("An error occurred while fetching the issue details.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchIssueDetails();
  }, [issueId]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await getIssueById(37); // Replace with your actual API URL
        setIssue(response);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  const handleDeleteIssue = async () => {
    try {
      await axios.delete(`${baseUrl}issues/${issueId}`); 
      navigate("/dashboard");
    } catch (error) {
      console.error("Error deleting issue:", error);
    }
    
  }
  const handleEditIssue = () => {
    setIsPopupOpen(true); // Open the popup
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  if (loading) {
    return <p>Loading issue details...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="issue-details-page">
      <Sidebar onToggleSidebar={toggleSidebar} isCollapsed={isCollapsed} />
      <div className={`issue-details-main-content ${isCollapsed ? "collapsed" : ""}`}>
        <Header />
        <button className="back-button issue-back-button" onClick={() => navigate("/dashboard")}>
          <FaArrowLeft className="back-icon" /> Back to Issues
        </button>

        {issue && (
          <div className="issue-card-theme">
            {/* Card Header */}
            <div className="card-header">
              <div
                className="status-border"
                style={{ backgroundColor: getStatusColor(issue.status) }}
              ></div>
              <div className="card-header-content">
                <h4 className="issue-title">{issue.summary}</h4>
                <p className="issue-subtitle">{issue.project_name}</p>
              </div>
              <button className="issue-edit-button" onClick={handleEditIssue}>
                <CiEdit />
              </button>
            </div>

            {/* Card Details */}
            <div className="card-details">
              <p style={{ color: getStatusColor(issue.status) }}>
                <strong>Status:</strong> {issue.status || "N/A"}
              </p>
              <p>
                <strong>Priority:</strong> {issue.priority || "Medium"}
              </p>
              <p>
                <strong>Assignee:</strong> {issue.assignee_name}
              </p>
              <p>
                <strong>Created At:</strong> {convertDate(issue.created_at)}
              </p>
            </div>

            {/* Attachment Section */}
            {issue.attachment && (
              <div className="card-attachment">
                <a
                  href={`${baseUrlImg}uploads/${issue.attachment}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View Attachment
                </a>
              </div>
            )}
              <button className="remove-issue-button" onClick={() => setShowDeletePopup(true)}>Remove Issue <FaTrash /></button>
          </div>
        )}
      </div>
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
    </div>
  );
};

export default IssueDetails;
