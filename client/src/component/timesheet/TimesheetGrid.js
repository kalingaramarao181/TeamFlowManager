import { FiTrash2 } from "react-icons/fi";

const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const TimesheetGrid = ({ rows, setRows, disabled, dailyTotals }) => {
  const updateCell = (rowIndex, field, rawValue) => {
    const value = Math.min(24, Math.max(0, Number(rawValue || 0)));
    setRows((current) => current.map((row, index) =>
      index === rowIndex ? { ...row, [field]: value } : row));
  };
  const removeRow = (rowIndex) =>
    setRows((current) => current.filter((_, index) => index !== rowIndex));

  if (!rows.length) return <div className="timesheet-empty"><FiTrash2 /><strong>No time entries yet</strong><p>Add a project, leave, or training entry to begin this week.</p></div>;

  return <div className="timesheet-grid-wrap"><table className="timesheet-table">
    <thead><tr><th>Type, project & activity</th>{days.map((day) => <th key={day} className={["sat", "sun"].includes(day) ? "weekend-col" : ""}>{day.slice(0, 1).toUpperCase() + day.slice(1)}</th>)}<th>Total</th>{!disabled && <th aria-label="Actions" />}</tr></thead>
    <tbody>{rows.map((row, index) => {
      const total = days.reduce((sum, day) => sum + Number(row[day] || 0), 0);
      return <tr key={row.id || `${row.project_id}-${row.task_name}`}>
        <td data-label="Work"><strong>{row.project_name}</strong><span>{row.task_name}</span><small>{(row.entry_type || "project").toUpperCase()} · {row.worked_on}</small></td>
        {days.map((day) => <td key={day} data-label={day.toUpperCase()} className={["sat", "sun"].includes(day) ? "weekend-cell" : ""}><input aria-label={`${row.project_name} ${day} hours`} type="number" min="0" max="24" step=".5" value={row[day] || 0} disabled={disabled} onChange={(event) => updateCell(index, day, event.target.value)} /></td>)}
        <td data-label="Total" className="total">{total}h</td>
        {!disabled && <td data-label="Action"><button className="timesheet-remove" onClick={() => removeRow(index)} aria-label={`Remove ${row.task_name}`}><FiTrash2 /></button></td>}
      </tr>;
    })}</tbody>
    <tfoot><tr><td>Daily totals</td>{days.map((day) => <td key={day} className={Number(dailyTotals?.[day] || 0) > 24 ? "hours-warning" : ""}>{Number(dailyTotals?.[day] || 0)}h</td>)}<td>{days.reduce((sum, day) => sum + Number(dailyTotals?.[day] || 0), 0)}h</td>{!disabled && <td />}</tr></tfoot>
  </table></div>;
};

export default TimesheetGrid;
