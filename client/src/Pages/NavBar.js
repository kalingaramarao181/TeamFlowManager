import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import "./Styles/NavBar.css";
import FormView from "../Forms/FormView";

const TeamFlowNavbar = () => {
  const [openForm, setOpenForm] = useState(null);
  return (
    <>
      <nav className="teamflow-navbar">
        <div className="teamflow-navbar-logo">TeamFlow</div>
        <ul className="teamflow-navbar-links">
          <li className="teamflow-navbar-link">
            <Link to="/" className="teamflow-link">
              Home
            </Link>
          </li>
          <li className="teamflow-navbar-link">
            <Link to="/aboutpage" className="teamflow-link">
              About
            </Link>
          </li>
          <li className="teamflow-navbar-link">
            <Link to="/featurepage" className="teamflow-link">
              Features
            </Link>
          </li>
          <li className="teamflow-navbar-link">
            <Link to="/contactpage" className="teamflow-link">
              Contact
            </Link>
          </li>
        </ul>

        <div className="teamflow-navbar-right">
          <div className="teamflow-navbar-search">
            <input
              type="text"
              placeholder="Search..."
              className="teamflow-search-input"
            />
            <FiSearch className="teamflow-search-icon" />
          </div>
          <button
            className="teamflow-signin-button"
            onClick={() => setOpenForm("signin")}
          >
            Sign In
          </button>
        </div>
      </nav>
      <FormView openForm={openForm} setOpenForm={setOpenForm} />
    </>
  );
};

export default TeamFlowNavbar;
