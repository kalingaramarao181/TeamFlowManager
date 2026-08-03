import React from 'react';
import './styles/Loader.css';

const Loader = () => {
  return (
    <div className="tfm-loader-wrapper">
      <div className="tfm-loader-spinner">
        <div className="circle project"></div>
        <div className="circle team"></div>
        <div className="circle task"></div>
      </div>
      <span className="tfm-loader-text">Loading your workspace...</span>
    </div>
  );
};

export default Loader;
