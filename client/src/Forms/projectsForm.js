import { Editor } from "react-draft-wysiwyg";
import { useEffect, useState } from "react";
import { EditorState, convertToRaw, ContentState } from "draft-js";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";
import { getUsers } from "../api/usersApi";
import { createProject, updateProject } from "../api/projectsApi";
import "./index.css";

const ProjectForm = ({ setOpenForm, updateProjectData, projectId }) => {
  const isEdit = !!updateProjectData;

  const [users, setUsers] = useState([]);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [attachment, setAttachment] = useState(null);
  const [formData, setFormData] = useState({
    projectName: "",
    projectKey: "",
    projectType: "",
    lead: "", // store userId here
    url: "",
  });

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Fetch users for dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getUsers();
        setUsers(response);
        console.log(response);
        
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  // Pre-fill in edit mode
  useEffect(() => {
    if (isEdit && updateProjectData) {
      setFormData({
        projectName: updateProjectData.name || "",
        projectKey: updateProjectData.projectKey || "",
        projectType: updateProjectData.type || "",
        lead: updateProjectData.leadId || "", // ✅ use leadId, not name
        url: updateProjectData.projectURL || "",
      });

      if (updateProjectData.description) {
        const blocksFromHtml = htmlToDraft(updateProjectData.description);
        const { contentBlocks, entityMap } = blocksFromHtml;
        const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
        setEditorState(EditorState.createWithContent(contentState));
      }
    }
  }, [isEdit, updateProjectData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setAttachment(file);
  };

  const resetForm = () => {
    setFormData({
      projectName: "",
      projectKey: "",
      projectType: "",
      lead: "",
      url: "",
    });
    setEditorState(EditorState.createEmpty());
    setAttachment(null);
  };

  const handleSubmit = async () => {
    const descriptionHtml = draftToHtml(convertToRaw(editorState.getCurrentContent()));

    const data = new FormData();
    data.append("projectName", formData.projectName);
    data.append("projectKey", formData.projectKey);
    data.append("projectType", formData.projectType);
    data.append("lead", formData.lead); // ✅ sends userId to backend
    data.append("url", formData.url);
    data.append("description", descriptionHtml);
    if (attachment) {
      data.append("projectLogo", attachment);
    }

    console.log(formData);
    

    try {
      if (isEdit) {
        await updateProject(projectId, data);
      } else {
        await createProject(data);
      }

      setSuccess(true);
      setError("");
      resetForm();

      setTimeout(() => {
        setSuccess(false);
        setOpenForm(null);
      }, 3000);
    } catch (err) {
      setError(`❌ Something went wrong while ${isEdit ? "updating" : "creating"} the project.`);
      setSuccess(false);
      setTimeout(() => setError(""), 3000);
    }
  };

  

  return (
    <div className="tfm-from-contents">
      <h2 className="tfm-form-title">{isEdit ? "Update Project" : "Create Project"}</h2>
      <form className="tfm-form" onSubmit={(e) => e.preventDefault()}>
        <label className="tfm-form-label">Project Name</label>
        <input
          type="text"
          name="projectName"
          className="tfm-form-input"
          placeholder="Enter project name"
          value={formData.projectName}
          onChange={handleInputChange}
        />

        <div className="tfm-attachment-wrapper">
          <label className="tfm-form-label">Project Logo</label>
          <div className="tfm-attachment-box">
            <p>
              📁 Drop files to attach or <span className="browse">Browse</span>
            </p>
            <input type="file" className="tfm-file-input" onChange={handleFileChange} />
          </div>
        </div>

        <label className="tfm-form-label">Project Key</label>
        <input
          type="text"
          name="projectKey"
          className="tfm-form-input"
          placeholder="Enter project key"
          value={formData.projectKey}
          onChange={handleInputChange}
        />

        <label className="tfm-form-label">Project Type</label>
        <input
          type="text"
          name="projectType"
          className="tfm-form-input"
          placeholder="Enter project type"
          value={formData.projectType}
          onChange={handleInputChange}
        />

        <label className="tfm-form-label">Project Lead</label>
        <select
          name="lead"
          className="tfm-form-select"
          value={formData.lead}
          onChange={handleInputChange}
        >
          <option value="">Select Project Lead</option>
          {users.map((user) => (
            <option key={user.userId} value={user.userId}>
              {user.userName}
            </option>
          ))}
        </select>

        <label className="tfm-form-label">Project URL</label>
        <input
          type="text"
          name="url"
          className="tfm-form-input"
          placeholder="Enter project URL"
          value={formData.url}
          onChange={handleInputChange}
        />

        <label className="tfm-form-label">Description</label>
        <Editor
          editorState={editorState}
          wrapperClassName="tfm-editor-wrapper"
          editorClassName="tfm-editor-content"
          onEditorStateChange={setEditorState}
          toolbar={{
            options: ["inline", "blockType", "list", "link", "emoji"],
            inline: { options: ["bold", "italic", "underline"] },
          }}
        />

        <div className="tfm-form-actions">
          <button
            className="tfm-form-cancel-btn"
            type="button"
            onClick={() => {
              resetForm();
              setOpenForm(null);
            }}
          >
            Cancel
          </button>
          <button className="tfm-form-create-btn" type="button" onClick={handleSubmit}>
            {isEdit ? "Update" : "Create"}
          </button>
        </div>
      </form>

      {success && (
        <div className="tfm-popup-message success">
          🎉 Project {isEdit ? "Updated" : "Created"} Successfully!
        </div>
      )}

      {error && <div className="tfm-popup-message error">{error}</div>}
    </div>
  );
};

export default ProjectForm;
