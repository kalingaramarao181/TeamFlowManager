import { Editor } from "react-draft-wysiwyg";
import { useState  } from "react";
import { EditorState } from "draft-js";
import "./index.css"
const TeamForm = () => {
    const [formData, setFormData] = useState({
        project: "",
        issueType: "",
        status: "To Do",
        summary: "",
        description: "",
        priority: "Medium",
        team: "",
        labels: "",
        sprint: "",
        linkedIssueType: "blocks",
        linkedIssue: "",
        assignee: "",
        attachment: null,
    });
    return (
        <div className="popup-contents">
            <h2>Team Issue</h2>
            <form>
                {/* Project */}
                <label htmlFor="project">
                    Team Name 
                </label>
                <input
                    type="text"
                    id="summary"
                    name="summary"
                    className="popup-input"
                    placeholder="Enter team name"
                    value={formData.summary}
                />
                <label htmlFor="priority">Project</label>
                <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                >
                    <option value="High">Beedata Analytics</option>
                    <option value="Medium">Ride Ready</option>
                    <option value="Low">Whether Forcecasting</option>
                    <option value="Low">Trace Vision</option>
                    <option value="Low">Tech Strive</option>
                    <option value="Low">Teast Feast</option>
                    <option value="Low">Smart Express</option>
                    <option value="Low">Reco Form</option>
                    <option value="Low">Quick Serve</option>
                    <option value="Low">Kanban</option>
                    <option value="Low">Immiserve</option>
                    <option value="Low">Hello Video streaming</option>
                    <option value="Low">Good Health Management</option>
                    <option value="Low">Go-to-Market</option>
                    <option value="Low">Genius project Management Tool</option>
                    <option value="Low">Fun Fipple</option>
                    <option value="Low">Empconcor</option>
                    <option value="Low">Elearning Management Portel</option>
                    <option value="Low">Echochat</option>      
                    <option value="Low">E2E Tracking</option>      
                    <option value="Low">E-signature</option>      
                    <option value="Low">E-invoice</option>      
                    <option value="Low">Digital rental properties</option>      
                    <option value="Low">Dezi capitol</option>      
                    <option value="Low">Cv Builder</option>      
                    <option value="Low">Creative & Innovative Idea</option>      
                    <option value="Low">Bt Incident Management</option>      
                    <option value="Low">Accountrax</option>      
                    <option value="Low">Auto Rider</option>      

                </select>
                <label htmlFor="priority">Team Members</label>
                 <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                >
                    <option value="Low">RamaRao</option>
                    <option value="Low">Kiran</option> 
                </select>

               
                {/* Attachment */}
                <div className="attachment-wrapper">
                   <input
                            type="file"
                            id="fileInput"
                            className="file-input"
                        />
                </div>

                {/* Actions */}
                <div className="popup-actions">
                    <button className="cancel-btn"  type="button">
                        Cancel
                    </button>
                    <button className="create-btn"  type="button">
                        Create
                    </button>
                </div>
            </form>
            {false && (
                <div className="success-message">
                    🎉 Issue Created Successfully! 💥
                </div>
            )}
            {false && (
                <div className="error-message">❌ errorMessage 🚨</div>
            )}
        </div>)
}

export default TeamForm;