const holidayModel = require("../models/holidayModel");


/* GET HOLIDAYS */
exports.getHolidays = (req, res) => {

  holidayModel.getAllHolidays((err, results) => {

    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(results);

  });

};


/* ADD HOLIDAY */
exports.createHoliday = (req, res) => {

  const data = req.body;

  holidayModel.addHoliday(data, (err, result) => {

    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({
      message: "Holiday added successfully",
      id: result.insertId
    });

  });

};


/* UPDATE HOLIDAY */
exports.updateHoliday = (req, res) => {

  const id = req.params.id;
  const data = req.body;

  holidayModel.updateHoliday(id, data, (err) => {

    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({ message: "Holiday updated successfully" });

  });

};


/* DELETE HOLIDAY */
exports.deleteHoliday = (req, res) => {

  const id = req.params.id;

  holidayModel.deleteHoliday(id, (err) => {

    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({ message: "Holiday deleted successfully" });

  });

};