const { query } = require("../config/db");

const publicFields = `
  u.id, u.name, u.mobile, u.email, u.role, u.assigned_area_id,
  a.name AS assigned_area_name, u.status, u.created_at, u.updated_at
`;

async function findByMobile(mobile) {
  const rows = await query("SELECT * FROM users WHERE mobile = :mobile LIMIT 1", { mobile });
  return rows[0] || null;
}

async function findById(id) {
  const rows = await query(
    `SELECT ${publicFields}
     FROM users u
     LEFT JOIN areas a ON a.id = u.assigned_area_id
     WHERE u.id = :id
     LIMIT 1`,
    { id }
  );
  return rows[0] || null;
}

async function list({ role, status }) {
  const params = {};
  const clauses = ["1 = 1"];

  if (role) {
    clauses.push("u.role = :role");
    params.role = role;
  }
  if (status) {
    clauses.push("u.status = :status");
    params.status = status;
  }

  return query(
    `SELECT ${publicFields}
     FROM users u
     LEFT JOIN areas a ON a.id = u.assigned_area_id
     WHERE ${clauses.join(" AND ")}
     ORDER BY u.created_at DESC`,
    params
  );
}

async function create(payload) {
  const result = await query(
    `INSERT INTO users
      (name, mobile, email, password_hash, role, assigned_area_id, status)
     VALUES
      (:name, :mobile, :email, :password_hash, :role, :assigned_area_id, :status)`,
    {
      name: payload.name,
      mobile: payload.mobile,
      email: payload.email || null,
      password_hash: payload.password_hash,
      role: payload.role,
      assigned_area_id: payload.assigned_area_id || null,
      status: payload.status || "active"
    }
  );
  return findById(result.insertId);
}

async function update(id, payload) {
  const allowed = ["name", "mobile", "email", "password_hash", "role", "assigned_area_id", "status"];
  const assignments = [];
  const params = { id };

  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      assignments.push(`${key} = :${key}`);
      params[key] = payload[key] === "" ? null : payload[key];
    }
  }

  if (!assignments.length) {
    return findById(id);
  }

  await query(`UPDATE users SET ${assignments.join(", ")} WHERE id = :id`, params);
  return findById(id);
}

async function remove(id) {
  await query("DELETE FROM users WHERE id = :id AND role <> 'admin'", { id });
}

module.exports = {
  findByMobile,
  findById,
  list,
  create,
  update,
  remove
};
