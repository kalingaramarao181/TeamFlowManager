import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Doughnut, Line } from "react-chartjs-2";
import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import {
  FiActivity,
  FiAlertCircle,
  FiCalendar,
  FiCheckSquare,
  FiClock,
  FiFileText,
  FiFolder,
  FiPlus,
  FiRefreshCw,
  FiUsers,
} from "react-icons/fi";
import {
  getAdminDashboardData,
  getDashboardOverview,
  getTodayModules,
} from "../api/workStatusApi";
import { getAllIssues } from "../api/issueApi";
import { getAllProjects } from "../api/projectsApi";
import { getHolidays } from "../api/calendarApi";
import { getUserDataFromCookies } from "../utils/cookiesData";
import FormView from "../Forms/FormView";
import "./AdminDashboard.css";

ChartJS.register(
  ArcElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
);

const number = (value) => Number(value || 0);

const buildDeployedApiOverview = async (user) => {
  const requests = await Promise.allSettled([
    getAdminDashboardData(),
    getTodayModules(),
    getAllIssues(1, 100, "", "", user.id),
    getAllProjects(1, 100, ""),
    getHolidays(),
  ]);
  const value = (index, fallback) =>
    requests[index].status === "fulfilled" ? requests[index].value : fallback;
  const legacyDashboard = value(0, {});
  const modules = value(1, { modules: [] }).modules || [];
  const issues = value(2, { issues: [] }).issues || [];
  const projects = value(3, { projects: [] }).projects || [];
  const holidays = value(4, []);

  if (!legacyDashboard.employees && !issues.length && !projects.length && !modules.length) {
    throw requests.find((request) => request.status === "rejected")?.reason ||
      new Error("No dashboard APIs are available");
  }

  const statusCount = (predicate) => issues.filter(predicate).length;
  const normalizedStatus = (issue) => String(issue.status || "").toLowerCase();
  const issueStatus = Object.entries(
    issues.reduce((counts, issue) => {
      const label = issue.status || "Unspecified";
      counts[label] = (counts[label] || 0) + 1;
      return counts;
    }, {})
  ).map(([label, count]) => ({ label, value: count }));
  const activeEmployees = legacyDashboard.activeEmployees || [];
  const projectIssueCounts = issues.reduce((counts, issue) => {
    const key = String(issue.project);
    counts[key] = counts[key] || { total: 0, completed: 0 };
    counts[key].total += 1;
    if (["done", "resolved", "completed"].includes(normalizedStatus(issue))) {
      counts[key].completed += 1;
    }
    return counts;
  }, {});

  return {
    generatedAt: new Date().toISOString(),
    scope: ["admin", "manager"].includes(user.role) ? "organization" : "personal",
    summary: {
      projects: { total: projects.length },
      issues: {
        total: issues.length,
        open_count: statusCount((issue) => ["to do", "open"].includes(normalizedStatus(issue))),
        in_progress: statusCount((issue) => normalizedStatus(issue).includes("progress")),
        resolved: statusCount((issue) => ["done", "resolved", "completed"].includes(normalizedStatus(issue))),
        critical: statusCount((issue) => ["critical", "highest"].includes(String(issue.priority || "").toLowerCase())),
      },
      timesheets: {},
      reports: {},
      documents: {},
      employees: {
        total: legacyDashboard.employees?.length || 0,
        workingNow: activeEmployees.filter((employee) => !employee.logout_time).length,
        presentToday: activeEmployees.length,
      },
    },
    charts: { issueStatus, weeklyHours: [] },
    recentIssues: issues.slice(0, 7),
    recentProjects: projects.slice(0, 6).map((project) => {
      const counts = projectIssueCounts[String(project.id)] || { total: 0, completed: 0 };
      return {
        ...project,
        name: project.name || project.projectName,
        projectKey: project.projectKey,
        issue_count: counts.total,
        completed_count: counts.completed,
      };
    }),
    recentWork: modules.slice(0, 8).map((module) => ({
      id: module.work_status_id,
      user_name: module.user_name,
      project_name: module.project_name,
      module_name: module.module_name,
      working_on: module.working_on,
      worked_on: module.last_worked_on,
      status: module.status,
      login_time: null,
    })),
    employees: activeEmployees.map((employee, index) => ({
      ...employee,
      id: employee.id || `active-${index}`,
      login_status: employee.logout_time ? 0 : 1,
    })),
    upcomingHolidays: holidays
      .filter((holiday) => new Date(holiday.date) >= new Date(new Date().toDateString()))
      .sort((left, right) => new Date(left.date) - new Date(right.date))
      .slice(0, 6),
  };
};

