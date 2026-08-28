const express = require("express");
const router = express.Router();
const controller = require("../controllers/timeSheetController");
const { protect, authorize, authorizeResource } = require("../middlewares/authMiddleware");

router.get("/attendance/week/:userId", protect, authorizeResource('time_sheets'), controller.getAttendanceByWeek);
router.post("/timesheet/submit", protect, authorizeResource('time_sheets','can_create'), controller.submitTimesheet);
router.get("/timesheet/week/:userId", protect, authorizeResource('time_sheets'), controller.getTimesheetByWeek);
router.get("/timesheet/summary/:userId", protect, authorizeResource('time_sheets'), controller.getTimesheetSummary);
router.get("/timesheet/action/:token", controller.handleTimesheetAction);
router.get("/timesheet/weekly-reports", protect, authorizeResource('time_sheets'), controller.getAdminTimesheetReports);
router.get("/timesheet/admin-summary", protect, authorizeResource('time_sheets'), controller.getAdminTimesheetSummary);
router.get("/timesheet/admin-detail/:timesheetId", protect, authorizeResource('time_sheets'), controller.getAdminTimesheetDetail);
router.patch("/timesheet/admin-status/:timesheetId", protect, authorizeResource('time_sheets','can_edit'), controller.updateAdminTimesheetStatus);


module.exports = router;

