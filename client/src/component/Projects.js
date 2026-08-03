import React, { useRef, useState } from "react";
import { baseUrl, baseUrlImg } from "../Config/env";
import FormView from "../Forms/FormView";
import { getUserDataFromCookies } from "../utils/cookiesData";

const Projects = ({ projects, navigate }) => {
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const dropdownRef = useRef(null);
  const [openForm, setOpenForm] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [updateProjectData, setUpdateProjectData] = useState(null);

  const userData = getUserDataFromCookies();
  console.log("userData in Projects:", projects);

  // const handleCardClick = (projectId) => {
  //   navigate(`/issues/${projectId}`);
  // };

  const handleViewDetails = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  const toggleDropdown = (projectId) => {
    setDropdownOpen((prev) => (prev === projectId ? null : projectId));
  };

  return (
    <table className="tfm-table">
      <thead>
        <tr>
          <th>Project Name</th>
          <th>Project Key</th>
          <th>Type</th>
          <th>Lead</th>
          <th>More Actions</th>
        </tr>
      </thead>
      <tbody>
        {projects.map((project) => (
          <tr key={project.id}>
            <td className="project-name-logo-container">
              {project.projectLogo ? (
                <img
                  src={`${baseUrlImg}uploads/${project.projectLogo}`}
                  alt="Project Logo"
                  className="project-logo"
                />
              ) : (
                <span className="no-logo">No Logo</span>
              )}
              <p
                className="tfm-issue-key"
                onClick={() => window.open(project.projectURL, "_blank")}
              >
                {project.name}
              </p>
            </td>
            <td>
              <a
                href={`${baseUrlImg}uploads/${project.document_path}`}
                target="_blank"
                rel="noreferrer"
                className="doc-link"
              >
                {project.projectKey}
              </a>
            </td>
            <td>{project.type}</td>
            <td>{project.owner_name}</td>
            <td className="more-actions-cell" ref={dropdownRef}>
              <span
                className="more-actions-dots"
                onClick={() => toggleDropdown(project.id)}
              >
                •••
              </span>
              {dropdownOpen === project.id && (
                <div className="dropdown-menu">
                  <button onClick={() => handleViewDetails(project.id)}>
                    View Project Details
                  </button>
                  <button
                    onClick={() => {
                      setSelectedProjectId(project.id);
                      setOpenForm("projects");
                      setUpdateProjectData(project);
                    }}
                  >
                    Update Project
                  </button>
                  <button
                    onClick={() => {
                      setSelectedProjectId(project.id);
                      setOpenForm("projectDocument");
                    }}
                  >
                    Upload Project Document
                  </button>
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>

      <FormView
        openForm={openForm}
        setOpenForm={setOpenForm}
        projectId={selectedProjectId}
        currentUserId={userData.id}
        updateProjectData={updateProjectData}
      />
    </table>
  );
};

export default Projects;
