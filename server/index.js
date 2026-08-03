const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes')
const issueRoutes = require('./routes/issueRoutes');
const projectRoutes = require('./routes/projectRoutes');
const reportRoutes = require('./routes/reportRoutes');
const statusReportRoutes = require('./routes/statusReportRoutes');
const authRoutes = require('./routes/authRoutes');
const timeSheetRoutes = require('./routes/timeSheetRoutes');
const holidayRoutes = require("./routes/holidayRoutes");
require("dotenv").config();

const app = express();

app.disable("x-powered-by");
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
}));
app.use(bodyParser.json({ limit: process.env.JSON_BODY_LIMIT || "1mb" }));
app.use(bodyParser.urlencoded({ extended: false, limit: process.env.JSON_BODY_LIMIT || "1mb" }));

// Existing public upload URLs are retained for backward compatibility.
// New document APIs should use authenticated download controllers.
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  dotfiles: "deny",
  index: false,
  fallthrough: false,
  setHeaders(res) {
    res.setHeader("Content-Disposition", "attachment");
    res.setHeader("X-Content-Type-Options", "nosniff");
  },
}));


app.use("/api", userRoutes);
app.use("/api", authRoutes);
app.use("/api", issueRoutes);
app.use("/api", projectRoutes)
app.use("/api", reportRoutes);
app.use("/api", statusReportRoutes);
app.use("/api", timeSheetRoutes);
app.use("/api/calendar", holidayRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "teamflow-api" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.status ? err.message : "Internal server error",
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
