const db = require("../Config/connection");
const bcrypt = require("bcryptjs");

const User = {
  createUser: async (name, email, password, extra = {}) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const role = extra.role || "user";
    const positionId = extra.position_id || null;

    return new Promise((resolve, reject) => {
      db.query(
        `INSERT INTO users (full_name, email, password, role, position_id) VALUES (?, ?, ?, ?, ?)` ,
        [name, email, hashedPassword, role, positionId],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  },

  createPosition: (position) => {
    return new Promise((resolve, reject) => {
      db.query(
        `INSERT INTO positions (name, slug, description) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description)`,
        [position.name, position.slug, position.description || ""],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  },

  listPositions: () => {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM positions ORDER BY id ASC`, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  },

  listResources: () => {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM resources ORDER BY id ASC`, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  },

  createResource: ({ name, resource_key, description = "", is_default = 0 }) => {
    return new Promise((resolve, reject) => {
      db.query(
        `INSERT INTO resources (name, resource_key, description, is_default)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           description = VALUES(description),
           is_default = VALUES(is_default)`,
        [name, resource_key, description, is_default ? 1 : 0],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  },

  updateResource: (resourceId, { name, resource_key, description, is_default }) => {
    return new Promise((resolve, reject) => {
      db.query(
        `UPDATE resources
         SET name = ?, resource_key = ?, description = ?, is_default = ?
         WHERE id = ?`,
        [name, resource_key, description || "", is_default ? 1 : 0, resourceId],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  },

  deleteResource: (resourceId) => {
    return new Promise((resolve, reject) => {
      db.query(`DELETE FROM resources WHERE id = ?`, [resourceId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  },

  updatePosition: (positionId, payload) => {
    return new Promise((resolve, reject) => {
      db.query(
        `UPDATE positions
         SET name = ?, slug = ?, description = ?
         WHERE id = ?`,
        [payload.name, payload.slug, payload.description || "", positionId],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  },

  deletePosition: (positionId) => {
    return new Promise((resolve, reject) => {
      db.query(`DELETE FROM positions WHERE id = ?`, [positionId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  },

  getDefaultPositionId: () => {
    return new Promise((resolve, reject) => {
      db.query(`SELECT id FROM positions WHERE slug = 'employee' LIMIT 1`, (err, result) => {
        if (err) reject(err);
        else resolve(result[0]?.id || null);
      });
    });
  },

  findByEmail: (email) => {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT * FROM users WHERE email = ?`,
        [email],
        (err, result) => {
          if (err) reject(err);
          else if (result.length === 0) resolve(null);
          else resolve(result[0]);
        }
      );
    });
  },

  findEmailById: (userId) => {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT email FROM users WHERE id = ?`,
        [userId],
        (err, result) => {
          if (err) reject(err);
          else if (result.length === 0) resolve(null);
          else resolve(result[0].email);
        }
      );
    });
  },

  getUsers: async () => {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT full_name AS userName, id AS userId FROM users ORDER BY full_name ASC`,
        (err, result) => {
          if (err) reject(err);
          else if (result.length === 0) resolve([]);
          else resolve(result);
        }
      );
    });
  },

  findById: (userId) => {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT * FROM users WHERE id = ?`,
        [userId],
        (err, result) => {
          if (err) reject(err);
          else if (result.length === 0) resolve(null);
          else resolve(result[0]);
        }
      );
    });
  },

  updateUserPassword: (email, hashedPassword) => {
    return new Promise((resolve, reject) => {
      db.query(
        `UPDATE users SET password = ? WHERE email = ?`,
        [hashedPassword, email],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  },

  updateUserPasswordById: (userId, hashedPassword) => {
    return new Promise((resolve, reject) => {
      db.query(
        `UPDATE users SET password = ? WHERE id = ?`,
        [hashedPassword, userId],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  },

  findAllUsers: () => {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT u.*, p.name AS position_name FROM users u
         LEFT JOIN positions p ON p.id = u.position_id
         ORDER BY u.id DESC`,
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  },

  getAllUsers: (skip, limit, search) => {
    return new Promise((resolve, reject) => {
      const searchPattern = `%${search}%`;
      const query = `
        SELECT u.*, p.name AS position_name
        FROM users u
        LEFT JOIN positions p ON p.id = u.position_id
        WHERE u.full_name LIKE ? OR u.email LIKE ? OR u.role LIKE ?
        LIMIT ? OFFSET ?
      `;
      db.query(
        query,
        [searchPattern, searchPattern, searchPattern, limit, skip],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  },

  getUsersCount: (search) => {
    return new Promise((resolve, reject) => {
      const searchPattern = `%${search}%`;
      const query = `
        SELECT COUNT(*) AS count
        FROM users u
        WHERE u.full_name LIKE ? OR u.email LIKE ? OR u.role LIKE ?
      `;
      db.query(
        query,
        [searchPattern, searchPattern, searchPattern],
        (err, result) => {
          if (err) reject(err);
          else resolve(result[0].count);
        }
      );
    });
  },

  getUserPositions: (userId) => {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT up.*, p.name AS position_name, p.slug AS position_slug
         FROM user_positions up
         LEFT JOIN positions p ON p.id = up.position_id
         WHERE up.user_id = ?
         ORDER BY up.assigned_at DESC`,
        [userId],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  },

  getCurrentPositionId: (userId) => {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT position_id FROM user_positions WHERE user_id = ? AND is_active = 1 ORDER BY assigned_at DESC LIMIT 1`,
        [userId],
        (err, result) => {
          if (err) reject(err);
          else resolve(result[0]?.position_id || null);
        }
      );
    });
  },

  assignUserPosition: (userId, positionId, assignedBy) => new Promise((resolve, reject) => {
    db.beginTransaction((beginError) => {
      if (beginError) return reject(beginError);
      db.query('DELETE FROM user_positions WHERE user_id = ?', [userId], (deleteError) => {
        if (deleteError) return db.rollback(() => reject(deleteError));
        db.query(`INSERT INTO user_positions (user_id, position_id, assigned_by, is_active)
          VALUES (?, ?, ?, 1)`, [userId, positionId, assignedBy], (insertError, result) => {
          if (insertError) return db.rollback(() => reject(insertError));
          db.commit((commitError) => commitError ? reject(commitError) : resolve(result));
        });
      });
    });
  }),
  getPositionPermissions: (positionId) => {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT r.resource_key, r.name, pp.can_view, pp.can_create, pp.can_edit, pp.can_delete, pp.can_assign
         FROM position_permissions pp
         JOIN resources r ON r.id = pp.resource_id
         WHERE pp.position_id = ?`,
        [positionId],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  },

  getUserPermissions: (userId) => {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT up.resource_id, r.resource_key, r.name, up.can_view, up.can_create, up.can_edit, up.can_delete, up.can_assign
         FROM user_permissions up
         JOIN resources r ON r.id = up.resource_id
         WHERE up.user_id = ?`,
        [userId],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  },

  getResourceAccessForUser: async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
      return [];
    }

        if (user.role === 'super_admin') {
      const resources = await User.listResources();
      return resources.map((resource) => ({ id: resource.id, name: resource.name,
        resource_key: resource.resource_key, can_view: true, can_create: true,
        can_edit: true, can_delete: true, can_assign: true }));
    }

    const activePositionId = await User.getCurrentPositionId(userId);
    if (!activePositionId) {
      const fallback = await User.getDefaultPositionId();
      if (fallback) {
        await User.assignUserPosition(userId, fallback, userId);
      }
    }

    const [positionPermissions, userPermissions] = await Promise.all([
      User.getPositionPermissions(activePositionId || await User.getCurrentPositionId(userId)),
      User.getUserPermissions(userId),
    ]);

    const merged = new Map();

    positionPermissions.forEach((item) => {
      merged.set(item.resource_key, {
        id: item.resource_id,
        name: item.name,
        resource_key: item.resource_key,
        can_view: Boolean(item.can_view),
        can_create: Boolean(item.can_create),
        can_edit: Boolean(item.can_edit),
        can_delete: Boolean(item.can_delete),
        can_assign: Boolean(item.can_assign),
      });
    });

    userPermissions.forEach((item) => {
      const current = merged.get(item.resource_key) || {
        id: item.resource_id,
        name: item.name,
        resource_key: item.resource_key,
        can_view: false,
        can_create: false,
        can_edit: false,
        can_delete: false,
        can_assign: false,
      };
      merged.set(item.resource_key, {
        ...current,
        id: item.resource_id,
        name: item.name,
        resource_key: item.resource_key,
        can_view: item.can_view === null ? current.can_view : Boolean(item.can_view),
        can_create: item.can_create === null ? current.can_create : Boolean(item.can_create),
        can_edit: item.can_edit === null ? current.can_edit : Boolean(item.can_edit),
        can_delete: item.can_delete === null ? current.can_delete : Boolean(item.can_delete),
        can_assign: item.can_assign === null ? current.can_assign : Boolean(item.can_assign),
      });
    });

    return [...merged.values()].map((item) => ({
      id: item.id,
      name: item.name,
      resource_key: item.resource_key,
      can_view: item.can_view,
      can_create: item.can_create,
      can_edit: item.can_edit,
      can_delete: item.can_delete,
      can_assign: item.can_assign,
    }));
  },

  upsertUserPermission: (userId, resourceId, payload, assignedBy) => {
    return new Promise((resolve, reject) => {
      db.query(
        `INSERT INTO user_permissions (user_id, resource_id, can_view, can_create, can_edit, can_delete, can_assign, assigned_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           can_view = VALUES(can_view),
           can_create = VALUES(can_create),
           can_edit = VALUES(can_edit),
           can_delete = VALUES(can_delete),
           can_assign = VALUES(can_assign),
           assigned_by = VALUES(assigned_by),
           updated_at = CURRENT_TIMESTAMP`,
        [userId, resourceId, payload.can_view ? 1 : 0, payload.can_create ? 1 : 0, payload.can_edit ? 1 : 0, payload.can_delete ? 1 : 0, payload.can_assign ? 1 : 0, assignedBy],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  },

  getResourceByKey: (resourceKey) => {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM resources WHERE resource_key = ? LIMIT 1`, [resourceKey], (err, result) => {
        if (err) reject(err);
        else resolve(result[0] || null);
      });
    });
  },

  assignProjectToUser: (userId, projectId, assignedBy) => {
    return new Promise((resolve, reject) => {
      db.query(
        `INSERT INTO user_project_assignments (user_id, project_id, assigned_by) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE assigned_by = VALUES(assigned_by)`,
        [userId, projectId, assignedBy],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  },

  getUserAssignedProjects: (userId) => {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT p.* FROM user_project_assignments upa
         JOIN projects p ON p.id = upa.project_id
         WHERE upa.user_id = ? ORDER BY p.id DESC`,
        [userId],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  },
  updateManagedUser: (userId, payload) => new Promise((resolve, reject) => {
    const fields=['full_name=?','email=?','role=?','position_id=?','is_active=?'];
    const values=[payload.full_name,payload.email,payload.role,payload.position_id,payload.is_active?1:0];
    if(payload.password){fields.push('password=?');values.push(payload.password)}
    values.push(userId);db.query(`UPDATE users SET ${fields.join(',')} WHERE id=?`,values,(e,r)=>e?reject(e):resolve(r));
  }),
  deleteManagedUser: (userId) => new Promise((resolve,reject)=>db.query('DELETE FROM users WHERE id=?',[userId],(e,r)=>e?reject(e):resolve(r))),
  getPositionPermissionMatrix: (positionId) => new Promise((resolve, reject) => db.query(
    `SELECT r.id resource_id,r.name,r.resource_key,r.description,
      COALESCE(pp.can_view,0) can_view,COALESCE(pp.can_create,0) can_create,
      COALESCE(pp.can_edit,0) can_edit,COALESCE(pp.can_delete,0) can_delete,
      COALESCE(pp.can_assign,0) can_assign
     FROM resources r LEFT JOIN position_permissions pp ON pp.resource_id=r.id AND pp.position_id=?
     ORDER BY r.name`, [positionId], (e, rows) => e ? reject(e) : resolve(rows))),

  savePositionPermissionMatrix: (positionId, rows) => new Promise((resolve, reject) => {
    db.beginTransaction((beginError) => {
      if (beginError) return reject(beginError);
      const sql=`INSERT INTO position_permissions(position_id,resource_id,can_view,can_create,can_edit,can_delete,can_assign)
        VALUES(?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE can_view=VALUES(can_view),can_create=VALUES(can_create),
        can_edit=VALUES(can_edit),can_delete=VALUES(can_delete),can_assign=VALUES(can_assign)`;
      let pending=rows.length;if(!pending)return db.commit((e)=>e?reject(e):resolve());
      let failed=false;rows.forEach((row)=>db.query(sql,[positionId,row.resource_id,...['view','create','edit','delete','assign'].map(a=>row[`can_${a}`]?1:0)],(e)=>{
        if(failed)return;if(e){failed=true;return db.rollback(()=>reject(e));}if(!--pending)db.commit((ce)=>ce?reject(ce):resolve());
      }));
    });
  }),

  getUserPermissionMatrix: (userId) => new Promise((resolve, reject) => db.query(
    `SELECT u.id user_id,u.full_name,u.email,u.role,u.position_id,p.name position_name,r.id resource_id,r.name,r.resource_key,
      pp.can_view position_can_view,pp.can_create position_can_create,pp.can_edit position_can_edit,pp.can_delete position_can_delete,pp.can_assign position_can_assign,
      up.can_view,up.can_create,up.can_edit,up.can_delete,up.can_assign
     FROM users u JOIN resources r LEFT JOIN positions p ON p.id=u.position_id
     LEFT JOIN position_permissions pp ON pp.position_id=u.position_id AND pp.resource_id=r.id
     LEFT JOIN user_permissions up ON up.user_id=u.id AND up.resource_id=r.id WHERE u.id=? ORDER BY r.name`,
    [userId], (e, rows) => e ? reject(e) : resolve(rows))),

  saveUserPermissionMatrix: (userId, rows, assignedBy) => new Promise((resolve, reject) => {
    db.beginTransaction((beginError) => {
      if(beginError)return reject(beginError);let pending=rows.length;if(!pending)return db.commit((e)=>e?reject(e):resolve());let failed=false;
      const upsert=`INSERT INTO user_permissions(user_id,resource_id,can_view,can_create,can_edit,can_delete,can_assign,assigned_by)
        VALUES(?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE can_view=VALUES(can_view),can_create=VALUES(can_create),can_edit=VALUES(can_edit),can_delete=VALUES(can_delete),can_assign=VALUES(can_assign),assigned_by=VALUES(assigned_by)`;
      rows.forEach((row)=>{const values=['view','create','edit','delete','assign'].map(a=>row[`can_${a}`]===null||row[`can_${a}`]===undefined?null:(row[`can_${a}`]?1:0));const empty=values.every(v=>v===null);const sql=empty?'DELETE FROM user_permissions WHERE user_id=? AND resource_id=?':upsert;const params=empty?[userId,row.resource_id]:[userId,row.resource_id,...values,assignedBy];db.query(sql,params,(e)=>{if(failed)return;if(e){failed=true;return db.rollback(()=>reject(e));}if(!--pending)db.commit((ce)=>ce?reject(ce):resolve());});});
    });
  }),

  resetUserPermissions: (userId) => new Promise((resolve,reject)=>db.query('DELETE FROM user_permissions WHERE user_id=?',[userId],(e,r)=>e?reject(e):resolve(r))),
};

module.exports = User;




