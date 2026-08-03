import axiosInstance from "./axiosInstance";

/* GET ALL HOLIDAYS (with pagination + search) */
export const getAllHolidays = async (page = 1, limit = 10, searchQuery = "") => {
  try {

    const response = await axiosInstance.get(
      `/calendar?page=${page}&limit=${limit}&search=${searchQuery}`
    );

    return response.data;

  } catch (error) {

    console.error("Error fetching holidays:", error.message);
    throw error;

  }
};


/* GET ALL HOLIDAYS (simple list) */
export const getHolidays = async () => {

  try {

    const response = await axiosInstance.get("/calendar/all");

    return response.data;

  } catch (error) {

    console.error("Error fetching holidays:", error.message);
    throw error;

  }

};


/* ADD HOLIDAY */
export const addHoliday = async (holidayData) => {

  try {

    const response = await axiosInstance.post("/calendar", holidayData);

    return response.data;

  } catch (error) {

    console.error("Error adding holiday:", error.message);
    throw error;

  }

};


/* UPDATE HOLIDAY */
export const updateHoliday = async (id, holidayData) => {

  try {

    const response = await axiosInstance.put(
      `/calendar/${id}`,
      holidayData
    );

    return response.data;

  } catch (error) {

    console.error("Error updating holiday:", error.message);
    throw error;

  }

};


/* DELETE HOLIDAY */
export const deleteHoliday = async (id) => {

  try {

    const response = await axiosInstance.delete(`/calendar/${id}`);

    return response.data;

  } catch (error) {

    console.error("Error deleting holiday:", error.message);
    throw error;

  }

};