const Project = require("../models/projectsModel");
require("dotenv").config();

const getAllProjects = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search || "";

  try {
    const [projects, totalCount] = await Promise.all([
      Project.getAllProjects(skip, limit, search),
      Project.getProjectsCount(search),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({ projects, totalPages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRecentProjectsWithTasks = async (req, res) => {
  try {
    const { userId } = req.params;

    const data = await Project.getRecentProjectsWithTasks(userId);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.log("Recent Projects+Tasks Error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch recent projects with tasks",
    });
  }
};

const getProjects = async (req, res) => {
  try {
    const projects = await Project.getProjects();
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProjectById = async (req, res) => {
  const projectId = req.params.projectId;
  try {
    const [project, members, issues, documents] = await Promise.all([
      Project.getProjectById(projectId),
      Project.getUsersByProjectIssues(projectId),
      Project.getProjectIssues(projectId),
      Project.getProjectDocuments(projectId),
    ]);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.status(200).json({ project, members, issues, documents });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createProject = async (req, res) => {
  try {
    const {
      projectName,
      projectKey,
      projectType,
      lead,
      url,
      description,
    } = req.body;

    const projectLogo = req.file ? req.file.filename : null;

    const newProject = await Project.createProject(
      projectName,
      projectKey,
      projectType,
      lead,
      url,
      description,
      projectLogo
    );

    res.status(201).json({
      message: "Project created successfully",
      project: {
        id: newProject.insertId,
        name: projectName,
        projectKey,
        type: projectType,
        lead,
        projectUrl: url,
        description,
        projectLogo,
      },
    });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: error.message });
  }
};


const updateProject = async (req, res) => {
  const projectId = req.params.projectId;
  try {
    const {
      projectName,
      projectKey,
      projectType,
      url,
      description,
      lead,
    } = req.body;

    console.log(req.body);
    


    const updatedProject = await Project.updateProject(
      projectId,
      {name:projectName, projectKey, type:projectType, projectURL:url, description, lead},
    );

    if (!updatedProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.status(200).json({
      message: "Project updated successfully",
      project: {
        id: updatedProject.insertId,
        name: projectName,
        projectKey,
        type: projectType,
        projectUrl: url,
        description,
      },
    });
      }

  catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ error: error.message });
  }
};


const deleteProject = async (req, res) => {
  const projectId = req.params.projectId;
  try {
    const project = await Project.deleteProject(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const cloneProject = async (req, res) => {
  try {
    const source = await Project.getProjectById(req.params.projectId);
    if (!source) return res.status(404).json({ error: "Project not found" });
    const clone = await Project.cloneProject(source);
    res.status(201).json({
      message: "Project cloned successfully",
      project: { ...source, id: clone.insertId, name: `${source.name} Copy`, projectKey: clone.projectKey },
    });
  } catch (error) {
    const status = error.code === "ER_DUP_ENTRY" ? 409 : 500;
    res.status(status).json({ error: error.message });
  }
};


const getProjectIssues = async (req, res) => {
  const projectId = req.params.projectId;
  try {
    const issues = await Issue.find({ project: projectId });
    res.status(200).json(issues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getProjectMembers = async (req, res) => {
  const projectId = req.params.projectId;
  try {
    const members = await Member.find({ project: projectId });
    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProjectIssuesByUserId = async (req, res) => {
  const userId = req.params.userId;
  try {
    const issues = await Issue.find({ assignee: userId });
    res.status(200).json(issues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getProjectIssuesCount = async (req, res) => {
  const projectId = req.params.projectId;
  try {
    const count = await Issue.countDocuments({ project: projectId });
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUsersByProjectIssues = async (req, res) => {
  const projectId = req.params.projectId;
  try {
    const users = await Project.getUsersByProjectIssues(projectId);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const uploadProjectDocument = async (req, res) => {
  try {
    const formData = req.file;
    const { project_id, uploaded_by } = req.body;
    
    if (!formData) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const response = await Project.uploadProjectDocument(formData, project_id, uploaded_by);
    res.status(200).json(response);
  } catch (error) {
    console.error("Error uploading project document:", error.message);
    res.status(500).json({ error: error.message });
  }
};












module.exports = {
    createProject,
    getAllProjects,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
    getProjectIssues,
    getProjectMembers,
    getProjectIssuesByUserId,
    getProjectIssuesCount, 
    uploadProjectDocument,
    getUsersByProjectIssues,
    getRecentProjectsWithTasks
    ,cloneProject
};
