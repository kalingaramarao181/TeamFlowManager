import axiosInstance from "./axiosInstance";

export const getAllUsers = async (page = 1, limit = 10, searchQuery = "") => {
  try {
    const response = await axiosInstance.get(`/users?page=${page}&limit=${limit}&search=${searchQuery}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error.message);
    throw error;
  }
};

export const getUsers = async () => {
  try {
    const response = await axiosInstance.get("/users/all");
    return response.data;
  } catch (error) {
    console.error("Error fetching all users:", error.message);
    throw error;
  }
}