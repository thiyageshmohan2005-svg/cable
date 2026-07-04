const QRCode = require("qrcode");
const env = require("../config/env");
const Customer = require("../models/customer.model");
const { importCustomers } = require("../services/customerImport.service");
const ApiError = require("../utils/ApiError");

async function list(req, res) {
  const customers = await Customer.list(req.query, req.areaScope);
  res.json(customers);
}

async function show(req, res) {
  const customer = await Customer.findById(req.params.id, req.areaScope);
  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }
  res.json({ data: customer });
}

async function create(req, res) {
  const required = ["name", "mobile", "address", "area_id", "plan_id"];
  const missing = required.filter((key) => !req.body[key]);
  if (missing.length) {
    throw new ApiError(422, `Missing fields: ${missing.join(", ")}`);
  }

  const customer = await Customer.create(req.body, req.user.id);
  res.status(201).json({ data: customer });
}

async function update(req, res) {
  const customer = await Customer.update(req.params.id, req.body, req.user.id);
  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }
  res.json({ data: customer });
}

async function remove(req, res) {
  await Customer.remove(req.params.id, req.user.id);
  res.status(204).send();
}

async function qr(req, res) {
  const customer = await Customer.findById(req.params.id, req.areaScope);
  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }
  const dataUrl = await QRCode.toDataURL(`${env.appUrl}/customers/${customer.customer_code}`);
  res.json({ data: { customer_id: customer.id, customer_code: customer.customer_code, qr: dataUrl } });
}

async function importExcel(req, res) {
  if (!req.file) {
    throw new ApiError(422, "Excel file is required");
  }
  const result = await importCustomers(req.file.buffer, req.user.id);
  res.status(201).json({ data: result });
}

module.exports = {
  list,
  show,
  create,
  update,
  remove,
  qr,
  importExcel
};
