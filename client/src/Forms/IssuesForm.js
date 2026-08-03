import { Editor } from "react-draft-wysiwyg";
import { useState, useEffect } from "react";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { EditorState, ContentState } from "draft-js";
import "./index.css";
import { getProjects } from "../api/projectsApi";
import htmlToDraft from "html-to-draftjs";

import { getUsers } from "../api/usersApi";
import { getUserDataFromCookies } from "../utils/cookiesData";
import { createIssue, updateIssue } from "../api/issueApi";

const IssuesForm = ({ setOpenForm, updateIssueData, issueId }) => {
  const [projects, setProjects] = useState([]);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [users, setUsers] = useState([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const isEdit = !!updateIssueData;


  const [formData, setFormData] = useState({
    projectId: "",
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

  const userData = getUserDataFromCookies();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectsData = await getProjects();
        const usersData = await getUsers();
        setProjects(projectsData);
        setUsers(usersData);
      } catch (err) {
        console.error("Error fetching form data:", err);
      }
    };

    fetchData();
  }, []);

  // Pre-fill in edit mode
  useEffect(() => {
    if (isEdit && updateIssueData) {
      setFormData({
        projectId: updateIssueData.project || "",
        issueType: updateIssueData.issue_type || "",
        status: updateIssueData.status || "To Do",
        summary: updateIssueData.summary || "",
        description: updateIssueData.description || "",
        priority: updateIssueData.priority || "Medium",
        team: updateIssueData.team || "",
        labels: updateIssueData.labels || "",
        sprint: updateIssueData.sprint || "",
        linkedIssueType: updateIssueData.linked_issue_type || "blocks",
        linkedIssue: updateIssueData.linked_issue || "",
        assignee: updateIssueData.assignee || "",
        attachment: null,
      });

      if (updateIssueData.description) {
        const blocksFromHtml = htmlToDraft(updateIssueData.description);
        const { contentBlocks, entityMap } = blocksFromHtml;
        const contentState = ContentState.createFromBlockArray(
          contentBlocks,
          entityMap
        );
        setEditorState(EditorState.createWithContent(contentState));
      }
    }
  }, [isEdit, updateIssueData]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      const numericFields = ["projectId", "assignee"];
      const finalValue = numericFields.includes(name) ? Number(value) : value;
      console.log(editorState);
      
      setFormData((prev) => ({ ...prev, [name]: finalValue }));
    }
  };

  const handleAssignee = () => {
    setFormData((prev) => ({ ...prev, assignee: userData.id }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSuccess("");
      setError("");

      const fd = new FormData();
      Object.keys(formData).forEach((key) => fd.append(key, formData[key]));

      let res;

      if (isEdit) {
        res = await updateIssue(updateIssueData.id, fd);
        setSuccess("Issue Updated Successfully!");
      } else {
        res = await createIssue(formData);
        setSuccess("Issue Created Successfully!", res);
      }

      setSuccess("🎉 Issue Created Successfully! 💥");

      // Reset form
      setFormData({
        projectId: "",
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
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <div className="tfm-from-contents">
      <h2 className="tfm-form-title">Create Issue</h2>
      <form className="tfm-form" onSubmit={handleSubmit}>
        {/* Project */}
        <label className="tfm-form-label" htmlFor="projectId">
          Project <span className="required">*</span>
        </label>
        <select
          className="tfm-form-select"
          name="projectId"
          value={formData.projectId}
          onChange={handleChange}
          required
        >
          <option value="">Select Project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.projectName} ({project.projectKey})
            </option>
          ))}
        </select>

        {/* Issue Type */}
        <label className="tfm-form-label" htmlFor="issueType">
          Issue Type <span className="required">*</span>
        </label>
        <select
          id="issueType"
          name="issueType"
          className="tfm-form-select"
          value={formData.issueType}
          onChange={handleChange}
          required
        >
          <option value="">Select Issue Type</option>
          <option value="story">Story</option>
          <option value="task">Task</option>
          <option value="epic">Epic</option>
          <option value="bug">Bug</option>
        </select>

        {/* Status */}
        <label className="tfm-form-label" htmlFor="status">
          Status
        </label>
        <select
          id="status"
          name="status"
          className="tfm-form-select"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>

        {/* Summary */}
        <label className="tfm-form-label" htmlFor="summary">
          Summary <span className="required">*</span>
        </label>
        <input
          type="text"
          id="summary"
          name="summary"
          className="tfm-form-input"
          placeholder="Enter issue summary"
          value={formData.summary}
          onChange={handleChange}
          required
        />

        {/* Description */}
        <label className="tfm-form-label" htmlFor="description">
          Description
        </label>
        <Editor
          wrapperClassName="tfm-editor-wrapper"
          editorClassName="tfm-editor-content"
          toolbar={{
            options: ["inline", "blockType", "list", "link", "emoji"],
            inline: { options: ["bold", "italic", "underline"] },
          }}
        />

        {/* Priority */}
        <label className="tfm-form-label" htmlFor="priority">
          Priority
        </label>
        <select
          id="priority"
          className="tfm-form-select"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
        >
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        {/* Team */}
        <label className="tfm-form-label" htmlFor="team">
          Team
        </label>
        <select
          id="team"
          name="team"
          className="tfm-form-select"
          value={formData.team}
          onChange={handleChange}
        >
          <option value="">Select Team</option>
        </select>

        {/* Linked Issues Type */}
        <label className="tfm-form-label">Linked Issues Type</label>
        <select
          name="linkedIssueType"
          value={formData.linkedIssueType}
          onChange={handleChange}
          className="tfm-form-select"
        >
          <option value="blocks">Blocks</option>
          <option value="is blocked by">Is Blocked By</option>
          <option value="relates to">Relates To</option>
        </select>

        {/* Linked Issues */}
        <label className="tfm-form-label">Linked Issues</label>
        <select
          name="linkedIssue"
          value={formData.linkedIssue}
          onChange={handleChange}
          className="tfm-form-select"
        >
          <option value="">Select Issue</option>
          <option value="Issue-1">Issue 1</option>
          <option value="Issue-2">Issue 2</option>
        </select>

        {/* Assignee */}
        <label className="tfm-form-label" htmlFor="assignee">
          Assignee
        </label>
        <select
          id="assignee"
          name="assignee"
          value={formData.assignee}
          onChange={handleChange}
          className="tfm-form-select"
        >
          <option value="">Select Assignee</option>
          {users.map((user) => (
            <option key={user.userId} value={user.userId}>
              {user.userName}
            </option>
          ))}
        </select>

        {!formData.assignee && (
          <button
            type="button"
            onClick={handleAssignee}
            className="tfm-assign-btn"
          >
            Assign to me
          </button>
        )}

        {/* Attachment */}
        <div className="tfm-attachment-wrapper">
          <label className="tfm-form-label">Attachment</label>
          <div className="tfm-attachment-box">
            <p>
              📁 Drop files to attach or <span className="browse">Browse</span>
            </p>
            <input
              type="file"
              id="fileInput"
              name="attachment"
              className="tfm-file-input"
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="tfm-form-actions">
          <button className="tfm-form-cancel-btn" type="button">
            Cancel
          </button>
          <button className="tfm-form-create-btn" type="submit">
            Create
          </button>
        </div>
      </form>

      {/* Animated Success Popup */}
      {success && (
        <div className="tfm-popup-message success">
          🎉 Issue Created Successfully!
        </div>
      )}

      {/* Animated Error Popup */}
      {error && <div className="tfm-popup-message error">{error}</div>}
    </div>
  );
};

export default IssuesForm;
