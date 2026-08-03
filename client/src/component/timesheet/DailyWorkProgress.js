import React from "react";

const DailyWorkProgress = ({ dailyWork }) => {
  if (!dailyWork || dailyWork.length === 0) {
    return (
      <p className="no-work-msg">
        No daily work logs available for this week.
      </p>
    );
  }

  return (
    <div className="daily-work-wrapper">
      <h3 className="daily-title">This Week Work Progress</h3>

      {dailyWork.map((log, index) => {
        const dateObj = new Date(log.login_time);

        const dayLabel = dateObj.toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "2-digit",
          year: "numeric",
        });

        return (
          <div key={index} className="daily-card">
            {/* Day Header */}
            <h4 className="daily-day">{dayLabel}</h4>

            {/* Matter Sentence */}
            <p className="daily-text">
              I have worked on{" "}
              <span className="highlight-task">{log.task_name}</span>{" "}
              under the project{" "}
              <b className="highlight-project">{log.project_name}</b>{" "}
              during this week. The main focus was on{" "}
              <i>{log.working_on}</i>.
            </p>

            {/* Status Badge */}
            <span className={`status-pill ${log.status}`}>
              ● Status: {log.status}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default DailyWorkProgress;
