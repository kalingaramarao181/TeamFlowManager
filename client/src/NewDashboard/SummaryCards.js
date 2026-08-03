import React from 'react';
import './SummaryCards.css';

const SummaryCards = ({ summaryData }) => {
  const { totalEmployees, activeToday, avgWorkingHours, modulesInProgress } = summaryData;
  const summary = [
    { title: "Total Employees", value: totalEmployees, color: "#4CAF50" },
    { title: "Active Today", value: activeToday, color: "#2196F3" },
    { title: "Avg. Working Hours", value: avgWorkingHours, color: "#FFC107" },
    { title: "Projects In Progress", value: modulesInProgress, color: "#FF5722" }
  ];

  return (
    <div className="summary-cards-container">
      {summary.map((item, index) => (
        <div
          key={index}
          className="summary-card"
          style={{ borderColor: item.color }}
        >
          <h4>{item.title}</h4>
          <p>{item.value}</p>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
