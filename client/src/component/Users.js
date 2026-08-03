// components/UsersTable.jsx
import React from "react";

const Users = ({
  users,
  indexOfFirst,
  makeAdmin,
  removeAdmin,
}) => {
  return (
    <div className="tfm-table-container">
      <table className="tfm-table">
        <thead>
          <tr>
            <th>S. No</th>
            <th>Full Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user.id}>
              <td>{indexOfFirst + index + 1}</td>
              <td>{user.full_name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <button
                  className="tfm-filter-button"
                  onClick={() => makeAdmin(user.id)}
                >
                  Make Admin
                </button>
                <button
                  className="tfm-download-button"
                  onClick={() => removeAdmin(user.id)}
                >
                  Remove Admin
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Users;
