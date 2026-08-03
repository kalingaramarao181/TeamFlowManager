import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiAlertTriangle, FiBarChart2, FiCheckCircle, FiClock, FiDownload,
  FiEye, FiRefreshCw, FiSearch, FiUsers, FiX, FiXCircle,
} from "react-icons/fi";
import Pagination from "../component/Pagination";
import {
  getAdminTimesheetDetail, getAdminTimesheetSummary, getAdminWeeklyReports,
  updateAdminTimesheetStatus,
} from "../api/timeSheetApi";
import "./Styles/adminTimesheetReports.css";

const initialFilters = { name: "", weekNo: "", year: "", status: "" };
const number = (value) => Number(value || 0);
const dateTime = (value) => value ? new Date(value).toLocaleString() : "—";

const AdminTimesheetReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [summary, setSummary] = useState({});
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const limit = 10;

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [reportResult, summaryResult] = await Promise.all([
        getAdminWeeklyReports({ page, limit, ...appliedFilters }),
        getAdminTimesheetSummary(),
      ]);
      setReports(reportResult.data.reports || []);
      setTotal(number(reportResult.data.total));
      setSummary(summaryResult.data.summary || {});
    } catch (err) {
      setError(err.response?.data?.message || "Admin timesheets could not be loaded.");
    } finally { setLoading(false); }
  }, [appliedFilters, page]);

  useEffect(() => { load(); }, [load]);

  const metrics = useMemo(() => [
    { label: "Employees", value: summary.total_employees, icon: FiUsers, tone: "blue" },
    { label: "Submitted today", value: summary.submitted_today, icon: FiCheckCircle, tone: "green" },
    { label: "Pending review", value: summary.pending, icon: FiClock, tone: "amber" },
    { label: "Approved", value: summary.approved, icon: FiCheckCircle, tone: "green" },
    { label: "Rejected", value: summary.rejected, icon: FiXCircle, tone: "red" },
    { label: "Missing this week", value: summary.missing_current_week, icon: FiAlertTriangle, tone: "red" },
    { label: "Weekly hours", value: `${number(summary.weekly_hours).toFixed(1)}h`, icon: FiBarChart2, tone: "violet" },
    { label: "Monthly hours", value: `${number(summary.monthly_hours).toFixed(1)}h`, icon: FiBarChart2, tone: "blue" },
  ], [summary]);

  const apply = (event) => {
    event.preventDefault();
    setPage(1);
    setAppliedFilters(filters);
  };
  const reset = () => {
    setFilters(initialFilters); setAppliedFilters(initialFilters); setPage(1);
  };
  const openDetails = async (id) => {
    setDetailLoading(true); setError("");
    try {
      const response = await getAdminTimesheetDetail(id);
      setSelected(response.data.rows || []);
    } catch (err) { setError(err.response?.data?.message || "Timesheet details could not be loaded."); }
    finally { setDetailLoading(false); }
  };
  const changeStatus = async (id, status) => {
    if (!window.confirm(`${status} this complete weekly timesheet?`)) return;
    try {
      const response = await updateAdminTimesheetStatus(id, status);
      setNotice(response.data.message); setSelected(null); await load();
    } catch (err) { setError(err.response?.data?.message || "Status could not be updated."); }
  };
  const exportCsv = () => {
    const rows = [["Employee", "Projects", "Week", "Hours", "Status", "Submitted"]];
    reports.forEach((r) => rows.push([r.name, r.projects, r.week_label, r.total_hours, r.status, dateTime(r.created_at)]));
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "admin-timesheets.csv"; link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="admin-ts-page">
      <header className="admin-ts-hero">
        <div><span className="admin-ts-eyebrow">WORKFORCE OPERATIONS</span><h1>Admin Timesheets</h1>
          <p>Monitor weekly submissions, working hours, compliance, and approvals from one live workspace.</p></div>
        <div className="admin-ts-hero-actions">
          <button onClick={load}><FiRefreshCw /> Refresh</button>
          <button className="primary" onClick={exportCsv} disabled={!reports.length}><FiDownload /> Export CSV</button>
        </div>
      </header>

      {error && <div className="admin-ts-message error">{error}<button onClick={() => setError("")}><FiX /></button></div>}
      {notice && <div className="admin-ts-message success">{notice}<button onClick={() => setNotice("")}><FiX /></button></div>}

      <section className="admin-ts-metrics" aria-label="Timesheet summary">
        {metrics.map(({ label, value, icon: Icon, tone }) => <article key={label} className={`admin-ts-metric ${tone}`}>
          <span><Icon /></span><div><small>{label}</small><strong>{loading ? "—" : value ?? 0}</strong></div>
        </article>)}
      </section>

      <section className="admin-ts-panel">
        <div className="admin-ts-panel-title"><div><h2>Submission register</h2><p>{total} weekly submissions found</p></div></div>
        <form className="admin-ts-filters" onSubmit={apply}>
          <label className="admin-ts-search"><FiSearch /><input value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} placeholder="Search employee" /></label>
          <label><span>Status</span><select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}><option value="">All statuses</option><option>Pending</option><option>Approved</option><option>Rejected</option></select></label>
          <label><span>Week</span><input type="number" min="1" max="53" value={filters.weekNo} onChange={(e) => setFilters({ ...filters, weekNo: e.target.value })} placeholder="1–53" /></label>
          <label><span>Year</span><input type="number" min="2020" max="2100" value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })} placeholder="Year" /></label>
          <button className="admin-ts-filter-button" type="submit">Apply filters</button>
          <button className="admin-ts-reset" type="button" onClick={reset}>Reset</button>
        </form>

        <div className="admin-ts-table-wrap">
          <table className="admin-ts-table"><thead><tr><th>Employee</th><th>Projects</th><th>Week range</th><th>Entries</th><th>Total</th><th>Status</th><th>Submitted</th><th>Actions</th></tr></thead>
            <tbody>{!loading && reports.map((report) => <tr key={report.id}>
              <td data-label="Employee"><strong>{report.name}</strong><small>ID {report.user_id}</small></td>
              <td data-label="Projects">{report.projects || "—"}</td><td data-label="Week">{report.week_label}</td>
              <td data-label="Entries">{report.entry_count}</td><td data-label="Total"><strong>{number(report.total_hours).toFixed(1)}h</strong></td>
              <td data-label="Status"><span className={`admin-ts-status ${String(report.status).toLowerCase()}`}>{report.status}</span></td>
              <td data-label="Submitted">{dateTime(report.created_at)}</td>
              <td data-label="Actions"><div className="admin-ts-row-actions"><button title="View details" onClick={() => openDetails(report.id)}><FiEye /></button>
                {report.status === "Pending" && <><button className="approve" title="Approve" onClick={() => changeStatus(report.id, "Approved")}><FiCheckCircle /></button><button className="reject" title="Reject" onClick={() => changeStatus(report.id, "Rejected")}><FiXCircle /></button></>}</div></td>
            </tr>)}</tbody></table>
          {loading && <div className="admin-ts-state"><span className="admin-ts-spinner" />Loading live timesheets…</div>}
          {!loading && !reports.length && <div className="admin-ts-state"><FiClock /><h3>No timesheets found</h3><p>Try changing the active filters.</p></div>}
        </div>
        {total > limit && <Pagination currentPage={page} totalPages={Math.ceil(total / limit)} onPageChange={setPage} />}
      </section>

      {(selected || detailLoading) && <div className="admin-ts-modal-backdrop" onMouseDown={() => !detailLoading && setSelected(null)}>
        <section className="admin-ts-drawer" role="dialog" aria-modal="true" aria-label="Timesheet details" onMouseDown={(e) => e.stopPropagation()}>
          {detailLoading ? <div className="admin-ts-state"><span className="admin-ts-spinner" />Loading details…</div> : <TimesheetDetail rows={selected} onClose={() => setSelected(null)} onStatus={changeStatus} />}
        </section></div>}
    </main>
  );
};

