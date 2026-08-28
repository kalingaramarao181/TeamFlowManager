const express = require("express");
const router = express.Router();

const holidayController = require("../controllers/holidayController");
const { protect, authorize, authorizeResource } = require("../middlewares/authMiddleware");


/* GET ALL HOLIDAYS */
router.get("/all", protect, authorizeResource('calendar'), holidayController.getHolidays);


/* ADD HOLIDAY */
router.post("/", protect, authorizeResource('calendar','can_create'), holidayController.createHoliday);


/* UPDATE HOLIDAY */
router.put("/:id", protect, authorizeResource('calendar','can_edit'), holidayController.updateHoliday);


/* DELETE HOLIDAY */
router.delete("/:id", protect, authorizeResource('calendar','can_delete'), holidayController.deleteHoliday);


module.exports = router;

