import React from "react";
import "./styles/Pagination.css"; // You can style pagination buttons here

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const renderPages = () => {
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1, 2);
      if (currentPage > 3 && currentPage < totalPages - 2) {
        pages.push("...");
        pages.push(currentPage);
        pages.push("...");
      } else {
        pages.push("...");
      }
      pages.push(totalPages - 1, totalPages);
    }

    return pages.map((page, index) =>
      page === "..." ? (
        <span key={index} className="dots">...</span>
      ) : (
        <button
          key={page}
          className={`page-button ${currentPage === page ? "active" : ""}`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      )
    );
  };

  return (
    <div className="pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="page-button"
      >
        Prev
      </button>
      {renderPages()}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="page-button"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
