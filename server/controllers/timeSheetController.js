const TimeSheetModel = require("../models/timeSheetModel");
const path = require("path");
const { verifyTimesheetToken } = require("../utils/timesheetToken");
const { generateTimesheetToken } = require("../utils/timesheetToken");
const { generateTimesheetHTML } = require("../templates/timesheetHtmlTemplate");
const { sendHTMLEmail } = require("../Config/mailer");
const { findById } = require("../models/userModels");

exports.submitTimesheet = async (req, res) => {
  try {
    const data = req.body;
    const requesterId = Number(req.user.id);
    const requestedUserId = Number(data.user_id);

    if (requesterId !== requestedUserId && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "You can only submit your own timesheet" });
    }

    if (!data.entries || data.entries.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No timesheet rows provided",
      });
    }

    const weekNo = Number(data.week_no);
    const year = Number(data.year);
    if (!Number.isInteger(weekNo) || weekNo < 1 || weekNo > 53 || !Number.isInteger(year)) {
      return res.status(400).json({ success: false, message: "Invalid week or year" });
    }

    const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    const dailyTotals = Object.fromEntries(days.map((day) => [day, 0]));
    const seen = new Set();
    for (const entry of data.entries) {
      if (!entry.project_id || !String(entry.task_name || "").trim() || !String(entry.worked_on || "").trim()) {
        return res.status(400).json({ success: false, message: "Project, task, and work description are required" });
      }
      const duplicateKey = `${entry.project_id}:${String(entry.task_name).trim().toLowerCase()}`;
      if (seen.has(duplicateKey)) {
        return res.status(400).json({ success: false, message: "Duplicate project and task entries are not allowed" });
      }
      seen.add(duplicateKey);
      for (const day of days) {
        const hours = Number(entry[day] || 0);
        if (!Number.isFinite(hours) || hours < 0 || hours > 24) {
          return res.status(400).json({ success: false, message: `Invalid hours for ${day}` });
        }
        dailyTotals[day] += hours;
      }
    }
    if (Object.values(dailyTotals).some((hours) => hours > 24)) {
      return res.status(400).json({ success: false, message: "Combined entries cannot exceed 24 hours per day" });
    }
    const weeklyTotal = Object.values(dailyTotals).reduce((sum, hours) => sum + hours, 0);
    if (weeklyTotal <= 0 || weeklyTotal > 168) {
      return res.status(400).json({ success: false, message: "Weekly hours must be between 1 and 168" });
    }

    const projectIds = [...new Set(data.entries.map((entry) => Number(entry.project_id)))];
    const validProjects = await TimeSheetModel.validateProjectIds(projectIds);
    if (validProjects.length !== projectIds.length) {
      return res.status(400).json({ success: false, message: "One or more projects are invalid" });
    }

    const existing = await TimeSheetModel.getExistingWeekStatus(requestedUserId, weekNo, year);
    if (existing && existing.status !== "Rejected") {
      return res.status(409).json({ success: false, message: `This week is already ${existing.status.toLowerCase()}` });
    }
    if (existing?.status === "Rejected") {
      await TimeSheetModel.deleteRejectedWeek(requestedUserId, weekNo, year);
    }

    // ✅ 1. Save Timesheet in DB
    await TimeSheetModel.saveWeeklyTimesheet(data);

    // ✅ 2. Fetch Saved Rows
    const dailyWork = await TimeSheetModel.getWorkbyWeekNumber(
      data.user_id,
      data.week_no,
      data.year,
    );

    const savedRows = await TimeSheetModel.getWeeklyTimesheet(
      data.user_id,
      data.week_no,
      data.year,
    );

    const timesheetId = savedRows[0].id;

    const approveToken = generateTimesheetToken(timesheetId, "approve");
    const rejectToken = generateTimesheetToken(timesheetId, "reject");

    const user = await findById(data.user_id);

    const week = {
      week_start: "Monday",
      week_end: "Sunday",
      weekNo: data.week_no,
      year: data.year,
    };

    // ✅ Logo URL
    const logoUrl = "https://beedatatech.com/home_images/beedata_logo.png";

    // ✅ 3. Generate HTML Page
    const htmlContent = generateTimesheetHTML(
      user,
      week,
      dailyWork.work_status,
      savedRows,
      logoUrl,
      approveToken,
      rejectToken,
    );

    // ✅ 4. Send HTML Email to Manager
    await sendHTMLEmail(
      process.env.TIMESHEET_APPROVER_EMAIL || "hr@bedatatech.com",
      "Weekly Timesheet Approval Request",
      htmlContent,
    );

    res.status(200).json({
      success: true,
      message: "Timesheet Submitted & Sent to Manager ✅",
    });
  } catch (error) {
    console.log("Submit Timesheet Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to submit timesheet",
    });
  }
};

