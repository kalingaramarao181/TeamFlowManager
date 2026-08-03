const express = require("express");
const router = express.Router();
const controller = require("../controllers/timeSheetController");
const { protect, authorize } = require("../middlewares/authMiddleware");

router.get("/attendance/week/:userId", protect, controller.getAttendanceByWeek);
router.post("/timesheet/submit", protect, controller.submitTimesheet);
router.get("/timesheet/week/:userId", protect, controller.getTimesheetByWeek);
router.get("/timesheet/summary/:userId", protect, controller.getTimesheetSummary);
router.get("/timesheet/action/:token", controller.handleTimesheetAction);
router.get("/timesheet/weekly-reports", protect, authorize(["admin", "manager"]), controller.getAdminTimesheetReports);
router.get("/timesheet/admin-summary", protect, authorize(["admin"]), controller.getAdminTimesheetSummary);
router.get("/timesheet/admin-detail/:timesheetId", protect, authorize(["admin"]), controller.getAdminTimesheetDetail);
router.patch("/timesheet/admin-status/:timesheetId", protect, authorize(["admin"]), controller.updateAdminTimesheetStatus);


module.exports = router;
