import React from 'react';
import './EmployeesTable.css';

const EmployeesTable = ({activeEmployees}) => {
  return (
    <div className="employees-table-container">
      <h3>Employee Activity</h3>
      <table className="employees-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Working Project</th>
            <th>Working Module</th>
            <th>Working On</th>
          </tr>
        </thead>
        <tbody>
          {activeEmployees.map(emp => (
            <tr key={emp.id}>
              <td>{emp.user_name}</td>
              <td className={`status ${emp.logout_time ? "offline" :  'working'}`}>{emp.logout_time ? "Offline" :  'Online'}</td>
              <td>{emp.project_name}</td>
              <td>{emp.module_name}</td>
              <td>{emp.working_on}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeesTable;
