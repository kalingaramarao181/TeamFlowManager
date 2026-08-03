import axiosInstance from "./axiosInstance";

export const submitTimesheet = (data) => {
  return axiosInstance.post("/timesheets/submit", data);
};

export const getTimesheet = (userId, weekStart) => {
  return axiosInstance.get(`/timesheets/${userId}/${weekStart}`);
};

export const getAttendanceByWeek = (userId, week, year) => {
  return axiosInstance.get(
    `/attendance/week/${userId}?week=${week}&year=${year}`
  );
}

export const submitWeeklyTimesheet = (data) => {
  return axiosInstance.post("/timesheet/submit", data);
};

export const getWeeklyTimesheet = (userId, week, year) => {
  return axiosInstance.get(
    `/timesheet/week/${userId}?week=${week}&year=${year}`
  );
};

export const getTimesheetSummary = (userId) =>
  axiosInstance.get(`/timesheet/summary/${userId}`);

export const getAdminWeeklyReports = (params) => {
  return axiosInstance.get("/timesheet/weekly-reports", {
    params,
  });
};

export const getAdminTimesheetSummary = () =>
  axiosInstance.get("/timesheet/admin-summary");

export const getAdminTimesheetDetail = (timesheetId) =>
  axiosInstance.get(`/timesheet/admin-detail/${timesheetId}`);

export const updateAdminTimesheetStatus = (timesheetId, status) =>
  axiosInstance.patch(`/timesheet/admin-status/${timesheetId}`, { status });
