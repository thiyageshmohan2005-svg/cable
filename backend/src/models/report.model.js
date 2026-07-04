const { query } = require("../config/db");

function applyScope(actor, clauses, params, alias = "c") {
  if (actor.role === "collector") {
    clauses.push(`${alias}.area_id = :areaId`);
    params.areaId = actor.assigned_area_id || 0;
  }
}

async function daily(date, actor) {
  const params = { date };
  const clauses = ["DATE(pay.payment_date) = :date"];
  applyScope(actor, clauses, params);

  return query(
    `SELECT
       pay.receipt_no, pay.payment_date, pay.amount, pay.method,
       c.customer_code, c.name AS customer_name, c.mobile,
       a.name AS area_name, u.name AS collected_by_name
     FROM payments pay
     JOIN customers c ON c.id = pay.customer_id
     JOIN areas a ON a.id = c.area_id
     LEFT JOIN users u ON u.id = pay.collected_by
     WHERE ${clauses.join(" AND ")}
     ORDER BY pay.payment_date DESC`,
    params
  );
}

async function monthly(month, actor) {
  const params = { month };
  const clauses = ["DATE_FORMAT(pay.payment_date, '%Y-%m') = :month"];
  applyScope(actor, clauses, params);

  return query(
    `SELECT
       DATE(pay.payment_date) AS payment_day,
       pay.method,
       COUNT(*) AS receipt_count,
       SUM(pay.amount) AS total_amount
     FROM payments pay
     JOIN customers c ON c.id = pay.customer_id
     WHERE ${clauses.join(" AND ")}
     GROUP BY DATE(pay.payment_date), pay.method
     ORDER BY payment_day ASC, pay.method ASC`,
    params
  );
}

async function pendingDues(filters, actor) {
  const params = {};
  const clauses = ["c.deleted_at IS NULL", "c.due_amount > 0"];
  applyScope(actor, clauses, params);

  if (filters.area_id && actor.role === "admin") {
    clauses.push("c.area_id = :area_id");
    params.area_id = filters.area_id;
  }

  return query(
    `SELECT
       c.customer_code, c.name, c.mobile, c.address, c.box_number,
       c.due_amount, c.status, a.name AS area_name, p.name AS plan_name
     FROM customers c
     JOIN areas a ON a.id = c.area_id
     JOIN plans p ON p.id = c.plan_id
     WHERE ${clauses.join(" AND ")}
     ORDER BY a.name ASC, c.name ASC`,
    params
  );
}

module.exports = {
  daily,
  monthly,
  pendingDues
};