const TimesheetDetail = ({ rows, onClose, onStatus }) => {
  const first = rows[0]; const total = rows.reduce((sum, row) => sum + number(row.total_hours), 0);
  const days = [["Mon", "mon_hours"], ["Tue", "tue_hours"], ["Wed", "wed_hours"], ["Thu", "thu_hours"], ["Fri", "fri_hours"], ["Sat", "sat_hours"], ["Sun", "sun_hours"]];
  return <><header className="admin-ts-drawer-head"><div><span>WEEK {first.week_no} · {first.year}</span><h2>{first.employee_name}</h2><p>{first.email}</p></div><button onClick={onClose}><FiX /></button></header>
    <div className="admin-ts-detail-summary"><div><small>Weekly total</small><strong>{total.toFixed(1)}h</strong></div><div><small>Projects</small><strong>{new Set(rows.map((r) => r.project_id)).size}</strong></div><div><small>Status</small><span className={`admin-ts-status ${first.status.toLowerCase()}`}>{first.status}</span></div></div>
    <div className="admin-ts-detail-list">{rows.map((row) => <article key={row.id}><div><h3>{row.project_name}</h3><p>{row.task_name}</p><small>{row.worked_on}</small></div><div className="admin-ts-day-hours">{days.map(([label, key]) => <span key={key}><small>{label}</small><b>{number(row[key])}h</b></span>)}</div></article>)}</div>
    {first.status === "Pending" && <footer className="admin-ts-drawer-actions"><button className="reject" onClick={() => onStatus(first.id, "Rejected")}><FiXCircle /> Reject</button><button className="approve" onClick={() => onStatus(first.id, "Approved")}><FiCheckCircle /> Approve week</button></footer>}
  </>;
};

export default AdminTimesheetReportsPage;
