import React, { useMemo } from "react";
import { NavLink } from "react-router-dom";
import { MdOutlineDashboard, MdSettingsSuggest } from "react-icons/md";
import { FaProjectDiagram, FaRegCalendarAlt, FaUsers } from "react-icons/fa";
import { TbReportAnalytics } from "react-icons/tb";
import { PiArticleNyTimesFill } from "react-icons/pi";
import { usePermissions } from "../auth/PermissionContext";
import "./styles/Sidebar.css";

const items = [
  { key: "dashboard", label: "Dashboard", path: "/dashboard", icon: <MdOutlineDashboard /> },
  { key: "work", label: "Your Work", path: "/dashboard/work", icon: <MdOutlineDashboard /> },
  { key: "time_sheets", label: "Time Sheets", path: "/dashboard/time-sheets", icon: <PiArticleNyTimesFill /> },
  { key: "projects", label: "Projects", path: "/dashboard/projects", icon: <FaProjectDiagram /> },
  { key: "admin_time_sheets", label: "Admin Time Sheets", path: "/dashboard/admin-timesheets", icon: <PiArticleNyTimesFill /> },
  { key: "reports", label: "Reports", path: "/dashboard/reports", icon: <TbReportAnalytics /> },
  { key: "all_reports", label: "All Reports", path: "/dashboard/all-reports", icon: <TbReportAnalytics /> },
  { key: "teams", label: "Teams", path: "/dashboard/teams", icon: <FaUsers /> },
  { key: "issues", label: "Issues", path: "/dashboard/issues", icon: <MdSettingsSuggest /> },
  { key: "calendar", label: "Calendar", path: "/dashboard/calendar", icon: <FaRegCalendarAlt /> },
];

const managementKeys = ["settings", "users", "user_management", "resources", "positions", "position_management"];

export default function Sidebar() {
  const permissions = usePermissions();
  const can = permissions?.can;
  const loading = Boolean(permissions?.loading);

  const visibleItems = useMemo(() => {
    const allowed = items.filter((item) => can(item.key, "view"));
    if (managementKeys.some((key) => can(key, "view"))) {
      allowed.push({ key: "access_management", label: "Access Management", path: "/dashboard/settings", icon: <MdSettingsSuggest /> });
    }
    return allowed;
  }, [can]);

  return <aside className="tfm-sidebar-container">
    <div className="tfm-sidebar-header">
      <img src="/logo_icon.png" alt="TeamFlow logo" className="tfm-sidebar-logo" />
      <h3 className="tfm-sidebar-title">TeamFlow</h3>
    </div>
    <nav className="tfm-sidebar-nav" aria-label="Primary navigation">
      {loading ? <div className="tfm-sidebar-loading">Loading menu...</div> : <ul className="tfm-sidebar-menu">
        {visibleItems.map((item) => <li key={item.key} className="tfm-sidebar-item">
          <NavLink to={item.path} end={item.path === "/dashboard"} className={({ isActive }) => `tfm-sidebar-link ${isActive ? "active" : ""}`} title={item.label}>
            {React.cloneElement(item.icon, { className: "tfm-sidebar-icon", "aria-hidden": true })}
            <span className="tfm-sidebar-text">{item.label}</span>
          </NavLink>
        </li>)}
      </ul>}
    </nav>
  </aside>;
}