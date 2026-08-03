import React, { useState, useEffect } from "react";
import {
  getAllStatusReports,
  getTodayReportStatus,
  submitLogin,
  submitLogout,
} from "../api/workStatusApi";
import { getProjects } from "../api/projectsApi";
import "./EmployeeWorkStatus.css";
import Loader from "../component/Loader";
import StatusReports from "../component/StatusReports";
import Pagination from "../component/Pagination";
import { getUserDataFromCookies } from "../utils/cookiesData";

const EmployeeWorkStatus = () => {
  const [status, setStatus] = useState(null);
  const [projects, setProjects] = useState([]);
  const [workStatusId, setWorkStatusId] = useState(null);
  const [statusReports, setStatusReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const userData = getUserDataFromCookies();
  const userId = userData.id;

  const [formData, setFormData] = useState({
    projectId: "",
    moduleName: "",
    workingOn: "",
    workedOn: "",
    status: "",
    files: [], 
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      const projectsData = await getProjects();
      setProjects(projectsData);

      const response = await getTodayReportStatus(userId);
      if (response?.data) {
        const report = response.data;
        setStatus(report.login_status === 1 ? "Started" : "Stopped");
        setWorkStatusId(report.id);
        setFormData((prev) => ({
          ...prev,
          projectId: report.project_id,
          moduleName: report.module_name,
          workingOn: report.working_on,
        }));
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    fetchReports(currentPage);
  }, [currentPage]);

  const fetchReports = async (page) => {
    try {
      const response = await getAllStatusReports(userId, page, itemsPerPage);
      setStatusReports(response.reports);
      setTotalPages(response.totalPages);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "files") {
      setFormData((prev) => ({
        ...prev,
        files: [...prev.files, ...Array.from(files)],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleRemoveFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        user_id: userId,
        project_id: formData.projectId,
        module_name: formData.moduleName,
        working_on: formData.workingOn,
        status: formData.status,
      };
      const res = await submitLogin(payload);
      setWorkStatusId(res.insertId);
      setStatus("Started");
      alert("Login successful! Work started.");

      setFormData((prev) => ({
        ...prev,
        projectId: "",
        moduleName: "",
        workingOn: "",
        status: "",
      }));
    } catch (err) {
      console.error("Login error:", err);
      alert("Could not log in.");
    }
  };

  const handleLogout = async (e) => {
  e.preventDefault();
  try {
    const formToSend = new FormData();
    formToSend.append("id", workStatusId);
    formToSend.append("worked_on", formData.workedOn || "");
    formToSend.append("status", formData.status || "");

    formData.files.forEach((file) => {
      formToSend.append("files", file);
    });

    await submitLogout(formToSend);
    setStatus("Stopped");
    alert("Logout successful. Work session closed.");

    setFormData({
      projectId: "",
      moduleName: "",
      workingOn: "",
      workedOn: "",
      status: "",
      files: [],
    });
  } catch (err) {
    console.error("Logout error:", err);
    alert("Could not logout.");
  }
};


  return (
    <div className="employee-status-container">
      <h2>
        {status === "Stopped"
          ? "You've completed today's work."
          : status === "Started"
          ? "Submit your day's progress"
          : "Start your work day"}
      </h2>

      {status !== "Stopped" && (
        <form
          onSubmit={status === "Started" ? handleLogout : handleLogin}
          className="work-status-form"
        >
          {status !== "Started" ? (
            <>
              <select
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

              <input
                type="text"
                name="moduleName"
                placeholder="Module name"
                value={formData.moduleName}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="workingOn"
                placeholder="What are you working on?"
                value={formData.workingOn}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="status"
                placeholder="Initial status (e.g. In Progress)"
                value={formData.status}
                onChange={handleChange}
                required
              />
            </>
          ) : (
            <>
              <input
                type="text"
                name="workedOn"
                placeholder="What did you complete today?"
                value={formData.workedOn}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="status"
                placeholder="Final status (e.g. Completed)"
                value={formData.status}
                onChange={handleChange}
                required
              />

              <input
                type="file"
                name="files"
                onChange={handleChange}
                multiple
              />
            </>
          )}

          <button type="submit">
            {status === "Started" ? "End Day & Submit" : "Start Day"}
          </button>
        </form>
      )}

      {formData.files.length > 0 && (
        <div className="file-preview-list">
          <h4>Attached Documents:</h4>
          <ul>
            {formData.files.map((file, index) => (
              <li key={index}>
                {file.name}
                <button type="button" onClick={() => handleRemoveFile(index)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="issues-table-container">
        {!loading && statusReports.length > 0 ? (
          <>
            <StatusReports reports={statusReports} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        ) : loading ? (
          <Loader />
        ) : (
          <p>No reports found.</p>
        )}
      </div>
    </div>
  );
};

export default EmployeeWorkStatus;
