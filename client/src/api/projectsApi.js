import axiosInstance from "./axiosInstance";

export const getAllProjects = async (page = 1, limit = 10, search = "") => {
  try {
    const response = await axiosInstance.get(`/projects?page=${page}&limit=${limit}&search=${search}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching projects:", error.message);
    throw error;
  }
};

export const getProjects = async () => {
  try { 
    const response = await axiosInstance.get("/projects/all");
    return response.data;
  } catch (error) {
    console.error("Error fetching projects:", error.message);
    throw error;
  }
};

export const getRecentProjectsWithTasks = async (userId) => {
  try {
    const response = await axiosInstance.get(`/projects/recent-tasks/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching recent projects:", error.message);
    throw error;
  }
};

  
export const getProjectById = async (projectId) => {
  try {
    const response = await axiosInstance.get(`/project/${projectId}`);
    if (response.data?.project) return response.data;

    const [issues, members] = await Promise.allSettled([
      axiosInstance.get(`/project/${projectId}/issues`),
      axiosInstance.get(`/projects/${projectId}/users`),
    ]);
    return {
      project: response.data,
      issues: issues.status === "fulfilled" ? issues.value.data : [],
      members: members.status === "fulfilled" ? members.value.data : [],
      documents: response.data?.document_path ? [{
        id: `latest-${projectId}`,
        document_path: response.data.document_path,
        uploaded_at: response.data.created_at,
      }] : [],
    };
  } catch (error) {
    console.error("Error fetching project by ID:", error.message);
    throw error;
  }
}

export const createProject = async (formData) => {
  try {
    const response = await axiosInstance.post("/projects", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating project:", error.message);
    throw error;
  }
};

export const updateProject = async (projectId, formData) => {
  try {
    const response = await axiosInstance.put(`/projects/${projectId}`, formData, {
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

export const uploadProjectDocument = async (formData) => {
  console.log("Uploading project document with formData:", formData);
  
  const response = await axiosInstance.post("/projects/documents", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteProject = async (projectId) => {
  const response = await axiosInstance.delete(`/projects/${projectId}`);
  return response.data;
};

export const cloneProject = async (projectId) => {
  const response = await axiosInstance.post(`/projects/${projectId}/clone`);
  return response.data;
};
