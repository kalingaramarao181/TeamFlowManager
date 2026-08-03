import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import "./styles/Header.css";
import FormView from "../Forms/FormView";
import { getUserDataFromCookies } from "../utils/cookiesData";
import AICodeGeneratorButton from "./AICodeGenerator/AICodeGeneratorButton";

const Header = ({ openPopup, closePopup, isPopupOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const showAIGenerateButton = location.pathname === "/dashboard/work";

  const user = getUserDataFromCookies();

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleLogout = () => {
    Cookies.remove("jwtToken");
    navigate("/");
  };

  const getInitials = (name) => {
    if (!name) return "";
    const words = name.split(" ");
    const initials = words
      .map((word) => word[0])
      .join("")
      .toUpperCase();
    return initials.slice(0, 2);
  };

  // Define button visibility and form type for each path
  const createButtonConfig = {
    "/dashboard/projects": "projects",
    "/dashboard/reports": "reports",
    // "/dashboard/settings": "user",
    "/dashboard/status": "reports",
    "/dashboard/issues": "issue",
  };

  const showCreateButton = createButtonConfig.hasOwnProperty(location.pathname);
  const formType = createButtonConfig[location.pathname];

  const handleCreateButtonClick = () => {
    setOpenForm(formType);
  };

  const pathToTitleMap = {
    "/dashboard": "",
    "/dashboard/projects": "Projects",
    "/dashboard/status": "Status",
    "/dashboard/reports": "Reports",
    "/dashboard/work": "Your Work",
    "/dashboard/settings": "Settings",
  };

  const headerTitle = location.pathname.startsWith("/dashboard/projects/")
    ? "Project Details"
    : pathToTitleMap[location.pathname] || "Dashboard";

  return (
    <header className="tf-dashboard-header">
      <div className="tf-dashboard-create-btn-container">
        <h1 className="tf-dashboard-header-title">{headerTitle}</h1>

        {showCreateButton && (
          <button
            className={`tf-dashboard-button ${isPopupOpen ? "active" : ""}`}
            onClick={handleCreateButtonClick}
          >
            Create
          </button>
        )}
        {showAIGenerateButton && <AICodeGeneratorButton />}
      </div>

      <div className="tf-dashboard-user-info">
        <p className="tf-dashboard-user-welcome-text" onClick={toggleDropdown}>
          {user.name}
          <div className="tf-dashboard-profile-initial">
            {getInitials(user.name)}
          </div>
        </p>
        {dropdownVisible && (
          <div className="tf-dashboard-dropdown">
            <ul>
              <li>
                <span>Account</span>
                <div className="tf-dashboard-account-profile-container">
                  <div className="tf-dashboard-profile-initial">
                    {getInitials(user.name)}
                  </div>

                  <p className="tf-dashboard-account-profile-names">
                    <span>{user.name}</span>
                    <span>{user.email}</span>
                  </p>
                </div>
              </li>
              <li className="tf-dashboard-list">Profile</li>
              <li className="tf-dashboard-list">Personal Settings</li>
              <li className="tf-dashboard-list">Notifications</li>
              <li className="tf-dashboard-list" onClick={handleLogout}>
                Logout
              </li>
            </ul>
          </div>
        )}
      </div>

      <FormView
        openForm={openForm}
        setOpenForm={setOpenForm}
        currentUserId={user.id}
      />
    </header>
  );
};

export default Header;
