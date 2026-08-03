import React from "react";

const HolidayModal = ({ title, setTitle, editingEvent, saveEvent, deleteEvent, close }) => {

  return (
    <div className="holiday-modal">

      <h3>
        {editingEvent.id ? "Edit Holiday" : "Add Holiday"}
      </h3>

      <input
        type="text"
        placeholder="Holiday name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div className="modal-buttons">

        <button onClick={saveEvent}>Save</button>

        {editingEvent.id && (
          <button className="delete-btn" onClick={deleteEvent}>
            Delete
          </button>
        )}

        <button onClick={close}>
          Cancel
        </button>

      </div>

    </div>
  );
};

export default HolidayModal;