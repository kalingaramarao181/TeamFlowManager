import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Doughnut } from "react-chartjs-2";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { FiArrowLeft, FiCopy, FiEdit2, FiExternalLink, FiFile, FiTrash2, FiUpload, FiUsers } from "react-icons/fi";
import { cloneProject, deleteProject, getProjectById } from "../api/projectsApi";
import { getUserDataFromCookies } from "../utils/cookiesData";
import { baseUrlImg } from "../Config/env";
import FormView from "../Forms/FormView";
import "./Styles/ProjectDetails.css";

ChartJS.register(ArcElement, Legend, Tooltip);

const plainText = (html) => {
  const element = document.createElement("div");
  element.innerHTML = html || "";
  return element.textContent || element.innerText || "";
};

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const user = useMemo(() => getUserDataFromCookies(), []);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [openForm, setOpenForm] = useState(null);

  const loadProject = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await getProjectById(projectId));
    } catch (requestError) {
      setError(requestError?.response?.status === 404 ? "Project not found." : "Project details could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { loadProject(); }, [loadProject, openForm]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this project? This action cannot be undone.")) return;
    try {
      await deleteProject(projectId);
      navigate("/dashboard/projects");
    } catch (requestError) {
      setMessage(requestError?.response?.data?.error || "Project could not be deleted.");
    }
  };

  const handleClone = async () => {
    try {
      const response = await cloneProject(projectId);
      setMessage("Project cloned successfully.");
      navigate(`/dashboard/projects/${response.project.id}`);
    } catch (requestError) {
      setMessage(requestError?.response?.data?.error || "Project could not be cloned.");
    }
  };

  if (loading) return <div className="project-detail-skeleton"><i /><i /><i /></div>;
  if (error) return <div className="project-detail-state"><strong>{error}</strong><button onClick={() => navigate("/dashboard/projects")}>Back to projects</button></div>;

  const { project, members = [], issues = [], documents = [] } = data;
  const completed = issues.filter((issue) => ["done", "resolved", "completed"].includes(String(issue.status || "").toLowerCase())).length;
  const progress = issues.length ? Math.round(completed / issues.length * 100) : 0;
  const statusGroups = Object.entries(issues.reduce((groups, issue) => {
    const status = issue.status || "Unspecified";
    groups[status] = (groups[status] || 0) + 1;
    return groups;
  }, {}));
  const chart = {
    labels: statusGroups.map(([status]) => status),
    datasets: [{ data: statusGroups.map(([, count]) => count), backgroundColor: ["#2563eb", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"], borderWidth: 0 }],
  };
  const tabs = [
    ["overview", "Overview"], ["issues", `Issues (${issues.length})`],
    ["team", `Team (${members.length})`], ["files", `Files (${documents.length})`],
  ];

  return (
    <main className="project-detail-enterprise">
      <button className="project-detail-back" onClick={() => navigate("/dashboard/projects")}><FiArrowLeft /> Projects</button>
      <header className="project-detail-header">
        <div className="project-detail-identity">
          {project.projectLogo ? <img src={`${baseUrlImg}uploads/${project.projectLogo}`} alt="" /> : <span>{project.projectKey?.slice(0, 2)}</span>}
          <div><small>{project.projectKey} · {project.type || "Project"}</small><h1>{project.name}</h1><p>{project.lead_name || "No project owner assigned"}</p></div>
        </div>
        {user?.role === "admin" && <div className="project-detail-actions">
          <button onClick={() => setOpenForm("projects")}><FiEdit2 /> Edit</button>
          <button onClick={handleClone}><FiCopy /> Clone</button>
          <button className="danger" onClick={handleDelete}><FiTrash2 /> Delete</button>
        </div>}
      </header>
      {message && <div className="project-detail-message">{message}</div>}

      <nav className="project-tabs" aria-label="Project sections">
        {tabs.map(([key, label]) => <button key={key} className={activeTab === key ? "active" : ""} onClick={() => setActiveTab(key)}>{label}</button>)}
      </nav>

      {activeTab === "overview" && <section className="project-overview-grid">
        <article className="project-panel project-summary">
          <h2>Project summary</h2>
          <div className="project-rich-text">{plainText(project.description) || "No description has been added."}</div>
          {project.projectURL && <a href={project.projectURL} target="_blank" rel="noreferrer"><FiExternalLink /> Open production URL</a>}
        </article>
        <article className="project-panel project-progress-panel">
          <h2>Delivery progress</h2><strong>{progress}%</strong><progress value={progress} max="100" />
          <div><span><b>{issues.length}</b> Total issues</span><span><b>{completed}</b> Completed</span><span><b>{issues.length - completed}</b> Remaining</span></div>
        </article>
        <article className="project-panel"><h2>Issue distribution</h2>
          <div className="project-chart">{issues.length ? <Doughnut data={chart} options={{ responsive: true, maintainAspectRatio: false, cutout: "68%", plugins: { legend: { position: "bottom", labels: { usePointStyle: true } } } }} /> : <p>No issues have been created.</p>}</div>
        </article>
        <article className="project-panel"><h2>Project information</h2><dl className="project-facts">
          <div><dt>Owner</dt><dd>{project.lead_name || "Unassigned"}</dd></div>
          <div><dt>Type</dt><dd>{project.type || "Not specified"}</dd></div>
          <div><dt>Created</dt><dd>{new Date(project.created_at).toLocaleDateString()}</dd></div>
          <div><dt>Members</dt><dd>{members.length}</dd></div>
          <div><dt>Documents</dt><dd>{documents.length}</dd></div>
        </dl></article>
      </section>}

      {activeTab === "issues" && <section className="project-panel">
        <div className="project-panel-title"><div><h2>Project issues</h2><p>Tasks, bugs, stories, and other work items linked to this project.</p></div>
          <button onClick={() => navigate(`/dashboard/issues?project=${project.id}`)}>Open issue manager</button></div>
        {issues.length ? <div className="project-responsive-table"><table><thead><tr><th>Key</th><th>Summary</th><th>Type</th><th>Priority</th><th>Assignee</th><th>Status</th></tr></thead>
          <tbody>{issues.map((issue) => <tr key={issue.id} onClick={() => navigate(`/dashboard/issues/${issue.id}`)}><td className="project-key">{project.projectKey}-{issue.id}</td><td>{issue.summary}</td><td>{issue.issue_type || "Task"}</td><td>{issue.priority || "—"}</td><td>{issue.assignee_name || "Unassigned"}</td><td><span>{issue.status || "Unspecified"}</span></td></tr>)}</tbody></table></div> :
          <div className="project-tab-empty">No issues are linked to this project.</div>}
      </section>}

      {activeTab === "team" && <section className="project-panel"><div className="project-panel-title"><div><h2>Project team</h2><p>Members are derived from current issue assignments.</p></div><FiUsers /></div>
        {members.length ? <div className="project-team-grid">{members.map((member) => <article key={member.id}><span>{member.full_name?.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><div><strong>{member.full_name}</strong><small>{member.role || "Team member"}</small><a href={`mailto:${member.email}`}>{member.email}</a></div></article>)}</div> :
          <div className="project-tab-empty">No members are assigned through project issues.</div>}
      </section>}

      {activeTab === "files" && <section className="project-panel"><div className="project-panel-title"><div><h2>Project files</h2><p>Documents uploaded to this project.</p></div><button onClick={() => setOpenForm("projectDocument")}><FiUpload /> Upload file</button></div>
        {documents.length ? <div className="project-files">{documents.map((document) => <a key={document.id} href={`${baseUrlImg}uploads/${document.document_path}`} target="_blank" rel="noreferrer"><FiFile /><span><strong>{document.document_path}</strong><small>{document.uploaded_by_name || "Unknown uploader"} · {new Date(document.uploaded_at).toLocaleDateString()}</small></span></a>)}</div> :
          <div className="project-tab-empty">No documents have been uploaded.</div>}
      </section>}

      <FormView openForm={openForm} setOpenForm={setOpenForm} projectId={project.id} currentUserId={user?.id} updateProjectData={openForm === "projects" ? project : null} />
    </main>
  );
};

export default ProjectDetails;
