import { useState } from "react";
import { uploadProjectDocument } from "../api/projectsApi";
import "./index.css";

const ProjectDocument = ({ setOpenForm, projectId, currentUserId }) => {
  const [attachment, setAttachment] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachment(file);
      setError("");
    }
  };

  const resetForm = () => {
    setAttachment(null);
  };

  const handleSubmit = async () => {
    if (!attachment) {
      setError("Please select a document to upload.");
      return;
    }

    const data = new FormData();
    data.append("project_id", projectId);
    data.append("uploaded_by", currentUserId);
    data.append("document_path", attachment);

    try {
      await uploadProjectDocument(data);
      setSuccess(true);
      setError("");
      resetForm();

      setTimeout(() => {
        setSuccess(false);
        setOpenForm(null);
      }, 3000);
    } catch (err) {
      setError("❌ Something went wrong while uploading the document.");
      setSuccess(false);
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <div>
      <h2 className="tfm-form-title">Upload Project Document</h2>
      <form className="tfm-form" onSubmit={(e) => e.preventDefault()}>
        <div className="tfm-attachment-wrapper">
          {!attachment ? (
            <div className="tfm-attachment-box">
              <p>
                📁 Drop files to attach or <span className="browse">Browse</span>
              </p>
              <input type="file" className="tfm-file-input" onChange={handleFileChange} />
            </div>
          ) : (
            <div className="tfm-selected-file">
              <p>📄 {attachment.name}</p>
              <button type="button" className="tfm-reupload-btn" onClick={() => setAttachment(null)}>
                Reupload
              </button>
            </div>
          )}
        </div>

        <div className="tfm-form-actions">
          <button className="tfm-form-cancel-btn" type="button" onClick={resetForm}>
            Cancel
          </button>
          <button className="tfm-form-create-btn" type="submit" onClick={handleSubmit}>
            Upload
          </button>
        </div>
      </form>

      {success && (
        <div className="tfm-popup-message success">
          🎉 Document Uploaded Successfully!
        </div>
      )}

      {error && (
        <div className="tfm-popup-message error">
          {error}
        </div>
      )}
    </div>
  );
};

export default ProjectDocument;
