const { query } = require("../config/db");

async function list(actor, filters = {}) {
  const params = {};
  const clauses = ["1 = 1"];

  if (actor.role === "collector") {
    clauses.push("c.area_id = :areaId");
    params.areaId = actor.assigned_area_id || 0;
  }
  if (filters.status) {
    clauses.push("n.status = :status");
    params.status = filters.status;
  }

  return query(
    `SELECT
       n.*, c.customer_code, c.name AS customer_name, c.mobile
     FROM notifications n
     JOIN customers c ON c.id = n.customer_id
     WHERE ${clauses.join(" AND ")}
     ORDER BY n.created_at DESC
     LIMIT 200`,
    params
  );
}

async function queuePendingReminders(actor, channel = "sms") {
  const params = { sentBy: actor.id };
  const clauses = ["c.deleted_at IS NULL", "c.status = 'active'", "c.due_amount > 0"];

  if (actor.role === "collector") {
    clauses.push("c.area_id = :areaId");
    params.areaId = actor.assigned_area_id || 0;
  }

  const customers = await query(
    `SELECT c.id, c.name, c.mobile, c.due_amount
     FROM customers c
     WHERE ${clauses.join(" AND ")}`,
    params
  );

  for (const customer of customers) {
    await query(
      `INSERT INTO notifications (customer_id, channel, type, message, status, sent_by)
       VALUES (:customer_id, :channel, 'due_reminder', :message, 'queued', :sent_by)`,
      {
        customer_id: customer.id,
        channel,
        message: `Dear ${customer.name}, your CablePro due amount is Rs.${customer.due_amount}. Please pay at the earliest.`,
        sent_by: actor.id
      }
    );
  }

  return { queued: customers.length, channel };
}

async function markSent(id, providerResponse = null) {
  await query(
    `UPDATE notifications
     SET status = 'sent', provider_response = :providerResponse, sent_at = NOW()
     WHERE id = :id`,
    { id, providerResponse }
  );
}

module.exports = {
  list,
  queuePendingReminders,
  markSent
};
