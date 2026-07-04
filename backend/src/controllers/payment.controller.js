const Payment = require("../models/payment.model");
const { paymentReceiptBuffer } = require("../services/receipt.service");
const ApiError = require("../utils/ApiError");

async function markPaid(req, res) {
  if (!req.body.customer_id) {
    throw new ApiError(422, "customer_id is required");
  }
  const payment = await Payment.markPaid(req.body, req.user);
  res.status(201).json({ data: payment });
}

async function listByCustomer(req, res) {
  const payments = await Payment.listByCustomer(req.params.customerId, req.user);
  res.json({ data: payments });
}

async function recent(req, res) {
  const payments = await Payment.recent(Number(req.query.limit || 10), req.user);
  res.json({ data: payments });
}

async function receiptPdf(req, res) {
  const payment = await Payment.findById(req.params.paymentId);
  if (!payment) {
    throw new ApiError(404, "Payment not found");
  }

  const buffer = await paymentReceiptBuffer(payment);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${payment.receipt_no}.pdf"`);
  res.send(buffer);
}

module.exports = {
  markPaid,
  listByCustomer,
  recent,
  receiptPdf
};
