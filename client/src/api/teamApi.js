import axiosInstance from "./axiosInstance";

export const getTeams = async (projectId = "") => {
  try {
    const url = projectId ? `/teams?project_id=${projectId}` : "/teams";
    const response = await axiosInstance.get(url);
    return response.data?.teams || [];
  } catch (error) {
    console.error("Error fetching teams:", error);
    throw error;
  }
};

export const createTeam = async (payload) => {
  try {
    const response = await axiosInstance.post("/teams", payload);
    return response.data;
  } catch (error) {
    console.error("Error creating team:", error);
    throw error;
  }
};

export const updateTeamLead = async (teamId, teamLead) => {
  try {
    const response = await axiosInstance.patch(`/teams/${teamId}/lead`, { team_lead: teamLead });
    return response.data;
  } catch (error) {
    console.error("Error updating team lead:", error);
    throw error;
  }
};

export const getProjectOverview = async (projectId) => {
  try {
    const response = await axiosInstance.get(`/projects/${projectId}/overview`);
    return response.data;
  } catch (error) {
    console.error("Error fetching project overview:", error);
    throw error;
  }
};

export const createProjectTask = async (projectId, payload) => {
  try {
    const response = await axiosInstance.post(`/projects/${projectId}/tasks`, payload);
    return response.data;
  } catch (error) {
    console.error("Error creating project task:", error);
    throw error;
  }
};

export const getProjectTasks = async (projectId) => {
  try {
    const response = await axiosInstance.get(`/projects/${projectId}/tasks`);
    return response.data?.tasks || [];
  } catch (error) {
    console.error("Error fetching project tasks:", error);
    throw error;
  }
};

export const createProjectSubtask = async (projectId, taskId, payload) => {
  try {
    const response = await axiosInstance.post(`/projects/${projectId}/tasks/${taskId}/subtasks`, payload);
    return response.data;
  } catch (error) {
    console.error("Error creating project subtask:", error);
    throw error;
  }
};

export const getProjectChat = async (projectId) => {
  try {
    const response = await axiosInstance.get(`/projects/${projectId}/chat`);
    return response.data?.messages || [];
  } catch (error) {
    console.error("Error fetching project chat:", error);
    throw error;
  }
};

export const sendProjectChat = async (projectId, userId, message) => {
  try {
    const response = await axiosInstance.post(`/projects/${projectId}/chat/${userId}`, { message });
    return response.data;
  } catch (error) {
    console.error("Error sending project chat:", error);
    throw error;
  }
};

export const saveGithubConfig = async (projectId, payload) => {
  try {
    const response = await axiosInstance.post(`/projects/${projectId}/github`, payload);
    return response.data;
  } catch (error) {
    console.error("Error saving GitHub config:", error);
    throw error;
  }
};

export const getGithubConfig = async (projectId) => {
  try {
    const response = await axiosInstance.get(`/projects/${projectId}/github`);
    return response.data;
  } catch (error) {
    console.error("Error fetching GitHub config:", error);
    return null;
  }
};
