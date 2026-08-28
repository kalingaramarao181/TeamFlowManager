const db = require('../Config/connection');
const query = (sql) => new Promise((resolve, reject) => {
  db.query(sql, (error, results) => {
    if (error) return reject(error);
    resolve(results);
  });
});

const runMigrations = async () => {
  const entryTypeColumns = await query(
    "SHOW COLUMNS FROM weekly_timesheets LIKE 'entry_type'"
  );

  if (entryTypeColumns.length === 0) {
    await query(`ALTER TABLE weekly_timesheets
      ADD COLUMN entry_type ENUM('project', 'leave', 'training') NOT NULL DEFAULT 'project' AFTER year`);
  }

  await query(`ALTER TABLE weekly_timesheets
    MODIFY project_id INT NULL`);

  const positionIdColumns = await query(
    "SHOW COLUMNS FROM users LIKE 'position_id'"
  );

  if (positionIdColumns.length === 0) {
    await query(`ALTER TABLE users
      ADD COLUMN position_id INT NULL AFTER role`);
  }

  const isActiveColumns = await query(
    "SHOW COLUMNS FROM users LIKE 'is_active'"
  );

  if (isActiveColumns.length === 0) {
    await query(`ALTER TABLE users
      ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1 AFTER position_id`);
  }

  const migrationQueries = [
    `ALTER TABLE user_permissions
      MODIFY can_view TINYINT(1) NULL DEFAULT NULL,
      MODIFY can_create TINYINT(1) NULL DEFAULT NULL,
      MODIFY can_edit TINYINT(1) NULL DEFAULT NULL,
      MODIFY can_delete TINYINT(1) NULL DEFAULT NULL,
      MODIFY can_assign TINYINT(1) NULL DEFAULT NULL`,
    `
      ALTER TABLE users
      MODIFY role ENUM('user', 'admin', 'super_admin', 'moderator') NOT NULL DEFAULT 'user'
    `,
    `
      CREATE TABLE IF NOT EXISTS positions (
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL,
        description TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY unique_position_slug (slug)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `,
    `
      CREATE TABLE IF NOT EXISTS resources (
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        resource_key VARCHAR(100) NOT NULL,
        description TEXT NULL,
        is_default TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY unique_resource_key (resource_key)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `,
    `
      CREATE TABLE IF NOT EXISTS position_permissions (
        id INT NOT NULL AUTO_INCREMENT,
        position_id INT NOT NULL,
        resource_id INT NOT NULL,
        can_view TINYINT(1) DEFAULT 0,
        can_create TINYINT(1) DEFAULT 0,
        can_edit TINYINT(1) DEFAULT 0,
        can_delete TINYINT(1) DEFAULT 0,
        can_assign TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY unique_position_resource (position_id, resource_id),
        CONSTRAINT fk_position_permission_position FOREIGN KEY (position_id) REFERENCES positions (id) ON DELETE CASCADE,
        CONSTRAINT fk_position_permission_resource FOREIGN KEY (resource_id) REFERENCES resources (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `,
    `
      CREATE TABLE IF NOT EXISTS user_positions (
        id INT NOT NULL AUTO_INCREMENT,
        user_id INT NOT NULL,
        position_id INT NOT NULL,
        assigned_by INT NULL,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active TINYINT(1) DEFAULT 1,
        PRIMARY KEY (id),
        UNIQUE KEY unique_active_user_position (user_id, is_active),
        KEY idx_user_position_user (user_id),
        KEY idx_user_position_position (position_id),
        CONSTRAINT fk_user_position_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT fk_user_position_assigned_by FOREIGN KEY (assigned_by) REFERENCES users (id) ON DELETE SET NULL,
        CONSTRAINT fk_user_position_position FOREIGN KEY (position_id) REFERENCES positions (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `,
    `
      CREATE TABLE IF NOT EXISTS user_permissions (
        id INT NOT NULL AUTO_INCREMENT,
        user_id INT NOT NULL,
        resource_id INT NOT NULL,
        can_view TINYINT(1) DEFAULT 0,
        can_create TINYINT(1) DEFAULT 0,
        can_edit TINYINT(1) DEFAULT 0,
        can_delete TINYINT(1) DEFAULT 0,
        can_assign TINYINT(1) DEFAULT 0,
        assigned_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY unique_user_resource_permission (user_id, resource_id),
        CONSTRAINT fk_user_permission_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT fk_user_permission_resource FOREIGN KEY (resource_id) REFERENCES resources (id) ON DELETE CASCADE,
        CONSTRAINT fk_user_permission_assigned_by FOREIGN KEY (assigned_by) REFERENCES users (id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `,
    `
      CREATE TABLE IF NOT EXISTS user_project_assignments (
        id INT NOT NULL AUTO_INCREMENT,
        user_id INT NOT NULL,
        project_id INT NOT NULL,
        assigned_by INT NULL,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY unique_user_project_assignment (user_id, project_id),
        CONSTRAINT fk_user_project_assignment_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT fk_user_project_assignment_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
        CONSTRAINT fk_user_project_assignment_assigned_by FOREIGN KEY (assigned_by) REFERENCES users (id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `,
    `
      CREATE TABLE IF NOT EXISTS project_team_members (
        id INT NOT NULL AUTO_INCREMENT,
        team_id INT NOT NULL,
        user_id INT NOT NULL,
        role VARCHAR(50) DEFAULT 'member',
        is_lead TINYINT(1) DEFAULT 0,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY team_id (team_id),
        KEY user_id (user_id),
        UNIQUE KEY unique_team_member (team_id, user_id),
        CONSTRAINT fk_project_team_members_team FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE,
        CONSTRAINT fk_project_team_members_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `,
    `
      CREATE TABLE IF NOT EXISTS project_github_configs (
        id INT NOT NULL AUTO_INCREMENT,
        project_id INT NOT NULL,
        repo_url VARCHAR(500) NOT NULL,
        repo_name VARCHAR(255) DEFAULT NULL,
        github_token TEXT DEFAULT NULL,
        last_synced_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY unique_project_github_config (project_id),
        CONSTRAINT fk_project_github_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `,
    `
      CREATE TABLE IF NOT EXISTS project_task_breakdowns (
        id INT NOT NULL AUTO_INCREMENT,
        project_id INT NOT NULL,
        task_id INT NOT NULL,
        subtask_name VARCHAR(255) NOT NULL,
        assignee_id INT DEFAULT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        percentage INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_project_task_breakdowns_project (project_id),
        KEY idx_project_task_breakdowns_task (task_id),
        CONSTRAINT fk_task_breakdowns_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
        CONSTRAINT fk_task_breakdowns_task FOREIGN KEY (task_id) REFERENCES issues (id) ON DELETE CASCADE,
        CONSTRAINT fk_task_breakdowns_assignee FOREIGN KEY (assignee_id) REFERENCES users (id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `,
    `
      INSERT INTO positions (name, slug, description)
      VALUES
        ('Employee', 'employee', 'Standard user access'),
        ('Manager', 'manager', 'Manager access to reports and team visibility'),
        ('Team Lead', 'team_lead', 'Project team leadership access'),
        ('Admin', 'admin', 'Admin access with project and management controls'),
        ('Super Admin', 'super_admin', 'Ultimate access across the platform')
      ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description)
    `,
    `
      INSERT INTO resources (name, resource_key, description, is_default)
      VALUES
        ('Dashboard', 'dashboard', 'Dashboard access', 1),
        ('Your work', 'work', 'User work overview', 1),
        ('Time Sheets', 'time_sheets', 'Timesheet access', 1),
        ('Projects', 'projects', 'Project access', 1),
        ('Admin Time Sheets', 'admin_time_sheets', 'Administrative timesheet access', 0),
        ('Reports', 'reports', 'Individual reports', 1),
        ('All Reports', 'all_reports', 'All team reports', 0),
        ('Teams', 'teams', 'Team management', 0),
        ('Settings', 'settings', 'Settings pages', 0),
        ('Issues', 'issues', 'Issue tracking', 1),
        ('Calendar', 'calendar', 'Calendar and scheduling', 1),
        ('Users', 'users', 'Manage all users', 0),
        ('Resources', 'resources', 'Manage platform resources', 0),
        ('Positions', 'positions', 'Manage roles and positions', 0),
        ('Project Assignment', 'project_assignment', 'Assign users to projects', 0),
        ('User Management', 'user_management', 'Manage all users', 0),
        ('Position Management', 'position_management', 'Manage roles and positions', 0)
      ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description)
    `,
    `
      INSERT INTO position_permissions (position_id, resource_id, can_view, can_create, can_edit, can_delete, can_assign)
      SELECT p.id, r.id, 1, 1, 1, 1, 1
      FROM positions p
      JOIN resources r ON r.resource_key = 'dashboard'
      WHERE p.slug = 'super_admin'
      ON DUPLICATE KEY UPDATE can_view = VALUES(can_view), can_create = VALUES(can_create), can_edit = VALUES(can_edit), can_delete = VALUES(can_delete), can_assign = VALUES(can_assign)
    `,
    `
      INSERT INTO position_permissions (position_id, resource_id, can_view, can_create, can_edit, can_delete, can_assign)
      SELECT p.id, r.id, 1, 0, 0, 0, 0
      FROM positions p
      JOIN resources r ON r.resource_key IN ('dashboard','work','time_sheets','projects','reports','issues','calendar')
      WHERE p.slug = 'employee'
      ON DUPLICATE KEY UPDATE can_view = VALUES(can_view), can_create = VALUES(can_create), can_edit = VALUES(can_edit), can_delete = VALUES(can_delete), can_assign = VALUES(can_assign)
    `,
    `
      INSERT INTO position_permissions (position_id, resource_id, can_view, can_create, can_edit, can_delete, can_assign)
      SELECT p.id, r.id, 1, 1, 1, 0, 0
      FROM positions p
      JOIN resources r ON r.resource_key IN ('dashboard','work','time_sheets','projects','reports','all_reports','teams','issues','calendar')
      WHERE p.slug = 'manager'
      ON DUPLICATE KEY UPDATE can_view = VALUES(can_view), can_create = VALUES(can_create), can_edit = VALUES(can_edit), can_delete = VALUES(can_delete), can_assign = VALUES(can_assign)
    `,
    `
      INSERT INTO position_permissions (position_id, resource_id, can_view, can_create, can_edit, can_delete, can_assign)
      SELECT p.id, r.id, 1, 1, 1, 1, 1
      FROM positions p
      JOIN resources r ON r.resource_key IN ('dashboard','work','time_sheets','projects','reports','all_reports','teams','issues','calendar','project_assignment')
      WHERE p.slug = 'team_lead'
      ON DUPLICATE KEY UPDATE can_view = VALUES(can_view), can_create = VALUES(can_create), can_edit = VALUES(can_edit), can_delete = VALUES(can_delete), can_assign = VALUES(can_assign)
    `,
    `
      INSERT INTO position_permissions (position_id, resource_id, can_view, can_create, can_edit, can_delete, can_assign)
      SELECT p.id, r.id, 1, 1, 1, 1, 1
      FROM positions p
      JOIN resources r ON r.resource_key IN ('dashboard','work','time_sheets','projects','admin_time_sheets','reports','all_reports','teams','settings','issues','calendar','users','resources','positions','user_management','project_assignment','position_management')
      WHERE p.slug = 'admin'
      ON DUPLICATE KEY UPDATE can_view = VALUES(can_view), can_create = VALUES(can_create), can_edit = VALUES(can_edit), can_delete = VALUES(can_delete), can_assign = VALUES(can_assign)
    `,
    `
      INSERT INTO position_permissions (position_id, resource_id, can_view, can_create, can_edit, can_delete, can_assign)
      SELECT p.id, r.id, 1, 1, 1, 1, 1
      FROM positions p
      JOIN resources r ON r.resource_key IN ('dashboard','work','time_sheets','projects','admin_time_sheets','reports','all_reports','teams','settings','issues','calendar','users','resources','positions','user_management','project_assignment','position_management')
      WHERE p.slug = 'super_admin'
      ON DUPLICATE KEY UPDATE can_view = VALUES(can_view), can_create = VALUES(can_create), can_edit = VALUES(can_edit), can_delete = VALUES(can_delete), can_assign = VALUES(can_assign)
    `,
    `
      INSERT INTO user_positions (user_id, position_id, assigned_by, is_active)
      SELECT u.id, p.id, u.id, 1
      FROM users u
      JOIN positions p ON p.slug = 'employee'
      WHERE u.position_id IS NULL
      ON DUPLICATE KEY UPDATE position_id = VALUES(position_id), is_active = 1
    `,
    `
      UPDATE users u
      LEFT JOIN user_positions up ON up.user_id = u.id AND up.is_active = 1
      SET u.position_id = COALESCE(up.position_id, (SELECT id FROM positions WHERE slug = 'employee'))
      WHERE u.position_id IS NULL
    `
  ];

  for (const query of migrationQueries) {
    await new Promise((resolve, reject) => {
      db.query(query, (error) => {
        if (error) return reject(error);
        resolve();
      });
    });
  }

  return true;
};

module.exports = { runMigrations };

