const Dashboard = require("../models/dashboardModel");

exports.getOverview = async (req, res) => {
  try {
    const overview = await Dashboard.getDashboardOverview(req.user);
    res.status(200).json(overview);
  } catch (error) {
    console.error("Dashboard overview error:", error);
    res.status(500).json({ message: "Unable to load dashboard overview" });
  }
};

