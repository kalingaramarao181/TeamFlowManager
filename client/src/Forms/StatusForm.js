import { Editor } from "react-draft-wysiwyg";
import { useState } from "react";
import { EditorState } from "draft-js";
import "./index.css"
const StatusForm = () => {
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
            <h2>Status Issue</h2>
            <form>

                <div className="attachment-wrapper">
                    <label>Attachment</label>
                    <div className="attachment-box">
                        <p>
                            📁 Drop files to attach or{" "}
                            <span className="browse">Browse</span>
                        </p>
                        <input
                            type="file"
                            id="fileInput"
                            className="file-input"
                        />
                    </div>

                </div>

                <input
                    type="text"
                    id="summary"
                    name="summary"
                    className="popup-input"
                    placeholder="Enter your status text"
                    value={formData.summary}
                />

                {/* Actions */}
                <div className="popup-actions">
                    <button className="cancel-btn" type="button">
                        Cancel
                    </button>
                    <button className="create-btn" type="button">
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

export default StatusForm;