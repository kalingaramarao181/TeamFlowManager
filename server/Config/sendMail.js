const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
require("dotenv").config();

router.post("/send-mail", (req, res) => {
  const { assigneeEmail, assigneeName, issueDetails, projectId } = req.body;

  // Validate request body
  if (!assigneeEmail || !assigneeName || !issueDetails || !issueDetails.summary || !issueDetails.status) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  // Assign a color to the status
  const statusColors = {
    "To Do": "#ff6f61", // Red
    "In Progress": "#ffa500", // Orange
    "Done": "#32cd32", // Green
  };

  const statusColor = statusColors[issueDetails.status] || "#d3d3d3"; // Default to gray if status is unrecognized

  // Create the email content
  const emailContent = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.5;
            color: #333;
          }
          .email-container {
            margin: 0 auto;
            padding: 20px;
            max-width: 600px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background-color: #f9f9f9;
          }
          .email-header {
            text-align: center;
            margin-bottom: 20px;
          }
          .email-header img {
            width: 150px;
            height: auto;
          }
          .status-badge {
            color: white;
            background-color: ${statusColor};
            padding: 5px 10px;
            border-radius: 4px;
            font-weight: bold;
          }
          .task-button {
            display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            margin-top: 20px;
          }
          .task-button:hover {
            background-color: #0056b3;
          }
          .issue-details {
            padding: 10px;
            border: 1px solid #ccc;
            background-color: #fff;
            margin: 10px 0;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <img src="https://beedatatech.com/home_images/beedata_logo.png" alt="Company Logo">
          </div>
          <h2>New Issue Assigned to You</h2>
          <p><strong>Assignee:</strong> ${assigneeName}</p>
          <p><strong>Issue Summary:</strong> ${issueDetails.summary}</p>
          <p><strong>Issue Description:</strong></p>
          <div class="issue-details">${issueDetails.description}</div>
          <p>
            <strong>Status:</strong> 
            <span class="status-badge">${issueDetails.status}</span>
          </p>
          <div style="text-align: center;">
            <a href="http://teamflow.bedatatech.com/project/${projectId}" target="_blank" 
              class="task-button" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Open Task
            </a>
          </div>
          <p>Thank you for your attention to this issue!</p>
        </div>
      </body>
    </html>
  `;

  // Configure nodemailer
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates
    },
  });

  // Mail options
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: assigneeEmail,
    subject: "You Have Been Assigned a New Issue",
    html: emailContent,
  };

  // Send the email
  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      console.error("Error sending email:", err);
      return res.status(500).json({ success: false, message: "Failed to send email", error: err.message });
    }
    res.status(200).json({ success: true, message: "Email sent successfully" });
  });
});

module.exports = router;
