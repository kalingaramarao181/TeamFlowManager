import { useCallback, useEffect, useMemo, useState } from "react";
import { FiCheckCircle, FiClock, FiCopy, FiDownload, FiSend } from "react-icons/fi";
import WeeklyHeader from "./WeeklyHeader";
import TimesheetGrid from "./TimesheetGrid";
import DailyWorkProgress from "./DailyWorkProgress";
import {
  getAttendanceByWeek,
  getTimesheetSummary,
  getWeeklyTimesheet,
  submitWeeklyTimesheet,
} from "../../api/timeSheetApi";
import { getWeekNumber } from "../../utils/weekUtils";
import { getUserDataFromCookies } from "../../utils/cookiesData";
import "../styles/timesheet.css";

const mapRows = (rows) => rows.map((row) => ({
  id: row.id,
  entry_type: row.entry_type || "project",
  project_id: row.project_id,
  project_name: row.project_name,
  project_key: row.project_key || "",
  task_name: row.task_name,
  worked_on: row.worked_on,
  mon: Number(row.mon_hours || 0), tue: Number(row.tue_hours || 0),
  wed: Number(row.wed_hours || 0), thu: Number(row.thu_hours || 0),
  fri: Number(row.fri_hours || 0), sat: Number(row.sat_hours || 0),
  sun: Number(row.sun_hours || 0), total_hours: Number(row.total_hours || 0),
  status: row.status,
}));

