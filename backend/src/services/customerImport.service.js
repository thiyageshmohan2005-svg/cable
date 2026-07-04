const xlsx = require("xlsx");
const Area = require("../models/area.model");
const Plan = require("../models/plan.model");
const Customer = require("../models/customer.model");

function readSheet(buffer) {
  const workbook = xlsx.read(buffer, { type: "buffer", cellDates: true });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  return xlsx.utils.sheet_to_json(firstSheet, { defval: "" });
}

function normalize(row) {
  const lower = {};
  for (const [key, value] of Object.entries(row)) {
    lower[String(key).trim().toLowerCase().replace(/\s+/g, "_")] = value;
  }
  return lower;
}

async function importCustomers(buffer, actorId) {
  const rows = readSheet(buffer);
  const result = {
    total: rows.length,
    imported: 0,
    failed: []
  };

  for (let index = 0; index < rows.length; index += 1) {
    const row = normalize(rows[index]);
    try {
      if (!row.name || !row.mobile || !row.area || !row.plan) {
        throw new Error("name, mobile, area and plan are required");
      }

      const area = await Area.findOrCreateByName(String(row.area).trim());
      const plan = await Plan.findOrCreateByName(String(row.plan).trim(), Number(row.monthly_due || 0));

      await Customer.create(
        {
          name: String(row.name).trim(),
          mobile: String(row.mobile).trim(),
          address: String(row.address || "").trim(),
          area_id: area.id,
          box_number: row.box_number ? String(row.box_number).trim() : null,
          plan_id: plan.id,
          install_date: row.install_date || null,
          monthly_due: row.monthly_due ? Number(row.monthly_due) : undefined,
          due_amount: row.due_amount ? Number(row.due_amount) : 0,
          status: row.status || "active"
        },
        actorId
      );
      result.imported += 1;
    } catch (error) {
      result.failed.push({ row: index + 2, reason: error.message });
    }
  }

  return result;
}

module.exports = {
  importCustomers
};
