import React from "react";
import { baseUrl, baseUrlImg } from "../Config/env";
import { convertTime } from "../utils/dateFormater";
import "./styles/index.css"; // Assuming you have a CSS file for styling

const StatusReports = ({ reports }) => {
  console.log("Rendering StatusReports with reports:", reports);

  return (
    <table className="tfm-table">
      <thead>
        <tr>
          <th>Login Time</th>
          <th>Logout Time</th>
          <th>Project</th>
          <th>Module</th>
          <th>Active Assignment</th>
          <th>Delivered</th>
          <th>Documents</th>
        </tr>
      </thead>
      <tbody>
        {reports.map((report) => (
          <tr key={report.id}>
            <td>{convertTime(report.login_time)}</td>
            <td>{report.logout_time ? convertTime(report.logout_time) : "Online"}</td>
            <td>{report.project_name}</td>
            <td>{report.module_name}</td>
            <td>{report.working_on}</td>
            <td>{report.worked_on}</td>
            <td>
              {report.documents && report.documents.length > 0 ? (
                <ul className="document-list">
                  {report.documents.map((doc, index) => (
                    <li key={doc.id}>
                      <a
                        href={`${baseUrlImg}uploads/DailyStatusReports/${doc.file_name}`}
                        target="_blank"
                        rel="noreferrer"
                        className="doc-link"
                      >
                        Document {index + 1}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="no-documents">No documents</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default StatusReports;
