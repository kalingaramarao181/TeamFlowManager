import React from 'react';
import './FiltersBar.css';

const FiltersBar = () => {
  return (
    <div className="filters-bar">
      <select>
        <option value="">All Modules</option>
        <option value="auth">Authentication</option>
        <option value="dashboard">Dashboard</option>
        <option value="reports">Reports</option>
      </select>

      <select>
        <option value="">All Statuses</option>
        <option value="working">Working</option>
        <option value="idle">Idle</option>
        <option value="offline">Offline</option>
      </select>

      <input type="date" />

      <button>Apply</button>
    </div>
  );
};

export default FiltersBar;
