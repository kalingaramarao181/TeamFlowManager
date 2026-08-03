import React, { useEffect, useState } from "react";
import Pagination from "../component/Pagination";
import { FaFilter } from "react-icons/fa";
import { convertDate, convertTime } from "../utils/dateFormater";
import { exportToExcel } from "../utils/exportToExcel";
import ErrorComponent from "../component/ErrorComponent";
import "./index.css";
import Loader from "../component/Loader";
import { getDaywiseReports } from "../api/workStatusApi";
import AllReports from "../component/AllReports";

const AllReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchReports(currentPage);
  }, [currentPage]);

  const fetchReports = async (page) => {
    try {
      const response = await getDaywiseReports(
        startDate,
        endDate,
        page,
        itemsPerPage,
        
      );
      setReports(response.reports);
      console.log(response);
      
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

 const handleDownload = async () => {
  try {
    // Fetch ALL REPORTS (no pagination)
    const response = await getDaywiseReports(
      startDate,
      endDate,
      1,            
      100000 
    );

    const allReports = response.reports;

    if (!allReports || allReports.length === 0) {
      alert("No reports available to download");
      return;
    }

    const headers = ["Date", "Employee Name", "Login Time", "Logout Time"];
    const rows = [];

    allReports.forEach((report) => {
      const reportDate = convertDate(report.date);
      const count = report.employees.length;

      report.employees.forEach((emp, index) => {
        rows.push([
          index === 0 ? `${reportDate} (${count})` : "",
          emp.employee_name,
          convertTime(emp.login_time),
          convertTime(emp.logout_time),
        ]);
      });
    });

    exportToExcel(
      rows,
      headers,
      `Attendance_${startDate || "All"}_to_${endDate || "All"}`
    );

  } catch (err) {
    console.error("Download failed:", err);
    alert("Failed to download full reports.");
  }
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
            <AllReports reports={reports} />
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

export default AllReportsPage;
