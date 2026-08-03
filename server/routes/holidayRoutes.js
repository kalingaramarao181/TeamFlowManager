const express = require("express");
const router = express.Router();

const holidayController = require("../controllers/holidayController");
const { protect, authorize } = require("../middlewares/authMiddleware");


/* GET ALL HOLIDAYS */
router.get("/all", protect, holidayController.getHolidays);


/* ADD HOLIDAY */
router.post("/", protect, authorize(["admin"]), holidayController.createHoliday);


/* UPDATE HOLIDAY */
router.put("/:id", protect, authorize(["admin"]), holidayController.updateHoliday);


/* DELETE HOLIDAY */
router.delete("/:id", protect, authorize(["admin"]), holidayController.deleteHoliday);


module.exports = router;
