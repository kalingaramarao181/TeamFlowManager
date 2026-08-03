const jwt = require("jsonwebtoken");

exports.generateTimesheetToken = (timesheetId, action) => {
  return jwt.sign(
    { timesheetId, action },
    process.env.TIMESHEET_SECRET,
    { expiresIn: "10d" } // valid for 10 days
  );
};

exports.verifyTimesheetToken = (token) => {
  return jwt.verify(token, process.env.TIMESHEET_SECRET);
};
