import { useState } from "react";
import { uploadUserReport } from "../api/reportsApi"; // API call helper
import "./index.css";

const UploadReport = ({ setOpenForm, currentUserId }) => {
  const [attachment, setAttachment] = useState(null);
  const [reportText, setReportText] = useState("");
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
    setReportText("");
  };

  const handleSubmit = async () => {
    if (!attachment) {
      setError("Please select a report image/document.");
      return;
    }

    if (!reportText.trim()) {
      setError("Please enter report text.");
      return;
    }

    const data = new FormData();
    data.append("userId", currentUserId);
    data.append("reportText", reportText);
    data.append("file", attachment); // ✅ MUST MATCH backend "file"

    try {
      await uploadUserReport(data);
      setSuccess(true);
      setError("");
      resetForm();

      setTimeout(() => {
        setSuccess(false);
        setOpenForm(null);
      }, 3000);
    } catch (err) {
      setError("❌ Something went wrong while uploading the report.");
      setSuccess(false);
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <div>
      <h2 className="tfm-form-title">Upload Report</h2>
      <form className="tfm-form" onSubmit={(e) => e.preventDefault()}>
        <div className="tfm-attachment-wrapper">
          {!attachment ? (
            <div className="tfm-attachment-box">
              <p>
                📁 Drop files to attach or <span className="browse">Browse</span>
              </p>
              <input
                type="file"
                className="tfm-file-input"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="tfm-selected-file">
              <p>📄 {attachment.name}</p>
              <button
                type="button"
                className="tfm-form-input"
                onClick={() => setAttachment(null)}
              >
                Reupload
              </button>
            </div>
          )}
        </div>

        <input
          type="text"
          id="reportText"
          name="reportText"
          className="tfm-form-input"
          placeholder="Enter your report text"
          value={reportText}
          onChange={(e) => setReportText(e.target.value)}
        />

        <div className="tfm-form-actions">
          <button
            className="tfm-form-cancel-btn"
            type="button"
            onClick={resetForm}
          >
            Cancel
          </button>
          <button
            className="tfm-form-create-btn"
            type="submit"
            onClick={handleSubmit}
          >
            Upload
          </button>
        </div>
      </form>

      {success && (
        <div className="tfm-popup-message success">
          🎉 Report Uploaded Successfully!
        </div>
      )}

      {error && <div className="tfm-popup-message error">{error}</div>}
    </div>
  );
};

export default UploadReport;