const WeeklyTimesheetPage = () => {
  const user = useMemo(() => getUserDataFromCookies(), []);
  const [rows, setRows] = useState([]);
  const [weekNo, setWeekNo] = useState(getWeekNumber(new Date()));
  const [attendanceDays, setAttendanceDays] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [dailyWork, setDailyWork] = useState([]);
  const [status, setStatus] = useState("");
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState({ type: "", text: "" });

  const year = new Date().getFullYear();
  const loadWeek = useCallback(async () => {
    setLoading(true);
    setNotice({ type: "", text: "" });
    const [attendanceResult, timesheetResult, summaryResult] = await Promise.allSettled([
      getAttendanceByWeek(user.id, weekNo, year),
      getWeeklyTimesheet(user.id, weekNo, year),
      getTimesheetSummary(user.id),
    ]);
    if (attendanceResult.status === "fulfilled") {
      setAttendanceDays(attendanceResult.value.data.attendance.map((item) =>
        new Date(item.workDate).toLocaleDateString("en-CA")));
    } else setAttendanceDays([]);
    if (timesheetResult.status === "fulfilled") {
      const result = timesheetResult.value.data;
      const savedRows = result.rows || [];
      setRows(mapRows(savedRows));
      setDailyWork(result.dailyWork || []);
      setStatus(savedRows[0]?.status || "");
      setSubmitted(savedRows.length > 0 && savedRows[0]?.status !== "Rejected");
    } else {
      setRows([]); setDailyWork([]); setSubmitted(false);
      setNotice({ type: "error", text: "This week could not be loaded." });
    }
    if (summaryResult.status === "fulfilled") setSummary(summaryResult.value.data.summary || {});
    setLoading(false);
  }, [user.id, weekNo, year]);

  useEffect(() => { loadWeek(); }, [loadWeek]);

  const totals = useMemo(() => {
    const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    const byDay = Object.fromEntries(days.map((day) => [day, rows.reduce((sum, row) => sum + Number(row[day] || 0), 0)]));
    return { byDay, week: Object.values(byDay).reduce((sum, value) => sum + value, 0) };
  }, [rows]);
  const todayKey = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][new Date().getDay()];

  const addNewRow = (rowData) => {
    if (submitted) return;
    if (rows.some((row) => (row.entry_type || "project") === rowData.entry_type && String(row.project_id || "") === String(rowData.project_id || "") && row.task_name.trim().toLowerCase() === rowData.task_name.trim().toLowerCase())) {
      setNotice({ type: "error", text: "That time entry already exists in this week." });
      return;
    }
    const attendedWeekdays = new Set(attendanceDays.map((date) =>
      new Date(`${date}T12:00:00`).getDay()));
    setRows((current) => [...current, {
      ...rowData,
      mon: attendedWeekdays.has(1) ? 8 : 0,
      tue: attendedWeekdays.has(2) ? 8 : 0,
      wed: attendedWeekdays.has(3) ? 8 : 0,
      thu: attendedWeekdays.has(4) ? 8 : 0,
      fri: attendedWeekdays.has(5) ? 8 : 0,
      sat: 0, sun: 0,
    }]);
  };

  const copyPreviousWeek = async () => {
    if (submitted) return;
    try {
      const response = await getWeeklyTimesheet(user.id, weekNo - 1, year);
      const previous = mapRows(response.data.rows || []).map((row) => ({
        ...row, id: undefined, mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0,
      }));
      if (!previous.length) return setNotice({ type: "error", text: "No entries were found in the previous week." });
      setRows(previous);
      setNotice({ type: "success", text: "Previous week entries copied." });
    } catch {
      setNotice({ type: "error", text: "Previous week could not be copied." });
    }
  };

  const submit = async () => {
    if (!rows.length || totals.week <= 0) return setNotice({ type: "error", text: "Add at least one entry with working hours before submitting." });
    if (Object.values(totals.byDay).some((hours) => hours > 24)) return setNotice({ type: "error", text: "Daily totals cannot exceed 24 hours." });
    if (!window.confirm(`Submit ${totals.week} hours for week ${weekNo}?`)) return;
    setSaving(true);
    try {
      const response = await submitWeeklyTimesheet({ user_id: user.id, week_no: weekNo, year, entries: rows });
      await loadWeek();
      setNotice({ type: "success", text: response.data.message || "Timesheet submitted for manager approval." });
    } catch (error) {
      setNotice({ type: "error", text: error?.response?.data?.message || "Timesheet submission failed." });
    } finally { setSaving(false); }
  };

  const exportCsv = () => {
    if (!rows.length) return setNotice({ type: "error", text: "There are no entries to export." });
    const values = [["Type", "Project / category", "Task / activity", "Description", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Total"]];
    rows.forEach((row) => values.push([row.entry_type || "project", row.project_name, row.task_name, row.worked_on,
      row.mon, row.tue, row.wed, row.thu, row.fri, row.sat, row.sun,
      ["mon", "tue", "wed", "thu", "fri", "sat", "sun"].reduce((sum, day) => sum + Number(row[day] || 0), 0)]));
    const csv = values.map((line) => line.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = `timesheet-week-${weekNo}-${year}.csv`; link.click(); URL.revokeObjectURL(link.href);
  };

  return <main className="timesheet-page enterprise-timesheet">
    <section className="timesheet-hero"><div><span>My timesheets</span><h1>Weekly time entry</h1><p>Record project work, leave, and training, then submit it for approval.</p></div>
      <div className="timesheet-hero-actions"><button onClick={copyPreviousWeek} disabled={submitted}><FiCopy /> Copy previous</button><button onClick={exportCsv}><FiDownload /> Export CSV</button></div></section>
    <section className="timesheet-metrics">
      <article><FiClock /><span>Today<strong>{totals.byDay[todayKey] || 0}h</strong></span></article>
      <article><FiClock /><span>This week<strong>{totals.week}h</strong></span></article>
      <article><FiSend /><span>Pending<strong>{Number(summary.pending || 0)}</strong></span></article>
      <article><FiCheckCircle /><span>Approved<strong>{Number(summary.approved || 0)}</strong></span></article>
      <article className={status ? `status-${status.toLowerCase()}` : ""}><FiCheckCircle /><span>Status<strong>{status || "Draft"}</strong></span></article>
    </section>
    {notice.text && <div className={`timesheet-notice ${notice.type}`}>{notice.text}</div>}
    <WeeklyHeader addNewRow={addNewRow} onWeekChange={setWeekNo} disabled={submitted} />
    {loading ? <div className="timesheet-loading"><i /><i /><i /></div> :
      <TimesheetGrid rows={rows} setRows={setRows} disabled={submitted} dailyTotals={totals.byDay} />}
    {!submitted && !loading && <div className="timesheet-submit-bar"><span><strong>{totals.week} hours</strong> ready for review</span><button onClick={submit} disabled={saving}><FiSend /> {saving ? "Submitting…" : "Submit timesheet"}</button></div>}
    {submitted && <div className={`timesheet-status-box ${status}`}><p>Your timesheet is <b>{status}</b>{status === "Pending" ? " and awaiting manager review." : "."}</p></div>}
    <DailyWorkProgress dailyWork={dailyWork} />
  </main>;
};

export default WeeklyTimesheetPage;
