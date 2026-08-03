import React, { useEffect, useState } from "react";
import Pagination from "../component/Pagination";
import Reports from "../component/Reports";
import { baseUrl } from "../Config/env";
import { getAllReports } from "../api/reportsApi";
import { FaFilter } from "react-icons/fa";
import { convertDate } from "../utils/dateFormater";
import { exportToExcel } from "../utils/exportToExcel";
import ErrorComponent from "../component/ErrorComponent";
import "./index.css";
import Loader from "../component/Loader";

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [userType, setUserType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchReports(currentPage);
  }, [currentPage]);

  const fetchReports = async (page) => {
    try {
      const response = await getAllReports(
        page,
        itemsPerPage,
        startDate,
        endDate,
        userType
      );
      setReports(response.reports);
      
      setTotalPages(response.totalPages);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    }
  };

  const handleFilter = () => {
    if (!startDate || !endDate) {
      alert("Please fill out both start and end dates!");
      return;
    }
    setCurrentPage(1);
    fetchReports(1);
  };

  const handleDownload = () => {
  const headers = ["Full Name", "Report Text", "Date", "Download Link"];

  const rowMapper = (report) => [
    report.user_name,
    report.reportText,
    convertDate(report.createdAt),
    { f: `HYPERLINK("${baseUrl}${report.reportImage}", "Download")` },
  ];

  exportToExcel(
    reports,
    headers,
    rowMapper,
    `Reports_${startDate || "All"}_to_${endDate || "All"}`
  );
};

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="tfm-db-page-container">
      <header className="tfm-db-page-header">
        <div className="tfm-filter-group">
          <label className="tfm-filter-icon">
            <FaFilter />
          </label>
          <input
            className="tfm-filter-input"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            className="tfm-filter-input"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <select
            className="tfm-filter-input"
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
          >
            <option value="all">All</option>
            <option value="unique">Unique</option>
          </select>
          <button onClick={handleFilter} className="tfm-filter-button">
            Filter
          </button>
          <button onClick={handleDownload} className="tfm-download-button">
            Download Report
          </button>
        </div>
      </header>

      <div className="issues-table-container">
        {!loading && reports.length > 0 ? (
          <>
            <Reports reports={reports} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
        loading ? <Loader /> : <ErrorComponent message="No reports found." onRetry={() => fetchReports(currentPage)} />

        )}
      </div>
    </div>
  );
};

export default ReportsPage;
