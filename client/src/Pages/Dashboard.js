import { Routes, Route } from "react-router-dom";
import Sidebar from "../component/Sidebar";
import Status from "./StatusPage";
import ReportsPage from "./ReportsPage";
import "./Styles/index.css";
import Projects from "./ProjectsPage";
import Settings from "./SettingsPage";
import Header from "../component/Header";
import AdminDashboard from "../NewDashboard/AdminDashboard";
import EmployeeWorkStatus from "../NewDashboard/EmployeeWorkStatus";
import IssuesPage from "./IssuesPage";
import AllReportsPage from "./AllReports";
import ProjectDetailsDemo from "./ProjectDetails";
import IssueDetails from "./IssueDetails";
import WeeklyTimesheetPage from "../component/timesheet/WeeklyTimesheetPage";
import AdminTimesheetReportsPage from "./AdminTimesheetReportsPage";
import CalendarPage from "./CalendarPage";

const Dashboard = () => {
  return (
    <div className="tfm-dashboard">
      <Sidebar />
      <Header />
      <div className="tfm-main-content">  
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/admin-timesheets" element={<AdminTimesheetReportsPage />} />
          <Route path="/work" element={<EmployeeWorkStatus />} />
          <Route path="/time-sheets" element={<WeeklyTimesheetPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:projectId" element={<ProjectDetailsDemo />} />
          <Route path="/status" element={<Status />} />
          <Route path="/Reports" element={<ReportsPage />} />
          <Route path="/all-reports" element={<AllReportsPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/issues" element={<IssuesPage />} />
          <Route path="/pwd" element={<ProjectDetailsDemo/>} />
          <Route path="/issues/:issueId" element={<IssueDetails/>} />
        </Routes>
      </div>
    </div>
  );
};


export default Dashboard;
