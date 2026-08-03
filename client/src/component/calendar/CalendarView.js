import React, { useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";

const CalendarView = ({ events, handleDateClick, handleEventClick }) => {

  const calendarRef = useRef();

  return (
    <FullCalendar
      ref={calendarRef}

      plugins={[
        dayGridPlugin,
        listPlugin,
        interactionPlugin
      ]}

      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,listYear"
      }}

      initialView="dayGridMonth"

      /* WEEK STARTS FROM MONDAY */
      firstDay={1}

      events={events}

      dateClick={handleDateClick}
      eventClick={handleEventClick}

      height="auto"

      /* HIGHLIGHT WEEKENDS */
      dayCellClassNames={(arg) => {

        const day = arg.date.getDay();

        if (day === 0 || day === 6) {
          return "weekend-day";
        }

      }}

    />
  );
};

export default CalendarView;