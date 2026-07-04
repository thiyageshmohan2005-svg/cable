const env = require("../config/env");
const { query, transaction } = require("../config/db");
const ApiError = require("../utils/ApiError");
const { getPagination, pagedResponse } = require("../utils/pagination");

function appendAreaScope(clauses, params, areaScope, alias = "c") {
  if (areaScope?.isRestricted && !areaScope.areaId) {
    clauses.push("1 = 0");
    return;
  }

  if (areaScope?.areaId) {
    clauses.push(`${alias}.area_id = :scope_area_id`);
    params.scope_area_id = areaScope.areaId;
  }
}

async function list(filters, areaScope) {
  const { page, limit, offset } = getPagination(filters);
  const params = { limit, offset };
  const clauses = ["c.deleted_at IS NULL"];
  appendAreaScope(clauses, params, areaScope);

  if (filters.search) {
    clauses.push(`(
      c.customer_code LIKE :search OR c.name LIKE :search OR c.mobile LIKE :search OR
      c.box_number LIKE :search OR c.address LIKE :search
    )`);
    params.search = `%${filters.search}%`;
  }
  if (filters.status) {
    clauses.push("c.status = :status");
    params.status = filters.status;
  }
  if (filters.pending === "true") {
    clauses.push("c.due_amount > 0");
  }

  const where = clauses.join(" AND ");
  const rows = await query(
    `SELECT
       c.*, a.name AS area_name, p.name AS plan_name, p.monthly_price
     FROM customers c
     JOIN areas a ON a.id = c.area_id
     JOIN plans p ON p.id = c.plan_id
     WHERE ${where}
     ORDER BY c.name ASC
     LIMIT :limit OFFSET :offset`,
    params
  );
  const countRows = await query(`SELECT COUNT(*) AS total FROM customers c WHERE ${where}`, params);
  return pagedResponse(rows, countRows[0].total, page, limit);
}

async function findById(id, areaScope = null) {
  const params = { id };
  const clauses = ["c.id = :id", "c.deleted_at IS NULL"];
  appendAreaScope(clauses, params, areaScope);

  const rows = await query(
    `SELECT
       c.*, a.name AS area_name, p.name AS plan_name, p.monthly_price
     FROM customers c
     JOIN areas a ON a.id = c.area_id
     JOIN plans p ON p.id = c.plan_id
     WHERE ${clauses.join(" AND ")}
     LIMIT 1`,
    params
  );
  return rows[0] || null;
}

async function create(payload, actorId) {
  return transaction(async (connection) => {
    const [[plan]] = await connection.execute("SELECT * FROM plans WHERE id = :plan_id", {
      plan_id: payload.plan_id
    });
    if (!plan) {
      throw new ApiError(422, "Selected plan does not exist");
    }

    const [insert] = await connection.execute(
      `INSERT INTO customers
        (name, mobile, address, area_id, box_number, plan_id, install_date,
         monthly_due, due_amount, status, created_by, updated_by)
       VALUES
        (:name, :mobile, :address, :area_id, :box_number, :plan_id, :install_date,
         :monthly_due, :due_amount, :status, :created_by, :updated_by)`,
      {
        name: payload.name,
        mobile: payload.mobile,
        address: payload.address,
        area_id: payload.area_id,
        box_number: payload.box_number || null,
        plan_id: payload.plan_id,
        install_date: payload.install_date || null,
        monthly_due: payload.monthly_due ?? plan.monthly_price,
        due_amount: payload.due_amount || 0,
        status: payload.status || "active",
        created_by: actorId || null,
        updated_by: actorId || null
      }
    );

    const customerCode = `${env.customerPrefix}${String(insert.insertId).padStart(6, "0")}`;
    await connection.execute("UPDATE customers SET customer_code = :customer_code WHERE id = :id", {
      customer_code: customerCode,
      id: insert.insertId
    });

    return findById(insert.insertId);
  });
}

async function update(id, payload, actorId) {
  const existing = await findById(id);
  if (!existing) {
    return null;
  }

  let monthlyDue = payload.monthly_due;
  if (payload.plan_id && !Object.prototype.hasOwnProperty.call(payload, "monthly_due")) {
    const rows = await query("SELECT monthly_price FROM plans WHERE id = :plan_id", {
      plan_id: payload.plan_id
    });
    monthlyDue = rows[0]?.monthly_price ?? existing.monthly_due;
  }

  await query(
    `UPDATE customers
     SET name = :name, mobile = :mobile, address = :address, area_id = :area_id,
         box_number = :box_number, plan_id = :plan_id, install_date = :install_date,
         monthly_due = :monthly_due, due_amount = :due_amount, status = :status,
         updated_by = :updated_by
     WHERE id = :id AND deleted_at IS NULL`,
    {
      id,
      name: payload.name ?? existing.name,
      mobile: payload.mobile ?? existing.mobile,
      address: payload.address ?? existing.address,
      area_id: payload.area_id ?? existing.area_id,
      box_number: payload.box_number ?? existing.box_number,
      plan_id: payload.plan_id ?? existing.plan_id,
      install_date: payload.install_date ?? existing.install_date,
      monthly_due: monthlyDue ?? existing.monthly_due,
      due_amount: payload.due_amount ?? existing.due_amount,
      status: payload.status ?? existing.status,
      updated_by: actorId || null
    }
  );

  return findById(id);
}

async function remove(id, actorId) {
  await query(
    "UPDATE customers SET deleted_at = NOW(), updated_by = :actorId WHERE id = :id AND deleted_at IS NULL",
    { id, actorId: actorId || null }
  );
}

async function addMonthlyDues(month) {
  const result = await query(
    `UPDATE customers
     SET due_amount = due_amount + monthly_due,
         last_due_generated_month = :month
     WHERE status = 'active'
       AND deleted_at IS NULL
       AND (last_due_generated_month IS NULL OR last_due_generated_month <> :month)`,
    { month }
  );
  return result.affectedRows;
}

module.exports = {
  list,
  findById,
  create,
  update,
  remove,
  addMonthlyDues
};
