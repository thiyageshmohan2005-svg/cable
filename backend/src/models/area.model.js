const { query } = require("../config/db");

async function list({ status } = {}) {
  const params = {};
  const clauses = [];

  if (status) {
    clauses.push("a.status = :status");
    params.status = status;
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return query(
    `SELECT
       a.*,
       COUNT(c.id) AS customer_count,
       SUM(CASE WHEN c.status = 'active' AND c.deleted_at IS NULL THEN 1 ELSE 0 END) AS active_customers,
       COALESCE(SUM(CASE WHEN c.deleted_at IS NULL THEN c.due_amount ELSE 0 END), 0) AS total_due
     FROM areas a
     LEFT JOIN customers c ON c.area_id = a.id AND c.deleted_at IS NULL
     ${where}
     GROUP BY a.id
     ORDER BY a.name ASC`,
    params
  );
}

async function findById(id) {
  const rows = await query("SELECT * FROM areas WHERE id = :id LIMIT 1", { id });
  return rows[0] || null;
}

async function findOrCreateByName(name) {
  const existing = await query("SELECT * FROM areas WHERE name = :name LIMIT 1", { name });
  if (existing[0]) {
    return existing[0];
  }

  const result = await query("INSERT INTO areas (name, status) VALUES (:name, 'active')", { name });
  return findById(result.insertId);
}

async function create(payload) {
  const result = await query(
    "INSERT INTO areas (name, description, status) VALUES (:name, :description, :status)",
    {
      name: payload.name,
      description: payload.description || null,
      status: payload.status || "active"
    }
  );
  return findById(result.insertId);
}

async function update(id, payload) {
  await query(
    `UPDATE areas
     SET name = :name, description = :description, status = :status
     WHERE id = :id`,
    {
      id,
      name: payload.name,
      description: payload.description || null,
      status: payload.status || "active"
    }
  );
  return findById(id);
}

async function remove(id) {
  await query("DELETE FROM areas WHERE id = :id", { id });
}

module.exports = {
  list,
  findById,
  findOrCreateByName,
  create,
  update,
  remove
};
