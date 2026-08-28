import axiosInstance from "./axiosInstance";

export const getAllIssues = async (page = 1, limit = 10, project = "", searchKey = "") => {
  try {
    const params = new URLSearchParams({
      page,
      limit,
      ...(project && project !== "all" ? { project } : {}),
      ...(searchKey ? { searchKey } : {})
    });

    const response = await axiosInstance.get(`/issues?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching issues:", error.message);
    throw error;
  }
};

export const getIssueById = async (issueId) => {
  try {
    const response = await axiosInstance.get(`/issues/${issueId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching issue by ID:", error.message);
    throw error;
  }
}

export const getIssuesByProjectId = async (projectId) => {
  try {
    const response = await axiosInstance.get(`/project/${projectId}/issues`);
    return response.data;
  } catch (error) {
    console.error("Error fetching issues by project ID:", error.message);
    throw error;
  }
}


export const createIssue = async (issueData) => {
  try {
    const formData = new FormData();

    // Append all fields to FormData
    Object.keys(issueData).forEach((key) => {
      if (issueData[key] !== null && issueData[key] !== undefined) {
        formData.append(key, issueData[key]);
      }
    });

    const response = await axiosInstance.post("/issues", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error(
      "Create Issue Error:",
      error.response?.data?.message || error.message
    );
    throw error.response?.data || error;
  }
};


export const updateIssue = async (issueId, formData) => {
  
  try {
    const response = await axiosInstance.put(`/issues/${issueId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating project:", error.message);
    throw error;
  }
};


export const deleteIssue = async (issueId) => {
  try {
    const response = await axiosInstance.delete(`/issues/${issueId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting issue:", error.message);
    throw error;
  }
};
