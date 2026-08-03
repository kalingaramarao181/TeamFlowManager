const db = require("../Config/connection");

const query = (sql, values = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, values, (error, rows) => {
      if (error) reject(error);
      else resolve(rows);
    });
  });

const isOrganizationRole = (role) => ["admin", "manager"].includes(role);

exports.getDashboardOverview = async ({ id: userId, role }) => {
  const organizationView = isOrganizationRole(role);
  const issueScope = organizationView ? "" : "WHERE i.assignee = ?";
  const issueValues = organizationView ? [] : [userId];
  const workScope = organizationView ? "" : "AND ews.user_id = ?";
  const workValues = organizationView ? [] : [userId];
  const timesheetScope = organizationView ? "" : "WHERE wt.user_id = ?";
  const timesheetValues = organizationView ? [] : [userId];
  const reportScope = organizationView ? "" : "WHERE r.userId = ?";
  const reportValues = organizationView ? [] : [userId];

  const [
    projectSummary,
    issueSummary,
    timesheetSummary,
    reportSummary,
    documentSummary,
    employeeSummary,
    employees,
    recentIssues,
    recentProjects,
    recentWork,
    upcomingHolidays,
    issueChart,
    weeklyHours,
  ] = await Promise.all([
    query(`SELECT COUNT(*) total FROM projects`),
    query(
      `SELECT
        COUNT(*) total,
        SUM(CASE WHEN LOWER(COALESCE(i.status, '')) IN ('to do','open') THEN 1 ELSE 0 END) open_count,
        SUM(CASE WHEN LOWER(COALESCE(i.status, '')) LIKE '%progress%' THEN 1 ELSE 0 END) in_progress,
        SUM(CASE WHEN LOWER(COALESCE(i.status, '')) IN ('done','resolved','completed') THEN 1 ELSE 0 END) resolved,
        SUM(CASE WHEN LOWER(COALESCE(i.priority, '')) IN ('critical','highest') THEN 1 ELSE 0 END) critical
       FROM issues i ${issueScope}`,
      issueValues
    ),
    query(
      `SELECT
        COUNT(*) total,
        SUM(CASE WHEN LOWER(status) = 'pending' THEN 1 ELSE 0 END) pending,
        SUM(CASE WHEN LOWER(status) = 'approved' THEN 1 ELSE 0 END) approved,
        SUM(CASE WHEN LOWER(status) = 'rejected' THEN 1 ELSE 0 END) rejected,
        COALESCE(SUM(CASE
          WHEN week_no = WEEK(CURRENT_DATE(), 1) AND year = YEAR(CURRENT_DATE())
          THEN total_hours ELSE 0 END), 0) week_hours
       FROM weekly_timesheets wt ${timesheetScope}`,
      timesheetValues
    ),
    query(
      `SELECT COUNT(*) total,
        SUM(CASE WHEN DATE(createdAt) >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) recent
       FROM reports r ${reportScope}`,
      reportValues
    ),
    query(
      `SELECT COUNT(*) total,
        SUM(CASE WHEN DATE(uploaded_at) >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) recent
       FROM employee_status_documents`
    ),
    query(
      `SELECT COUNT(*) total,
        SUM(CASE WHEN EXISTS (
          SELECT 1 FROM employee_work_status e
          WHERE e.user_id = users.id AND DATE(e.login_time) = CURRENT_DATE()
        ) THEN 1 ELSE 0 END) present_today,
        SUM(CASE WHEN EXISTS (
          SELECT 1 FROM employee_work_status e
          WHERE e.user_id = users.id AND DATE(e.login_time) = CURRENT_DATE()
            AND e.login_status = 1
        ) THEN 1 ELSE 0 END) working_now
       FROM users ${organizationView ? "" : "WHERE id = ?"}`,
      organizationView ? [] : [userId]
    ),
    query(
      `SELECT u.id, u.full_name user_name, ews.login_time, ews.logout_time,
        ews.login_status, ews.module_name, ews.working_on, p.name project_name
       FROM users u
       LEFT JOIN employee_work_status ews ON ews.id = (
         SELECT latest.id FROM employee_work_status latest
         WHERE latest.user_id = u.id AND DATE(latest.login_time) = CURRENT_DATE()
         ORDER BY latest.login_time DESC LIMIT 1
       )
       LEFT JOIN projects p ON p.id = ews.project_id
       ${organizationView ? "" : "WHERE u.id = ?"}
       ORDER BY ews.login_status DESC, u.full_name ASC
       LIMIT 12`,
      organizationView ? [] : [userId]
    ),
    query(
      `SELECT i.id, i.summary, i.priority, i.status, i.created_at,
        p.name project_name, p.projectKey project_key, u.full_name assignee_name
       FROM issues i
       LEFT JOIN projects p ON p.id = i.project
       LEFT JOIN users u ON u.id = i.assignee
       ${issueScope}
       ORDER BY i.created_at DESC LIMIT 7`,
      issueValues
    ),
    query(
      `SELECT p.id, p.name, p.projectKey, p.type, p.created_at,
        u.full_name owner_name, COUNT(i.id) issue_count,
        SUM(CASE WHEN LOWER(COALESCE(i.status, '')) IN ('done','resolved','completed') THEN 1 ELSE 0 END) completed_count
       FROM projects p
       LEFT JOIN users u ON u.id = p.lead
       LEFT JOIN issues i ON i.project = p.id
       GROUP BY p.id, p.name, p.projectKey, p.type, p.created_at, u.full_name
       ORDER BY p.created_at DESC LIMIT 6`
    ),
    query(
      `SELECT ews.id, ews.user_id, u.full_name user_name, p.name project_name,
        ews.module_name, ews.working_on, ews.worked_on, ews.status,
        ews.login_time, ews.logout_time
       FROM employee_work_status ews
       LEFT JOIN users u ON u.id = ews.user_id
       LEFT JOIN projects p ON p.id = ews.project_id
       WHERE 1=1 ${workScope}
       ORDER BY ews.created_at DESC LIMIT 8`,
      workValues
    ),
    query(
      `SELECT id, title, date, type, color
       FROM holidays WHERE date >= CURRENT_DATE()
       ORDER BY date ASC LIMIT 6`
    ),
    query(
      `SELECT COALESCE(status, 'Unspecified') label, COUNT(*) value
       FROM issues i ${issueScope}
       GROUP BY status ORDER BY value DESC`,
      issueValues
    ),
    query(
      `SELECT DATE(ews.login_time) work_date,
        ROUND(SUM(TIMESTAMPDIFF(MINUTE, ews.login_time,
          COALESCE(ews.logout_time, CURRENT_TIMESTAMP))) / 60, 1) hours
       FROM employee_work_status ews
       WHERE ews.login_time >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 DAY)
       ${workScope}
       GROUP BY DATE(ews.login_time) ORDER BY work_date ASC`,
      workValues
    ),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    scope: organizationView ? "organization" : "personal",
    summary: {
      projects: { total: Number(projectSummary[0]?.total || 0) },
      issues: issueSummary[0] || {},
      timesheets: timesheetSummary[0] || {},
      reports: reportSummary[0] || {},
      documents: documentSummary[0] || {},
      employees: {
        total: Number(employeeSummary[0]?.total || 0),
        workingNow: Number(employeeSummary[0]?.working_now || 0),
        presentToday: Number(employeeSummary[0]?.present_today || 0),
      },
    },
    charts: { issueStatus: issueChart, weeklyHours },
    recentIssues,
    recentProjects,
    recentWork,
    employees,
    upcomingHolidays,
  };
};
