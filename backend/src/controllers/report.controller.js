const dayjs = require("dayjs");
const Report = require("../models/report.model");
const { rowsToWorkbookBuffer, rowsToPdfBuffer } = require("../services/export.service");
const ApiError = require("../utils/ApiError");

async function daily(req, res) {
  const date = req.query.date || dayjs().format("YYYY-MM-DD");
  res.json({ data: await Report.daily(date, req.user) });
}

async function monthly(req, res) {
  const month = req.query.month || dayjs().format("YYYY-MM");
  res.json({ data: await Report.monthly(month, req.user) });
}

async function pendingDues(req, res) {
  res.json({ data: await Report.pendingDues(req.query, req.user) });
}

async function exportReport(req, res) {
  const type = req.query.type || "dues";
  const format = req.query.format || "xlsx";
  let rows;

  if (type === "daily") {
    rows = await Report.daily(req.query.date || dayjs().format("YYYY-MM-DD"), req.user);
  } else if (type === "monthly") {
    rows = await Report.monthly(req.query.month || dayjs().format("YYYY-MM"), req.user);
  } else if (type === "dues") {
    rows = await Report.pendingDues(req.query, req.user);
  } else {
    throw new ApiError(422, "Unsupported report type");
  }

  if (format === "pdf") {
    const buffer = await rowsToPdfBuffer(`CablePro ${type} report`, rows);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="cablepro-${type}.pdf"`);
    return res.send(buffer);
  }

  const buffer = await rowsToWorkbookBuffer(type, rows);
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="cablepro-${type}.xlsx"`);
  return res.send(buffer);
}

module.exports = {
  daily,
  monthly,
  pendingDues,
  exportReport
};
