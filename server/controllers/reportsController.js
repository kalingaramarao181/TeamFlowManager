const Report = require("../models/reportsModel");
require("dotenv").config();


const uploadReport = async (req, res) => {
  const { userId, reportText } = req.body;
  console.log("Received report upload:", { userId, reportText, file: req.file });
  
  const reportImage = req.file ? "uploads/" + req.file.filename : null;
  if (!userId || !reportText) {
    return res.status(400).json({ message: "userId and reportText are required" });
  }
  try {
    const report = await Report.createReport(userId, reportText, reportImage);
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getAllReports = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { startDate, endDate, userType } = req.query;

  try {
    const reports = await Report.getAllReports(skip, limit, startDate, endDate, userType);
    const totalCount = await Report.getReportsCount(startDate, endDate, userType);
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({ reports, totalPages });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getReportsByUserId = async (req, res) => {
  const userId = req.params.userId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const reports = await Report.getReportsByUserId(userId, skip, limit);
    const totalCount = await Report.getReportsCountByUserId(userId);
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({ reports, totalPages });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};



module.exports = {
    getAllReports,
    getReportsByUserId,
    uploadReport
    
};
