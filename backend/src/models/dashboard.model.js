const dayjs = require("dayjs");
const { query } = require("../config/db");

function scopedCustomerClause(actor, alias = "c", params = {}) {
  if (actor.role === "collector") {
    params.areaId = actor.assigned_area_id || 0;
    return `${alias}.area_id = :areaId`;
  }
  return "1 = 1";
}

async function summary(actor) {
  const params = {};
  const customerScope = scopedCustomerClause(actor, "c", params);
  const month = dayjs().format("YYYY-MM");

  const [customerStats] = await query(
    `SELECT
       COUNT(*) AS total_customers,
       SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_customers,
       SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) AS inactive_customers,
       COALESCE(SUM(due_amount), 0) AS pending_dues
     FROM customers c
     WHERE c.deleted_at IS NULL AND ${customerScope}`,
    params
  );

  const [collectionStats] = await query(
    `SELECT
       COALESCE(SUM(CASE WHEN DATE(pay.payment_date) = CURDATE() THEN pay.amount ELSE 0 END), 0) AS today_collection,
       COALESCE(SUM(CASE WHEN DATE_FORMAT(pay.payment_date, '%Y-%m') = :month THEN pay.amount ELSE 0 END), 0) AS monthly_collection
     FROM payments pay
     JOIN customers c ON c.id = pay.customer_id
     WHERE ${customerScope}`,
    { ...params, month }
  );

  const areaAnalytics = await query(
    `SELECT
       a.id,
       a.name,
       COUNT(c.id) AS total_customers,
       SUM(CASE WHEN c.status = 'active' THEN 1 ELSE 0 END) AS active_customers,
       COALESCE(SUM(c.due_amount), 0) AS pending_dues,
       COALESCE(pay.monthly_collection, 0) AS monthly_collection
     FROM areas a
     LEFT JOIN customers c ON c.area_id = a.id AND c.deleted_at IS NULL
     LEFT JOIN (
       SELECT c2.area_id, SUM(pay2.amount) AS monthly_collection
       FROM payments pay2
       JOIN customers c2 ON c2.id = pay2.customer_id
       WHERE DATE_FORMAT(pay2.payment_date, '%Y-%m') = :month
       GROUP BY c2.area_id
     ) pay ON pay.area_id = a.id
     WHERE ${actor.role === "collector" ? "a.id = :areaId" : "1 = 1"}
     GROUP BY a.id, a.name, pay.monthly_collection
     ORDER BY a.name ASC`,
    { ...params, month }
  );

  return {
    ...customerStats,
    ...collectionStats,
    area_analytics: areaAnalytics
  };
}

module.exports = {
  summary
};