const DashboardSkeleton = () => (
  <div className="command-skeleton" aria-label="Loading dashboard">
    <div className="skeleton-block skeleton-hero" />
    <div className="skeleton-grid">
      {Array.from({ length: 6 }).map((_, index) => (
        <div className="skeleton-block skeleton-card" key={index} />
      ))}
    </div>
    <div className="skeleton-block skeleton-panel" />
  </div>
);

const EmptyState = ({ title, message, action, onAction }) => (
  <div className="command-empty">
    <FiFolder aria-hidden="true" />
    <strong>{title}</strong>
    <span>{message}</span>
    {action && <button onClick={onAction}>{action}</button>}
  </div>
);

const Widget = ({ title, subtitle, action, children, className = "" }) => (
  <section className={`command-widget ${className}`}>
    <header className="command-widget-header">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </header>
    {children}
  </section>
);

const MetricCard = ({ icon, label, value, detail, tone, onClick }) => (
  <button className={`command-metric metric-${tone}`} onClick={onClick}>
    <span className="command-metric-icon">{icon}</span>
    <span className="command-metric-body">
      <span className="command-metric-label">{label}</span>
      <strong>{number(value).toLocaleString()}</strong>
      <small>{detail}</small>
    </span>
  </button>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = useMemo(() => getUserDataFromCookies(), []);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openForm, setOpenForm] = useState(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await getDashboardOverview());
    } catch (requestError) {
      try {
        setData(await buildDeployedApiOverview(user));
      } catch (fallbackError) {
        const status = requestError?.response?.status || fallbackError?.response?.status;
        setError(
          status === 401 || status === 403
            ? "Your session does not have access to this dashboard."
            : "The dashboard could not be loaded. Check your connection and try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const issueChart = useMemo(() => ({
    labels: data?.charts?.issueStatus?.map((item) => item.label) || [],
    datasets: [{
      data: data?.charts?.issueStatus?.map((item) => number(item.value)) || [],
      backgroundColor: ["#2563eb", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"],
      borderWidth: 0,
      hoverOffset: 5,
    }],
  }), [data]);

  const hoursChart = useMemo(() => ({
    labels: data?.charts?.weeklyHours?.map((item) =>
      new Date(item.work_date).toLocaleDateString(undefined, { weekday: "short" })
    ) || [],
    datasets: [{
      label: "Hours",
      data: data?.charts?.weeklyHours?.map((item) => number(item.hours)) || [],
      borderColor: "#2563eb",
      backgroundColor: "rgba(37, 99, 235, 0.12)",
      fill: true,
      tension: 0.35,
      pointRadius: 3,
    }],
  }), [data]);

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="command-error" role="alert">
        <FiAlertCircle />
        <h1>Dashboard unavailable</h1>
        <p>{error}</p>
        <button onClick={loadDashboard}><FiRefreshCw /> Try again</button>
      </div>
    );
  }

  const summary = data?.summary || {};
  const organizationView = data?.scope === "organization";
  const hourOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, grid: { color: "#e8edf5" } }, x: { grid: { display: false } } },
  };
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: { legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 8 } } },
  };
  const quickActions = [
    ...(user?.role === "admin" ? [
      { label: "Create project", icon: <FiFolder />, action: () => setOpenForm("projects") },
      { label: "Create issue", icon: <FiPlus />, action: () => setOpenForm("issue") },
    ] : []),
    { label: "Start working", icon: <FiActivity />, action: () => navigate("/dashboard/work") },
    { label: "Timesheet", icon: <FiClock />, action: () => navigate("/dashboard/time-sheets") },
    { label: "Upload report", icon: <FiFileText />, action: () => setOpenForm("reports") },
    { label: "View calendar", icon: <FiCalendar />, action: () => navigate("/dashboard/calendar") },
  ];

  return (
    <main className="command-dashboard">
      <section className="command-welcome">
        <div>
          <span className="command-eyebrow">{organizationView ? "Organization overview" : "My workspace"}</span>
          <h1>Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, {user?.name?.split(" ")[0]}</h1>
          <p>{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })} · {user?.role}</p>
        </div>
        <button className="command-refresh" onClick={loadDashboard}><FiRefreshCw /> Refresh</button>
      </section>

      <section className="command-actions" aria-label="Quick actions">
        {quickActions.map((item) => (
          <button key={item.label} onClick={item.action}>{item.icon}<span>{item.label}</span></button>
        ))}
      </section>

      <section className="command-metrics">
        <MetricCard icon={<FiFolder />} label="Projects" value={summary.projects?.total} detail="Organization projects" tone="blue" onClick={() => navigate("/dashboard/projects")} />
        <MetricCard icon={<FiCheckSquare />} label="Open issues" value={summary.issues?.open_count} detail={`${number(summary.issues?.in_progress)} in progress`} tone="amber" onClick={() => navigate("/dashboard/issues?status=To%20Do")} />
        <MetricCard icon={<FiUsers />} label={organizationView ? "Working now" : "Work status"} value={summary.employees?.workingNow} detail={`${number(summary.employees?.presentToday)} present today`} tone="green" onClick={() => navigate("/dashboard/work?status=working")} />
        <MetricCard icon={<FiClock />} label="Pending timesheets" value={summary.timesheets?.pending} detail={`${number(summary.timesheets?.week_hours)} hours this week`} tone="violet" onClick={() => navigate(organizationView ? "/dashboard/admin-timesheets?status=Pending" : "/dashboard/time-sheets")} />
        <MetricCard icon={<FiFileText />} label="Reports" value={summary.reports?.total} detail={`${number(summary.reports?.recent)} submitted this week`} tone="cyan" onClick={() => navigate("/dashboard/reports")} />
        <MetricCard icon={<FiCalendar />} label="Upcoming holidays" value={data?.upcomingHolidays?.length} detail="Next scheduled dates" tone="rose" onClick={() => navigate("/dashboard/calendar")} />
      </section>

      <section className="command-grid command-grid-charts">
        <Widget title="Issue status" subtitle="Live distribution across available work items">
          <div className="command-chart">
            {issueChart.labels.length ? <Doughnut data={issueChart} options={doughnutOptions} /> :
              <EmptyState title="No issues yet" message="Issue status data will appear after work items are created." action="Open issues" onAction={() => navigate("/dashboard/issues")} />}
          </div>
        </Widget>
        <Widget title="Weekly work hours" subtitle="Recorded work sessions over the last seven days">
          <div className="command-chart">
            {hoursChart.labels.length ? <Line data={hoursChart} options={hourOptions} /> :
              <EmptyState title="No recorded hours" message="Start work to populate the weekly trend." action="Start working" onAction={() => navigate("/dashboard/work")} />}
          </div>
        </Widget>
      </section>

      <section className="command-grid command-grid-main">
        <Widget title="Recent issues" subtitle="Latest work items from the database" className="command-span-two"
          action={<button className="command-link" onClick={() => navigate("/dashboard/issues")}>View all</button>}>
          {data.recentIssues?.length ? (
            <div className="command-table-wrap">
              <table className="command-table">
                <thead><tr><th>Key</th><th>Summary</th><th>Priority</th><th>Assignee</th><th>Status</th></tr></thead>
                <tbody>{data.recentIssues.map((issue) => (
                  <tr key={issue.id} onClick={() => navigate(`/dashboard/issues/${issue.id}`)}>
                    <td className="command-key">{issue.project_key}-{issue.id}</td>
                    <td>{issue.summary}</td><td>{issue.priority || "—"}</td>
                    <td>{issue.assignee_name || "Unassigned"}</td>
                    <td><span className="command-badge">{issue.status || "Unspecified"}</span></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          ) : <EmptyState title="No recent issues" message="There are no work items in your current dashboard scope." action="Open issues" onAction={() => navigate("/dashboard/issues")} />}
        </Widget>

        <Widget title="Upcoming holidays" subtitle="Next dates on the organization calendar">
          {data.upcomingHolidays?.length ? <div className="command-events">
            {data.upcomingHolidays.map((event) => (
              <button key={event.id} onClick={() => navigate("/dashboard/calendar")}>
                <span className="command-event-date">
                  <strong>{new Date(event.date).toLocaleDateString(undefined, { day: "2-digit" })}</strong>
                  <small>{new Date(event.date).toLocaleDateString(undefined, { month: "short" })}</small>
                </span>
                <span><strong>{event.title}</strong><small>{event.type || "Holiday"}</small></span>
              </button>
            ))}
          </div> : <EmptyState title="Calendar is clear" message="No future holidays are currently scheduled." action="View calendar" onAction={() => navigate("/dashboard/calendar")} />}
        </Widget>
      </section>

      <section className="command-grid command-grid-main">
        <Widget title="Recent projects" subtitle="Progress calculated from completed versus total issues" className="command-span-two"
          action={<button className="command-link" onClick={() => navigate("/dashboard/projects")}>View all</button>}>
          {data.recentProjects?.length ? <div className="command-projects">
            {data.recentProjects.map((project) => {
              const progress = number(project.issue_count)
                ? Math.round(number(project.completed_count) / number(project.issue_count) * 100)
                : 0;
              return <button key={project.id} onClick={() => navigate(`/dashboard/issues?project=${project.id}`)}>
                <span className="command-project-avatar">{project.projectKey?.slice(0, 2)}</span>
                <span className="command-project-copy"><strong>{project.name}</strong><small>{project.owner_name || "No owner"} · {number(project.issue_count)} issues</small>
                  <progress className="command-progress" value={progress} max="100" aria-label={`${progress}% complete`} /></span>
                <b>{progress}%</b>
              </button>;
            })}
          </div> : <EmptyState title="No projects" message="Projects will appear here after creation." action="Open projects" onAction={() => navigate("/dashboard/projects")} />}
        </Widget>

        <Widget title={organizationView ? "Employee status" : "My status"} subtitle="Latest status recorded today">
          {data.employees?.length ? <div className="command-people">
            {data.employees.slice(0, 8).map((employee) => (
              <button key={employee.id} onClick={() => navigate(`/dashboard/work?user=${employee.id}`)}>
                <span className="command-avatar">{employee.user_name?.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span>
                <span><strong>{employee.user_name}</strong><small>{employee.project_name || "No project selected"}</small></span>
                <i className={employee.login_status === 1 ? "is-online" : "is-offline"} title={employee.login_status === 1 ? "Working" : "Offline"} />
              </button>
            ))}
          </div> : <EmptyState title="No employee activity" message="No work session has been recorded today." />}
        </Widget>
      </section>

      <Widget title="Activity timeline" subtitle="Latest recorded work sessions" action={<button className="command-link" onClick={() => navigate("/dashboard/all-reports")}>Attendance reports</button>}>
        {data.recentWork?.length ? <div className="command-timeline">
          {data.recentWork.map((activity) => (
            <button key={activity.id} onClick={() => navigate(`/dashboard/work?user=${activity.user_id}`)}>
              <span className="command-timeline-dot"><FiActivity /></span>
              <span><strong>{activity.user_name}</strong><p>{activity.working_on || activity.worked_on || "Updated work status"} · {activity.project_name || "No project"}</p></span>
              <time>{activity.login_time ? new Date(activity.login_time).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "Today"}</time>
            </button>
          ))}
        </div> : <EmptyState title="No recent activity" message="Recorded work activity will appear here, latest first." />}
      </Widget>

      <FormView openForm={openForm} setOpenForm={setOpenForm} currentUserId={user?.id} />
    </main>
  );
};

export default AdminDashboard;
