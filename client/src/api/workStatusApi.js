import axiosInstance from "./axiosInstance";

export const getDashboardOverview = async () => {
  const response = await axiosInstance.get("/dashboard/overview");
  return response.data;
};

export const submitLogin = async (data) => {
  const response = await axiosInstance.post(`/employee-reports/login`, data);
  return response.data;
};

export const submitLogout = async (formData) => {
  const response = await axiosInstance.post("/employee-reports/logout", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const getTodayReportStatus = async (userId) => {
  const response = await axiosInstance.get(`/employee-reports/status/${userId}`);
  return response.data;
};

export const getAllStatusReports = async (userId, page = 1, limit = 10) => {
  console.log("Fetching reports with params:", { page, limit });

  try {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("limit", limit);

    const response = await axiosInstance.get(`/employee-reports/${userId}?${params.toString()}`);
    console.log("Reports fetched successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching reports:", error.message);
    throw error;
  }
};

export const getAdminDashboardData = async () => {
  try {
    const response = await axiosInstance.get(`/employee-reports/dashboard/data`);

    return response.data;
    
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error.message);
    throw error;
  }
}

export const getTodayModules = async () => {
  try {
    const response = await axiosInstance.get(`/employee-reports/modules/today`);
    return response.data;
  } catch (error) {
    console.error("Error fetching today's modules:", error.message);
    throw error;
  }
};

export const getDaywiseReports = async (start_date, end_date, page = 1, limit = 10) => {
  try {
    const params = new URLSearchParams();
    params.append("start_date", start_date);
    params.append("end_date", end_date);
    params.append("page", page);
    params.append("limit", limit);

    const response = await axiosInstance.get(
      `/employee-reports/reports/daily-reports?${params.toString()}`
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching daywise reports:", error.message);
    throw error;
  }
};
