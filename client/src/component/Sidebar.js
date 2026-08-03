// src/components/Sidebar.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { MdOutlineDashboard } from "react-icons/md";
import { FaProjectDiagram } from "react-icons/fa";
import { TbReportAnalytics } from "react-icons/tb";
import { MdSettingsSuggest } from "react-icons/md";
import { FaRegCalendarAlt } from "react-icons/fa";
import { PiArticleNyTimesFill } from "react-icons/pi";
import "./styles/Sidebar.css";
import { getResources } from "../api/authApi";

// Mapping from resource name to route and icon
const resourceConfig = {
  Dashboard: {
    path: "/dashboard",
    icon: <FaRegCalendarAlt className="tfm-sidebar-icon" />,
  },
  "Your work": {
    path: "/dashboard/work",
    icon: <MdOutlineDashboard className="tfm-sidebar-icon" />,
  },
  "Time Sheets": {
    path: "/dashboard/time-sheets",
    icon: <PiArticleNyTimesFill className="tfm-sidebar-icon" />,
  },
  Projects: {
    path: "/dashboard/projects",
    icon: <FaProjectDiagram className="tfm-sidebar-icon" />,
  },
  "Admin Time Sheets": {
    path: "/dashboard/admin-timesheets",
    icon: <PiArticleNyTimesFill className="tfm-sidebar-icon" />,
  },
  Reports: {
    path: "/dashboard/reports",
    icon: <TbReportAnalytics className="tfm-sidebar-icon" />,
  },
  "All Reports": {
    path: "/dashboard/all-reports",
    icon: <TbReportAnalytics className="tfm-sidebar-icon" />,
  },
  Teams: {
    path: "/dashboard/teams",
    icon: <FaRegCalendarAlt className="tfm-sidebar-icon" />,
  },
  Settings: {
    path: "/dashboard/settings",
    icon: <MdSettingsSuggest className="tfm-sidebar-icon" />,
  },
  Issues: {
    path: "/dashboard/issues",
    icon: <MdSettingsSuggest className="tfm-sidebar-icon" />,
  },
  Calendar: {
    path: "/dashboard/calendar",
    icon: <FaRegCalendarAlt className="tfm-sidebar-icon" />,
  }
};

const Sidebar = () => {
  const location = useLocation();
  const [resources, setResources] = useState([]);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await getResources();
        setResources(response);
        console.log(response);
        
      } catch (err) {
        console.error("Failed to fetch sidebar resources:", err);
      }
    };

    fetchResources();
  }, []);

  return (
    <div className="tfm-sidebar-container">
      <div className="tfm-sidebar-header">
        <img src="/logo_icon.png" alt="Logo" className="tfm-sidebar-logo" />
        <h3 className="tfm-sidebar-title">TeamFlow</h3>
      </div>
      <nav className="tfm-sidebar-nav">
        <ul className="tfm-sidebar-menu">
          {resources.map((res) => {
            const config = resourceConfig[res.name];
            if (!config) return null;

            const isActive = config.path === "/dashboard"
              ? location.pathname === config.path
              : location.pathname.startsWith(config.path);

            return (
              <li key={res.id} className={`tfm-sidebar-item ${isActive ? "active" : ""}`}>
                <Link className="tfm-sidebar-link" to={config.path}>
                  {config.icon}
                  <span className="tfm-sidebar-text">{res.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
