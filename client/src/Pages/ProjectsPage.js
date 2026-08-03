import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiDownload, FiGrid, FiList, FiPlus, FiSearch, FiUsers } from "react-icons/fi";
import Pagination from "../component/Pagination";
import FormView from "../Forms/FormView";
import { getAllProjects } from "../api/projectsApi";
import { getUserDataFromCookies } from "../utils/cookiesData";
import { baseUrlImg } from "../Config/env";
import "./Styles/ProjectsEnterprise.css";

const plainText = (html) => {
  const element = document.createElement("div");
  element.innerHTML = html || "";
  return element.textContent || element.innerText || "";
};

const ProjectsPage = () => {
  const navigate = useNavigate();
  const user = useMemo(() => getUserDataFromCookies(), []);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [view, setView] = useState("grid");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openForm, setOpenForm] = useState(null);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAllProjects(page, 9, search);
      setProjects(response.projects || []);
      setTotalPages(response.totalPages || 1);
    } catch (requestError) {
      setError(requestError?.response?.data?.error || "Projects could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const timer = setTimeout(loadProjects, 250);
    return () => clearTimeout(timer);
  }, [loadProjects, openForm]);

  const sortedProjects = useMemo(() => [...projects].sort((left, right) => {
    if (sort === "name") return left.name.localeCompare(right.name);
    if (sort === "key") return left.projectKey.localeCompare(right.projectKey);
    if (sort === "progress") {
      const progress = (project) => Number(project.issue_count) ? Number(project.completed_count) / Number(project.issue_count) : 0;
      return progress(right) - progress(left);
    }
    return new Date(right.created_at) - new Date(left.created_at);
  }), [projects, sort]);

  const exportProjects = () => {
    const rows = [["Project", "Key", "Type", "Owner", "Issues", "Completed"]];
    sortedProjects.forEach((project) => rows.push([
      project.name, project.projectKey, project.type || "", project.owner_name || "",
      project.issue_count || 0, project.completed_count || 0,
    ]));
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = "teamflow-projects.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <main className="projects-enterprise">
      <header className="projects-hero">
        <div><span>Workspace</span><h1>Projects</h1><p>Plan, monitor, and deliver work from one portfolio.</p></div>
        <div className="projects-primary-actions">
          <button className="projects-secondary" onClick={exportProjects}><FiDownload /> Export</button>
          {user?.role === "admin" && <button className="projects-primary" onClick={() => setOpenForm("projects")}><FiPlus /> Create project</button>}
        </div>
      </header>

      <section className="projects-toolbar">
        <label className="projects-search"><FiSearch /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search name, key, or owner" /></label>
        <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort projects">
          <option value="newest">Newest first</option><option value="name">Name</option>
          <option value="key">Project key</option><option value="progress">Progress</option>
        </select>
        <div className="projects-view-switch">
          <button className={view === "grid" ? "active" : ""} onClick={() => setView("grid")} aria-label="Grid view"><FiGrid /></button>
          <button className={view === "list" ? "active" : ""} onClick={() => setView("list")} aria-label="List view"><FiList /></button>
        </div>
      </section>

      {loading ? <div className="projects-skeleton">{Array.from({ length: 6 }).map((_, index) => <i key={index} />)}</div> :
        error ? <div className="projects-state"><strong>Unable to load projects</strong><p>{error}</p><button onClick={loadProjects}>Try again</button></div> :
        !sortedProjects.length ? <div className="projects-state"><strong>No projects found</strong><p>Adjust your search or create the first project.</p>{user?.role === "admin" && <button onClick={() => setOpenForm("projects")}>Create project</button>}</div> :
        <section className={`projects-collection ${view}`}>
          {sortedProjects.map((project) => {
            const issueCount = Number(project.issue_count || 0);
            const progress = issueCount ? Math.round(Number(project.completed_count || 0) / issueCount * 100) : 0;
            return <article key={project.id} className="project-portfolio-card" onClick={() => navigate(`/dashboard/projects/${project.id}`)}>
              <div className="project-card-top">
                {project.projectLogo ? <img src={`${baseUrlImg}uploads/${project.projectLogo}`} alt="" /> : <span className="project-logo-fallback">{project.projectKey?.slice(0, 2)}</span>}
                <div><small>{project.projectKey}</small><h2>{project.name}</h2><p>{project.type || "Uncategorized project"}</p></div>
              </div>
              <div className="project-description">{plainText(project.description) || "No project description has been added."}</div>
              <div className="project-progress-copy"><span>Issue completion</span><strong>{progress}%</strong></div>
              <progress value={progress} max="100" />
              <footer>
                <span><FiUsers /> {Number(project.member_count || 0)} members</span>
                <span>{issueCount} issues</span>
                <span>{project.owner_name || "No owner"}</span>
              </footer>
            </article>;
          })}
        </section>}

      {!loading && totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
      <FormView openForm={openForm} setOpenForm={setOpenForm} currentUserId={user?.id} />
    </main>
  );
};

export default ProjectsPage;
