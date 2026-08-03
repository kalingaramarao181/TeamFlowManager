const {
  insertLoginStatus,
  updateLogoutStatus,
  uploadDocument,
  getTodayStatusByUserId,
  getAllStatusReports,
  getActiveUsersToday,
  getStatusReportsCount,
  getWorkingProjects,
  getAverageWorkingHours,
  getAllUsers,
  getTodayModules,
  getDaywiseReports,
  getDaywiseReportsCount

} = require('../models/statusReportModel');

exports.submitLogin = async (req, res) => {
  try {
    const insertId = await insertLoginStatus(req.body);
    res.status(200).json({ message: 'Login status recorded', insertId });
  } catch (err) {
    console.error("Login status error:", err.message);
    res.status(500).json({ message: 'Error recording login' });
  }
};

exports.submitLogout = async (req, res) => {
  try {
    const { id, worked_on, status } = req.body;
    await updateLogoutStatus(id, { worked_on, status });

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await uploadDocument(id, file.filename);
      }
    }

    res.status(200).json({ message: 'Logout status updated successfully.' });
  } catch (err) {
    console.error("Logout status error:", err.message);
    res.status(500).json({ message: 'Error updating logout' });
  }
};

exports.getTodayStatus = async (req, res) => {
  try {
    const status = await getTodayStatusByUserId(req.params.userId);
    
    res.status(200).json({ data: status || null });
  } catch (err) {
    console.error("Fetching today's status error:", err.message);
    res.status(500).json({ message: 'Error fetching today\'s status' });
  }
};

exports.getAllStatusReports = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const userId = req.params.userId;

  try {
    const reports = await getAllStatusReports(userId, skip, limit);
    const totalCount = await getStatusReportsCount(userId);
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({ reports, totalPages });
  } catch (err) {
    console.error("Fetching reports error:", err.message);
    res.status(500).json({ message: 'Error fetching reports' });
  }
};


exports.getAdminDashboardData = async (req, res) => {
  try {
    const employees = await getAllUsers();
    const activeEmployees = await getActiveUsersToday();
    const workingProjects = await getWorkingProjects();
    const avarageWorkingHours = await getAverageWorkingHours();

    
    res.status(200).json({
      employees,
      activeEmployees,
      workingProjects,
      avarageWorkingHours,
    });
    
  } catch (err) {
    console.error("Fetching admin dashboard data error:", err.message);
    res.status(500).json({ message: 'Error fetching admin dashboard data' });
  }
}

exports.getDaywiseReports = async (req, res) => {
  const start_date = req.query.start_date;
  const end_date = req.query.end_date;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const reports = await getDaywiseReports(start_date, end_date, skip, limit);
    const totalCount = await getDaywiseReportsCount(start_date, end_date);
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({ reports, totalPages });
  } catch (err) {
    console.error("Fetching daywise reports error:", err.message);
    res.status(500).json({ message: 'Error fetching daywise reports' });
  }
}


exports.getTodayModules = async (req, res) => {
  try {
    const modules = await getTodayModules();
    res.status(200).json({ modules });
  } catch (err) {
    console.error("Fetching today's modules error:", err.message);
    res.status(500).json({ message: 'Error fetching today\'s modules' });
  }
};
