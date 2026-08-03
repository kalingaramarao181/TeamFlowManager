import React, { useEffect, useState } from "react";
import { FaFilter } from "react-icons/fa";
import * as XLSX from "xlsx";
import Pagination from "../component/Pagination";
import Loader from "../component/Loader"
import { getAllUsers } from "../api/usersApi";
import Users from "../component/Users";
import "./index.css";
import ErrorComponent from "../component/ErrorComponent";

const SettingsPage = () => {
  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKey, setSearchKey] = useState("");
  const [loading, setLoading] = useState(false);

  const itemsPerPage = 7;

  useEffect(() => {
    fetchUsers(currentPage, searchKey);
  }, [currentPage, searchKey]);

  const fetchUsers = async (page, search) => {
    try {
      setLoading(true);
      const response = await getAllUsers(page, itemsPerPage, search);
      setUsers(response.users);
      setTotalPages(response.totalPages);
      setTotalUsers(response.totalUsers);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchKey(value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const updateUserRole = (userId, newRole) => {
    const updated = users.map((user) =>
      user.id === userId ? { ...user, role: newRole } : user
    );
    setUsers(updated);
  };

  const makeAdmin = async (userId) => {
    updateUserRole(userId, "admin");
  };

  const removeAdmin = async (userId) => {
    updateUserRole(userId, "user");
  };

  const handleDownload = () => {
    const data = users.map((user, index) => ({
      "S. No": (currentPage - 1) * itemsPerPage + index + 1,
      "Full Name": user.full_name,
      Email: user.email,
      Role: user.role,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "Users_Report.xlsx");
  };

  return (
    <div className="tfm-db-page-container">
      <div className="tfm-db-page-header">
        <div className="tfm-filter-group">
          <FaFilter className="tfm-filter-icon" />
          <input
            type="text"
            className="tfm-filter-input"
            placeholder="Search by name, email, or role"
            value={searchKey}
            onChange={handleSearchChange}
          />
        </div>
        <button className="tfm-download-button" onClick={handleDownload}>
          Download Excel
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : users.length > 0 ? (
        <>
          <Users
            users={users}
            indexOfFirst={(currentPage - 1) * itemsPerPage}
            makeAdmin={makeAdmin}
            removeAdmin={removeAdmin}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      ) : (
        <ErrorComponent message="No users found." />
      )}
    </div>
  );
};

export default SettingsPage;
