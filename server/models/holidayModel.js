const db = require("../Config/connection");


/* GET ALL HOLIDAYS */
const getAllHolidays = (callback) => {

  const query = "SELECT * FROM holidays ORDER BY date ASC";

  db.query(query, callback);

};


/* ADD HOLIDAY */
const addHoliday = (data, callback) => {

  const query = `
    INSERT INTO holidays (title, date, type, color)
    VALUES (?, ?, ?, ?)
  `;

  db.query(query, [data.title, data.date, data.type, data.color], callback);

};


/* UPDATE HOLIDAY */
const updateHoliday = (id, data, callback) => {

  const query = `
    UPDATE holidays
    SET title = ?, date = ?, type = ?, color = ?
    WHERE id = ?
  `;

  db.query(query, [data.title, data.date, data.type, data.color, id], callback);

};


/* DELETE HOLIDAY */
const deleteHoliday = (id, callback) => {

  const query = "DELETE FROM holidays WHERE id = ?";

  db.query(query, [id], callback);

};


module.exports = {
  getAllHolidays,
  addHoliday,
  updateHoliday,
  deleteHoliday
};