exports.getTimesheetByWeek = async (req, res) => {
  try {
    const { userId } = req.params;
    const { week, year } = req.query;
    if (Number(req.user.id) !== Number(userId) && !["admin", "manager"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const rows = await TimeSheetModel.getWeeklyTimesheet(userId, week, year);
    const dailyWork = await TimeSheetModel.getWorkbyWeekNumber(userId, week, year);

    res.json({
      success: true,
      rows,
      dailyWork: dailyWork.work_status,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch weekly timesheet",
    });
  }
};

exports.getTimesheetSummary = async (req, res) => {
  const userId = Number(req.params.userId);
  if (Number(req.user.id) !== userId && !["admin", "manager"].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Access denied" });
  }
  try {
    res.json({ success: true, summary: await TimeSheetModel.getUserSummary(userId) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load timesheet summary" });
  }
};

exports.getAdminTimesheetReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, name, weekNo, year, status, projectId } = req.query;

    const data = await TimeSheetModel.getWeeklyReports(
      Number(page),
      Number(limit),
      { name, weekNo, year, status, projectId }
    );

    res.json({
      success: true,
      total: data.total,
      reports: data.reports,
    });
  } catch (err) {
    console.log(err)
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin weekly reports",
    });
  }
};

exports.getAdminTimesheetSummary = async (req, res) => {
  try {
    res.json({ success: true, summary: await TimeSheetModel.getAdminSummary() });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load admin timesheet summary" });
  }
};

exports.getAdminTimesheetDetail = async (req, res) => {
  try {
    const rows = await TimeSheetModel.getAdminTimesheetDetail(Number(req.params.timesheetId));
    if (!rows.length) return res.status(404).json({ success: false, message: "Timesheet not found" });
    res.json({ success: true, rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load timesheet details" });
  }
};

exports.updateAdminTimesheetStatus = async (req, res) => {
  try {
    const status = String(req.body.status || "");
    if (!["Approved", "Rejected", "Pending"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid timesheet status" });
    }
    const current = await TimeSheetModel.getTimesheetStatus(Number(req.params.timesheetId));
    if (!current) return res.status(404).json({ success: false, message: "Timesheet not found" });
    if (current.status === status) {
      return res.status(409).json({ success: false, message: `Timesheet is already ${status.toLowerCase()}` });
    }
    await TimeSheetModel.updateTimesheetStatus(Number(req.params.timesheetId), status);
    res.json({ success: true, message: `Timesheet ${status.toLowerCase()} successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update timesheet status" });
  }
};


exports.handleTimesheetAction = async (req, res) => {
  try {
    const { token } = req.params;

    const decoded = verifyTimesheetToken(token);
    const { timesheetId, action } = decoded;

    // ✅ 1. Get Current Status
    const current = await TimeSheetModel.getTimesheetStatus(timesheetId);

    // ✅ If already approved/rejected → block
    if (!current || ["Approved", "Rejected"].includes(current.status)) {
      return res.send(`
        <html>
          <body style="font-family:Arial;text-align:center;padding:60px;">
            <h2 style="color:red;">⚠️ Action Not Allowed</h2>
            <p>This timesheet has already been processed.</p>
            <p>You cannot approve/reject again.</p>
          </body>
        </html>
      `);
    }

    // ✅ 2. Update Status
    const status = action === "approve" ? "Approved" : "Rejected";
    await TimeSheetModel.updateTimesheetStatus(timesheetId, status);

    // ✅ 3. Show Result Page
    if (status === "Approved") {
      return res.sendFile(path.join(__dirname, "../templates/approved.html"));
    } else {
      return res.sendFile(path.join(__dirname, "../templates/rejected.html"));
    }

  } catch (err) {
    return res.sendFile(path.join(__dirname, "../templates/invalid.html"));
  }
};


exports.getAttendanceByWeek = async (req, res) => {
  try {
    const { userId } = req.params;
    const { week, year } = req.query;
    if (Number(req.user.id) !== Number(userId) && !["admin", "manager"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (!week || !year) {
      return res.status(400).json({
        success: false,
        message: "Week number and year are required",
      });
    }

    const data = await TimeSheetModel.getAttendanceByWeekNumber(
      userId, 
      week,
      year,
    );

    res.json({
      success: true,
      week_start: data.week_start,
      week_end: data.week_end,
      attendance: data.attendance,
    });
  } catch (err) {
    console.log("Attendance Week Error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance by week",
    });
  }
};
