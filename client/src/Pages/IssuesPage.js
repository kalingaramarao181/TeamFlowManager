import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Pagination from "../component/Pagination";
import { getAllIssues } from "../api/issueApi";
import { getProjects } from "../api/projectsApi";
import Issues from "../component/Issues";
import { FaFilter } from "react-icons/fa";
import "./index.css";
import Loader from "../component/Loader";
import ErrorComponent from "../component/ErrorComponent";


const IssuesPage = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectNames, setProjectNames] = useState({});
  const [selectedProject, setSelectedProject] = useState("all");
  const [searchKey, setSearchKey] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchIssues(currentPage, selectedProject, searchKey);
  }, [currentPage, selectedProject, searchKey]);

  const fetchProjects = async () => {
    try {
      const projects = await getProjects();
      const names = {};
      projects.forEach((p) => {
        names[p.id] = p.projectName;
      });
      setProjectNames(names);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    }
  };

  

  const fetchIssues = async (page, project, search) => {
    try {
      const response = await getAllIssues(page, itemsPerPage, project, search);
      setIssues(response.issues);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error("Failed to fetch issues:", err);
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="tfm-db-page-container">
      <header className="tfm-db-page-header">
        <div className="tfm-filter-group">
          <label className="tfm-filter-icon">
            <FaFilter />
          </label>
          <select
            className="tfm-filter-dropdown"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            <option value="all">All Projects</option>
            {Object.entries(projectNames).map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
          <input
            className="tfm-filter-input"
            type="text"
            placeholder="Search by Key (e.g. PROJ-12)"
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
          />
        </div>
      </header>

      <div className="tfm-table-container">
        {loading ? (
          <Loader />
        ) : issues.length > 0 ? (
          <>
            <Issues issues={issues} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <ErrorComponent message="No issues found." />
        )}
      </div>
    </div>
  );
};

export default IssuesPage;
