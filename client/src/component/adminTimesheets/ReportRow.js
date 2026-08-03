const ReportRow = ({ report }) => {
  return (
    <tr>
      {/* Name */}
      <td data-label="Employee">{report.name}</td>

      {/* Week */}
      <td data-label="Week">
        {report.week_label} <br />
      </td>

      {/* Worked On */}
      <td data-label="Worked on">{report.worked_on}</td>
      <td data-label="Total hours">{report.total_hours || 0}h</td>
      <td data-label="Status"><span className={`manager-status status-${String(report.status).toLowerCase()}`}>{report.status}</span></td>
    </tr>
  );
};

export default ReportRow;
