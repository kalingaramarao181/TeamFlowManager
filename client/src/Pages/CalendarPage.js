import React, { useState, useEffect } from "react";
import {
  getHolidays,
  addHoliday,
  updateHoliday,
  deleteHoliday
} from "../api/calendarApi";

import CalendarHeader from "../component/calendar/CalendarHeader";
import CalendarView from "../component/calendar/CalendarView";
import HolidayModal from "../component/calendar/HolidayModal";

import { getUserDataFromCookies } from "../utils/cookiesData";

import "./Styles/calendar.css";

const CalendarPage = () => {

  const user = getUserDataFromCookies();
  const isAdmin = user?.role === "admin";

  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [title, setTitle] = useState("");

  /* LOAD HOLIDAYS */
  const loadHolidays = async () => {

    try {

      const data = await getHolidays();

      if (Array.isArray(data)) {
        setEvents(data);
      } else {
        setEvents([]);
      }

    } catch (error) {

      console.warn("Calendar API failed. Showing empty calendar.");
      setEvents([]);

    }

  };

  useEffect(() => {
    loadHolidays();
  }, []);

  /* ADD HOLIDAY (ADMIN ONLY) */
  const handleDateClick = (info) => {

    if (!isAdmin) return;

    setEditingEvent({
      id: null,
      date: info.dateStr
    });

    setTitle("");
  };

  /* EDIT HOLIDAY (ADMIN ONLY) */
  const handleEventClick = (clickInfo) => {

    if (!isAdmin) return;

    const event = clickInfo.event;

    setEditingEvent({
      id: event.id,
      date: event.startStr
    });

    setTitle(event.title);
  };

  /* SAVE EVENT */
  const saveEvent = async () => {

    if (!title) return;

    try {

      if (editingEvent.id) {

        await updateHoliday(editingEvent.id, {
          title,
          date: editingEvent.date
        });

      } else {

        await addHoliday({
          title,
          date: editingEvent.date
        });

      }

      await loadHolidays();

    } catch (error) {

      console.warn("Save holiday failed");

    }

    setEditingEvent(null);
  };

  /* DELETE EVENT */
  const deleteEvent = async () => {

    try {

      await deleteHoliday(editingEvent.id);
      await loadHolidays();

    } catch (error) {

      console.warn("Delete holiday failed");

    }

    setEditingEvent(null);
  };

  return (
    <div className="calendar-container">

      <CalendarHeader />

      <CalendarView
        events={events}
        handleDateClick={isAdmin ? handleDateClick : null}
        handleEventClick={isAdmin ? handleEventClick : null}
      />

      {isAdmin && editingEvent && (
        <HolidayModal
          title={title}
          setTitle={setTitle}
          editingEvent={editingEvent}
          saveEvent={saveEvent}
          deleteEvent={deleteEvent}
          close={() => setEditingEvent(null)}
        />
      )}

    </div>
  );
};

export default CalendarPage;