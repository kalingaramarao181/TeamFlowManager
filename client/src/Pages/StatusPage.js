import React, { useEffect, useState } from "react";
import "./index.css";
import { getAllReports, getReportsByUserId } from "../api/reportsApi";
import Reports from "../component/Reports";
import Pagination from "../component/Pagination";
import ErrorComponent from "../component/ErrorComponent";
import { getUserDataFromCookies } from "../utils/cookiesData";
import Loader from "../component/Loader";

const StatusPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [issueStatus, setIssueStatus] = useState(null);
  const [userData, setUserData] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;
  const data = getUserDataFromCookies();
  console.log("User Data:", data);

  useEffect(() => {
    fetchReports(currentPage);
  }, [currentPage]);

  const fetchReports = async (page) => {
    try {
      setLoading(true);
      const response = await getReportsByUserId(data.id, page, itemsPerPage);
      setReports(response.reports);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="tfm-db-page-container">
      <header className="card-header">
        <div
          className="status-border"
          style={{
            backgroundColor:
              issueStatus === "Open"
                ? "green"
                : issueStatus === "In Progress"
                ? "orange"
                : issueStatus === "Closed"
                ? "red"
                : "gray",
          }}
        ></div>
        {/* <div className="card-header-content">
          <h4 className="issue-title">Present Your Work Status</h4>
        </div> */}
      </header>

      {/* <div className="card-details">
        <p>
          <strong>{issueStatus || "No status available"}</strong>
        </p>
      </div> */}

      {loading ? (
        <Loader />
      ) : reports.length > 0 ? (
        <>
          <Reports
            reports={reports}
            loading={loading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <ErrorComponent
          message="No reports found."
          onRetry={() => fetchReports(currentPage)}
        />
      )}
    </div>
  );
};

export default StatusPage;
