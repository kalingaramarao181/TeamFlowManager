import React from 'react';
import './styles/ErrorComponent.css';

const ErrorComponent = ({ message = "Something went wrong!", onRetry }) => {
  return (
    <div className="error-container">
      <div className="error-box">
        <h1 className="error-title">Oops!</h1>
        <p className="error-message">{message}</p>
        <button className="retry-button" onClick={onRetry}>
          Try Again
        </button>
      </div>
    </div>
  );
};

export default ErrorComponent;
