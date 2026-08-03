const ReportsFilters = ({
  name,
  setName,
  weekNo,
  setWeekNo,
  onFilter,
  onDownload,
}) => {
  return (
    <div className="report-filters">
      <input
        type="text"
        placeholder="Search Employee Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="number"
        placeholder="Week No"
        value={weekNo}
        onChange={(e) => setWeekNo(e.target.value)}
      />

      <button className="btn filter-btn" onClick={onFilter}>
        Filter
      </button>

      <button className="btn download-btn" onClick={onDownload}>
        Export CSV
      </button>
    </div>
  );
};

export default ReportsFilters;
