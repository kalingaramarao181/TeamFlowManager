const express = require("express");
const db = require("../Config/connection");
const upload = require("../Config/multer");

const router = express.Router();
const fs = require("fs");
const path = require("path");


router.post("/upload-report", upload.single("reportImage"), (req, res) => {
  const { userId, reportText } = req.body;
  console.log(req.body);
  
  const reportImage = req.file ? "uploads/" + req.file.filename : null;

  if (!userId || !reportText || !reportImage) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  const query = "INSERT INTO reports (userId, reportText, reportImage) VALUES (?, ?, ?)";
  db.query(query, [userId, reportText, reportImage], (err, result) => {
    if (err) {
      console.error("Error uploading report:", err.message);
      return res.status(500).json({ success: false, message: "Failed to upload report" });
    }
    res.status(201).json({ success: true, message: "Report uploaded successfully" });
  });
});

router.get("/reports/:userId", (req, res) => {
  const { userId } = req.params;
  const query = "SELECT * FROM reports WHERE userId = ? ORDER BY createdAt DESC";
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching reports:", err.message);
      return res.status(500).json({ success: false, message: "Failed to fetch reports" });
    }
    res.status(200).json({ success: true, reports: results });
  });
});

router.get("/reports", (req, res) => {
  const query = "SELECT users.full_name, reports.* FROM reports JOIN users ON reports.userId = users.id ORDER BY reports.createdAt DESC";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching reports:", err.message);
      return res.status(500).json({ success: false, message: "Failed to fetch reports" });
    }
    res.status(200).json({ success: true, reports: results });
  });
});

router.put("/update-report/:reportId", upload.single("reportImage"), (req, res) => {
  const { reportId } = req.params;
  const { reportText } = req.body;
  const newReportImage = req.file ? `uploads/${req.file.filename}` : null;

  const selectQuery = "SELECT reportImage FROM reports WHERE id = ?";
  db.query(selectQuery, [reportId], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Database error", error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    const oldImage = results[0].reportImage;

    if (newReportImage && oldImage) {
      const oldImagePath = path.join(__dirname, "../", oldImage);

      console.log("Deleting old image:", oldImagePath);

      fs.access(oldImagePath, fs.constants.F_OK, (accessErr) => {
        if (!accessErr) {
          fs.unlink(oldImagePath, (unlinkErr) => {
            if (unlinkErr) {
              console.error("Error deleting old file:", unlinkErr);
            } else {
              console.log("Old file deleted successfully.");
            }
          });
        } else {
          console.log("Old file not found:", oldImagePath);
        }
      });
    }

    const updateQuery = "UPDATE reports SET reportText = ?, reportImage = ? WHERE id = ?";
    const updateValues = [reportText, newReportImage || oldImage, reportId];

    db.query(updateQuery, updateValues, (updateErr) => {
      if (updateErr) {
        return res.status(500).json({ success: false, message: "Error updating report", error: updateErr });
      }
      res.json({ success: true, message: "Report updated successfully" });
    });
  });
});



module.exports = router;
