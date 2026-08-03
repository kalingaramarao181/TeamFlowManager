import React, { useState } from "react";
import "./Styles/Home.css";
import TeamFlowFooter from "./Footer";
import TeamFlowNavbar from "./NavBar";
import TeamFlowChatBot from "../component/ChatBot";

const faqs = [
  { question: "What is TeamFlow Manager?", answer: "TeamFlow is a productivity management tool designed for modern teams." },
  { question: "Is there a free version?", answer: "Yes, we offer a free plan with essential features." },
  { question: "Can I collaborate with my team?", answer: "Absolutely! Real-time collaboration is a core feature of TeamFlow." },
];

const TeamFlowHome = () => {
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <>
    <TeamFlowNavbar />
    <div className="teamflow-home">
      {/* Hero Section */}
      <section className="teamflow-hero-section">
        <h1 className="teamflow-animated-title">Welcome to TeamFlow Manager</h1>
        <p className="teamflow-animated-para">Organize. Collaborate. Succeed.</p>
        <button className="teamflow-cta-button">Get Started</button>
      </section>

      {/* Section 2: Image Left + Text Right */}
      <section className="teamflow-image-text-section">
        <div className="teamflow-images-left">
          <img src="images/1.jpg" className="teamflow-overlay-img1" alt="project 1" />
          {/* <img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvamVjdCUyMHRlYW18ZW58MHx8MHx8fDA%3D" className="teamflow-overlay-img2" alt="project 2" /> */}
        </div>
        <div className="teamflow-content-right teamflow-fade-in">
          <h2 className="teamflow-section-title">Seamless Team Collaboration</h2>
          <p className="teamflow-section-desc">Visualize progress through interactive dashboards. Track deadlines, milestones, and blockers in real time.
      Use timeline views to map entire project journeys. Get automatic updates as tasks are completed.
      Set custom KPIs to measure team efficiency. Highlight high-priority tasks with smart labeling.
      Integrate with calendars and notification systems. See who’s working on what—at any moment.
      Ensure no task falls through the cracks. Deliver projects faster with complete clarity..</p>
        </div>
      </section>

      {/* Section 3: Content Left + Image Right */}
      <section className="teamflow-text-image-section">
        <div className="teamflow-text-left teamflow-slide-in">
          <h2 className="teamflow-section-title">Powerful Project Tracking</h2>
          <p className="teamflow-section-desc">Connect your entire team under one digital workspace. Collaborate in real-time with shared goals and task boards.
      Tag teammates, assign tasks, and monitor progress live. Eliminate the noise of endless email threads.
      Enable cross-departmental visibility and transparency. Host documents, chats, and updates in one location.
      Break silos and foster team accountability. Maintain alignment with team-wide announcements.
      Support hybrid and remote work with ease. Make teamwork intuitive, fun, and effective..</p>
          <button className="teamflow-secondary-button">Explore Features</button>
        </div>
        <div className="teamflow-images-right">
          <img src="images/2.jpg" className="teamflow-overlay-img1" alt="project tracking" />
          {/* <img src="https://cdn.pixabay.com/photo/2024/11/10/12/33/businessman-9187765_640.jpg" className="teamflow-overlay-img2" alt="dashboard" /> */}
        </div>
      </section>

      {/* Section 4: Feature Cards */}
      <section className="teamflow-cards-section">
        <div className="teamflow-card">
          <i className="teamflow-icon">📊</i>
          <h3 className="teamflow-card-title">Analytics</h3>
          <p className="teamflow-card-desc">Visualize your team's productivity and trends over time.</p>
        </div>
        <div className="teamflow-card">
          <i className="teamflow-icon">📁</i>
          <h3 className="teamflow-card-title">Document Sharing</h3>
          <p className="teamflow-card-desc">Securely share files and keep your resources organized.</p>
        </div>
        <div className="teamflow-card">
          <i className="teamflow-icon">⏰</i>
          <h3 className="teamflow-card-title">Time Management</h3>
          <p className="teamflow-card-desc">Stay on top of deadlines with smart reminders and alerts.</p>
        </div>
      </section>

      {/* Section 5: Image Showcase */}
      <section className="teamflow-image-showcase">
        <img src="images/name1.jpg" alt="showcase 1" />
        <img src="images/name2.jpg" alt="showcase 2" />
        <img src="images/name3.jpg" alt="showcase 2" />
      </section>

      {/* Section 6: Project Highlights */}
      <section className="teamflow-project-highlight-section">
        <div className="teamflow-project-gallery">
          <img src="/images/project1.jpg" alt="project 1" />
          <img src="/images/project2.jpg" alt="project 2" />
          <img src="/images/project3.jpg" alt="project 3" />
          <img src="/images/project4.jpg" alt="project 4" />
          <img src="/images/project5.jpg" alt="project 5" />
        </div>
        <div className="teamflow-highlight-text teamflow-fade-in">
          <h2 className="teamflow-highlight-title">TeamFlow Applications</h2>
          <h4 className="teamflow-highlight-sub">Infinite Possibilities</h4>
          <p className="teamflow-highlight-desc">From startups to enterprises, TeamFlow adapts to every workflow. Discover how teams transform with our tools.</p>
          <button className="teamflow-cta-button">See All Projects</button>
        </div>
        <div className="teamflow-project-gallery">
          <img src="/images/project6.jpg" alt="project 6" />
          <img src="/images/project7.jpg" alt="project 7" />
          <img src="/images/project8.jpg" alt="project 8" />
          <img src="/images/project9.jpg" alt="project 9" />
          <img src="/images/project10.jpg" alt="project 10" />
        </div>
      </section>

      {/* Section 7: FAQs */}
      <section className="teamflow-faq-section">
        <h2 className="teamflow-faq-title">Frequently Asked Questions</h2>
        <ul className="teamflow-faq-list">
          {faqs.map((faq, index) => (
            <li
              key={index}
              className={`teamflow-faq-item ${activeFaq === index ? "open" : ""}`}
              onClick={() => toggleFaq(index)}
            >
              <h3 className="teamflow-faq-question">{faq.question}</h3>
              {activeFaq === index && <p className="teamflow-faq-answer">{faq.answer}</p>}
            </li>
          ))}
        </ul>
      </section>
    </div>
    <TeamFlowChatBot />
    <TeamFlowFooter />
    </>
  );
};

export default TeamFlowHome;
