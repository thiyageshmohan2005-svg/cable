const Notification = require("../models/notification.model");

async function list(req, res) {
  res.json({ data: await Notification.list(req.user, req.query) });
}

async function smsReminders(req, res) {
  res.status(201).json({ data: await Notification.queuePendingReminders(req.user, "sms") });
}

async function whatsappAlerts(req, res) {
  res.status(201).json({ data: await Notification.queuePendingReminders(req.user, "whatsapp") });
}

module.exports = {
  list,
  smsReminders,
  whatsappAlerts
};
