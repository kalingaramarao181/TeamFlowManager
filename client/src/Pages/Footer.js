import React from "react";
import "./Styles/Footer.css";

const TeamFlowFooter = () => {
  return (
    <footer className="teamflow-footer">
      <div className="teamflow-footer-top">
        <div className="teamflow-footer-column teamflow-fade-in-left">
          <h3 className="teamflow-footer-heading">TeamFlow</h3>
          <p className="teamflow-footer-description">
            TeamFlow is your go-to solution for streamlined team management,
            real-time collaboration, and productivity tracking.
          </p>
        </div>
        <div className="teamflow-footer-column teamflow-fade-in-bottom">
          <h4 className="teamflow-footer-subheading">Product</h4>
          <ul className="teamflow-footer-list">
            <li className="teamflow-footer-list-item">Features</li>
            <li className="teamflow-footer-list-item">Pricing</li>
            <li className="teamflow-footer-list-item">Integrations</li>
            <li className="teamflow-footer-list-item">Enterprise</li>
          </ul>
        </div>
        <div className="teamflow-footer-column teamflow-fade-in-right">
          <h4 className="teamflow-footer-subheading">Resources</h4>
          <ul className="teamflow-footer-list">
            <li className="teamflow-footer-list-item">Help Center</li>
            <li className="teamflow-footer-list-item">Blog</li>
            <li className="teamflow-footer-list-item">Guides</li>
            <li className="teamflow-footer-list-item">Community</li>
          </ul>
        </div>
        <div className="teamflow-footer-column teamflow-fade-in-up">
          <h4 className="teamflow-footer-subheading">Contact</h4>
          <p className="teamflow-footer-contact">Email: support@teamflow.io</p>
          <p className="teamflow-footer-contact">Phone: +1 800 123 4567</p>
          <div className="teamflow-footer-social-icons">
            <i className="teamflow-social-icon fab fa-facebook"></i>
            <i className="teamflow-social-icon fab fa-twitter"></i>
            <i className="teamflow-social-icon fab fa-linkedin"></i>
            <i className="teamflow-social-icon fab fa-instagram"></i>
          </div>
        </div>
      </div>

      <div className="teamflow-footer-bottom teamflow-slide-in">
        <p className="teamflow-footer-bottom-text">© {new Date().getFullYear()} TeamFlow Inc. All rights reserved.</p>
        <div className="teamflow-footer-legal-links">
          <a href="/terms" className="teamflow-legal-link">Terms of Service</a>
          <a href="/privacy" className="teamflow-legal-link">Privacy Policy</a>
          <a href="/security" className="teamflow-legal-link">Security</a>
        </div>
      </div>
    </footer>
  );
};

export default TeamFlowFooter;
