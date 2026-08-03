import React, { useState, useRef, useEffect } from "react";
import "./ChatBot.css";

export default function TeamFlowChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [stage, setStage] = useState("role");
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  const features = {
  admin: {
    dashboard: "A real-time control panel for tracking all active employees, their current tasks, total working hours, and progress on ongoing projects — complete with detailed activity summaries.",
    projects: "Full oversight and control over all projects. Create, update, assign tasks, monitor progress, and upload supporting documents to keep everything organized.",
    reports: "Generate, filter, and download performance and activity reports by date, user, or project category to make informed management decisions.",
    settings: "Admin-level controls to manage users, assign or revoke admin roles, configure system preferences, and export user data into Excel for record-keeping.",
    yourwork: "A dedicated space for logging your daily work, attaching relevant files, and providing updates so progress is always visible to the team.",
    status: "Comprehensive view of the progress and current state of tasks, including which are in progress, delayed, or completed — for any project or employee.",
    issues: "Centralized tracking of all reported issues or blockers, with details like summary, priority, and current resolution status."
  },
  user: {
    dashboard: "Your personal workspace that shows your current assignments, active projects, logged work hours, and performance insights.",
    projects: "View and update the details of the projects you’re working on, including timelines, tasks, and attached resources.",
    reports: "Quickly access and download your own performance reports or activity logs when needed.",
    yourwork: "Log your daily work activities, add comments, and upload related files to keep your contributions documented.",
    status: "Stay updated on the current state of your assigned tasks — see what’s pending, in progress, or completed."
  }
};


  useEffect(() => {
    if (open && messages.length === 0) {
      botMessage("Thanks for your message! We are from Team Flow. How can we assist further?");
      setTimeout(() => {
        botMessage("Please choose your role:", false, { type: "roles" });
      }, 800);
    }
  }, [open]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const botMessage = (text, delay = true, extra = {}) => {
    setTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: "bot", text, ...extra }]);
      setTyping(false);
    }, delay ? 500 : 0);
  };

  const userMessage = (text) => {
    setMessages(prev => [...prev, { sender: "user", text }]);
  };

  const selectRole = (role) => {
    setStage(role);
    userMessage(role === "admin" ? "🛡 Admin Login" : "👤 User Login");
    setTimeout(() => {
      botMessage(`You have selected ${role === "admin" ? "Admin" : "User"} role. Choose a feature below:`, false, { type: "features", role });
    }, 500);
  };

  const showFeature = (role, featureKey) => {
    const featureDesc = features[role][featureKey];
    userMessage(featureKey.charAt(0).toUpperCase() + featureKey.slice(1));
    setTimeout(() => {
      botMessage(featureDesc, false, { backTo: role });
    }, 500);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userText = input.trim().toLowerCase();
    userMessage(input);
    setInput("");
    let found = false;
    if (stage === "admin" || stage === "user") {
      for (const key in features[stage]) {
        if (userText.includes(key)) {
          setTimeout(() => {
            botMessage(features[stage][key], false, { backTo: stage });
          }, 500);
          found = true;
          break;
        }
      }
    }
    if (!found) {
      setTimeout(() => {
        botMessage("I’m sorry, I don’t have information about that. Please choose a feature from the options.");
      }, 500);
    }
  };

  return (
    <>
      {!open && (
        <button className="chat-launcher" onClick={() => setOpen(true)}>💬</button>
      )}
      {open && (
        <div className="chatbot-container">
          <div className="chat-header">
            <span>🤖 Team Flow Assistant</span>
            <button onClick={() => setOpen(false)}>×</button>
          </div>
          <div className="chat-body">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.sender} fade-in`}>
                <div className="chat-bubble">
                  {msg.text}
                  {msg.type === "roles" && (
                    <div className="chat-options">
                      <button onClick={() => selectRole("admin")}>🛡 Admin Login</button>
                      <button onClick={() => selectRole("user")}>👤 User Login</button>
                    </div>
                  )}
                  {msg.type === "features" && (
                    <div className="chat-options">
                      {Object.keys(features[msg.role]).map((fKey, idx) => (
                        <button key={idx} onClick={() => showFeature(msg.role, fKey)}>
                          {fKey.charAt(0).toUpperCase() + fKey.slice(1)}
                        </button>
                      ))}
                    </div>
                  )}
                  {msg.backTo && (
                    <div className="chat-options">
                      <button onClick={() => botMessage(`Choose a feature below:`, false, { type: "features", role: msg.backTo })}>
                        🔙 Back to Features
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="chat-message bot fade-in">
                <div className="chat-bubble typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          {stage !== "role" && (
            <div className="chat-input-area">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a question..."
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button onClick={handleSend}>Send</button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
