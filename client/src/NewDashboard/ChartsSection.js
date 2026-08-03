import React from 'react';
import './ChartsSection.css';

const ChartsSection = () => {
  return (
    <div className="charts-section">
      <div className="chart-card">
        <h3>Hours Woking Users</h3>
        <div className="pie-chart">
          <div className="slice slice1"></div>
          <div className="slice slice2"></div>
          <div className="slice slice3"></div>
        </div>
        <div className="legend">
          <span><span className="color color1"></span> Dashboard</span>
          <span><span className="color color2"></span> Auth</span>
          <span><span className="color color3"></span> Reports</span>
        </div>
      </div>

      <div className="chart-card">
        <h3>Working Hours (Bar)</h3>
        <div className="bar-chart">
          <div className="bar-label">John</div>
          <div className="bar" style={{ height: '80%' }}></div>
          <div className="bar-label">Jane</div>
          <div className="bar" style={{ height: '60%' }}></div>
          <div className="bar-label">Raj</div>
          <div className="bar" style={{ height: '30%' }}></div>
        </div>
      </div>
    </div>
  );
};

export default ChartsSection;
