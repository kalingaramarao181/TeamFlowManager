const Issue = require("../models/issuesModel");
require("dotenv").config();
const fetch = require("node-fetch");

const getAllIssues = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const userId = req.user.id;

  const project = req.query.project || "";
  const searchKey = req.query.searchKey || "";

  try {
    const [issues, totalCount] = await Promise.all([
      Issue.getAllIssues(skip, limit, project, searchKey, userId),
      Issue.getIssuesCount(project, searchKey, userId),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      issues,
      totalPages,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getIssuesByProjectId = async (req, res) => {
  const projectId = req.params.projectId;
  try {
    const issues = await Issue.getIssuesByProjectId(projectId);
    res.status(200).json(issues);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const createIssue = async (req, res) => {
  const {
    projectId,
    issueType,
    status,
    summary,
    description,
    priority,
    team,
    lables,
    sprint,
    linkedIssueType,
    linkedIssue,
    assignee,
  } = req.body;

  const attachment = req.file ? req.file.filename : null;

  try {
    const newIssue = await Issue.createIssue(
      projectId,
      issueType,
      status,
      summary,
      description,
      priority,
      team,
      lables,
      sprint,
      linkedIssueType,
      linkedIssue,
      assignee,
      attachment
    );
    res.status(201).json(newIssue);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
    console.log(err);
    
  }
};

const updateIssue = async (req, res) => {
  const issueId = req.params.issueId;
  
  const { projectId, issueType, description,summary, sprint, status, priority,team,labels, linkedIssueType, linkedIssue,assignee } =
    req.body;
    console.log(req.body);
    
  try {
    const attachment = req.file ? req.file.filename : null;

    const updatedIssue = await Issue.updateIssue(
      issueId,
      {
      project: projectId,
      	issue_type: issueType,
        	status,
      summary,
      description,
      priority,
      team,
      labels,
      sprint,
      linked_issue_type	: linkedIssueType,
      linked_issue: linkedIssue,
      assignee: assignee,
      attachment
      }
    );
    res.status(200).json(updatedIssue);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
    console.log(err);
    
  }
};

const deleteIssue = async (req, res) => {
  const issueId = req.params.issueId;
  try {
    const deletedIssue = await Issue.deleteIssue(issueId);
    res.status(200).json(deletedIssue);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getIssueById = async (req, res) => {
  const issueId = req.params.issueId;
  try {
    const issue = await Issue.getIssueById(issueId);
    res.status(200).json(issue);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getIssueStatusByUserId = async (req, res) => {
  const userId = req.params.userId;
  try {
    const issueStatus = await Issue.getIssueStatusByUserId(userId);
    res.status(200).json(issueStatus);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const generateUserProgressSummary = async (req, res) => {
  const { userId, projectId } = req.params;

  try {
    // STEP 1: Get last 10 summaries from DB
    const summaries = await Issue.getUserSummariesByProject(
      userId,
      projectId
    );

    if (!summaries || summaries.trim() === "") {
      return res.status(200).json({
        message: "No summaries found for this user/project",
        progressSummary: "",
      });
    }

    // STEP 2: Send to Google Gemini Free API
    const prompt = `
Convert the following task summaries into one professional progress report paragraph.

Summaries:
${summaries}

Write in clear professional language in one paragraph.
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyDxqJI90n7uFtGOrbqI2zhJdnbk_U4AwFs`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();

    const generatedText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Unable to generate summary.";

    // STEP 3: Return final paragraph to UI
    res.status(200).json({
      progressSummary: generatedText,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


module.exports = {
  getAllIssues,
  getIssuesByProjectId,
  createIssue,
  updateIssue,
  deleteIssue,
  getIssueById,
  getIssueStatusByUserId,
  generateUserProgressSummary,
};
