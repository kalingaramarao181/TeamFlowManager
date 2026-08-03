import ReportRow from "./ReportRow";

const ReportsTable = ({ reports }) => {
  return (
    <table className="report-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Week</th>
          <th>Worked On</th>
          <th>Total Hours</th>
          <th>Status</th>
        </tr>
      </thead>

      <tbody>
        {reports.length > 0 ? (
          reports.map((r) => <ReportRow key={r.id} report={r} />)
        ) : (
          <tr>
            <td colSpan="5" className="report-empty-cell">
              No Reports Found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default ReportsTable;
