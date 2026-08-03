import axiosInstance from "./axiosInstance";

export const getAllReports = async (page = 1, limit = 10, startDate, endDate, userType = 'all') => {

  try {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("limit", limit);

    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (userType && userType !== "all") params.append("userType", userType);

    const response = await axiosInstance.get(`/reports?${params.toString()}`);
    console.log("Reports fetched successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching reports:", error.message);
    throw error;
  }
};

export const uploadUserReport = async (formData) => {
  
  try {
    const response = await axiosInstance.post("/reports", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating report:", error.message);
    throw error;
  }
};

export const getReportsByUserId = async (userId, page = 1, limit = 10) => {

  try {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("limit", limit);

    const response = await axiosInstance.get(`/reports/user/${userId}?${params.toString()}`);
    console.log("User reports fetched successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching user reports:", error.message);
    throw error;
  }
}
