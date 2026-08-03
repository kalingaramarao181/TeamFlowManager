// src/components/ReportsTable.jsx
import React from "react";
import { convertTime, convertDate } from "../utils/dateFormater";

const AllReports = ({ reports }) => {
  return (
    <table className="tfm-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Employe Names</th>
          <th>Login Time</th>
          <th>Logout Time</th>
        </tr>
      </thead>
      <tbody>
        {reports.map((report) => (
          <tr key={report.id}>
            <td>
              {convertDate(report.date)} ({report.employees.length})
            </td>
            <td>
              {report.employees.map((emp) => (
                <p>{emp.employee_name}</p>
              ))}
            </td>

            <td>
              {report.employees.map((emp) => (
                <p>{convertTime(emp.login_time)}</p>
              ))}
            </td>

            <td>
              {report.employees.map((emp) => (
                <p>{convertTime(emp.logout_time)}</p>
              ))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AllReports;
