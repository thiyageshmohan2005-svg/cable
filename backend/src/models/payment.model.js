const dayjs = require("dayjs");
const { query, transaction } = require("../config/db");
const ApiError = require("../utils/ApiError");
const { buildReceiptNo } = require("../utils/receipt");

function ensureCollectorCanAccess(customer, actor) {
  if (actor.role === "collector" && Number(customer.area_id) !== Number(actor.assigned_area_id)) {
    throw new ApiError(403, "Collector can collect payments only for the assigned area");
  }
}

async function markPaid(payload, actor) {
  return transaction(async (connection) => {
    const [[customer]] = await connection.execute(
      `SELECT c.*, a.name AS area_name, p.name AS plan_name
       FROM customers c
       JOIN areas a ON a.id = c.area_id
       JOIN plans p ON p.id = c.plan_id
       WHERE c.id = :customer_id AND c.deleted_at IS NULL
       FOR UPDATE`,
      { customer_id: payload.customer_id }
    );

    if (!customer) {
      throw new ApiError(404, "Customer not found");
    }
    ensureCollectorCanAccess(customer, actor);

    const requestedAmount = Number(payload.amount || 0);
    const amount = requestedAmount > 0 ? requestedAmount : Number(customer.due_amount || 0);
    if (amount <= 0) {
      throw new ApiError(422, "No pending due amount to collect");
    }

    const previousDue = Number(customer.due_amount || 0);
    const remainingDue = Math.max(previousDue - amount, 0);
    const receiptNo = buildReceiptNo(customer.id);
    const paymentDate = payload.payment_date || dayjs().format("YYYY-MM-DD HH:mm:ss");

    const [paymentResult] = await connection.execute(
      `INSERT INTO payments
        (receipt_no, customer_id, amount, method, payment_date, billing_month,
         collected_by, transaction_ref, note, previous_due, remaining_due)
       VALUES
        (:receipt_no, :customer_id, :amount, :method, :payment_date, :billing_month,
         :collected_by, :transaction_ref, :note, :previous_due, :remaining_due)`,
      {
        receipt_no: receiptNo,
        customer_id: customer.id,
        amount,
        method: payload.method || "cash",
        payment_date: paymentDate,
        billing_month: payload.billing_month || dayjs(paymentDate).format("YYYY-MM"),
        collected_by: actor.id,
        transaction_ref: payload.transaction_ref || null,
        note: payload.note || null,
        previous_due: previousDue,
        remaining_due: remainingDue
      }
    );

    await connection.execute(
      `UPDATE customers
       SET due_amount = :remaining_due, updated_by = :actor_id
       WHERE id = :customer_id`,
      {
        remaining_due: remainingDue,
        actor_id: actor.id,
        customer_id: customer.id
      }
    );

    await connection.execute(
      `INSERT INTO payment_history
        (payment_id, customer_id, action, amount, old_due, new_due, performed_by, meta)
       VALUES
        (:payment_id, :customer_id, 'mark_paid', :amount, :old_due, :new_due, :performed_by, :meta)`,
      {
        payment_id: paymentResult.insertId,
        customer_id: customer.id,
        amount,
        old_due: previousDue,
        new_due: remainingDue,
        performed_by: actor.id,
        meta: JSON.stringify({ method: payload.method || "cash", receipt_no: receiptNo })
      }
    );

    await connection.execute(
      `INSERT INTO notifications
        (customer_id, channel, type, message, status, sent_by)
       VALUES
        (:customer_id, 'whatsapp', 'payment_success', :message, 'queued', :sent_by)`,
      {
        customer_id: customer.id,
        message: `Payment received: Rs.${amount}. Receipt: ${receiptNo}. Balance due: Rs.${remainingDue}.`,
        sent_by: actor.id
      }
    );

    return findById(paymentResult.insertId);
  });
}

async function findById(id) {
  const rows = await query(
    `SELECT
       pay.*, c.customer_code, c.name AS customer_name, c.mobile,
       a.name AS area_name, u.name AS collected_by_name
     FROM payments pay
     JOIN customers c ON c.id = pay.customer_id
     JOIN areas a ON a.id = c.area_id
     LEFT JOIN users u ON u.id = pay.collected_by
     WHERE pay.id = :id
     LIMIT 1`,
    { id }
  );
  return rows[0] || null;
}

async function listByCustomer(customerId, actor) {
  const params = { customerId };
  const clauses = ["pay.customer_id = :customerId"];

  if (actor.role === "collector") {
    clauses.push("c.area_id = :areaId");
    params.areaId = actor.assigned_area_id || 0;
  }

  return query(
    `SELECT pay.*, u.name AS collected_by_name
     FROM payments pay
     JOIN customers c ON c.id = pay.customer_id
     LEFT JOIN users u ON u.id = pay.collected_by
     WHERE ${clauses.join(" AND ")}
     ORDER BY pay.payment_date DESC`,
    params
  );
}

async function recent(limit = 10, actor) {
  const params = { limit };
  const clauses = [];

  if (actor.role === "collector") {
    clauses.push("c.area_id = :areaId");
    params.areaId = actor.assigned_area_id || 0;
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return query(
    `SELECT
       pay.*, c.customer_code, c.name AS customer_name, a.name AS area_name,
       u.name AS collected_by_name
     FROM payments pay
     JOIN customers c ON c.id = pay.customer_id
     JOIN areas a ON a.id = c.area_id
     LEFT JOIN users u ON u.id = pay.collected_by
     ${where}
     ORDER BY pay.payment_date DESC
     LIMIT :limit`,
    params
  );
}

module.exports = {
  markPaid,
  findById,
  listByCustomer,
  recent
};
