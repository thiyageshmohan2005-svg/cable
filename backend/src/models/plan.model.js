const { query } = require("../config/db");

async function list({ status } = {}) {
  const params = {};
  const where = status ? "WHERE status = :status" : "";
  if (status) {
    params.status = status;
  }

  return query(`SELECT * FROM plans ${where} ORDER BY monthly_price ASC, name ASC`, params);
}

async function findById(id) {
  const rows = await query("SELECT * FROM plans WHERE id = :id LIMIT 1", { id });
  return rows[0] || null;
}

async function findOrCreateByName(name, monthlyPrice = 0) {
  const existing = await query("SELECT * FROM plans WHERE name = :name LIMIT 1", { name });
  if (existing[0]) {
    return existing[0];
  }

  const result = await query(
    "INSERT INTO plans (name, monthly_price, status) VALUES (:name, :monthly_price, 'active')",
    { name, monthly_price: monthlyPrice }
  );
  return findById(result.insertId);
}

async function create(payload) {
  const result = await query(
    `INSERT INTO plans (name, monthly_price, channels_count, description, status)
     VALUES (:name, :monthly_price, :channels_count, :description, :status)`,
    {
      name: payload.name,
      monthly_price: payload.monthly_price,
      channels_count: payload.channels_count || null,
      description: payload.description || null,
      status: payload.status || "active"
    }
  );
  return findById(result.insertId);
}

async function update(id, payload) {
  await query(
    `UPDATE plans
     SET name = :name, monthly_price = :monthly_price, channels_count = :channels_count,
         description = :description, status = :status
     WHERE id = :id`,
    {
      id,
      name: payload.name,
      monthly_price: payload.monthly_price,
      channels_count: payload.channels_count || null,
      description: payload.description || null,
      status: payload.status || "active"
    }
  );
  return findById(id);
}

async function remove(id) {
  await query("DELETE FROM plans WHERE id = :id", { id });
}

module.exports = {
  list,
  findById,
  findOrCreateByName,
  create,
  update,
  remove
};
