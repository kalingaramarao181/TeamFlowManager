// src/components/ReportsTable.jsx
import React from "react";
import { baseUrlImg } from "../Config/env";
import { convertDateAndTime } from "../utils/dateFormater";


const Reports = ({ reports }) => {
  if (!reports || reports.length === 0) {
    return <p>No reports available.</p>;
  }

  const hasUserName = reports[0].hasOwnProperty("user_name");
  return (
      <table className="tfm-table">
        <thead>
          <tr>
            {hasUserName && <th>Name</th>}
            <th>Report Text</th>
            <th>Date of Creation</th>
            <th>Report</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.id}>
              {hasUserName && <td>{report.user_name}</td>}
              <td>{report.reportText}</td>
              <td>{convertDateAndTime(report.createdAt)}</td>
              <td>
                <a
                  href={`${baseUrlImg}${report.reportImage}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Download
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
  );
};

export default Reports;
