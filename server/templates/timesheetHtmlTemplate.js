exports.generateTimesheetHTML = (
  user,
  week,
  rows,
  savedRows,
  logoUrl,
  approveToken,
  rejectToken,
) => {
  /* ================================
     TeamFlow Theme Colors
  ================================ */
  const themeColors = [
    "#2563eb",
    "#16a34a",
    "#9333ea",
    "#dc2626",
    "#f97116",
    "#b916f9",
    "#16eaf9",
  ];

  /* ================================
     Helper: Format Day + Date
  ================================ */
  const formatDayDate = (dateValue) => {
    const d = new Date(dateValue);

    const day = d.toLocaleDateString("en-US", { weekday: "long" });
    const date = d.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    return `${day}, ${date}`;
  };

  /* ================================
     Daily Work Progress Cards
  ================================ */
  const progressCards = rows
    .map((r, index) => {
      const color = themeColors[index % themeColors.length];
      const dayDate = formatDayDate(r.login_time);

      return `
      <div style="
        background:white;
        padding:14px;
        border-radius:14px;
        border-left:6px solid ${color};
        box-shadow:0px 3px 10px rgba(0,0,0,0.07);
      ">

        <h3 style="
          margin:0;
          font-size:15px;
          font-weight:700;
          color:#0f172a;
        ">
          ${dayDate}
        </h3>

        <p style="
  margin:6px 0;
  font-size:13px;
  color:#374151;
  line-height:1.5;
">
    I have worked on
  <b style="color:${color};">
    ${r.task_name}
  </b>
  under the project
  <b style="color:#111827;">
    ${r.project_name}
  </b>
  during this week.

  The main focus was on
  <i style="color:#475569;">
    ${r.working_on}
  </i>
</p>
        <span style="
          margin-top:7px;
          display:inline-block;
          padding:6px 14px;
          border-radius:20px;
          background:${color}15;
          color:${color};
          font-size:12px;
          font-weight:600;
        ">
          ● Status: ${r.status}
        </span>
      </div>
      `;
    })
    .join("");

  /* ================================
     Weekly Timesheet Table Rows
  ================================ */
  const timesheetTableRows = savedRows
    .map(
      (t, i) => `
      <tr>
        <td style="padding:10px;border:1px solid #eee;">${i + 1}</td>
        <td style="padding:10px;border:1px solid #eee;">${t.project_name}</td>
        <td style="padding:10px;border:1px solid #eee;">${t.task_name}</td>

        <td style="padding:10px;border:1px solid #eee;">${t.mon_hours}</td>
        <td style="padding:10px;border:1px solid #eee;">${t.tue_hours}</td>
        <td style="padding:10px;border:1px solid #eee;">${t.wed_hours}</td>
        <td style="padding:10px;border:1px solid #eee;">${t.thu_hours}</td>
        <td style="padding:10px;border:1px solid #eee;">${t.fri_hours}</td>

        <td style="
          padding:10px;
          border:1px solid #eee;
          font-weight:bold;
          color:#0f172a;
        ">
          ${t.total_hours}
        </td>
      </tr>
    `,
    )
    .join("");

  /* ================================
     Weekly Total Hours
  ================================ */
  const weeklyTotalHours = savedRows.reduce(
    (sum, r) => sum + Number(r.total_hours),
    0,
  );

  /* ================================
     Final HTML Template
  ================================ */
  return `
  <div style="
    font-family:Arial, sans-serif;
    padding:28px;
    background:#f8fafc;
    color:#111827;
  ">

    <!-- ✅ LETTERHEAD -->
    <div style="
      border-bottom:3px solid #0f172a;
      padding-bottom:12px;
      margin-bottom:20px;
      width:100%;
    ">
      <img src="${logoUrl}" style="height:55px;" /> 

      <div style="text-align:left;">
        <h2 style="margin:0;color:#0f172a;">TeamFlow Manager</h2>
        <p style="margin:2px;font-size:13px;color:gray;">
          Weekly Timesheet + Work Progress Report
        </p>
        <p style="margin:2px;font-size:13px;color:gray;">
          Monday → Friday, Week ${week.weekNo} of ${week.year}
        </p>
      </div>
    </div>

    <!-- ✅ EMPLOYEE INFO -->
    <div style="
      background:white;
      padding:15px;
      border-radius:14px;
      border:1px solid #e5e7eb;
      margin-bottom:20px;
      box-shadow:0px 2px 8px rgba(0,0,0,0.05);
    ">
      <p style="margin:4px 0;"><b>Employee:</b> ${user.full_name}</p>
      <p style="margin:4px 0;"><b>Week No:</b> ${week.weekNo}</p>

      <p style="margin:4px 0;">
        <b>Total Weekly Hours:</b>
        <span style="color:#16a34a;font-weight:bold;">
          ${weeklyTotalHours} hrs
        </span>
      </p>

      <p style="margin:4px 0;">
        <b>Status:</b>
        <span style="color:#2563eb;font-weight:600;">
          Pending Manager Approval
        </span>
      </p>
    </div>

    <!-- ✅ DAILY WORK PROGRESS -->
    <h3 style="margin-bottom:12px;color:#0f172a;">
      Daily Work Progress
    </h3>

    <div style="
      display:grid;
      grid-template-columns:repeat(2, 1fr);
      gap:14px;
      margin-bottom:28px;
    ">
      ${progressCards}
    </div>

    <!-- ✅ WEEKLY TIMESHEET REPORT -->
    <h3 style="margin-bottom:10px;color:#0f172a;">
      Weekly Timesheet Report
    </h3>

    <table style="
      width:100%;
      border-collapse:collapse;
      background:white;
      border-radius:12px;
      overflow:hidden;
      box-shadow:0px 2px 10px rgba(0,0,0,0.06);
      font-size:13px;
    ">
      <thead>
        <tr style="background:#0f172a;color:white;">
          <th style="padding:10px;">#</th>
          <th style="padding:10px;">Project</th>
          <th style="padding:10px;">Task</th>
          <th style="padding:10px;">Mon</th>
          <th style="padding:10px;">Tue</th>
          <th style="padding:10px;">Wed</th>
          <th style="padding:10px;">Thu</th>
          <th style="padding:10px;">Fri</th>
          <th style="padding:10px;">Total</th>
        </tr>
      </thead>

      <tbody>
        ${timesheetTableRows}
      </tbody>
    </table>

    <!-- ✅ REGARDS + BUTTONS RIGHT SIDE -->
    <div style="
      margin-top:35px;
      text-align:center;
      width:100%;
    ">
      <!-- Regards -->
      <div>
        <p style="margin:0;font-size:14px;">
          Regards,<br/>
          <b>${user.full_name}</b>
        </p>
      </div>

      <!-- Buttons Right -->
      <div style="display:flex;gap:12px;text-align:center;">
      <a href="https://teamflow-api.bedatatech.com/api/timesheet/action/${rejectToken}"
          style="
            background:#dc2626;
            color:white;
            padding:10px 22px;
            border-radius:10px;
            font-size:13px;
            font-weight:700;
            text-decoration:none;
            margin-right:10px;
          "
        >
           Reject
        </a>

        <a href="https://teamflow-api.bedatatech.com/api/timesheet/action/${approveToken}"
          style="
            background:#16a34a;
            color:white;
            padding:10px 22px;
            border-radius:10px;
            font-size:13px;
            font-weight:700;
            text-decoration:none;
          "
        >
           Approve
        </a>

        
      </div>
    </div>

    <!-- ✅ FOOTER LINE -->
    <hr style="
      margin-top:25px;
      border:none;
      border-top:1px solid #e5e7eb;
    "/>

    <!-- ✅ FOOTER -->
    <p style="
      text-align:center;
      color:gray;
      font-size:12px;
      margin-top:12px;
    ">
      Generated automatically by TeamFlow Manager Timesheet System
    </p>

  </div>
  `;
};
